import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  Layers,
  MoreVertical,
  PlusSquare,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { AtmosphereConfig } from '../types';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
  aura: AtmosphereConfig;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
  isInstalled,
  aura,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const result = await onTriggerInstall();
      if (result) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[92vh] bg-[#0c101b] border border-white/15 rounded-3xl text-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ borderColor: aura.accentColor + '50' }}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              style={{ boxShadow: `0 0 15px rgba(16, 185, 129, 0.3)` }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
                  Install on Mobile Device
                </h3>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  PWA + APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install Molla AI on your phone or build a standalone .apk package
              </p>
            </div>
          </div>
          <button
            id="close-install-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-white/[0.02] p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pwa'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Option 1: Direct Install (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'apk'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Option 2: Standalone APK</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 text-slate-200 text-sm">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* Direct One-Click Install Banner */}
              {isInstalled ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">App Already Installed!</p>
                    <p className="text-xs text-emerald-400/80 mt-0.5">
                      Molla AI is installed and running in fullscreen standalone mode.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/30">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Add Directly to Home Screen
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        Runs full screen without browser toolbars, just like a native mobile app.
                      </p>
                    </div>

                    <button
                      id="direct-pwa-install-btn"
                      onClick={handleInstallClick}
                      disabled={!isInstallable}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 ${
                        isInstallable
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 scale-100 hover:scale-105 active:scale-95 cursor-pointer'
                          : 'bg-emerald-500/30 text-emerald-200/50 cursor-not-allowed'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{isInstallable ? 'Install Now' : 'Preparing Prompt...'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step by step instructions */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <p className="font-semibold text-xs text-emerald-400 uppercase font-mono tracking-wider">
                  Manual Installation Steps (Chrome / Safari / Samsung Internet):
                </p>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p className="leading-relaxed">
                      Open this URL in <strong className="text-white">Google Chrome</strong>, <strong className="text-white">Safari</strong>, or <strong className="text-white">Samsung Internet</strong> on your phone.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p className="leading-relaxed">
                      Tap the green <strong className="text-emerald-300">"Install Now"</strong> button above, or check your browser prompt.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div className="leading-relaxed">
                      <p>
                        Alternatively, open the browser's menu (<MoreVertical className="w-3 h-3 inline text-slate-400" />) or Share sheet and select:
                      </p>
                      <div className="mt-1.5 p-2 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 text-white font-medium">
                        <PlusSquare className="w-4 h-4 text-emerald-400" />
                        <span>"Install app" or "Add to Home screen"</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <p className="leading-relaxed">
                      The app icon will immediately appear on your phone home screen, ready to launch in full screen with offline cache!
                    </p>
                  </div>
                </div>
              </div>

              {/* Share link helper */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-300">Copy app URL to open on your phone:</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{window.location.href}</p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Standalone APK Guide */}
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                <p className="font-bold text-white text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  Building a Standalone APK (.apk) File
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  If you wish to distribute an installable Android APK file or submit to the Google Play Store:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p className="leading-relaxed">
                    Use your live app URL or export the project source code as a ZIP archive from the top menu.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <p className="leading-relaxed">
                      Visit <strong className="text-cyan-300">PWABuilder.com</strong>, paste this application's URL, and generate a signed Android package (<code className="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono">.apk</code> / <code className="px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 font-mono">.aab</code>) with 1 click.
                    </p>
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                    >
                      Open PWABuilder.com <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <p className="leading-relaxed">
                    Download the generated <code className="text-white font-mono">Molla_AI.apk</code> package to your Android device and tap Install!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Feature Highlights */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ⚡ Enabled PWA Capabilities:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>Web App Manifest</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fullscreen standalone mode with 192px and 512px icons.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Service Worker</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Offline resource caching and quick instant launch times.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prompt Trigger</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  One-tap browser install directly to home screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Molla AI Assistant · Progressive Web App
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
