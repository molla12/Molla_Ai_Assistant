import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  PenTool,
  Layers,
  Check,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadMayaThemeConfig,
  saveMayaThemeConfig,
  MayaThemeConfig,
} from './mayaStorage';

interface MayaThemeDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

interface ThemeOption {
  id: MayaThemeConfig['theme'];
  name: string;
  description: string;
  bgDot: string;
  accentDot: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'Midnight',
    name: 'Midnight',
    description: 'The original. Calm near-black blue, one clear accent.',
    bgDot: '#080d1a',
    accentDot: '#3b82f6',
  },
  {
    id: 'Obsidian',
    name: 'Obsidian',
    description: 'Neutral greys, one cold accent. The most restrained option.',
    bgDot: '#18181b',
    accentDot: '#a1a1aa',
  },
  {
    id: 'Nocturne',
    name: 'Nocturne',
    description: 'Deep indigo with a violet accent. Warmer, still quiet.',
    bgDot: '#17112e',
    accentDot: '#8b5cf6',
  },
  {
    id: 'Ember',
    name: 'Ember',
    description: 'Warm carbon and amber. High contrast, reads well at night.',
    bgDot: '#1a1410',
    accentDot: '#f59e0b',
  },
  {
    id: 'Abyss',
    name: 'Abyss',
    description: 'Deep teal and cyan. Cool, clinical, very dark.',
    bgDot: '#042224',
    accentDot: '#06b6d4',
  },
  {
    id: 'Rosewood',
    name: 'Rosewood',
    description: 'Warm plum and rose. The softest of the dark themes.',
    bgDot: '#250f1e',
    accentDot: '#f43f5e',
  },
  {
    id: 'Daylight',
    name: 'Daylight',
    description: 'Light background. Clean crystalline glass aesthetic.',
    bgDot: '#f1f5f9',
    accentDot: '#2563eb',
  },
];

const TYPEFACES: MayaThemeConfig['typeface'][] = [
  'Inter',
  'System',
  'Serif',
  'Monospace',
  'Handwritten',
];

const SIZES: MayaThemeConfig['size'][] = [
  'Compact',
  'Default',
  'Large',
  'Larger',
];

const STYLES: MayaThemeConfig['surfaceStyle'][] = [
  'Flat',
  'Glass',
  'Soft',
  'Clay',
];

const CORNERS: MayaThemeConfig['surfaceCorners'][] = [
  'Sharp',
  'Soft',
  'Rounded',
  'Pillowy',
];

export const MayaThemeDetailView: React.FC<MayaThemeDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const [config, setConfig] = useState<MayaThemeConfig>(loadMayaThemeConfig);
  const isLight = effectiveTheme === 'light';

  const update = (partial: Partial<MayaThemeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveMayaThemeConfig(next);

      // If user changed theme palette
      if (partial.theme) {
        const isDaylight = partial.theme === 'Daylight';
        const mode = isDaylight ? 'light' : 'dark';
        try {
          localStorage.setItem('molla_theme_mode', mode);
        } catch {}
        const root = document.documentElement;
        if (isDaylight) {
          root.classList.remove('dark');
          root.classList.add('light');
        } else {
          root.classList.add('dark');
          root.classList.remove('light');
        }
        if (document.body) {
          document.body.dataset.theme = mode;
        }
        try {
          window.dispatchEvent(
            new CustomEvent('molla_theme_changed', {
              detail: { mode, effectiveTheme: mode },
            })
          );
        } catch {}
      }

      return next;
    });
  };

  const getThemePreviewColors = () => {
    const active = THEME_OPTIONS.find((t) => t.id === config.theme) || THEME_OPTIONS[0];
    return {
      bg: active.bgDot,
      accent: active.accentDot,
    };
  };

  const previewColors = getThemePreviewColors();

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 backdrop-blur-3xl ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-900'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight
            ? 'bg-white/80 border-slate-200/80 shadow-xs'
            : 'bg-[#090e1b]/80 border-white/10 shadow-lg'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-xs'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Surface &amp; Font
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isLight
                ? 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-xs'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Top Live Preview Container */}
        <div
          className="rounded-[22px] border border-white/15 p-4.5 transition-all duration-300 shadow-xl"
          style={{ backgroundColor: previewColors.bg }}
        >
          <h2 className="text-lg font-bold text-white mb-3">
            Good evening
          </h2>

          <div
            className={`p-4 transition-all duration-300 border ${
              config.surfaceCorners === 'Sharp'
                ? 'rounded-none'
                : config.surfaceCorners === 'Soft'
                ? 'rounded-lg'
                : config.surfaceCorners === 'Pillowy'
                ? 'rounded-3xl'
                : 'rounded-2xl'
            } ${
              config.surfaceStyle === 'Flat'
                ? 'bg-[#131b2e] border-white/5'
                : config.surfaceStyle === 'Soft'
                ? 'bg-[#10192c]/95 border-white/10 shadow-sm'
                : config.surfaceStyle === 'Clay'
                ? 'bg-[#152038] border-white/15 shadow-xl shadow-black/40'
                : 'bg-white/10 backdrop-blur-xl border-white/20 shadow-lg'
            }`}
          >
            <h3 className="text-sm font-bold text-white mb-1">
              Live Preview
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Frosted glass with crystalline specular glare and smooth refractive blur.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
                style={{ backgroundColor: previewColors.accent }}
              >
                Primary Button
              </button>
              <span className="text-xs text-slate-300 font-medium">
                Glass Pill
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Palettes */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-purple-500/15 border-purple-500/25 text-purple-400'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Theme Palette
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Applies globally to the whole application
              </p>
            </div>
          </div>

          <div className={`rounded-2xl border divide-y overflow-hidden ${
            isLight ? 'bg-slate-50 border-slate-200 divide-slate-200' : 'bg-[#070b14]/70 border-white/8 divide-white/5'
          }`}>
            {THEME_OPTIONS.map((theme) => {
              const isSelected = config.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update({ theme: theme.id })}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer group ${
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    {/* Dual-color swatch indicator */}
                    <div className="w-8 h-8 rounded-full border border-white/30 flex overflow-hidden shrink-0 shadow-md">
                      <div
                        className="w-1/2 h-full"
                        style={{ backgroundColor: theme.bgDot }}
                      />
                      <div
                        className="w-1/2 h-full"
                        style={{ backgroundColor: theme.accentDot }}
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-xs font-semibold transition-colors ${
                          isSelected ? 'text-blue-500 font-bold' : isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {theme.name}
                      </h3>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {theme.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Text */}
        <div className={`${cardCls} space-y-3.5`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Text
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Typeface and size
              </p>
            </div>
          </div>

          {/* Typeface Subheading & Chips */}
          <div className="space-y-2 pt-1">
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Typeface
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {TYPEFACES.map((font) => {
                const isSelected = config.typeface === font;
                return (
                  <button
                    key={font}
                    type="button"
                    onClick={() => update({ typeface: font })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {font}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Subheading & Chips */}
          <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Size
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {SIZES.map((s) => {
                const isSelected = config.size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ size: s })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Surfaces */}
        <div className={`${cardCls} space-y-3.5`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400'
            }`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Surfaces & Materials
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                How cards and menus are rendered
              </p>
            </div>
          </div>

          {/* Style Subheading & Chips */}
          <div className="space-y-2 pt-1">
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Style
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STYLES.map((st) => {
                const isSelected = config.surfaceStyle === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => update({ surfaceStyle: st })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Translucent frosted glass with refractive blur and specular edge reflections.
            </p>
          </div>

          {/* Corners Subheading & Chips */}
          <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
            <span className={`text-xs font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Corners
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CORNERS.map((c) => {
                const isSelected = config.surfaceCorners === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ surfaceCorners: c })}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
