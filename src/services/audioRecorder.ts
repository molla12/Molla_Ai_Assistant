import { floatTo16BitPCM, arrayBufferToBase64, resampleAudio } from './audioUtils';

export class AudioRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private silentSink: GainNode | null = null;
  private isMuted: boolean = false;
  private isHardwarePaused: boolean = false;
  private onAudioData: (base64Chunk: string) => void;

  constructor(onAudioData: (base64Chunk: string) => void) {
    this.onAudioData = onAudioData;
  }

  public async start(): Promise<void> {
    this.isHardwarePaused = false;
    this.isMuted = false;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      },
    });
    this.mediaStream = stream;

    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    try {
      // Try requested 16kHz for optimal input
      this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });
    } catch {
      // Fallback to hardware rate on mobile Android / iOS
      this.audioCtx = new AudioCtxClass();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const currentSampleRate = this.audioCtx.sampleRate;
    this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.7;

    // Buffer size 2048 provides ~128ms packets at 16kHz - optimal for Live API low latency
    this.processorNode = this.audioCtx.createScriptProcessor(2048, 1, 1);
    this.processorNode.onaudioprocess = (event) => {
      if (this.isMuted || this.isHardwarePaused) return;
      const inputChannelData = event.inputBuffer.getChannelData(0);
      let pcm16Data: Float32Array;
      if (currentSampleRate !== 16000) {
        pcm16Data = resampleAudio(inputChannelData, currentSampleRate, 16000);
      } else {
        pcm16Data = inputChannelData;
      }
      const pcmBuffer = floatTo16BitPCM(pcm16Data);
      const base64 = arrayBufferToBase64(pcmBuffer);
      this.onAudioData(base64);
    };

    this.sourceNode.connect(this.analyser);
    this.analyser.connect(this.processorNode);

    // Connect to destination through a zero-gain node to keep processor active without mic feedback
    this.silentSink = this.audioCtx.createGain();
    this.silentSink.gain.value = 0;
    this.processorNode.connect(this.silentSink);
    this.silentSink.connect(this.audioCtx.destination);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public isPaused(): boolean {
    return this.isHardwarePaused;
  }

  /**
   * Completely stops and releases the OS hardware microphone tracks
   * so mobile keyboard voice typing (Gboard, Samsung Keyboard, iOS Dictation)
   * can freely acquire the microphone without "Microphone in use" conflict.
   */
  public pauseHardware(): void {
    this.isHardwarePaused = true;
    this.isMuted = true;

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop(); // Frees Android / iOS AudioRecord hardware lock
        });
      } catch (err) {
        console.warn('[AudioRecorder] Error stopping media tracks:', err);
      }
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.suspend().catch(() => {});
      } catch {}
    }
  }

  /**
   * Seamlessly re-acquires the hardware microphone and reconnects
   * to the existing audio pipeline once keyboard typing/voice typing is done.
   */
  public async resumeHardware(): Promise<void> {
    if (!this.isHardwarePaused && this.mediaStream) {
      this.isMuted = false;
      return;
    }

    this.isHardwarePaused = false;
    this.isMuted = false;

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      this.mediaStream = stream;

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
      if (this.analyser) {
        this.sourceNode.connect(this.analyser);
      }
    } catch (err) {
      console.warn('[AudioRecorder] Failed to reacquire microphone on resume:', err);
    }
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

  public stop(): void {
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.silentSink) {
      try {
        this.silentSink.disconnect();
      } catch {}
      this.silentSink = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
