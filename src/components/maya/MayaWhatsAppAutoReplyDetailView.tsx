import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  MessageCircle,
  Users,
  Sparkles,
  ChevronRight,
  Send,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadWhatsAppAutoReplyConfig,
  saveWhatsAppAutoReplyConfig,
  MayaWhatsAppAutoReplyConfig,
} from './mayaStorage';

interface MayaWhatsAppAutoReplyDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  onOpenPermissions?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaWhatsAppAutoReplyDetailView: React.FC<MayaWhatsAppAutoReplyDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  onOpenPermissions,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaWhatsAppAutoReplyConfig>(loadWhatsAppAutoReplyConfig);
  const [newAllowlistContact, setNewAllowlistContact] = useState('');
  const [testSender, setTestSender] = useState('Rahul (Client)');
  const [testIncomingText, setTestIncomingText] = useState('Hi Hunter, are we on track for the project delivery today?');
  const [testReplyResult, setTestReplyResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const update = (partial: Partial<MayaWhatsAppAutoReplyConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      saveWhatsAppAutoReplyConfig(next);
      return next;
    });
  };

  const handleAddAllowlist = () => {
    if (!newAllowlistContact.trim()) return;
    update({
      customAllowlist: [...config.customAllowlist, newAllowlistContact.trim()],
    });
    setNewAllowlistContact('');
  };

  const handleRemoveAllowlist = (index: number) => {
    update({
      customAllowlist: config.customAllowlist.filter((_, i) => i !== index),
    });
  };

  const insertTag = (tag: string) => {
    update({ replyPrompt: `${config.replyPrompt} ${tag}` });
  };

  const handleSimulateReply = () => {
    setIsSimulating(true);
    setTestReplyResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      setTestReplyResult(
        `Hi ${testSender.split(' ')[0]}! Hunter is currently tied up in an important session. I have noted your message regarding "${testIncomingText.slice(0, 35)}..." and he will get back to you shortly. — Maya (Automated AI Assistant)`
      );
    }, 1200);
  };

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg space-y-3.5 transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  const innerGroupCls = `rounded-2xl border divide-y transition-colors ${
    isLight
      ? 'bg-slate-50/80 border-slate-200/80 divide-slate-200/70'
      : 'bg-[#0a101d] border-white/5 divide-white/5'
  }`;

  const inputCls = `px-3 py-2 rounded-xl border text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
    isLight
      ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
      : 'bg-[#090e1b] border-white/10 text-white placeholder-slate-500'
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
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
          WhatsApp auto-reply
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

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-12 scrollbar-thin">
        {/* Amber Notification Warning */}
        <div
          className={`rounded-2xl border p-3.5 shadow-sm space-y-2 backdrop-blur-xl ${
            isLight
              ? 'bg-amber-50/85 border-amber-200/90 text-amber-900'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                isLight
                  ? 'bg-amber-100 border-amber-200 text-amber-700'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p
                className={`text-xs leading-relaxed font-medium ${
                  isLight ? 'text-amber-900' : 'text-amber-200/90'
                }`}
              >
                Notification access is off, so Maya cannot see or answer WhatsApp messages. Turn it on in Settings → Advanced → Permissions first.
              </p>
            </div>
          </div>
          {onOpenPermissions && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onOpenPermissions}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                }`}
              >
                <span>Open Permissions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* CARD 1: Auto-reply */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Auto-reply
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Let Maya answer when someone texts you
              </p>
            </div>
          </div>

          <div className={innerGroupCls}>
            {/* Enable switch */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Enable WhatsApp auto-reply
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Allows Maya to formulate smart contextual responses
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.enabled}
                onClick={() => update({ enabled: !config.enabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.enabled
                    ? 'bg-emerald-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reply to groups too */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Reply to groups too
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Default is direct messages only
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.replyToGroups}
                onClick={() => update({ replyToGroups: !config.replyToGroups })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.replyToGroups
                    ? 'bg-emerald-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.replyToGroups ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cozy delay */}
            <div className="p-3.5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Cozy delay
                </span>
                <span
                  className={`text-[11px] leading-relaxed block mt-0.5 ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Wait 3–8s before replying so it feels natural
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.cozyDelay}
                onClick={() => update({ cozyDelay: !config.cozyDelay })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.cozyDelay
                    ? 'bg-blue-600'
                    : isLight
                    ? 'bg-slate-300'
                    : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.cozyDelay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Allowed contacts */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Allowed contacts
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Who she is allowed to reply to
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['Everyone', 'Only contacts', 'Custom allowlist'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ allowedContacts: mode })}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                  config.allowedContacts === mode
                    ? isLight
                      ? 'bg-blue-100/90 border-blue-400 text-blue-700 font-semibold shadow-xs'
                      : 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : isLight
                    ? 'bg-slate-50/80 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#0a101d] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {config.allowedContacts === 'Custom allowlist' && (
            <div
              className={`space-y-2 pt-2 border-t ${
                isLight ? 'border-slate-200/80' : 'border-white/5'
              }`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllowlistContact}
                  onChange={(e) => setNewAllowlistContact(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllowlist()}
                  placeholder="Enter name or phone number..."
                  className={`flex-1 ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={handleAddAllowlist}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {config.customAllowlist.length === 0 ? (
                <p
                  className={`text-[11px] italic py-1 ${
                    isLight ? 'text-slate-500' : 'text-slate-500'
                  }`}
                >
                  No contacts added yet. Add people who Maya is authorized to reply to.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin">
                  {config.customAllowlist.map((c, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                        isLight
                          ? 'bg-slate-50/90 border-slate-200 text-slate-800'
                          : 'bg-[#0a101d] border-white/5 text-slate-200'
                      }`}
                    >
                      <span className="font-medium">{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowlist(idx)}
                        className={`p-1 transition-colors ${
                          isLight
                            ? 'text-slate-400 hover:text-rose-600'
                            : 'text-slate-500 hover:text-rose-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 3: Reply style & prompt */}
        <div className={cardCls}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isLight
                  ? 'bg-purple-50 border-purple-200 text-purple-600'
                  : 'bg-purple-500/15 border-purple-500/25 text-purple-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Reply style &amp; prompt
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                How she should respond
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={config.replyPrompt}
              onChange={(e) => update({ replyPrompt: e.target.value })}
              className={`w-full p-3 rounded-xl border leading-relaxed resize-none font-mono text-xs focus:outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 text-slate-800 focus:border-purple-500 placeholder-slate-400'
                  : 'bg-[#0a101d] border-white/10 text-white placeholder-slate-500 focus:border-purple-500'
              }`}
              placeholder="Enter system prompt for WhatsApp auto-reply..."
            />

            {/* Quick tags */}
            <div className="flex flex-wrap gap-1.5">
              {['[Sender Name]', '[Message]', '[Current Time]', '[Status: Busy]'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => insertTag(tag)}
                  className={`px-2 py-1 rounded-md border text-[10px] transition-colors font-mono cursor-pointer active:scale-95 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                  }`}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: Test Simulator */}
        <div className={cardCls}>
          <h3
            className={`text-xs font-semibold uppercase tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Live Reply Simulation
          </h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={testSender}
                onChange={(e) => setTestSender(e.target.value)}
                placeholder="Sender name"
                className={`w-1/3 ${inputCls}`}
              />
              <input
                type="text"
                value={testIncomingText}
                onChange={(e) => setTestIncomingText(e.target.value)}
                placeholder="Incoming message text"
                className={`flex-1 ${inputCls}`}
              />
            </div>

            <button
              type="button"
              onClick={handleSimulateReply}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20 disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Drafting Natural Reply...' : 'Simulate WhatsApp Reply'}</span>
            </button>

            {testReplyResult && (
              <div
                className={`mt-3 p-3.5 rounded-xl border space-y-1.5 animate-in fade-in duration-200 ${
                  isLight
                    ? 'bg-emerald-50/90 border-emerald-300 text-slate-800'
                    : 'bg-[#0a101d] border-emerald-500/20 text-slate-200'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                    isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Maya drafted message:</span>
                </div>
                <p className="text-xs leading-relaxed font-sans pl-5">
                  &ldquo;{testReplyResult}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
