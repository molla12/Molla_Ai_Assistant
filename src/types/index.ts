export type ConnectionState = 'disconnected' | 'connecting' | 'listening' | 'speaking';

export type AtmosphereTheme = 'neon-pink' | 'cyber-cyan' | 'emerald-matrix' | 'sunset-gold' | 'deep-violet';

export interface AtmosphereConfig {
  id: AtmosphereTheme;
  name: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
}

export interface TranscriptItem {
  id: string;
  sender: 'user' | 'molla';
  text: string;
  timestamp: number;
  isDelta?: boolean;
}

export interface ToolCallData {
  id: string;
  name: string;
  args: any;
  result?: any;
  timestamp: number;
}
