import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Cpu,
  Plus,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadSubAgentConfig,
  saveSubAgentConfig,
  MayaSubAgentConfig,
} from './mayaStorage';

interface MayaSubAgentsDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaSubAgentsDetailView: React.FC<MayaSubAgentsDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaSubAgentConfig>(loadSubAgentConfig);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newModel, setNewModel] = useState('');

  const update = (partial: Partial<MayaSubAgentConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveSubAgentConfig(next);
      return next;
    });
  };

  const handleAddProvider = () => {
    if (!newName.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      name: newName.trim(),
      model: newModel.trim() || 'Custom model',
      enabled: true,
    };
    update({ providers: [...config.providers, newEntry] });
    setNewName('');
    setNewModel('');
    setIsAdding(false);
  };

  const handleDeleteProvider = (id: string) => {
    update({ providers: config.providers.filter((p) => p.id !== id) });
  };

  const handleToggleProvider = (id: string) => {
    update({
      providers: config.providers.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
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
          Sub-agents
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

      {/* Content matching Screenshot 3 with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Card 1: Custom providers toggle & Providers list */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Custom providers
            </span>
            <button
              type="button"
              onClick={() => update({ customProviders: !config.customProviders })}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                config.customProviders ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700/60'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.customProviders ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-slate-200/80' : 'border-white/10'}`}>
            <h2
              className={`text-xs font-bold uppercase tracking-wider font-mono ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Providers
            </h2>

            {/* Existing Providers */}
            <div className="space-y-2">
              {config.providers.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border backdrop-blur-xl transition-all ${
                    isLight
                      ? 'bg-slate-50/90 border-slate-200/80 shadow-xs'
                      : 'bg-[#090e1b]/80 border-white/8'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isLight
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                      }`}
                    >
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-semibold ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={`text-xs ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {p.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleProvider(p.id)}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                        p.enabled ? 'bg-blue-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          p.enabled ? 'translate-x-4' : ''
                        }`}
                      />
                    </button>
                    {config.providers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProvider(p.id)}
                        className={`p-1.5 transition-colors cursor-pointer ${
                          isLight
                            ? 'text-slate-400 hover:text-red-500'
                            : 'text-slate-500 hover:text-red-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom provider inline form */}
            {isAdding ? (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 backdrop-blur-xl ${
                  isLight
                    ? 'bg-slate-50 border-blue-300 shadow-sm'
                    : 'bg-[#090e1b] border-blue-500/40 shadow-md'
                }`}
              >
                <input
                  type="text"
                  placeholder="Provider Name (e.g. Anthropic, DeepSeek)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Model Identifier (e.g. claude-3-5-sonnet)"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border transition-colors focus:outline-none focus:border-blue-500 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  }`}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProvider}
                    className="px-3.5 py-1.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Save Provider
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className={`w-full py-2.5 px-3 rounded-2xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isLight
                    ? 'border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-white/5 text-blue-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add custom provider
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Strategy Selector matching screenshot with Frosted Glass UI */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-3 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="space-y-1">
            <h2
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Strategy
            </h2>
            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              How Maya picks among enabled providers. "Ranked" tries each in order until one responds;
              "Best first" scores each provider's strengths against the task; "All at once" queries all
              simultaneously and picks the best answer.
            </p>
          </div>

          <div className="relative">
            <select
              value={config.strategy}
              onChange={(e) => update({ strategy: e.target.value as any })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-10 backdrop-blur-xl ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
                  : 'bg-[#090e1b] border-white/10 text-white'
              }`}
            >
              <option value="ranked">Ranked</option>
              <option value="best_first">Best first</option>
              <option value="all_at_once">All at once</option>
            </select>
            <div
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Tip box */}
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl border backdrop-blur-xl text-xs ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900 shadow-xs'
              : 'bg-blue-950/30 border-blue-500/25 text-blue-300'
          }`}
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <span className="leading-relaxed">
            Sub-agents handle background reasoning and heavy coding playbooks. Changes take effect on
            next request.
          </span>
        </div>
      </div>
    </div>
  );
};
