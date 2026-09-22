import React, { useState, useRef, useEffect } from 'react';
import { ConnectionState, AtmosphereConfig } from '../types';
import { Mic, Send, Sparkles, Pause, Camera, Image as ImageIcon, X } from 'lucide-react';

interface BottomTalkBarProps {
  state: ConnectionState;
  aura: AtmosphereConfig;
  onToggleTalk: () => void;
  onSendMessage: (text: string, image?: string) => void;
  onOpenVisionModal?: () => void;
  onTypingChange?: (isTyping: boolean) => void;
  onVoiceTypingChange?: (isVoiceTyping: boolean) => void;
  onPauseLiveSession?: (paused: boolean) => void;
  isVoicePlaying?: boolean;
  getVolumeRMS?: () => number;
  language?: string;
}

export const BottomTalkBar: React.FC<BottomTalkBarProps> = ({
  state,
  aura,
  onToggleTalk,
  onSendMessage,
  onOpenVisionModal,
  onTypingChange,
  onVoiceTypingChange,
  onPauseLiveSession,
  isVoicePlaying = false,
  language = 'bn',
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';
  const isPaused = state === 'paused' || isVoicePlaying || isVoiceTyping || isInputFocused || inputText.trim().length > 0;

  // Auto-resize dynamic textarea up to medium height (max 128px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 28), 128)}px`;
    }
  }, [inputText]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    onTypingChange?.(val.trim().length > 0);
    onPauseLiveSession?.(true);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // When user taps into keyboard input, ALWAYS pause live call and release hardware mic
    // so Gboard voice typing, Samsung keyboard mic, or keyboard input has exclusive OS mic access!
    onPauseLiveSession?.(true);
    onTypingChange?.(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // If input is empty and not voice typing, un-pause after short delay
    setTimeout(() => {
      if (!isVoiceTyping && inputText.trim().length === 0) {
        onTypingChange?.(false);
        if (state === 'paused') {
          onPauseLiveSession?.(false);
        }
      }
    }, 250);
  };

  const handleCompositionStart = () => {
    // Fired by Gboard voice typing / IME speech recognition
    onVoiceTypingChange?.(true);
    onPauseLiveSession?.(true);
  };

  const handleCompositionEnd = () => {
    onVoiceTypingChange?.(false);
  };

  // Toggle voice typing (Speech to text directly into input)
  const handleToggleVoiceTyping = () => {
    if (isVoiceTyping) {
      // Stop voice typing
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsVoiceTyping(false);
      onVoiceTypingChange?.(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser. Please use your keyboard microphone.');
      return;
    }

    try {
      // 1. Immediately pause live call and release hardware mic so speech recognition gets full OS mic
      onPauseLiveSession?.(true);

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsVoiceTyping(true);
        onVoiceTypingChange?.(true);
        onTypingChange?.(true);
        onPauseLiveSession?.(true);
      };

      recognition.onresult = (event: any) => {
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          }
        }
        if (finalText) {
          setInputText((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalText.trim();
          });
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[VoiceTyping] Speech recognition error:', err);
        setIsVoiceTyping(false);
        onVoiceTypingChange?.(false);
      };

      recognition.onend = () => {
        setIsVoiceTyping(false);
        onVoiceTypingChange?.(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[VoiceTyping] Start error:', err);
      setIsVoiceTyping(false);
      onVoiceTypingChange?.(false);
    }
  };

  // Handle image selection from device with automatic optimization
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setAttachedImage(compressedDataUrl);
        } else {
          setAttachedImage(rawDataUrl);
        }
      };
      img.onerror = () => {
        setAttachedImage(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected if removed
    e.target.value = '';
  };

  const handleRemoveAttachedImage = () => {
    setAttachedImage(null);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed && !attachedImage) return;

    if (isVoiceTyping && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsVoiceTyping(false);
      onVoiceTypingChange?.(false);
    }

    onSendMessage(trimmed, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    setIsInputFocused(false);
    onTypingChange?.(false);
    onVoiceTypingChange?.(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
    }

    // If live call was paused due to typing, resume it
    if (state === 'paused') {
      onPauseLiveSession?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 pb-4 pt-1 z-30 select-none flex flex-col items-center gap-2">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Keyboard Voice Typing Mic Release Banner */}
      {(isInputFocused || isVoiceTyping || inputText.trim().length > 0) && (
        <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#202c33]/90 border border-emerald-500/30 text-[11px] text-emerald-300 shadow-md backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-medium">
              {isVoiceTyping
                ? '🎙️ Voice typing active • App mic paused'
                : '⌨️ Keyboard open • App mic paused for voice typing'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 font-mono">MIC FREED</span>
        </div>
      )}

      {/* Attached Image Preview Chip */}
      {attachedImage && (
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-[#202c33] border border-pink-500/40 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5">
            <img
              src={attachedImage}
              alt="Attached preview"
              className="w-10 h-10 object-cover rounded-lg border border-white/20"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> Photo attached
              </span>
              <span className="text-[10px] text-slate-400">Molla will analyze this photo upon sending</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveAttachedImage}
            title="Remove photo"
            className="p-1 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WhatsApp Message Input Bar with Dynamic Growing Textarea */}
      <form
        onSubmit={handleSend}
        className="w-full flex items-end gap-1.5 sm:gap-2 bg-[#202c33]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-2.5 sm:px-3 py-2 shadow-2xl transition-all duration-200 focus-within:border-pink-500/50"
      >
        <div className="flex items-center justify-center pl-1 pb-1 text-pink-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>

        <textarea
          id="chat-text-input"
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={
            isVoiceTyping
              ? 'Listening to voice typing...'
              : attachedImage
              ? 'Ask about this photo or send directly...'
              : 'Type a message or use mic...'
          }
          className={`flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed py-1 px-1 min-w-0 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 ${
            isVoiceTyping ? 'placeholder:text-emerald-400 font-medium' : ''
          }`}
        />

        {/* Camera Vision Tool Button */}
        {onOpenVisionModal && (
          <button
            type="button"
            onClick={onOpenVisionModal}
            title="Camera vision tool (Live capture)"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-white/10 transition-all cursor-pointer shrink-0 mb-0.5"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}

        {/* Gallery Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload photo from gallery"
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer shrink-0 mb-0.5"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Inline Voice Typing (Speech to Text) Mic Button INSIDE bar */}
        <button
          type="button"
          onClick={handleToggleVoiceTyping}
          title={isVoiceTyping ? 'Stop voice typing' : 'Voice typing (speak to type)'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 mb-0.5 ${
            isVoiceTyping
              ? 'bg-emerald-500 text-white animate-pulse shadow-md shadow-emerald-500/40'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-white/10'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        {(inputText.trim().length > 0 || attachedImage) && (
          <button
            type="submit"
            id="send-message-btn"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0 mb-0.5"
            title="Send message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        )}
      </form>

      {/* Prominent "TAP TO TALK" Orb (1ST Live voice) */}
      <div className="flex flex-col items-center justify-center">
        <button
          id="tap-to-talk-btn"
          type="button"
          onClick={onToggleTalk}
          disabled={isConnecting}
          className="relative group focus:outline-none flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          {/* Animated Glow Aura */}
          <div
            className="absolute -inset-2 rounded-full blur-xl transition-all duration-300 pointer-events-none"
            style={{
              backgroundColor: isConnected
                ? state === 'speaking'
                  ? '#ec4899'
                  : '#10b981'
                : isPaused
                ? '#f59e0b'
                : '#f43f5e',
              opacity: isConnected ? 0.6 : isPaused ? 0.4 : 0.3,
            }}
          />

          {/* Outer Pulsing Ring */}
          <div
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-2xl ${
              isConnected ? 'animate-pulse' : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: isConnected
                ? state === 'speaking'
                  ? 'rgba(236, 72, 153, 0.25)'
                  : 'rgba(16, 185, 129, 0.2)'
                : isPaused
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(244, 63, 94, 0.15)',
              borderColor: isConnected
                ? state === 'speaking'
                  ? '#ec4899'
                  : '#10b981'
                : isPaused
                ? '#f59e0b'
                : '#f43f5e',
              boxShadow: isConnected
                ? state === 'speaking'
                  ? '0 0 30px rgba(236, 72, 153, 0.5)'
                  : '0 0 30px rgba(16, 185, 129, 0.45)'
                : isPaused
                ? '0 0 25px rgba(245, 158, 11, 0.35)'
                : '0 0 25px rgba(244, 63, 94, 0.35)',
            }}
          >
            {isConnecting ? (
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : isConnected ? (
              state === 'speaking' ? (
                <div className="flex items-center gap-1 h-6">
                  {[16, 24, 12, 22, 14].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-pink-400 rounded-full animate-bounce"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 120}ms`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Mic className="w-8 h-8 text-emerald-400 animate-pulse" />
              )
            ) : isPaused ? (
              <Pause className="w-8 h-8 text-amber-400 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 text-rose-400 group-hover:text-rose-300 transition-colors" />
            )}
          </div>
        </button>

        {/* Text Label under Button */}
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: isPaused
                ? '#f59e0b'
                : isConnected
                ? state === 'speaking'
                  ? '#ec4899'
                  : '#10b981'
                : '#f43f5e',
            }}
          />
          <span
            className="text-xs sm:text-sm font-semibold tracking-wider uppercase font-mono"
            style={{
              color: isPaused
                ? '#fbbf24'
                : isConnected
                ? state === 'speaking'
                  ? '#f472b6'
                  : '#34d399'
                : '#fb7185',
            }}
          >
            {isVoiceTyping
              ? 'VOICE TYPING... (APP MIC OFF)'
              : (isInputFocused || inputText.trim().length > 0)
              ? 'KEYBOARD ACTIVE (APP MIC OFF)'
              : isPaused
              ? 'PAUSED (TAP TO RESUME)'
              : isConnecting
              ? 'CONNECTING...'
              : state === 'listening'
              ? 'LISTENING... (TAP TO STOP)'
              : state === 'speaking'
              ? 'MOLLA SPEAKING... (TAP TO STOP)'
              : 'TAP TO TALK'}
          </span>
        </div>
      </div>
    </div>
  );
};
