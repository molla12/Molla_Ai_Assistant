import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatSession, TranscriptItem } from '../types';

const SESSIONS_STORAGE_KEY = 'molla_chat_sessions_v2';
const LEGACY_STORAGE_KEY = 'molla_chat_sessions_v1';

function generateSessionId(): string {
  return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

function createDefaultSession(): ChatSession {
  return {
    id: generateSessionId(),
    title: 'New Conversation',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitize any existing messages that might have duplicate stream-* keys from prior versions
          const seenIds = new Set<string>();
          return parsed.map((session: ChatSession) => ({
            ...session,
            messages: (session.messages || []).map((m, idx) => {
              let safeId = m.id;
              if (!safeId || safeId.startsWith('stream-') || seenIds.has(safeId)) {
                safeId = `msg_${m.sender || 'chat'}_${Date.now().toString(36)}_${idx}_${Math.random().toString(36).substring(2, 6)}`;
              }
              seenIds.add(safeId);
              return { ...m, id: safeId };
            }),
          }));
        }
      }
    } catch (e) {
      console.warn('[useChatSessions] Failed to load sessions:', e);
    }
    return [createDefaultSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || generateSessionId();
  });

  // Keep a ref to avoid stale state in callbacks
  const activeSessionIdRef = useRef(activeSessionId);
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Persist sessions whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('[useChatSessions] Failed to save sessions:', e);
    }
  }, [sessions]);

  // Current active session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createDefaultSession();

  const transcripts = activeSession.messages || [];

  // Finalize live turn on all messages in active session
  const finalizeTurn = useCallback(() => {
    const currentId = activeSessionIdRef.current;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentId) return s;
        let modified = false;
        const updatedMsgs = s.messages.map((m) => {
          if (m.isLiveTurn || m.isInterim) {
            modified = true;
            return { ...m, isLiveTurn: false, isInterim: false };
          }
          return m;
        });
        return modified ? { ...s, messages: updatedMsgs } : s;
      })
    );
  }, []);

  // Handle incoming transcripts (both Live API delta streams and full messages)
  const handleTranscript = useCallback((item: TranscriptItem) => {
    const currentId = activeSessionIdRef.current;

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== currentId) return session;

        const msgs = [...session.messages];

        // 1. If interim speech recognition update from user
        if (item.isInterim && msgs.length > 0 && msgs[msgs.length - 1].isInterim) {
          msgs[msgs.length - 1] = {
            ...msgs[msgs.length - 1],
            text: item.text,
            timestamp: Date.now(),
          };
          return { ...session, messages: msgs, updatedAt: Date.now() };
        }

        // 2. If same sender and active live turn -> WhatsApp-style sentence accumulation
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.sender === item.sender && lastMsg.isLiveTurn) {
            let updatedText = lastMsg.text;
            if (item.isDelta) {
              const prevTrimmed = lastMsg.text.trim();
              const newTrimmed = item.text.trim();

              if (!prevTrimmed) {
                updatedText = newTrimmed;
              } else if (/^[,.?!:;'\-]/.test(newTrimmed)) {
                updatedText = prevTrimmed + newTrimmed;
              } else {
                updatedText = `${prevTrimmed} ${newTrimmed}`;
              }
            } else {
              // Full replacement or updated interim
              updatedText = item.text;
            }

            msgs[msgs.length - 1] = {
              ...lastMsg,
              text: updatedText,
              timestamp: Date.now(),
              isInterim: item.isInterim,
            };

            return {
              ...session,
              messages: msgs,
              updatedAt: Date.now(),
            };
          }
        }

        // 3. New message / new turn bubble
        const safeId =
          item.id && !item.id.startsWith('stream-')
            ? item.id
            : `msg_${item.sender}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

        const newMsg: TranscriptItem = {
          ...item,
          id: safeId,
          isLiveTurn: item.isLiveTurn ?? false,
        };

        // Auto-derive session title from first user message
        let updatedTitle = session.title;
        if (
          (session.title === 'New Conversation' || !session.title) &&
          item.sender === 'user' &&
          item.text.trim()
        ) {
          const cleanSnippet = item.text.trim().slice(0, 36);
          updatedTitle = cleanSnippet + (item.text.length > 36 ? '...' : '');
        }

        return {
          ...session,
          title: updatedTitle,
          messages: [...msgs, newMsg],
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  // Add a completed message (e.g. from text chat)
  const addMessage = useCallback((msg: TranscriptItem) => {
    const currentId = activeSessionIdRef.current;
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== currentId) return session;

        let updatedTitle = session.title;
        if (
          (session.title === 'New Conversation' || !session.title) &&
          msg.sender === 'user' &&
          msg.text.trim()
        ) {
          const cleanSnippet = msg.text.trim().slice(0, 36);
          updatedTitle = cleanSnippet + (msg.text.length > 36 ? '...' : '');
        }

        const safeMsgId =
          msg.id && !msg.id.startsWith('stream-')
            ? msg.id
            : `msg_${msg.sender}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

        return {
          ...session,
          title: updatedTitle,
          messages: [...session.messages, { ...msg, id: safeMsgId, isLiveTurn: false }],
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  // Switch active session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Start a new chat session
  const createNewSession = useCallback(() => {
    const newSession = createDefaultSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Delete a specific session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createDefaultSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionIdRef.current === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  }, []);

  // Clear all conversation sessions completely
  const clearAllSessions = useCallback(() => {
    const fresh = createDefaultSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
    } catch {}
  }, []);

  // Clear messages inside active session
  const clearActiveMessages = useCallback(() => {
    const currentId = activeSessionIdRef.current;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentId) {
          return { ...s, messages: [], updatedAt: Date.now() };
        }
        return s;
      })
    );
  }, []);

  return {
    sessions,
    activeSessionId,
    activeSession,
    transcripts,
    handleTranscript,
    finalizeTurn,
    addMessage,
    selectSession,
    createNewSession,
    deleteSession,
    clearAllSessions,
    clearActiveMessages,
  };
}
