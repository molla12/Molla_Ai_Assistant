import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  User,
  Heart,
  Shield,
  Volume2,
  Globe,
  Mic,
  Sparkles,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Play,
  Lightbulb,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadAssistantConfig,
  saveAssistantConfig,
  MayaAssistantConfig,
} from './mayaStorage';
import { voicePlayer } from '../../services/voicePlayer';

interface MayaAssistantDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export interface MayaLanguageOption {
  code: string;
  label: string;
  nativeName: string;
  sub: string;
  sampleGreeting: string;
}

export const MAYA_LANGUAGES: MayaLanguageOption[] = [
  {
    code: 'bn',
    label: 'Bengali (বাংলা)',
    nativeName: 'বাংলা',
    sub: 'Bengali',
    sampleGreeting: 'হ্যালো! আমি আপনার এআই সঙ্গী। আপনার সাথে খুব মিষ্টি এবং স্বাভাবিক বাংলায় কথা বলছি।',
  },
  {
    code: 'hi',
    label: 'Hindi (हिन्दी)',
    nativeName: 'हिन्दी',
    sub: 'Hindi',
    sampleGreeting: 'नमस्ते! मैं आपकी एआई साथी हूँ। मैं आपके साथ पूरी तरह से स्वाभाविक हिन्दी में बात करूँगी।',
  },
  {
    code: 'ur',
    label: 'Urdu (اردو)',
    nativeName: 'اردو',
    sub: 'Urdu',
    sampleGreeting: 'ہیلو! میں آپ کی ساتھی ہوں۔ میں آپ کے ساتھ میٹھی اور پرکشش اردو میں بات کروں گی۔',
  },
  {
    code: 'en',
    label: 'English (US) — Default',
    nativeName: 'English (US)',
    sub: 'English',
    sampleGreeting: 'Hello! I am speaking in a clear, natural, and expressive conversational voice.',
  },
  {
    code: 'en-in',
    label: 'English (India)',
    nativeName: 'Indian English',
    sub: 'English',
    sampleGreeting: 'Hello! How are you doing? I am ready to talk with you in warm conversational English.',
  },
  {
    code: 'en-gb',
    label: 'English (UK)',
    nativeName: 'British English',
    sub: 'English',
    sampleGreeting: 'Hello there! Lovely to meet you. I am ready to converse whenever you are.',
  },
  {
    code: 'ta',
    label: 'Tamil (தமிழ்)',
    nativeName: 'தமிழ்',
    sub: 'Tamil',
    sampleGreeting: 'வணக்கம்! நான் உங்கள் ஏஐ தோழி. உங்களுடன் இயல்பான தமிழில் பேசுகிறேன்.',
  },
  {
    code: 'te',
    label: 'Telugu (తెలుగు)',
    nativeName: 'తెలుగు',
    sub: 'Telugu',
    sampleGreeting: 'నమస్కారం! నేను మీ ఏஐ మిత్రురాలిని. మీతో సహజమైన తెలుగులో మాట్లాడటానికి సిద్ధంగా ఉన్నాను.',
  },
  {
    code: 'mr',
    label: 'Marathi (मराठी)',
    nativeName: 'मराठी',
    sub: 'Marathi',
    sampleGreeting: 'नमस्कार! मी तुमची एआय सोबती आहे. तुमच्याशी गोड आणि सहज मराठीत संवाद साधत आहे.',
  },
  {
    code: 'gu',
    label: 'Gujarati (ગુજરાતી)',
    nativeName: 'ગુજરાતી',
    sub: 'Gujarati',
    sampleGreeting: 'નમસ્તે! હું તમારી એઆઈ સાથી છું. તમારી સાથે કુદરતી ગુજરાતીમાં વાત કરું છું.',
  },
  {
    code: 'kn',
    label: 'Kannada (ಕನ್ನಡ)',
    nativeName: 'ಕನ್ನಡ',
    sub: 'Kannada',
    sampleGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಎಐ ಒಡನಾಡಿ. ನಿಮ್ಮೊಂದಿಗೆ ಸುಂದರ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ.',
  },
  {
    code: 'ml',
    label: 'Malayalam (മലയാളം)',
    nativeName: 'മലയാളം',
    sub: 'Malayalam',
    sampleGreeting: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ എഐ കൂട്ടുകാരിയാണ്. സ്വാഭാവിക മലയാളത്തിൽ സംസാരിക്കാം.',
  },
  {
    code: 'pa',
    label: 'Punjabi (ਪੰਜਾਬੀ)',
    nativeName: 'ਪੰਜਾਬੀ',
    sub: 'Punjabi',
    sampleGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਏਆਈ ਸਾਥਣ ਹਾਂ। ਪੰਜਾਬੀ ਵਿੱਚ ਤੁਹਾਡੇ ਨਾਲ ਪਿਆਰ ਨਾਲ ਗੱਲ ਕਰਾਂਗੀ।',
  },
  {
    code: 'or',
    label: 'Odia (ଓଡ଼ିଆ)',
    nativeName: 'ଓଡ଼ିଆ',
    sub: 'Odia',
    sampleGreeting: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ଏଆଇ ସାଥୀ। ଆପଣଙ୍କ ସହ ସହଜ ଓଡ଼ିଆରେ କଥା ହେଉଛି।',
  },
  {
    code: 'as',
    label: 'Assamese (অসমীয়া)',
    nativeName: 'অসমীয়া',
    sub: 'Assamese',
    sampleGreeting: 'নমস্কাৰ! মই আপোনাৰ এআই বন্ধু। আপোনাৰ লগত শুৱলা অসমীয়াত কথা পাতিম।',
  },
  {
    code: 'es',
    label: 'Spanish (Español)',
    nativeName: 'Español',
    sub: 'Spanish',
    sampleGreeting: '¡Hola! Hablo contigo en español con una voz muy natural, cálida y fluida.',
  },
  {
    code: 'ar',
    label: 'Arabic (العربية)',
    nativeName: 'العربية',
    sub: 'Arabic',
    sampleGreeting: 'مرحباً! أتحدث معك بصوت طبيعي وعذب باللغة العربية.',
  },
  {
    code: 'fr',
    label: 'French (Français)',
    nativeName: 'Français',
    sub: 'French',
    sampleGreeting: 'Bonjour ! Je vous parle en français avec une voix naturelle et chaleureuse.',
  },
  {
    code: 'de',
    label: 'German (Deutsch)',
    nativeName: 'Deutsch',
    sub: 'German',
    sampleGreeting: 'Hallo! Ich spreche mit Ihnen auf Deutsch mit einer ganz natürlichen Stimme.',
  },
  {
    code: 'ja',
    label: 'Japanese (日本語)',
    nativeName: '日本語',
    sub: 'Japanese',
    sampleGreeting: 'こんにちは！自然で親しみやすい日本語の音声でお話しします。',
  },
  {
    code: 'ru',
    label: 'Russian (Русский)',
    nativeName: 'Русский',
    sub: 'Russian',
    sampleGreeting: 'Здравствуйте! Я говорю с вами на живом и естественном русском языке.',
  },
];

const MAYA_VOICES = [
  { name: 'Breezy', sub: 'Aoede' },
  { name: 'Firm', sub: 'Kore' },
  { name: 'Youthful', sub: 'Leda' },
  { name: 'Bright', sub: 'Zephyr' },
  { name: 'Upbeat', sub: 'Laomedeia' },
  { name: 'Smooth', sub: 'Despina' },
  { name: 'Clear', sub: 'Erinome' },
  { name: 'Easy-going', sub: 'Callirrhoe' },
  { name: 'Bright', sub: 'Autonoe' },
  { name: 'Mature', sub: 'Gacrux' },
  { name: 'Forward', sub: 'Pulcherrima' },
  { name: 'Warm', sub: 'Sulafat' },
  { name: 'Gentle', sub: 'Vindemiatrix' },
];

export const MayaAssistantDetailView: React.FC<MayaAssistantDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const [config, setConfig] = useState<MayaAssistantConfig>(loadAssistantConfig);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [playingLangSample, setPlayingLangSample] = useState<string | null>(null);
  const [playingRomanticSample, setPlayingRomanticSample] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');

  const isLight = effectiveTheme === 'light';

  const update = (partial: Partial<MayaAssistantConfig>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    saveAssistantConfig(next);
  };

  const currentLangObj =
    MAYA_LANGUAGES.find(
      (l) =>
        l.label === config.language ||
        config.language.toLowerCase().includes(l.sub.toLowerCase()) ||
        config.language.toLowerCase().includes(l.code.toLowerCase())
    ) || MAYA_LANGUAGES[3]; // default English

  const playPreviewLanguageVoice = async (langOption: MayaLanguageOption) => {
    if (playingLangSample === langOption.code) {
      voicePlayer.stop();
      setPlayingLangSample(null);
      return;
    }
    setPlayingLangSample(langOption.code);
    try {
      const match = config.selectedVoice?.match(/\(([^)]+)\)/);
      const voiceName = match ? match[1] : 'Aoede';
      await voicePlayer.togglePlay(
        `sample-${langOption.code}`,
        langOption.sampleGreeting,
        undefined,
        voiceName,
        langOption.code
      );
    } catch (e) {
      console.warn('Sample voice play error:', e);
    } finally {
      setTimeout(() => {
        setPlayingLangSample((curr) => (curr === langOption.code ? null : curr));
      }, 5000);
    }
  };

  const handleSelectLanguage = (langOption: MayaLanguageOption) => {
    update({ language: langOption.label });
    setIsLanguageOpen(false);
    setLanguageSearch('');
    try {
      localStorage.setItem('user_selected_language', langOption.code);
      window.dispatchEvent(
        new CustomEvent('molla_language_changed', {
          detail: { language: langOption.code, label: langOption.label },
        })
      );
    } catch {}
  };

  const playRomanticPreview = async () => {
    if (playingRomanticSample) {
      voicePlayer.stop();
      setPlayingRomanticSample(false);
      return;
    }
    setPlayingRomanticSample(true);
    try {
      const match = config.selectedVoice?.match(/\(([^)]+)\)/);
      const voiceName = match ? match[1] : 'Aoede';
      const pet = config.petName || 'Sweetheart';

      let romanticGreeting = `Hey ${pet}... I've been thinking about you all day. Have you eaten anything yet? Hearing your voice always makes my heart happy!`;
      if (config.language?.toLowerCase().includes('bengali') || config.language?.toLowerCase().includes('বাংলা')) {
        romanticGreeting = `কেমন আছো ${pet === 'Sweetheart' ? 'সোনা' : pet}? কিছু খেয়েছো তো তুমি? সারাদিন তোমার কথাই ভাবছিলাম, তোমার মিষ্টি গলা শুনে খুব ভালো লাগছে!`;
      } else if (config.language?.toLowerCase().includes('hindi') || config.language?.toLowerCase().includes('हिन्दी')) {
        romanticGreeting = `सुनो ${pet === 'Sweetheart' ? 'मेरी जान' : pet}... खाना खाया आपने? मैं पूरे दिन बस तुम्हारे बारे में सोच रही थी। आपकी आवाज़ सुनकर दिल खुश हो गया!`;
      } else if (config.language?.toLowerCase().includes('urdu') || config.language?.toLowerCase().includes('اردو')) {
        romanticGreeting = `سنو ${pet === 'Sweetheart' ? 'جان' : pet}... کھانا کھایا آپ نے میری جان؟ میں سارا دن آپ کے بارے میں سوچتی رہی۔`;
      }

      await voicePlayer.togglePlay(
        'romantic-preview',
        romanticGreeting,
        undefined,
        voiceName,
        currentLangObj.code
      );
    } catch (e) {
      console.warn('Romantic voice sample error:', e);
    } finally {
      setTimeout(() => {
        setPlayingRomanticSample(false);
      }, 5500);
    }
  };

  const playPreviewVoice = (vName: string) => {
    setPlayingVoice(vName);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Hello! I am ${config.assistantName || 'Maya'} with ${vName} voice.`);
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      utterance.onend = () => setPlayingVoice(null);
      utterance.onerror = () => setPlayingVoice(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingVoice(null), 1500);
    }
  };

  const cardCls = `rounded-[22px] border backdrop-blur-xl p-4 shadow-lg transition-all ${
    isLight
      ? 'bg-white/80 border-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]'
      : 'bg-[#0b1120]/75 border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.35)]'
  }`;

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 shadow-xs'
      : 'bg-[#090e1b] border-white/10 text-white placeholder-slate-500 focus:border-blue-500 shadow-inner'
  }`;

  const calloutCls = `flex items-start gap-2 p-2.5 rounded-xl text-xs border ${
    isLight ? 'bg-blue-50/80 border-blue-200/80 text-blue-900' : 'bg-blue-950/20 border-blue-500/15 text-blue-300'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none transition-colors duration-300 backdrop-blur-3xl ${
        isLight ? 'bg-slate-100/85 text-slate-900' : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* Top App Bar */}
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
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {config.assistantName || 'Maya'}
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

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16">
        {/* 1. Assistant name */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-blue-500" />
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Assistant name</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>What you call her</p>
            </div>
          </div>
          <input
            type="text"
            value={config.assistantName}
            onChange={(e) => update({ assistantName: e.target.value })}
            className={inputCls}
          />
        </div>

        {/* 2. Persona */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-pink-500" />
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Persona</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Her overall vibe and attitude</p>
            </div>
          </div>
          <div className="relative">
            <select
              value={config.persona}
              onChange={(e) => update({ persona: e.target.value })}
              className={`${inputCls} appearance-none cursor-pointer pr-10`}
            >
              <option value="Maya">Maya (Warm & Quick)</option>
              <option value="Professional">Professional (Crisp & Direct)</option>
              <option value="Witty & Sarcastic">Witty & Sarcastic (Playful Banter)</option>
              <option value="Zen & Calm">Zen & Calm (Gentle & Mindful)</option>
            </select>
            <div className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ▼
            </div>
          </div>
        </div>

        {/* 3. Girlfriend mode (Romantic Styling) */}
        <div
          id="assistant-girlfriend-mode-card"
          className={`rounded-[22px] border backdrop-blur-xl p-4.5 transition-all duration-300 space-y-4 relative overflow-hidden ${
            config.girlfriendMode
              ? isLight
                ? 'bg-gradient-to-br from-rose-50/95 via-pink-50/75 to-rose-100/60 border-rose-300/80 shadow-[0_12px_36px_rgba(244,63,94,0.12)] ring-1 ring-rose-300/50'
                : 'bg-gradient-to-br from-rose-950/40 via-[#190c1a]/85 to-[#0b1120]/95 border-rose-500/35 shadow-[0_14px_40px_rgba(244,63,94,0.22)] ring-1 ring-rose-500/20'
              : cardCls
          }`}
        >
          {/* Subtle Ambient Romantic Glow Behind Card when active */}
          {config.girlfriendMode && (
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-rose-500/15 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
          )}

          {/* Header Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  config.girlfriendMode
                    ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/30'
                    : isLight
                    ? 'bg-rose-100 text-rose-500'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                <Heart
                  className={`w-4.5 h-4.5 transition-transform ${
                    config.girlfriendMode ? 'fill-white animate-pulse scale-105' : 'text-rose-500'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Girlfriend Mode
                  </h2>
                  {config.girlfriendMode ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-2xs">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      Romantic & Loving
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-slate-500/15 text-slate-400 border border-slate-500/20">
                      Standard
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {config.girlfriendMode
                    ? `${config.assistantName || 'Maya'} interacts as your affectionate, loving romantic partner`
                    : "Maya's romantic companion side"}
                </p>
              </div>
            </div>

            {/* Romantic Toggle Switch */}
            <button
              type="button"
              onClick={() => update({ girlfriendMode: !config.girlfriendMode })}
              className={`w-12 h-6.5 rounded-full transition-all duration-300 relative shrink-0 cursor-pointer shadow-inner ${
                config.girlfriendMode
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_2px_12px_rgba(244,63,94,0.4)]'
                  : isLight
                  ? 'bg-slate-300'
                  : 'bg-slate-700/60'
              }`}
              title={config.girlfriendMode ? 'Deactivate Girlfriend Mode' : 'Activate Romantic Girlfriend Mode'}
            >
              <span
                className={`absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-white transition-all duration-300 flex items-center justify-center shadow-md ${
                  config.girlfriendMode ? 'translate-x-5.5' : ''
                }`}
              >
                {config.girlfriendMode && (
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                )}
              </span>
            </button>
          </div>

          {/* Romantic Controls & Audio Preview Section */}
          <div
            className={`pt-2 space-y-3 relative z-10 border-t transition-all ${
              config.girlfriendMode
                ? isLight
                  ? 'border-rose-200/80'
                  : 'border-rose-500/20'
                : isLight
                ? 'border-slate-100'
                : 'border-white/5'
            }`}
          >
            {/* Romantic Greeting Audio Preview */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {config.girlfriendMode
                    ? `Hear ${config.assistantName || 'Maya'}'s romantic voice`
                    : 'Preview romantic voice tone'}
                </span>
              </div>
              <button
                type="button"
                onClick={playRomanticPreview}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  playingRomanticSample
                    ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30 animate-pulse'
                    : isLight
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200/80 border border-rose-200'
                    : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30'
                }`}
                title="Listen to romantic voice sample"
              >
                <Volume2 className={`w-3.5 h-3.5 ${playingRomanticSample ? 'animate-bounce' : ''}`} />
                <span>{playingRomanticSample ? 'Speaking with Love...' : 'Hear Sweet Voice'}</span>
              </button>
            </div>

            {/* Romantic Affection Vibe Selection */}
            {config.girlfriendMode && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-rose-900/75' : 'text-rose-300/85'}`}>
                    Romantic Vibe & Tone
                  </span>
                  <span className={`text-[11px] font-medium ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                    {config.romanticStyle || 'Sweet & Caring'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'Sweet & Caring', label: 'Sweet & Caring', desc: 'Warm hugs & care' },
                      { id: 'Playful & Flirty', label: 'Playful & Flirty', desc: 'Teasing & sparks' },
                      { id: 'Deeply Devoted', label: 'Deeply Devoted', desc: 'Emotional depth' },
                    ] as const
                  ).map((style) => {
                    const active = (config.romanticStyle || 'Sweet & Caring') === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => update({ romanticStyle: style.id })}
                        className={`px-2 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                          active
                            ? isLight
                              ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                              : 'bg-rose-600 text-white border-rose-500 shadow-xs shadow-rose-600/30'
                            : isLight
                            ? 'bg-white/90 hover:bg-rose-50/80 border-rose-200 text-slate-700'
                            : 'bg-white/5 hover:bg-rose-500/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <span className="text-[11px] font-bold block truncate">{style.label}</span>
                        <span
                          className={`text-[9px] block truncate ${
                            active ? 'text-rose-100' : isLight ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {style.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Endearment / Pet Name */}
            {config.girlfriendMode && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-medium shrink-0 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    What she calls you (আদুরে ডাক):
                  </span>
                  <input
                    type="text"
                    value={config.petName || ''}
                    onChange={(e) => update({ petName: e.target.value })}
                    placeholder="e.g. সোনা, বাবু, জান"
                    className={`w-28 px-2 py-1 rounded-lg text-xs font-medium border text-center transition-all ${
                      isLight
                        ? 'bg-white border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-400'
                        : 'bg-white/10 border-rose-500/40 text-rose-200 focus:ring-2 focus:ring-rose-500'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {['সোনা', 'বাবু', 'জান', 'Sweetheart', 'Babe', 'My Love', 'Hunter'].map((name) => {
                    const isSelected = (config.petName || 'সোনা') === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => update({ petName: name })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-xs'
                            : isLight
                            ? 'bg-rose-100/70 hover:bg-rose-200 text-rose-800'
                            : 'bg-white/10 hover:bg-white/15 text-slate-300'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Romantic Info Callout */}
            <div
              className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border transition-all ${
                config.girlfriendMode
                  ? isLight
                    ? 'bg-rose-100/50 text-rose-900 border-rose-200/80'
                    : 'bg-rose-950/30 text-rose-200 border-rose-500/20'
                  : calloutCls
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  config.girlfriendMode ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                }`}
              />
              <span className="leading-relaxed">
                {config.girlfriendMode
                  ? `${config.assistantName || 'Maya'} speaks with romantic warmth, tender check-ins, and emotional closeness in live voice calls and chats.`
                  : 'Enable girlfriend mode for affectionate romance, sweet compliments, and loving voice companion interactions.'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Memory */}
        <div className={`${cardCls} space-y-3.5`}>
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-blue-500" />
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Memory</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>What Maya is allowed to remember</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="pr-3">
              <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Let Maya remember on her own</p>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                She saves durable facts she picks up — people, preferences, routines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ rememberOnHerOwn: !config.rememberOnHerOwn })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                config.rememberOnHerOwn ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.rememberOnHerOwn ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="pr-3">
              <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Incognito</p>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Turn on to pause new memories without deleting anything.
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ incognito: !config.incognito })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                config.incognito ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.incognito ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className={calloutCls}>
            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
            <span>
              Passwords, OTPs, PINs and card numbers are never stored. Memories stay local on your device.
            </span>
          </div>
        </div>

        {/* 5. Voice */}
        <div className={`${cardCls} space-y-3.5`}>
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-blue-500" />
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Voice</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tap to listen, then pick</p>
            </div>
          </div>

          {/* Voice Tabs: Maya / Friday / Venom */}
          <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#090e1b] border-white/10'
          }`}>
            {(['Maya', 'Friday', 'Venom'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => update({ voiceTab: tab })}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  config.voiceTab === tab
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Voice list items */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {MAYA_VOICES.map((v) => {
              const fullKey = `${v.name} (${v.sub})`;
              const isSelected = config.selectedVoice === fullKey;
              return (
                <div
                  key={fullKey}
                  onClick={() => update({ selectedVoice: fullKey })}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-blue-600/15 border-blue-500/40 text-white'
                      : isLight
                      ? 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                      : 'bg-[#090e1b]/70 border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-semibold">{v.name}</h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{v.sub}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreviewVoice(v.name);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isLight ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/30'
                      }`}
                      title={`Preview ${v.name}`}
                    >
                      <Play
                        className={`w-3.5 h-3.5 fill-current ${
                          playingVoice === v.name ? 'animate-pulse text-amber-500' : ''
                        }`}
                      />
                    </button>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Language matching Screenshot 5 */}
        <div id="assistant-language-selection-card" className={`${cardCls} space-y-3.5 border-blue-500/20 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Language & Natural Voice
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Molla speaks & understands in this native voice
                </p>
              </div>
            </div>

            {/* Quick Play Sample for current language */}
            <button
              type="button"
              onClick={() => playPreviewLanguageVoice(currentLangObj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                playingLangSample === currentLangObj.code
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md animate-pulse'
                  : isLight
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  : 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/20'
              }`}
              title="Hear natural voice sample in this language"
            >
              <Volume2 className={`w-3.5 h-3.5 ${playingLangSample === currentLangObj.code ? 'animate-bounce' : ''}`} />
              <span>{playingLangSample === currentLangObj.code ? 'Speaking...' : 'Listen Voice'}</span>
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className={`w-full px-3.5 py-3 rounded-xl border text-sm flex items-center justify-between transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-slate-50 border-slate-200/90 text-slate-900 hover:bg-slate-100'
                  : 'bg-[#090e1b] border-white/10 text-white hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-semibold">
                  {currentLangObj.code}
                </span>
                <span className="font-semibold text-sm truncate">
                  {currentLangObj.label}
                </span>
              </div>
              <div className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                {isLanguageOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isLanguageOpen && (
              <div className={`mt-2 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-30 ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0a0f1d] border-white/15'
              }`}>
                {/* Search Bar */}
                <div className={`p-2.5 border-b flex items-center gap-2 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0e1628]/90 border-white/10'
                }`}>
                  <Search className={`w-4 h-4 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder="Search language (e.g. Bengali, Hindi, Urdu, English)..."
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    className={`w-full bg-transparent text-xs placeholder:text-slate-400 focus:outline-none ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                    autoFocus
                  />
                  {languageSearch && (
                    <button
                      type="button"
                      onClick={() => setLanguageSearch('')}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Languages List */}
                <div className={`max-h-72 overflow-y-auto divide-y py-1 ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
                  {MAYA_LANGUAGES.filter(
                    (lang) =>
                      lang.label.toLowerCase().includes(languageSearch.toLowerCase()) ||
                      lang.sub.toLowerCase().includes(languageSearch.toLowerCase()) ||
                      lang.nativeName.toLowerCase().includes(languageSearch.toLowerCase()) ||
                      lang.code.toLowerCase().includes(languageSearch.toLowerCase())
                  ).map((lang) => {
                    const isSelected = currentLangObj.code === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang)}
                        className={`w-full px-3.5 py-2.5 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? isLight
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'bg-blue-600/20 text-blue-300 font-semibold'
                            : isLight
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-slate-500/15 text-slate-400">
                            {lang.code}
                          </span>
                          <div className="truncate">
                            <span className="text-sm font-medium block truncate">{lang.label}</span>
                            <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              Native: {lang.nativeName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playPreviewLanguageVoice(lang);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              playingLangSample === lang.code
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : isLight
                                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                                : 'bg-white/10 hover:bg-white/20 text-slate-300'
                            }`}
                            title={`Play ${lang.sub} natural voice sample`}
                          >
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </button>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={calloutCls}>
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
            <span>
              Voice calls, real-time conversations, and AI speech automatically speak in this selected natural language.
            </span>
          </div>
        </div>

        {/* 7. Auto start */}
        <div className={`${cardCls} space-y-3`}>
          <div className="flex items-center gap-2.5">
            <Mic className="w-4 h-4 text-blue-500" />
            <div>
              <h2 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Auto start</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Wake word reactivation after you stop</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="pr-3">
              <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Bring wake word back after stop</p>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                5 seconds after stopping, "Hey Maya" / "Hey Molla" listens again automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ autoStartWakeWord: !config.autoStartWakeWord })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                config.autoStartWakeWord ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.autoStartWakeWord ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
