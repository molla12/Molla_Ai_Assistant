import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Newspaper,
  X,
  RotateCw,
  Volume2,
  Square,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Clock,
  Radio,
  Share2,
  Check,
} from 'lucide-react';
import { AtmosphereConfig, VoiceOption, LanguageCode, NewsArticle } from '../types';
import { speakMollaWithNaturalVoice } from '../services/naturalSpeech';
import { audioCoordinator, ActiveAudioState } from '../services/audioCoordinator';

interface NewsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  aura: AtmosphereConfig;
  currentVoice: VoiceOption;
  currentLanguage: LanguageCode;
  onDiscussWithMolla?: (prompt: string) => void;
}

type NewsCategory = 'all' | 'top' | 'tech' | 'sports' | 'entertainment' | 'world';

const CATEGORIES: { id: NewsCategory; labelEn: string }[] = [
  { id: 'all', labelEn: 'All News' },
  { id: 'top', labelEn: 'Top Stories' },
  { id: 'tech', labelEn: 'Tech & AI' },
  { id: 'sports', labelEn: 'Sports' },
  { id: 'entertainment', labelEn: 'Entertainment' },
  { id: 'world', labelEn: 'World News' },
];

export const NewsViewerModal: React.FC<NewsViewerModalProps> = ({
  isOpen,
  onClose,
  aura,
  currentVoice,
  currentLanguage,
  onDiscussWithMolla,
}) => {
  const [category, setCategory] = useState<NewsCategory>('all');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<ActiveAudioState>({
    source: 'idle',
    id: null,
    isPlaying: false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Sync with global audio coordinator
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = audioCoordinator.subscribe((state) => {
      if (isMountedRef.current) {
        setActiveAudio(state);
      }
    });
    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // Fetch news from Google News backend route
  const fetchNews = useCallback(
    async (targetCategory: NewsCategory = category) => {
      setIsLoading(true);
      setError(null);
      try {
        const langParam = encodeURIComponent(currentLanguage || 'bn');
        const catParam = encodeURIComponent(targetCategory);
        const res = await fetch(`/api/news?lang=${langParam}&category=${catParam}`);
        if (!res.ok) {
          throw new Error(`Failed to load news (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          setArticles([]);
        }
      } catch (err: any) {
        console.warn('[NewsViewer] Fetch news error:', err);
        setError(err?.message || 'Could not retrieve live news headlines.');
      } finally {
        setIsLoading(false);
      }
    },
    [category, currentLanguage]
  );

  // Load news when modal opens or language/category changes
  useEffect(() => {
    if (isOpen) {
      fetchNews(category);
    }
  }, [isOpen, category, currentLanguage, fetchNews]);

  // Handle Play / Pause for a specific news item
  const handleTogglePlayNews = async (article: NewsArticle) => {
    // If THIS news is already playing, pause / stop it
    if (activeAudio.isPlaying && activeAudio.source === 'news' && activeAudio.id === article.id) {
      audioCoordinator.stopAllAudio();
      return;
    }

    // Stop all other audio (chat TTS, live session, other news)
    audioCoordinator.requestPlayback('news', article.id, article.cleanTitle, () => {
      // Cleanup callback when stopped
    });

    // Formulate sweet, natural spoken prompt for Molla in current voice and language
    const speech = article.speechText || `${article.cleanTitle}. Source: ${article.source}`;

    try {
      await speakMollaWithNaturalVoice(
        speech,
        currentVoice,
        {
          onStart: () => {
            // Already coordinated
          },
          onEnd: () => {
            audioCoordinator.playbackFinished('news', article.id);
          },
        },
        currentLanguage
      );
    } catch (err) {
      console.warn('[NewsViewer] Audio playback error:', err);
      audioCoordinator.playbackFinished('news', article.id);
    }
  };

  // Stop current news playback
  const handleStopAudio = () => {
    audioCoordinator.stopAllAudio();
  };

  // Copy link
  const handleCopyShare = (article: NewsArticle) => {
    if (article.link) {
      navigator.clipboard.writeText(article.link);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Discuss in chat
  const handleDiscuss = (article: NewsArticle) => {
    const prompt = `Hey Molla, what is your opinion on this news: "${article.cleanTitle}" by ${article.source}?`;

    // Stop reading news audio so user can chat seamlessly
    audioCoordinator.stopAllAudio();
    onClose();
    if (onDiscussWithMolla) {
      onDiscussWithMolla(prompt);
    }
  };

  if (!isOpen) return null;

  const currentlyPlayingArticle = articles.find((a) => a.id === activeAudio.id);
  const isFemale = currentVoice === 'Aoede' || currentVoice === 'Kore';
  const voiceDisplay = isFemale ? 'Female Voice (Aoede)' : 'Male Voice (Fenrir)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-[#0c101c] border border-white/15 rounded-3xl text-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ borderColor: aura.accentColor + '50' }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${aura.accentColor}30, rgba(255,255,255,0.05))`,
              }}
            >
              <Newspaper className="w-5 h-5" style={{ color: aura.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                  Live Google News
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>{voiceDisplay}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium uppercase">{currentLanguage}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchNews(category)}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh News"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Close News"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-black/30 border-b border-white/10 overflow-x-auto no-scrollbar flex items-center gap-1.5 select-none">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: aura.accentColor + '60',
                        color: '#fff',
                      }
                    : {}
                }
              >
                {cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Active Audio Mini-Player Bar (When Molla is speaking news) */}
        {activeAudio.isPlaying && activeAudio.source === 'news' && (
          <div
            className="px-4 sm:px-6 py-2.5 border-b border-white/15 bg-gradient-to-r from-cyan-950/60 via-indigo-950/50 to-purple-950/60 flex items-center justify-between gap-3 animate-in fade-in duration-200"
            style={{ borderBottomColor: aura.accentColor + '40' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Equalizer bars animation */}
              <div className="flex items-end gap-0.5 h-4 w-4 shrink-0">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms] h-3/4" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms] h-full" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <span>Molla is reading news in {voiceDisplay}</span>
                </div>
                <p className="text-xs text-white truncate max-w-md font-medium">
                  {currentlyPlayingArticle?.cleanTitle || activeAudio.title || 'Playing news audio...'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStopAudio}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Stop speech"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 divide-y divide-white/[0.06]">
          {isLoading && articles.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Fetching latest headlines from Google News...
              </p>
              <p className="text-xs text-slate-500">
                Molla will read them out in your selected voice & language
              </p>
            </div>
          ) : error && articles.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-sm text-rose-400">{error}</p>
              <button
                type="button"
                onClick={() => fetchNews(category)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No news found in this category right now.
            </div>
          ) : (
            articles.map((article, idx) => {
              const isThisPlaying =
                activeAudio.isPlaying &&
                activeAudio.source === 'news' &&
                activeAudio.id === article.id;

              return (
                <div
                  key={article.id || idx}
                  className={`pt-3 first:pt-0 transition-all rounded-2xl p-3 sm:p-4 ${
                    isThisPlaying
                      ? 'bg-cyan-950/30 border border-cyan-500/40 shadow-lg'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {/* Card Header: Source & Time */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-white/10 text-cyan-300 border border-white/10">
                        {article.source}
                      </span>
                      {article.relativeTime && (
                        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {article.relativeTime}
                        </span>
                      )}
                    </div>

                    {/* Share / Copy link */}
                    <button
                      type="button"
                      onClick={() => handleCopyShare(article)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Copy article link"
                    >
                      {copiedId === article.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug tracking-tight">
                    {article.cleanTitle}
                  </h3>

                  {/* Snippet / preview if available */}
                  {article.snippet && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.snippet}
                    </p>
                  )}

                  {/* Action Buttons Row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
                    {/* Listen / Pause button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePlayNews(article)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                        isThisPlaying
                          ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Playing</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    {/* Read Source in New Tab */}
                    {article.link && (
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>Read Source</span>
                      </a>
                    )}

                    {/* Ask Molla about this news */}
                    <button
                      type="button"
                      onClick={() => handleDiscuss(article)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
                      title="Discuss with Molla in Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Discuss</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>
              Mutual audio exclusivity enabled: only one audio will play at a time.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
