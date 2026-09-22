import React from 'react';
import { ConnectionState, AuraConfig } from '../types';
import { Phone, PhoneOff } from 'lucide-react';

interface ControlBarProps {
  state: ConnectionState;
  aura: AuraConfig;
  onToggleCall: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  state,
  aura,
  onToggleCall,
}) => {
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';

  return (
    <div className="w-full max-w-sm mx-auto px-4 pb-8 select-none flex flex-col items-center justify-center">
      {/* Central Circular Call Button */}
      <button
        id="call-action-btn"
        onClick={onToggleCall}
        disabled={isConnecting}
        aria-label={isConnected ? 'End voice call' : 'Start voice call'}
        className="relative group focus:outline-none flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
      >
        {/* Glowing backdrop shadow */}
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-300 pointer-events-none"
          style={{
            backgroundColor: isConnected
              ? '#f43f5e'
              : '#22c55e',
            opacity: isConnected ? 0.4 : 0.25,
          }}
        />

        {/* Circular Button Body */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-2xl"
          style={{
            backgroundColor: isConnected
              ? '#4c0519'
              : isConnecting
              ? '#1c1917'
              : '#053822',
            borderColor: isConnected
              ? '#f43f5e'
              : isConnecting
              ? '#f59e0b'
              : '#22c55e',
            boxShadow: isConnected
              ? '0 0 28px rgba(244, 63, 94, 0.4)'
              : '0 0 28px rgba(34, 197, 94, 0.35)',
          }}
        >
          {isConnecting ? (
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <PhoneOff className="w-10 h-10 text-rose-400" />
          ) : (
            <Phone className="w-10 h-10 text-emerald-400" />
          )}
        </div>
      </button>

      {/* Label directly underneath matching the screenshot */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: isConnected
              ? '#f43f5e'
              : isConnecting
              ? '#f59e0b'
              : '#84cc16',
            boxShadow: isConnected
              ? '0 0 8px #f43f5e'
              : '0 0 8px #84cc16',
          }}
        />
        <span className="text-xs sm:text-[13px] font-bold tracking-widest text-slate-200 uppercase font-mono">
          {isConnected ? 'END CALL' : isConnecting ? 'CONNECTING...' : 'TAP TO CALL'}
        </span>
      </div>
    </div>
  );
};
