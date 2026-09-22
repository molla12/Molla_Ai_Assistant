import { ConnectionState, AuraMood, ToolCallData, VoiceOption, TranscriptItem, LanguageCode } from '../types';
import { AudioStreamer } from './audioStreamer';
import { AudioRecorder } from './audioRecorder';
import { base64ChunksToWavBlob } from './audioUtils';
import { getStoredGeminiApiKey, loadMemories, loadAssistantConfig } from '../components/maya/mayaStorage';

export interface LiveSessionCallbacks {
  onStateChange: (state: ConnectionState) => void;
  onError: (error: string) => void;
  onToolCall: (data: ToolCallData) => void;
  onAuraChange: (mood: AuraMood) => void;
  onTranscript?: (item: TranscriptItem) => void;
  onTurnComplete?: () => void;
}

export class LiveSession {
  private ws: WebSocket | null = null;
  private streamer: AudioStreamer | null = null;
  private recorder: AudioRecorder | null = null;
  private state: ConnectionState = 'disconnected';
  private callbacks: LiveSessionCallbacks;
  private isMuted: boolean = false;
  private isSpeaking: boolean = false;
  private isSpeakingCooldown: boolean = false;
  private speakingCooldownTimeout: any = null;
  private currentVoice: VoiceOption = 'Aoede';
  private currentLang: LanguageCode = 'en';
  private isPlaybackPaused: boolean = false;
  private localSpeechRecognizer: any = null;
  private heartbeatTimer: any = null;
  private isIntentionalDisconnect: boolean = false;

  // Molla turn tracking
  private currentMollaTurnChunks: string[] = [];
  private currentMollaMessageId: string | null = null;
  private currentMollaAccumulatedText: string = '';

  // User turn tracking
  private currentUserTurnChunks: string[] = [];
  private currentUserMessageId: string | null = null;
  private currentUserAccumulatedText: string = '';

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  private setState(newState: ConnectionState) {
    if (this.state === newState) return;
    this.state = newState;
    this.callbacks.onStateChange(newState);
  }

  public async start(voice: VoiceOption = 'Aoede', lang: LanguageCode = 'bn', startPaused: boolean = false): Promise<void> {
    if (this.state !== 'disconnected') {
      return;
    }
    this.isIntentionalDisconnect = false;
    this.currentVoice = voice;
    this.currentLang = lang;
    this.isPlaybackPaused = startPaused;

    try {
      this.setState('connecting');

      // Initialize audio streamer for 24kHz playback
      this.streamer = new AudioStreamer((speaking) => {
        this.isSpeaking = speaking;
        if (speaking) {
          this.isSpeakingCooldown = true;
          // Abort local speech recognizer so it never picks up Molla's voice from phone speaker
          try {
            this.localSpeechRecognizer?.abort();
            this.localSpeechRecognizer = null;
          } catch {}
          if (this.speakingCooldownTimeout) {
            clearTimeout(this.speakingCooldownTimeout);
            this.speakingCooldownTimeout = null;
          }
        } else {
          // Acoustic echo cooldown: prevent phone speaker room echo from immediately triggering interruption
          if (this.speakingCooldownTimeout) {
            clearTimeout(this.speakingCooldownTimeout);
          }
          this.speakingCooldownTimeout = setTimeout(() => {
            this.isSpeakingCooldown = false;
            this.speakingCooldownTimeout = null;
            // Restart local recognition for instant user speech feedback
            if (!this.isPlaybackPaused && this.state === 'listening' && !this.localSpeechRecognizer) {
              this.initLocalSpeechRecognition(this.currentLang);
            }
          }, 350);
        }

        if (this.state !== 'connecting' && this.state !== 'disconnected' && !this.isPlaybackPaused) {
          this.setState(speaking ? 'speaking' : 'listening');
        }
      });
      await this.streamer.init();

      // Determine websocket protocol and url with voice and language parameters
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const storedKey = getStoredGeminiApiKey();
      const keyParam = storedKey ? `&apiKey=${encodeURIComponent(storedKey)}` : '';
      const memories = loadMemories();
      const memoriesParam = memories && memories.length > 0 ? `&memories=${encodeURIComponent(JSON.stringify(memories))}` : '';
      const assistantCfg = loadAssistantConfig();
      const effectiveLang = assistantCfg.language || lang || 'bn';
      const gfParam = assistantCfg.girlfriendMode
        ? `&girlfriendMode=true&petName=${encodeURIComponent(assistantCfg.petName || 'Sweetheart')}&romanticStyle=${encodeURIComponent(assistantCfg.romanticStyle || 'Sweet & Caring')}`
        : '';
      const wsUrl = `${protocol}//${window.location.host}/live?voice=${encodeURIComponent(voice)}&lang=${encodeURIComponent(effectiveLang)}${keyParam}${memoriesParam}${gfParam}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log(`[Molla Live] WebSocket connected to server (voice: ${voice}, lang: ${lang})`);

        // Start 20s heartbeat ping to keep connection alive through reverse proxies and Cloud Run
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            } catch {}
          }
        }, 20000);

        try {
          // Initialize recorder and stream mic chunks
          this.recorder = new AudioRecorder((base64Audio) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              // Acoustic protection: do not send mic data when Molla is speaking, in echo cooldown, or playback/typing is paused
              if (this.isSpeaking || this.isSpeakingCooldown || this.isPlaybackPaused) {
                return;
              }
              // Buffer user audio so the user's voice message can be played back with their own real voice!
              this.currentUserTurnChunks.push(base64Audio);
              if (this.currentUserTurnChunks.length > 300) {
                this.currentUserTurnChunks.shift();
              }
              this.ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
            }
          });

          // If user is currently typing, keyboard voice typing, or input is focused:
          // Immediately keep hardware mic released so keyboard speech-to-text works cleanly!
          if (this.isPlaybackPaused) {
            console.log('[Molla Live] Call connected while user is typing/voice typing - keeping app mic paused for keyboard');
            this.recorder.pauseHardware();
            this.setState('paused');
          } else {
            await this.recorder.start();
            this.setState('listening');
            this.initLocalSpeechRecognition(lang);
          }
        } catch (micErr: any) {
          console.error('[Molla Live] Microphone error:', micErr);
          this.callbacks.onError('Microphone access denied. Please grant microphone permissions.');
          this.disconnect();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'pong') {
            return;
          }
          if (msg.type === 'audio' && msg.audio) {
            // User turn is finished as model starts responding
            this.finalizeCurrentUserTurn();

            this.streamer?.playChunk(msg.audio);
            this.currentMollaTurnChunks.push(msg.audio);
          } else if (msg.type === 'transcript') {
            if (msg.text && this.callbacks.onTranscript) {
              if (msg.sender === 'molla') {
                // Finalize any ongoing user turn
                this.finalizeCurrentUserTurn();

                if (!this.currentMollaMessageId) {
                  this.currentMollaMessageId = `live_molla_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
                  this.currentMollaAccumulatedText = '';
                }

                if (msg.isDelta) {
                  this.currentMollaAccumulatedText += msg.text;
                } else {
                  this.currentMollaAccumulatedText = msg.text;
                }

                this.callbacks.onTranscript({
                  id: this.currentMollaMessageId,
                  sender: 'molla',
                  text: this.currentMollaAccumulatedText,
                  timestamp: Date.now(),
                  isDelta: false,
                  isLiveTurn: true,
                  isVoice: true,
                });
              } else {
                // User transcript
                if (!this.currentUserMessageId) {
                  this.currentUserMessageId = `live_user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
                  this.currentUserAccumulatedText = '';
                }

                if (msg.isDelta) {
                  this.currentUserAccumulatedText += msg.text;
                } else {
                  this.currentUserAccumulatedText = msg.text;
                }

                this.callbacks.onTranscript({
                  id: this.currentUserMessageId,
                  sender: 'user',
                  text: this.currentUserAccumulatedText,
                  timestamp: Date.now(),
                  isDelta: false,
                  isLiveTurn: true,
                  isVoice: true,
                });
              }
            }
          } else if (msg.type === 'interrupted') {
            console.log('[Molla Live] Model interrupted');
            this.streamer?.stopAndClear();
            // Preserve accumulated text and turn audio so far
            if (this.currentMollaTurnChunks.length > 0 && this.currentMollaMessageId) {
              try {
                const wavBlob = base64ChunksToWavBlob(this.currentMollaTurnChunks, 24000);
                const audioUrl = URL.createObjectURL(wavBlob);
                this.callbacks.onTranscript?.({
                  id: this.currentMollaMessageId,
                  sender: 'molla',
                  text: this.currentMollaAccumulatedText,
                  timestamp: Date.now(),
                  audioUrl,
                  isVoice: true,
                });
              } catch {}
            }
            this.currentMollaTurnChunks = [];
            this.currentMollaMessageId = null;
            this.currentMollaAccumulatedText = '';
            this.setState('listening');
            this.callbacks.onTurnComplete?.();
          } else if (msg.type === 'turnComplete') {
            const finishedId = this.currentMollaMessageId;
            const finishedText = this.currentMollaAccumulatedText;
            if (this.currentMollaTurnChunks.length > 0 && finishedId) {
              try {
                const wavBlob = base64ChunksToWavBlob(this.currentMollaTurnChunks, 24000);
                const audioUrl = URL.createObjectURL(wavBlob);
                if (this.callbacks.onTranscript) {
                  this.callbacks.onTranscript({
                    id: finishedId,
                    sender: 'molla',
                    text: finishedText,
                    timestamp: Date.now(),
                    audioUrl,
                    isVoice: true,
                  });
                }
              } catch (wavErr) {
                console.warn('[Molla Live] Error generating wav blob for turn:', wavErr);
              }
            }
            this.currentMollaTurnChunks = [];
            this.currentMollaMessageId = null;
            this.currentMollaAccumulatedText = '';

            if (!this.isSpeaking) {
              this.setState('listening');
            }
            this.callbacks.onTurnComplete?.();
          } else if (msg.type === 'toolCall') {
            this.handleToolExecution(msg);
          } else if (msg.type === 'error') {
            console.error('[Molla Live] Server error:', msg.error);
            if (msg.code === 'MISSING_API_KEY' || (typeof msg.error === 'string' && msg.error.includes('GEMINI_API_KEY'))) {
              window.dispatchEvent(new CustomEvent('open-gemini-key-modal', { detail: { reason: 'missing_key' } }));
            }
            this.callbacks.onError(msg.error || 'Connection encountered an issue');
          }
        } catch (err) {
          console.error('[Molla Live] Error parsing message:', err);
        }
      };

      this.ws.onerror = (ev) => {
        if (this.isIntentionalDisconnect || this.state === 'disconnected') return;
        console.warn('[Molla Live] WebSocket connection status notice:', ev.type || 'notice');
      };

      this.ws.onclose = (ev) => {
        console.log(`[Molla Live] WebSocket closed (code: ${ev.code}, reason: ${ev.reason || 'clean'})`);
        if (this.heartbeatTimer) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = null;
        }
        if (this.isIntentionalDisconnect) {
          this.disconnect();
          return;
        }
        // Only show notification if session closed unexpectedly while active
        if (ev.code !== 1000 && ev.code !== 1005 && this.state !== 'disconnected') {
          this.callbacks.onError(ev.reason || 'Molla Live session ended. Tap the call button to reconnect.');
        }
        this.disconnect();
      };
    } catch (err: any) {
      console.error('[Molla Live] Connection error:', err);
      this.callbacks.onError(err?.message || 'Failed to start Live session.');
      this.disconnect();
    }
  }

  private handleToolExecution(msg: { tool: string; args: any; id: string }) {
    const { tool, args, id } = msg;
    const toolData: ToolCallData = {
      id: id || Date.now().toString(),
      name: tool,
      args: args || {},
      timestamp: Date.now(),
    };

    console.log(`[Molla Live] Executing browser action: ${tool}`, args);

    if (tool === 'openWebsite') {
      let targetUrl = args?.url || 'https://google.com';
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Window open restricted:', e);
      }
      toolData.result = { url: targetUrl, siteName: args?.name || targetUrl };
    } else if (tool === 'changeAtmosphere' || tool === 'setThemeAura') {
      const theme = (args?.theme || args?.mood) as AuraMood;
      if (theme) {
        this.callbacks.onAuraChange(theme);
        toolData.result = { theme };
      }
    } else if (tool === 'searchWeb') {
      const query = encodeURIComponent(args?.query || '');
      const searchUrl = `https://www.google.com/search?q=${query}`;
      try {
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Window open restricted:', e);
      }
      toolData.result = { query: args?.query, url: searchUrl };
    } else if (tool === 'getCurrentTime') {
      toolData.result = args;
    }

    this.callbacks.onToolCall(toolData);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.recorder?.setMuted(muted);
  }

  public setSpeakerMuted(muted: boolean) {
    this.streamer?.setMuted(muted);
  }

  public getFrequencyData(): Uint8Array {
    if (this.state === 'speaking' && this.streamer) {
      return this.streamer.getFrequencyData();
    }
    if (this.state === 'listening' && this.recorder) {
      return this.recorder.getFrequencyData();
    }
    return new Uint8Array(32);
  }

  public getVolumeRMS(): number {
    if (this.state === 'speaking' && this.streamer) {
      return this.streamer.getVolumeRMS();
    }
    if (this.state === 'listening' && this.recorder) {
      return this.recorder.getVolumeRMS();
    }
    return 0;
  }

  public sendTextMessage(text: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', text }));
      return true;
    }
    return false;
  }

  public sendVisualInput(base64Image: string, mimeType: string = 'image/jpeg', text?: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'visualInput',
        image: base64Image,
        mimeType,
        text: text || '',
      }));
      return true;
    }
    return false;
  }

  public sendVideoFrame(base64Image: string, mimeType: string = 'image/jpeg'): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'videoFrame',
        image: base64Image,
        mimeType,
      }));
      return true;
    }
    return false;
  }

  public interrupt() {
    this.streamer?.stopAndClear();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
    }
    this.setState('listening');
  }

  public pauseForPlayback(paused: boolean) {
    this.isPlaybackPaused = paused;
    if (paused) {
      this.streamer?.stopAndClear();
      // Completely release hardware microphone tracks so keyboard voice typing gets exclusive OS mic access
      this.recorder?.pauseHardware();
      try {
        if (this.localSpeechRecognizer) {
          this.localSpeechRecognizer.abort();
          this.localSpeechRecognizer = null;
        }
      } catch {}
      if (this.state === 'speaking' || this.state === 'listening') {
        this.setState('paused');
      }
    } else {
      if (this.state === 'paused') {
        setTimeout(async () => {
          if (this.isPlaybackPaused) return; // User is still typing
          try {
            if (this.recorder) {
              await this.recorder.resumeHardware();
            }
          } catch (err) {
            console.warn('[Molla Live] Error resuming hardware mic:', err);
          }

          if (!this.localSpeechRecognizer && !this.isPlaybackPaused) {
            this.initLocalSpeechRecognition(this.currentLang);
          }
          this.setState('listening');
        }, 300);
      }
    }
  }

  private finalizeCurrentUserTurn() {
    if (this.currentUserMessageId && this.currentUserAccumulatedText) {
      // Keep audioUrl undefined so clicking play on 2nd (user's spoken voice)
      // synthesizes in Molla's 1st natural voice (Aoede) just like 3rd and 4th!
      this.callbacks.onTranscript?.({
        id: this.currentUserMessageId,
        sender: 'user',
        text: this.currentUserAccumulatedText,
        timestamp: Date.now(),
        audioUrl: undefined,
        isVoice: true,
        isInterim: false,
      });
    }
    this.currentUserTurnChunks = [];
    this.currentUserMessageId = null;
    this.currentUserAccumulatedText = '';
  }

  private initLocalSpeechRecognition(lang: LanguageCode) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        // Drop any results if Molla is speaking, in echo cooldown, or playback is paused
        if (this.isSpeaking || this.isSpeakingCooldown || this.isPlaybackPaused) {
          return;
        }

        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalText += trans;
          } else {
            interimText += trans;
          }
        }

        const currentText = (finalText || interimText).trim();
        if (currentText) {
          if (!this.currentUserMessageId) {
            this.currentUserMessageId = `live_user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
          }
          this.currentUserAccumulatedText = currentText;

          // Instant real-time UI preview with ZERO lag!
          this.callbacks.onTranscript?.({
            id: this.currentUserMessageId,
            sender: 'user',
            text: currentText,
            timestamp: Date.now(),
            isDelta: false,
            isLiveTurn: true,
            isVoice: true,
            isInterim: !finalText,
          });
        }
      };

      recognition.onerror = () => {
        // Ignore background errors
      };

      recognition.onend = () => {
        if (
          (this.state === 'listening' || this.state === 'speaking') &&
          !this.isPlaybackPaused &&
          !this.isSpeaking &&
          !this.isSpeakingCooldown
        ) {
          try {
            recognition.start();
          } catch {}
        }
      };

      try {
        recognition.start();
        this.localSpeechRecognizer = recognition;
      } catch (startErr) {
        console.warn('[Molla Live] Local recognition start:', startErr);
      }
    } catch (e) {
      console.warn('[Molla Live] Local recognition init:', e);
    }
  }

  public disconnect(): void {
    this.isIntentionalDisconnect = true;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.localSpeechRecognizer) {
      try {
        this.localSpeechRecognizer.onend = null;
        this.localSpeechRecognizer.abort();
      } catch {}
      this.localSpeechRecognizer = null;
    }
    if (this.speakingCooldownTimeout) {
      clearTimeout(this.speakingCooldownTimeout);
      this.speakingCooldownTimeout = null;
    }
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    if (this.streamer) {
      this.streamer.destroy();
      this.streamer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }
}
