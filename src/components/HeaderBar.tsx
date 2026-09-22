import React from 'react';
import { ConnectionState, AtmosphereConfig } from '../types';
import { Sparkles, Trash2 } from 'lucide-react';

interface HeaderBarProps {
  state: ConnectionState;
  currentAura: AtmosphereConfig;
  onClearChat?: () => void;
  isTyping?: boolean;
  isVoiceTyping?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  state,
  currentAura,
  onClearChat,
  isTyping = false,
  isVoiceTyping = false,
}) => {
  const getSubStatus = () => {
    if (isVoiceTyping) {
      return '🎙️ Voice typing...';
    }
    if (isTyping) {
      return '✍️ Typing...';
    }
    switch (state) {
      case 'speaking':
        return '🔊 Molla is speaking...';
      case 'listening':
        return '🎙️ Listening live...';
      case 'connecting':
        return 'Connecting...';
      case 'paused':
        return '⏸️ Paused';
      default:
        return 'Online';
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case 'speaking':
        return {
          label: 'SPEAKING',
          color: currentAura.accentColor,
        };
      case 'listening':
        return {
          label: 'LISTENING',
          color: '#10b981',
        };
      case 'connecting':
        return {
          label: 'CONNECTING',
          color: '#f59e0b',
        };
      default:
        return {
          label: 'READY',
          color: '#06b6d4',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="relative z-30 w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#111b21]/70 backdrop-blur-xl">
      {/* WhatsApp Contact Header: Avatar + Molla Name + Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border shadow-lg transition-all duration-300"
            style={{
              borderColor: currentAura.accentColor + '88',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              boxShadow: `0 0 16px ${currentAura.glowColor}`,
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: currentAura.accentColor }} />
          </div>
          {/* Online green indicator dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#111b21]" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-bold text-base text-white tracking-tight">
              Molla AI
            </h1>
            <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.2 rounded bg-pink-500/20 border border-pink-500/30 text-pink-300 font-semibold">
              LIVE
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {getSubStatus()}
          </span>
        </div>
      </div>

      {/* Right controls: Clear chat & status badge */}
      <div className="flex items-center gap-2">
        {onClearChat && (
          <button
            type="button"
            onClick={onClearChat}
            title="Clear chat"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Status pill: e.g. ● READY */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md bg-black/40 shadow-sm"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: status.color,
              boxShadow: `0 0 8px ${status.color}`,
            }}
          />
          <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-200">
            {status.label}
          </span>
        </div>
      </div>
    </header>
  );
};

