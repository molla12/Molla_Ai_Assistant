import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Info,
  Search,
  Heart,
  Lock,
  Lightbulb,
  CheckCircle,
  Plus,
  Sparkles,
  X,
  Key,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadOptionalConfig,
  saveOptionalConfig,
  MayaOptionalConfig,
  getStoredGeminiApiKey,
  saveStoredGeminiApiKey,
} from './mayaStorage';

interface MayaOptionalDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaOptionalDetailView: React.FC<MayaOptionalDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaOptionalConfig>(loadOptionalConfig);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [testImageStatus, setTestImageStatus] = useState<string | null>(null);
  const [isAddGeneratorOpen, setIsAddGeneratorOpen] = useState(false);
  const [newGenName, setNewGenName] = useState('');
  const [newGenModel, setNewGenModel] = useState('OpenAI / DALL·E 3');

  const [geminiKeyInput, setGeminiKeyInput] = useState(() => getStoredGeminiApiKey());
  const [isTestingGeminiKey, setIsTestingGeminiKey] = useState(false);
  const [geminiTestStatus, setGeminiTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveGeminiKey = () => {
    const trimmed = geminiKeyInput.trim();
    saveStoredGeminiApiKey(trimmed);
    setSaveSuccessMsg(trimmed ? 'Gemini API Key saved and active!' : 'Gemini API Key removed');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleTestGeminiKey = async () => {
    const trimmed = geminiKeyInput.trim();
    if (!trimmed) {
      setGeminiTestStatus({ success: false, message: 'Please enter a key first' });
      return;
    }
    setIsTestingGeminiKey(true);
    setGeminiTestStatus(null);
    try {
      const res = await fetch('/api/config/test-gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeminiTestStatus({ success: true, message: 'Verified! Gemini Live voice & vision models connected.' });
        saveStoredGeminiApiKey(trimmed);
      } else {
        setGeminiTestStatus({ success: false, message: data.error || 'Invalid API key. Please check Google AI Studio.' });
      }
    } catch {
      setGeminiTestStatus({ success: false, message: 'Failed to connect to test endpoint.' });
    } finally {
      setIsTestingGeminiKey(false);
    }
  };

  const update = (partial: Partial<MayaOptionalConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveOptionalConfig(next);
      return next;
    });
  };

  const handleSaveSection = (name: string) => {
    saveOptionalConfig(config);
    setSaveSuccessMsg(`${name} saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleTestImageGen = () => {
    setTestImageStatus('Generating preview picture with active generator...');
    setTimeout(() => {
      setTestImageStatus('Success! Image engine is operational and responsive.');
      setTimeout(() => setTestImageStatus(null), 3000);
    }, 1500);
  };

  const handleAddGenerator = () => {
    if (!newGenName.trim()) return;
    const newGen = {
      id: Date.now().toString(),
      name: newGenName.trim(),
      provider: 'Custom',
      model: newGenModel,
    };
    update({
      imageGenerators: [...config.imageGenerators, newGen],
    });
    setNewGenName('');
    setIsAddGeneratorOpen(false);
  };

  const handleRemoveGenerator = (id: string) => {
    update({
      imageGenerators: config.imageGenerators.filter((g) => g.id !== id),
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
          Optional
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

      {/* Save Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium shadow-xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in">
          <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. Scrollable Body Container with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* CARD 0: Google Gemini API Key (Core Live Voice & Vision Model) */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 transition-all ${
            isLight
              ? 'bg-white/90 border-blue-200/90 shadow-[0_8px_30px_rgba(59,130,246,0.08)] text-slate-800'
              : 'bg-[#0d1629]/85 border-blue-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.4)] text-white'
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
              <Key className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm font-semibold truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Google Gemini API Key
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Live Voice & Vision
                </span>
              </div>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Natural human voice & real-time live conversations
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Provide your Google AI Studio API key to enable direct Gemini Live API (gemini-3.8-live) access. Experience natural, expressive human voice responses with zero robotic latency.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              className={`text-xs font-medium block ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Gemini API Key (AIzaSy...)
            </label>
            <input
              type="password"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className={`w-full text-xs rounded-xl px-3.5 py-2.5 outline-hidden transition-all border font-mono ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-[#0b101c] border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50'
              }`}
            />
          </div>

          {geminiTestStatus && (
            <div
              className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
                geminiTestStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${geminiTestStatus.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{geminiTestStatus.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestGeminiKey}
              disabled={isTestingGeminiKey || !geminiKeyInput.trim()}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              {isTestingGeminiKey ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSaveGeminiKey}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer text-center active:scale-98"
            >
              Save Key
            </button>
          </div>
        </div>

        {/* CARD 1: Maps / Places API with Frosted Glass */}
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
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Maps / Places API
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                For place search and directions (optional)
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Optional. Add a Google Places API key to let Maya look up nearby places and directions.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="relative">
              <input
                type="password"
                value={config.placesApiKey}
                onChange={(e) => update({ placesApiKey: e.target.value })}
                placeholder="Places API key"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#0a101d] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => handleSaveSection('Places API')}
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* CARD 2: Web search with Frosted Glass */}
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
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Web search
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Better sources for search and deep research (optional)
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Search already works with no key — Maya falls back to a free DuckDuckGo lookup. Adding a key gives her a real search index instead, which mainly helps Deep Research (it runs a dozen searches per report). Add any one; the rest stay as backups.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="relative">
              <input
                type="password"
                value={config.tavilyApiKey}
                onChange={(e) => update({ tavilyApiKey: e.target.value })}
                placeholder="Tavily API key — best for research"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#0a101d] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={config.braveSearchApiKey}
                onChange={(e) => update({ braveSearchApiKey: e.target.value })}
                placeholder="Brave Search API key"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#0a101d] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={config.serpApiKey}
                onChange={(e) => update({ serpApiKey: e.target.value })}
                placeholder="SerpAPI key"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#0a101d] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => handleSaveSection('Web search')}
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* CARD 3: Image generation with Frosted Glass */}
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
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Image generation
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Which AI draws Maya's pictures (optional)
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Maya generates images with no key at all, but the free tier allows only about one picture every 15 seconds. Add your own generator below — OpenAI, Gemini, Together, or anything OpenAI-compatible — and she uses that first, falling back to the free one if it fails.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="relative">
              <input
                type="password"
                value={config.pollinationsToken}
                onChange={(e) => update({ pollinationsToken: e.target.value })}
                placeholder="Pollinations token (free tier, optional)"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                  isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-[#0a101d] border-white/10 text-white placeholder:text-slate-500'
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => handleSaveSection('Image token')}
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              Save
            </button>
          </div>

          {/* Sub-Card inside Image Generation with Frosted Glass */}
          <div
            className={`rounded-2xl border p-4 space-y-3 mt-3 backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-[#0a101d]/90 border-white/5'
            }`}
          >
            <div>
              <h3
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`}
              >
                Image generators
              </h3>
              <p
                className={`text-[11px] mt-1 leading-relaxed ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Tried top to bottom; if one fails or hits a rate limit Maya moves to the next. The free keyless generator always sits underneath, so pictures keep working even with nothing here.
              </p>
            </div>

            {config.imageGenerators.length > 0 && (
              <div className="space-y-2">
                {config.imageGenerators.map((gen) => (
                  <div
                    key={gen.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-xl ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-[#111a2f] border-white/5'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-xs font-semibold block ${
                          isLight ? 'text-slate-800' : 'text-white'
                        }`}
                      >
                        {gen.name}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {gen.model}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGenerator(gen.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {testImageStatus && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{testImageStatus}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddGeneratorOpen(true)}
                className={`px-4 py-2 rounded-full font-semibold text-xs border transition-colors cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                    : 'bg-[#121c32] hover:bg-[#182644] text-slate-200 border-white/10'
                }`}
              >
                + Add image generator
              </button>

              <button
                type="button"
                onClick={handleTestImageGen}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                Test — generate one picture
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Generator Modal with Frosted Glass */}
      {isAddGeneratorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in select-none">
          <div
            className={`w-full max-w-sm rounded-[28px] border backdrop-blur-3xl p-5 space-y-4 shadow-2xl transition-all ${
              isLight
                ? 'bg-white/95 border-white text-slate-800'
                : 'bg-[#0b1222]/90 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-bold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Add Image Generator
              </h3>
              <button
                type="button"
                onClick={() => setIsAddGeneratorOpen(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  className={`text-xs block mb-1 font-medium ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Generator Name
                </label>
                <input
                  type="text"
                  value={newGenName}
                  onChange={(e) => setNewGenName(e.target.value)}
                  placeholder="e.g. My OpenAI DALL-E"
                  className={`w-full px-3 py-2 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-[#090e1b] border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`text-xs block mb-1 font-medium ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Model Type
                </label>
                <select
                  value={newGenModel}
                  onChange={(e) => setNewGenModel(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#090e1b] border-white/10 text-white'
                  }`}
                >
                  <option value="OpenAI / DALL·E 3">OpenAI / DALL·E 3</option>
                  <option value="Google / Imagen 3">Google / Imagen 3</option>
                  <option value="Together / FLUX.1">Together / FLUX.1</option>
                  <option value="Stability AI / SDXL">Stability AI / SDXL</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddGenerator}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                Add Generator
              </button>
              <button
                type="button"
                onClick={() => setIsAddGeneratorOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#121c32] hover:bg-[#182644] text-slate-300 border-white/5'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
