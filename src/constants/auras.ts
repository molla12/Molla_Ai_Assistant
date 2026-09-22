import { AtmosphereConfig, AtmosphereTheme, VoiceOption, LanguageConfig } from '../types';

export interface VoiceConfig {
  id: VoiceOption;
  name: string;
  tone: string;
  gender: 'female' | 'male' | 'neutral';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English (US)', nativeName: 'English (US)', speechRecLang: 'en-US', flag: '🌐' },
  { code: 'en-in', name: 'English (India)', nativeName: 'English (India)', speechRecLang: 'en-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'Bengali', speechRecLang: 'bn-IN', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', nativeName: 'Hindi', speechRecLang: 'hi-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'Tamil', speechRecLang: 'ta-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'Telugu', speechRecLang: 'te-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'Marathi', speechRecLang: 'mr-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'Gujarati', speechRecLang: 'gu-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'Kannada', speechRecLang: 'kn-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'Malayalam', speechRecLang: 'ml-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'Punjabi', speechRecLang: 'pa-IN', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'Odia', speechRecLang: 'or-IN', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'Assamese', speechRecLang: 'as-IN', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'Urdu', speechRecLang: 'ur-IN', flag: '🇵🇰' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'Sanskrit', speechRecLang: 'sa-IN', flag: '🇮🇳' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'Kashmiri', speechRecLang: 'ks-IN', flag: '🇮🇳' },
  { code: 'mai', name: 'Maithili', nativeName: 'Maithili', speechRecLang: 'mai-IN', flag: '🇮🇳' },
];

export const VOICE_OPTIONS: VoiceConfig[] = [
  { id: 'Aoede', name: 'Female Voice (Aoede)', tone: 'Sweet, natural & confident (Default)', gender: 'female' },
  { id: 'Fenrir', name: 'Male Voice (Fenrir)', tone: 'Deep, crisp & confident', gender: 'male' },
  { id: 'Kore', name: 'Female Voice (Kore)', tone: 'Playful, lively & witty', gender: 'female' },
  { id: 'Puck', name: 'Male Voice (Puck)', tone: 'Smart, energetic & upbeat', gender: 'male' },
  { id: 'Zephyr', name: 'Female Voice (Zephyr)', tone: 'Gentle, warm & soothing', gender: 'female' },
];

export const ATMOSPHERE_THEMES: Record<AtmosphereTheme, AtmosphereConfig> = {
  'neon-pink': {
    id: 'neon-pink',
    name: 'Neon Pink',
    mood: 'neon-pink',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    accentColor: '#f43f5e',
    particleColor: '#fb7185',
    bgGradient: 'radial-gradient(circle at 50% 45%, rgba(244, 63, 94, 0.18) 0%, rgba(136, 19, 55, 0.06) 50%, rgba(7, 9, 14, 0.98) 100%)',
  },
  'cyber-cyan': {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    mood: 'cyber-cyan',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    accentColor: '#06b6d4',
    particleColor: '#22d3ee',
    bgGradient: 'radial-gradient(circle at 50% 45%, rgba(6, 182, 212, 0.18) 0%, rgba(14, 116, 144, 0.06) 50%, rgba(7, 9, 14, 0.98) 100%)',
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    mood: 'emerald-matrix',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    accentColor: '#10b981',
    particleColor: '#34d399',
    bgGradient: 'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.18) 0%, rgba(4, 120, 87, 0.06) 50%, rgba(7, 9, 14, 0.98) 100%)',
  },
  'sunset-gold': {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    mood: 'sunset-gold',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    accentColor: '#f59e0b',
    particleColor: '#fbbf24',
    bgGradient: 'radial-gradient(circle at 50% 45%, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.06) 50%, rgba(7, 9, 14, 0.98) 100%)',
  },
  'deep-violet': {
    id: 'deep-violet',
    name: 'Deep Violet',
    mood: 'deep-violet',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    accentColor: '#a855f7',
    particleColor: '#c084fc',
    bgGradient: 'radial-gradient(circle at 50% 45%, rgba(168, 85, 247, 0.18) 0%, rgba(107, 33, 168, 0.06) 50%, rgba(7, 9, 14, 0.98) 100%)',
  },
};

// Aliases for compatibility
export const AURA_CONFIGS: Record<string, AtmosphereConfig> = {
  ...ATMOSPHERE_THEMES,
  'sassy-pink': ATMOSPHERE_THEMES['neon-pink'],
  'electric-violet': ATMOSPHERE_THEMES['deep-violet'],
  'sunset-amber': ATMOSPHERE_THEMES['sunset-gold'],
  'toxic-emerald': ATMOSPHERE_THEMES['emerald-matrix'],
};
