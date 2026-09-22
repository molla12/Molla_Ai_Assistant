import React from 'react';
import { AuraConfig, AuraMood, VoiceOption, LanguageCode } from '../types';
import { LANGUAGES } from '../constants/auras';
import { VoiceGenderSlider } from './VoiceGenderSlider';
import {
  X,
  Sparkles,
  Flame,
  Globe,
  Palette,
  Clock,
  Compass,
  Zap,
  ExternalLink,
  MessageSquareHeart,
  Languages,
  Smartphone,
  Download,
  Volume2,
} from 'lucide-react';

interface PersonaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  aura: AuraConfig;
  onSelectTheme: (mood: AuraMood) => void;
  onTestOpenSite: (url: string, name: string) => void;
  currentVoice?: VoiceOption;
  onVoiceSelect?: (voice: VoiceOption) => void;
  currentLanguage?: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onOpenInstallModal?: () => void;
}

export const PersonaDrawer: React.FC<PersonaDrawerProps> = ({
  isOpen,
  onClose,
  aura,
  onSelectTheme,
  onTestOpenSite,
  currentVoice = 'Aoede',
  onVoiceSelect,
  currentLanguage = 'bn',
  onSelectLanguage,
  onOpenInstallModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-[#090c15] border-l border-white/10 text-white flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
        style={{ borderLeftColor: aura.accentColor + '55' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: aura.accentColor + '20',
                borderColor: aura.accentColor + '50',
                boxShadow: `0 0 15px ${aura.glowColor}`,
              }}
            >
              <Flame className="w-5 h-5" style={{ color: aura.accentColor }} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display tracking-tight flex items-center gap-2">
                Settings & Guide
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-rose-300">
                  AI Companion
                </span>
              </h2>
              <p className="text-xs text-slate-400">Voice settings, character traits & tools</p>
            </div>
          </div>
          <button
            id="close-persona-drawer-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* SECTION 1: PRIMARY VOICE SETTING (Sliding Female / Male Voice Selector) */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2.5">
              <Volume2 className="w-3.5 h-3.5" style={{ color: aura.accentColor }} />
              <span>Primary Voice Setting</span>
            </div>

            {onVoiceSelect && (
              <VoiceGenderSlider
                currentVoice={currentVoice}
                onVoiceChange={onVoiceSelect}
                accentColor={aura.accentColor}
                currentLanguage={currentLanguage}
              />
            )}
          </div>

          {/* Android Mobile Install Banner */}
          {onOpenInstallModal && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-emerald-900/30 border border-emerald-500/40 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      Install on Mobile Phone
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-semibold">
                        PWA / App
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Fullscreen standalone mobile app experience.
                    </p>
                  </div>
                </div>
              </div>
              <button
                id="drawer-open-install-btn"
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Installation Guide & 1-Click Install</span>
              </button>
            </div>
          )}

          {/* Section 2: Character Traits */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" style={{ color: aura.accentColor }} />
              <span>Character Persona</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Witty & Sassy</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Never robotic or dull. Molla delivers clever comebacks, charming quips, and lively conversation.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Warm & Playful</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Friendly and charismatic presence with engaging banter, playful teasing, and genuine warmth.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-time Audio</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Low-latency voice streaming at 24kHz. Speak naturally and interrupt at any moment.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Actions</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Opens websites, executes web searches, and controls ambient themes in real time.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Spoken Language Settings */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-3">
              <Languages className="w-3.5 h-3.5" style={{ color: aura.accentColor }} />
              <span>Language & Accent</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Select your preferred English dialect or accent:
              </p>

              {/* Language switcher buttons */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => onSelectLanguage && onSelectLanguage(l.code)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                      currentLanguage === l.code
                        ? 'bg-rose-500/20 border border-rose-500/50 text-white font-semibold shadow-sm'
                        : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Prompt Inspiration */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-3">
              <MessageSquareHeart className="w-3.5 h-3.5" style={{ color: aura.accentColor }} />
              <span>Voice Commands & Prompts</span>
            </div>

            <div className="space-y-3">
              {/* Category: Witty Banter */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] uppercase font-mono tracking-wider text-rose-300 font-semibold">
                  Fun & Witty Banter
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>"Hey Molla, give me a witty compliment!"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>"Molla, why are you so confident and sharp?"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>"Rate my vibe today on a scale of 1 to 10."</span>
                  </li>
                </ul>
              </div>

              {/* Category: Real-Time Browser Control */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] uppercase font-mono tracking-wider text-cyan-300 font-semibold">
                  Live Browser Actions
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>"Open YouTube for me"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>"Launch Spotify in a new tab"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>"Open GitHub"</span>
                  </li>
                </ul>
              </div>

              {/* Category: Atmosphere Themes */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-[11px] uppercase font-mono tracking-wider text-emerald-300 font-semibold">
                  Atmosphere Theme Shifts
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>"Change atmosphere to Cyber Cyan"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>"Switch to Emerald Matrix"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>"Activate Deep Violet aura"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>"Set atmosphere to Sunset Gold"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Live Tool Capabilities */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" style={{ color: aura.accentColor }} />
              <span>Live Tools</span>
            </div>

            <div className="space-y-2.5">
              {/* Tool: openWebsite */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>openWebsite</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Launches requested destination in a new browser tab.
                  </p>
                </div>
                <button
                  onClick={() => onTestOpenSite('https://youtube.com', 'YouTube')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors inline-flex items-center gap-1 shrink-0 ml-2"
                >
                  Test <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Tool: changeAtmosphere */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                    <Palette className="w-3.5 h-3.5 text-pink-400" />
                    <span>changeAtmosphere</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modifies lighting backdrop and visual particle hues.
                  </p>
                </div>
                <button
                  onClick={() => onSelectTheme('cyber-cyan')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors shrink-0 ml-2"
                >
                  Switch Theme
                </button>
              </div>

              {/* Tool: getCurrentTime */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>getCurrentTime</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reports real-time localized time and date information.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-medium px-2 py-0.5 rounded bg-amber-500/10">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 text-center">
          <p className="text-xs text-slate-400">
            Powered by <span className="font-mono text-cyan-300">gemini-3.1-flash-live-preview</span>
          </p>
        </div>
      </div>
    </div>
  );
};
