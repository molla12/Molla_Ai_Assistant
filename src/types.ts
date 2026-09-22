export type AtmosphereTheme = 
  | 'neon-pink' 
  | 'cyber-cyan' 
  | 'emerald-matrix' 
  | 'sunset-gold' 
  | 'deep-violet';

export type AuraMood = AtmosphereTheme;

export interface AtmosphereConfig {
  id: AtmosphereTheme;
  name: string;
  mood: string;
  glowColor: string;
  accentColor: string;
  particleColor: string;
  bgGradient: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentBg?: string;
  accentText?: string;
  accentBorder?: string;
  canvasColors?: [string, string, string];
  gradientClass?: string;
}

export type AuraConfig = AtmosphereConfig;

export type VoiceOption = 'Aoede' | 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir';

export type ConnectionState = 'disconnected' | 'connecting' | 'listening' | 'speaking' | 'paused';
export type LiveConnectionState = ConnectionState;

export type LanguageCode =
  | 'bn'
  | 'hi'
  | 'en-in'
  | 'en'
  | 'en-gb'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as'
  | 'ur'
  | 'sa'
  | 'ks'
  | 'mai'
  | 'es'
  | 'ar'
  | 'fr'
  | 'de'
  | 'ja'
  | 'ru'
  | (string & {});

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechRecLang: string;
  flag: string;
}

export interface TranscriptItem {
  id: string;
  sender: 'user' | 'molla' | 'system';
  text: string;
  timestamp: number;
  imageUrl?: string;
  isInterim?: boolean;
  isDelta?: boolean;
  isLiveTurn?: boolean;
  audioUrl?: string;
  duration?: number;
  isVoice?: boolean;
}

export interface ToolCallData {
  id: string;
  name: string;
  args: any;
  result?: any;
  timestamp?: number;
}

export interface VoiceConfig {
  id: VoiceOption;
  name: string;
  tone: string;
  gender: 'female' | 'male' | 'neutral';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: TranscriptItem[];
  isPinned?: boolean;
  isNotebook?: boolean;
}

export interface AudioSettings {
  soundEffectsEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoiceURI: string;
  autoReadOnPageTurn?: boolean;
  useGeminiTTS?: boolean;
}

export type CompanionRole = 'owl' | 'fairy' | 'robot';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'companion';
  text: string;
  timestamp: string;
  roleName?: string;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  imageUrl: string;
  soundEffect?: string;
  isGeneratingImage?: boolean;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  ageGroup: string;
  theme: string;
  coverColor: string;
  description: string;
  coverImageUrl?: string;
  pages: StoryPage[];
  isCustom?: boolean;
  favorite?: boolean;
  createdAt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  cleanTitle: string;
  link: string;
  source: string;
  relativeTime?: string;
  snippet?: string;
  speechText?: string;
}

