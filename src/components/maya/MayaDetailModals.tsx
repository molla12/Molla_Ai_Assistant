import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Bot,
  Mail,
  Users,
  Share2,
  Cloud,
  Sliders,
  Puzzle,
  Network,
  ShieldCheck,
  Brain,
  Repeat,
  TrendingUp,
  FileText,
  Code2,
  PenTool,
  Check,
  Lock,
  Star,
  QrCode,
  Laptop,
  Smartphone,
  Plus,
  Trash2,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface MayaDetailModalProps {
  type: string | null;
  title?: string;
  onClose: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaDetailModal: React.FC<MayaDetailModalProps> = ({
  type,
  title,
  onClose,
  effectiveTheme = 'dark',
}) => {
  if (!type) return null;
  const isLight = effectiveTheme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in select-none">
      <div
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-[24px] border backdrop-blur-2xl shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-white/95 border-white/95 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.15)]'
            : 'bg-[#0b1222]/90 border-white/12 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 backdrop-blur-xl ${
            isLight
              ? 'bg-slate-100/80 border-slate-200/80'
              : 'bg-[#0e172a]/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MayaAvatar size="sm" />
            <h3
              className={`text-sm font-bold truncate max-w-[280px] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {title || 'Maya Assistant'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs overscroll-contain">
          {type === 'memories' && <MemoriesView />}
          {type === 'markets' && <MarketsView />}
          {type === 'documents' && <DocumentsView />}
          {type === 'coding' && <CodingView />}
          {type === 'study' && <StudyView />}
          {type === 'maya_rules' && <MayaRulesView />}
          {type === 'pc_phone' && <PcPhoneView />}
          {type === 'upgrade' && <UpgradeView />}
          {type === 'notifications' && <NotificationsView />}
          {type === 'privacy' && <PrivacyView />}
          {type === 'about' && <AboutView />}
          {type === 'maya_assistant' && <MayaAssistantView />}
          {type === 'skills' && <SkillsView />}
          {type === 'sub_agents' && <SubAgentsView />}
          {type === 'email' && <EmailView />}
          {type === 'whatsapp' && <WhatsAppView />}
          {type === 'social_media' && <SocialMediaView />}
          {type === 'connectors' && <ConnectorsView />}
          {type === 'backup' && <BackupView />}
          {type === 'advanced' && <AdvancedView />}
          {type === 'optional' && <OptionalView />}
        </div>
      </div>
    </div>
  );
};

/* 1. Memories View */
function MemoriesView() {
  const [memories, setMemories] = useState<string[]>([
    'Hunter prefers Hindi and English conversations with a warm and polite tone.',
    'Favorite music app is set to YT Music with preference for melodic Indian songs.',
    'Always provide concise code explanations with TypeScript snippets.',
    'Daily briefings scheduled at 9:00 AM every weekday.',
  ]);
  const [newMem, setNewMem] = useState('');

  const handleAdd = () => {
    if (!newMem.trim()) return;
    setMemories([newMem.trim(), ...memories]);
    setNewMem('');
  };

  const handleDelete = (index: number) => {
    setMemories(memories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 flex items-start gap-2.5">
        <Brain className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Maya automatically extracts key facts, preferences, and tasks from your voice and chat interactions to personalize future responses.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMem}
          onChange={(e) => setNewMem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add a new custom memory for Maya..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#090e1b] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="space-y-2">
        {memories.map((m, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5 gap-3"
          >
            <p className="text-slate-200 flex-1">{m}</p>
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2. Markets View */
function MarketsView() {
  const items = [
    { name: 'NIFTY 50', val: '25,388.90', chg: '+0.42%', up: true },
    { name: 'SENSEX', val: '83,184.80', chg: '+0.38%', up: true },
    { name: 'BTC / USD', val: '$64,250.00', chg: '+2.15%', up: true },
    { name: 'ETH / USD', val: '$2,480.50', chg: '-0.35%', up: false },
    { name: 'GOLD (10g)', val: '₹74,120', chg: '+0.12%', up: true },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3">
        <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          AI Financial & Market Intelligence
        </h4>
        <p className="text-slate-400 text-[11px]">
          Maya monitors global equities, commodities, and currency movements in real time.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5"
          >
            <span className="font-semibold text-white">{item.name}</span>
            <div className="text-right">
              <span className="font-mono text-white block">{item.val}</span>
              <span
                className={`text-[10px] font-bold ${
                  item.up ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.chg}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 3. Documents View */
function DocumentsView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-400" />
          Maya Document Hub
        </h4>
        <p className="text-slate-400 text-[11px]">
          Upload PDFs, research papers, or spreadsheets to have Maya summarize, extract insights, and answer questions.
        </p>
      </div>

      <div className="border border-dashed border-white/20 rounded-2xl p-6 text-center bg-[#090e1b]">
        <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="font-medium text-white mb-1">Drag & drop documents here</p>
        <p className="text-slate-400 text-[10px] mb-3">Supports PDF, DOCX, TXT, CSV up to 25MB</p>
        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
        >
          Select File
        </button>
      </div>
    </div>
  );
}

/* 4. Coding View */
function CodingView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-cyan-400" />
          Website & Coding Assistant
        </h4>
        <p className="text-slate-400 text-[11px]">
          Maya can debug errors, generate full-stack components, audit security, and build APIs.
        </p>
      </div>

      <div className="rounded-xl bg-[#070a12] border border-white/10 p-3 font-mono text-[11px] text-emerald-400">
        <p className="text-slate-500">// Ready to pair program with Maya</p>
        <p>const maya = new MayaDeveloper({"{"} model: "gemini-flash" {"}"});</p>
        <p>await maya.assist("Build modern dashboard with Tailwind");</p>
      </div>
    </div>
  );
}

/* 5. Study View */
function StudyView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-semibold text-white mb-1 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-purple-400" />
          Study & Whiteboard Companion
        </h4>
        <p className="text-slate-400 text-[11px]">
          Interactive study buddy for conceptual tutoring, math step-by-step breakdowns, and whiteboard diagrams.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[#11192e] border border-white/5">
          <span className="font-bold text-white block mb-1">Quick Flashcards</span>
          <span className="text-[10px] text-slate-400">Generated from your latest voice discussions</span>
        </div>
        <div className="p-3 rounded-xl bg-[#11192e] border border-white/5">
          <span className="font-bold text-white block mb-1">Live Whiteboard</span>
          <span className="text-[10px] text-slate-400">Freeform canvas for sketches and mind maps</span>
        </div>
      </div>
    </div>
  );
}

/* 6. Maya Rules */
function MayaRulesView() {
  const rules = [
    '1. Absolute Respect: Speak with genuine warmth, empathy, and loyalty.',
    '2. Context Awareness: Retain multi-turn memory and user preferences accurately.',
    '3. Privacy Safeguards: Keep all personal information encrypted and local.',
    '4. Clear Pronunciation: Respond fluently in Hindi, Bengali, or English.',
    '5. Real-Time Responsiveness: Prioritize instant vocal audio delivery.',
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
        <div>
          <h4 className="font-bold text-white">Maya System Rules</h4>
          <p className="text-slate-400 text-[10px]">Guidelines calibrated by The Hunter AI</p>
        </div>
      </div>

      <div className="space-y-2">
        {rules.map((rule, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-[#11192e] border border-white/5 text-slate-200">
            {rule}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 7. PC Phone View */
function PcPhoneView() {
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-4 py-2">
        <Laptop className="w-8 h-8 text-blue-400" />
        <Repeat className="w-5 h-5 text-slate-400 animate-pulse" />
        <Smartphone className="w-8 h-8 text-blue-400" />
      </div>

      <div>
        <h4 className="text-sm font-bold text-white mb-1">PC ⇄ Phone Live Link</h4>
        <p className="text-slate-400 text-[11px]">
          Seamlessly continue your conversations, clipboard, and notifications across your devices.
        </p>
      </div>

      <div className="w-36 h-36 mx-auto bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg">
        <QrCode className="w-full h-full text-slate-900" />
      </div>

      <p className="text-[10px] text-slate-400 font-mono">
        Scan with Maya on your other device to sync instantly.
      </p>
    </div>
  );
}

/* 8. Upgrade View */
function UpgradeView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5">
        <Star className="w-5 h-5 text-amber-400 shrink-0 fill-amber-400" />
        <div>
          <h4 className="font-bold text-white">Maya Pro Tier</h4>
          <p className="text-amber-200 text-[10px]">Unlimited Energy & Real-Time Ultra Voice</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#11192e] border border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Current Balance:</span>
          <span className="font-bold text-amber-400 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5" /> 1 Energy
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Plan:</span>
          <span className="font-semibold text-white">Free Starter</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
      >
        Upgrade to Maya Pro ($9.99/mo)
      </button>
    </div>
  );
}

/* 9. Notifications View */
function NotificationsView() {
  const notifs = [
    { title: 'Maya v4.15.1 Online', time: 'Just now', desc: 'Latest voice models and Gemini updates installed.' },
    { title: '1 Energy daily reload', time: '2 hours ago', desc: 'Your daily free energy unit has been recharged.' },
    { title: 'PC ⇄ Phone available', time: 'Yesterday', desc: 'You can now link multiple devices easily.' },
  ];

  return (
    <div className="space-y-2">
      {notifs.map((n, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-[#11192e] border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{n.title}</span>
            <span className="text-[10px] text-slate-500">{n.time}</span>
          </div>
          <p className="text-slate-400 text-[11px]">{n.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* 10. Privacy View */
function PrivacyView() {
  return (
    <div className="space-y-2 text-slate-300 leading-relaxed text-[11px]">
      <h4 className="text-sm font-bold text-white mb-2">Privacy Policy</h4>
      <p>
        Your privacy is paramount. Maya stores your chat sessions and personal preferences locally inside your browser sandbox.
      </p>
      <p>
        Voice and audio packets streamed during live sessions are processed solely to synthesize voice and are never shared or sold to third-party ad networks.
      </p>
    </div>
  );
}

/* 11. About View */
function AboutView() {
  return (
    <div className="text-center space-y-3 py-2">
      <MayaAvatar size="lg" className="mx-auto" />
      <div>
        <h4 className="text-base font-bold text-white">Maya AI Assistant</h4>
        <p className="text-xs text-blue-400">by The Hunter AI</p>
      </div>
      <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
        Next-generation AI companion built for natural conversations, memory retention, productivity, and real-time live assistance.
      </p>
      <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-slate-400">
        v4.15.1 · Production Build
      </span>
    </div>
  );
}

/* 12. Settings Sub-Views */
function MayaAssistantView() {
  const [girlfriendMode, setGirlfriendMode] = useState(false);
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Maya Persona & Tone</h4>
        <p className="text-slate-400 text-[11px]">Configure voice style, companionship mode, and language habits.</p>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5">
        <div>
          <span className="font-semibold text-white block">Girlfriend Mode</span>
          <span className="text-[10px] text-slate-400">Affectionate companion dialogue</span>
        </div>
        <button
          type="button"
          onClick={() => setGirlfriendMode(!girlfriendMode)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            girlfriendMode ? 'bg-blue-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              girlfriendMode ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function SkillsView() {
  return (
    <div className="space-y-2">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Installed Skills</h4>
        <p className="text-slate-400 text-[11px]">Playbooks and extensions enabled for Maya.</p>
      </div>
      {['Google Search Grounding', 'Code Sandbox Interpreter', 'Live Audio Synthesizer', 'OCR Vision Processor'].map(
        (skill, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5">
            <span className="font-medium text-white">{skill}</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        )
      )}
    </div>
  );
}

function SubAgentsView() {
  return (
    <div className="space-y-2">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Sub-Agents & Background Models</h4>
        <p className="text-slate-400 text-[11px]">Specialized sub-routines handling complex tasks.</p>
      </div>
      {['Coder Agent (Gemini Flash)', 'Research Agent (Deep Search)', 'Executive Scheduler'].map((agent, i) => (
        <div key={i} className="p-3 rounded-xl bg-[#11192e] border border-white/5 flex items-center justify-between">
          <span className="font-medium text-white">{agent}</span>
          <span className="text-[10px] text-blue-400">Ready</span>
        </div>
      ))}
    </div>
  );
}

function EmailView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Email Integration</h4>
        <p className="text-slate-400 text-[11px]">Allow Maya to summarize unread emails and draft replies.</p>
      </div>
      <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 text-slate-300">
        No email account currently connected. Tap below to authenticate with Gmail or Outlook.
      </div>
      <button type="button" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs">
        Connect Email
      </button>
    </div>
  );
}

function WhatsAppView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">WhatsApp Groups & Reports</h4>
        <p className="text-slate-400 text-[11px]">Maya can summarize group discussions and generate daily briefings.</p>
      </div>
      <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 text-slate-300">
        WhatsApp bridge is ready. Select group chats to monitor.
      </div>
    </div>
  );
}

function SocialMediaView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Social Media Automation</h4>
        <p className="text-slate-400 text-[11px]">Automate Instagram, X, and YouTube caption generation.</p>
      </div>
      <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 text-slate-300">
        Configure scheduled posts and voice tone for social accounts.
      </div>
    </div>
  );
}

function ConnectorsView() {
  const apps = [
    { name: 'GitHub', desc: 'Repo commit & PR notifications', status: 'Connected' },
    { name: 'Notion', desc: 'Sync notes & databases', status: 'Connected' },
    { name: 'Telegram', desc: 'Direct message relay', status: 'Connected' },
    { name: 'Google Drive', desc: 'Cloud storage integration', status: 'Connected' },
    { name: 'Spotify', desc: 'Playlist and playback control', status: 'Connected' },
    { name: 'YouTube', desc: 'Channel analytics', status: 'Connected' },
  ];

  return (
    <div className="space-y-2">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white">6 Connected Services</h4>
          <p className="text-slate-400 text-[10px]">Cloud APIs and account bridges</p>
        </div>
        <Network className="w-5 h-5 text-blue-400" />
      </div>

      {apps.map((app, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5">
          <div>
            <span className="font-semibold text-white block">{app.name}</span>
            <span className="text-[10px] text-slate-400">{app.desc}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {app.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function BackupView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Backup & Restore</h4>
        <p className="text-slate-400 text-[11px]">Keep your memories and chat archives safe.</p>
      </div>
      <div className="flex gap-2">
        <button type="button" className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs">
          Export JSON
        </button>
        <button type="button" className="flex-1 py-2 rounded-xl bg-[#121c32] text-slate-200 font-semibold text-xs border border-white/5">
          Restore File
        </button>
      </div>
    </div>
  );
}

function AdvancedView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Advanced Settings</h4>
        <p className="text-slate-400 text-[11px]">Safety filters, audio buffer latency, and memory indexing.</p>
      </div>
      <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 space-y-2 text-slate-300">
        <div className="flex items-center justify-between">
          <span>Audio Latency Mode</span>
          <span className="text-blue-400 font-mono">Ultra-low (Sub-150ms)</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Vision Resolution</span>
          <span className="text-blue-400 font-mono">1080p HD</span>
        </div>
      </div>
    </div>
  );
}

function OptionalView() {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <h4 className="font-bold text-white mb-1">Optional Integrations</h4>
        <p className="text-slate-400 text-[11px]">Google Maps / Places and navigation hooks.</p>
      </div>
      <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 text-slate-300">
        Maps location querying enabled for live local restaurant, weather, and traffic suggestions.
      </div>
    </div>
  );
}
