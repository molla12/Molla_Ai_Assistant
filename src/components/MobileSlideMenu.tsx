import React, { useState } from 'react';
import {
  AtmosphereConfig,
  AtmosphereTheme,
  VoiceOption,
  LanguageCode,
  ConnectionState,
} from '../types';
import { ATMOSPHERE_THEMES, VOICE_OPTIONS, LANGUAGES } from '../constants/auras';
import { VoiceGenderSlider } from './VoiceGenderSlider';
import {
  X,
  Palette,
  Volume2,
  Globe,
  Subtitles,
  Smartphone,
  BookOpen,
  MessageSquare,
  Check,
  Power,
  Sparkles,
  ChevronDown,
  Search,
  Newspaper,
} from 'lucide-react';

interface MobileSlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  state: ConnectionState;
  isPoweredOn: boolean;
  onTogglePower: () => void;
  currentAura: AtmosphereConfig;
  onAuraSelect: (theme: AtmosphereTheme) => void;
  currentVoice: VoiceOption;
  onVoiceSelect: (voice: VoiceOption) => void;
  currentLanguage: LanguageCode;
  onLanguageSelect: (lang: LanguageCode) => void;
  subtitlesEnabled: boolean;
  onToggleSubtitles: () => void;
  onOpenChat: () => void;
  chatOpen?: boolean;
  messageCount?: number;
  onOpenInstallModal?: () => void;
  onOpenPersonaDrawer: () => void;
  onOpenNews?: () => void;
}

export const MobileSlideMenu: React.FC<MobileSlideMenuProps> = ({
  isOpen,
  onClose,
  state: _state,
  isPoweredOn,
  onTogglePower,
  currentAura,
  onAuraSelect,
  currentVoice,
  onVoiceSelect,
  currentLanguage,
  onLanguageSelect,
  subtitlesEnabled,
  onToggleSubtitles,
  onOpenChat,
  messageCount = 0,
  onOpenInstallModal,
  onOpenPersonaDrawer,
  onOpenNews,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  if (!isOpen) return null;

  const activeLangConfig =
    LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];
  const activeVoiceConfig =
    VOICE_OPTIONS.find((v) => v.id === currentVoice) || VOICE_OPTIONS[0];

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full bg-[#0a0d16] border-l border-white/10 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                borderColor: currentAura.accentColor + '55',
                backgroundColor: currentAura.accentColor + '15',
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: currentAura.accentColor }} />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white tracking-wide">
                Quick Options
              </h2>
              <p className="text-[11px] text-slate-400">Settings & Customization</p>
            </div>
          </div>
          <button
            id="close-slide-menu-btn"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Options Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-slate-200 scrollbar-thin scrollbar-thumb-white/10">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Master Power Toggle */}
            <button
              id="slide-power-toggle-btn"
              onClick={() => {
                onTogglePower();
              }}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-start justify-between gap-2 text-left ${
                isPoweredOn
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Power
                  className={`w-5 h-5 ${
                    isPoweredOn ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                    isPoweredOn
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isPoweredOn ? 'ON' : 'OFF'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold">Master Power</p>
                <p className="text-[10px] text-slate-400">
                  {isPoweredOn ? 'System ready' : 'Power is off'}
                </p>
              </div>
            </button>

            {/* Chat Box Shortcut */}
            <button
              id="slide-chat-toggle-btn"
              onClick={() => {
                onClose();
                onOpenChat();
              }}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex flex-col items-start justify-between gap-2 text-left group"
            >
              <div className="flex items-center justify-between w-full">
                <MessageSquare className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                {messageCount > 0 && (
                  <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
                    {messageCount} msgs
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold">Chat Box</p>
                <p className="text-[10px] text-slate-400">View text history</p>
              </div>
            </button>
          </div>

          {/* Subtitles toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <Subtitles className="w-5 h-5 text-slate-300" />
              <div>
                <p className="text-xs font-semibold text-white">Live Subtitles</p>
                <p className="text-[10px] text-slate-400">Show speech captions on screen</p>
              </div>
            </div>
            <button
              id="slide-subtitles-toggle-btn"
              onClick={onToggleSubtitles}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                subtitlesEnabled ? 'bg-rose-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  subtitlesEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* DROPDOWN 1: ATMOSPHERE THEME */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all">
            <button
              id="dropdown-toggle-atmosphere"
              type="button"
              onClick={() => {
                setThemeDropdownOpen((prev) => !prev);
                setVoiceDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: currentAura.accentColor + '20',
                    borderColor: currentAura.accentColor + '40',
                  }}
                >
                  <Palette className="w-4 h-4" style={{ color: currentAura.accentColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    ATMOSPHERE THEME
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: currentAura.accentColor }}
                    />
                    <span className="text-[11px] text-slate-400">{currentAura.name}</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  themeDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Options */}
            {themeDropdownOpen && (
              <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
                {Object.values(ATMOSPHERE_THEMES).map((theme) => {
                  const isSelected = currentAura.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onAuraSelect(theme.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-white/15 text-white border border-white/20 shadow-md'
                          : 'border border-transparent bg-white/[0.02] text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-sm"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SLIDING VOICE SELECTOR (Female Voice / Male Voice) */}
          <VoiceGenderSlider
            currentVoice={currentVoice}
            onVoiceChange={onVoiceSelect}
            accentColor={currentAura.accentColor}
            currentLanguage={currentLanguage}
          />

          {/* DROPDOWN 2: DETAILED VOICE PERSONAS */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all">
            <button
              id="dropdown-toggle-voice"
              type="button"
              onClick={() => {
                setVoiceDropdownOpen((prev) => !prev);
                setThemeDropdownOpen(false);
                setLangDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{
                    backgroundColor: currentAura.accentColor + '20',
                    borderColor: currentAura.accentColor + '40',
                  }}
                >
                  <Volume2 className="w-4 h-4" style={{ color: currentAura.accentColor }} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Detailed Voice List (All Voices)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {activeVoiceConfig.name}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  voiceDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Options */}
            {voiceDropdownOpen && (
              <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
                {VOICE_OPTIONS.map((v) => {
                  const isSelected = currentVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        onVoiceSelect(v.id);
                        setVoiceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-white/15 text-white border border-white/20'
                          : 'border border-transparent bg-white/[0.02] text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-white">{v.name}</div>
                        <div className="text-[10px] text-slate-400">{v.tone}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DROPDOWN 3: SPOKEN LANGUAGE (INDIAN LANGUAGES ONLY) */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all">
            <button
              id="dropdown-toggle-language"
              type="button"
              onClick={() => {
                setLangDropdownOpen((prev) => !prev);
                setThemeDropdownOpen(false);
                setVoiceDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: currentAura.accentColor + '20',
                    borderColor: currentAura.accentColor + '40',
                  }}
                >
                  <Globe className="w-4 h-4" style={{ color: currentAura.accentColor }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      SPOKEN ACCENT & DIALECT
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
                    <span>{activeLangConfig.flag}</span>
                    <span className="font-semibold text-slate-200">{activeLangConfig.name}</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                  langDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Options */}
            {langDropdownOpen && (
              <div className="px-3 pb-3 pt-2 space-y-2 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search / Filter Languages */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder="Search dialects (English US, UK...)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-400/50"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10 pr-1">
                  {filteredLanguages.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageSelect(lang.code);
                          setLangDropdownOpen(false);
                          setLangSearch('');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'border border-transparent bg-white/[0.02] text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{lang.flag}</span>
                          <div className="text-left min-w-0">
                            <div className="font-semibold truncate">{lang.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {lang.nativeName}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                  {filteredLanguages.length === 0 && (
                    <p className="text-center text-xs text-slate-500 py-3">
                      No matching language dialect found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Apps & Guides Section */}
          <div className="pt-2 space-y-2 border-t border-white/10">
            {/* Live Google News Reader */}
            {onOpenNews && (
              <button
                id="slide-open-news-btn"
                onClick={() => {
                  onClose();
                  onOpenNews();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4 text-amber-400" />
                  <span>Live Google News</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  Live
                </span>
              </button>
            )}

            {/* Install Android PWA Button */}
            {onOpenInstallModal && (
              <button
                id="slide-install-app-btn"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Install on Android / Mobile</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">
                  PWA / APK
                </span>
              </button>
            )}

            {/* Persona & Secret Commands Drawer */}
            <button
              id="slide-open-guide-btn"
              onClick={() => {
                onClose();
                onOpenPersonaDrawer();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-300" />
                <span>Molla Guide & Features</span>
              </div>
              <span className="text-[10px] text-slate-400">Commands & Tips</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] text-center text-[11px] text-slate-500">
          Molla AI · Real-time Voice Companion
        </div>
      </div>
    </div>
  );
};
