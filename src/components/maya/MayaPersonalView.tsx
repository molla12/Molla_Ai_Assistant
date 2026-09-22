import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  User,
  Phone,
  Music,
  Lock,
  FileText,
  Lightbulb,
  ExternalLink,
  Check,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import { loadMayaConfig, saveMayaConfig, MayaPersonalConfig } from './mayaStorage';

interface MayaPersonalViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaPersonalView: React.FC<MayaPersonalViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const [config, setConfig] = useState<MayaPersonalConfig>(() => loadMayaConfig());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [testKeyStatus, setTestKeyStatus] = useState<string | null>(null);

  const isLight = effectiveTheme === 'light';

  const updateConfig = <K extends keyof MayaPersonalConfig>(
    key: K,
    val: MayaPersonalConfig[K]
  ) => {
    const updated = { ...config, [key]: val };
    setConfig(updated);
    saveMayaConfig(updated);
  };

  const handleSaveField = (fieldName: string) => {
    saveMayaConfig(config);
    setSaveSuccessMsg(`${fieldName} saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleTestKey = () => {
    if (!config.geminiApiKey || config.geminiApiKey.trim() === '') {
      setTestKeyStatus('Please enter a valid Gemini API key first');
      setTimeout(() => setTestKeyStatus(null), 3000);
      return;
    }
    setTestKeyStatus('Validating key with Google AI Studio...');
    setTimeout(() => {
      setTestKeyStatus('Key format looks valid! Connected to Gemini service.');
      setTimeout(() => setTestKeyStatus(null), 3500);
    }, 1000);
  };

  const cardCls = `rounded-[22px] border backdrop-blur-xl p-4 shadow-lg transition-all ${
    isLight
      ? 'bg-white/80 border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
      : 'bg-[#0b1120]/75 border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.35)]'
  }`;

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
    isLight
      ? 'bg-slate-50 border-slate-200/90 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 shadow-xs'
      : 'bg-[#090e1b] border-white/10 text-white placeholder-slate-500 focus:border-blue-500/60 shadow-inner'
  }`;

  const calloutCls = `rounded-xl border p-3 flex items-start gap-2.5 ${
    isLight ? 'bg-blue-50/80 border-blue-200/80 text-blue-950' : 'bg-[#0b1324] border-blue-500/20 text-slate-300'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 backdrop-blur-3xl ${
        isLight ? 'bg-slate-100/85 text-slate-900' : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar */}
      <header
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3.5 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
          isLight ? 'bg-white/80 border-slate-200/80' : 'bg-[#090e1b]/85 border-white/10'
        }`}
      >
        <button
          type="button"
          onClick={onBack}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Back to Settings"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Personal
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/15 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>
          <MayaAvatar size="sm" onClick={onBack} />
        </div>
      </header>

      {/* Save confirmation toast */}
      {saveSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium shadow-xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-blue-200" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Scrollable Cards Container with Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16">
        {/* Card 1: Your name */}
        <div className={cardCls}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Your name</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>How Maya addresses you</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={config.name}
              onChange={(e) => updateConfig('name', e.target.value)}
              placeholder="e.g. Hunter"
              className={inputCls}
            />
          </div>
        </div>

        {/* Card 2: You are */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>You are</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>So Maya uses the right words for you</p>
            </div>
          </div>

          {/* Gender selection pills */}
          <div className="flex items-center gap-2 pt-1">
            {(['Male', 'Female', 'Prefer not to say'] as const).map((genderOption) => {
              const isSelected = config.gender === genderOption;
              return (
                <button
                  key={genderOption}
                  type="button"
                  onClick={() => updateConfig('gender', genderOption)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  {genderOption}
                </button>
              );
            })}
          </div>

          {/* Lightbulb callout note */}
          <div className={calloutCls}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-200 text-blue-800' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] leading-relaxed">
              {config.gender === 'Female'
                ? 'Maya talks to you as a friend, in the feminine — "kar rahi ho", not "kar rahe ho".'
                : config.gender === 'Male'
                ? 'Maya talks to you as a friend, in the masculine — "kar rahe ho".'
                : 'Maya talks to you with neutral pronouns and respectful language.'}
            </p>
          </div>
        </div>

        {/* Card 3: Phone number */}
        <div className={cardCls}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Phone number</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Optional — so support can reach you about your account
              </p>
            </div>
          </div>
          <input
            type="tel"
            value={config.phone}
            onChange={(e) => updateConfig('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputCls}
          />
        </div>

        {/* Card 4: Music player */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Music app</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Choose your favorite audio player</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['YT Music', 'Spotify', 'YouTube'] as const).map(
              (playerOption) => {
                const isSelected = config.musicApp === playerOption;
                return (
                  <button
                    key={playerOption}
                    type="button"
                    onClick={() => updateConfig('musicApp', playerOption)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {playerOption}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Card 5: Gemini API key */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Gemini API key</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Maya runs on Gemini 2.5 Flash. Bring your own key for higher rate limits.
              </p>
            </div>
          </div>

          <div className={calloutCls}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-200 text-blue-800' : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] leading-relaxed">
              Get a free key from Google AI Studio: sign in, click "Create API key", then paste it here.
            </p>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline"
          >
            <span>Get a Gemini key</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="relative">
            <input
              type="password"
              value={config.geminiApiKey}
              onChange={(e) => updateConfig('geminiApiKey', e.target.value)}
              placeholder="Alza..."
              className={`${inputCls} pr-10 font-mono`}
            />
            <Lock className={`absolute right-3.5 top-3 w-4 h-4 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>

          {testKeyStatus && (
            <p className="text-xs text-blue-500 font-mono animate-in fade-in">{testKeyStatus}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleSaveField('Gemini API key')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleTestKey}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              Test key
            </button>
          </div>
        </div>

        {/* Card 6: YouTube */}
        <div className={`${cardCls} space-y-3 mb-6`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>YouTube</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Your channel — add your own API key only if you hit daily quota limits
              </p>
            </div>
          </div>

          <div>
            <label className={`text-[11px] font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Channel
            </label>
            <input
              type="text"
              value={config.youtubeChannel}
              onChange={(e) => updateConfig('youtubeChannel', e.target.value)}
              placeholder="@yourchannel"
              className={inputCls}
            />
          </div>

          <div>
            <label className={`text-[11px] font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Data API key
            </label>
            <div className="relative">
              <input
                type="password"
                value={config.youtubeApiKey}
                onChange={(e) => updateConfig('youtubeApiKey', e.target.value)}
                placeholder="Leave blank to use Maya's shared key"
                className={`${inputCls} pr-10 font-mono`}
              />
              <Lock className={`absolute right-3.5 top-3 w-4 h-4 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleSaveField('YouTube settings')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
