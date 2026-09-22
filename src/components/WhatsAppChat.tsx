import React, { useEffect, useRef, useState } from 'react';
import { TranscriptItem, ConnectionState, AtmosphereConfig } from '../types';
import { voicePlayer, VoicePlaybackState } from '../services/voicePlayer';
import { Play, Pause, Loader2, CheckCheck, Sparkles, Volume2, Copy, Check, Camera } from 'lucide-react';

interface WhatsAppChatProps {
  transcripts: TranscriptItem[];
  state: ConnectionState;
  currentAura: AtmosphereConfig;
  onUpdateAudioUrl?: (messageId: string, audioUrl: string) => void;
  voice?: string;
  isTyping?: boolean;
  isVoiceTyping?: boolean;
  isAnalyzingImage?: boolean;
  isMollaResponding?: boolean;
  pendingImageUrl?: string | null;
  effectiveTheme?: 'light' | 'dark';
}

export const WhatsAppChat: React.FC<WhatsAppChatProps> = ({
  transcripts,
  state,
  currentAura,
  onUpdateAudioUrl,
  voice = 'Aoede',
  isTyping = false,
  isVoiceTyping = false,
  isAnalyzingImage = false,
  isMollaResponding = false,
  pendingImageUrl = null,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  // Copied message ID state for visual feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio playback state
  const [playback, setPlayback] = useState<VoicePlaybackState>({
    activeMessageId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
  });

  // Subscribe to voicePlayer changes
  useEffect(() => {
    const unsubscribe = voicePlayer.subscribe((newPlayback) => {
      setPlayback(newPlayback);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-scroll on new messages or text streams
  useEffect(() => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, state]);

  // Handle Copy text to clipboard
  const handleCopyText = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
        })
        .catch(() => fallbackCopy(id, text));
    } else {
      fallbackCopy(id, text);
    }
  };

  const fallbackCopy = (id: string, text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
    } catch (err) {
      console.warn('[WhatsAppChat] Copy fallback failed:', err);
    }
  };

  // Handle Play / Pause for any message with same natural real voice
  const handleToggleVoice = async (item: TranscriptItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!item.text || !item.text.trim()) {
      return;
    }
    try {
      const generatedUrl = await voicePlayer.togglePlay(
        item.id,
        item.text,
        item.audioUrl,
        voice || 'Aoede'
      );
      if (generatedUrl && !item.audioUrl && onUpdateAudioUrl) {
        onUpdateAudioUrl(item.id, generatedUrl);
      }
    } catch (err) {
      console.warn('[WhatsAppChat] Audio toggle error:', err);
    }
  };

  const formatTime = (ts?: number) => {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative flex-1 w-full max-w-2xl mx-auto flex flex-col min-h-0 px-2 sm:px-4">
      {/* WhatsApp Chat Wallpaper subtle pattern / dark canvas */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-2 sm:px-3 py-4 space-y-3 scroll-smooth no-scrollbar"
        style={{
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 98%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 2%, black 98%, transparent 100%)',
        }}
      >
        {/* Date Badge: TODAY */}
        <div className="flex justify-center my-2 sticky top-1 z-10">
          <span className="px-3 py-1 rounded-lg text-[11px] font-medium tracking-wide uppercase bg-[#182229]/90 border border-white/5 text-slate-300 shadow-md backdrop-blur-md">
            Today's Conversation • LIVE
          </span>
        </div>

        {/* Initial Welcome message from Molla */}
        {transcripts.length === 0 && (
          <div className="flex flex-col items-start max-w-[88%] sm:max-w-[80%] mr-auto animate-in fade-in duration-300">
            <div
              onClick={() =>
                handleToggleVoice({
                  id: 'welcome-msg',
                  sender: 'molla',
                  text: 'Hi! I am Molla. How are you doing? Tap the mic or type below to talk with me on any topic!',
                  timestamp: Date.now(),
                })
              }
              className={`cursor-pointer group relative rounded-2xl rounded-tl-xs p-3.5 shadow-lg transition-all duration-200 ${
                isLight
                  ? 'bg-white border border-slate-200 hover:border-slate-300 text-slate-800'
                  : 'bg-[#202c33] border border-pink-500/20 hover:border-pink-500/40 text-slate-100'
              }`}
            >
              {/* Molla sender header */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[12px] font-bold text-rose-500">Molla AI</span>
              </div>

              {/* Message text */}
              <p className={`text-[14px] sm:text-[15px] leading-relaxed font-sans select-text ${
                isLight ? 'text-slate-800' : 'text-slate-100'
              }`}>
                Hi! I am Molla. How are you doing? Tap the mic icon or <span className="text-rose-500 font-semibold">TAP TO TALK</span> below to speak with me in real voice!
              </p>

              {/* Voice Note Bar */}
              <div className={`mt-2.5 pt-2 border-t flex items-center gap-3 ${
                isLight ? 'border-slate-100' : 'border-white/10'
              }`}>
                <button
                  type="button"
                  onClick={(e) =>
                    handleToggleVoice(
                      {
                        id: 'welcome-msg',
                        sender: 'molla',
                        text: 'Hi! I am Molla. How are you doing? Tap the mic or type below to talk with me on any topic!',
                        timestamp: Date.now(),
                      },
                      e
                    )
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500 text-white shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  {playback.activeMessageId === 'welcome-msg' && playback.isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : playback.activeMessageId === 'welcome-msg' && playback.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  )}
                </button>

                {/* Animated waveform bars */}
                <div className="flex-1 flex items-center gap-0.5 sm:gap-1 h-5">
                  {[40, 70, 45, 90, 60, 80, 50, 65, 85, 40, 75, 50, 95, 60, 40].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${playback.activeMessageId === 'welcome-msg' && playback.isPlaying ? Math.max(20, (h * Math.sin((i + Date.now() / 200) % Math.PI)) % 100) : h * 0.45}%`,
                        backgroundColor:
                          playback.activeMessageId === 'welcome-msg' && playback.isPlaying
                            ? '#ec4899'
                            : '#64748b',
                      }}
                    />
                  ))}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {playback.activeMessageId === 'welcome-msg' && playback.duration > 0
                    ? formatAudioTime(playback.currentTime)
                    : 'Voice'}
                </span>
              </div>

              {/* Footer: Copy Button and Timestamp */}
              <div className="flex justify-between items-center gap-2 mt-2 pt-1 border-t border-white/5 text-[11px] text-slate-400 select-none">
                <button
                  type="button"
                  onClick={(e) =>
                    handleCopyText(
                      'welcome-msg',
                      'Hi! I am Molla. How are you doing? Tap the mic or type below to talk with me on any topic!',
                      e
                    )
                  }
                  title="Copy message"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                    copiedId === 'welcome-msg'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {copiedId === 'welcome-msg' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <span>{formatTime()}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 ml-2 mt-1 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-pink-400" />
              Click message to play/pause voice
            </span>
          </div>
        )}

        {/* Message stream list */}
        {transcripts.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasAudio = Boolean(msg.text && msg.text.trim());
          const isCurrentPlaying = playback.activeMessageId === msg.id && playback.isPlaying;
          const isCurrentLoading = playback.activeMessageId === msg.id && playback.isLoading;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end ml-auto' : 'items-start mr-auto'} max-w-[88%] sm:max-w-[82%] animate-in fade-in duration-200`}
            >
              {/* Message Bubble */}
              <div
                onClick={() => hasAudio && handleToggleVoice(msg)}
                title={hasAudio ? 'Click to listen or pause voice' : undefined}
                className={`group relative rounded-2xl p-3 shadow-lg transition-all duration-200 select-text ${
                  hasAudio ? 'cursor-pointer' : ''
                } ${
                  isUser
                    ? isLight
                      ? 'bg-[#d9fdd3] hover:bg-[#d0f7ca] text-[#111b21] rounded-tr-xs border border-[#bbf0b3]'
                      : 'bg-[#005c4b] hover:bg-[#026855] text-white rounded-tr-xs border border-emerald-600/30'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-900 rounded-tl-xs border border-slate-200 shadow-sm'
                    : 'bg-[#202c33] hover:bg-[#25323a] text-slate-100 rounded-tl-xs border border-pink-500/20'
                } ${isCurrentPlaying ? 'ring-2 ring-rose-500/80 shadow-rose-500/20' : ''}`}
              >
                {/* Sender badge for Molla */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1 select-none">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[12px] font-bold text-rose-500">Molla</span>
                  </div>
                )}

                {/* Attached Photo/Image */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-w-xs border border-white/10 bg-black/40 shadow-inner">
                    <img
                      src={msg.imageUrl}
                      alt="Visual Input"
                      className="w-full h-auto max-h-60 object-cover hover:scale-102 transition-transform duration-200"
                    />
                  </div>
                )}

                {/* Message text */}
                {msg.text && (
                  <p className="text-[14px] sm:text-[15px] leading-relaxed break-words font-sans">
                    {msg.text}
                  </p>
                )}
                {!msg.text && msg.isInterim && (
                  <p className="text-[14px] leading-relaxed break-words font-sans text-slate-400 italic">
                    ...
                  </p>
                )}

                {/* WhatsApp Voice Note Audio Player Bar */}
                {hasAudio && (
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center gap-2.5 ${
                      isUser ? 'border-emerald-700/50' : 'border-white/10'
                    }`}
                  >
                    {/* Play / Pause button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleVoice(msg, e)}
                      aria-label={isCurrentPlaying ? 'Pause voice' : 'Play voice'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 ${
                        isUser
                          ? isCurrentPlaying
                            ? 'bg-emerald-400 text-slate-900'
                            : 'bg-emerald-600'
                          : isCurrentPlaying
                          ? 'bg-pink-400 text-slate-900'
                          : 'bg-pink-500'
                      }`}
                    >
                      {isCurrentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform Bars */}
                    <div className="flex-1 flex items-center gap-0.5 sm:gap-1 h-5 overflow-hidden">
                      {[35, 60, 45, 80, 55, 90, 40, 70, 85, 50, 65, 95, 45, 75, 40, 60].map((h, i) => {
                        const isActive =
                          isCurrentPlaying &&
                          playback.duration > 0 &&
                          i / 16 <= playback.currentTime / playback.duration;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-full transition-all duration-100"
                            style={{
                              height: `${
                                isCurrentPlaying
                                  ? Math.max(25, (h * Math.abs(Math.sin((i * 0.4) + playback.currentTime * 5))) % 100)
                                  : h * 0.45
                              }%`,
                              backgroundColor: isCurrentPlaying
                                ? isUser
                                ? '#34d399'
                                : '#ec4899'
                                : isActive
                                ? '#53bdeb'
                                : isUser
                                ? '#0f766e'
                                : '#64748b',
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Audio time & status */}
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 shrink-0">
                      {isCurrentPlaying && playback.duration > 0
                        ? formatAudioTime(playback.currentTime)
                        : isCurrentLoading
                        ? 'Loading...'
                        : 'Voice'}
                    </span>
                  </div>
                )}

                {/* Footer: Copy Button, Timestamp and Read Receipt Ticks */}
                <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-white/5 select-none">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopyText(msg.id, msg.text, e)}
                    title={copiedId === msg.id ? 'Copied' : 'Copy message text'}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-all duration-150 ${
                      copiedId === msg.id
                        ? 'bg-emerald-500/25 text-emerald-300 font-semibold shadow-xs'
                        : 'text-slate-300/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Time & Read Receipts */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] ${
                      isUser
                        ? isLight ? 'text-[#667781]' : 'text-slate-200'
                        : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {isUser && (
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom hint label */}
              {hasAudio && (
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                  {isCurrentPlaying ? '⏸️ Click to pause voice' : '▶️ Click to play voice'}
                </span>
              )}
            </div>
          );
        })}

        {/* WhatsApp-Style Real-Time Status Indicators */}
        {isVoiceTyping && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#202c33]/95 border border-emerald-500/40 text-xs text-emerald-400 w-fit shadow-lg backdrop-blur-md animate-fade-in select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-emerald-300 text-[12px]">🎙️ You are speaking to text... (App mic paused)</span>
            <div className="flex items-center gap-0.5 h-3 ml-1">
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {isTyping && !isVoiceTyping && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#202c33]/95 border border-emerald-500/30 text-xs text-emerald-400 w-fit shadow-lg backdrop-blur-md animate-fade-in select-none">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
            </div>
            <span className="font-medium text-slate-200 text-[12px]">✍️ You are typing... (App mic paused)</span>
          </div>
        )}

        {state === 'speaking' && (
          <div className="flex items-center gap-2 text-pink-400 text-xs py-1.5 px-3 rounded-2xl bg-[#202c33]/95 border border-pink-500/30 w-fit shadow-lg backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            <span className="text-pink-300 font-medium text-[12px]">🔊 Molla is speaking in real voice...</span>
            <div className="flex items-center gap-0.5 h-3 ml-1">
              <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-bounce" />
              <span className="w-0.5 h-3.5 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {state === 'listening' && !isTyping && !isVoiceTyping && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs py-1.5 px-3 rounded-2xl bg-[#202c33]/95 border border-emerald-500/20 w-fit shadow-md backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-medium text-[12px]">🎙️ Listening live, speak now...</span>
          </div>
        )}

        {/* Animated Bouncing Indicator for Molla Analyzing Photo / Preparing Answer */}
        {isAnalyzingImage && (
          <div className="flex flex-col items-start mr-auto max-w-[90%] sm:max-w-[82%] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative rounded-2xl rounded-tl-xs p-3.5 shadow-2xl bg-[#202c33] border border-pink-500/40 ring-1 ring-pink-500/30 text-slate-100 overflow-hidden">
              {/* Shimmer sweep animation */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent pointer-events-none"
                style={{ animation: 'shimmerSweep 2s ease-in-out infinite' }}
              />

              {/* Header with avatar & vision badge */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[13px] font-bold text-pink-400">Molla</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium border border-pink-500/30 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                    Analyzing Image
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Preparing answer...</span>
              </div>

              {/* Photo Scanning Thumbnail & High-Energy Bouncing Dots */}
              <div className="flex items-center gap-3 bg-black/40 rounded-xl p-2.5 border border-white/10">
                {pendingImageUrl ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-pink-500/40 shrink-0 bg-black shadow-md">
                    <img
                      src={pendingImageUrl}
                      alt="Analyzing thumbnail"
                      className="w-full h-full object-cover opacity-85"
                    />
                    {/* Laser Scanner Line */}
                    <div
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,1)] pointer-events-none"
                      style={{ animation: 'laserScan 1.4s ease-in-out infinite' }}
                    />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-pink-400 animate-pulse" />
                  </div>
                )}

                {/* Animated Bouncing Waves & Dots */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {/* 3 Physical Bouncing Colored Dots */}
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.32s] shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.16s] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-100 truncate">
                      Examining image...
                    </span>
                  </div>
                  <span className="text-[11px] text-pink-300 font-sans leading-tight">
                    Molla is carefully reviewing the picture and composing a reply...
                  </span>
                </div>
              </div>

              {/* Bouncing Audio / Soundwave Equalizer Bars */}
              <div className="mt-2.5 flex items-center justify-between px-1">
                <div className="flex items-end gap-1 h-4">
                  <span className="w-1 bg-pink-400 rounded-full animate-bounce h-2 [animation-duration:0.6s]" />
                  <span className="w-1 bg-pink-400 rounded-full animate-bounce h-4 [animation-duration:0.8s] [animation-delay:0.1s]" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3 [animation-duration:0.55s] [animation-delay:0.2s]" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4 [animation-duration:0.75s] [animation-delay:0.3s]" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2.5 [animation-duration:0.65s] [animation-delay:0.15s]" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3.5 [animation-duration:0.9s] [animation-delay:0.25s]" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ANALYZING & ANSWERING...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Regular Molla Typing Indicator (when text-only message is being answered) */}
        {!isAnalyzingImage && isMollaResponding && (
          <div className="flex flex-col items-start mr-auto max-w-[88%] sm:max-w-[82%] animate-in fade-in duration-200">
            <div className="rounded-2xl rounded-tl-xs p-3 shadow-lg bg-[#202c33] border border-pink-500/20 text-slate-100 flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.32s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.16s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              </div>
              <span className="text-[12px] text-slate-300">Molla is preparing a reply...</span>
            </div>
          </div>
        )}

        {/* Auto scroll anchor */}
        <div ref={bottomAnchorRef} className="h-2" />
      </div>
    </div>
  );
};
