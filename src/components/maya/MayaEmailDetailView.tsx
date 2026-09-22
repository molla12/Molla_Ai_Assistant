import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Mail,
  Lightbulb,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadEmailConfig,
  saveEmailConfig,
  MayaEmailConfig,
} from './mayaStorage';

interface MayaEmailDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaEmailDetailView: React.FC<MayaEmailDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaEmailConfig>(loadEmailConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const update = (partial: Partial<MayaEmailConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveEmailConfig(next);
      return next;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* Top App Bar with Frosted Glass */}
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
          Email
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

      {/* Content matching Screenshot 4 with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Card: Email Configuration with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Email
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Let Maya send mail from your address
              </p>
            </div>
          </div>

          <p
            className={`text-xs leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            She prepares the email, reads it back to you, and asks your approval before sending anything.
          </p>

          {/* Form fields matching screenshot exactly */}
          <div className="space-y-3.5 pt-1">
            {/* 1. Your email address */}
            <div className="space-y-1.5">
              <label
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Your email address
              </label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={config.emailAddress}
                onChange={(e) => update({ emailAddress: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
            </div>

            {/* 2. App password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  App password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-xs flex items-center gap-1 font-medium cursor-pointer ${
                    isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="16-letter Gmail app password"
                value={config.appPassword}
                onChange={(e) => update({ appPassword: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <p
                className={`text-[11px] leading-relaxed ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Gmail account → Security → 2-Step Verification → App passwords. Not your main Google password.
              </p>
            </div>

            {/* 3. Your name on outgoing mail */}
            <div className="space-y-1.5">
              <label
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Your name on outgoing mail
              </label>
              <input
                type="text"
                placeholder="Shown to people who receive your mail"
                value={config.nameOnOutgoing}
                onChange={(e) => update({ nameOnOutgoing: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
            </div>

            {/* 4. Signature */}
            <div className="space-y-1.5">
              <label
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Signature
              </label>
              <textarea
                rows={3}
                placeholder="Added at the end of emails Maya sends"
                value={config.signature}
                onChange={(e) => update({ signature: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 resize-none font-sans ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
            </div>

            {/* 5. Custom SMTP host & port */}
            <div className={`space-y-2 pt-3 border-t ${isLight ? 'border-slate-200/80' : 'border-white/10'}`}>
              <label
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                Custom SMTP host (leave blank for Gmail)
              </label>
              <input
                type="text"
                placeholder="smtp.example.com"
                value={config.smtpHost}
                onChange={(e) => update({ smtpHost: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />

              <div className="space-y-1.5 pt-1">
                <label
                  className={`text-xs font-semibold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  SMTP port
                </label>
                <input
                  type="text"
                  placeholder="465"
                  value={config.smtpPort}
                  onChange={(e) => update({ smtpPort: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <CheckCircle className="w-4 h-4" />
              <span>Email settings saved successfully</span>
            </div>
          )}
        </div>

        {/* Tip matching screenshot */}
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl border backdrop-blur-xl text-xs ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900 shadow-xs'
              : 'bg-blue-950/30 border-blue-500/25 text-blue-300'
          }`}
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span className="leading-relaxed">
            Outgoing only. Maya cannot read incoming emails. She will ask for confirmation before
            sending.
          </span>
        </div>
      </div>
    </div>
  );
};
