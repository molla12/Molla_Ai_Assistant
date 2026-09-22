import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Edit3,
  PenTool,
  Eraser,
  RotateCcw,
  Download,
  Sparkles,
  Send,
  BookOpen,
  Plus,
  Trash2,
  Highlighter,
  Palette,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import {
  MayaWhiteboardConfig,
  MayaWhiteboardNote,
  loadWhiteboardConfig,
  saveWhiteboardConfig,
} from './mayaStorage';

interface MayaWhiteboardDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

const COLORS = [
  { name: 'White / Black', hex: '#0f172a' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Purple', hex: '#a855f7' },
];

export const MayaWhiteboardDetailView: React.FC<MayaWhiteboardDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [config, setConfig] = useState<MayaWhiteboardConfig>(loadWhiteboardConfig);
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [selectedColor, setSelectedColor] = useState(isLight ? '#0f172a' : '#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [studyQuery, setStudyQuery] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<ImageData[]>([]);

  const cardCls = `rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 shadow-lg transition-all ${
    isLight
      ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
      : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
  }`;

  const activeNote =
    config.notes.find((n) => n.id === config.activeNoteId) || config.notes[0];

  // Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display and internal sizes
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 360 * 2;
    ctx.scale(2, 2);

    // Initial background
    ctx.fillStyle = isLight ? '#ffffff' : '#0a0f1d';
    ctx.fillRect(0, 0, rect.width, 360);

    // Draw helpful grid dots
    ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
    const dotSpacing = 24;
    for (let x = dotSpacing; x < rect.width; x += dotSpacing) {
      for (let y = dotSpacing; y < 360; y += dotSpacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Save initial state for undo
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, [config.activeNoteId, isLight]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = isLight ? '#ffffff' : '#0a0f1d';
      ctx.lineWidth = 24;
      ctx.globalAlpha = 1.0;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 18;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();

    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = isLight ? '#ffffff' : '#0a0f1d';
    ctx.fillRect(0, 0, rect.width, 360);

    // Re-draw grid dots
    ctx.fillStyle = isLight ? '#cbd5e1' : '#1e293b';
    const dotSpacing = 24;
    for (let x = dotSpacing; x < rect.width; x += dotSpacing) {
      for (let y = dotSpacing; y < 360; y += dotSpacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  const handleStudySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyQuery.trim()) return;
    setIsAnswering(true);
    const q = studyQuery.trim();
    setStudyQuery('');

    setTimeout(() => {
      setIsAnswering(false);
      if (q.toLowerCase().includes('ohm')) {
        setAiExplanation(
          "Ohm's Law states: V = I × R. Voltage (V in Volts) is proportional to current (I in Amperes) multiplied by resistance (R in Ohms). On the whiteboard, draw a triangle with V on top, and I and R on the bottom!"
        );
      } else if (q.toLowerCase().includes('quadratic') || q.toLowerCase().includes('math')) {
        setAiExplanation(
          "Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a). For standard equation ax² + bx + c = 0. The discriminant Δ = b² - 4ac reveals 2 real roots (Δ>0), 1 root (Δ=0), or complex roots (Δ<0)."
        );
      } else {
        setAiExplanation(
          `Maya Study Analysis for "${q}": Key principles broken into core steps: 1) Identify given variables; 2) Apply foundational formula; 3) Sketch schematic diagram on canvas to verify conservation laws.`
        );
      }
    }, 800);
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
          Study &amp; Whiteboard
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
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2
                  className={`text-base font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Interactive Canvas
                </h2>
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Draw diagrams, formulas &amp; take smart notes
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                isLight
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {activeNote.subject}
            </span>
          </div>
        </div>

        {/* Whiteboard Canvas Card */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl overflow-hidden shadow-lg transition-all space-y-2 ${
            isLight
              ? 'bg-white/85 border-white/95 text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 text-white'
          }`}
        >
          {/* Canvas Toolbar */}
          <div
            className={`flex items-center justify-between px-3.5 py-2.5 border-b backdrop-blur-xl flex-wrap gap-2 ${
              isLight
                ? 'bg-slate-100/80 border-slate-200/80'
                : 'bg-[#090e1b] border-white/5'
            }`}
          >
            {/* Tools */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`p-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                  activeTool === 'pen'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Pen"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('highlighter')}
                className={`p-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                  activeTool === 'highlighter'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Highlighter"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                className={`p-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-5 h-5 rounded-full transition-all cursor-pointer active:scale-90 border ${
                    selectedColor === c.hex
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-transparent'
                      : isLight
                      ? 'border-slate-300 opacity-80 hover:opacity-100'
                      : 'border-white/20 opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUndo}
                className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
                  isLight
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Undo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer active:scale-95"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer active:scale-95"
                title="Download Diagram"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive HTML5 Canvas */}
          <div className="relative touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[360px] block"
            />
          </div>
        </div>

        {/* Study Notes Text Card */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {activeNote.title}
              </h3>
            </div>
            <span
              className={`text-[11px] ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {activeNote.lastUpdated}
            </span>
          </div>
          <p
            className={`text-xs leading-relaxed font-mono p-3.5 rounded-2xl border transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-[#090e1b] border-white/5 text-slate-300'
            }`}
          >
            {activeNote.notesText}
          </p>
        </div>

        {/* Maya Study Assistant AI */}
        <div className={cardCls}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3
              className={`text-sm font-semibold ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              Maya Study Companion
            </h3>
          </div>
          <p
            className={`text-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Ask Maya to explain formulas, sketch visual flowcharts, or quiz you on study topics.
          </p>

          {/* Quick study prompts */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "Explain Ohm's Law with diagram",
              'Derive quadratic formula',
              'Summarize Carnot cycle',
              'Draw React state tree',
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setStudyQuery(p)}
                className={`px-3 py-1 rounded-xl text-[11px] border transition-colors cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-[#090e1b] hover:bg-white/10 text-slate-300 border-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={handleStudySubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question or request a diagram breakdown..."
              value={studyQuery}
              onChange={(e) => setStudyQuery(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-xs backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#090e1b]/90 border-white/10 text-white placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={isAnswering || !studyQuery.trim()}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
            >
              {isAnswering ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Explain
            </button>
          </form>

          {aiExplanation && (
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                isLight
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Maya Study Explanation:
              </div>
              <p>{aiExplanation}</p>
            </div>
          )}
        </div>

        {/* Saved Study Topics List */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h3
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Saved Whiteboards
              </h3>
            </div>
            <button
              type="button"
              className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New Note
            </button>
          </div>
          <div className="space-y-2">
            {config.notes.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  setConfig((prev) => {
                    const next = { ...prev, activeNoteId: n.id };
                    saveWhiteboardConfig(next);
                    return next;
                  });
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-95 ${
                  config.activeNoteId === n.id
                    ? isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                      : 'bg-amber-600/15 border-amber-500/40 text-white'
                    : isLight
                    ? 'bg-slate-50/90 border-slate-200 text-slate-800 hover:bg-slate-100'
                    : 'bg-[#090e1b]/70 border-white/5 text-slate-300 hover:bg-white/5'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold">{n.title}</h4>
                  <p
                    className={`text-[11px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {n.diagramsCount} diagrams • {n.lastUpdated}
                  </p>
                </div>
                {config.activeNoteId === n.id && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
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
