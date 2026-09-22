import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Send,
  PieChart,
  BarChart2,
  FolderPlus,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadMarketsConfig,
  saveMarketsConfig,
  MayaMarketsConfig,
  MayaWatchlistItem,
} from './mayaStorage';

interface MayaMarketsDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaMarketsDetailView: React.FC<MayaMarketsDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaMarketsConfig>(loadMarketsConfig);
  const [activeTab, setActiveTab] = useState<'Watchlist' | 'Portfolio' | 'AI Analysis'>('Watchlist');
  const [symbolInput, setSymbolInput] = useState('');

  const indices = [
    {
      name: 'NIFTY 50',
      val: '25,388.90',
      chg: '+105.40',
      pct: '+0.42%',
      isUp: true,
    },
    {
      name: 'SENSEX',
      val: '83,184.80',
      chg: '+312.20',
      pct: '+0.38%',
      isUp: true,
    },
    {
      name: 'BANK NIFTY',
      val: '51,980.15',
      chg: '+189.50',
      pct: '+0.37%',
      isUp: true,
    },
    {
      name: 'NASDAQ',
      val: '17,948.20',
      chg: '+151.30',
      pct: '+0.85%',
      isUp: true,
    },
    {
      name: 'GOLD (10g)',
      val: '₹74,120',
      chg: '+90.00',
      pct: '+0.12%',
      isUp: true,
    },
    {
      name: 'BTC / USD',
      val: '$64,250.00',
      chg: '+1,350.00',
      pct: '+2.15%',
      isUp: true,
    },
  ];

  const suggestions = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: '₹2,985.40', change: '+1.24%', changeAmount: '+36.50', isUp: true },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: '₹982.10', change: '+2.10%', changeAmount: '+20.15', isUp: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: '₹1,664.30', change: '+0.45%', changeAmount: '+7.40', isUp: true },
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', price: '$64,250.00', change: '+2.15%', changeAmount: '+$1,350', isUp: true },
    { symbol: 'INFY', name: 'Infosys Ltd.', price: '₹1,942.50', change: '-0.32%', changeAmount: '-6.20', isUp: false },
  ];

  const handleAddSymbol = (item?: Partial<MayaWatchlistItem>) => {
    const sym = item?.symbol || symbolInput.trim().toUpperCase();
    if (!sym) return;

    // Check if already in watchlist
    if (config.watchlist.some((w) => w.symbol === sym)) {
      setSymbolInput('');
      return;
    }

    const foundSuggestion = suggestions.find((s) => s.symbol === sym);
    const newEntry: MayaWatchlistItem = {
      symbol: sym,
      name: foundSuggestion?.name || `${sym} Equity`,
      price: foundSuggestion?.price || '₹1,450.00',
      change: foundSuggestion?.change || '+0.85%',
      changeAmount: foundSuggestion?.changeAmount || '+12.30',
      isUp: foundSuggestion ? foundSuggestion.isUp : true,
    };

    const nextConfig = {
      ...config,
      watchlist: [newEntry, ...config.watchlist],
    };
    setConfig(nextConfig);
    saveMarketsConfig(nextConfig);
    setSymbolInput('');
  };

  const handleRemoveSymbol = (symbol: string) => {
    const nextConfig = {
      ...config,
      watchlist: config.watchlist.filter((w) => w.symbol !== symbol),
    };
    setConfig(nextConfig);
    saveMarketsConfig(nextConfig);
  };

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
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
        className={`relative z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between border-b backdrop-blur-2xl shrink-0 transition-colors ${
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
          Markets
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

      {/* Sub-bar: Market Timing status */}
      <div
        className={`px-4 py-1.5 border-b flex items-center justify-between text-[11px] backdrop-blur-xl ${
          isLight
            ? 'bg-slate-50/90 border-slate-200/80 text-slate-600'
            : 'bg-[#0a101d]/90 border-white/5 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>NSE / BSE closed · updated 20:30</span>
        </div>
        <span
          className={`text-[10px] font-mono ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}
        >
          IST (UTC+5:30)
        </span>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-12 scrollbar-thin">
        {/* Horizontal Market Indices Row */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {indices.map((idx, i) => (
            <div
              key={i}
              className={`min-w-[135px] sm:min-w-[150px] p-3 rounded-2xl border shrink-0 shadow-sm space-y-1 backdrop-blur-xl transition-all ${
                isLight
                  ? 'bg-white/85 border-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] text-slate-800'
                  : 'bg-[#0b1120]/75 border-white/10 text-white'
              }`}
            >
              <span
                className={`text-[11px] font-semibold block truncate ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {idx.name}
              </span>
              <span
                className={`text-sm font-bold block font-mono ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {idx.val}
              </span>
              <div
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  idx.isUp
                    ? isLight
                      ? 'text-emerald-600'
                      : 'text-emerald-400'
                    : isLight
                    ? 'text-rose-600'
                    : 'text-rose-400'
                }`}
              >
                {idx.isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{idx.chg}</span>
                <span className="text-[10px]">({idx.pct})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation: Watchlist / Portfolio / AI Analysis */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-2xl border backdrop-blur-xl ${
            isLight
              ? 'bg-white/80 border-slate-200/80 shadow-xs'
              : 'bg-[#0b1120]/75 border-white/10'
          }`}
        >
          {(['Watchlist', 'Portfolio', 'AI Analysis'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center active:scale-95 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: WATCHLIST */}
        {activeTab === 'Watchlist' && (
          <div className="space-y-4">
            {/* Symbol Search and Add Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                  placeholder="Add a symbol (e.g. RELIANCE, TATAMOTORS, BTC)..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border backdrop-blur-xl text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isLight
                      ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0b1120]/80 border-white/10 text-white placeholder-slate-500'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddSymbol()}
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-md shadow-blue-900/20 active:scale-95"
                title="Add to watchlist"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* If Watchlist is empty */}
            {config.watchlist.length === 0 ? (
              <div
                className={`p-8 text-center rounded-[24px] border backdrop-blur-xl space-y-3 shadow-sm ${
                  isLight
                    ? 'bg-white/85 border-white/95 text-slate-800'
                    : 'bg-[#0b1120]/80 border-white/10 text-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
                    isLight
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}
                >
                  <FolderPlus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3
                    className={`text-sm font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Nothing on the watchlist yet.
                  </h3>
                  <p
                    className={`text-xs max-w-sm mx-auto leading-relaxed ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Search above, or just tell Maya &ldquo;Reliance ko watchlist me daal do&rdquo; or &ldquo;Track Bitcoin price&rdquo;.
                  </p>
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block mb-2 ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Popular Suggestions
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => handleAddSymbol(s)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                            : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                        }`}
                      >
                        <Plus className="w-3 h-3 text-blue-500" />
                        <span>{s.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Watchlist active items */
              <div className="space-y-2">
                {config.watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    className={`p-3.5 rounded-[22px] border backdrop-blur-2xl flex items-center justify-between gap-4 transition-all ${
                      isLight
                        ? 'bg-white/85 border-white/95 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:border-slate-300'
                        : 'bg-[#0b1120]/75 border-white/12 shadow-lg hover:border-white/20'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {item.symbol}
                        </span>
                        <span
                          className={`text-[10px] truncate ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold block mt-0.5 ${
                          isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`text-right ${
                          item.isUp
                            ? isLight
                              ? 'text-emerald-600'
                              : 'text-emerald-400'
                            : isLight
                            ? 'text-rose-600'
                            : 'text-rose-400'
                        }`}
                      >
                        <span className="text-xs font-bold font-mono block">{item.change}</span>
                        <span className="text-[10px] block opacity-80">{item.changeAmount}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSymbol(item.symbol)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PORTFOLIO */}
        {activeTab === 'Portfolio' && (
          <div className="space-y-4">
            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Net Portfolio Value
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  +14.8% All Time
                </span>
              </div>
              <div
                className={`text-2xl font-bold font-mono tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                ₹8,42,650.00
              </div>
              <div
                className={`flex items-center justify-between pt-2 border-t text-xs ${
                  isLight ? 'border-slate-200/80' : 'border-white/5'
                }`}
              >
                <div>
                  <span
                    className={`block text-[10px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Today&apos;s P&amp;L
                  </span>
                  <span
                    className={`font-semibold font-mono ${
                      isLight ? 'text-emerald-600' : 'text-emerald-400'
                    }`}
                  >
                    +₹4,210.50 (+0.50%)
                  </span>
                </div>
                <div>
                  <span
                    className={`block text-[10px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Total Invested
                  </span>
                  <span
                    className={`font-semibold font-mono ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    ₹7,34,000.00
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3
                className={`text-xs font-bold uppercase tracking-wider px-1 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Top Holdings
              </h3>
              {[
                { name: 'Reliance Industries', qty: 50, avg: '₹2,680', curr: '₹2,985', pnl: '+11.3%' },
                { name: 'HDFC Bank', qty: 120, avg: '₹1,510', curr: '₹1,664', pnl: '+10.2%' },
                { name: 'Tata Motors', qty: 150, avg: '₹840', curr: '₹982', pnl: '+16.9%' },
              ].map((h, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border backdrop-blur-xl flex items-center justify-between text-xs transition-all ${
                    isLight
                      ? 'bg-white/85 border-white/95 shadow-sm'
                      : 'bg-[#0b1120]/75 border-white/10'
                  }`}
                >
                  <div>
                    <span
                      className={`font-semibold block ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {h.name}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Qty: {h.qty} · Avg: {h.avg}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-semibold block ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {h.curr}
                    </span>
                    <span
                      className={`font-semibold text-[11px] ${
                        isLight ? 'text-emerald-600' : 'text-emerald-400'
                      }`}
                    >
                      {h.pnl}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AI ANALYSIS */}
        {activeTab === 'AI Analysis' && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-[24px] border backdrop-blur-xl space-y-2.5 ${
                isLight
                  ? 'bg-blue-50/80 border-blue-200/90 text-slate-800'
                  : 'bg-blue-500/10 border-blue-500/20 text-slate-200'
              }`}
            >
              <div
                className={`flex items-center gap-2 text-xs font-bold ${
                  isLight ? 'text-blue-700' : 'text-blue-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Maya Market Intelligence</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Indian indices posted steady gains today with Nifty consolidating above 25,350. Heavyweights in IT and Auto saw fresh institutional inflows. Crude oil moderated around $74/bbl, easing inflation concerns for import-heavy sectors.
              </p>
            </div>

            <div className={cardCls}>
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Key Sector Signals
              </h3>
              <div className="space-y-2 text-xs">
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-[#0a101d] border-white/5'
                  }`}
                >
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    Auto &amp; EV Components
                  </span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-emerald-600' : 'text-emerald-400'
                    }`}
                  >
                    Bullish momentum
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-[#0a101d] border-white/5'
                  }`}
                >
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    Private Banking
                  </span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-blue-600' : 'text-blue-400'
                    }`}
                  >
                    Neutral / Accumulation
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-[#0a101d] border-white/5'
                  }`}
                >
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>
                    Metals &amp; Mining
                  </span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-amber-600' : 'text-amber-400'
                    }`}
                  >
                    High Volatility
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
