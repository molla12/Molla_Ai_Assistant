import React, { useState, useEffect } from 'react';
import { Newspaper, Play, Pause, Loader2, Volume2, ExternalLink, RefreshCw, X, Sparkles, Radio } from 'lucide-react';
import { voicePlayer, VoicePlaybackState } from '../services/voicePlayer';
import { VoiceOption } from '../types';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  link: string;
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice: VoiceOption;
  onDiscussNews?: (newsTitle: string, newsSummary: string, newsSource?: string) => void;
  effectiveTheme?: 'light' | 'dark';
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  voice,
  onDiscussNews,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'technology' | 'world' | 'business'>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [playback, setPlayback] = useState<VoicePlaybackState>(voicePlayer.getState());

  useEffect(() => {
    const unsub = voicePlayer.subscribe((state) => {
      setPlayback(state);
    });
    return () => unsub();
  }, []);

  const fetchNews = async (cat: string, isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/news?category=${cat}&t=${timestamp}${isManualRefresh ? '&refresh=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setNewsList(data.items);
          if (isManualRefresh) {
            setRefreshNotice('Updated with latest stories!');
            setTimeout(() => setRefreshNotice(null), 2500);
          }
        }
      }
    } catch (err) {
      console.warn('[NewsModal] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews(selectedCategory);
    } else {
      if (playback.activeMessageId?.startsWith('news-')) {
        voicePlayer.stop();
      }
    }
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const handleTogglePlayNews = (item: NewsItem) => {
    const newsMsgId = `news-${item.id}`;
    const textToRead = `${item.title}. Source: ${item.source}. ${item.summary}`;
    voicePlayer.togglePlay(newsMsgId, textToRead, undefined, voice);
  };

  const categories: { id: 'general' | 'technology' | 'world' | 'business'; label: string }[] = [
    { id: 'general', label: 'All News' },
    { id: 'technology', label: 'Technology' },
    { id: 'world', label: 'World' },
    { id: 'business', label: 'Business' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        id="news-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200 border backdrop-blur-2xl transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.15)]'
            : 'bg-[#121824]/95 border-white/10 text-slate-100 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between backdrop-blur-md shrink-0 transition-colors ${
            isLight
              ? 'bg-slate-50/90 border-slate-200'
              : 'bg-[#161f30]/90 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-base sm:text-lg font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Google News Live
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[10px] font-mono text-rose-500 dark:text-rose-300 font-bold uppercase flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-rose-500" />
                  Live
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Tap any headline to listen in Molla&apos;s real voice ({voice})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {refreshNotice && (
              <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-fade-in">
                {refreshNotice}
              </span>
            )}
            <button
              type="button"
              id="refresh-news-btn"
              onClick={() => fetchNews(selectedCategory, true)}
              disabled={isLoading || isRefreshing}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs ${
                isRefreshing
                  ? 'text-pink-500 bg-pink-500/15'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Click to fetch latest news stories"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isRefreshing || isLoading ? 'animate-spin text-pink-500' : ''
                }`}
              />
              <span className="hidden md:inline font-mono text-[11px]">Refresh</span>
            </button>
            <button
              type="button"
              id="close-news-modal-btn"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
              }`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 transition-colors ${
            isLight
              ? 'bg-slate-100/80 border-slate-200'
              : 'bg-[#0f1420] border-white/5'
          }`}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/30'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200 shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* News List Stream */}
        <div
          className={`flex-1 overflow-y-auto overscroll-contain touch-pan-y p-4 sm:p-5 space-y-3.5 divide-y scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 ${
            isLight ? 'divide-slate-200' : 'divide-white/5'
          }`}
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          {isLoading ? (
            <div
              className={`flex flex-col items-center justify-center py-16 gap-3 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
              <p className="text-sm font-medium">Fetching latest news from Google...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center py-14 gap-2 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <Newspaper
                className={`w-10 h-10 ${
                  isLight ? 'text-slate-300' : 'text-slate-600'
                }`}
              />
              <p className="text-sm font-medium">No news articles found right now.</p>
            </div>
          ) : (
            newsList.map((item) => {
              const isItemActive = playback.activeMessageId === `news-${item.id}`;
              const isPlayingThis = isItemActive && playback.isPlaying;
              const isLoadingThis = isItemActive && playback.isLoading;

              return (
                <div
                  key={item.id}
                  className={`pt-3.5 first:pt-0 group rounded-2xl p-3.5 transition-all duration-200 border ${
                    isPlayingThis
                      ? isLight
                        ? 'bg-pink-50 border-pink-300 shadow-md shadow-pink-500/10'
                        : 'bg-pink-500/10 border-pink-500/40 shadow-lg shadow-pink-500/10'
                      : isLight
                      ? 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200'
                      : 'bg-[#182130]/60 hover:bg-[#1c2738] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono ${
                          isLight
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : 'bg-white/10 text-pink-300'
                        }`}
                      >
                        {item.source}
                      </span>
                      <span
                        className={`text-[11px] ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {item.publishedAt}
                      </span>
                    </div>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-1 rounded-lg transition-colors ${
                          isLight
                            ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/70'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Open in Google News"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Headline Title */}
                  <h4
                    className={`text-[14px] sm:text-[15px] font-semibold transition-colors leading-snug mb-1.5 ${
                      isLight
                        ? 'text-slate-900 group-hover:text-pink-600'
                        : 'text-white group-hover:text-pink-300'
                    }`}
                  >
                    {item.title}
                  </h4>

                  {/* Summary */}
                  {item.summary && (
                    <p
                      className={`text-xs sm:text-[13px] leading-relaxed line-clamp-2 mb-3 ${
                        isLight ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {item.summary}
                    </p>
                  )}

                  {/* Bottom Action Bar */}
                  <div
                    className={`flex items-center justify-between gap-3 pt-2 border-t ${
                      isLight ? 'border-slate-200' : 'border-white/5'
                    }`}
                  >
                    {/* Read Out Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlayNews(item)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isPlayingThis
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40'
                          : isLight
                          ? 'bg-white hover:bg-pink-50 text-pink-700 hover:text-pink-800 border border-pink-200 shadow-xs'
                          : 'bg-white/10 hover:bg-pink-500/20 text-pink-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPlayingThis ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                      <span>
                        {isPlayingThis ? 'Pause Voice' : 'Listen with Molla'}
                      </span>
                    </button>

                    {/* Equalizer animation when playing */}
                    {isPlayingThis && (
                      <div className="flex items-center gap-1 h-3.5 px-2">
                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-2" />
                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-3.5 [animation-delay:150ms]" />
                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-1.5 [animation-delay:300ms]" />
                        <span className="w-1 bg-pink-500 rounded-full animate-bounce h-3 [animation-delay:450ms]" />
                      </div>
                    )}

                    {/* Chat with Molla about this */}
                    {onDiscussNews && (
                      <button
                        type="button"
                        onClick={() => {
                          voicePlayer.stop();
                          onDiscussNews(item.title, item.summary, item.source);
                          onClose();
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 group ${
                          isLight
                            ? 'bg-rose-100/80 hover:bg-rose-500 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-500'
                            : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500'
                        }`}
                        title="Open chat & listen to Molla's full spoken breakdown"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-500 group-hover:text-white transition-colors" />
                        <span>Discuss with Molla</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-200 text-slate-500'
              : 'bg-[#0d121c] border-white/10 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-pink-500" />
            Audio powered by real voice synthesis
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
