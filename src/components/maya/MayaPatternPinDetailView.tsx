import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Bell,
  Lock,
  Grid,
  Shield,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaScreenLockConfig,
  loadScreenLockConfig,
  saveScreenLockConfig,
} from './mayaStorage';

interface MayaPatternPinDetailViewProps {
  onBack: () => void;
  onOpenNotifications: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaPatternPinDetailView: React.FC<MayaPatternPinDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaScreenLockConfig>(() => loadScreenLockConfig());
  const [pinInput, setPinInput] = useState(config.pinCode || '');
  const [showPin, setShowPin] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<number[]>(config.patternDots || []);
  const [isFineTuningOpen, setIsFineTuningOpen] = useState(false);
  const [isTestingLock, setIsTestingLock] = useState(false);
  const [testCountdown, setTestCountdown] = useState(3);
  const [testStep, setTestStep] = useState<'idle' | 'locking' | 'unlocking' | 'success'>('idle');
  const [savedToast, setSavedToast] = useState(false);

  const patternContainerRef = useRef<HTMLDivElement>(null);

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

  const handleSavePin = () => {
    updateConfig('pinCode', pinInput.trim());
  };

  const handleClearPattern = () => {
    setSelectedPattern([]);
  };

  const handleSavePattern = () => {
    updateConfig('patternDots', selectedPattern);
  };

  // Dot selection in 3x3 grid
  const handleDotClick = (index: number) => {
    if (!selectedPattern.includes(index)) {
      setSelectedPattern((prev) => [...prev, index]);
    }
  };

  // Run Test: simulate locking and unlocking
  const handleStartTest = () => {
    setIsTestingLock(true);
    setTestStep('locking');
    setTestCountdown(2);

    const timer = setInterval(() => {
      setTestCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTestStep('unlocking');
          setTimeout(() => {
            setTestStep('success');
            setTimeout(() => {
              setIsTestingLock(false);
              setTestStep('idle');
            }, 1200);
          }, 1200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isConfigured = Boolean(
    config.pinCode || (config.patternDots && config.patternDots.length > 0)
  );

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col select-none overflow-hidden animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#090e1b]/90 text-slate-100'
      }`}
    >
      {/* 1. Header */}
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
          Pattern &amp; PIN
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

      {/* Test Lock Overlay Simulation */}
      {isTestingLock && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          {testStep === 'locking' && (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400 animate-pulse">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">Screen locked for test</p>
              <p className="text-xs text-slate-400">
                Resuming in {testCountdown}s... Maya is raising unlock sequence.
              </p>
            </div>
          )}

          {testStep === 'unlocking' && (
            <div className="space-y-3">
              <MayaAvatar size="md" className="mx-auto animate-bounce" />
              <p className="text-sm font-semibold text-blue-300">Maya entering credentials...</p>
              <p className="text-xs text-slate-400">Verifying pattern / PIN simulation</p>
            </div>
          )}

          {testStep === 'success' && (
            <div className="space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-emerald-300">Unlock Test Succeeded</p>
              <p className="text-xs text-slate-400">Phone unlocked normally.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Scrollable Content with Frosted Glass */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-20 scrollbar-thin">
        {/* TOP ITEM: Not set up / Configured */}
        <div
          className={`flex items-start gap-3.5 p-3 rounded-2xl border backdrop-blur-xl ${
            isLight
              ? 'bg-white/60 border-slate-200/60'
              : 'bg-white/5 border-white/5'
          }`}
        >
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
              {isConfigured ? 'Credentials configured' : 'Not set up'}
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Save the pattern or PIN this phone uses, then switch it on.
            </p>
          </div>
        </div>

        {/* CARD 1: Unlock for me */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
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
                Unlock for me
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Off by default, and off is a perfectly good answer
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
                Let Maya unlock the phone
              </h4>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Save a pattern or a PIN below first.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateConfig('unlockForMe', !config.unlockForMe)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                config.unlockForMe
                  ? 'bg-blue-600'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 left-0.5 shadow-sm ${
                  config.unlockForMe ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Accessibility Service Warning Banner */}
          <div
            className={`rounded-xl border p-3 flex items-start gap-2.5 text-xs ${
              isLight
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-200/90'
            }`}
          >
            <AlertTriangle
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isLight ? 'text-amber-600' : 'text-amber-400'
              }`}
            />
            <p className="leading-relaxed">
              <span
                className={`font-semibold ${
                  isLight ? 'text-amber-800' : 'text-amber-300'
                }`}
              >
                Accessibility service OFF hai
              </span>{' '}
              — Settings &gt; Accessibility me &apos;Maya&apos; ON kar do (app ki Permissions
              screen pe shortcut hai), phir bolo.
            </p>
          </div>
        </div>

        {/* CARD 2: Pattern */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Pattern
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {config.patternDots && config.patternDots.length > 0
                  ? `Pattern saved (${config.patternDots.length} points)`
                  : 'No pattern saved'}
              </p>
            </div>
          </div>

          <p
            className={`text-xs pt-1 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            Draw the pattern you use on this phone&apos;s lock screen.
          </p>

          {/* Interactive Pattern Grid */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div
              ref={patternContainerRef}
              className={`relative w-56 h-56 rounded-2xl border p-4 grid grid-cols-3 gap-4 place-items-center shadow-inner ${
                isLight
                  ? 'bg-slate-100 border-slate-200/90'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                const isSelected = selectedPattern.includes(idx);
                const orderIndex = selectedPattern.indexOf(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDotClick(idx)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 ring-4 ring-blue-500/40 text-white font-bold text-[10px]'
                        : isLight
                        ? 'bg-white/80 hover:bg-white text-transparent shadow-xs border border-slate-200'
                        : 'bg-white/20 hover:bg-white/30 text-transparent'
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-white' : isLight ? 'bg-slate-400' : 'bg-slate-400'
                      }`}
                    />
                    {isSelected && (
                      <span className="absolute text-[10px] text-white/90 font-bold">
                        {orderIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pattern Controls */}
            <div className="flex items-center gap-3 mt-3 w-full max-w-xs">
              <button
                type="button"
                onClick={handleClearPattern}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSavePattern}
                disabled={selectedPattern.length === 0}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  selectedPattern.length > 0
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                    : isLight
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                Save Pattern
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: PIN */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
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
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                PIN
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {config.pinCode ? `PIN saved (••••)` : 'No PIN saved'}
              </p>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed pt-1 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            If this phone uses a PIN, put it here instead. A PIN is the more reliable of the two —
            Maya presses the real keypad buttons, so there is no position to get right.
          </p>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="PIN"
                className={`w-full px-4 py-3 rounded-xl border text-sm tracking-widest focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-xs'
                    : 'bg-[#090e1a] border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSavePin}
              disabled={!pinInput}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
                pinInput
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20'
                  : isLight
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              Save PIN
            </button>
          </div>
        </div>

        {/* CARD 4: Test */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all ${
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
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Test
              </h3>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Locks this phone, then tries to open it
              </p>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed pt-1 ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            The screen goes dark for a couple of seconds. If it doesn&apos;t come back on its own,
            unlock it yourself — nothing is stuck.
          </p>

          <button
            type="button"
            onClick={handleStartTest}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer mt-1 active:scale-98 ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
            }`}
          >
            Lock and try to unlock
          </button>
        </div>

        {/* CARD 5: Fine-tuning */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsFineTuningOpen(!isFineTuningOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-violet-50 border-violet-200 text-violet-600'
                    : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3
                  className={`text-sm font-semibold transition-colors ${
                    isLight
                      ? 'text-slate-900 group-hover:text-blue-600'
                      : 'text-white group-hover:text-blue-300'
                  }`}
                >
                  Fine-tuning
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Only if the test below fails
                </p>
              </div>
            </div>
            {isFineTuningOpen ? (
              <ChevronUp
                className={`w-4 h-4 transition-colors ${
                  isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'
                }`}
              />
            ) : (
              <ChevronDown
                className={`w-4 h-4 transition-colors ${
                  isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'
                }`}
              />
            )}
          </button>

          {isFineTuningOpen && (
            <div
              className={`pt-4 mt-3 border-t space-y-3 animate-in fade-in ${
                isLight ? 'border-slate-200/70' : 'border-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h5
                    className={`text-xs font-semibold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Keypad press delay
                  </h5>
                  <p
                    className={`text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Delay between keystrokes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[100, 150, 250].map((ms) => (
                    <button
                      key={ms}
                      type="button"
                      onClick={() => updateConfig('fineTuningDelayMs', ms)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        config.fineTuningDelayMs === ms
                          ? 'bg-blue-600 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {ms}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 6: Tip Callout */}
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
            Stored encrypted on this phone and never synced or backed up. Nothing can read it back —
            not even this screen. Android still checks every attempt and still counts the failures,
            exactly as it would for your finger.
          </p>
        </div>
      </div>
    </div>
  );
};
