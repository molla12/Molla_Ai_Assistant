import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadBehaviourConfig,
  saveBehaviourConfig,
  MayaBehaviourConfig,
} from './mayaStorage';

interface MayaBehaviourDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaBehaviourDetailView: React.FC<MayaBehaviourDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaBehaviourConfig>(loadBehaviourConfig);

  const toggle = (key: keyof MayaBehaviourConfig) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveBehaviourConfig(next);
      return next;
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar with Frosted Glass */}
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
          Behaviour
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

      {/* 2. Scrollable Body Container with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* CARD 1: On screen with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                On screen
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Where Maya shows up while you use other apps
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border divide-y overflow-hidden backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80 divide-slate-200/70'
                : 'bg-[#0a101d]/90 border-white/5 divide-white/5'
            }`}
          >
            {/* Floating orb */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Floating orb
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Show over other apps
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.floatingOrb}
                onClick={() => toggle('floatingOrb')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.floatingOrb ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.floatingOrb ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Edge glow */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Edge glow
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Animated frame around the screen while Maya is live
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.edgeGlow}
                onClick={() => toggle('edgeGlow')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.edgeGlow ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.edgeGlow ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Audio with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Audio
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                How her voice is played and heard
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border divide-y overflow-hidden backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80 divide-slate-200/70'
                : 'bg-[#0a101d]/90 border-white/5 divide-white/5'
            }`}
          >
            {/* Echo guard */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="pr-2">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Echo guard
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Stops her replying to her own voice. You can still cut in while she is speaking — except in screen-recording mode, where the mic stays muted until she finishes.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.echoGuard}
                onClick={() => toggle('echoGuard')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.echoGuard ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.echoGuard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Screen-recording mode */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="pr-2">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Screen-recording mode
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Play Maya on the media stream so screen recorders capture her voice. Use earphones — on the loud speaker a light echo can appear. Applies on next start.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.screenRecordingMode}
                onClick={() => toggle('screenRecordingMode')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.screenRecordingMode ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.screenRecordingMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Startup with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Startup
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                When Maya comes back after a restart
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-[#0a101d]/90 border-white/5'
            }`}
          >
            {/* Start on boot */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Start on boot
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Ready as soon as the phone turns on
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.startOnBoot}
                onClick={() => toggle('startOnBoot')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.startOnBoot ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.startOnBoot ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
