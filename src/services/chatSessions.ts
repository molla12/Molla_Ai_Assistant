import { ChatSession } from '../types';

const STORAGE_KEY = 'molla_chat_sessions_v3';
const CURRENT_SESSION_KEY = 'molla_current_session_id_v3';

// Known mock/dummy titles to actively purge from any legacy storage
const DUMMY_TITLES = new Set([
  'Keyboard Voice Input Support',
  'Molla AI Prompts & Insights',
  'Subscription Update Inquiry',
  'Google AI Studio Features',
  'Connection Diagnostics',
  'Draft Escalation Email',
  'Billing Information Review',
  'Health & Wellness Query',
]);

const DUMMY_IDS = new Set([
  'session-1',
  'session-3',
  'session-4',
  'session-5',
  'session-6',
  'session-7',
  'session-8',
  'session-9',
]);

export const createDefaultSession = (): ChatSession => ({
  id: `session-${Date.now()}`,
  title: 'New Conversation',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

export function loadSavedSessions(): { sessions: ChatSession[]; currentId: string } {
  // Helper to filter out any mock/dummy session items
  const filterDummies = (list: any[]): ChatSession[] => {
    return list.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        !DUMMY_IDS.has(item.id) &&
        !DUMMY_TITLES.has(item.title)
    );
  };

  try {
    // Check current v3 storage first
    let raw = localStorage.getItem(STORAGE_KEY);
    // If not found in v3, inspect legacy v2 storage and clean it up
    if (!raw) {
      raw = localStorage.getItem('molla_chat_sessions_v2');
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const clean = filterDummies(parsed);
        if (clean.length > 0) {
          const savedCurrent =
            localStorage.getItem(CURRENT_SESSION_KEY) ||
            localStorage.getItem('molla_current_session_id_v2') ||
            clean[0].id;
          const currentId = clean.some((s) => s.id === savedCurrent)
            ? savedCurrent
            : clean[0].id;

          // Save cleaned sessions into v3 storage
          saveSessionsToStorage(clean, currentId);
          return { sessions: clean, currentId };
        }
      }
    }
  } catch (e) {
    console.warn('Error loading chat sessions:', e);
  }

  // If no previous clean sessions exist, start with ONE fresh conversation only
  const freshSession = createDefaultSession();
  saveSessionsToStorage([freshSession], freshSession.id);
  return { sessions: [freshSession], currentId: freshSession.id };
}

export function saveSessionsToStorage(sessions: ChatSession[], currentId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    localStorage.setItem(CURRENT_SESSION_KEY, currentId);
  } catch (e) {
    console.warn('Error saving chat sessions:', e);
  }
}
