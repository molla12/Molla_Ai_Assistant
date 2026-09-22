import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  Check,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadAppearanceConfig,
  saveAppearanceConfig,
  MayaAppearanceConfig,
} from './mayaStorage';

interface MayaAppearanceDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

interface OrbStyleOption {
  id: string;
  name: string;
  subtitle: string;
  renderVisual: (colorHex: string) => React.ReactNode;
}

const COLOR_PALETTES = [
  { id: 'Persona', name: 'Persona', hex: '#3b82f6', glow: '#1d4ed8' },
  { id: 'Jarvis', name: 'Jarvis O...', hex: '#f97316', glow: '#c2410c' },
  { id: 'Ultron', name: 'Ultron B...', hex: '#06b6d4', glow: '#0e7490' },
  { id: 'Neon', name: 'Neon', hex: '#ec4899', glow: '#be185d' },
  { id: 'Toxic', name: 'Toxic', hex: '#22c55e', glow: '#15803d' },
];

const ORB_STYLES: OrbStyleOption[] = [
  {
    id: 'MAYA 2047',
    name: 'MAYA 2047',
    subtitle: 'Her own neon ring',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 animate-spin-slow opacity-80"
          style={{ borderColor: color, animationDuration: '8s' }}
        />
        <div
          className="w-10 h-10 rounded-full border border-dashed opacity-60"
          style={{ borderColor: color }}
        />
        <span className="text-[9px] font-mono font-bold tracking-wider" style={{ color }}>
          MAYA
        </span>
      </div>
    ),
  },
  {
    id: 'Maya Nova',
    name: 'Maya Nova',
    subtitle: 'Cosmic particle core',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border border-dashed animate-spin-reverse opacity-70"
          style={{ borderColor: color, animationDuration: '10s' }}
        />
        <div
          className="absolute w-8 h-8 rounded-full border-2 animate-pulse"
          style={{ borderColor: color }}
        />
        <div
          className="w-4 h-4 rounded-full shadow-lg"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    ),
  },
  {
    id: 'J.A.R.V.I.S.',
    name: 'J.A.R.V.I.S.',
    subtitle: 'Wireframe golden sphere',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="absolute inset-1 rounded-full border border-dashed animate-spin-slow"
          style={{ borderColor: color, animationDuration: '12s' }}
        />
        <div
          className="w-10 h-10 rounded-full border-2 rotate-45"
          style={{ borderColor: color }}
        />
        <span className="text-[8px] font-mono tracking-tighter" style={{ color }}>
          J.A.R.V.I.S.
        </span>
      </div>
    ),
  },
  {
    id: 'Ultron',
    name: 'Ultron',
    subtitle: 'Geometric neural mesh',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="absolute inset-1 border rounded-lg rotate-12 opacity-70"
          style={{ borderColor: color }}
        />
        <div
          className="absolute inset-2 border rounded-lg -rotate-12 opacity-70"
          style={{ borderColor: color }}
        />
        <span className="text-[9px] font-bold tracking-widest" style={{ color }}>
          ULTRON
        </span>
      </div>
    ),
  },
  {
    id: 'Liquid Core',
    name: 'Liquid Core',
    subtitle: 'Organic fluid plasma',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full filter blur-[1px] animate-pulse"
          style={{
            background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0.4) 80%)`,
            borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%',
          }}
        />
        <span className="absolute text-[8px] font-bold text-white tracking-widest">
          CORE
        </span>
      </div>
    ),
  },
  {
    id: 'Pulse Reactor',
    name: 'Pulse Reactor',
    subtitle: 'Concentric sonic rings',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border opacity-40 animate-ping"
          style={{ borderColor: color, animationDuration: '3s' }}
        />
        <div
          className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: color }}
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    ),
  },
  {
    id: 'Particle Swarm',
    name: 'Particle Swarm',
    subtitle: 'Quantum constellation',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="absolute inset-1 rounded-full border border-dotted"
          style={{ borderColor: color }}
        />
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    ),
  },
  {
    id: 'F.R.I.D.A.Y.',
    name: 'F.R.I.D.A.Y.',
    subtitle: 'Hexagonal cyber shield',
    renderVisual: (color) => (
      <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
        <div
          className="w-12 h-12 border-2 flex items-center justify-center transform rotate-45"
          style={{ borderColor: color }}
        />
        <span className="absolute text-[8px] font-mono font-bold" style={{ color }}>
          FRIDAY
        </span>
      </div>
    ),
  },
];

export const MayaAppearanceDetailView: React.FC<MayaAppearanceDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const [config, setConfig] = useState<MayaAppearanceConfig>(loadAppearanceConfig);
  const isLight = effectiveTheme === 'light';

  const update = (partial: Partial<MayaAppearanceConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveAppearanceConfig(next);
      return next;
    });
  };

  const activeColorObj =
    COLOR_PALETTES.find((c) => c.name.startsWith(config.color)) ||
    COLOR_PALETTES[0];

  const cardCls = `rounded-[22px] border backdrop-blur-xl p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/80 border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
      : 'bg-[#0b1120]/75 border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.35)]'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 backdrop-blur-3xl ${
        isLight ? 'bg-slate-100/85 text-slate-900' : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight ? 'bg-white/80 border-slate-200/80' : 'bg-[#090e1b]/85 border-white/10'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Appearance
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>
          <MayaAvatar size="sm" onClick={onBack} />
        </div>
      </header>

      {/* 2. Scrollable Body Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16">
        {/* App Theme (Appearance) Glass Card */}
        <div className={`${cardCls} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                }`}
              >
                {effectiveTheme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Theme & Glass UI Mode
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Choose Light, Dark, or System glass theme
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                isLight
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {effectiveTheme === 'light' ? 'Light Glass' : 'Dark Obsidian'}
            </span>
          </div>

          {/* 3 Theme Options in Glass Cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'system', label: 'System', sub: 'Device auto', icon: Laptop },
              { id: 'light', label: 'Light', sub: 'Crystalline', icon: Sun },
              { id: 'dark', label: 'Dark', sub: 'Obsidian', icon: Moon },
            ].map(({ id, label, sub, icon: Icon }) => {
              const currentSavedMode =
                typeof window !== 'undefined'
                  ? localStorage.getItem('molla_theme_mode') || 'system'
                  : 'system';
              const isSelected = currentSavedMode === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('molla_theme_mode', id);
                    } catch {}
                    const isSysDark =
                      typeof window !== 'undefined' && window.matchMedia
                        ? window.matchMedia('(prefers-color-scheme: dark)').matches
                        : true;
                    const isDark = id === 'system' ? isSysDark : id === 'dark';
                    const root = document.documentElement;
                    if (isDark) {
                      root.classList.add('dark');
                      root.classList.remove('light');
                    } else {
                      root.classList.remove('dark');
                      root.classList.add('light');
                    }
                    if (document.body) {
                      document.body.dataset.theme = isDark ? 'dark' : 'light';
                    }
                    try {
                      window.dispatchEvent(
                        new CustomEvent('molla_theme_changed', {
                          detail: { mode: id, effectiveTheme: isDark ? 'dark' : 'light' },
                        })
                      );
                    } catch {}
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? isLight
                        ? 'bg-white border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-white/15 border-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.25)]'
                      : isLight
                      ? 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-600'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-1.5 ${
                      id === 'light'
                        ? 'text-amber-500'
                        : id === 'dark'
                        ? 'text-purple-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold leading-tight ${
                      isSelected
                        ? isLight
                          ? 'text-slate-900'
                          : 'text-white'
                        : isLight
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight mt-0.5">{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Card: The orb */}
        <div className={`${cardCls} space-y-6`}>
          {/* Card Header */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>The orb</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                How Maya looks on screen
              </p>
            </div>
          </div>

          {/* Section: Orb style horizontal carousel */}
          <div className="space-y-3">
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Orb style
            </span>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {ORB_STYLES.map((style) => {
                const isSelected = config.orbStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => update({ orbStyle: style.id })}
                    className={`flex flex-col items-center p-3 rounded-2xl shrink-0 transition-all cursor-pointer w-28 ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-md shadow-blue-100'
                          : 'bg-[#13223e] border-2 border-blue-500 shadow-lg shadow-blue-900/30'
                        : isLight
                        ? 'bg-slate-50 border border-slate-200 hover:bg-white'
                        : 'bg-[#0a101d] border border-white/5 hover:bg-[#111a2c]'
                    }`}
                  >
                    <div className={`w-20 h-20 rounded-xl border flex items-center justify-center mb-2.5 overflow-hidden ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#070c18] border-white/10'
                    }`}>
                      {style.renderVisual(
                        isSelected ? activeColorObj.hex : '#64748b'
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold tracking-tight text-center truncate w-full ${
                        isSelected ? isLight ? 'text-blue-700' : 'text-white' : isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {style.name}
                    </span>
                    <span className={`text-[9px] text-center line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {style.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Colour Selection */}
          <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Colour
            </span>

            <div className="flex items-center justify-between gap-2 max-w-sm">
              {COLOR_PALETTES.map((pal) => {
                const isSelected =
                  config.color === pal.name || config.color === pal.id;
                return (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => update({ color: pal.name })}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                          : 'opacity-80 group-hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: pal.hex,
                        boxShadow: `0 0 12px ${pal.glow}`,
                      }}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {pal.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Floating orb size slider */}
          <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Floating orb size
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              }`}>
                {config.orbSize} dp
              </span>
            </div>

            <div className="relative flex items-center pt-2">
              <input
                type="range"
                min={120}
                max={260}
                step={10}
                value={config.orbSize}
                onChange={(e) => update({ orbSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            {/* Dotted scale decoration */}
            <div className="flex justify-between px-1">
              {[120, 140, 160, 180, 200, 220, 240, 260].map((val) => (
                <span
                  key={val}
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.orbSize >= val ? 'bg-blue-500' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Section: Use the orb on Home toggle */}
          <div className={`pt-2 border-t flex items-center justify-between gap-4 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <div className="pr-2">
              <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Use the orb on Home
              </span>
              <span className={`text-[11px] leading-relaxed block mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Replace the character with the orb in your chosen style
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.useOrbOnHome}
              onClick={() => update({ useOrbOnHome: !config.useOrbOnHome })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.useOrbOnHome ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.useOrbOnHome ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
