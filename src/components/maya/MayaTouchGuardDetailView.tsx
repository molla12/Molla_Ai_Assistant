import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Hand,
  Shield,
  ShieldCheck,
  Info,
  Scan,
  Clock,
  Check,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaTouchGuardConfig,
  loadTouchGuardConfig,
  saveTouchGuardConfig,
} from './mayaStorage';

interface MayaTouchGuardDetailViewProps {
  onBack: () => void;
  onOpenNotifications: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaTouchGuardDetailView: React.FC<MayaTouchGuardDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaTouchGuardConfig>(() => loadTouchGuardConfig());
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    saveTouchGuardConfig(config);
  }, [config]);

  const updateConfig = <K extends keyof MayaTouchGuardConfig>(
    key: K,
    value: MayaTouchGuardConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1400);
  };

  const getSensitivityText = () => {
    if (config.movementSensitivity === 'Low') return 'Low — picking up or significant movement';
    if (config.movementSensitivity === 'High') return 'High — any slight table vibration or touch';
    return 'Medium — a deliberate nudge';
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
          Touch Guard
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
        {/* CARD 1: Touch Guard */}
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
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Touch Guard
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Watch the phone while you are away from it
              </p>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            When armed, anyone who wakes the screen, picks the phone up or pulls the charger out gets
            photographed with the front camera. Maya then tells you out loud that someone touched your
            phone, warns whoever is holding it, and sounds a siren.
          </p>

          <div
            className={`pt-2 border-t space-y-4 ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            {/* Enable Touch Guard Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Enable Touch Guard
                </h4>
                <p
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Off by default. Nothing below does anything until this is on.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('enabled', !config.enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  config.enabled
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                    config.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Arm the guard Toggle */}
            <div
              className={`flex items-center justify-between gap-4 pt-2 border-t ${
                isLight ? 'border-slate-200/70' : 'border-white/5'
              }`}
            >
              <div className="flex-1">
                <h4
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Arm the guard
                </h4>
                <p
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Say &quot;touch guard on karo&quot; to arm it without opening this screen. You get 12
                  seconds to put the phone down before it starts watching.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('armTheGuard', !config.armTheGuard)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  config.armTheGuard
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                    config.armTheGuard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: God Mode */}
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
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-red-500/15 border-red-500/25 text-red-400'
              }`}
            >
              <Shield className="w-4 h-4 fill-current/20" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                God Mode
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                For a passcode someone else already knows
              </p>
            </div>
          </div>

          <div
            className={`space-y-2 text-xs leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <p
              className={`font-medium ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              The strictest tier. Your voice becomes the only key:
            </p>
            <ul className="space-y-1.5 pl-3 list-disc marker:text-red-500">
              <li>
                Unlocking the phone does NOT switch the guard off — even for someone who knows your
                PIN, pattern or password. A successful unlock is itself treated as a touch.
              </li>
              <li>
                Every touch is photographed, warned and sirened immediately — no first warning, no
                stealth, no waiting for a second strike.
              </li>
              <li>
                The siren is a short 7-second burst that repeats on every touch, rather than one
                long alarm.
              </li>
              <li>
                It can be turned ON by voice, but never OFF by voice. Only here.
              </li>
            </ul>
          </div>

          <div
            className={`pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  God Mode
                </h4>
                <p
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Only your voice can disarm. A known passcode is worth nothing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('godMode', !config.godMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  config.godMode
                    ? 'bg-red-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                    config.godMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Switching it off */}
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
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Switching it off
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Who Maya will accept a disarm from
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Recognise my voice */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Recognise my voice
                </h4>
                <p
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Maya checks the voice against your enrolled voiceprint before disarming. Someone else
                  asking is refused, photographed and logged.
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('recogniseMyVoice', !config.recogniseMyVoice)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  config.recogniseMyVoice
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                    config.recogniseMyVoice ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p
              className={`text-xs pt-2 border-t ${
                isLight
                  ? 'text-slate-500 border-slate-200/70'
                  : 'text-slate-400 border-white/5'
              }`}
            >
              Unlocking the phone always disarms it — getting past your own lock screen is proof
              enough. Except in God Mode, where it is not.
            </p>

            {/* Let anyone disarm */}
            <div
              className={`flex items-center justify-between gap-4 pt-2 border-t ${
                isLight ? 'border-slate-200/70' : 'border-white/5'
              }`}
            >
              <div className="flex-1">
                <h4
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Let anyone disarm by voice while locked
                </h4>
                <p
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Only for phones with no voiceprint enrolled.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateConfig('letAnyoneDisarmWhileLocked', !config.letAnyoneDisarmWhileLocked)
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  config.letAnyoneDisarmWhileLocked
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                    config.letAnyoneDisarmWhileLocked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: What happens on a touch */}
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
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                What happens on a touch
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                In order: re-lock, photograph, warn, siren
              </p>
            </div>
          </div>

          {/* Photos sub-section */}
          <div className="space-y-2 pt-1">
            <h4
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Photos from the front camera
            </h4>
            <p
              className={`text-[11px] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {config.photosCount} photos, one second apart, taken before any sound. Saved to
              Pictures/Maya.
            </p>
            {/* Dot Stepper Indicator */}
            <div className="pt-2 flex items-center gap-1.5">
              <div
                className={`flex-1 flex items-center h-2 rounded-full overflow-hidden p-0.5 gap-1 ${
                  isLight ? 'bg-slate-200' : 'bg-white/10'
                }`}
              >
                {[1, 2, 3, 4, 5].map((num) => {
                  const isActive = num <= config.photosCount;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => updateConfig('photosCount', num)}
                      className={`flex-1 h-full rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-500'
                          : isLight
                          ? 'bg-slate-300'
                          : 'bg-white/15'
                      }`}
                      title={`${num} photos`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-blue-500 font-bold px-2">
                {config.photosCount}
              </span>
            </div>
          </div>

          {/* Siren sub-section */}
          <div
            className={`space-y-2 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <h4
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Siren
            </h4>
            <p
              className={`text-[11px] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {config.sirenSeconds} seconds. It briefly pauses every 7 seconds so &quot;touch guard
              band karo&quot; can be heard over it.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <div
                className={`flex-1 flex items-center h-2 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-white/10'
                }`}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(config.sirenSeconds / 60) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-blue-500 font-bold w-8 text-right">
                {config.sirenSeconds}s
              </span>
            </div>
          </div>

          {/* Warn first, siren on second touch */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Warn first, siren on the second touch
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                The most common trip is you, reaching for your own phone. A spoken warning costs you
                nothing and still stops a stranger.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig('warnFirstSirenSecond', !config.warnFirstSirenSecond)
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.warnFirstSirenSecond
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.warnFirstSirenSecond ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Lock screen immediately */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Lock the screen immediately
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Needs Maya&apos;s accessibility service. Runs before the photos.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig('lockScreenImmediately', !config.lockScreenImmediately)
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.lockScreenImmediately
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.lockScreenImmediately ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Blink the torch with the siren */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Blink the torch with the siren
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                What makes the phone findable in a bag or a dark room
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig('blinkTorchWithSiren', !config.blinkTorchWithSiren)
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.blinkTorchWithSiren
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.blinkTorchWithSiren ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Text my SOS contacts after 3 touches */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Text my SOS contacts after 3 touches
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Sends the phone&apos;s location to the emergency contacts you already set up for SOS.
                Off by default — it messages other people.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig(
                  'textSosContactsAfter3Touches',
                  !config.textSosContactsAfter3Touches
                )
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.textSosContactsAfter3Touches
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.textSosContactsAfter3Touches ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CARD 5: What counts as a touch */}
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
                  ? 'bg-purple-50 border-purple-200 text-purple-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                What counts as a touch
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Screen waking, movement, and the charger
              </p>
            </div>
          </div>

          {/* Movement sensitivity */}
          <div className="space-y-2 pt-1">
            <h4
              className={`text-xs font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Movement sensitivity
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map((level) => {
                const isSelected = config.movementSensitivity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateConfig('movementSensitivity', level)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p
              className={`text-[11px] pt-1 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {getSensitivityText()}
            </p>
          </div>

          {/* Trip when the charger is pulled out */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Trip when the charger is pulled out
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                On a desk overnight this is the clearest theft signal there is
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig('tripWhenChargerPulled', !config.tripWhenChargerPulled)
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.tripWhenChargerPulled
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.tripWhenChargerPulled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Stealth — record only, no sound */}
          <div
            className={`flex items-center justify-between gap-4 pt-2 border-t ${
              isLight ? 'border-slate-200/70' : 'border-white/5'
            }`}
          >
            <div className="flex-1">
              <h4
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Stealth — record only, no sound
              </h4>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Photographs and logs, but says nothing and plays nothing.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateConfig('stealthRecordOnly', !config.stealthRecordOnly)
              }
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.stealthRecordOnly
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.stealthRecordOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CARD 6: Who touched it */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-2 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Who touched it
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Nothing recorded yet
              </p>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed pt-1 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Every trip is recorded here with the time, what set it off, where the phone was, and the
            photos taken. Ask Maya &quot;koi mera phone chhua?&quot; and she reads this out.
          </p>
        </div>
      </div>
    </div>
  );
};
