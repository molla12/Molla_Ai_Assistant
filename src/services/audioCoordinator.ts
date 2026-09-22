export type AudioSourceType = 'idle' | 'news' | 'chat' | 'live' | 'sample';

export interface ActiveAudioState {
  source: AudioSourceType;
  id: string | null;
  isPlaying: boolean;
  title?: string;
}

type AudioListener = (state: ActiveAudioState) => void;

class AudioCoordinator {
  private state: ActiveAudioState = {
    source: 'idle',
    id: null,
    isPlaying: false,
  };

  private activeStopCallback: (() => void) | null = null;
  private listeners: Set<AudioListener> = new Set();
  private liveStreamStopper: (() => void) | null = null;
  private naturalAudioStopper: (() => void) | null = null;

  /**
   * Register a hook to stop Live session audio streamer when other audio plays
   */
  public registerLiveStreamStopper(stopper: (() => void) | null): void {
    this.liveStreamStopper = stopper;
  }

  /**
   * Register a hook to stop Gemini natural speech playback when other audio plays
   */
  public registerNaturalAudioStopper(stopper: (() => void) | null): void {
    this.naturalAudioStopper = stopper;
  }

  /**
   * Subscribe to global audio state updates (e.g., to sync UI play/pause buttons)
   */
  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const currentState = { ...this.state };
    for (const listener of this.listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.warn('[AudioCoordinator] Listener error:', err);
      }
    }
  }

  public getState(): ActiveAudioState {
    return { ...this.state };
  }

  public isPlaying(): boolean {
    return this.state.isPlaying;
  }

  public getSource(): AudioSourceType {
    return this.state.source;
  }

  public getPlayingId(): string | null {
    return this.state.id;
  }

  /**
   * Requests exclusive audio playback for a specific source (news, chat, sample, live, etc.).
   * Strictly terminates any existing playback across all components first:
   * - Stops active playback callback
   * - Stops natural audio (Gemini TTS buffer)
   * - Halts live stream audio if source is not live
   * - Cancels any accidental browser synthesis
   */
  public requestPlayback(
    source: AudioSourceType,
    id: string | null,
    title?: string,
    onStopCallback?: () => void
  ): void {
    // 1. Terminate previously active registered audio component
    if (this.activeStopCallback) {
      try {
        this.activeStopCallback();
      } catch {}
      this.activeStopCallback = null;
    }

    // 2. Stop Web Audio natural speech buffer if playing
    if (this.naturalAudioStopper) {
      try {
        this.naturalAudioStopper();
      } catch {}
    }

    // 3. Immediately silence any browser speech synthesis (robot voice)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 4. If live session was speaking and a non-live audio starts, stop live streamer
    if (source !== 'live' && this.liveStreamStopper) {
      try {
        this.liveStreamStopper();
      } catch {}
    }

    this.activeStopCallback = onStopCallback || null;
    this.state = {
      source,
      id,
      isPlaying: true,
      title,
    };
    this.notify();
  }

  /**
   * Marks playback complete for a specific source and ID
   */
  public playbackFinished(source: AudioSourceType, id?: string | null): void {
    if (this.state.source === source && (id === undefined || this.state.id === id)) {
      if (this.activeStopCallback) {
        try {
          this.activeStopCallback();
        } catch {}
        this.activeStopCallback = null;
      }
      this.state = {
        source: 'idle',
        id: null,
        isPlaying: false,
      };
      this.notify();
    }
  }

  /**
   * Immediately stops ALL ongoing audio across the entire application
   * (News reader, Chat TTS, Web Audio buffer, Live audio).
   * Guarantees absolute silence.
   */
  public stopAllAudio(): void {
    if (this.activeStopCallback) {
      try {
        this.activeStopCallback();
      } catch {}
      this.activeStopCallback = null;
    }

    if (this.naturalAudioStopper) {
      try {
        this.naturalAudioStopper();
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (this.liveStreamStopper) {
      try {
        this.liveStreamStopper();
      } catch {}
    }

    this.state = {
      source: 'idle',
      id: null,
      isPlaying: false,
    };
    this.notify();
  }
}

export const audioCoordinator = new AudioCoordinator();

