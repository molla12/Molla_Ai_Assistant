import React, { useState } from 'react';
import { VoiceOption, LanguageCode, AtmosphereTheme } from '../types';
import { ATMOSPHERE_THEMES } from '../constants/auras';
import {
  X,
  Volume2,
  Globe,
  Palette,
  Trash2,
  Sparkles,
  Check,
  ChevronDown,
  Download,
  Moon,
  ChevronRight,
  Key,
} from 'lucide-react';

interface OptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  voice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  currentTheme: AtmosphereTheme;
  onSelectTheme: (theme: AtmosphereTheme) => void;
  onClearChat: () => void;
  onOpenInstallModal: () => void;
  onOpenThemeChooserModal: () => void;
  onOpenGeminiKeyModal?: () => void;
  themeMode?: 'system' | 'light' | 'dark';
  effectiveTheme?: 'light' | 'dark';
  isEdgeLightingEnabled?: boolean;
  onToggleEdgeLighting?: () => void;
}

const VOICES: { id: VoiceOption; name: string; desc: string }[] = [
  { id: 'Aoede', name: 'Aoede (Natural & Warm)', desc: 'Sweet, lively & expressive real voice' },
  { id: 'Kore', name: 'Kore (Calm & Elegant)', desc: 'Serene, poised & soothing voice' },
  { id: 'Zephyr', name: 'Zephyr (Dynamic & Crisp)', desc: 'Clear, modern & energetic voice' },
  { id: 'Puck', name: 'Puck (Upbeat & Friendly)', desc: 'Playful, enthusiastic & witty voice' },
  { id: 'Fenrir', name: 'Fenrir (Deep & Confident)', desc: 'Resonant, authoritative male voice' },
];

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'en', label: 'English (US)' },
  { code: 'en-in', label: 'English (India)' },
  { code: 'en-gb', label: 'English (UK)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'ar', label: 'Arabic (العربية)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'ru', label: 'Russian (Русский)' },
];

export const OptionsDrawer: React.FC<OptionsDrawerProps> = ({
  isOpen,
  onClose,
  voice,
  onSelectVoice,
  language,
  onSelectLanguage,
  currentTheme,
  onSelectTheme,
  onClearChat,
  onOpenInstallModal,
  onOpenThemeChooserModal,
  onOpenGeminiKeyModal,
  themeMode = 'dark',
  effectiveTheme = 'dark',
  isEdgeLightingEnabled = true,
  onToggleEdgeLighting,
}) => {
  const isLight = effectiveTheme === 'light';
  // Collapsible dropdown state - all closed by default per user request
  const [openSections, setOpenSections] = useState<{
    voice: boolean;
    language: boolean;
    aura: boolean;
  }>({
    voice: false,
    language: false,
    aura: false,
  });

  if (!isOpen) return null;

  const toggleSection = (key: 'voice' | 'language' | 'aura') => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectedVoiceObj = VOICES.find((v) => v.id === voice);
  const selectedLangObj = LANGUAGES.find((l) => l.code === language);
  const selectedThemeObj = ATMOSPHERE_THEMES[currentTheme];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        id="options-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl border-l z-10 animate-in slide-in-from-right duration-300 transition-colors ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200'
            : 'bg-[#111622] text-white border-white/10'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 flex items-center justify-between border-b ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <h2
              className={`font-semibold text-base ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              App Options & Settings
            </h2>
          </div>
          <button
            id="close-options-btn"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          {/* Install App Button matching Screenshot 2 trigger */}
          <button
            id="options-install-app-btn"
            type="button"
            onClick={onOpenInstallModal}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/40 text-left hover:border-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <Download className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Install App</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    App
                  </span>
                </p>
                <p className="text-xs text-emerald-300/80 truncate">
                  Install directly onto your device home screen
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* 1. Voice Dropdown */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all">
            <button
              type="button"
              id="toggle-voice-dropdown-btn"
              onClick={() => toggleSection('voice')}
              className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Molla Voice (VOICE)
                  </h3>
                  <p className="text-[11px] text-rose-400 font-medium">
                    {selectedVoiceObj?.name.split(' ')[0] || voice}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSections.voice ? 'rotate-180 text-rose-400' : ''
                }`}
              />
            </button>

            {openSections.voice && (
              <div className="p-3 pt-1 space-y-1.5 border-t border-white/5 animate-in fade-in duration-200">
                {VOICES.map((v) => {
                  const isSelected = voice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVoice(v.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-500/60 text-white'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{v.name}</p>
                        <p className="text-[11px] text-slate-400">{v.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Language Dropdown */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all">
            <button
              type="button"
              id="toggle-lang-dropdown-btn"
              onClick={() => toggleSection('language')}
              className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Language (LANGUAGE)
                  </h3>
                  <p className="text-[11px] text-cyan-400 font-medium">
                    {selectedLangObj?.label || language}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSections.language ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {openSections.language && (
              <div className="p-3 pt-1 space-y-1.5 border-t border-white/5 animate-in fade-in duration-200">
                {LANGUAGES.map((l) => {
                  const isSelected = language === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => onSelectLanguage(l.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-white'
                          : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-medium">{l.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Theme & Aura Dropdown */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all">
            <button
              type="button"
              id="toggle-aura-dropdown-btn"
              onClick={() => toggleSection('aura')}
              className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Theme & Aura (AURA)
                  </h3>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {selectedThemeObj?.name || currentTheme}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openSections.aura ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {openSections.aura && (
              <div className="p-3 pt-1 space-y-3 border-t border-white/5 animate-in fade-in duration-200">
                {/* Choose theme dialog trigger */}
                <button
                  type="button"
                  id="open-theme-chooser-btn"
                  onClick={onOpenThemeChooserModal}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors cursor-pointer group ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        Choose Theme (Appearance)
                      </p>
                      <p
                        className={`text-[10px] capitalize ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        Active: {themeMode === 'system' ? 'System default' : themeMode}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Aura Color palettes */}
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ATMOSPHERE_THEMES).map((th) => {
                    const isSelected = currentTheme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => onSelectTheme(th.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/15 border-white/40 shadow-sm'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: th.accentColor }}
                        />
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {th.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Edge Screen Lighting Interactive Control (Active / Deactive) */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isEdgeLightingEnabled
                ? 'border-pink-500/30 bg-gradient-to-r from-pink-500/15 via-amber-500/10 to-cyan-500/15'
                : 'border-white/10 bg-white/[0.02]'
            } flex items-center justify-between gap-2`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl p-[1.5px] shrink-0 transition-all ${
                  isEdgeLightingEnabled
                    ? 'bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400'
                    : 'bg-white/10'
                }`}
              >
                <div className="w-full h-full rounded-[10px] bg-[#0c101c] flex items-center justify-center">
                  <Sparkles
                    className={`w-3.5 h-3.5 ${
                      isEdgeLightingEnabled ? 'text-pink-400' : 'text-slate-500'
                    }`}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-white truncate">Rainbow Edge Lighting</p>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border shrink-0 ${
                      isEdgeLightingEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {isEdgeLightingEnabled ? 'ACTIVE' : 'DEACTIVE'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {isEdgeLightingEnabled
                    ? 'Rotates around edge when power is ON'
                    : 'Deactivated (lighting turned off)'}
                </p>
              </div>
            </div>

            {/* Toggle Action Button */}
            <button
              id="toggle-rainbow-edge-lighting-btn"
              type="button"
              onClick={onToggleEdgeLighting}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEdgeLightingEnabled ? 'bg-emerald-500' : 'bg-white/20'
              }`}
              title={isEdgeLightingEnabled ? 'Deactivate Edge Lighting' : 'Activate Edge Lighting'}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEdgeLightingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Gemini API Key Configuration Button */}
          {onOpenGeminiKeyModal && (
            <button
              type="button"
              id="options-gemini-key-btn"
              onClick={() => {
                onClose();
                onOpenGeminiKeyModal();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-98 ${
                isLight
                  ? 'bg-blue-50/80 hover:bg-blue-100 border-blue-200 text-slate-800'
                  : 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                    isLight
                      ? 'bg-blue-100 border-blue-200 text-blue-600'
                      : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                  }`}
                >
                  <Key className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Google Gemini API Key
                  </p>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-blue-300'}`}>
                    Real-time natural voice & live model
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-blue-300'}`} />
            </button>
          )}

          {/* 4. Clear chat messages */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-sm font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat Messages</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

