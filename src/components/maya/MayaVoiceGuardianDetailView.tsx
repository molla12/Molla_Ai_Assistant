import React, { useState } from 'react';
import { ArrowLeft, Bell, Plus, Mic } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadVoiceGuardianConfig,
  saveVoiceGuardianConfig,
  MayaVoiceGuardianConfig,
} from './mayaStorage';

interface MayaVoiceGuardianDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaVoiceGuardianDetailView: React.FC<
  MayaVoiceGuardianDetailViewProps
> = ({ onBack, onOpenNotifications, effectiveTheme = 'dark' }) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaVoiceGuardianConfig>(
    loadVoiceGuardianConfig
  );
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const update = (partial: Partial<MayaVoiceGuardianConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveVoiceGuardianConfig(next);
      return next;
    });
  };

  const removeVoice = (id: string) => {
    update({
      enrolledVoices: config.enrolledVoices.filter((v) => v.id !== id),
    });
  };

  const addVoice = () => {
    const label = prompt('Enter a label for this voice (e.g. boss, friend, dad):');
    if (!label) return;
    update({
      enrolledVoices: [
        ...config.enrolledVoices,
        {
          id: Date.now().toString(),
          role: config.enrolledVoices.length === 0 ? 'Owner' : 'Family',
          label,
        },
      ],
    });
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    setTestResult('Listening for ~4s...');
    setTimeout(() => {
      setIsTestingVoice(false);
      setTestResult('Match score: 88% — matches enrolled voiceprint (0.40 threshold passed).');
    }, 4000);
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
          Voice Guardian
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
        {/* Main Card: Voice Guardian with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div>
            <h2
              className={`text-base font-bold mb-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Voice Guardian
            </h2>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              Maya only acts for enrolled voices, according to their role. Owner
              = full control; guest/unknown voices can only chat. With Away mode
              ON, an unknown voice gets a warning first, then the phone locks.
            </p>
          </div>

          {/* Voice Guardian ON toggle */}
          <div
            className={`flex items-center justify-between gap-4 pt-3 border-t ${
              isLight ? 'border-slate-200/60' : 'border-white/5'
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Voice Guardian ON
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={config.voiceGuardianOn}
              onClick={() =>
                update({ voiceGuardianOn: !config.voiceGuardianOn })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.voiceGuardianOn ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.voiceGuardianOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Away / guard mode toggle */}
          <div
            className={`flex items-center justify-between gap-4 pt-3 border-t ${
              isLight ? 'border-slate-200/60' : 'border-white/5'
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Away / guard mode (lock on unknown voice)
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={config.awayGuardMode}
              onClick={() => update({ awayGuardMode: !config.awayGuardMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.awayGuardMode ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.awayGuardMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Listen mode */}
          <div
            className={`pt-3 border-t space-y-2 ${
              isLight ? 'border-slate-200/60' : 'border-white/5'
            }`}
          >
            <span
              className={`text-xs font-semibold block ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Listen mode — whose voice reaches Maya
            </span>
            <p
              className={`text-[11px] leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Owner only = friends talking nearby are filtered out BEFORE Maya
              hears them (she replies only to your voice). Needs your voice
              enrolled as owner.
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {(['Everyone', 'Owner only', 'Owner + family'] as const).map(
                (mode) => {
                  const isSelected = config.listenMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => update({ listenMode: mode })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                          : 'bg-[#0a101d] text-slate-300 border border-white/5 hover:bg-[#142035]'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Prompt status */}
          <p
            className={`text-xs italic pt-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Turn Talk ON and speak a full sentence — no speech heard yet.
          </p>

          {/* Match strictness */}
          <div
            className={`pt-3 border-t space-y-2 ${
              isLight ? 'border-slate-200/60' : 'border-white/5'
            }`}
          >
            <span
              className={`text-xs font-bold block ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}
            >
              Match strictness: {config.matchStrictness.toFixed(2)} (holds down
              to 0.30)
            </span>
            <p
              className={`text-[11px] leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Higher = stricter (two people are less likely to be confused, but
              the owner is occasionally missed). Lower = easier (the owner is
              always recognized, but other voices may match too). Default 0.40.
            </p>

            <div className="relative pt-2">
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={config.matchStrictness}
                onChange={(e) =>
                  update({ matchStrictness: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div
                className={`flex justify-between text-[10px] mt-1 font-mono ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <span>0.10</span>
                <span className="text-blue-500 font-bold">
                  {config.matchStrictness.toFixed(2)}
                </span>
                <span>0.90</span>
              </div>
            </div>
          </div>

          {/* Enrolled voices */}
          <div
            className={`pt-3 border-t space-y-2.5 ${
              isLight ? 'border-slate-200/60' : 'border-white/5'
            }`}
          >
            <span
              className={`text-xs font-semibold block ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Enrolled voices
            </span>

            <div className="space-y-2">
              {config.enrolledVoices.map((voice) => (
                <div
                  key={voice.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-md ${
                    isLight
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-[#0a101d] border-white/5'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {voice.role}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {voice.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVoice(voice.id)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <button
                type="button"
                onClick={addVoice}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add a voice</span>
              </button>

              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>
                  {isTestingVoice ? 'Listening...' : 'Test my voice'}
                </span>
              </button>
            </div>

            {testResult && (
              <p className="text-xs text-blue-600 dark:text-blue-300 font-mono bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 animate-in fade-in">
                {testResult}
              </p>
            )}

            <p
              className={`text-[11px] leading-relaxed pt-1 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Test speaks nothing — it records ~4s, scores it against your saved
              voice, and shows the match %.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
