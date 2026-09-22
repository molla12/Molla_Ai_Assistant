import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';
import {
  X,
  Plus,
  Share2,
  Pin,
  BookOpen,
  Pencil,
  Trash2,
  Check,
  MessageSquare,
  Sparkles,
  MoreVertical,
} from 'lucide-react';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onPinSession: (sessionId: string) => void;
  onNotebookSession: (sessionId: string) => void;
  onShareSession: (sessionId: string) => void;
  onClearChat?: () => void;
  effectiveTheme?: 'light' | 'dark';
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onPinSession,
  onNotebookSession,
  onShareSession,
  onClearChat,
  effectiveTheme = 'dark',
}) => {
  const isLight = effectiveTheme === 'light';
  const [activeActionSessionId, setActiveActionSessionId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const longPressTimerRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  useEffect(() => {
    if (!isOpen) {
      setActiveActionSessionId(null);
      setRenamingSessionId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (sessionId: string) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setActiveActionSessionId(sessionId);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {}
      }
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSessionClick = (session: ChatSession) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onSelectSession(session.id);
    onClose();
  };

  const activeSession = sessions.find((s) => s.id === activeActionSessionId);

  const startRename = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setRenameValue(session.title);
    setActiveActionSessionId(null);
  };

  const handleSaveRename = () => {
    if (renamingSessionId && renameValue.trim()) {
      onRenameSession(renamingSessionId, renameValue.trim());
      showToast('Renamed successfully');
    }
    setRenamingSessionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed backdrop */}
      <div
        id="history-drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Main Drawer Container */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl border-r z-10 animate-in slide-in-from-left duration-300 transition-colors backdrop-blur-2xl ${
          isLight
            ? 'bg-slate-50/95 text-slate-800 border-slate-200 shadow-[20px_0_60px_rgba(15,23,42,0.12)]'
            : 'bg-[#111622]/95 text-slate-100 border-white/10 shadow-2xl'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`p-4 flex items-center justify-between border-b transition-colors ${
            isLight
              ? 'bg-white/80 border-slate-200/80'
              : 'bg-[#141c2c]/80 border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                isLight
                  ? 'bg-pink-100 border-pink-300 text-pink-600'
                  : 'bg-pink-500/20 border-pink-500/40 text-pink-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`font-semibold text-base ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Chat History
              </h2>
              <span
                className={`text-[11px] ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Recent Conversations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="new-chat-btn-header"
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                isLight
                  ? 'bg-pink-50 hover:bg-pink-100 border-pink-300 text-pink-700'
                  : 'bg-pink-600/30 hover:bg-pink-600/50 border-pink-500/40 text-pink-200'
              }`}
              title="Start New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              id="close-history-drawer-btn"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section title */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Recent
          </span>
          <span
            className={`text-[10px] font-mono ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Long press for options
          </span>
        </div>

        {/* Conversation List */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10"
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
        >
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare
                className={`w-8 h-8 mx-auto mb-2 opacity-50 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                No chat history yet
              </p>
              <p
                className={`text-xs mt-1 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Tap &ldquo;Start New Chat&rdquo; below to begin.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              const isEditing = session.id === renamingSessionId;

            if (isEditing) {
              return (
                <div
                  key={session.id}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
                    isLight
                      ? 'bg-white border-pink-400 shadow-sm'
                      : 'bg-white/10 border-pink-500/40'
                  }`}
                >
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setRenamingSessionId(null);
                    }}
                    autoFocus
                    className={`flex-1 bg-transparent text-sm px-2 py-1 outline-none border-b border-pink-400 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  />
                  <button
                    onClick={handleSaveRename}
                    className="p-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRenamingSessionId(null)}
                    className={`p-1.5 rounded-lg ${
                      isLight
                        ? 'hover:bg-slate-200 text-slate-600'
                        : 'hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={session.id}
                onTouchStart={() => handleTouchStart(session.id)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(session.id)}
                onMouseUp={handleTouchEnd}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveActionSessionId(session.id);
                }}
                onClick={() => handleSessionClick(session)}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all select-none ${
                  isSelected
                    ? isLight
                      ? 'bg-white text-slate-950 font-semibold shadow-sm border border-slate-200/90'
                      : 'bg-slate-300 text-slate-900 font-semibold shadow-sm'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-950 font-normal'
                    : 'text-slate-200 hover:bg-white/5 font-normal'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isSelected
                        ? isLight
                          ? 'text-pink-600'
                          : 'text-slate-800'
                        : isLight
                        ? 'text-slate-400 group-hover:text-slate-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm truncate pr-2">
                    {session.title}
                  </span>
                  {session.isPinned && (
                    <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0 rotate-45" />
                  )}
                  {session.isNotebook && (
                    <BookOpen
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isLight ? 'text-teal-600' : 'text-cyan-400'
                      }`}
                    />
                  )}
                </div>

                {/* 3-dots trigger for desktop or quick action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveActionSessionId(session.id);
                  }}
                  className={`p-1.5 rounded-lg transition-opacity shrink-0 ${
                    isSelected
                      ? isLight
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-700 hover:bg-black/10'
                      : isLight
                      ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-70 group-hover:opacity-100'
                      : 'text-slate-400 hover:text-white hover:bg-white/10 opacity-70 group-hover:opacity-100'
                  }`}
                  title="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          }))}
        </div>

        {/* Footer Buttons: Start New Chat & Clear Chat Messages */}
        <div
          className={`p-4 border-t space-y-2 shrink-0 transition-colors ${
            isLight
              ? 'bg-slate-100/90 border-slate-200'
              : 'bg-[#0d121c] border-white/10'
          }`}
        >
          <button
            id="start-new-chat-bottom-btn"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Chat</span>
          </button>

          {onClearChat && (
            <button
              id="clear-chat-bottom-btn"
              type="button"
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className={`w-full py-2.5 rounded-2xl border text-xs font-medium flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat Messages</span>
            </button>
          )}
        </div>

        {/* Long-Press Action Bottom Sheet */}
        {activeSession && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setActiveActionSessionId(null)}
            />

            <div
              className={`relative w-full rounded-t-3xl border-t p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 z-10 transition-colors ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#1b2230] border-white/15 text-slate-100'
              }`}
            >
              {/* Sheet grab handle bar */}
              <div
                className={`w-12 h-1.5 rounded-full mx-auto mb-4 ${
                  isLight ? 'bg-slate-300' : 'bg-slate-500/50'
                }`}
              />

              {/* Title preview */}
              <div className="mb-4 px-1">
                <p
                  className={`text-xs ${
                    isLight ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  Selected conversation:
                </p>
                <p
                  className={`text-sm font-semibold truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {activeSession.title}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-1">
                {/* 1. Share conversation */}
                <button
                  type="button"
                  onClick={() => {
                    onShareSession(activeSession.id);
                    setActiveActionSessionId(null);
                    showToast('Chat link copied to clipboard');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors text-left ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <Share2
                    className={`w-5 h-5 shrink-0 ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-sm font-medium">Share conversation</span>
                </button>

                {/* 2. Pin */}
                <button
                  type="button"
                  onClick={() => {
                    onPinSession(activeSession.id);
                    setActiveActionSessionId(null);
                    showToast(activeSession.isPinned ? 'Unpinned' : 'Pinned');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors text-left ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <Pin
                    className={`w-5 h-5 shrink-0 ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {activeSession.isPinned ? 'Unpin' : 'Pin'}
                  </span>
                </button>

                {/* 3. Add to notebook */}
                <button
                  type="button"
                  onClick={() => {
                    onNotebookSession(activeSession.id);
                    setActiveActionSessionId(null);
                    showToast(
                      activeSession.isNotebook
                        ? 'Removed from notebook'
                        : 'Added to notebook'
                    );
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors text-left ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <BookOpen
                    className={`w-5 h-5 shrink-0 ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {activeSession.isNotebook
                      ? 'Remove from notebook'
                      : 'Add to notebook'}
                  </span>
                </button>

                {/* 4. Rename */}
                <button
                  type="button"
                  onClick={() => startRename(activeSession)}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors text-left ${
                    isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <Pencil
                    className={`w-5 h-5 shrink-0 ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-sm font-medium">Rename</span>
                </button>

                {/* 5. Delete */}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSession(activeSession.id);
                    setActiveActionSessionId(null);
                    showToast('Conversation deleted');
                  }}
                  className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors text-left ${
                    isLight
                      ? 'hover:bg-rose-50 text-rose-600'
                      : 'hover:bg-rose-500/15 text-rose-400'
                  }`}
                >
                  <Trash2 className="w-5 h-5 text-rose-500 shrink-0" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Small Toast notification */}
        {toastMessage && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-pink-500/40 px-4 py-2 rounded-full text-xs text-white shadow-xl animate-in fade-in duration-150">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
