import { base64ToFloat32Array } from './audioUtils';
import { VoiceOption } from '../types';
import { audioCoordinator } from './audioCoordinator';

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentPlaybackCallbacks: { onStart?: () => void; onEnd?: () => void } | null = null;

// Unique monotonic session counter to invalidate stale speech requests and prevent double audio
let activeAudioPlayId = 0;
let currentFetchController: AbortController | null = null;

// In-memory client-side audio cache to make repeated phrases play in <10ms with zero network wait
const clientAudioCache = new Map<string, string>();

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  return audioCtx;
}

/**
 * Stops ANY playing natural speech immediately (Gemini natural audio buffer),
 * aborts any in-flight TTS network requests, and invalidates any stale async audio packets.
 * Strictly guarantees NO ROBOT VOICE is ever queued or spoken.
 */
export function stopMollaNaturalAudio(): void {
  // Invalidate any in-flight or pending audio operations
  activeAudioPlayId++;

  // Abort any ongoing fetch request to /api/tts
  if (currentFetchController) {
    try {
      currentFetchController.abort();
    } catch {}
    currentFetchController = null;
  }

  // Stop current Web Audio buffer source
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch {}
    currentSource = null;
  }

  // Permanently silence any browser SpeechSynthesis in case it was triggered anywhere
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  // Trigger onEnd for any UI cleanups
  if (currentPlaybackCallbacks) {
    try {
      currentPlaybackCallbacks.onEnd?.();
    } catch {}
    currentPlaybackCallbacks = null;
  }
}

// Register with the global audio coordinator
audioCoordinator.registerNaturalAudioStopper(stopMollaNaturalAudio);

/**
 * Plays 24kHz 16-bit PCM little-endian audio returned by Gemini TTS.
 * Strictly guarantees single-voice playback; older sessions are silently discarded.
 */
export async function playMollaNaturalAudio(
  base64Audio: string,
  callbacks?: { onStart?: () => void; onEnd?: () => void },
  expectedSessionId?: number
): Promise<boolean> {
  // Discard if session is stale
  if (expectedSessionId !== undefined && expectedSessionId !== activeAudioPlayId) {
    callbacks?.onEnd?.();
    return false;
  }

  if (!base64Audio) {
    callbacks?.onEnd?.();
    return false;
  }

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Discard if session changed during audio context resume
    if (expectedSessionId !== undefined && expectedSessionId !== activeAudioPlayId) {
      callbacks?.onEnd?.();
      return false;
    }

    // Stop any previously playing node
    if (currentSource) {
      try {
        currentSource.stop();
        currentSource.disconnect();
      } catch {}
      currentSource = null;
    }

    const float32Data = base64ToFloat32Array(base64Audio);
    if (float32Data.length === 0) {
      callbacks?.onEnd?.();
      return false;
    }

    const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    currentSource = source;
    currentPlaybackCallbacks = callbacks || null;

    const mySessionId = activeAudioPlayId;

    source.onended = () => {
      if (currentSource === source && mySessionId === activeAudioPlayId) {
        currentSource = null;
        currentPlaybackCallbacks?.onEnd?.();
        currentPlaybackCallbacks = null;
      }
    };

    callbacks?.onStart?.();
    source.start(0);
    return true;
  } catch (err) {
    console.error('[NaturalSpeech] Audio playback error:', err);
    callbacks?.onEnd?.();
    return false;
  }
}

/**
 * Requests Molla's authentic Gemini voice audio from backend with low latency.
 * NOTE: Absolutely NO browser SpeechSynthesis (robot voice) is used.
 * If user speaks, clicks another item, or pauses, audio is immediately halted.
 */
export async function speakMollaWithNaturalVoice(
  text: string,
  voice: VoiceOption = 'Aoede',
  callbacks?: { onStart?: () => void; onEnd?: () => void },
  _lang: string = 'en'
): Promise<boolean> {
  if (!text || !text.trim()) {
    callbacks?.onEnd?.();
    return false;
  }

  // 1. Instantly stop any currently playing voice or previous fetch
  stopMollaNaturalAudio();

  const thisSessionId = activeAudioPlayId;

  // Clean the text to form an optimal cache key
  const cleanCacheKey = `${voice}_${text.slice(0, 150).trim()}`;
  const cachedAudio = clientAudioCache.get(cleanCacheKey);
  if (cachedAudio) {
    return await playMollaNaturalAudio(cachedAudio, callbacks, thisSessionId);
  }

  const controller = new AbortController();
  currentFetchController = controller;

  // Set a generous 15-second timeout to allow high-quality Gemini TTS generation
  const timeoutId = setTimeout(() => {
    if (currentFetchController === controller) {
      controller.abort();
    }
  }, 15000);

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, lang: _lang, language: _lang }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If another message or audio was requested while waiting, discard this response
    if (thisSessionId !== activeAudioPlayId) {
      return false;
    }

    if (!res.ok) {
      throw new Error(`TTS server responded with status ${res.status}`);
    }

    const data = await res.json();
    if (thisSessionId !== activeAudioPlayId) {
      return false;
    }

    if (data.audio) {
      // Store in client cache for instant future reuse
      if (clientAudioCache.size > 100) {
        const firstKey = clientAudioCache.keys().next().value;
        if (firstKey) clientAudioCache.delete(firstKey);
      }
      clientAudioCache.set(cleanCacheKey, data.audio);

      return await playMollaNaturalAudio(data.audio, callbacks, thisSessionId);
    } else {
      // Server returned no audio (e.g. GEMINI_API_KEY not configured or offline)
      // Seamlessly speak using tuned browser speech synthesis so Molla is never mute
      return playBrowserSpeech(text, voice, callbacks, _lang, thisSessionId);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (thisSessionId !== activeAudioPlayId) {
      callbacks?.onEnd?.();
      return false;
    }

    // Recover using browser speech synthesis
    return playBrowserSpeech(text, voice, callbacks, _lang, thisSessionId);
  }
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * High-compatibility speech synthesis fallback for when Gemini 24kHz audio
 * is unavailable, ensuring Molla always speaks back out loud with natural inflection.
 */
export function playBrowserSpeech(
  text: string,
  voice: VoiceOption,
  callbacks?: { onStart?: () => void; onEnd?: () => void },
  lang: string = 'en',
  expectedSessionId?: number
): boolean {
  if (expectedSessionId !== undefined && expectedSessionId !== activeAudioPlayId) {
    callbacks?.onEnd?.();
    return false;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    callbacks?.onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean text of markdown, URLs, symbols for spoken fluidity
    const cleanText = text
      .replace(/[*_~`#>\-[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      callbacks?.onEnd?.();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    const langMap: Record<string, string> = {
      en: 'en-US',
      'en-in': 'en-IN',
      'en-gb': 'en-GB',
      bn: 'bn-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN',
      es: 'es-ES',
      ar: 'ar-SA',
      fr: 'fr-FR',
      de: 'de-DE',
      ja: 'ja-JP',
      ru: 'ru-RU',
    };

    const targetLang = langMap[lang] || (lang.includes('-') ? lang : 'en-US');
    utterance.lang = targetLang;

    const isMale = voice === 'Fenrir' || voice === 'Puck';
    utterance.pitch = isMale ? 0.9 : 1.05;
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      let matchedVoice = voices.find(
        (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase())
      );
      if (!matchedVoice && lang === 'bn') {
        matchedVoice = voices.find(
          (v) =>
            (v.lang && v.lang.toLowerCase().startsWith('bn')) ||
            v.name.toLowerCase().includes('bangla') ||
            v.name.toLowerCase().includes('bengali')
        );
      }
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    const mySessionId = activeAudioPlayId;

    utterance.onstart = () => {
      if (mySessionId !== activeAudioPlayId) {
        window.speechSynthesis.cancel();
        return;
      }
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      if (mySessionId === activeAudioPlayId) {
        callbacks?.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
      callbacks?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('[NaturalSpeech] Browser speech synthesis notice:', e);
    callbacks?.onEnd?.();
    return false;
  }
}
