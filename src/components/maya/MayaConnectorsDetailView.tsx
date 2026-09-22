import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Search,
  ChevronRight,
  Lightbulb,
  Check,
  X,
  Database,
  ExternalLink,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadConnectorsConfig,
  saveConnectorsConfig,
  MayaConnectorsConfig,
  MayaConnectorItem,
} from './mayaStorage';

interface MayaConnectorsDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

const CATEGORIES = ['All', 'Files', 'Code', 'Notes & tasks', 'Messages'] as const;

export const MayaConnectorsDetailView: React.FC<MayaConnectorsDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaConnectorsConfig>(loadConnectorsConfig);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<MayaConnectorItem | null>(null);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        connectors: prev.connectors.map((item) =>
          item.id === id ? { ...item, connected: !item.connected } : item
        ),
      };
      saveConnectorsConfig(updated);
      return updated;
    });
  };

  const filteredConnectors = config.connectors.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getConnectorBadge = (item: MayaConnectorItem) => {
    switch (item.id) {
      case 'gdrive':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-xs'
                : 'bg-[#1a2942] border-blue-500/20 text-yellow-400'
            }`}
          >
            ▲
          </div>
        );
      case 'github':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                : 'bg-[#162035] border-white/10 text-white'
            }`}
          >
            🐙
          </div>
        );
      case 'vercel':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                : 'bg-[#162035] border-white/10 text-white'
            }`}
          >
            ▲
          </div>
        );
      case 'notion':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                : 'bg-[#162035] border-white/10 text-white'
            }`}
          >
            N
          </div>
        );
      case 'telegram':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-sky-50 border-sky-200 text-sky-600 shadow-xs'
                : 'bg-[#12283e] border-sky-500/20 text-sky-400'
            }`}
          >
            ✈
          </div>
        );
      case 'todoist':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                : 'bg-[#29171f] border-rose-500/20 text-rose-400'
            }`}
          >
            ✓
          </div>
        );
      case 'gitlab':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-xs'
                : 'bg-[#2b1f1a] border-orange-500/20 text-orange-400'
            }`}
          >
            🦊
          </div>
        );
      case 'linear':
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-xs'
                : 'bg-[#1b1c35] border-indigo-500/20 text-indigo-400'
            }`}
          >
            ⚡
          </div>
        );
      default:
        return (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                : 'bg-[#162035] border-white/10 text-white'
            }`}
          >
            {item.iconLetter}
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Top Header with Frosted Glass */}
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
          Connectors
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

      {/* 2. Scrollable Body Container with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Search Input with Frosted Glass */}
        <div className="relative">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isLight ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connectors"
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-blue-500 transition-all backdrop-blur-xl ${
              isLight
                ? 'bg-white/85 border-white/95 shadow-[0_4px_20px_rgba(15,23,42,0.04)] text-slate-900 placeholder:text-slate-400'
                : 'bg-[#0e1628]/75 border-white/10 text-white placeholder:text-slate-500 shadow-md'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer backdrop-blur-xl ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95'
                    : isLight
                    ? 'bg-white/80 text-slate-700 border border-slate-200/80 hover:bg-white shadow-xs'
                    : 'bg-[#0e1628]/75 text-slate-300 border border-white/8 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* CONNECTORS Section with Frosted Glass */}
        <div>
          <h2
            className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-1 font-mono ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            CONNECTORS
          </h2>

          <div
            className={`rounded-[24px] border backdrop-blur-2xl overflow-hidden transition-all divide-y ${
              isLight
                ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] divide-slate-200/70'
                : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] divide-white/8'
            }`}
          >
            {filteredConnectors.length === 0 ? (
              <div
                className={`p-6 text-center text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                No connectors found matching "{searchQuery}" in {selectedCategory}.
              </div>
            ) : (
              filteredConnectors.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModalItem(item)}
                  className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer group ${
                    isLight ? 'hover:bg-slate-50/80' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {getConnectorBadge(item)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold transition-colors ${
                            isLight
                              ? 'text-slate-900 group-hover:text-blue-600'
                              : 'text-white group-hover:text-blue-300'
                          }`}
                        >
                          {item.name}
                        </h3>
                        {item.connected && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              isLight
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            Connected
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isLight
                        ? 'text-slate-400 group-hover:text-slate-700'
                        : 'text-slate-500 group-hover:text-white'
                    }`}
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Bottom Tip with Frosted Glass */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl text-xs ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/80 text-blue-950 shadow-xs'
              : 'bg-blue-950/30 border-blue-500/25 text-blue-300'
          }`}
        >
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
          <p className="leading-relaxed">
            Connector credentials stay on this phone, encrypted. Maya never sends them anywhere, and disconnecting deletes them.
          </p>
        </div>
      </div>

      {/* Modal for connecting / disconnecting a connector with Frosted Glass */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in select-none">
          <div
            className={`w-full max-w-sm rounded-[28px] border backdrop-blur-3xl p-5 space-y-4 shadow-2xl transition-all ${
              isLight
                ? 'bg-white/95 border-white text-slate-800'
                : 'bg-[#0b1222]/90 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getConnectorBadge(activeModalItem)}
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {activeModalItem.name}
                  </h3>
                  <p
                    className={`text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {activeModalItem.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p
              className={`text-xs leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {activeModalItem.description}. When connected, Maya can access synced files and task cycles locally on your device with end-to-end token encryption.
            </p>

            {modalSuccessMsg && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toggleConnection(activeModalItem.id);
                  const isNow = !activeModalItem.connected;
                  setModalSuccessMsg(
                    isNow
                      ? `${activeModalItem.name} connected successfully!`
                      : `${activeModalItem.name} disconnected.`
                  );
                  setActiveModalItem({
                    ...activeModalItem,
                    connected: isNow,
                  });
                  setTimeout(() => setModalSuccessMsg(null), 2000);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  activeModalItem.connected
                    ? isLight
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20'
                }`}
              >
                {activeModalItem.connected ? 'Disconnect' : 'Connect Account'}
              </button>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#121c32] hover:bg-[#182644] text-slate-300 border-white/10'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
