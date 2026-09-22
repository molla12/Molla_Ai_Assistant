import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Brain,
  Search,
  Plus,
  Play,
  Trash2,
  Edit2,
  Check,
  CheckCircle,
  X,
  Sparkles,
  Clock,
  Volume2,
  Radio,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  loadMemories,
  saveMemories,
  loadMemorySettings,
  saveMemorySettings,
  MayaMemoryItem,
  MayaMemorySettings,
  getStoredGeminiApiKey,
} from './mayaStorage';
import { audioCoordinator } from '../../services/audioCoordinator';
import { speakMollaWithNaturalVoice } from '../../services/naturalSpeech';

interface MayaMemoriesDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaMemoriesDetailView: React.FC<MayaMemoriesDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [memories, setMemories] = useState<MayaMemoryItem[]>(loadMemories);
  const [settings, setSettings] = useState<MayaMemorySettings>(loadMemorySettings);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'Preference' | 'Personal' | 'Work' | 'Rules'>('Preference');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);

  // Proactive questioning test state
  const [isTestingQuestion, setIsTestingQuestion] = useState(false);
  const [testQuestion, setTestQuestion] = useState<string | null>(null);
  const [testSource, setTestSource] = useState<string | null>(null);

  const trainedTasks = [
    {
      id: 't-1',
      title: 'Send daily morning briefing',
      subtitle: 'Speaks weather, appointments & tech headlines at 9:00 AM',
    },
    {
      id: 't-2',
      title: 'Log market summary at 3:30 PM',
      subtitle: 'Captures NIFTY 50 and Sensex closing numbers to notes',
    },
    {
      id: 't-3',
      title: 'Check WhatsApp unread',
      subtitle: 'Reads critical unread messages and drafts quick replies',
    },
    {
      id: 't-4',
      title: 'Run evening wind-down',
      subtitle: 'Plays calm instrumental playlist and sets screen warmth',
    },
  ];

  const handleRunTask = (title: string) => {
    setTaskFeedback(`Executing task: "${title}"... Completed!`);
    setTimeout(() => {
      setTaskFeedback(null);
    }, 3000);
  };

  const handleToggleProactive = () => {
    const next = { ...settings, proactiveQuestionsEnabled: !settings.proactiveQuestionsEnabled };
    setSettings(next);
    saveMemorySettings(next);
    setTaskFeedback(
      next.proactiveQuestionsEnabled
        ? 'স্মৃতিভিত্তিক ৩০ সেকেন্ডের স্বতঃস্ফূর্ত প্রশ্ন চালু হয়েছে (Proactive 30s questioning ON)'
        : 'স্মৃতিভিত্তিক প্রশ্ন বন্ধ করা হয়েছে (Proactive questioning paused)'
    );
    setTimeout(() => setTaskFeedback(null), 3500);
  };

  const handleUpdateInterval = (sec: number) => {
    const next = { ...settings, intervalSeconds: sec };
    setSettings(next);
    saveMemorySettings(next);
    setTaskFeedback(`প্রশ্নের ব্যবধান ${sec} সেকেন্ড সেট করা হয়েছে`);
    setTimeout(() => setTaskFeedback(null), 3000);
  };

  const handleTestProactiveQuestion = async () => {
    if (memories.length === 0) {
      setTaskFeedback('অনুগ্রহ করে নিচে অন্তত একটি মেমোরি যোগ করুন!');
      setTimeout(() => setTaskFeedback(null), 3000);
      return;
    }
    setIsTestingQuestion(true);
    setTestQuestion(null);
    setTestSource(null);
    try {
      const storedKey = getStoredGeminiApiKey();
      const res = await fetch('/api/memory/proactive-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {}),
        },
        body: JSON.stringify({
          memories,
          lang: 'bn',
          voice: 'Aoede',
        }),
      });
      const data = await res.json();
      if (data && data.question) {
        setTestQuestion(data.question);
        setTestSource(data.memorySource || null);
        // Play voice using Molla natural voice
        audioCoordinator.requestPlayback('chat', `test_mem_q_${Date.now()}`, 'Memory Question Test');
        speakMollaWithNaturalVoice(
          data.question,
          'Aoede',
          {
            onEnd: () => {
              audioCoordinator.playbackFinished('chat');
            },
          },
          'bn'
        );
      }
    } catch (err) {
      console.error(err);
      setTaskFeedback('প্রশ্ন তৈরি করতে সমস্যা হয়েছে');
      setTimeout(() => setTaskFeedback(null), 3000);
    } finally {
      setIsTestingQuestion(false);
    }
  };

  const handleAddMemory = () => {
    if (!newText.trim()) return;
    const item: MayaMemoryItem = {
      id: `m-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
      learnedAt: 'Just added',
    };
    const updated = [item, ...memories];
    setMemories(updated);
    saveMemories(updated);
    setNewText('');
    setIsAddOpen(false);
    setTaskFeedback('মেমোরি সংরক্ষিত হয়েছে! মায়া এখন এই অনুযায়ী কথা বলবে ও ৩০ সেকেন্ড পর পর প্রশ্ন করবে।');
    setTimeout(() => setTaskFeedback(null), 4000);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    saveMemories(updated);
    setTaskFeedback('মেমোরি মোছা হয়েছে');
    setTimeout(() => setTaskFeedback(null), 2500);
  };

  const handleStartEdit = (mem: MayaMemoryItem) => {
    setEditingId(mem.id);
    setEditText(mem.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    const updated = memories.map((m) => (m.id === id ? { ...m, text: editText.trim() } : m));
    setMemories(updated);
    saveMemories(updated);
    setEditingId(null);
    setTaskFeedback('মেমোরি সফলভাবে আপডেট করা হয়েছে');
    setTimeout(() => setTaskFeedback(null), 3000);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        <div className="text-center">
          <h1
            className={`text-base font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Memories
          </h1>
        </div>

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

      {/* Task feedback toast */}
      {taskFeedback && (
        <div className="px-4 pt-3 max-w-xl mx-auto w-full">
          <div
            className={`rounded-xl border p-3 flex items-center gap-2 text-xs shadow-lg animate-in fade-in backdrop-blur-xl ${
              isLight
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{taskFeedback}</span>
          </div>
        </div>
      )}

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 max-w-xl mx-auto w-full overscroll-contain pb-12 scrollbar-thin">
        {/* Intro */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-xl ${
            isLight
              ? 'bg-blue-50/80 border-blue-200/90 text-blue-950'
              : 'bg-blue-500/10 border-blue-500/20 text-slate-200'
          }`}
        >
          <Brain
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              isLight ? 'text-blue-600' : 'text-blue-400'
            }`}
          />
          <div>
            <h2
              className={`text-xs font-semibold ${
                isLight ? 'text-blue-950' : 'text-white'
              }`}
            >
              What Maya knows and remembers about you
            </h2>
            <p
              className={`text-[11px] mt-0.5 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              These insights are automatically extracted from conversations and used to adapt her tone, recommendations, and decisions.
            </p>
          </div>
        </div>

        {/* SECTION: 30-Second Proactive Question Engine */}
        <div
          className={`p-4 rounded-2xl border backdrop-blur-xl transition-all space-y-3.5 shadow-sm ${
            isLight
              ? 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/70 border-indigo-200/80 text-slate-800'
              : 'bg-gradient-to-br from-indigo-950/40 via-[#0c1222]/80 to-purple-950/30 border-indigo-500/30 text-white'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold tracking-tight">
                    স্বতঃস্ফূর্ত মেমোরি প্রশ্ন ইঞ্জিন (30s Proactive Questions)
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                    settings.proactiveQuestionsEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${settings.proactiveQuestionsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                    {settings.proactiveQuestionsEnabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  অ্যাপ চালু বা প্লে করলেই মেমোরি সার্চ করে প্রতি ৩০ সেকেন্ড পর পর মানুষের মতো প্রশ্ন করবে।
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleProactive}
              aria-label="Toggle proactive questioning"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.proactiveQuestionsEnabled ? 'bg-indigo-600' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.proactiveQuestionsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Interval & Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-500/15 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                ব্যবধান (Interval):
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-black/20 border border-white/10 text-[11px]">
                {[15, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleUpdateInterval(sec)}
                    className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                      (settings.intervalSeconds || 30) === sec
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Test Question Now Button */}
            <button
              type="button"
              onClick={handleTestProactiveQuestion}
              disabled={isTestingQuestion}
              className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                isTestingQuestion
                  ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
              }`}
            >
              {isTestingQuestion ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>এখনই প্রশ্ন শুনুন (Test Question)</span>
                </>
              )}
            </button>
          </div>

          {/* Display Last Test Question if available */}
          {testQuestion && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-top-1 ${
                isLight
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                  : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-relaxed">"{testQuestion}"</p>
                {testSource && (
                  <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-900/60 text-indigo-300'
                  }`}>
                    অনুপ্রেরণা (Memory Source): {testSource}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 1: Trained tasks */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Trained tasks &amp; routines
            </h2>
            <span
              className={`text-[11px] font-semibold ${
                isLight ? 'text-blue-600' : 'text-blue-400'
              }`}
            >
              Auto-executing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trainedTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-3 transition-all ${
                  isLight
                    ? 'bg-white/85 border-white/95 shadow-sm hover:shadow-md'
                    : 'bg-[#0b1120]/75 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xs font-semibold truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {t.title}
                  </h3>
                  <p
                    className={`text-[10px] line-clamp-1 mt-0.5 ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {t.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRunTask(t.title)}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95 ${
                    isLight
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 shadow-xs'
                      : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/30'
                  }`}
                  title="Run task now"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Filter & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border backdrop-blur-xl text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#0b1120]/80 border-white/10 text-white placeholder-slate-500'
              }`}
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1.5">
              {(['All', 'Preference', 'Personal', 'Work', 'Rules'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : isLight
                      ? 'bg-white/80 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-white'
                      : 'bg-[#0b1120]/75 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddOpen(!isAddOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-white/90 hover:bg-white text-blue-600 border-slate-200 shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Add Memory Form if open */}
        {isAddOpen && (
          <div
            className={`p-4 rounded-[24px] border backdrop-blur-2xl shadow-xl space-y-3 animate-in slide-in-from-top duration-200 ${
              isLight
                ? 'bg-white/95 border-blue-300 shadow-[0_12px_36px_rgba(37,99,235,0.08)]'
                : 'bg-[#0b1120]/95 border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Add New Memory
              </span>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-400 hover:text-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-1.5">
              {(['Preference', 'Personal', 'Work', 'Rules'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    newCategory === c
                      ? 'bg-blue-600 text-white border-blue-500'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-[#0a101d] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Likes black coffee without sugar in the morning..."
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#0a101d] border-white/10 text-white placeholder-slate-500'
              }`}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMemory}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors active:scale-95 shadow-xs"
              >
                Save Memory
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: Memories List */}
        <div className="space-y-2.5">
          {filteredMemories.length === 0 ? (
            <div
              className={`p-8 text-center rounded-[24px] border backdrop-blur-xl ${
                isLight
                  ? 'bg-white/60 border-slate-200 text-slate-500'
                  : 'bg-[#0b1120]/50 border-white/5 text-slate-400'
              }`}
            >
              <p className="text-xs">No memories found in this category.</p>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className={`p-4 rounded-[22px] border backdrop-blur-2xl shadow-sm space-y-2.5 transition-all ${
                    isLight
                      ? 'bg-white/85 border-white/95 shadow-[0_4px_20px_rgba(15,23,42,0.04)] text-slate-800 hover:border-slate-300'
                      : 'bg-[#0b1120]/75 border-white/12 shadow-lg text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                        isLight
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {mem.category}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isLight ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {mem.learnedAt}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                          isLight
                            ? 'bg-slate-50 border-blue-500 text-slate-900'
                            : 'bg-[#0a101d] border-blue-500 text-white'
                        }`}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={`px-2.5 py-1 rounded-lg text-xs ${
                            isLight
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-white/5 text-slate-300'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(mem.id)}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1 active:scale-95"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`text-xs leading-relaxed ${
                        isLight ? 'text-slate-700' : 'text-slate-200'
                      }`}
                    >
                      {mem.text}
                    </p>
                  )}

                  {!isEditing && (
                    <div
                      className={`flex items-center justify-end gap-1 pt-1.5 border-t ${
                        isLight ? 'border-slate-200/80' : 'border-white/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleStartEdit(mem)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                        title="Edit memory"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(mem.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
