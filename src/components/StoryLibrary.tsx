import React, { useState } from 'react';
import { Story } from '../types';
import { BookOpen, Heart, Sparkles, Plus, Clock, Search, Wand2, Star } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

interface StoryLibraryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onToggleFavorite: (storyId: string) => void;
  onOpenCreateModal: () => void;
}

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  stories,
  onSelectStory,
  onToggleFavorite,
  onOpenCreateModal,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | '3-5' | '6-8' | 'custom' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.theme.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTab === '3-5') return story.ageGroup === '3-5';
    if (selectedTab === '6-8') return story.ageGroup === '6-8';
    if (selectedTab === 'custom') return story.isCustom === true;
    if (selectedTab === 'favorites') return story.favorite === true;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 p-6 sm:p-10 text-white shadow-xl shadow-orange-200">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-4 right-8 opacity-20 pointer-events-none">
          <Wand2 className="w-32 h-32" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-bold tracking-wide">
            <Sparkles className="w-4 h-4 fill-amber-200 text-amber-200" />
            <span>Interactive Audio Storybooks</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Magical Stories That Come Alive Out Aloud!
          </h1>

          <p className="text-sm sm:text-base text-amber-50 font-medium leading-relaxed">
            Choose a story below to hear it read aloud page-by-page with dynamic illustrations, or create your very own custom illustrated book using AI magic!
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                soundEngine.playPop();
                onOpenCreateModal();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-sm sm:text-base shadow-lg hover:bg-amber-50 transition-all active:scale-95"
              id="hero-create-btn"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Create Custom Story</span>
            </button>
            <a
              href="#story-grid"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30 text-white font-extrabold text-sm sm:text-base transition-all"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore Books ({stories.length})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Library Controls Bar */}
      <div id="story-grid" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-amber-100/70 border border-amber-200/80 rounded-2xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                soundEngine.playPop();
                setSelectedTab('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTab === 'all'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
              id="tab-all-books"
            >
              All Books ({stories.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setSelectedTab('3-5');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTab === '3-5'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
              id="tab-age-3-5"
            >
              Ages 3-5
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setSelectedTab('6-8');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTab === '6-8'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
              id="tab-age-6-8"
            >
              Ages 6-8
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setSelectedTab('custom');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTab === 'custom'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
              id="tab-my-created"
            >
              ✨ My AI Stories
            </button>
            <button
              onClick={() => {
                soundEngine.playPop();
                setSelectedTab('favorites');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedTab === 'favorites'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
              id="tab-favorites"
            >
              ❤️ Favorites
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, theme, character..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-2 border-amber-200 text-amber-950 text-xs sm:text-sm placeholder-amber-400 font-medium focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              id="search-story-input"
            />
          </div>
        </div>
      </div>

      {/* Story Cards Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-amber-50 border-2 border-dashed border-amber-200 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-amber-950">No stories found</h3>
          <p className="text-xs sm:text-sm text-amber-700 max-w-md mx-auto">
            Try choosing a different tab, clearing your search query, or create a brand new custom story using AI magic!
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md"
            id="empty-create-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Create Magic Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="group relative bg-white rounded-3xl border-2 border-amber-200/80 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Cover Header */}
              <div className="relative h-52 overflow-hidden bg-amber-100">
                {story.coverImageUrl || story.pages[0]?.imageUrl ? (
                  <img
                    src={story.coverImageUrl || story.pages[0]?.imageUrl}
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${story.coverColor || 'from-purple-500 to-pink-500'} flex items-center justify-center p-6 text-white text-center`}>
                    <h3 className="text-xl font-extrabold drop-shadow">{story.title}</h3>
                  </div>
                )}

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase">
                    Age {story.ageGroup}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playPop();
                      onToggleFavorite(story.id);
                    }}
                    className="p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 transition-transform active:scale-90 shadow-md"
                    title={story.favorite ? 'Remove Favorite' : 'Save Favorite'}
                    id={`favorite-btn-${story.id}`}
                  >
                    <Heart className={`w-4 h-4 ${story.favorite ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Cover Bottom Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{story.theme}</span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug line-clamp-1 drop-shadow-md">
                    {story.title}
                  </h3>
                </div>
              </div>

              {/* Story Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                  {story.description}
                </p>

                <div className="space-y-3 pt-2 border-t border-amber-100">
                  <div className="flex items-center justify-between text-xs font-medium text-amber-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{story.pages.length} Pages</span>
                    </div>
                    {story.isCustom && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                        AI Created
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playSparkle();
                      onSelectStory(story);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-200 transition-all active:scale-98"
                    id={`read-story-btn-${story.id}`}
                  >
                    <BookOpen className="w-4 h-4 stroke-[2.5]" />
                    <span>Read Aloud Story</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
