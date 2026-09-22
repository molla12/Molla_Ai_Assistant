import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Code2,
  Play,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Download,
  FolderGit2,
  Cpu,
  Sparkles,
  Send,
  Plus,
  RefreshCw,
  Layers,
  FileCode,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaWebsiteCodingConfig,
  loadWebsiteCodingConfig,
  saveWebsiteCodingConfig,
} from './mayaStorage';

interface MayaWebsiteCodingDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaWebsiteCodingDetailView: React.FC<MayaWebsiteCodingDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaWebsiteCodingConfig>(loadWebsiteCodingConfig);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '➜  Local:   http://localhost:3000/',
    '➜  Network: use --host to expose',
    '➜  press h + enter to show help',
    '[vite] ✨ build completed in 218ms',
  ]);

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  const activeProject = config.projects.find((p) => p.id === config.activeProjectId) || config.projects[0];
  const currentFile = activeProject.files[activeFileIndex] || activeProject.files[0];

  const handleCopyCode = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const userQuery = prompt.trim();
    setPrompt('');

    setTimeout(() => {
      setIsGenerating(false);
      setTerminalLogs((prev) => [
        ...prev,
        `[Maya AI] Prompt: "${userQuery}"`,
        `[Maya AI] Generating optimized TypeScript component...`,
        `[vite] HMR update /src/${currentFile.name}`,
      ]);
    }, 1200);
  };

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* Top App Bar */}
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

        <h1
          className={`text-base font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Website &amp; Coding
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-20 scrollbar-thin">
        {/* Header Card */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                  isLight
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                }`}
              >
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className={`text-base font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  AI Developer Suite
                </h2>
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Build, edit, deploy &amp; debug code with Maya
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Dev: Port 3000
            </div>
          </div>
        </div>

        {/* Active Project Card */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {activeProject.name}
              </h3>
            </div>
            <span
              className={`text-[11px] font-medium ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {activeProject.framework}
            </span>
          </div>
          <p
            className={`text-xs ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {activeProject.description}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
              className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              {viewMode === 'editor' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Code2 className="w-3.5 h-3.5" />}
              {viewMode === 'editor' ? 'Live Sandbox Preview' : 'View Code Editor'}
            </button>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-[#090e1b] hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Code Sandbox / Preview Area */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl overflow-hidden shadow-lg transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 text-white'
          }`}
        >
          {/* File Tabs Header */}
          <div
            className={`flex items-center justify-between px-3 py-2 border-b backdrop-blur-xl ${
              isLight
                ? 'bg-slate-100/80 border-slate-200/80'
                : 'bg-[#090e1b] border-white/5'
            }`}
          >
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {activeProject.files.map((f, idx) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    activeFileIndex === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  {f.name}
                </button>
              ))}
            </div>
            <span
              className={`text-[10px] font-mono uppercase ${
                isLight ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              {currentFile.language}
            </span>
          </div>

          {/* Editor or Live Preview */}
          {viewMode === 'editor' ? (
            <div
              className={`p-3 overflow-x-auto font-mono text-xs leading-relaxed max-h-72 select-text ${
                isLight
                  ? 'bg-slate-900 text-slate-200'
                  : 'bg-[#070b14] text-slate-300'
              }`}
            >
              <pre>
                <code>
                  {currentFile.code.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-7 select-none text-slate-600 text-right pr-3 shrink-0">{i + 1}</span>
                      <span className="text-slate-200">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          ) : (
            <div
              className={`p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-3 ${
                isLight ? 'bg-slate-50' : 'bg-slate-950'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isLight
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <h4
                className={`text-sm font-bold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Live Sandbox Viewport
              </h4>
              <p
                className={`text-xs max-w-sm ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Interactive component rendering simulated directly inside Maya. React state and styling fully reactive.
              </p>
              <div
                className={`p-3 rounded-2xl border text-xs font-mono ${
                  isLight
                    ? 'bg-white border-slate-200 text-emerald-600'
                    : 'bg-slate-900 border-white/10 text-emerald-400'
                }`}
              >
                Status: App mounted smoothly without console errors.
              </div>
            </div>
          )}
        </div>

        {/* Maya AI Coding Assistant Prompt */}
        <div className={cardCls}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <h3
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Maya Coding Copilot
            </h3>
          </div>
          <p
            className={`text-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Ask Maya to refactor, write new components, integrate APIs, or fix bugs.
          </p>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Add dark mode toggle',
              'Connect Firestore DB',
              'Fix mobile responsiveness',
              'Create REST API route',
            ].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleQuickPrompt(s)}
                className={`px-3 py-1 rounded-xl text-[11px] border transition-colors cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#090e1b] hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handlePromptSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Build an animated responsive navigation header..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-xs backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-colors ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#090e1b]/90 border-white/10 text-white placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Generate
            </button>
          </form>
        </div>

        {/* Live Dev Terminal Console */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <h3
                className={`text-xs font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Dev Server Terminal
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono ${
                isLight ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              bash • node v20
            </span>
          </div>
          <div
            className={`p-3.5 rounded-2xl border font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto ${
              isLight
                ? 'bg-slate-900 text-emerald-400 border-slate-800'
                : 'bg-[#070b14] text-emerald-400/90 border-white/5'
            }`}
          >
            {terminalLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className={cardCls}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-blue-500" />
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Recent Projects
              </h3>
            </div>
            <button
              type="button"
              className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
          <div className="space-y-2">
            {config.projects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setConfig((prev) => {
                    const next = { ...prev, activeProjectId: p.id };
                    saveWebsiteCodingConfig(next);
                    return next;
                  });
                  setActiveFileIndex(0);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-95 ${
                  config.activeProjectId === p.id
                    ? isLight
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-blue-600/15 border-blue-500/40 text-white'
                    : isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100'
                    : 'bg-[#090e1b]/70 border-white/5 text-slate-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold">{p.name}</h4>
                  <p
                    className={`text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {p.framework} • {p.lastModified}
                  </p>
                </div>
                {config.activeProjectId === p.id && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

