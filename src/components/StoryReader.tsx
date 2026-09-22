import React, { useState, useEffect, useRef } from 'react';
import { Story, StoryPage, AudioSettings } from '../types';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  MessageCircle,
  Heart,
  Maximize2,
  Trophy,
  FastForward,
  Image as ImageIcon
} from 'lucide-react';
import { speechController } from '../lib/speech';
import { soundEngine } from '../lib/soundEngine';

// Safe confetti trigger
const safeConfetti = (opts: any) => {
  try {
    if (typeof window !== 'undefined' && (window as any).confetti) {
      (window as any).confetti(opts);
    }
  } catch {}
};

interface StoryReaderProps {
  story: Story;
  onBackToLibrary: () => void;
  onToggleFavorite: (storyId: string) => void;
  onAskCompanionAboutPage: (pageText: string, storyTitle: string) => void;
  onRegenerateImage: (pageIndex: number, customPrompt: string) => Promise<void>;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (settings: Partial<AudioSettings>) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onBackToLibrary,
  onToggleFavorite,
  onAskCompanionAboutPage,
  onRegenerateImage,
  audioSettings,
  onUpdateAudioSettings,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWordRange, setActiveWordRange] = useState<{ start: number; length: number } | null>(null);
  const [isReimaginingModalOpen, setIsReimaginingModalOpen] = useState(false);
  const [customArtPrompt, setCustomArtPrompt] = useState('');
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  const currentPage = story.pages[currentPageIndex] || story.pages[0];
  const totalPages = story.pages.length;

  // Stop audio on page unmount
  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, []);

  // When page changes, reset states and optionally auto-read
  useEffect(() => {
    speechController.stop();
    setIsPlayingAudio(false);
    setActiveWordRange(null);
    soundEngine.playPageTurn();

    // Trigger page sound effect if specified
    if (currentPage.soundEffect === 'sparkle') soundEngine.playSparkle();
    else if (currentPage.soundEffect === 'pop') soundEngine.playPop();

    if (audioSettings.autoReadOnPageTurn) {
      handlePlayAudio();
    }
  }, [currentPageIndex]);

  // Handle Speech Read Aloud
  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      speechController.pause();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    if (audioSettings.useGeminiTTS) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: currentPage.text,
            voice: 'Kore',
          }),
        });
        const data = await res.json();
        if (data.success && data.audioBase64) {
          await speechController.speakWithGeminiTTS(data.audioBase64, () => {
            setIsPlayingAudio(false);
            if (currentPageIndex < totalPages - 1 && audioSettings.autoReadOnPageTurn) {
              handleNextPage();
            }
          });
          return;
        }
      } catch (err) {
        console.warn('Gemini TTS failed, fallback to Web Speech', err);
      }
    }

    // Web Speech API Fallback
    speechController.speakText(currentPage.text, {
      rate: audioSettings.speechRate,
      pitch: audioSettings.speechPitch,
      voiceURI: audioSettings.selectedVoiceURI,
      onBoundary: (start, length) => {
        setActiveWordRange({ start, length });
      },
      onEnd: () => {
        setIsPlayingAudio(false);
        setActiveWordRange(null);

        // Check if finished story on last page
        if (currentPageIndex === totalPages - 1) {
          triggerCompletionCelebration();
        } else if (audioSettings.autoReadOnPageTurn) {
          setTimeout(() => {
            handleNextPage();
          }, 800);
        }
      },
      onError: () => {
        setIsPlayingAudio(false);
        setActiveWordRange(null);
      },
    });
  };

  const handleStopAudio = () => {
    speechController.stop();
    setIsPlayingAudio(false);
    setActiveWordRange(null);
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      triggerCompletionCelebration();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const triggerCompletionCelebration = () => {
    setIsCompleted(true);
    soundEngine.playSuccess();
    try {
      safeConfetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCustomReimagineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArtPrompt.trim()) return;

    setIsGeneratingArt(true);
    soundEngine.playSparkle();
    try {
      await onRegenerateImage(currentPageIndex, customArtPrompt.trim());
      setIsReimaginingModalOpen(false);
      setCustomArtPrompt('');
    } catch (err) {
      console.error('Failed to regenerate image', err);
    } finally {
      setIsGeneratingArt(false);
    }
  };

  // Render Highlighted Text
  const renderHighlightedText = () => {
    const text = currentPage.text;
    if (!activeWordRange || !isPlayingAudio) {
      return <span>{text}</span>;
    }

    const { start, length } = activeWordRange;
    const before = text.slice(0, start);
    const word = text.slice(start, start + length);
    const after = text.slice(start + length);

    return (
      <span>
        {before}
        <span className="bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded-md shadow-sm animate-pulse">
          {word}
        </span>
        {after}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-amber-50/50 py-6 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
          <button
            onClick={() => {
              speechController.stop();
              onBackToLibrary();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs sm:text-sm transition-all"
            id="back-library-btn"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Library</span>
          </button>

          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-amber-950 line-clamp-1">
              {story.title}
            </h2>
            <p className="text-xs text-amber-700 font-semibold">
              Page {currentPageIndex + 1} of {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Read Aloud Speed Badge */}
            <button
              onClick={() => {
                const speeds = [0.8, 1.0, 1.2];
                const nextSpeed = speeds[(speeds.indexOf(audioSettings.speechRate) + 1) % speeds.length];
                onUpdateAudioSettings({ speechRate: nextSpeed });
                soundEngine.playPop();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1"
              title="Change Speech Speed"
              id="speech-speed-btn"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{audioSettings.speechRate}x</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => {
                soundEngine.playPop();
                onToggleFavorite(story.id);
              }}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-rose-500 transition-all"
              id="reader-favorite-btn"
            >
              <Heart className={`w-4 h-4 ${story.favorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Book Canvas Spread */}
        <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Spread: Illustration Box */}
          <div className="relative bg-amber-100/60 p-6 flex flex-col items-center justify-center min-h-[340px] lg:min-h-[460px] border-b-2 md:border-b-0 md:border-r-2 border-amber-200">
            {currentPage.isGeneratingImage ? (
              <div className="flex flex-col items-center justify-center text-center space-y-3 p-8">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-amber-900 animate-pulse">
                  Painting new page illustration with AI magic...
                </p>
              </div>
            ) : currentPage.imageUrl ? (
              <div className="relative w-full h-full max-h-[420px] rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src={currentPage.imageUrl}
                  alt={`Page ${currentPage.pageNumber} illustration`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl"
                />

                {/* Top Action Overlay on Artwork */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreenImage(true)}
                    className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-md"
                    title="Fullscreen Image"
                    id="fullscreen-img-btn"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playSparkle();
                      setIsReimaginingModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-md transition-all"
                    id="reimagine-art-btn"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Re-imagine</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 text-amber-800">
                <ImageIcon className="w-12 h-12 stroke-1" />
                <p className="text-sm font-semibold">No illustration yet</p>
                <button
                  onClick={() => setIsReimaginingModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md"
                >
                  Generate Illustration
                </button>
              </div>
            )}
          </div>

          {/* Right Spread: Story Text & Speech Controls */}
          <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Sound Effect Quick Button */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs tracking-wider uppercase">
                  Story Text
                </span>

                <button
                  onClick={() => {
                    soundEngine.playSparkle();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-950 transition-colors"
                  id="magic-sound-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>Play Magic Sound</span>
                </button>
              </div>

              {/* Main Reading Text */}
              <div className="min-h-[160px] flex items-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 leading-relaxed tracking-wide font-sans">
                  {renderHighlightedText()}
                </p>
              </div>
            </div>

            {/* Read Aloud Audio Controls Box */}
            <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Read Aloud Options</span>
                </span>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={audioSettings.autoReadOnPageTurn}
                    onChange={(e) => onUpdateAudioSettings({ autoReadOnPageTurn: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    id="auto-read-checkbox"
                  />
                  <span>Auto-Read Pages</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayAudio}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-95 ${
                    isPlayingAudio
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  }`}
                  id="play-read-aloud-btn"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-5 h-5 fill-white" />
                      <span>Pause Reading</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      <span>Read Page Aloud</span>
                    </>
                  )}
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleStopAudio}
                    className="p-3 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 transition-all"
                    title="Stop Audio"
                    id="stop-audio-btn"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Story Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
          {/* Previous Page */}
          <button
            onClick={() => {
              handleStopAudio();
              handlePrevPage();
            }}
            disabled={currentPageIndex === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
              currentPageIndex === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
            }`}
            id="prev-page-btn"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Previous</span>
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {story.pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleStopAudio();
                  setCurrentPageIndex(idx);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentPageIndex
                    ? 'w-8 bg-amber-500'
                    : 'bg-amber-200 hover:bg-amber-300'
                }`}
                title={`Go to page ${idx + 1}`}
                id={`page-dot-${idx}`}
              />
            ))}
          </div>

          {/* Ask AI Companion Chip */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onAskCompanionAboutPage(currentPage.text, story.title);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-900 font-bold text-xs sm:text-sm transition-all active:scale-95"
            id="ask-barnaby-page-btn"
          >
            <MessageCircle className="w-4 h-4 text-purple-600" />
            <span>Ask Barnaby about Page</span>
          </button>

          {/* Next Page / Finish */}
          <button
            onClick={() => {
              handleStopAudio();
              handleNextPage();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            id="next-page-btn"
          >
            <span>{currentPageIndex === totalPages - 1 ? 'Finish Story 🎉' : 'Next Page'}</span>
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Story Completion Victory Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 border-4 border-amber-300 shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-white shadow-lg animate-bounce">
              <Trophy className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-amber-950">You Finished the Story! 🎉</h3>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                Great reading job! What would you like to do next?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentPageIndex(0);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md"
                id="read-again-btn"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Read Again From Start</span>
              </button>

              <button
                onClick={() => {
                  setIsCompleted(false);
                  onAskCompanionAboutPage('We just finished reading the entire story!', story.title);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-sm border border-purple-300"
                id="talk-barnaby-btn"
              >
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span>Talk to Barnaby Barn Owl</span>
              </button>

              <button
                onClick={() => {
                  setIsCompleted(false);
                  onBackToLibrary();
                }}
                className="w-full py-2.5 text-stone-600 font-bold text-xs hover:text-stone-900"
                id="back-library-modal-btn"
              >
                Back to Story Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-imagine Illustration Modal */}
      {isReimaginingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border-2 border-amber-200 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Wand2 className="w-5 h-5 text-pink-500" />
                <h3>Re-imagine Page Illustration</h3>
              </div>
              <button
                onClick={() => setIsReimaginingModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Tell the AI artist how to draw this page differently! (e.g., "Add a friendly rainbow", "Make it nighttime with glowing stars", "Watercolor painting style").
            </p>

            <form onSubmit={handleCustomReimagineSubmit} className="space-y-4">
              <textarea
                value={customArtPrompt}
                onChange={(e) => setCustomArtPrompt(e.target.value)}
                placeholder="e.g. Add silly party hats on everyone and flying balloons!"
                rows={3}
                className="w-full p-3 rounded-2xl border-2 border-amber-200 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                id="custom-art-prompt-input"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReimaginingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingArt || !customArtPrompt.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                  id="submit-reimagine-btn"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>{isGeneratingArt ? 'Painting...' : 'Generate New Artwork'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {isFullscreenImage && (
        <div
          onClick={() => setIsFullscreenImage(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={currentPage.imageUrl}
            alt="Fullscreen page artwork"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};
