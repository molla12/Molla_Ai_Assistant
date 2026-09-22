import React from 'react';
import { AuraConfig, ConnectionState } from '../types';

interface AuraBackgroundProps {
  aura: AuraConfig;
  state: ConnectionState;
  effectiveTheme?: 'light' | 'dark';
}

export const AuraBackground: React.FC<AuraBackgroundProps> = ({
  aura,
  state,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500 ${
        isLight ? 'bg-slate-100' : 'bg-[#07090e]'
      }`}
    >
      {/* Dynamic radial gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: aura.bgGradient,
          opacity: isLight
            ? state === 'disconnected'
              ? 0.12
              : 0.25
            : state === 'disconnected'
            ? 0.45
            : 0.85,
        }}
      />

      {/* Atmospheric Glass UI Light Glows (Violet, Cyan & Fuchsia refractions matching user screenshot) */}
      <div
        className="absolute -top-24 -right-20 w-[380px] h-[380px] rounded-full blur-[100px] pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.38) 0%, rgba(139,92,246,0.18) 50%, transparent 80%)',
          opacity: isLight ? 0.3 : 0.65,
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-[420px] h-[420px] rounded-full blur-[110px] pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.32) 0%, rgba(59,130,246,0.16) 50%, transparent 80%)',
          opacity: isLight ? 0.25 : 0.6,
        }}
      />
      <div
        className="absolute top-1/3 -left-32 w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(217,70,239,0.12) 50%, transparent 80%)',
          opacity: isLight ? 0.2 : 0.5,
        }}
      />

      {/* Cyber geometric tech grid */}
      <div
        className={`absolute inset-0 ${isLight ? 'opacity-[0.03]' : 'opacity-[0.035]'}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${aura.accentColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${aura.accentColor} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Central glow aura bloom */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[600px] h-[340px] md:h-[600px] rounded-full blur-[110px] pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: aura.glowColor,
          opacity: isLight
            ? state === 'speaking'
              ? 0.35
              : state === 'listening'
              ? 0.22
              : 0.12
            : state === 'speaking'
            ? 0.65
            : state === 'listening'
            ? 0.45
            : 0.25,
          transform: `translate(-50%, -50%) scale(${
            state === 'speaking' ? 1.25 : state === 'listening' ? 1.08 : 0.95
          })`,
        }}
      />

      {/* Subtle vignette */}
      <div
        className={`absolute inset-0 ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(241,245,249,0.9)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,7,11,0.9)_100%)]'
        }`}
      />
    </div>
  );
};
