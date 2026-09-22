import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Smartphone,
  Package,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  appSubtitle?: string;
  effectiveTheme?: 'light' | 'dark';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  appName = 'Molla AI',
  appSubtitle = 'Voice & Real-Time AI Assistant',
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [activeTab, setActiveTab] = useState<'direct' | 'apk'>('direct');
  const [hasCopied, setHasCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install the app, tap the 3-dots (⋮) menu in the top-right corner of your browser and select "Install app" or "Add to Home screen".'
      );
    }
  };

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://molla15.ai.studio/';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="install-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container matching Image 2 */}
      <div
        className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 animate-in fade-in zoom-in-95 duration-200 border backdrop-blur-2xl transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.15)]'
            : 'bg-[#121927]/95 border-slate-700/60 text-slate-100 shadow-2xl'
        }`}
      >
        {/* Header matching Image 2 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div
              className={`w-12 h-12 rounded-2xl border p-2 flex items-center justify-center shadow-md ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                  : 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <Sparkles className="w-6 h-6" />
            </div>

            {/* App Name and Subtitle */}
            <div>
              <h2
                className={`text-lg font-bold tracking-tight leading-snug ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {appName}
              </h2>
              <p
                className={`text-xs font-medium ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                {appSubtitle}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            id="close-install-modal-btn"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Green Prominent Install Button matching Image 2 */}
        <button
          id="trigger-install-app-btn"
          onClick={handleInstallClick}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer mb-3"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>Install {appName}</span>
        </button>

        {/* 2. Instruction Box matching Image 2 */}
        <div
          className={`rounded-2xl border p-3 flex items-start gap-2.5 mb-2.5 ${
            isLight
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
          }`}
        >
          <CheckCircle2
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          />
          <p className="text-xs leading-relaxed">
            To install: Tap the{' '}
            <strong className={isLight ? 'text-slate-900' : 'text-white'}>
              3 dots (⋮)
            </strong>{' '}
            in your Chrome browser menu at the top right, and choose{' '}
            <strong className={isLight ? 'text-emerald-700' : 'text-emerald-300'}>
              &quot;Install app&quot;
            </strong>{' '}
            or{' '}
            <strong className={isLight ? 'text-emerald-700' : 'text-emerald-300'}>
              &quot;Add to Home screen&quot;
            </strong>
            .
          </p>
        </div>

        {/* 3. Standalone Mode status box matching Image 2 */}
        <div
          className={`rounded-2xl border p-3 flex items-start gap-2.5 mb-4 ${
            isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <CheckCircle2
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          />
          <p className="text-xs font-medium leading-relaxed">
            {isStandalone
              ? `${appName} is currently installed and running in Standalone Mode.`
              : `${appName} is ready to install and run in full-screen Standalone Mode.`}
          </p>
        </div>

        {/* 4. Tab selection pills matching Image 2 */}
        <div
          className={`grid grid-cols-2 gap-2 p-1 rounded-2xl border mb-4 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0b101c] border-white/5'
          }`}
        >
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'direct'
                ? isLight
                  ? 'bg-white text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Direct Android Install</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'apk'
                ? isLight
                  ? 'bg-white text-emerald-800 border border-emerald-300 shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Standalone .APK Package</span>
          </button>
        </div>

        {/* 5. Step-by-Step Card matching Image 2 */}
        {activeTab === 'direct' ? (
          <div
            className={`rounded-2xl border p-4 space-y-3 mb-4 ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-[#0e1420] border-slate-700/50'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>How to Install on Android Mobile (Fastest & Easiest)</span>
            </div>

            <div
              className={`space-y-2.5 text-xs ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold ${
                    isLight
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  1
                </span>
                <p className="leading-relaxed">
                  Open this application link in{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                    Google Chrome
                  </strong>{' '}
                  or{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                    Samsung Internet
                  </strong>{' '}
                  on your Android mobile.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold ${
                    isLight
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  2
                </span>
                <p className="leading-relaxed">
                  Click the green{' '}
                  <strong
                    className={isLight ? 'text-emerald-700' : 'text-emerald-300'}
                  >
                    &quot;Install {appName}&quot;
                  </strong>{' '}
                  button above, or tap the browser&apos;s 3-dot menu (⋮) in the
                  top-right corner.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold ${
                    isLight
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  3
                </span>
                <p className="leading-relaxed">
                  Select{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                    &quot;Install app&quot;
                  </strong>{' '}
                  or{' '}
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                    &quot;Add to Home screen&quot;
                  </strong>{' '}
                  and tap Install.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold ${
                    isLight
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  4
                </span>
                <p className="leading-relaxed">
                  <strong className={isLight ? 'text-slate-900' : 'text-white'}>
                    {appName}
                  </strong>{' '}
                  will immediately appear on your Android home screen with its
                  official icon and launches in pure full-screen mode!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-4 space-y-2 mb-4 text-xs leading-relaxed ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-[#0e1420] border-slate-700/50 text-slate-300'
            }`}
          >
            <p
              className={`font-semibold text-sm ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              PWA Web APK Wrapper
            </p>
            <p>
              Tapping &quot;Install app&quot; directly installs a lightweight,
              responsive app package to your Android app drawer. It functions
              completely without needing external APK files.
            </p>
          </div>
        )}

        {/* 6. Bottom Box: App URL for Mobile Browser matching Image 2 */}
        <div
          className={`rounded-2xl border p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-[#0c111a] border-slate-800'
          }`}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`text-[11px] mb-0.5 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              App URL for Mobile Browser:
            </p>
            <p
              className={`text-xs font-mono truncate ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {currentUrl}
            </p>
          </div>
          <button
            id="copy-app-link-btn"
            onClick={handleCopyLink}
            className={`w-full sm:w-auto px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600/70 text-white'
            }`}
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className={isLight ? 'text-emerald-700' : 'text-emerald-300'}>
                  Copied!
                </span>
              </>
            ) : (
              <>
                <Copy
                  className={`w-3.5 h-3.5 ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
