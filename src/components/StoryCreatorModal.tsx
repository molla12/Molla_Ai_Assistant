import React, { useState } from 'react';
import { Story } from '../types';
import { Sparkles, Wand2, BookOpen, Heart, Rocket, Shield, Smile, TreePine, Sparkle } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

interface StoryCreatorModalProps {
  onClose: () => void;
  onStoryCreated: (newStory: Story) => void;
}

const THEMES = [
  { id: 'Magic Forest', label: 'Magic Forest', icon: TreePine, color: 'from-emerald-500 to-teal-600' },
  { id: 'Space Adventure', label: 'Space Adventure', icon: Rocket, color: 'from-indigo-600 to-blue-600' },
  { id: 'Dinosaur Kingdom', label: 'Dinosaur Kingdom', icon: Shield, color: 'from-amber-500 to-orange-600' },
  { id: 'Fairy Tale Castle', label: 'Fairy Tale Castle', icon: Wand2, color: 'from-purple-500 to-pink-600' },
  { id: 'Superhero City', label: 'Superhero City', icon: Sparkles, color: 'from-rose-500 to-red-600' },
  { id: 'Underwater World', label: 'Underwater World', icon: Smile, color: 'from-cyan-500 to-blue-500' },
];

const MORALS = ['Kindness & Helping', 'Bravery & Courage', 'Curiosity & Learning', 'Sharing & Friendship', 'Being Yourself'];

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  onClose,
  onStoryCreated,
}) => {
  const [theme, setTheme] = useState('Magic Forest');
  const [characterName, setCharacterName] = useState('Oliver the Little Dragon');
  const [moral, setMoral] = useState('Kindness & Helping');
  const [ageGroup, setAgeGroup] = useState<'3-5' | '6-8' | '9-12'>('6-8');
  const [pageCount, setPageCount] = useState(5);
  const [promptDetails, setPromptDetails] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('Weaving magical story lines...');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) return;

    setIsGenerating(true);
    setErrorMessage('');
    soundEngine.playSparkle();

    const steps = [
      'Weaving magical story lines...',
      'Creating adorable character moments...',
      'Painting vibrant page illustrations...',
      'Applying sparkle pixie dust...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 2000);

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${promptDetails}. Story moral: ${moral}.`,
          theme,
          characterName,
          ageGroup,
          pageCount,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (!data.success || !data.story) {
        throw new Error(data.error || 'Failed to generate story.');
      }

      const generatedStory = data.story;

      // Construct full story object
      const newStory: Story = {
        id: 'custom-' + Date.now(),
        title: generatedStory.title || `${characterName}'s ${theme} Adventure`,
        author: generatedStory.author || 'Story Magic AI',
        ageGroup,
        theme,
        coverColor: generatedStory.coverColor || 'from-amber-400 via-pink-500 to-purple-600',
        description: generatedStory.description || `A heartwarming tale of ${characterName} in ${theme}.`,
        isCustom: true,
        createdAt: new Date().toISOString(),
        pages: (generatedStory.pages || []).map((p: any, idx: number) => ({
          id: `cp-${idx}-${Date.now()}`,
          pageNumber: p.pageNumber || idx + 1,
          text: p.text || 'Once upon a time in a magical land...',
          illustrationPrompt: p.illustrationPrompt || `${characterName} in ${theme}, colorful kid storybook style`,
          soundEffect: p.soundEffect || (idx % 2 === 0 ? 'sparkle' : 'pop'),
          isGeneratingImage: true,
        })),
      };

      onStoryCreated(newStory);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Story creation error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please check connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 border-2 border-amber-200 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Wand2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-amber-950">
                Create Your Own Magic Book
              </h3>
              <p className="text-xs text-amber-700 font-medium">
                Our AI storyteller will write and illustrate a unique story!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-stone-400 hover:text-stone-600 font-bold text-xl p-1"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {isGenerating ? (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-pink-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-amber-600">
                <Sparkles className="w-8 h-8 fill-amber-300 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-extrabold text-amber-950 animate-pulse">
                {generationStep}
              </h4>
              <p className="text-xs text-amber-700 font-medium">
                Magic takes a few moments. We are weaving your pages and art...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Theme */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                1. Choose Story Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playPop();
                        setTheme(t.id);
                      }}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50/80 text-pink-950 font-extrabold shadow-sm'
                          : 'border-amber-200 bg-amber-50/40 text-amber-900 font-semibold hover:border-amber-300'
                      }`}
                      id={`theme-select-${t.id.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <div className={`p-2 rounded-xl bg-gradient-to-tr ${t.color} text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs line-clamp-1">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Main Character Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  2. Hero Character Name
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Barnaby the Sky Dragon"
                  required
                  className="w-full p-3 rounded-2xl border-2 border-amber-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-400"
                  id="character-name-input"
                />
              </div>

              {/* Moral Choice */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  3. Lesson or Moral
                </label>
                <select
                  value={moral}
                  onChange={(e) => setMoral(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-amber-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-400 bg-white"
                  id="moral-select"
                >
                  {MORALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Age & Page Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  Target Age Group
                </label>
                <div className="flex gap-2">
                  {(['3-5', '6-8', '9-12'] as const).map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setAgeGroup(age)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                        ageGroup === age
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                      id={`age-group-btn-${age}`}
                    >
                      Age {age}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  Length (Pages)
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPageCount(num)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                        pageCount === num
                          ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                          : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                      id={`page-count-btn-${num}`}
                    >
                      {num} Pages
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Extra Ideas Input */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                Extra Story Ideas (Optional)
              </label>
              <input
                type="text"
                value={promptDetails}
                onChange={(e) => setPromptDetails(e.target.value)}
                placeholder="e.g. He loses his squeaky toy on the moon and makes alien friends!"
                className="w-full p-3 rounded-2xl border-2 border-amber-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-400"
                id="story-ideas-input"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-stone-100 text-stone-600 font-bold text-xs sm:text-sm hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!characterName.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-300/50 disabled:opacity-50 transition-all active:scale-95"
                id="submit-create-story-btn"
              >
                <Wand2 className="w-4 h-4 stroke-[2.5]" />
                <span>Generate Magic Story</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
