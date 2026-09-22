import React, { useState, useEffect } from 'react';
import {
  X,
  Home,
  Brain,
  MessageSquare,
  FileText,
  Edit3,
  Settings,
  ShieldCheck,
  Lock,
  Info,
  Star,
  Bell,
  Zap,
  Download,
  ChevronRight,
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import { loadAssistantConfig, loadMemories, loadMemorySettings } from './mayaStorage';

interface MayaLeftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'home' | 'chat';
  onNavigateHome: () => void;
  onNavigateChat: () => void;
  onOpenSettings: () => void;
  onOpenDetailModal: (type: string, title: string) => void;
  onOpenInstallModal?: () => void;
  onOpenThemeChooserModal?: () => void;
  themeMode?: 'dark' | 'light' | 'system';
  effectiveTheme?: 'light' | 'dark';
  onSelectThemeMode?: (mode: 'system' | 'light' | 'dark') => void;
  isEdgeLightingEnabled?: boolean;
  onToggleEdgeLighting?: () => void;
}

export const MayaLeftDrawer: React.FC<MayaLeftDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onNavigateHome,
  onNavigateChat,
  onOpenSettings,
  onOpenDetailModal,
  onOpenInstallModal,
  onOpenThemeChooserModal,
  themeMode = 'dark',
  effectiveTheme = 'dark',
  onSelectThemeMode,
  isEdgeLightingEnabled = true,
  onToggleEdgeLighting,
}) => {
  const [assistantName, setAssistantName] = useState(() => {
    return loadAssistantConfig().assistantName || 'molla';
  });

  const [memoryCount, setMemoryCount] = useState(() => loadMemories().length);
  const [isProactiveActive, setIsProactiveActive] = useState(() => loadMemorySettings().proactiveQuestionsEnabled);

  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.assistantName) {
        setAssistantName(e.detail.assistantName);
      } else {
        setAssistantName(loadAssistantConfig().assistantName || 'molla');
      }
    };

    const handleMemoriesUpdate = (e: any) => {
      const mems = e.detail || loadMemories();
      setMemoryCount(mems.length);
    };

    const handleSettingsUpdate = (e: any) => {
      const cfg = e.detail || loadMemorySettings();
      setIsProactiveActive(cfg.proactiveQuestionsEnabled);
    };

    window.addEventListener('maya_assistant_config_updated', handleUpdate);
    window.addEventListener('maya_memories_updated', handleMemoriesUpdate);
    window.addEventListener('maya_memory_settings_updated', handleSettingsUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('maya_assistant_config_updated', handleUpdate);
      window.removeEventListener('maya_memories_updated', handleMemoriesUpdate);
      window.removeEventListener('maya_memory_settings_updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const drawerBtnCls = `w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer select-none active:scale-[0.98] ${
    isLight
      ? 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border-slate-200/80 shadow-xs'
      : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border-white/8 shadow-xs'
  }`;

  const activeDrawerBtnCls = `w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer select-none shadow-sm ${
    isLight
      ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold shadow-blue-100'
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold shadow-blue-900/30'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Backdrop overlay with glass blur */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-out Drawer content with Frosted Glass UI */}
      <aside
        id="maya-left-drawer-panel"
        className={`relative z-10 w-[84vw] max-w-[320px] h-full border-r flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-left duration-250 backdrop-blur-3xl transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border-white/90 text-slate-900'
            : 'bg-[#090e1a]/85 border-white/12 text-slate-100'
        }`}
      >
        {/* Top Header inside drawer: Maya avatar + name + subtitle + close */}
        <div
          className={`px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3.5 border-b flex items-center justify-between shrink-0 transition-colors ${
            isLight ? 'bg-slate-100/80 border-slate-200/80' : 'bg-[#0d1424]/85 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <MayaAvatar size="md" />
            <div className="flex flex-col">
              <h2 className={`text-base font-bold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {assistantName}
              </h2>
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                by The Hunter AI
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 overscroll-contain">
          {/* GROUP 1: HOME */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400/80'}`}>
              HOME
            </span>
            <div className="space-y-1.5">
              {/* Install App button */}
              {onOpenInstallModal && (
                <button
                  id="drawer-install-app-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/40 text-left hover:border-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 group mb-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                      <Download className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-emerald-900' : 'text-white'}`}>
                        <span>Install App</span>
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                          PWA
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-300/80 truncate">
                        Add to home screen
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              )}

              {/* Home */}
              <button
                type="button"
                onClick={() => {
                  onNavigateHome();
                  onClose();
                }}
                className={activeView === 'home' ? activeDrawerBtnCls : drawerBtnCls}
              >
                <Home className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Home</span>
              </button>

              {/* Memories */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('memories', 'Memories & Insights');
                }}
                className={`${drawerBtnCls} justify-between`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">Memories</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isProactiveActive && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      30s Q
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'
                  }`}>
                    {memoryCount}
                  </span>
                </div>
              </button>

              {/* Chat */}
              <button
                type="button"
                onClick={() => {
                  onNavigateChat();
                  onClose();
                }}
                className={activeView === 'chat' ? activeDrawerBtnCls : drawerBtnCls}
              >
                <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* GROUP 2: PRODUCTIVITY */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400/80'}`}>
              PRODUCTIVITY
            </span>
            <div className="space-y-1.5">
              {/* Documents */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('documents', 'Documents');
                }}
                className={drawerBtnCls}
              >
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Documents</span>
              </button>

              {/* Study / Whiteboard */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('study', 'Study / Whiteboard');
                }}
                className={drawerBtnCls}
              >
                <Edit3 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Study / Whiteboard</span>
              </button>
            </div>
          </div>

          {/* GROUP 3: SYSTEM */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400/80'}`}>
              SYSTEM
            </span>
            <div className="space-y-1.5">
              {/* Settings -> Opens Settings Screen */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className={drawerBtnCls}
              >
                <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Settings</span>
              </button>

              {/* Maya Rules */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('maya_rules', 'Maya Rules');
                }}
                className={drawerBtnCls}
              >
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Maya Rules</span>
              </button>
            </div>
          </div>

          {/* GROUP 4: OTHER */}
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400/80'}`}>
              OTHER
            </span>
            <div className="space-y-1.5">
              {/* Privacy Policy */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('privacy', 'Privacy Policy');
                }}
                className={drawerBtnCls}
              >
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Privacy Policy</span>
              </button>

              {/* About */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('about', 'About Maya');
                }}
                className={drawerBtnCls}
              >
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>About</span>
              </button>

              {/* Upgrade */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('upgrade', 'Upgrade & Energy');
                }}
                className={drawerBtnCls}
              >
                <Star className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Upgrade</span>
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDetailModal('notifications', 'Notifications');
                }}
                className={drawerBtnCls}
              >
                <Bell className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer inside drawer */}
        <div className={`px-5 py-3 border-t text-[11px] font-mono flex items-center justify-between shrink-0 ${
          isLight ? 'border-slate-200/80 bg-slate-100/80 text-slate-600' : 'border-white/5 bg-[#0a101d]/90 text-slate-500'
        }`}>
          <span>v4.16.0 · The Hunter AI</span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold text-[10px]">
            <Zap className="w-3 h-3 fill-amber-500" />
            <span>1 Energy</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
