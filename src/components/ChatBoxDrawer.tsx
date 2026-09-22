import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  AtmosphereConfig,
  ConnectionState,
  TranscriptItem,
  ToolCallData,
  ChatSession,
  VoiceOption,
  LanguageCode,
} from '../types';
import {
  X,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Radio,
  Volume2,
  VolumeX,
  Zap,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  AlertTriangle,
  Mic,
  MicOff,
  ArrowDown,
  Download,
} from 'lucide-react';
import { speakMollaWithNaturalVoice, stopMollaNaturalAudio } from '../services/naturalSpeech';
import { audioCoordinator } from '../services/audioCoordinator';
import { LANGUAGES } from '../constants/auras';
import { VoiceGenderSlider } from './VoiceGenderSlider';

interface ChatBoxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aura: AtmosphereConfig;
  state: ConnectionState;
  transcripts: TranscriptItem[];
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllHistory: () => void;
  toolCalls?: ToolCallData[];
  onSendMessage: (text: string) => Promise<void> | void;
  isSending?: boolean;
  currentVoice: VoiceOption;
  onVoiceSelect?: (voice: VoiceOption) => void;
  currentLanguage?: LanguageCode;
  isSpeakingTts?: boolean;
}

const QUICK_SUGGESTIONS = [
  'Hey Molla, how are you doing today?',
  'Hey Molla, give me a charming compliment!',
  'What is the current time and date right now?',
  'Open YouTube for me',
  'Change atmosphere to Cyber Cyan',
  'Tell me a witty joke or story',
];

export const ChatBoxDrawer: React.FC<ChatBoxDrawerProps> = ({
  isOpen,
  onClose,
  aura,
  state,
  transcripts,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllHistory,
  toolCalls = [],
  onSendMessage,
  isSending = false,
  currentVoice,
  onVoiceSelect,
  currentLanguage = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [inputText, setInputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isListeningDictation, setIsListeningDictation] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  // Synchronize playing message state with global audio coordinator
  useEffect(() => {
    const unsub = audioCoordinator.subscribe((s) => {
      if (s.isPlaying && s.source === 'chat') {
        setPlayingMessageId(s.id);
      } else {
        setPlayingMessageId(null);
      }
    });
    return unsub;
  }, []);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto-resize textarea to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 44), 140)}px`;
    }
  }, [inputText]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 140;
    setShowScrollBottomBtn(isUp);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom('smooth');
    }
  }, [isOpen, activeTab, transcripts.length, isSending]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen, activeTab]);

  // Clean up speech recognition when drawer closes
  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListeningDictation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;
    // Immediately stop any currently playing voice before sending next message
    stopMollaNaturalAudio();
    setPlayingMessageId(null);
    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Toggle in-chat speech dictation
  const toggleSpeechDictation = () => {
    if (isListeningDictation) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListeningDictation(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      const langConfig = LANGUAGES.find((l) => l.code === currentLanguage);
      recognition.lang = langConfig?.speechRecLang || 'bn-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListeningDictation(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const spoken = (final || interim).trim();
        if (spoken) {
          setInputText((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + spoken;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[ChatDictation] Error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListeningDictation(false);
        }
      };

      recognition.onend = () => {
        setIsListeningDictation(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('[ChatDictation] Failed to start:', err);
      setIsListeningDictation(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullTranscript = transcripts
      .map(
        (t) =>
          `[${new Date(t.timestamp).toLocaleTimeString()}] ${
            t.sender === 'user' ? 'You' : 'Molla'
          }: ${t.text}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(fullTranscript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportTextFile = () => {
    const fullTranscript = transcripts
      .map(
        (t) =>
          `[${new Date(t.timestamp).toLocaleString()}] ${
            t.sender === 'user' ? 'You' : 'Molla'
          }:\n${t.text}\n`
      )
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([fullTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `molla-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePlayVoice = async (msgId: string, text: string) => {
    if (audioCoordinator.isPlaying() && audioCoordinator.getPlayingId() === msgId) {
      audioCoordinator.stopAllAudio();
      return;
    }

    // Stop any previously playing audio and claim exclusive playback
    audioCoordinator.requestPlayback('chat', msgId, text.slice(0, 30), () => {
      stopMollaNaturalAudio();
    });

    try {
      await speakMollaWithNaturalVoice(
        text,
        currentVoice,
        {
          onStart: () => {},
          onEnd: () => {
            audioCoordinator.playbackFinished('chat', msgId);
          },
        },
        currentLanguage
      );
    } catch {
      audioCoordinator.playbackFinished('chat', msgId);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${formatTime(timestamp)}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isConnected = state === 'listening' || state === 'speaking';
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-lg md:max-w-xl h-full bg-[#080c16] border-l border-white/10 text-white flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        style={{ borderLeftColor: aura.accentColor + '55' }}
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg relative"
              style={{
                backgroundColor: aura.accentColor + '20',
                borderColor: aura.accentColor + '50',
                boxShadow: `0 0 14px ${aura.glowColor}`,
              }}
            >
              <Bot className="w-5 h-5" style={{ color: aura.accentColor }} />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#080c16]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display tracking-tight text-white">
                  Molla Chat
                </h2>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: isConnected ? '#10b98125' : 'rgba(255,255,255,0.08)',
                    color: isConnected ? '#10b981' : '#94a3b8',
                    border: `1px solid ${isConnected ? '#10b98140' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {isConnected ? (state === 'speaking' ? 'Speaking' : 'Live Call') : 'Smart AI Chat'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[190px] sm:max-w-[240px]">
                {activeSession?.title || 'Current Conversation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New Chat Button */}
            <button
              id="new-chat-btn"
              onClick={() => {
                onNewSession();
                setActiveTab('chat');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 transition-colors"
              title="Start a New Conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Export conversation */}
            {activeTab === 'chat' && transcripts.length > 0 && (
              <>
                <button
                  id="chat-export-btn"
                  onClick={handleExportTextFile}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Export conversation to text file"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  id="chat-copy-all-btn"
                  onClick={handleCopyAll}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Copy Full Conversation"
                >
                  {copiedAll ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </>
            )}

            {/* Close Drawer Button */}
            <button
              id="close-chat-drawer-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: Active Chat vs History List */}
        <div className="px-4 py-2 border-b border-white/10 bg-black/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/10">
            <button
              id="tab-chat-messages"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-rose-500/80 to-pink-500/80 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Active Chat</span>
              {transcripts.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full">
                  {transcripts.length}
                </span>
              )}
            </button>

            <button
              id="tab-chat-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-rose-500/80 to-pink-500/80 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History List</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full">
                {sessions.length}
              </span>
            </button>
          </div>

          {activeTab === 'history' && (
            <button
              id="clear-all-history-btn"
              onClick={() => setShowClearConfirmModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Global Voice Sliding Switch inside Chat Box */}
        {activeTab === 'chat' && onVoiceSelect && (
          <div className="px-4 py-2 border-b border-white/5 bg-black/40">
            <VoiceGenderSlider
              currentVoice={currentVoice}
              onVoiceChange={onVoiceSelect}
              accentColor={aura.accentColor}
              currentLanguage={currentLanguage}
              compact
            />
          </div>
        )}

        {/* Live Audio Status Banner */}
        {isConnected && activeTab === 'chat' && (
          <div
            className="px-4 py-1.5 text-xs flex items-center justify-between border-b backdrop-blur-md shrink-0"
            style={{
              backgroundColor: aura.accentColor + '10',
              borderColor: aura.accentColor + '25',
              color: aura.accentColor,
            }}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-semibold font-mono tracking-wider text-[11px]">
                Live Voice Channel Connected
              </span>
            </div>
            {state === 'speaking' && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                Molla is speaking
              </span>
            )}
          </div>
        )}

        {/* TAB 1: ACTIVE CHAT MESSAGES */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Scrollable messages container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {transcripts.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
                  <div
                    className="w-14 h-14 rounded-3xl flex items-center justify-center border shadow-xl"
                    style={{
                      backgroundColor: aura.accentColor + '15',
                      borderColor: aura.accentColor + '30',
                      boxShadow: `0 0 20px ${aura.glowColor}`,
                    }}
                  >
                    <Sparkles className="w-7 h-7" style={{ color: aura.accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Start chatting with Molla</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Type below or use voice to speak with Molla. Molla replies with rich markdown and natural expressive voice!
                    </p>
                  </div>

                  {/* Quick suggestions */}
                  <div className="w-full max-w-sm pt-2 space-y-2 text-left">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
                      Quick Conversation Starters:
                    </p>
                    {QUICK_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(suggestion);
                          textareaRef.current?.focus();
                        }}
                        className="w-full p-2.5 rounded-xl text-xs text-slate-200 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all text-left flex items-center justify-between group"
                      >
                        <span>{suggestion}</span>
                        <span
                          className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: aura.accentColor }}
                        >
                          Use ↵
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {transcripts.map((msg, index) => {
                    const isUser = msg.sender === 'user';
                    const isPlaying = playingMessageId === msg.id;

                    return (
                      <div
                        key={msg.id ? `${msg.id}-${index}` : `chat-msg-${index}`}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-in fade-in duration-200`}
                      >
                        {/* Speaker & Timestamp meta */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                          {isUser ? (
                            <>
                              <span className="font-semibold text-slate-300">You</span>
                              <span>•</span>
                              <span>{formatTime(msg.timestamp)}</span>
                              <User className="w-3 h-3 text-slate-400 ml-0.5" />
                            </>
                          ) : (
                            <>
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm"
                                style={{
                                  backgroundColor: aura.accentColor + '30',
                                  color: aura.accentColor,
                                }}
                              >
                                M
                              </div>
                              <span className="font-semibold" style={{ color: aura.accentColor }}>
                                Molla
                              </span>
                              <span>•</span>
                              <span>{formatTime(msg.timestamp)}</span>
                              {msg.isInterim && (
                                <span className="text-[10px] text-amber-400 font-mono animate-pulse">
                                  (speaking...)
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* WhatsApp-Style Message Bubble with Advanced Markdown */}
                        <div
                          className={`relative max-w-[92%] sm:max-w-[85%] px-4 py-3 rounded-2xl transition-all shadow-md ${
                            isUser
                              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-sm'
                              : 'bg-[#121726] border border-white/10 text-slate-100 rounded-tl-sm'
                          }`}
                          style={
                            !isUser
                              ? {
                                  borderLeftColor: aura.accentColor + '80',
                                  borderLeftWidth: '3px',
                                  boxShadow: `0 4px 24px -2px rgba(0,0,0,0.6)`,
                                }
                              : undefined
                          }
                        >
                          {/* Rich Markdown Rendering */}
                          <div className="markdown-content text-xs sm:text-sm leading-relaxed select-text overflow-hidden">
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            ) : (
                              <Markdown
                                components={{
                                  code({ className, children, ...props }) {
                                    const codeContent = String(children || '').replace(/\n$/, '');
                                    const isInline = !className && !codeContent.includes('\n');
                                    const codeBlockId = `code_${msg.id}_${Math.random().toString(36).substring(2, 6)}`;
                                    const isCodeCopied = copiedCodeId === codeBlockId;

                                    if (isInline) {
                                      return (
                                        <code
                                          className="bg-black/50 text-rose-300 px-1.5 py-0.5 rounded text-[12px] font-mono border border-white/10"
                                          {...props}
                                        >
                                          {children}
                                        </code>
                                      );
                                    }

                                    return (
                                      <div className="relative my-2.5 rounded-xl bg-[#080b12] border border-white/15 overflow-hidden text-left shadow-inner">
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/10 text-[11px] font-mono text-slate-400">
                                          <span className="text-slate-300 font-semibold">
                                            {className ? className.replace('language-', '') : 'code'}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyCode(codeContent, codeBlockId)}
                                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                            title="Copy snippet"
                                          >
                                            {isCodeCopied ? (
                                              <>
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                <span className="text-emerald-400">Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3 h-3" />
                                                <span>Copy</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                        <pre className="p-3 overflow-x-auto text-[12px] font-mono text-emerald-300 leading-relaxed">
                                          <code>{children}</code>
                                        </pre>
                                      </div>
                                    );
                                  },
                                  a({ href, children }) {
                                    return (
                                      <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
                                      >
                                        {children}
                                      </a>
                                    );
                                  },
                                  p({ children }) {
                                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                                  },
                                  ul({ children }) {
                                    return <ul className="list-disc list-inside space-y-1 my-1.5 pl-1">{children}</ul>;
                                  },
                                  ol({ children }) {
                                    return <ol className="list-decimal list-inside space-y-1 my-1.5 pl-1">{children}</ol>;
                                  },
                                  li({ children }) {
                                    return <li className="leading-relaxed">{children}</li>;
                                  },
                                  strong({ children }) {
                                    return <strong className="font-semibold text-white">{children}</strong>;
                                  },
                                  blockquote({ children }) {
                                    return (
                                      <blockquote
                                        className="border-l-2 pl-3 italic text-slate-300 my-2"
                                        style={{ borderColor: aura.accentColor }}
                                      >
                                        {children}
                                      </blockquote>
                                    );
                                  },
                                }}
                              >
                                {msg.text}
                              </Markdown>
                            )}
                          </div>

                          {/* Message Actions (Copy & Natural Voice Playback) */}
                          <div className="mt-2 flex items-center justify-end gap-2 pt-1.5 border-t border-white/5">
                            {!isUser && (
                              <button
                                onClick={() => handlePlayVoice(msg.id, msg.text)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                                  isPlaying
                                    ? 'text-rose-400 bg-rose-500/20 font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                                title={isPlaying ? 'Stop natural voice' : 'Play aloud with Molla voice'}
                              >
                                {isPlaying ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-rose-400 animate-pulse" />
                                    <span>Playing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3" />
                                    <span>Play Voice</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleCopyMessage(msg.text, index)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Copy message"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Tool Execution Logs */}
                  {toolCalls.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {toolCalls.slice(-2).map((tool) => (
                        <div
                          key={tool.id}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs text-slate-300"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-semibold text-white truncate">
                              Action: {tool.name}
                            </span>
                            {tool.args?.name && (
                              <span className="text-slate-400 truncate">({tool.args.name})</span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            Executed
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {isSending && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2 animate-in fade-in">
                      <div className="flex space-x-1.5">
                        <span className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </div>
                      <span className="italic text-slate-300 font-medium">
                        Molla is thinking and composing reply...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Floating Jump to Bottom Button */}
            {showScrollBottomBtn && (
              <button
                onClick={() => scrollToBottom('smooth')}
                className="absolute bottom-24 right-5 p-2 rounded-full bg-[#161d30] hover:bg-[#1e2742] text-slate-300 hover:text-white border border-white/20 shadow-xl transition-all z-20 animate-in fade-in zoom-in-95"
                title="Scroll to bottom"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-1.5 border-t border-white/5 bg-black/30 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
              {QUICK_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(chip);
                    textareaRef.current?.focus();
                  }}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Advanced Message Input Box with Speech Dictation */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/60 backdrop-blur-md shrink-0">
              <div className="relative flex items-end gap-2">
                {/* Speech Dictation Mic Button */}
                <button
                  id="chat-dictation-btn"
                  type="button"
                  onClick={toggleSpeechDictation}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 border cursor-pointer ${
                    isListeningDictation
                      ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40 animate-pulse'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border-white/15'
                  }`}
                  title={
                    isListeningDictation
                      ? 'Listening... Click to stop'
                      : `Speech-to-text dictation (${currentLangObj.name})`
                  }
                >
                  {isListeningDictation ? (
                    <MicOff className="w-4 h-4 text-white animate-bounce" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Auto-resizing textarea */}
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    id="chat-text-input"
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isListeningDictation
                        ? `Listening in ${currentLangObj.name}...`
                        : `Type a message to Molla (${currentLangObj.name} or English)...`
                    }
                    className="w-full py-2.5 pl-3.5 pr-9 rounded-2xl bg-white/[0.05] border border-white/15 focus:outline-none focus:border-rose-400/80 text-xs sm:text-sm text-white placeholder-slate-400 transition-all shadow-inner resize-none min-h-[44px] max-h-[140px]"
                  />

                  {/* Clear text button */}
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        textareaRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-white transition-colors"
                      title="Clear text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  id="chat-send-btn"
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                    inputText.trim() && !isSending
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-rose-500/25 scale-100 active:scale-95 cursor-pointer'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Send Message (Enter)"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Status and info footer */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Natural Molla Voice • {currentLangObj.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY LIST OF CONVERSATIONS */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                All Saved Conversations ({sessions.length})
              </span>
              <button
                onClick={() => {
                  onNewSession();
                  setActiveTab('chat');
                }}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start Fresh</span>
              </button>
            </div>

            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const lastMessage = session.messages[session.messages.length - 1];

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    setActiveTab('chat');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-lg'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isActive ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {session.title || 'Conversation'}
                      </h4>
                      {isActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-1">
                      {lastMessage
                        ? `${lastMessage.sender === 'user' ? 'You: ' : 'Molla: '}${lastMessage.text}`
                        : 'No messages yet'}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>{session.messages.length} messages</span>
                      <span>•</span>
                      <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete this conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Clearing All History */}
        {showClearConfirmModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#111726] border border-white/15 rounded-3xl p-5 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Clear All Chat History?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This will permanently delete all saved conversations and transcripts. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowClearConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllHistory();
                    setShowClearConfirmModal(false);
                    setActiveTab('chat');
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg transition-all cursor-pointer"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
