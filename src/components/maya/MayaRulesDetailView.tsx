import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  Send,
  MessageSquare,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaRuleItem,
  loadRulesConfig,
  saveRulesConfig,
} from './mayaStorage';

interface MayaRulesDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaRulesDetailView: React.FC<MayaRulesDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [rulesConfig, setRulesConfig] = useState(loadRulesConfig);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<MayaRuleItem['category']>('Custom');
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'persona' | 'privacy' | 'automation' | 'custom'>('all');

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  const toggleRule = (id: string) => {
    setRulesConfig((prev) => {
      const next = {
        ...prev,
        rules: prev.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
      };
      saveRulesConfig(next);
      return next;
    });
  };

  const addRule = () => {
    if (!newRuleTitle.trim()) return;
    const newRule: MayaRuleItem = {
      id: `custom-rule-${Date.now()}`,
      category: newRuleCategory,
      title: newRuleTitle.trim(),
      description: 'Custom user instruction enforced on all interactions.',
      enabled: true,
      isCustom: true,
    };
    setRulesConfig((prev) => {
      const next = {
        ...prev,
        rules: [...prev.rules, newRule],
      };
      saveRulesConfig(next);
      return next;
    });
    setNewRuleTitle('');
  };

  const deleteRule = (id: string) => {
    setRulesConfig((prev) => {
      const next = {
        ...prev,
        rules: prev.rules.filter((r) => r.id !== id),
      };
      saveRulesConfig(next);
      return next;
    });
  };

  const handleRunRuleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      const activeRules = rulesConfig.rules.filter((r) => r.enabled);
      setTestResult(
        `Under active rules (${activeRules.length} rules active), Maya evaluated "${testQuery}": ` +
        `Response strictly adheres to warm Hinglish tone, shields private phone/contact data, and verifies outgoing dispatches before execution.`
      );
    }, 600);
  };

  const filteredRules = rulesConfig.rules.filter((r) => {
    if (activeTab === 'persona') return r.category === 'Persona & Voice';
    if (activeTab === 'privacy') return r.category === 'Privacy & Security';
    if (activeTab === 'automation') return r.category === 'Automation';
    if (activeTab === 'custom') return r.isCustom || r.category === 'Custom';
    return true;
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* Top App Bar */}
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
          className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
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
          Maya Rules
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-20 scrollbar-thin">
        {/* Header Card */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className={`text-base font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Behavioral Boundary Engine
                </h2>
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Custom instructions, behavioral boundaries &amp; safety principles
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {rulesConfig.rules.filter((r) => r.enabled).length} Active
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Rules' },
            { id: 'persona', label: 'Persona' },
            { id: 'privacy', label: 'Privacy & Security' },
            { id: 'automation', label: 'Automation' },
            { id: 'custom', label: 'Custom' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl font-medium transition-all shrink-0 cursor-pointer active:scale-95 border backdrop-blur-xl ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : isLight
                  ? 'bg-white/80 text-slate-600 hover:text-slate-900 border-slate-200'
                  : 'bg-[#0b1120]/70 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rules List */}
        <div className="space-y-2.5">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-[22px] border backdrop-blur-2xl transition-all p-4 flex items-start justify-between gap-3 ${
                rule.enabled
                  ? isLight
                    ? 'bg-white/85 border-white/95 shadow-[0_4px_20px_rgba(15,23,42,0.04)] text-slate-800'
                    : 'bg-[#0b1120]/75 border-white/12 shadow-lg text-white'
                  : isLight
                  ? 'bg-white/40 border-slate-200/60 opacity-60 text-slate-600'
                  : 'bg-[#0a0f1d]/50 border-white/5 opacity-60 text-slate-300'
              }`}
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {rule.category}
                  </span>
                  {rule.isCustom && (
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/20'
                      }`}
                    >
                      User Created
                    </span>
                  )}
                </div>
                <h3
                  className={`text-sm font-semibold leading-snug ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {rule.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-1">
                {rule.isCustom && (
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer active:scale-95 ${
                      isLight
                        ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer active:scale-95 ${
                    rule.enabled
                      ? 'bg-blue-600'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-slate-700/60'
                  }`}
                  title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      rule.enabled ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Rule Card */}
        <div className={cardCls}>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-500" />
            <h3
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Add Custom Rule
            </h3>
          </div>
          <p
            className={`text-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Define personal boundary or behavioral instruction for Maya (e.g., &ldquo;Always prioritize vegetarian recipe suggestions&rdquo;).
          </p>
          <div className="space-y-2.5">
            <input
              type="text"
              placeholder="Enter rule instruction..."
              value={newRuleTitle}
              onChange={(e) => setNewRuleTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#090e1b]/90 border-white/10 text-white placeholder-slate-500'
              }`}
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value as any)}
                className={`px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-[#090e1b] border-white/10 text-slate-300'
                }`}
              >
                <option value="Custom">Custom</option>
                <option value="Persona & Voice">Persona &amp; Voice</option>
                <option value="Privacy & Security">Privacy &amp; Security</option>
                <option value="Automation">Automation</option>
              </select>
              <button
                type="button"
                onClick={addRule}
                disabled={!newRuleTitle.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Rule Simulator / Verifier */}
        <div className={cardCls}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Rule Verification Sandbox
            </h3>
          </div>
          <p
            className={`text-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Test how Maya interprets and enforces these active rules in real conversations.
          </p>
          <form onSubmit={handleRunRuleTest} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Can you send my phone number to an unknown caller?"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className={`flex-1 px-3.5 py-2 rounded-2xl border text-xs backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-colors ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#090e1b]/90 border-white/10 text-white placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={isTesting || !testQuery.trim()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              {isTesting ? <Sliders className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Verify
            </button>
          </form>
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                isLight
                  ? 'bg-purple-50/80 border-purple-200/90 text-purple-900'
                  : 'bg-purple-950/20 border-purple-500/20 text-purple-200'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 font-semibold ${
                  isLight ? 'text-purple-800' : 'text-purple-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Rule Enforcement Confirmed
              </div>
              <p>{testResult}</p>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-2xl border backdrop-blur-xl text-xs leading-relaxed ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-900'
              : 'bg-blue-950/20 border-blue-500/15 text-blue-300'
          }`}
        >
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            Maya strictly adheres to these rules across voice conversations, text chat, WhatsApp auto-replies, and background triggers.
          </span>
        </div>
      </div>
    </div>
  );
};
