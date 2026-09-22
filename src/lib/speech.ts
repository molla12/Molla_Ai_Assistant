export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

class SpeechController {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;
  private currentAudioSource: AudioBufferSourceNode | null = null;

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const voices = this.synth.getVoices();
    // Return English or user's preferred voices, sorted with natural/friendly voices first
    return voices.filter((v) => v.lang.startsWith('en'));
  }

  public speakText(text: string, options: SpeechOptions = {}) {
    this.stop();

    if (!this.synth) {
      if (options.onError) options.onError('Speech synthesis not supported on this device.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.1; // Slightly higher/friendly pitch default for kids

    if (options.voiceURI) {
      const voices = this.getVoices();
      const match = voices.find((v) => v.voiceURI === options.voiceURI);
      if (match) utterance.voice = match;
    }

    if (options.onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          options.onBoundary!(event.charIndex, event.charLength || 5);
        }
      };
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (options.onError) options.onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public async speakWithGeminiTTS(audioBase64: string, onEnd?: () => void) {
    this.stop();
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx({ sampleRate: 24000 });
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const binaryStr = atob(audioBase64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert 16-bit PCM or WAV buffer to AudioBuffer
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.currentAudioSource = null;
        if (onEnd) onEnd();
      };

      this.currentAudioSource = source;
      source.start(0);
    } catch (err) {
      console.warn('Gemini TTS audio playback error, falling back to Web Speech', err);
      if (onEnd) onEnd();
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.currentAudioSource) {
      try {
        this.currentAudioSource.stop();
      } catch (e) {
        // ignore if already stopped
      }
      this.currentAudioSource = null;
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return (this.synth?.speaking ?? false) || this.currentAudioSource !== null;
  }
}

export const speechController = new SpeechController();
