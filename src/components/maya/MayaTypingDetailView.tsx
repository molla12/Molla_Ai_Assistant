import React, { useState } from 'react';
import { ArrowLeft, Bell, Edit3 } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadTypingConfig,
  saveTypingConfig,
  MayaTypingConfig,
} from './mayaStorage';

interface MayaTypingDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaTypingDetailView: React.FC<MayaTypingDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaTypingConfig>(loadTypingConfig);

  const update = (partial: Partial<MayaTypingConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveTypingConfig(next);
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
          Typing
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
        {/* Main Card: Realistic typing with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-5 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Realistic typing
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Type like a human in editors
              </p>
            </div>
          </div>

          {/* Section 1: Human typing in editors */}
          <div
            className={`rounded-2xl border p-4 space-y-3.5 backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-[#0a101d]/90 border-white/5'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="pr-2">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Human typing in editors
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Notepad, Docs, code — types character by character
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.humanTypingInEditors}
                onClick={() =>
                  update({ humanTypingInEditors: !config.humanTypingInEditors })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.humanTypingInEditors ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.humanTypingInEditors
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Speed selection */}
            <div className="space-y-2 pt-1 border-t border-slate-200/50 dark:border-white/5">
              <span
                className={`text-xs block font-medium ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Speed
              </span>
              <div className="flex items-center gap-2">
                {(['Slow', 'Normal', 'Fast'] as const).map((spd) => {
                  const isSelected = config.speed === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => update({ speed: spd })}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : isLight
                          ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-xs'
                          : 'bg-[#121c32] text-slate-300 border border-white/5 hover:bg-[#182644]'
                      }`}
                    >
                      {spd}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 space-y-4 backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-[#0a101d]/90 border-white/5'
            }`}
          >
            {/* Section 2: Realistic typing while coding */}
            <div className="flex items-center justify-between gap-4">
              <div className="pr-2">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Realistic typing while coding
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Applies to coding tasks too
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.realisticTypingWhileCoding}
                onClick={() =>
                  update({
                    realisticTypingWhileCoding:
                      !config.realisticTypingWhileCoding,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.realisticTypingWhileCoding
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.realisticTypingWhileCoding
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Apps where it's on */}
            <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-white/5">
              <span
                className={`text-xs block font-medium ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Apps where it's on
              </span>
              <div
                className={`rounded-xl border p-3 ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#090e1b] border-white/5'
                }`}
              >
                <textarea
                  value={config.packages}
                  onChange={(e) => update({ packages: e.target.value })}
                  rows={4}
                  className={`w-full bg-transparent text-xs font-mono focus:outline-none leading-relaxed resize-none ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                  spellCheck={false}
                />
              </div>
              <p
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Comma-separated package names. Everywhere else stays instant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
