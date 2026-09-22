import { useState, useEffect, useRef, useCallback } from 'react';
import {
  loadMemories,
  loadMemorySettings,
  saveMemorySettings,
  loadAssistantConfig,
  MayaMemoryItem,
  MayaMemorySettings,
  getStoredGeminiApiKey,
} from '../components/maya/mayaStorage';
import { audioCoordinator } from '../services/audioCoordinator';
import { speakMollaWithNaturalVoice } from '../services/naturalSpeech';
import { VoiceOption, LanguageCode } from '../types';

export interface ProactiveQuestionEvent {
  text: string;
  memorySource?: string;
  category?: string;
  timestamp: number;
}

interface UseProactiveMemoryQuestionsProps {
  isPowerOn: boolean;
  isCallActive: boolean;
  currentVoice: VoiceOption;
  currentLang: LanguageCode;
  onPostQuestion: (event: ProactiveQuestionEvent) => void;
}

export function useProactiveMemoryQuestions({
  isPowerOn,
  isCallActive,
  currentVoice,
  currentLang,
  onPostQuestion,
}: UseProactiveMemoryQuestionsProps) {
  const [settings, setSettings] = useState<MayaMemorySettings>(loadMemorySettings);
  const [memories, setMemories] = useState<MayaMemoryItem[]>(loadMemories);
  const [countdown, setCountdown] = useState<number>(settings.intervalSeconds || 30);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<string | null>(null);

  const recentQuestionsRef = useRef<string[]>([]);
  const isAskingRef = useRef<boolean>(false);
  const countdownRef = useRef<number>(settings.intervalSeconds || 30);

  // Sync settings and memories on custom events
  useEffect(() => {
    const handleMemoriesUpdated = (e: any) => {
      const updated = e.detail || loadMemories();
      setMemories(updated);
    };

    const handleSettingsUpdated = (e: any) => {
      const updated = e.detail || loadMemorySettings();
      setSettings(updated);
      setCountdown(updated.intervalSeconds || 30);
      countdownRef.current = updated.intervalSeconds || 30;
    };

    window.addEventListener('maya_memories_updated', handleMemoriesUpdated);
    window.addEventListener('maya_memory_settings_updated', handleSettingsUpdated);

    return () => {
      window.removeEventListener('maya_memories_updated', handleMemoriesUpdated);
      window.removeEventListener('maya_memory_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Main question trigger logic
  const askMemoryQuestion = useCallback(async (forced: boolean = false) => {
    if (isAskingRef.current) return false;

    const currentMemories = loadMemories();
    if (!currentMemories || currentMemories.length === 0) {
      return false;
    }

    // If audio is actively playing or user speaking, defer
    if (!forced && audioCoordinator.isPlaying()) {
      return false;
    }

    isAskingRef.current = true;
    setIsAsking(true);

    try {
      const storedKey = getStoredGeminiApiKey();
      const assistantCfg = loadAssistantConfig();
      const effectiveLang = assistantCfg.language || currentLang || 'bn';

      const res = await fetch('/api/memory/proactive-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedKey ? { 'x-gemini-api-key': storedKey } : {}),
        },
        body: JSON.stringify({
          memories: currentMemories,
          lang: effectiveLang,
          voice: currentVoice,
          lastQuestions: recentQuestionsRef.current.slice(-5),
          girlfriendMode: assistantCfg.girlfriendMode,
          petName: assistantCfg.petName || 'সোনা',
          romanticStyle: assistantCfg.romanticStyle || 'Sweet & Caring',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate memory question');
      }

      const data = await res.json();
      if (data && data.question) {
        const questionText = data.question.trim();
        setLastQuestion(questionText);
        setLastSource(data.memorySource || null);

        recentQuestionsRef.current.push(questionText);
        if (recentQuestionsRef.current.length > 10) {
          recentQuestionsRef.current.shift();
        }

        // 1. Post to conversation transcript / UI
        onPostQuestion({
          text: questionText,
          memorySource: data.memorySource,
          category: data.category,
          timestamp: Date.now(),
        });

        // 2. Speak out loud with natural voice
        audioCoordinator.requestPlayback('chat', `memory_q_${Date.now()}`, 'Memory Question');
        speakMollaWithNaturalVoice(
          questionText,
          currentVoice,
          {
            onEnd: () => {
              audioCoordinator.playbackFinished('chat');
            },
          },
          currentLang
        );

        return true;
      }
    } catch (err) {
      console.warn('[ProactiveMemoryQuestions] Generation notice:', err);
    } finally {
      isAskingRef.current = false;
      setIsAsking(false);
      const resetTime = settings.intervalSeconds || 30;
      countdownRef.current = resetTime;
      setCountdown(resetTime);
    }

    return false;
  }, [currentLang, currentVoice, onPostQuestion, settings.intervalSeconds]);

  // Active timer loop: counts down every second when app is active (Power ON or Call active) and feature is enabled
  useEffect(() => {
    const isAppActive = isPowerOn || isCallActive;
    const shouldRun = isAppActive && settings.proactiveQuestionsEnabled && memories.length > 0;

    if (!shouldRun) {
      return;
    }

    const timer = setInterval(() => {
      // Don't tick down while actively asking or if audio is currently playing
      if (isAskingRef.current || audioCoordinator.isPlaying()) {
        return;
      }

      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        askMemoryQuestion(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPowerOn, isCallActive, settings.proactiveQuestionsEnabled, memories.length, askMemoryQuestion]);

  const toggleEnabled = useCallback(() => {
    const updated = {
      ...settings,
      proactiveQuestionsEnabled: !settings.proactiveQuestionsEnabled,
    };
    saveMemorySettings(updated);
    setSettings(updated);
  }, [settings]);

  const updateInterval = useCallback((newInterval: number) => {
    const updated = {
      ...settings,
      intervalSeconds: newInterval,
    };
    saveMemorySettings(updated);
    setSettings(updated);
    countdownRef.current = newInterval;
    setCountdown(newInterval);
  }, [settings]);

  return {
    isEnabled: settings.proactiveQuestionsEnabled,
    intervalSeconds: settings.intervalSeconds || 30,
    countdown,
    isAsking,
    lastQuestion,
    lastSource,
    memoriesCount: memories.length,
    toggleEnabled,
    updateInterval,
    askNow: () => askMemoryQuestion(true),
  };
}
