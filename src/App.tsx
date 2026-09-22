import { useState, useRef, useEffect, useCallback } from 'react';
import { ConnectionState, TranscriptItem, VoiceOption, LanguageCode, AtmosphereTheme } from './types';
import { ATMOSPHERE_THEMES } from './constants/auras';
import { LiveSession } from './services/liveSession';
import { AuraBackground } from './components/AuraBackground';
import { HomeVoiceScreen } from './components/HomeVoiceScreen';
import { ChatScreenView } from './components/ChatScreenView';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { OptionsDrawer } from './components/OptionsDrawer';
import { LiveVisionModal } from './components/LiveVisionModal';
import { InstallAppModal } from './components/InstallAppModal';
import { ThemeChooserModal, ThemeMode } from './components/ThemeChooserModal';
import { NewsModal } from './components/NewsModal';
import { EdgeScreenLighting } from './components/EdgeScreenLighting';
import { MayaLeftDrawer } from './components/maya/MayaLeftDrawer';
import { MayaSettingsView } from './components/maya/MayaSettingsView';
import { MayaPersonalView } from './components/maya/MayaPersonalView';
import { MayaAssistantDetailView } from './components/maya/MayaAssistantDetailView';
import { MayaSkillsDetailView } from './components/maya/MayaSkillsDetailView';
import { MayaSubAgentsDetailView } from './components/maya/MayaSubAgentsDetailView';
import { MayaEmailDetailView } from './components/maya/MayaEmailDetailView';
import { MayaWhatsAppDetailView } from './components/maya/MayaWhatsAppDetailView';
import { MayaSocialDetailView } from './components/maya/MayaSocialDetailView';
import { MayaConnectorsDetailView } from './components/maya/MayaConnectorsDetailView';
import { MayaBackupDetailView } from './components/maya/MayaBackupDetailView';
import { MayaOptionalDetailView } from './components/maya/MayaOptionalDetailView';
import { MayaThemeDetailView } from './components/maya/MayaThemeDetailView';
import { MayaBehaviourDetailView } from './components/maya/MayaBehaviourDetailView';
import { MayaTypingDetailView } from './components/maya/MayaTypingDetailView';
import { MayaAppearanceDetailView } from './components/maya/MayaAppearanceDetailView';
import { MayaVoiceGuardianDetailView } from './components/maya/MayaVoiceGuardianDetailView';
import { MayaEmergencySosDetailView } from './components/maya/MayaEmergencySosDetailView';
import { MayaTouchGuardDetailView } from './components/maya/MayaTouchGuardDetailView';
import { MayaScreenLockDetailView } from './components/maya/MayaScreenLockDetailView';
import { MayaPatternPinDetailView } from './components/maya/MayaPatternPinDetailView';
import { MayaEventTriggersDetailView } from './components/maya/MayaEventTriggersDetailView';
import { MayaWhatsAppAutoReplyDetailView } from './components/maya/MayaWhatsAppAutoReplyDetailView';
import { MayaPermissionsDetailView } from './components/maya/MayaPermissionsDetailView';
import { MayaMemoriesDetailView } from './components/maya/MayaMemoriesDetailView';
import { MayaMarketsDetailView } from './components/maya/MayaMarketsDetailView';
import { MayaRulesDetailView } from './components/maya/MayaRulesDetailView';
import { MayaWebsiteCodingDetailView } from './components/maya/MayaWebsiteCodingDetailView';
import { MayaWhiteboardDetailView } from './components/maya/MayaWhiteboardDetailView';
import { MayaDetailModal } from './components/maya/MayaDetailModals';
import { GeminiApiKeyModal } from './components/GeminiApiKeyModal';
import { getStoredGeminiApiKey, loadMemories, loadAssistantConfig } from './components/maya/mayaStorage';
import { useProactiveMemoryQuestions, ProactiveQuestionEvent } from './hooks/useProactiveMemoryQuestions';
import { voicePlayer } from './services/voicePlayer';
import { loadSavedSessions, saveSessionsToStorage } from './services/chatSessions';
import { AlertCircle, X } from 'lucide-react';

function resolveLanguageCode(str?: string): LanguageCode {
  if (!str) return 'bn';
  const s = str.toLowerCase();
  if (s.includes('bengali') || s.includes('বাংলা') || s === 'bn') return 'bn';
  if (s.includes('hindi') || s.includes('हिन्दी') || s === 'hi') return 'hi';
  if (s.includes('urdu') || s.includes('اردو') || s === 'ur') return 'ur';
  if (s.includes('tamil') || s === 'ta') return 'ta';
  if (s.includes('telugu') || s === 'te') return 'te';
  if (s.includes('marathi') || s === 'mr') return 'mr';
  if (s.includes('gujarati') || s === 'gu') return 'gu';
  if (s.includes('kannada') || s === 'kn') return 'kn';
  if (s.includes('malayalam') || s === 'ml') return 'ml';
  if (s.includes('punjabi') || s === 'pa') return 'pa';
  if (s.includes('odia') || s === 'or') return 'or';
  if (s.includes('assamese') || s === 'as') return 'as';
  if (s.includes('spanish') || s === 'es') return 'es';
  if (s.includes('arabic') || s === 'ar') return 'ar';
  if (s.includes('french') || s === 'fr') return 'fr';
  if (s.includes('german') || s === 'de') return 'de';
  if (s.includes('japanese') || s === 'ja') return 'ja';
  if (s.includes('russian') || s === 'ru') return 'ru';
  if (s.includes('indian english') || s === 'en-in') return 'en-in';
  if (s.includes('english') || s === 'en') return 'en';
  return str.trim();
}

export default function App() {
  // Navigation View State: 'home' (Image 1) or 'chat' (Image 2)
  const [activeView, setActiveView] = useState<'home' | 'chat'>('home');

  // Drawers & Modals state
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isGeminiKeyModalOpen, setIsGeminiKeyModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(() => Boolean(getStoredGeminiApiKey()));

  // Maya Left-Side Slide Drawer & Views State
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isMayaSettingsOpen, setIsMayaSettingsOpen] = useState(false);
  const [isMayaPersonalOpen, setIsMayaPersonalOpen] = useState(false);
  const [activeMayaDetail, setActiveMayaDetail] = useState<{ type: string; title: string } | null>(null);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('molla_theme_mode') as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  // Global listener for theme changes across modals, views, and settings
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const mode = customEvent.detail?.mode;
      if (mode && (mode === 'light' || mode === 'dark' || mode === 'system')) {
        setThemeMode(mode);
      }
    };
    window.addEventListener('molla_theme_changed', handleThemeEvent);
    return () => window.removeEventListener('molla_theme_changed', handleThemeEvent);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('molla_theme_mode', themeMode);
    } catch {}
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    if (document.body) {
      document.body.dataset.theme = effectiveTheme;
      if (effectiveTheme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
    }
  }, [themeMode, effectiveTheme]);

  // Sync stored Gemini API Key with server and listen for modal open events
  useEffect(() => {
    const stored = getStoredGeminiApiKey();
    if (stored) {
      setHasGeminiKey(true);
      fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: stored }),
      }).catch(() => {});
    } else {
      fetch('/api/config/gemini-key')
        .then((r) => r.json())
        .then((data) => {
          if (data.hasKey) {
            setHasGeminiKey(true);
          }
        })
        .catch(() => {});
    }

    const handleOpenModal = () => setIsGeminiKeyModalOpen(true);
    const handleKeyUpdated = (e: any) => {
      setHasGeminiKey(Boolean(e.detail?.apiKey || getStoredGeminiApiKey()));
    };

    window.addEventListener('open-gemini-key-modal', handleOpenModal);
    window.addEventListener('gemini_api_key_updated', handleKeyUpdated);
    return () => {
      window.removeEventListener('open-gemini-key-modal', handleOpenModal);
      window.removeEventListener('gemini_api_key_updated', handleKeyUpdated);
    };
  }, []);

  // Master Power State: Center orb is strictly gated by power button
  const [isPowerOn, setIsPowerOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('molla_power_on');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Comprehensive Touch Event and Scroll Lock to prevent any unintended scrolling of viewport, status bar, or navigation areas
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;

      let target = e.target as HTMLElement | null;
      let scrollableEl: HTMLElement | null = null;

      while (target && target !== document.body && target !== document.documentElement) {
        const style = window.getComputedStyle(target);
        const overflowY = style.overflowY;
        const isScrollable =
          (overflowY === 'auto' || overflowY === 'scroll') &&
          target.scrollHeight > target.clientHeight;

        if (isScrollable) {
          scrollableEl = target;
          break;
        }
        target = target.parentElement;
      }

      if (!scrollableEl) {
        // If not inside an active scrollable container, strictly prevent any default scroll / rubber-banding
        if (e.cancelable) {
          e.preventDefault();
        }
        return;
      }

      // If inside a scrollable container, prevent overscroll / rubber-banding at boundaries
      const atTop = scrollableEl.scrollTop <= 0;
      const atBottom =
        scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 1;

      // Pulling down at top -> would trigger body / status bar bounce
      if (deltaY > 0 && atTop) {
        if (e.cancelable) e.preventDefault();
      }
      // Pulling up at bottom -> would trigger body / nav bar bounce
      else if (deltaY < 0 && atBottom) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleGesture = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };

    // Ensure document and window scroll positions stay strictly locked to (0, 0)
    const handleWindowScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const handleTogglePower = useCallback(() => {
    setIsPowerOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('molla_power_on', String(next));
      } catch {}

      if (!next) {
        if (voicePlayer.getState().isPlaying) {
          voicePlayer.stop();
        }
        liveSessionRef.current?.disconnect();
        setState('disconnected');
        setLiveSubtitleText('');
        setLiveSubtitleSpeaker(null);
      }
      return next;
    });
  }, []);

  // Settings
  const [voice, setVoice] = useState<VoiceOption>('Aoede');
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('user_selected_language');
      if (saved) return resolveLanguageCode(saved);
      const cfg = loadAssistantConfig();
      if (cfg?.language) return resolveLanguageCode(cfg.language);
    } catch {}
    return 'bn';
  });
  const [currentTheme, setCurrentTheme] = useState<AtmosphereTheme>('neon-pink');

  const handleSelectLanguage = useCallback((newLang: LanguageCode) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('user_selected_language', newLang);
    } catch {}
  }, []);

  useEffect(() => {
    const handleLangEvent = (e: any) => {
      const l = e.detail?.language || e.detail?.label;
      if (l) {
        setLanguage(resolveLanguageCode(l));
      }
    };
    const handleAssistantConfigUpdate = (e: any) => {
      const cfg = e.detail || loadAssistantConfig();
      if (cfg?.language) {
        setLanguage(resolveLanguageCode(cfg.language));
      }
    };
    window.addEventListener('molla_language_changed', handleLangEvent);
    window.addEventListener('maya_assistant_config_updated', handleAssistantConfigUpdate);
    return () => {
      window.removeEventListener('molla_language_changed', handleLangEvent);
      window.removeEventListener('maya_assistant_config_updated', handleAssistantConfigUpdate);
    };
  }, []);

  // Rainbow Edge Lighting toggle (active by default, can be deactivated via options)
  const [isEdgeLightingEnabled, setIsEdgeLightingEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('molla_edge_lighting_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleEdgeLighting = useCallback(() => {
    setIsEdgeLightingEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('molla_edge_lighting_enabled', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Connection & audio state
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isVoiceTyping, setIsVoiceTyping] = useState<boolean>(false);

  // Live subtitles for Home screen
  const [liveSubtitleText, setLiveSubtitleText] = useState<string>('');
  const [liveSubtitleSpeaker, setLiveSubtitleSpeaker] = useState<'molla' | 'user' | null>(null);

  // Molla response states (with animated bouncing photo analysis indicator)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isMollaResponding, setIsMollaResponding] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  // Multi-session chat history
  const [sessions, setSessions] = useState(() => loadSavedSessions().sessions);
  const [currentSessionId, setCurrentSessionId] = useState(() => loadSavedSessions().currentId);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>(() => {
    const init = loadSavedSessions();
    const curr = init.sessions.find((s) => s.id === init.currentId);
    return curr ? curr.messages : [];
  });

  const liveSessionRef = useRef<LiveSession | null>(null);
  const currentAura = ATMOSPHERE_THEMES[currentTheme] || ATMOSPHERE_THEMES['neon-pink'];

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    saveSessionsToStorage(sessions, currentSessionId);
  }, [sessions, currentSessionId]);

  // Sync transcripts into current session
  useEffect(() => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: transcripts,
              updatedAt: Date.now(),
              title:
                s.title === 'New Conversation' && transcripts.length > 0
                  ? (transcripts[0].text || 'New Conversation').slice(0, 30)
                  : s.title,
            }
          : s
      )
    );
  }, [transcripts, currentSessionId]);

  // Track voice player states
  useEffect(() => {
    const unsubscribe = voicePlayer.subscribe((playback) => {
      setIsVoicePlaying(playback.isPlaying);
      if (playback.isPlaying && liveSessionRef.current) {
        liveSessionRef.current.pauseForPlayback(true);
      }
    });

    const handleQuotaExceeded = () => {
      setErrorMessage(
        'Voice quota limit reached for now. Please wait a moment or send a text message.'
      );
    };

    window.addEventListener('voice-quota-exceeded', handleQuotaExceeded);

    return () => {
      unsubscribe();
      window.removeEventListener('voice-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Handle 30-second proactive questions generated from stored memories
  const handlePostMemoryQuestion = useCallback((event: ProactiveQuestionEvent) => {
    const mollaMsgId = `molla_mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const mollaMsg: TranscriptItem = {
      id: mollaMsgId,
      sender: 'molla',
      text: event.text,
      timestamp: Date.now(),
      isVoice: true,
    };
    setTranscripts((prev) => [...prev, mollaMsg]);
    setLiveSubtitleText(event.text);
    setLiveSubtitleSpeaker('molla');
    setTimeout(() => {
      setLiveSubtitleText('');
      setLiveSubtitleSpeaker(null);
    }, 8000);
  }, []);

  const proactiveQuestions = useProactiveMemoryQuestions({
    isPowerOn,
    isCallActive: state !== 'disconnected',
    currentVoice: voice,
    currentLang: language,
    onPostQuestion: handlePostMemoryQuestion,
  });

  // Update transcripts from live streaming
  const handleTranscript = useCallback((item: TranscriptItem) => {
    if (item.sender === 'molla') {
      setIsAnalyzingImage(false);
      setIsMollaResponding(false);
      setPendingImageUrl(null);
    }

    if (item.text) {
      setLiveSubtitleText(item.text);
      setLiveSubtitleSpeaker(item.sender as any);
    }

    setTranscripts((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === item.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const updatedText = item.isDelta
          ? (existing.text || '') + (item.text || '')
          : item.text !== undefined
          ? item.text
          : existing.text;

        updated[existingIndex] = {
          ...existing,
          ...item,
          text: updatedText,
        };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const finalizeTurn = useCallback(() => {
    setIsAnalyzingImage(false);
    setIsMollaResponding(false);
    setPendingImageUrl(null);
  }, []);

  // Initialize LiveSession instance
  useEffect(() => {
    const session = new LiveSession({
      onStateChange: (newState) => {
        setState(newState);
      },
      onError: (err) => {
        setErrorMessage(err);
        setTimeout(() => {
          setErrorMessage((prev) => (prev === err ? null : prev));
        }, 5000);
      },
      onToolCall: () => {},
      onAuraChange: () => {},
      onTranscript: (item) => {
        handleTranscript(item);
      },
      onTurnComplete: () => {
        finalizeTurn();
      },
    });
    liveSessionRef.current = session;

    return () => {
      session.disconnect();
    };
  }, [handleTranscript, finalizeTurn]);

  // Frequency and Volume getters for visualizer
  const getFrequencyData = useCallback(() => {
    return liveSessionRef.current?.getFrequencyData() || new Uint8Array(32);
  }, []);

  const getVolumeRMS = useCallback(() => {
    return liveSessionRef.current?.getVolumeRMS() || 0;
  }, []);

  // Unified Tap-to-Talk voice call handler with seamless continuous conversation
  const handleToggleVoiceCall = useCallback(async () => {
    if (!isPowerOn) {
      setErrorMessage('Power is OFF. Please turn on the power button below to activate Molla.');
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    setErrorMessage(null);

    if (voicePlayer.getState().isPlaying) {
      voicePlayer.stop();
    }

    const session = liveSessionRef.current;
    if (!session) return;

    // When Molla is currently speaking, clicking TAP TO TALK immediately stops her speech
    if (state === 'speaking') {
      console.log('[App] TAP TO TALK clicked while Molla is speaking -> stopping speech immediately');
      voicePlayer.stop();
      session.interrupt();
      return;
    }

    if (state === 'paused') {
      session.pauseForPlayback(false);
      return;
    }

    if (state === 'listening') {
      session.pauseForPlayback(true);
      return;
    }

    if (state === 'disconnected') {
      const activeKey = getStoredGeminiApiKey();
      if (!hasGeminiKey && !activeKey) {
        setIsGeminiKeyModalOpen(true);
        setErrorMessage('Please add your Gemini API Key to enable real-time natural voice conversations.');
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      try {
        const startPaused = isTyping || isVoiceTyping;
        await session.start(voice, language, startPaused);
      } catch (err: any) {
        console.error('[App] Start call error:', err);
        setErrorMessage(err?.message || 'Please allow microphone permissions and try again.');
      }
    } else {
      session.disconnect();
    }
  }, [isPowerOn, state, voice, language, isTyping, isVoiceTyping, hasGeminiKey]);

  // User explicitly clicks chat icon: Pause mic and switch to Chat view
  const handleOpenChat = useCallback(() => {
    // Only clicking the chat icon mutes the microphone
    liveSessionRef.current?.pauseForPlayback(true);
    setActiveView('chat');
  }, []);

  // Dedicated callback to completely disconnect and shut off live voice call
  const handleStopVoiceCall = useCallback(() => {
    if (voicePlayer.getState().isPlaying) {
      voicePlayer.stop();
    }
    const session = liveSessionRef.current;
    if (session) {
      session.disconnect();
    }
    setState('disconnected');
    setLiveSubtitleText('');
    setLiveSubtitleSpeaker(null);
  }, []);

  // User clicks close in chat view: return to Home
  const handleCloseChat = useCallback(() => {
    setActiveView('home');
    if (state === 'paused' && isPowerOn) {
      liveSessionRef.current?.pauseForPlayback(false);
    }
  }, [state, isPowerOn]);

  // Cache generated audioUrl on message
  const handleUpdateAudioUrl = useCallback((messageId: string, audioUrl: string) => {
    setTranscripts((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, audioUrl } : msg))
    );
  }, []);

  // Send message from bottom text input bar or visual tools
  const handleSendMessage = useCallback(
    async (text: string, image?: string) => {
      const userMsgId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const userMsg: TranscriptItem = {
        id: userMsgId,
        sender: 'user',
        text,
        imageUrl: image,
        timestamp: Date.now(),
        isVoice: false,
      };

      setTranscripts((prev) => [...prev, userMsg]);

      const hasPhoto = Boolean(image);
      if (hasPhoto) {
        setIsAnalyzingImage(true);
        setPendingImageUrl(image || null);
      }
      setIsMollaResponding(true);

      // If live voice session is active, route through WebSocket
      if (liveSessionRef.current && state !== 'disconnected') {
        if (image) {
          liveSessionRef.current.sendVisualInput(image, 'image/jpeg', text);
        } else {
          liveSessionRef.current.sendTextMessage(text);
        }
        setTimeout(() => {
          setIsAnalyzingImage(false);
          setIsMollaResponding(false);
          setPendingImageUrl(null);
        }, 12000);
        return;
      }

      // If disconnected, call backend /api/chat and speak answer
      try {
        const asstCfg = loadAssistantConfig();
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            image,
            lang: asstCfg.language || language || 'bn',
            memories: loadMemories(),
            girlfriendMode: asstCfg.girlfriendMode,
            petName: asstCfg.petName,
            romanticStyle: asstCfg.romanticStyle,
          }),
        });

        const contentType = res.headers.get('content-type') || '';
        let data: any = null;

        if (contentType.includes('application/json')) {
          data = await res.json().catch(() => null);
        } else {
          await res.text().catch(() => '');
        }

        if (res.ok && data && data.reply) {
          const mollaMsgId = `molla_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const mollaMsg: TranscriptItem = {
            id: mollaMsgId,
            sender: 'molla',
            text: data.reply,
            timestamp: Date.now(),
            isVoice: true,
          };
          setTranscripts((prev) => [...prev, mollaMsg]);

          voicePlayer.togglePlay(mollaMsgId, data.reply, undefined, voice).then((url) => {
            if (url) {
              handleUpdateAudioUrl(mollaMsgId, url);
            }
          });
        } else {
          const fallbackReply = 'I understand what you said. Let us discuss this further!';
          const mollaMsgId = `molla_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          setTranscripts((prev) => [
            ...prev,
            {
              id: mollaMsgId,
              sender: 'molla',
              text: fallbackReply,
              timestamp: Date.now(),
              isVoice: false,
            },
          ]);
        }
      } catch (err) {
        console.warn('[App] Chat send notice:', err);
        const mollaMsgId = `molla_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        setTranscripts((prev) => [
          ...prev,
          {
            id: mollaMsgId,
            sender: 'molla',
            text: 'The server is currently busy. Please try again or tap the call button below to talk directly with Molla!',
            timestamp: Date.now(),
            isVoice: false,
          },
        ]);
      } finally {
        setIsAnalyzingImage(false);
        setIsMollaResponding(false);
        setPendingImageUrl(null);
      }
    },
    [state, language, voice, handleUpdateAudioUrl]
  );

  const handleSendVisualInput = useCallback(
    (imageDataUrl: string, promptText?: string) => {
      const prompt =
        promptText && promptText.trim().length > 0
          ? promptText.trim()
          : 'Please analyze this photo and describe what you see!';
      handleSendMessage(prompt, imageDataUrl);
    },
    [handleSendMessage]
  );

  const handleSendVideoFrame = useCallback(
    (imageDataUrl: string) => {
      if (liveSessionRef.current && state !== 'disconnected') {
        liveSessionRef.current.sendVideoFrame(imageDataUrl, 'image/jpeg');
      }
    },
    [state]
  );

  const handleClearChat = useCallback(() => {
    voicePlayer.stop();
    setTranscripts([]);
    setIsAnalyzingImage(false);
    setIsMollaResponding(false);
    setPendingImageUrl(null);
  }, []);

  const handleTypingChange = useCallback((typing: boolean) => {
    setIsTyping(typing);
    if (typing) {
      if (voicePlayer.getState().isPlaying) {
        voicePlayer.stop();
      }
      liveSessionRef.current?.pauseForPlayback(true);
    }
  }, []);

  const handleVoiceTypingChange = useCallback((voiceTyping: boolean) => {
    setIsVoiceTyping(voiceTyping);
    if (voiceTyping) {
      if (voicePlayer.getState().isPlaying) {
        voicePlayer.stop();
      }
      liveSessionRef.current?.pauseForPlayback(true);
    }
  }, []);

  const handlePauseLiveSession = useCallback((paused: boolean) => {
    liveSessionRef.current?.pauseForPlayback(paused);
  }, []);

  // History session handlers
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        setCurrentSessionId(sessionId);
        setTranscripts(target.messages || []);
      }
    },
    [sessions]
  );

  const handleNewChat = useCallback(() => {
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setTranscripts([]);
    setActiveView('chat');
  }, []);

  const handleRenameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  }, []);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          const fallback = {
            id: `session-${Date.now()}`,
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [],
          };
          setCurrentSessionId(fallback.id);
          setTranscripts([]);
          return [fallback];
        }
        if (sessionId === currentSessionId) {
          setCurrentSessionId(filtered[0].id);
          setTranscripts(filtered[0].messages || []);
        }
        return filtered;
      });
    },
    [currentSessionId]
  );

  const handlePinSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s))
    );
  }, []);

  const handleNotebookSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isNotebook: !s.isNotebook } : s))
    );
  }, []);

  const handleShareSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      const text = (target?.messages || [])
        .map((m) => `${m.sender === 'user' ? 'You' : 'Molla'}: ${m.text}`)
        .join('\n');
      navigator.clipboard.writeText(text || window.location.href);
    },
    [sessions]
  );

  const handleSelectPrompt = useCallback(
    (prompt: string) => {
      setActiveView('chat');
      handleSendMessage(prompt);
    },
    [handleSendMessage]
  );

  const handleDiscussNews = useCallback(
    (newsTitle: string, newsSummary: string, newsSource?: string) => {
      if (voicePlayer.getState().isPlaying) {
        voicePlayer.stop();
      }
      setIsNewsModalOpen(false);
      setActiveView('chat');
      const prompt = `Please provide a detailed explanation of this news story:
Headline: "${newsTitle}"
Source: ${newsSource || 'Google News'}
Summary: ${newsSummary}

Explain clearly:
1. What happened in this event
2. Key background context and important facts
3. Why this matters and potential impacts.
Please break it down in Molla's lively voice so I can read it and hear you speak it aloud!`;
      handleSendMessage(prompt);
    },
    [handleSendMessage]
  );

  return (
    <div
      id="app-root-container"
      className={`fixed inset-0 w-full h-full flex flex-col justify-between overflow-hidden select-none touch-none overscroll-none transition-colors duration-200 ${
        effectiveTheme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#07090e] text-slate-100'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        WebkitOverflowScrolling: 'auto',
      }}
    >
      {/* Dynamic Atmosphere Background */}
      <AuraBackground aura={currentAura} state={state} effectiveTheme={effectiveTheme} />

      {/* Mobile Edge Screen Rotating Rainbow Border (Active when power is ON and enabled) */}
      <EdgeScreenLighting isPowerOn={isPowerOn && isEdgeLightingEnabled} />

      {/* Error alert toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in duration-200">
          <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/90 backdrop-blur-xl text-white shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium text-rose-200 truncate">
                {errorMessage}
              </p>
            </div>
            <button
              id="dismiss-error-btn"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-rose-300 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Switcher: Home Voice Screen (Image 1) vs Chat Screen (Image 2) */}
      {activeView === 'home' ? (
        <HomeVoiceScreen
          state={state}
          currentAura={currentAura}
          chatCount={transcripts.length}
          liveSubtitleText={liveSubtitleText}
          liveSubtitleSpeaker={liveSubtitleSpeaker}
          getFrequencyData={getFrequencyData}
          getVolumeRMS={getVolumeRMS}
          onOrbClick={handleToggleVoiceCall}
          onToggleCall={handleToggleVoiceCall}
          onOpenChat={handleOpenChat}
          onOpenOptions={() => setIsOptionsDrawerOpen(true)}
          onOpenNews={() => setIsNewsModalOpen(true)}
          onOpenLeftDrawer={() => setIsLeftDrawerOpen(true)}
          onOpenMemories={() => setActiveMayaDetail({ type: 'memories', title: 'Memories & Insights' })}
          onOpenKeyModal={() => setIsGeminiKeyModalOpen(true)}
          hasApiKey={hasGeminiKey}
          onSelectPrompt={handleSelectPrompt}
          isPowerOn={isPowerOn}
          onTogglePower={handleTogglePower}
          effectiveTheme={effectiveTheme}
        />
      ) : (
        <ChatScreenView
          state={state}
          currentAura={currentAura}
          transcripts={transcripts}
          voice={voice}
          language={language}
          isVoicePlaying={isVoicePlaying}
          isTyping={isTyping}
          isVoiceTyping={isVoiceTyping}
          isAnalyzingImage={isAnalyzingImage}
          isMollaResponding={isMollaResponding}
          pendingImageUrl={pendingImageUrl}
          onUpdateAudioUrl={handleUpdateAudioUrl}
          onSendMessage={handleSendMessage}
          onOpenVisionModal={() => setIsVisionModalOpen(true)}
          onClearChat={handleClearChat}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          onCloseChat={handleCloseChat}
          onOpenNews={() => setIsNewsModalOpen(true)}
          onOpenLeftDrawer={() => setIsLeftDrawerOpen(true)}
          onOpenKeyModal={() => setIsGeminiKeyModalOpen(true)}
          hasApiKey={hasGeminiKey}
          onTypingChange={handleTypingChange}
          onVoiceTypingChange={handleVoiceTypingChange}
          onPauseLiveSession={handlePauseLiveSession}
          onToggleCall={handleToggleVoiceCall}
          onStopCall={handleStopVoiceCall}
          effectiveTheme={effectiveTheme}
        />
      )}

      {/* Chat History Drawer (Image 3) */}
      <ChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onPinSession={handlePinSession}
        onNotebookSession={handleNotebookSession}
        onShareSession={handleShareSession}
        onClearChat={handleClearChat}
        effectiveTheme={effectiveTheme}
      />

      {/* Options & Settings Drawer */}
      <OptionsDrawer
        isOpen={isOptionsDrawerOpen}
        onClose={() => setIsOptionsDrawerOpen(false)}
        voice={voice}
        onSelectVoice={setVoice}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        onClearChat={handleClearChat}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenThemeChooserModal={() => setIsThemeModalOpen(true)}
        onOpenGeminiKeyModal={() => setIsGeminiKeyModalOpen(true)}
        themeMode={themeMode}
        effectiveTheme={effectiveTheme}
        isEdgeLightingEnabled={isEdgeLightingEnabled}
        onToggleEdgeLighting={handleToggleEdgeLighting}
      />

      {/* Live Vision / Camera Modal */}
      <LiveVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        onSendVisualInput={handleSendVisualInput}
        onSendVideoFrame={handleSendVideoFrame}
        aura={currentAura}
        isLiveActive={state !== 'disconnected'}
        effectiveTheme={effectiveTheme}
      />

      {/* Google News Live Reader Modal */}
      <NewsModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        voice={voice}
        onDiscussNews={handleDiscussNews}
        effectiveTheme={effectiveTheme}
      />

      {/* Install App Modal matching Screenshot 2 */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        appName="Molla AI"
        appSubtitle="Voice & Real-Time AI Assistant"
        effectiveTheme={effectiveTheme}
      />

      {/* Choose Theme Modal matching Screenshot 3 */}
      <ThemeChooserModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentMode={themeMode}
        onSelectMode={(mode) => setThemeMode(mode)}
        effectiveTheme={effectiveTheme}
      />

      {/* Maya Left-Side Slide Drawer matching Screenshot 1 */}
      <MayaLeftDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onNavigateChat={() => setActiveView('chat')}
        onOpenSettings={() => setIsMayaSettingsOpen(true)}
        onOpenDetailModal={(type, title) => setActiveMayaDetail({ type, title })}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenThemeChooserModal={() => setIsThemeModalOpen(true)}
        themeMode={themeMode}
        effectiveTheme={effectiveTheme}
        onSelectThemeMode={(mode) => setThemeMode(mode)}
        isEdgeLightingEnabled={isEdgeLightingEnabled}
        onToggleEdgeLighting={handleToggleEdgeLighting}
      />

      {/* Maya Settings View matching Screenshot 2 */}
      {isMayaSettingsOpen && (
        <MayaSettingsView
          onBack={() => setIsMayaSettingsOpen(false)}
          onOpenPersonal={() => setIsMayaPersonalOpen(true)}
          onOpenItemDetail={(type, title) => setActiveMayaDetail({ type, title })}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          onOpenThemeChooserModal={() => setIsThemeModalOpen(true)}
          themeMode={themeMode}
          effectiveTheme={effectiveTheme}
          onSelectThemeMode={(mode) => setThemeMode(mode)}
          isEdgeLightingEnabled={isEdgeLightingEnabled}
          onToggleEdgeLighting={handleToggleEdgeLighting}
        />
      )}

      {/* Maya Personal View matching Screenshot 3 */}
      {isMayaPersonalOpen && (
        <MayaPersonalView
          onBack={() => setIsMayaPersonalOpen(false)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {/* Dedicated full-screen subviews for Settings options */}
      {activeMayaDetail?.type === 'maya_assistant' && (
        <MayaAssistantDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'skills' && (
        <MayaSkillsDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'sub_agents' && (
        <MayaSubAgentsDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'email' && (
        <MayaEmailDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'whatsapp' && (
        <MayaWhatsAppDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'social_media' && (
        <MayaSocialDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'connectors' && (
        <MayaConnectorsDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'backup' && (
        <MayaBackupDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'optional' && (
        <MayaOptionalDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'theme' && (
        <MayaThemeDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'appearance' && (
        <MayaAppearanceDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {(activeMayaDetail?.type === 'behaviour' || activeMayaDetail?.type === 'advanced') && (
        <MayaBehaviourDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'typing' && (
        <MayaTypingDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'appearance' && (
        <MayaAppearanceDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'voice_guardian' && (
        <MayaVoiceGuardianDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'emergency_sos' && (
        <MayaEmergencySosDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'touch_guard' && (
        <MayaTouchGuardDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'screen_lock' && (
        <MayaScreenLockDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          onOpenPatternPin={() => setActiveMayaDetail({ type: 'pattern_pin', title: 'Pattern & PIN' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'pattern_pin' && (
        <MayaPatternPinDetailView
          onBack={() => setActiveMayaDetail({ type: 'screen_lock', title: 'Screen lock' })}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'event_triggers' && (
        <MayaEventTriggersDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          onOpenWhatsAppAutoReply={() => setActiveMayaDetail({ type: 'whatsapp_autoreply', title: 'WhatsApp auto-reply' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'whatsapp_autoreply' && (
        <MayaWhatsAppAutoReplyDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          onOpenPermissions={() => setActiveMayaDetail({ type: 'permissions', title: 'Permissions' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'permissions' && (
        <MayaPermissionsDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'memories' && (
        <MayaMemoriesDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {activeMayaDetail?.type === 'markets' && (
        <MayaMarketsDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {(activeMayaDetail?.type === 'maya_rules' || activeMayaDetail?.type === 'rules') && (
        <MayaRulesDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {(activeMayaDetail?.type === 'coding' || activeMayaDetail?.type === 'website_coding') && (
        <MayaWebsiteCodingDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {(activeMayaDetail?.type === 'whiteboard' || activeMayaDetail?.type === 'study') && (
        <MayaWhiteboardDetailView
          onBack={() => setActiveMayaDetail(null)}
          onOpenNotifications={() => setActiveMayaDetail({ type: 'notifications', title: 'Notifications' })}
          effectiveTheme={effectiveTheme}
        />
      )}

      {/* Maya Interactive Detail Modals for other options */}
      <MayaDetailModal
        type={
          activeMayaDetail &&
          ![
            'maya_assistant',
            'skills',
            'sub_agents',
            'email',
            'whatsapp',
            'whatsapp_autoreply',
            'social_media',
            'connectors',
            'backup',
            'optional',
            'theme',
            'behaviour',
            'advanced',
            'typing',
            'appearance',
            'voice_guardian',
            'emergency_sos',
            'touch_guard',
            'screen_lock',
            'pattern_pin',
            'event_triggers',
            'permissions',
            'memories',
            'markets',
            'maya_rules',
            'rules',
            'coding',
            'website_coding',
            'whiteboard',
            'study',
          ].includes(activeMayaDetail.type)
            ? activeMayaDetail.type
            : null
        }
        title={activeMayaDetail?.title}
        onClose={() => setActiveMayaDetail(null)}
        effectiveTheme={effectiveTheme}
      />

      {/* Gemini API Key Configuration Modal */}
      <GeminiApiKeyModal
        isOpen={isGeminiKeyModalOpen}
        onClose={() => setIsGeminiKeyModalOpen(false)}
        effectiveTheme={effectiveTheme}
        onKeySaved={(newKey) => {
          setHasGeminiKey(Boolean(newKey));
          setErrorMessage(null);
        }}
      />
    </div>
  );
}
