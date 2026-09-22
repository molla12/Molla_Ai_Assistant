import React, { useState, useRef } from 'react';
import { AtmosphereConfig } from '../types';
import { Sparkles, MessageCircle, Flame, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

interface VoicePromptChipsProps {
  aura: AtmosphereConfig;
  disabled?: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

interface PromptItem {
  id: string;
  category: 'popular' | 'latest';
  text: string;
  badge: string;
}

const PROMPT_ITEMS: PromptItem[] = [
  {
    id: 'pop-1',
    category: 'popular',
    text: 'Hey Molla, how are you doing today?',
    badge: 'Popular',
  },
  {
    id: 'pop-2',
    category: 'popular',
    text: 'Give me a charming and witty compliment!',
    badge: 'Popular',
  },
  {
    id: 'pop-3',
    category: 'popular',
    text: 'What is the current time and date right now?',
    badge: 'Popular',
  },
  {
    id: 'pop-4',
    category: 'popular',
    text: 'Open YouTube for me',
    badge: 'Popular',
  },
  {
    id: 'pop-5',
    category: 'popular',
    text: 'Switch atmosphere to Cyber Cyan',
    badge: 'Popular',
  },
  {
    id: 'pop-6',
    category: 'popular',
    text: 'Tell me something interesting and inspiring',
    badge: 'Popular',
  },
  {
    id: 'lat-1',
    category: 'latest',
    text: 'Molla, tell me an entertaining and funny joke!',
    badge: 'Latest',
  },
  {
    id: 'lat-2',
    category: 'latest',
    text: 'Rate my vibe today on a scale of 1 to 10',
    badge: 'Latest',
  },
  {
    id: 'lat-3',
    category: 'latest',
    text: 'Why are you so cute and intelligent?',
    badge: 'Latest',
  },
  {
    id: 'lat-4',
    category: 'latest',
    text: 'Play some relaxing music on YouTube',
    badge: 'Latest',
  },
  {
    id: 'lat-5',
    category: 'latest',
    text: 'What are the top trending topics in technology today?',
    badge: 'Latest',
  },
  {
    id: 'lat-6',
    category: 'latest',
    text: 'What exciting things should I explore today?',
    badge: 'Latest',
  },
];

type FilterTab = 'all' | 'popular' | 'latest';

export const VoicePromptChips: React.FC<VoicePromptChipsProps> = ({
  aura,
  disabled,
  onSelectPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredPrompts = PROMPT_ITEMS.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 260;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Header bar: Title & Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        {/* Title */}
        <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
          <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" style={{ color: aura.accentColor }} />
          <span className="font-bold tracking-wider uppercase text-[10px] sm:text-xs font-display truncate">
            SUGGESTED PROMPTS
          </span>
        </div>

        {/* Filter Toggle Pills: All / Popular / Latest */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] sm:text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'popular'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-amber-300/80'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Popular</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === 'latest'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-rose-300/80'
            }`}
          >
            <Zap className="w-3 h-3 text-rose-400" />
            <span>Latest</span>
          </button>
        </div>
      </div>

      {/* Swipeable Carousel Container (Single Horizontal Row) */}
      <div className="relative group/carousel">
        {/* Left Scroll Button (Desktop/Tablet) */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0a0f1d]/90 hover:bg-[#151c33] border border-white/20 items-center justify-center text-slate-300 hover:text-white shadow-lg backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* The single-line swipe container */}
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-1 scroll-smooth snap-x snap-mandatory touch-pan-x"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {filteredPrompts.map((item) => {
            const isPop = item.category === 'popular';
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectPrompt?.(item.text)}
                className="group shrink-0 snap-start px-3.5 py-2 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-left"
                style={{
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Category Badge: Popular or Latest */}
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPop
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPop ? <Flame className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
                  <span>{item.badge}</span>
                </span>

                <MessageCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0" />

                <span className="text-xs sm:text-[13px] text-slate-200 group-hover:text-white font-medium">
                  "{item.text}"
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button (Desktop/Tablet) */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0a0f1d]/90 hover:bg-[#151c33] border border-white/20 items-center justify-center text-slate-300 hover:text-white shadow-lg backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity cursor-pointer"
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe instruction hint for mobile users */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-1 font-mono sm:hidden">
        <span>← Swipe horizontally to explore →</span>
      </div>
    </div>
  );
};
