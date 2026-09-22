import React from 'react';
import {
  ArrowLeft,
  Bell,
  User,
  Headphones,
  Zap,
  Bot,
  Mail,
  Users,
  Share2,
  Cloud,
  Puzzle,
  Network,
  ChevronRight,
  Sparkles,
  Edit3,
  ShieldCheck,
  PhoneCall,
  Eye,
  Hand,
  Lock,
  MessageCircle,
  Clock,
  Shield,
  Brain,
  Moon,
  Sun,
  Laptop,
  HelpCircle,
  Database,
  Palette,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface MayaSettingsViewProps {
  onBack: () => void;
  onOpenPersonal: () => void;
  onOpenItemDetail: (itemKey: string, itemTitle: string) => void;
  onOpenNotifications?: () => void;
  onOpenThemeChooserModal?: () => void;
  themeMode?: 'dark' | 'light' | 'system';
  effectiveTheme?: 'light' | 'dark';
  onSelectThemeMode?: (mode: 'system' | 'light' | 'dark') => void;
  isEdgeLightingEnabled?: boolean;
  onToggleEdgeLighting?: () => void;
}

export const MayaSettingsView: React.FC<MayaSettingsViewProps> = ({
  onBack,
  onOpenPersonal,
  onOpenItemDetail,
  onOpenNotifications,
  onOpenThemeChooserModal,
  themeMode = 'dark',
  effectiveTheme = 'dark',
  onSelectThemeMode,
  isEdgeLightingEnabled = true,
  onToggleEdgeLighting,
}) => {
  const isLight = effectiveTheme === 'light';

  // Glass UI Card Container
  const cardGroupCls = `rounded-[22px] border backdrop-blur-2xl overflow-hidden shadow-xl transition-all ${
    isLight
      ? 'bg-white/80 border-white/90 shadow-[0_10px_35px_rgba(15,23,42,0.06)] divide-y divide-slate-100/90'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_14px_40px_rgba(0,0,0,0.4)] divide-y divide-white/5'
  }`;

  // Interactive Row Button with Glass Glow Hover
  const rowBtnCls = `w-full px-4 py-3.5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer group active:scale-[0.99] select-none ${
    isLight
      ? 'hover:bg-slate-50/90 active:bg-slate-100'
      : 'hover:bg-white/[0.07] active:bg-white/10'
  }`;

  const headingCls = `text-sm font-semibold transition-colors ${
    isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-300'
  }`;

  const descCls = `text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`;

  const chevronCls = `w-4 h-4 transition-transform group-hover:translate-x-0.5 shrink-0 ${
    isLight ? 'text-slate-400 group-hover:text-slate-700' : 'text-slate-500 group-hover:text-white'
  }`;

  const sectionHeaderCls = `text-[11px] font-bold uppercase tracking-wider mb-2 px-1 flex items-center justify-between ${
    isLight ? 'text-slate-500' : 'text-slate-400'
  }`;

  return (
    <div
      id="maya-settings-screen"
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 backdrop-blur-3xl ${
        isLight ? 'bg-slate-100/85 text-slate-900' : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* Specular curved glass light reflection */}
      <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-30" />

      {/* 1. Glass Header */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight ? 'bg-white/80 border-slate-200/80 shadow-xs' : 'bg-[#090e1b]/85 border-white/10 shadow-lg'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Settings
          </h1>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
          }`}>
            Glass UI
          </span>
        </div>

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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>
          <MayaAvatar size="sm" onClick={onBack} />
        </div>
      </header>

      {/* 2. Scrollable Sections List with Glass Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 max-w-xl mx-auto w-full overscroll-contain pb-16">
        
        {/* APPEARANCE & DISPLAY (Prominently featured at top for effortless theme switching) */}
        <div>
          <h2 className={sectionHeaderCls}>
            <span>APPEARANCE & DISPLAY</span>
            <span className="text-[10px] lowercase font-normal opacity-75">glass engine</span>
          </h2>
          <div className={cardGroupCls}>
            {/* Choose Theme (Appearance) */}
            {onOpenThemeChooserModal && (
              <div className="w-full px-4 py-3.5 flex flex-col gap-3">
                <div
                  id="settings-choose-theme-btn"
                  onClick={onOpenThemeChooserModal}
                  className="flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${
                        isLight
                          ? 'bg-amber-100/70 border-amber-200 text-amber-700'
                          : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {themeMode === 'light' ? (
                        <Sun className="w-5 h-5 text-amber-500" />
                      ) : themeMode === 'dark' ? (
                        <Moon className="w-5 h-5 text-purple-400" />
                      ) : (
                        <Laptop className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={headingCls}>
                          Choose Theme (Appearance)
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                            isLight
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {themeMode === 'system'
                            ? 'System default'
                            : themeMode === 'light'
                            ? 'Light glass'
                            : 'Dark obsidian'}
                        </span>
                      </div>
                      <p className={descCls}>
                        {themeMode === 'system'
                          ? 'Synchronized with your device system appearance'
                          : themeMode === 'light'
                          ? 'Clean crystalline frosted glass with bright ambient lighting'
                          : 'Deep obsidian neon glow glass with cyber refractions'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={chevronCls} />
                </div>

                {/* 1-Tap Quick Glass Segment Switcher */}
                <div
                  className={`grid grid-cols-3 gap-1.5 p-1 rounded-2xl border ${
                    isLight ? 'bg-slate-100/90 border-slate-200/80' : 'bg-black/30 border-white/8'
                  }`}
                >
                  {(
                    [
                      { id: 'system', label: 'System', icon: Laptop },
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                    ] as const
                  ).map(({ id, label, icon: Icon }) => {
                    const isActive = themeMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        id={`quick-theme-${id}-btn`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectThemeMode) {
                            onSelectThemeMode(id);
                          } else if (onOpenThemeChooserModal) {
                            onOpenThemeChooserModal();
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                          isActive
                            ? isLight
                              ? 'bg-white text-slate-900 shadow-md border border-slate-200/90'
                              : 'bg-white/20 text-white shadow-[0_0_16px_rgba(255,255,255,0.18)] border border-white/30'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${
                          id === 'light' ? 'text-amber-500' : id === 'dark' ? 'text-purple-400' : 'text-blue-400'
                        }`} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rainbow Edge Lighting */}
            {onToggleEdgeLighting && (
              <div className="w-full px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                      isLight
                        ? 'bg-pink-100/70 border-pink-200 text-pink-700'
                        : 'bg-pink-500/20 border-pink-500/30 text-pink-400'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={headingCls}>Rainbow Edge Lighting</h3>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold border shrink-0 ${
                          isEdgeLightingEnabled
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-500 border-slate-500/30'
                        }`}
                      >
                        {isEdgeLightingEnabled ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className={`${descCls} truncate`}>
                      {isEdgeLightingEnabled
                        ? 'Rainbow neon lighting active on screen edges'
                        : 'Edge lighting disabled'}
                    </p>
                  </div>
                </div>

                <button
                  id="settings-toggle-rainbow-edge-btn"
                  type="button"
                  onClick={onToggleEdgeLighting}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEdgeLightingEnabled ? 'bg-emerald-500' : isLight ? 'bg-slate-300' : 'bg-white/20'
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
            )}
          </div>
        </div>

        {/* SECTION 1: ACCOUNT */}
        <div>
          <h2 className={sectionHeaderCls}>ACCOUNT</h2>
          <div className={cardGroupCls}>
            <button
              type="button"
              onClick={onOpenPersonal}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Personal</h3>
                  <p className={descCls}>Your name, music, Gemini & YouTube keys</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Emergency SOS */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('emergency_sos', 'Emergency SOS')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-red-100/70 border-red-200 text-red-600' : 'bg-red-500/15 border-red-500/25 text-red-400'
                }`}>
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Emergency SOS</h3>
                  <p className={descCls}>Country code, favorite & emergency contacts</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* SECTION 2: ASSISTANT */}
        <div>
          <h2 className={sectionHeaderCls}>ASSISTANT</h2>
          <div className={cardGroupCls}>
            {/* Maya */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('maya_assistant', 'Maya Persona & Voice')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-purple-100/70 border-purple-200 text-purple-600' : 'bg-purple-500/15 border-purple-500/25 text-purple-400'
                }`}>
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Maya</h3>
                  <p className={descCls}>Persona, girlfriend mode, voice, language</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Appearance (Orb style & colors) */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('appearance', 'Appearance')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-cyan-100/70 border-cyan-200 text-cyan-600' : 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400'
                }`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Orb Visual Style</h3>
                  <p className={descCls}>Hologram orbs, cosmic particles & palettes</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Behaviour */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('behaviour', 'Behaviour')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-amber-100/70 border-amber-200 text-amber-600' : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Behaviour</h3>
                  <p className={descCls}>Floating orb, edge glow & screen recording</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Typing */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('typing', 'Typing')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-100/70 border-emerald-200 text-emerald-600' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                }`}>
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Typing</h3>
                  <p className={descCls}>Realistic human typing in editors & speed</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Skills */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('skills', 'Skills')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <Puzzle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Skills</h3>
                  <p className={descCls}>Voice commands, photo share, music DJ</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Sub-agents */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('sub_agents', 'Sub-agents')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-indigo-100/70 border-indigo-200 text-indigo-600' : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Sub-agents</h3>
                  <p className={descCls}>Multi-provider routing, best-first & fallback</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Connectors */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('connectors', 'Connectors')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-teal-100/70 border-teal-200 text-teal-600' : 'bg-teal-500/15 border-teal-500/25 text-teal-400'
                }`}>
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Connectors</h3>
                  <p className={descCls}>Drive, GitHub, Notion, Gmail & Slack</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* SECTION 3: COMMUNICATIONS & SHARING */}
        <div>
          <h2 className={sectionHeaderCls}>COMMUNICATIONS & SHARING</h2>
          <div className={cardGroupCls}>
            {/* Email */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('email', 'Email')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Email</h3>
                  <p className={descCls}>SMTP, signatures & outgoing mail config</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('whatsapp', 'WhatsApp')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-100/70 border-emerald-200 text-emerald-600' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                }`}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>WhatsApp</h3>
                  <p className={descCls}>Group chats & automated reports</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Social Media */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('social_media', 'Social Media')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-rose-100/70 border-rose-200 text-rose-600' : 'bg-rose-500/15 border-rose-500/25 text-rose-400'
                }`}>
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Social Media</h3>
                  <p className={descCls}>Instagram, Facebook & story posts</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Backup */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('backup', 'Backup')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-sky-100/70 border-sky-200 text-sky-600' : 'bg-sky-500/15 border-sky-500/25 text-sky-400'
                }`}>
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Backup</h3>
                  <p className={descCls}>Export, import & cloud state restore</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* SECTION 4: SECURITY & SURVEILLANCE */}
        <div>
          <h2 className={sectionHeaderCls}>SECURITY & SURVEILLANCE</h2>
          <div className={cardGroupCls}>
            {/* Touch Guard */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('touch_guard', 'Touch Guard')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-amber-100/70 border-amber-200 text-amber-600' : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                }`}>
                  <Hand className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Touch Guard</h3>
                  <p className={descCls}>Anti-theft siren, photos & touch alerts</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Screen Lock */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('screen_lock', 'Screen Lock')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-slate-200/70 border-slate-300 text-slate-700' : 'bg-slate-500/15 border-slate-500/25 text-slate-300'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Screen Lock</h3>
                  <p className={descCls}>PIN, pattern & biometric security</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* SECTION 5: AUTOMATION & INTELLIGENCE */}
        <div>
          <h2 className={sectionHeaderCls}>AUTOMATION & INTELLIGENCE</h2>
          <div className={cardGroupCls}>
            {/* Event Triggers */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('event_triggers', 'Event Triggers')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Event triggers</h3>
                  <p className={descCls}>Automate tasks when events happen</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Memories */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('memories', 'Memories')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-violet-100/70 border-violet-200 text-violet-600' : 'bg-violet-500/15 border-violet-500/25 text-violet-400'
                }`}>
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Memories</h3>
                  <p className={descCls}>Facts, preferences & remembered context</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Maya Rules */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('maya_rules', 'Maya Rules')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Maya Rules</h3>
                  <p className={descCls}>Safety boundaries & custom behavioural rules</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* SECTION 6: SYSTEM & PALETTES */}
        <div>
          <h2 className={sectionHeaderCls}>SYSTEM & PALETTES</h2>
          <div className={cardGroupCls}>
            {/* Theme Customizer */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('theme', 'Theme')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-purple-100/70 border-purple-200 text-purple-600' : 'bg-purple-500/15 border-purple-500/25 text-purple-400'
                }`}>
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Surface Styles & Font</h3>
                  <p className={descCls}>Frosted glass, obsidian, typography & corner curve</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Optional APIs */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('optional', 'Optional Features')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-blue-100/70 border-blue-200 text-blue-600' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Optional APIs</h3>
                  <p className={descCls}>Brave, Tavily, Places & Pollinations keys</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>

            {/* Permissions */}
            <button
              type="button"
              onClick={() => onOpenItemDetail('permissions', 'Permissions')}
              className={rowBtnCls}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-100/70 border-emerald-200 text-emerald-600' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={headingCls}>Permissions</h3>
                  <p className={descCls}>Microphone, notifications, camera & storage</p>
                </div>
              </div>
              <ChevronRight className={chevronCls} />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 pb-6 text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
          <span>Maya AI Assistant</span>
          <span>•</span>
          <span>Glass UI Edition</span>
          <span>•</span>
          <span>v4.16.0</span>
        </div>
      </div>
    </div>
  );
};
