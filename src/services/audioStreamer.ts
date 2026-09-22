import { base64ToFloat32Array } from './audioUtils';

export class AudioStreamer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onStateChange?: (isPlaying: boolean) => void;
  private isMuted: boolean = false;
  private checkInterval: any = null;

  constructor(onStateChange?: (isPlaying: boolean) => void) {
    this.onStateChange = onStateChange;
  }

  public async init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      try {
        // 24000 Hz matching Gemini Live output
        this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      } catch {
        // Fallback to hardware sample rate on mobile devices
        this.audioCtx = new AudioCtxClass();
      }
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : 1;

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  public playChunk(base64Chunk: string) {
    if (!this.audioCtx || !this.gainNode) {
      this.init().then(() => this.playChunk(base64Chunk));
      return;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const float32Data = base64ToFloat32Array(base64Chunk);
    if (float32Data.length === 0) return;

    const audioBuffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    const currentTime = this.audioCtx.currentTime;
    // Schedule gaplessly: if nextStartTime fell behind, add a 60ms jitter buffer for smooth playback
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.06;
    }
    source.start(this.nextStartTime);
    this.activeSources.push(source);
    this.nextStartTime += audioBuffer.duration;

    this.onStateChange?.(true);

    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
      if (this.activeSources.length === 0) {
        this.onStateChange?.(false);
      }
    };

    // Periodic safety check in case sources finish
    this.ensurePlaybackTracking();
  }

  private ensurePlaybackTracking() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      if (!this.audioCtx) return;
      if (this.activeSources.length === 0 && this.audioCtx.currentTime >= this.nextStartTime) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
        this.onStateChange?.(false);
      }
    }, 100);
  }

  public stopAndClear() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source might have already ended
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.onStateChange?.(false);
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getVolumeRMS(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += (data[i] / 255) * (data[i] / 255);
    }
    return Math.sqrt(sum / data.length);
  }

  public destroy() {
    this.stopAndClear();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
