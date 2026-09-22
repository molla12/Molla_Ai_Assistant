import { base64ChunksToWavBlob } from './audioUtils';
import { getStoredGeminiApiKey } from '../components/maya/mayaStorage';
import { getLanguageDetails } from '../lib/languageMap';

export interface VoicePlaybackState {
  activeMessageId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

type Listener = (state: VoicePlaybackState) => void;

class VoicePlayerService {
  private audio: HTMLAudioElement | null = null;
  private activeMessageId: string | null = null;
  private isPlaying: boolean = false;
  private isLoading: boolean = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration || 0;
        this.notify();
      }
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this.notify();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[VoicePlayer] Audio element error:', e);
      this.isPlaying = false;
      this.isLoading = false;
      this.notify();
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): VoicePlaybackState {
    return {
      activeMessageId: this.activeMessageId,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      isLoading: this.isLoading,
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('[VoicePlayer] Listener error:', err);
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.isLoading = false;
    this.activeMessageId = null;
    this.notify();
  }

  public async togglePlay(
    messageId: string,
    text: string,
    existingAudioUrl?: string,
    voice: string = 'Aoede',
    language?: string
  ): Promise<string | undefined> {
    // 1. If currently playing this exact message -> PAUSE
    if (this.activeMessageId === messageId) {
      if (this.isPlaying) {
        if (this.audio) {
          this.audio.pause();
          return existingAudioUrl;
        }
      } else {
        // Resume paused audio
        if (this.audio && this.audio.src) {
          try {
            await this.audio.play();
            return existingAudioUrl;
          } catch (e) {
            console.warn('[VoicePlayer] Resume error:', e);
          }
        }
      }
    }

    // 2. Stop any existing playback first
    this.stop();
    this.activeMessageId = messageId;
    this.isLoading = true;
    this.notify();

    const resolvedLang =
      language ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('user_selected_language') || 'en'
        : 'en');

    // 3. If audio URL is already recorded/available, play directly
    if (existingAudioUrl) {
      if (this.audio) {
        try {
          this.audio.src = existingAudioUrl;
          this.isLoading = false;
          await this.audio.play();
          return existingAudioUrl;
        } catch (err) {
          console.warn('[VoicePlayer] Direct audio play error:', err);
        }
      }
    }

    // 4. If no cached audio URL, request high-quality Gemini TTS voice audio from server
    let generatedAudioUrl: string | undefined = undefined;
    const storedKey = getStoredGeminiApiKey();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {}),
        },
        body: JSON.stringify({
          text,
          voice,
          lang: resolvedLang,
          language: resolvedLang,
          apiKey: storedKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error === 'MISSING_API_KEY') {
          console.warn('[VoicePlayer] Missing API key for Gemini TTS, using tuned browser voice');
          this.playBrowserSpeech(messageId, text, resolvedLang, voice);
          return undefined;
        }

        if (data.audio) {
          const wavBlob = base64ChunksToWavBlob([data.audio], 24000);
          generatedAudioUrl = URL.createObjectURL(wavBlob);
          if (this.audio && this.activeMessageId === messageId) {
            this.audio.src = generatedAudioUrl;
            this.isLoading = false;
            await this.audio.play();
            return generatedAudioUrl;
          }
        } else {
          this.playBrowserSpeech(messageId, text, resolvedLang, voice);
          return undefined;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn('[VoicePlayer] TTS generation notice, fallback to browser voice:', errData);
        this.playBrowserSpeech(messageId, text, resolvedLang, voice);
        return undefined;
      }
    } catch (apiErr) {
      console.warn('[VoicePlayer] API TTS fetch error, fallback to browser voice:', apiErr);
      this.playBrowserSpeech(messageId, text, resolvedLang, voice);
      return undefined;
    }

    this.isLoading = false;
    this.isPlaying = false;
    this.activeMessageId = null;
    this.notify();
    return generatedAudioUrl;
  }

  // Browser SpeechSynthesis fallback when Cloud TTS limits are hit
  private playBrowserSpeech(
    messageId: string,
    text: string,
    language: string = 'en',
    voice: string = 'Aoede'
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isPlaying = false;
      this.activeMessageId = null;
      this.notify();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const langDetail = getLanguageDetails(language);
      const cleanText = text
        .replace(/[*_~`#>\-[\]()]/g, ' ')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        this.isPlaying = false;
        this.activeMessageId = null;
        this.notify();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = langDetail.locale;
      const isMale = voice === 'Fenrir' || voice === 'Puck';
      utterance.rate = 1.0;
      utterance.pitch = isMale ? 0.9 : 1.05;

      // Select natural voice matching the language
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = voices.find(
        (v) =>
          v.lang &&
          v.lang.toLowerCase().replace('_', '-').startsWith(langDetail.locale.toLowerCase())
      );
      if (!matchedVoice) {
        matchedVoice = voices.find(
          (v) => v.lang && v.lang.toLowerCase().startsWith(langDetail.code.toLowerCase())
        );
      }
      if (!matchedVoice && (langDetail.code === 'bn' || langDetail.locale.startsWith('bn'))) {
        matchedVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes('bangla') ||
            v.name.toLowerCase().includes('bengali')
        );
      }
      if (!matchedVoice && (langDetail.code === 'hi' || langDetail.locale.startsWith('hi'))) {
        matchedVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes('hindi') ||
            v.name.toLowerCase().includes('lekha')
        );
      }
      if (!matchedVoice) {
        matchedVoice = voices.find((v) =>
          v.name.toLowerCase().includes(langDetail.name.toLowerCase())
        );
      }
      if (!matchedVoice) {
        matchedVoice = voices[0];
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        this.isLoading = false;
        this.activeMessageId = messageId;
        this.notify();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.activeMessageId = null;
        this.notify();
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        this.activeMessageId = null;
        this.notify();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[VoicePlayer] Browser speech error:', err);
      this.isPlaying = false;
      this.activeMessageId = null;
      this.notify();
    }
  }
}

export const voicePlayer = new VoicePlayerService();
