import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ConnectionState, AtmosphereConfig, TranscriptItem } from '../types';
import { WhatsAppChat } from './WhatsAppChat';
import {
  Trash2,
  X,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Send,
  Newspaper,
  Radio,
  Sparkles,
  Menu,
  Key,
} from 'lucide-react';

interface ChatScreenViewProps {
  state: ConnectionState;
  currentAura: AtmosphereConfig;
  transcripts: TranscriptItem[];
  voice: string;
  language: string;
  isVoicePlaying: boolean;
  isTyping: boolean;
  isVoiceTyping: boolean;
  isAnalyzingImage: boolean;
  isMollaResponding: boolean;
  pendingImageUrl: string | null;
  onUpdateAudioUrl: (messageId: string, audioUrl: string) => void;
  onSendMessage: (text: string, image?: string) => void;
  onOpenVisionModal: () => void;
  onClearChat: () => void;
  onOpenHistory: () => void;
  onCloseChat: () => void;
  onTypingChange: (isTyping: boolean) => void;
  onVoiceTypingChange: (isVoiceTyping: boolean) => void;
  onPauseLiveSession: (paused: boolean) => void;
  onOpenNews?: () => void;
  onToggleCall?: () => void;
  onStopCall?: () => void;
  onOpenLeftDrawer?: () => void;
  onOpenKeyModal?: () => void;
  hasApiKey?: boolean;
  effectiveTheme?: 'light' | 'dark';
}

export const ChatScreenView: React.FC<ChatScreenViewProps> = ({
  state,
  currentAura,
  transcripts,
  voice,
  language,
  isVoicePlaying,
  isTyping,
  isVoiceTyping,
  isAnalyzingImage,
  isMollaResponding,
  pendingImageUrl,
  onUpdateAudioUrl,
  onSendMessage,
  onOpenVisionModal,
  onClearChat,
  onOpenHistory,
  onCloseChat,
  onTypingChange,
  onVoiceTypingChange,
  onPauseLiveSession,
  onOpenNews,
  onToggleCall,
  onStopCall,
  onOpenLeftDrawer,
  onOpenKeyModal,
  hasApiKey = false,
  effectiveTheme = 'dark',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isInputVoiceTyping, setIsInputVoiceTyping] = useState(false);
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  const isLight = effectiveTheme === 'light';

  const isContinuousVoiceRef = useRef(false);
  const isVoicePlayingRef = useRef(isVoicePlaying);
  isVoicePlayingRef.current = isVoicePlaying;

  const recognitionRef = useRef<any>(null);
  const continuousRecRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Dynamic textarea auto-resizing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 28), 128)}px`;
    }
  }, [inputText]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (continuousRecRef.current) {
        try {
          continuousRecRef.current.stop();
        } catch {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onTypingChange(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    onTypingChange(true);
  };

  const handleInputBlur = () => {
    if (inputText.length === 0) {
      onTypingChange(false);
    }
  };

  // 1. Voice typing into the message input box
  const handleToggleInputVoiceTyping = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isInputVoiceTyping) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsInputVoiceTyping(false);
      onVoiceTypingChange(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language || 'en-US';

      recognition.onstart = () => {
        setIsInputVoiceTyping(true);
        onVoiceTypingChange(true);
        onPauseLiveSession(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputText((prev) => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + currentTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsInputVoiceTyping(false);
        onVoiceTypingChange(false);
      };

      recognition.onend = () => {
        setIsInputVoiceTyping(false);
        onVoiceTypingChange(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsInputVoiceTyping(false);
      onVoiceTypingChange(false);
    }
  };

  // Stop continuous voice conversation
  const stopContinuousVoice = useCallback(() => {
    setIsContinuousVoice(false);
    isContinuousVoiceRef.current = false;
    if (continuousRecRef.current) {
      try {
        continuousRecRef.current.stop();
      } catch {}
      continuousRecRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    onVoiceTypingChange(false);
  }, [onVoiceTypingChange]);

  // Start continuous voice conversation
  const startContinuousVoice = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Continuous speech recognition is not supported in this browser.');
      return;
    }

    try {
      setIsBannerDismissed(false);
      setIsContinuousVoice(true);
      isContinuousVoiceRef.current = true;
      onPauseLiveSession(true);
      onVoiceTypingChange(true);

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language || 'en-US';

      let accumulatedTranscript = '';

      rec.onstart = () => {
        console.log('[ChatScreen] Continuous voice listening started');
      };

      rec.onresult = (event: any) => {
        let finalPhrase = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalPhrase += item[0].transcript + ' ';
          } else {
            accumulatedTranscript = item[0].transcript;
          }
        }

        const speechToSend = finalPhrase || accumulatedTranscript;
        if (speechToSend.trim().length > 0) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = setTimeout(() => {
            const trimmed = speechToSend.trim();
            if (trimmed && !isVoicePlayingRef.current) {
              onSendMessage(trimmed);
              accumulatedTranscript = '';
            }
          }, 1200);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('[ChatScreen] Continuous voice error:', e);
      };

      rec.onend = () => {
        if (isContinuousVoiceRef.current && !isVoicePlayingRef.current) {
          try {
            rec.start();
          } catch {
            setTimeout(() => {
              if (isContinuousVoiceRef.current && !isVoicePlayingRef.current) {
                try {
                  rec.start();
                } catch {}
              }
            }, 300);
          }
        }
      };

      continuousRecRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('[ChatScreen] Continuous voice start error:', err);
      setIsContinuousVoice(false);
      isContinuousVoiceRef.current = false;
    }
  }, [language, onPauseLiveSession, onSendMessage, onVoiceTypingChange]);

  // Restart continuous speech recognition when Molla stops speaking
  useEffect(() => {
    if (!isVoicePlaying && isContinuousVoiceRef.current && continuousRecRef.current) {
      try {
        continuousRecRef.current.start();
      } catch {}
    }
  }, [isVoicePlaying]);

  const handleToggleContinuousVoice = () => {
    if (isContinuousVoice) {
      stopContinuousVoice();
    } else {
      startContinuousVoice();
    }
  };

  // Center Mic button
  const handleCenterMicClick = () => {
    setIsBannerDismissed(false);
    if (onToggleCall) {
      onToggleCall();
    } else {
      handleToggleContinuousVoice();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAttachedImage(compressed);
        } else {
          setAttachedImage(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend && !attachedImage) return;

    onSendMessage(textToSend, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    onTypingChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'listening':
        return '#10b981'; // Emerald
      case 'speaking':
        return '#f43f5e'; // Rose
      case 'connecting':
        return '#f59e0b'; // Amber
      default:
        return '#64748b'; // Slate
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening';
      case 'speaking':
        return 'Speaking';
      case 'connecting':
        return 'Connecting';
      default:
        return 'Ready';
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50/85 backdrop-blur-3xl' : 'bg-[#080d1a]/85 backdrop-blur-3xl'
      }`}
    >
      {/* 1. Header Area */}
      <header
        className={`relative z-20 px-3 sm:px-4 pt-[max(0.65rem,env(safe-area-inset-top))] pb-2.5 border-b backdrop-blur-2xl flex items-center justify-between transition-colors shrink-0 ${
          isLight
            ? 'bg-white/80 border-slate-200/80 shadow-xs text-slate-800'
            : 'bg-[#0b101c]/80 border-white/10 text-white shadow-lg'
        }`}
      >
        {/* Left: 3-bar History Hamburger */}
        <div className="flex items-center gap-1.5">
          <button
            id="chat-history-btn"
            type="button"
            onClick={onOpenHistory}
            className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs backdrop-blur-xl ${
              isLight
                ? 'bg-white/90 hover:bg-white border-white/95 text-slate-700 shadow-slate-200/50'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            }`}
            title="Chat History"
          >
            <div className={`w-5 h-0.5 rounded-full ${isLight ? 'bg-slate-700' : 'bg-white'}`} />
            <div className={`w-5 h-0.5 rounded-full ${isLight ? 'bg-slate-700' : 'bg-white'}`} />
            <div className={`w-5 h-0.5 rounded-full ${isLight ? 'bg-slate-700' : 'bg-white'}`} />
          </button>
        </div>

        {/* Center: Live & News & Key Quick Action */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 font-mono text-[11px] font-bold tracking-wider uppercase shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>LIVE</span>
          </div>

          {onOpenKeyModal && (
            <button
              type="button"
              id="chat-header-key-btn"
              onClick={onOpenKeyModal}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-mono text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-xs backdrop-blur-md active:scale-95 ${
                !hasApiKey
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300 animate-pulse'
                  : isLight
                  ? 'bg-blue-50/90 hover:bg-blue-100 border-blue-200 text-blue-700'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-300 hover:text-white'
              }`}
              title="Google Gemini API Key"
            >
              <Key className={`w-3.5 h-3.5 ${!hasApiKey ? 'text-amber-400' : 'text-blue-400'}`} />
              <span>{!hasApiKey ? 'Add Key' : 'Key'}</span>
            </button>
          )}

          {onOpenNews && (
            <button
              type="button"
              id="chat-header-news-btn"
              onClick={onOpenNews}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full border font-mono text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-xs backdrop-blur-md ${
                isLight
                  ? 'bg-rose-50/90 hover:bg-rose-100 border-rose-200 text-rose-600'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300 hover:text-white'
              }`}
              title="Open Google News Live"
            >
              <Newspaper className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">News</span>
            </button>
          )}
        </div>

        {/* Right: Status Pill + Close Button */}
        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-semibold tracking-wider backdrop-blur-md ${
              isLight
                ? 'bg-white/80 border-slate-200 text-slate-700'
                : 'bg-black/40 border-white/10 text-slate-200'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: getStatusColor() }}
            />
            <span>{getStatusText()}</span>
          </div>

          {/* Close Button (Returns to Home Screen) */}
          <button
            id="chat-close-btn"
            type="button"
            onClick={onCloseChat}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-xs backdrop-blur-md ${
              isLight
                ? 'bg-rose-50/90 hover:bg-rose-100 border-rose-200 text-rose-600 hover:text-rose-700'
                : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 hover:text-white'
            }`}
            title="Close Chat & Return to Home"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-semibold">Close</span>
          </button>
        </div>
      </header>

      {/* 2. Messages Stream */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        <WhatsAppChat
          transcripts={transcripts}
          state={state}
          currentAura={currentAura}
          onUpdateAudioUrl={onUpdateAudioUrl}
          voice={voice}
          isTyping={isTyping}
          isVoiceTyping={isVoiceTyping || isInputVoiceTyping || isContinuousVoice}
          isAnalyzingImage={isAnalyzingImage}
          isMollaResponding={isMollaResponding}
          pendingImageUrl={pendingImageUrl}
          effectiveTheme={effectiveTheme}
        />
      </main>

      {/* 3. Bottom Controls Area with Frosted Glass UI */}
      <footer
        className={`relative z-20 border-t px-3 sm:px-4 pt-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5 transition-colors shrink-0 backdrop-blur-2xl ${
          isLight
            ? 'bg-white/80 border-slate-200/80 shadow-xl'
            : 'bg-[#0b101c]/80 border-white/10 shadow-2xl'
        }`}
      >
        {/* Hidden File Input for Gallery Images */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Continuous Voice / Live Call Active Banner with Close Option */}
        {!isBannerDismissed &&
          (state === 'listening' ||
            state === 'speaking' ||
            state === 'paused' ||
            isContinuousVoice) && (
            <div
              className={`w-full max-w-xl mx-auto flex items-center justify-between px-3 py-1.5 rounded-xl text-xs backdrop-blur-md transition-all ${
                state === 'speaking'
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-200 shadow-sm'
                  : state === 'listening' || isContinuousVoice
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 animate-pulse shadow-sm'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {state === 'speaking' ? (
                  <div className="flex items-center gap-0.5 h-3.5 shrink-0">
                    <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" />
                    <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                ) : (
                  <Radio
                    className={`w-3.5 h-3.5 shrink-0 ${
                      state === 'paused'
                        ? 'text-amber-500'
                        : 'text-emerald-500 animate-pulse'
                    }`}
                  />
                )}
                <span className="font-semibold truncate">
                  {state === 'speaking'
                    ? 'Molla is speaking...'
                    : state === 'listening'
                    ? 'Continuous Live Voice Active • Speak freely anytime'
                    : state === 'paused'
                    ? 'Mic Paused • Tap center mic button below to talk'
                    : 'Continuous Voice Chat Active • Speak freely anytime'}
                </span>
              </div>

              {/* Action buttons on the right side of the banner */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {/* Pause / Resume / Stop Button */}
                {/* Pause / Resume / Stop Button */}
                <button
                  type="button"
                  id="chat-banner-toggle-btn"
                  onClick={() => {
                    if (state === 'paused') {
                      if (onToggleCall) onToggleCall();
                    } else if (state === 'listening' || state === 'speaking') {
                      if (onToggleCall) onToggleCall();
                    } else if (isContinuousVoice) {
                      stopContinuousVoice();
                    }
                  }}
                  className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={
                    state === 'paused'
                      ? 'Resume speaking with Molla'
                      : 'Pause microphone'
                  }
                >
                  {state === 'listening' || state === 'speaking'
                    ? 'Pause'
                    : state === 'paused'
                    ? 'Resume'
                    : 'Stop'}
                </button>

                {/* Close Option right next to it: completely shuts down microphone & returns to clean chat */}
                <button
                  type="button"
                  id="chat-banner-close-btn"
                  onClick={() => {
                    setIsBannerDismissed(true);
                    if (isContinuousVoice) {
                      stopContinuousVoice();
                    }
                    if (onStopCall) {
                      onStopCall();
                    } else if (onToggleCall) {
                      onToggleCall();
                    }
                  }}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isLight
                      ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                      : 'hover:bg-white/20 text-white/80 hover:text-white'
                  }`}
                  title="Turn off microphone completely (Exit voice call)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        {/* Dynamic Growing Input Bar with Internal Voice Icon */}
        <form
          onSubmit={handleSend}
          className={`relative w-full max-w-xl mx-auto flex items-end gap-2 rounded-2xl px-3 py-2 border shadow-inner transition-all backdrop-blur-xl focus-within:border-rose-500 ${
            isLight
              ? 'bg-white/90 border-slate-200/90 text-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
              : 'bg-[#182232]/85 border-white/15 text-white shadow-inner'
          }`}
        >
          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="relative shrink-0 mb-0.5">
              <img
                src={attachedImage}
                alt="Selected"
                className="w-9 h-9 rounded-lg object-cover border border-rose-500/50"
              />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                title="Remove photo"
              >
                ✕
              </button>
            </div>
          )}

          {/* Left indicator icon */}
          <div className="pb-1 text-rose-500 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Dynamic Auto-Growing Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={
              isInputVoiceTyping
                ? 'Listening to voice typing...'
                : attachedImage
                ? 'Ask about this photo or send directly...'
                : 'Type a message or click mic...'
            }
            className={`flex-1 bg-transparent text-sm focus:outline-none resize-none leading-relaxed py-1 min-w-0 max-h-32 overflow-y-auto scrollbar-thin ${
              isLight
                ? 'text-slate-900 placeholder:text-slate-400'
                : 'text-white placeholder:text-slate-400 scrollbar-thumb-white/10'
            } ${isInputVoiceTyping ? 'placeholder:text-rose-500' : ''}`}
          />

          {/* Voice Mic Icon INSIDE Input Bar */}
          <button
            type="button"
            id="chat-input-mic-btn"
            onClick={handleToggleInputVoiceTyping}
            className={`p-1.5 rounded-xl transition-all cursor-pointer shrink-0 mb-0.5 ${
              isInputVoiceTyping
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/50 animate-pulse'
                : isLight
                ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
                : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
            }`}
            title={
              isInputVoiceTyping
                ? 'Stop voice typing'
                : 'Voice type into message box'
            }
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Button */}
          {(inputText.trim().length > 0 || attachedImage) && (
            <button
              type="submit"
              id="chat-send-btn"
              className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0 mb-0.5"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          )}
        </form>

        {/* 3 Circular Action Buttons Row: [ Camera ] [ Big Continuous Voice Mic ] [ Gallery ] */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-around pt-0.5">
          {/* Left: Camera Button */}
          <button
            id="chat-camera-btn"
            type="button"
            onClick={onOpenVisionModal}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-xl ${
              isLight
                ? 'bg-white/85 hover:bg-white border-white/90 text-slate-700 hover:text-slate-900 shadow-slate-200/50'
                : 'bg-[#182232]/85 hover:bg-[#223046] border-white/15 text-slate-200 hover:text-white'
            }`}
            title="Open Camera"
          >
            <Camera className="w-6 h-6" />
          </button>

          {/* Center: Large Continuous Voice Button */}
          <button
            id="chat-center-mic-btn"
            type="button"
            onClick={handleCenterMicClick}
            className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl cursor-pointer active:scale-95 ${
              state === 'listening' || isContinuousVoice
                ? 'bg-emerald-500/30 border-2 border-emerald-400 shadow-emerald-500/60 animate-pulse'
                : state === 'speaking'
                ? 'bg-rose-500/40 border-2 border-rose-400 shadow-rose-500/60 animate-pulse'
                : state === 'connecting'
                ? 'bg-amber-500/30 border-2 border-amber-400'
                : state === 'paused'
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400/60'
                : isLight
                ? 'bg-white/90 hover:bg-white border-2 border-rose-500 shadow-rose-500/20'
                : 'bg-[#182232]/90 hover:bg-[#202c3f] border-2 border-rose-500/70 shadow-rose-500/30'
            }`}
            style={{
              boxShadow:
                state === 'listening' || isContinuousVoice
                  ? '0 0 32px rgba(16, 185, 129, 0.7)'
                  : state === 'speaking'
                  ? '0 0 32px rgba(244, 63, 94, 0.7)'
                  : '0 0 24px rgba(244, 63, 94, 0.4)',
            }}
            title={
              state === 'listening'
                ? 'Continuous Voice Active (Listening...) • Tap to pause'
                : state === 'speaking'
                ? 'Molla Speaking... • Tap to pause'
                : state === 'paused'
                ? 'Mic Paused • Tap to resume continuous talking'
                : isContinuousVoice
                ? 'Stop Continuous Voice'
                : 'Start Continuous Voice Call (Tap once to talk continuously)'
            }
          >
            {state === 'connecting' ? (
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : state === 'listening' ? (
              <Mic className="w-8 h-8 text-emerald-300 animate-pulse" />
            ) : state === 'speaking' ? (
              <div className="flex items-center gap-1 h-6">
                {[14, 22, 10, 20, 12].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-rose-400 rounded-full animate-bounce"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            ) : state === 'paused' ? (
              <MicOff className="w-7 h-7 text-amber-300" />
            ) : isContinuousVoice ? (
              <Mic className="w-8 h-8 text-emerald-300 animate-pulse" />
            ) : (
              <Mic className="w-7 h-7 text-rose-500" />
            )}
          </button>

          {/* Right: Gallery Button */}
          <button
            id="chat-gallery-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-xl ${
              isLight
                ? 'bg-white/85 hover:bg-white border-white/90 text-slate-700 hover:text-slate-900 shadow-slate-200/50'
                : 'bg-[#182232]/85 hover:bg-[#223046] border-white/15 text-slate-200 hover:text-white'
            }`}
            title="Upload Photo"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};
