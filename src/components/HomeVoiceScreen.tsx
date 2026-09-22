import React, { useState, useEffect } from 'react';
import { ConnectionState, AtmosphereConfig } from '../types';
import { AIAvatarOrb } from './AIAvatarOrb';
import { MayaAvatar } from './maya/MayaAvatar';
import { loadAssistantConfig, loadMemories, loadMemorySettings } from './maya/mayaStorage';
import {
  MessageSquare,
  Power,
  Newspaper,
  Copy,
  Check,
  Menu,
  Key,
  Brain,
  Sparkles,
  Heart,
  VolumeX,
  Globe,
} from 'lucide-react';

interface HomeVoiceScreenProps {
  state: ConnectionState;
  currentAura: AtmosphereConfig;
  chatCount: number;
  liveSubtitleText: string;
  liveSubtitleSpeaker: 'molla' | 'user' | null;
  getFrequencyData: () => Uint8Array;
  getVolumeRMS: () => number;
  onOrbClick: () => void;
  onToggleCall: () => void;
  onOpenChat: () => void;
  onOpenOptions: () => void;
  onOpenNews?: () => void;
  onOpenLeftDrawer?: () => void;
  onOpenMemories?: () => void;
  onSelectPrompt?: (prompt: string) => void;
  onOpenKeyModal?: () => void;
  hasApiKey?: boolean;
  isPowerOn?: boolean;
  onTogglePower?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const HomeVoiceScreen: React.FC<HomeVoiceScreenProps> = ({
  state,
  currentAura,
  chatCount,
  liveSubtitleText,
  liveSubtitleSpeaker,
  getFrequencyData,
  getVolumeRMS,
  onOrbClick,
  onToggleCall,
  onOpenChat,
  onOpenOptions,
  onOpenNews,
  onOpenLeftDrawer,
  onOpenMemories,
  onOpenKeyModal,
  hasApiKey = false,
  isPowerOn = true,
  onTogglePower,
  effectiveTheme = 'dark',
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [powerAlert, setPowerAlert] = useState<string | null>(null);
  const [assistantConfig, setAssistantConfig] = useState(() => loadAssistantConfig());
  const [assistantName, setAssistantName] = useState(() => {
    return loadAssistantConfig().assistantName || 'molla';
  });

  const [memoryCount, setMemoryCount] = useState(() => loadMemories().length);
  const [isMemoryProactiveActive, setIsMemoryProactiveActive] = useState(
    () => loadMemorySettings().proactiveQuestionsEnabled
  );
  const [memoryInterval, setMemoryInterval] = useState(
    () => loadMemorySettings().intervalSeconds || 30
  );

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const cfg = e.detail || loadAssistantConfig();
      setAssistantConfig(cfg);
      if (cfg?.assistantName) {
        setAssistantName(cfg.assistantName);
      } else {
        setAssistantName('molla');
      }
    };

    const handleMemoriesUpdate = (e: any) => {
      const mems = e.detail || loadMemories();
      setMemoryCount(mems.length);
    };

    const handleSettingsUpdate = (e: any) => {
      const cfg = e.detail || loadMemorySettings();
      setIsMemoryProactiveActive(cfg.proactiveQuestionsEnabled);
      setMemoryInterval(cfg.intervalSeconds || 30);
    };

    window.addEventListener('maya_assistant_config_updated', handleUpdate);
    window.addEventListener('maya_memories_updated', handleMemoriesUpdate);
    window.addEventListener('maya_memory_settings_updated', handleSettingsUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('maya_assistant_config_updated', handleUpdate);
      window.removeEventListener('maya_memories_updated', handleMemoriesUpdate);
      window.removeEventListener('maya_memory_settings_updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isLight = effectiveTheme === 'light';
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';

  const handleCopyCaptions = () => {
    const textToCopy =
      liveSubtitleText ||
      'Start talking or listening, real-time captions will appear here...';
    navigator.clipboard.writeText(textToCopy).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  // Power button click/touch handler: reliably toggles master power
  const handlePowerButtonClick = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPowerAlert(null);
    if (onTogglePower) {
      onTogglePower();
    }
  };

  // Center Orb tap handler: STRICTLY gated by isPowerOn
  const handleCenterOrbClick = () => {
    if (!isPowerOn) {
      setPowerAlert('Power is OFF. Please turn on the power button below first.');
      setTimeout(() => setPowerAlert(null), 3500);
      return;
    }
    onOrbClick();
  };

  return (
    <div
      className="relative w-full h-full max-h-full flex flex-col justify-between select-none overflow-hidden touch-none"
      style={{
        overscrollBehavior: 'none',
      }}
    >
      {/* 1. Top Bar */}
      <header
        className={`relative z-30 w-full px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shrink-0 border-b backdrop-blur-2xl transition-colors duration-250 ${
          isLight
            ? 'bg-white/75 border-slate-200/80 shadow-xs'
            : 'bg-[#090e1b]/75 border-white/10 shadow-lg'
        }`}
      >
        {/* Left: Menu Trigger Button + Brand Star Icon + molla title */}
        <div className="flex items-center gap-2.5">
          {/* Menu Trigger Button right next to logo */}
          <button
            id="home-left-slide-btn"
            type="button"
            onClick={onOpenLeftDrawer}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs backdrop-blur-xl ${
              isLight
                ? 'bg-white/85 hover:bg-white border-white/90 text-slate-700 hover:text-slate-900 shadow-slate-200/50'
                : 'bg-white/10 hover:bg-white/18 border-white/15 text-slate-200 hover:text-white'
            }`}
            title="Open Maya Slide Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <MayaAvatar
            size="md"
            onClick={onOpenLeftDrawer}
            className="rounded-xl shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          />

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onOpenLeftDrawer}
            title="Open Maya Slide Menu"
          >
            <span
              className={`text-lg font-bold tracking-tight font-display transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {assistantName}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/25'
              }`}
            >
              Glass UI
            </span>
          </div>
        </div>

        {/* Right: Quick News Button & Gemini API Key Button */}
        <div className="flex items-center gap-2">
          {/* Quick API Key Button */}
          {onOpenKeyModal && (
            <button
              id="home-gemini-key-btn"
              type="button"
              onClick={onOpenKeyModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all cursor-pointer backdrop-blur-xl shadow-xs active:scale-95 ${
                !hasApiKey
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300 animate-pulse'
                  : isLight
                  ? 'bg-blue-50/90 hover:bg-blue-100 border-blue-200 text-blue-700'
                  : 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-300 hover:text-white'
              }`}
              title="Google Gemini API Key (Real-time natural voice)"
            >
              <Key className={`w-3.5 h-3.5 ${!hasApiKey ? 'text-amber-400' : 'text-blue-400'}`} />
              <span>{!hasApiKey ? 'Add API Key' : 'API Key'}</span>
            </button>
          )}

          {/* Quick News Button */}
          {onOpenNews && (
            <button
              id="home-quick-news-btn"
              type="button"
              onClick={onOpenNews}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all cursor-pointer backdrop-blur-xl shadow-xs active:scale-95 ${
                isLight
                  ? 'bg-rose-50/90 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 hover:text-white'
              }`}
              title="Google News Live"
            >
              <Newspaper className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">News</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Center: Molla Orb with Particles & Orbit Rings */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-0 py-1">
        <AIAvatarOrb
          state={state}
          aura={currentAura}
          getFrequencyData={getFrequencyData}
          getVolumeRMS={getVolumeRMS}
          onOrbClick={handleCenterOrbClick}
          isPowerOn={isPowerOn}
          isLight={isLight}
        />

        {/* Helper prompt for voice start */}
        <div className="mt-1 text-center px-4 max-w-md">
          <p
            className={`text-xs sm:text-[13px] font-medium transition-colors ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {!isPowerOn ? (
              <span className="text-amber-500 dark:text-amber-400 font-semibold">
                Power is OFF • Turn on power button below
              </span>
            ) : isConnecting ? (
              'Connecting...'
            ) : isConnected ? (
              state === 'speaking' ? (
                <span className="inline-flex items-center gap-1.5 text-rose-500 dark:text-rose-400 font-semibold animate-pulse">
                  <VolumeX className="w-3.5 h-3.5" />
                  বলা থামাতে ট্যাপ করুন (Tap to Stop Speaking)
                </span>
              ) : (
                'Voice Active • Speak freely'
              )
            ) : (
              'Tap center orb to start speaking'
            )}
          </p>

          {powerAlert && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-semibold shadow-md animate-bounce">
              <span>⚠️</span>
              <span>{powerAlert}</span>
            </div>
          )}

          {/* Active Girlfriend Mode & Language Indicators */}
          {isPowerOn && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {assistantConfig.girlfriendMode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 shadow-xs">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                  <span>গার্লফ্রেন্ড মোড সক্রিয় ({assistantConfig.romanticStyle || 'Sweet & Caring'} • &quot;{assistantConfig.petName || 'Sweetheart'}&quot;)</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 shadow-xs">
                <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                <span>ভাষা: {assistantConfig.language ? assistantConfig.language.split('—')[0].trim() : 'বাংলা (Bengali)'}</span>
              </span>
            </div>
          )}

          {/* Proactive Memory Check-in & Automatic Recall Status Pill */}
          {isPowerOn && (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={onOpenMemories}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-xl transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                  isMemoryProactiveActive && memoryCount > 0
                    ? isLight
                      ? 'bg-indigo-50/90 border-indigo-200 text-indigo-900 shadow-indigo-100/50'
                      : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 shadow-indigo-950/40'
                    : isLight
                      ? 'bg-slate-100/80 border-slate-200 text-slate-600'
                      : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Open Memory Settings"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  {isMemoryProactiveActive && memoryCount > 0
                    ? `স্মৃতি (Memories): ${memoryCount} টি তথ্য • অটোমেটিক বলবে`
                    : `স্মৃতি (Memories): ${memoryCount} টি তথ্য`}
                </span>
                {isMemoryProactiveActive && memoryCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Captions / Subtitle Box with Frosted Glass UI */}
      <div className="w-full max-w-xl mx-auto px-4 mb-2.5 z-20 shrink-0">
        <div
          className={`relative rounded-[22px] border backdrop-blur-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 min-h-[76px] flex flex-col justify-center ${
            isLight
              ? 'bg-white/80 border-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.08)] text-slate-900'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_14px_45px_rgba(0,0,0,0.45)] text-white'
          }`}
        >
          {/* Specular top sheen line */}
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          {/* Corner Copy Button */}
          <button
            id="copy-live-caption-btn"
            type="button"
            onClick={handleCopyCaptions}
            className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium border backdrop-blur-xl ${
              isLight
                ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-white/10 hover:bg-white/18 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Copy captions"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          {/* Subtitle text */}
          {!liveSubtitleText ? (
            <p
              className={`text-center text-xs italic font-normal tracking-wide px-4 leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400/90'
              }`}
            >
              Start talking or listening, real-time captions will appear here...
            </p>
          ) : (
            <div className="flex flex-col pr-10">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider font-mono"
                  style={{
                    color: liveSubtitleSpeaker === 'molla' ? '#f43f5e' : '#0ea5e9',
                  }}
                >
                  {liveSubtitleSpeaker === 'molla' ? 'Molla' : 'You'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p
                className={`text-xs sm:text-[13px] font-medium leading-relaxed max-h-14 overflow-y-auto scrollbar-thin ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}
              >
                {liveSubtitleText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Controls: Power Button + Chat Button in Frosted Glass Dock */}
      <footer className="relative z-20 w-full flex flex-col items-center justify-center shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          className={`px-5 py-2.5 rounded-full border backdrop-blur-2xl shadow-xl flex items-center justify-center gap-5 transition-all ${
            isLight
              ? 'bg-white/80 border-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.08)]'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_14px_45px_rgba(0,0,0,0.45)]'
          }`}
        >
          {/* Circular Power Button */}
          <div className="flex flex-col items-center">
            <button
              id="home-main-power-btn"
              type="button"
              onClick={handlePowerButtonClick}
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePowerButtonClick(e);
              }}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-250 cursor-pointer active:scale-95 border-[2.5px] select-none touch-manipulation ${
                isPowerOn
                  ? 'bg-[#0d1622] border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.55)]'
                  : isLight
                  ? 'bg-slate-200/90 border-slate-300 shadow-md hover:border-emerald-500'
                  : 'bg-[#121824]/90 border-slate-600/70 shadow-md hover:border-emerald-500'
              }`}
              title={
                isPowerOn
                  ? 'Turn power OFF (shuts down voice assistant)'
                  : 'Turn power ON (enables center orb to talk)'
              }
            >
              {isConnecting ? (
                <div className="w-7 h-7 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Power
                  className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                    isPowerOn
                      ? 'text-[#00e676]'
                      : isLight
                      ? 'text-slate-500 hover:text-emerald-600'
                      : 'text-slate-500 hover:text-emerald-400'
                  }`}
                  strokeWidth={2.7}
                />
              )}
            </button>
          </div>

          {/* Chat Icon Button */}
          <button
            id="home-switch-chat-btn"
            type="button"
            onClick={onOpenChat}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl border flex items-center justify-center shadow-lg transition-all duration-150 cursor-pointer active:scale-95 backdrop-blur-xl ${
              isLight
                ? 'bg-white/90 hover:bg-white border-white/90 text-slate-700 hover:text-slate-900 shadow-slate-200/60'
                : 'bg-[#1b2230]/90 hover:bg-[#252f42] border-white/15 text-slate-300 hover:text-white'
            }`}
            title="Open chatbox"
          >
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Status text label under Power Button in Glass Pill */}
        <div
          className={`mt-2.5 px-3 py-1 rounded-full border backdrop-blur-xl flex items-center gap-2 ${
            isLight
              ? 'bg-white/70 border-slate-200/70 shadow-xs'
              : 'bg-[#0b1120]/70 border-white/10 shadow-md'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              !isPowerOn
                ? 'bg-slate-500'
                : isConnected
                ? 'bg-rose-500 animate-ping'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span
            className={`text-[11px] sm:text-xs font-semibold tracking-wider uppercase font-mono ${
              isLight ? 'text-slate-800' : 'text-white/90'
            }`}
          >
            {!isPowerOn
              ? 'POWER OFF'
              : isConnected
              ? 'VOICE ACTIVE'
              : 'POWER ON (READY)'}
          </span>
        </div>
      </footer>
    </div>
  );
};
