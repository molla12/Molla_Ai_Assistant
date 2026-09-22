import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Lock,
  ChevronRight,
  Lightbulb,
  Check,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaScreenLockConfig,
  loadScreenLockConfig,
  saveScreenLockConfig,
} from './mayaStorage';

interface MayaScreenLockDetailViewProps {
  onBack: () => void;
  onOpenNotifications: () => void;
  onOpenPatternPin: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaScreenLockDetailView: React.FC<MayaScreenLockDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  onOpenPatternPin,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaScreenLockConfig>(() => loadScreenLockConfig());
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    saveScreenLockConfig(config);
  }, [config]);

  const updateConfig = <K extends keyof MayaScreenLockConfig>(
    key: K,
    value: MayaScreenLockConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1400);
  };

  const getUnlockStatusSubtitle = () => {
    if (config.unlockForMe) {
      if (config.pinCode) return 'Active — unlocking via PIN';
      if (config.patternDots && config.patternDots.length > 0)
        return 'Active — unlocking via Pattern';
      return 'On — needs pattern or PIN below';
    }
    return "Off — she'll ask you to unlock";
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col select-none overflow-hidden animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#090e1b]/90 text-slate-100'
      }`}
    >
      {/* 1. Header with Frosted Glass */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight
            ? 'bg-white/80 border-slate-200/80 shadow-xs'
            : 'bg-[#090e1b]/80 border-white/10 shadow-lg'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl transition-colors cursor-pointer active:scale-95 border ${
            isLight
              ? 'bg-white/90 hover:bg-white text-slate-700 border-slate-200 shadow-xs'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
          }`}
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1
          className={`text-base font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Screen lock
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl transition-colors cursor-pointer relative border ${
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

      {/* Toast */}
      {savedToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3 py-1 rounded-full bg-blue-600/95 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2 flex items-center gap-1.5 pointer-events-none">
          <Check className="w-3 h-3" />
          <span>Saved</span>
        </div>
      )}

      {/* 2. Scrollable Content with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* CARD 1: Waking the screen */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Waking the screen
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                For actions that have to touch the display
              </p>
            </div>
          </div>

          <div
            className={`pt-2 border-t flex items-center justify-between gap-4 ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Wake the screen when she needs it
              </h4>
              <p
                className={`text-[11px] leading-relaxed mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Voice, calls and messages already work locked. This is for actions that must touch the
                screen — she raises Android&apos;s own unlock prompt.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateConfig('wakeTheScreen', !config.wakeTheScreen)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.wakeTheScreen
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.wakeTheScreen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CARD 2: Unlock with your pattern or PIN */}
        <button
          type="button"
          onClick={onOpenPatternPin}
          className={`w-full text-left rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg active:scale-[0.99] ${
            isLight
              ? 'bg-white/85 hover:bg-white border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 hover:bg-[#121c33]/90 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                  isLight
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className={`text-sm font-semibold transition-colors ${
                    isLight
                      ? 'text-slate-900 group-hover:text-blue-600'
                      : 'text-white group-hover:text-blue-300'
                  }`}
                >
                  Unlock with your pattern or PIN
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {getUnlockStatusSubtitle()}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-colors shrink-0 ${
                isLight
                  ? 'text-slate-400 group-hover:text-slate-700'
                  : 'text-slate-500 group-hover:text-white'
              }`}
            />
          </div>
        </button>

        {/* CARD 3: Info Tip Callout */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 flex items-start gap-3.5 shadow-sm ${
            isLight
              ? 'bg-blue-50/70 border-blue-200 text-slate-700'
              : 'bg-[#101a30]/80 border-blue-500/20 text-slate-300'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs leading-relaxed">
            Your password is never stored, and an alphanumeric password can&apos;t be entered by
            Maya at all — Android routes that through a secure keyboard.
          </p>
        </div>
      </div>
    </div>
  );
};
