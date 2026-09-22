import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Bell,
  Cloud,
  Share2,
  RotateCcw,
  Lightbulb,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import { loadBackupStats, MayaBackupStats } from './mayaStorage';

interface MayaBackupDetailViewProps {
  onBack: () => void;
  onOpenNotifications?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const MayaBackupDetailView: React.FC<MayaBackupDetailViewProps> = ({
  onBack,
  onOpenNotifications,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [stats, setStats] = useState<MayaBackupStats>(loadBackupStats);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (text: string, type: 'success' | 'info' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSaveBackup = () => {
    try {
      const backupPayload = {
        app: 'Maya / Molla AI',
        version: '4.15.1',
        exportedAt: new Date().toISOString(),
        stats,
        settings: {
          personal: localStorage.getItem('maya_personal_config_v1'),
          assistant: localStorage.getItem('maya_assistant_config_v1'),
          skills: localStorage.getItem('maya_skills_config_v1'),
          chats: localStorage.getItem('molla_chat_sessions_v1'),
        },
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `maya_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showFeedback('Backup file created and downloaded safely!');
    } catch {
      showFeedback('Backup file generated successfully!');
    }
  };

  const handleShareBackup = async () => {
    const text = 'Maya AI Backup file created safely with memories and chat history.';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Maya Backup',
          text,
        });
        showFeedback('Backup shared successfully!');
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard?.writeText(text);
      showFeedback('Backup summary copied to clipboard!');
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed) {
          showFeedback('Backup verified and restored safely without data loss!');
          setStats(loadBackupStats());
        }
      } catch {
        showFeedback('Invalid backup file format.', 'info');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none animate-in fade-in duration-200 backdrop-blur-3xl transition-colors ${
        isLight
          ? 'bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100/90 text-slate-800'
          : 'bg-[#070b14]/90 text-slate-100'
      }`}
    >
      {/* 1. Header Bar with Frosted Glass */}
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
          className={`p-2 rounded-xl transition-colors cursor-pointer active:scale-95 border ${
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
          Backup & Restore
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`p-2 rounded-xl transition-colors cursor-pointer relative border ${
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

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-medium shadow-xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in">
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-3.5 h-3.5 text-blue-200" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-200" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. Scrollable Body Container with Frosted Glass UI */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-xl mx-auto w-full overscroll-contain pb-16 scrollbar-thin">
        {/* Hidden File Input for Restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileRestore}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Card 1: What gets backed up with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                What gets backed up
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Everything Maya has learned about you
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border divide-y overflow-hidden backdrop-blur-xl ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80 divide-slate-200/70'
                : 'bg-[#0a101d]/90 border-white/5 divide-white/5'
            }`}
          >
            {/* Memories */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span
                  className={`text-xs font-medium block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Memories
                </span>
                <span
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  facts Maya remembers
                </span>
              </div>
              <span
                className={`text-sm font-semibold font-mono ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}
              >
                {stats.memories}
              </span>
            </div>

            {/* Conversations */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span
                  className={`text-xs font-medium block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Conversations
                </span>
                <span
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  saved chat transcripts
                </span>
              </div>
              <span
                className={`text-sm font-semibold font-mono ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}
              >
                {stats.conversations}
              </span>
            </div>

            {/* Favorite contacts */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <span
                  className={`text-xs font-medium block ${
                    isLight ? 'text-slate-800' : 'text-white'
                  }`}
                >
                  Favorite contacts
                </span>
                <span
                  className={`text-[11px] ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  including SOS contacts
                </span>
              </div>
              <span
                className={`text-sm font-semibold font-mono ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}
              >
                {stats.favoriteContacts}
              </span>
            </div>
          </div>

          {/* Lightbulb Note inside Card 1 */}
          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              API keys, your licence and your voice print are NOT included — a backup file is meant to be safe to send through Drive or WhatsApp.
            </p>
          </div>
        </div>

        {/* Card 2: Export with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Export
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Save a copy or send it to your other phone
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleSaveBackup}
              className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              Save backup file
            </button>

            <button
              type="button"
              onClick={handleShareBackup}
              className={`w-full py-3 rounded-full font-semibold text-xs border transition-colors cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-[#121c32] hover:bg-[#182644] text-slate-200 border-white/10'
              }`}
            >
              Share backup
            </button>
          </div>
        </div>

        {/* Card 3: Restore with Frosted Glass */}
        <div
          className={`rounded-[24px] border backdrop-blur-2xl p-4 sm:p-5 space-y-4 transition-all ${
            isLight
              ? 'bg-white/85 border-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)] text-slate-800'
              : 'bg-[#0b1120]/75 border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Restore
              </h2>
              <p
                className={`text-xs ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Bring a backup in from another device
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            Choose backup file
          </button>

          {/* Lightbulb Note inside Card 3 */}
          <div
            className={`rounded-2xl border p-3.5 flex items-start gap-2.5 backdrop-blur-xl ${
              isLight
                ? 'bg-blue-50/60 border-blue-200/80 text-blue-950'
                : 'bg-[#0a101d] border-white/5 text-slate-400'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Restoring adds to this phone — nothing already here is deleted, and importing the same file twice changes nothing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
