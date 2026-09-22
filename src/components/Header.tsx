import React from 'react';
import { BookOpen, Sparkles, MessageCircle, Volume2, PlusCircle, Bookmark } from 'lucide-react';
import { AudioSettings } from '../types';

interface HeaderProps {
  onOpenCreateModal: () => void;
  onToggleCompanion: () => void;
  onOpenAudioSettings: () => void;
  onSelectLibrary: () => void;
  companionOpen: boolean;
  audioSettings: AudioSettings;
  favoriteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  onToggleCompanion,
  onOpenAudioSettings,
  onSelectLibrary,
  companionOpen,
  audioSettings,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-amber-50/90 backdrop-blur-md border-b-2 border-amber-200 shadow-sm px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onSelectLibrary}
          className="flex items-center gap-3 group text-left transition-transform active:scale-95"
          id="brand-logo-btn"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md shadow-orange-300/50 group-hover:rotate-6 transition-transform">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                Story Magic
              </span>
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse fill-amber-300" />
            </div>
            <p className="text-xs font-medium text-amber-800/80 hidden sm:block">
              Interactive Kid Read-Aloud & Illustrated Books
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create New Story Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-300/50 hover:shadow-lg transition-all active:scale-95"
            id="create-story-btn"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span>Create Story</span>
          </button>

          {/* AI Companion Toggle */}
          <button
            onClick={onToggleCompanion}
            className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all active:scale-95 ${
              companionOpen
                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
            id="story-companion-btn"
            title="Ask Barnaby the AI Story Buddy"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            <span className="hidden md:inline">Story Buddy</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </button>

          {/* Audio Settings Button */}
          <button
            onClick={onOpenAudioSettings}
            className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all active:scale-95 ${
              audioSettings.soundEffectsEnabled
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-stone-100 text-stone-500 border-stone-300'
            }`}
            id="audio-settings-btn"
            title="Audio & Read-Aloud Voice Settings"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Favorites Badge */}
          {favoriteCount > 0 && (
            <button
              onClick={onSelectLibrary}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold"
              id="favorites-count-btn"
            >
              <Bookmark className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{favoriteCount}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
