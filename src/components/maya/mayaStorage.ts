// Maya configuration, state models and localStorage storage for all settings screens
export interface MayaPersonalConfig {
  name: string;
  gender: 'Male' | 'Female' | 'Prefer not to say';
  phone: string;
  musicApp: 'YT Music' | 'Spotify' | 'YouTube';
  favoriteSong: string;
  geminiApiKey: string;
  youtubeChannel: string;
  youtubeApiKey: string;
}

export interface MayaAssistantConfig {
  assistantName: string;
  persona: string;
  girlfriendMode: boolean;
  romanticStyle?: 'Sweet & Caring' | 'Playful & Flirty' | 'Deeply Devoted';
  petName?: string;
  rememberOnHerOwn: boolean;
  incognito: boolean;
  voiceTab: 'Maya' | 'Friday' | 'Venom' | 'Molla' | (string & {});
  selectedVoice: string;
  conversationMode: boolean;
  messageAlerts: boolean;
  language: string;
  autoStartWakeWord: boolean;
  proactiveMaya: boolean;
  callAnnouncement: boolean;
  keepRingtonePlaying: boolean;
}

export interface MayaSkillItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  isStore?: boolean;
}

export interface MayaSubAgentConfig {
  customProviders: boolean;
  strategy: 'best_first' | 'ranked' | 'all_at_once';
  providers: {
    id: string;
    name: string;
    model: string;
    enabled: boolean;
  }[];
}

export interface MayaEmailConfig {
  emailAddress: string;
  appPassword: string;
  nameOnOutgoing: string;
  signature: string;
  smtpHost: string;
  smtpPort: string;
}

export interface MayaWhatsAppConfig {
  groups: string[];
  reportFormats: {
    id: string;
    title: string;
    template: string;
  }[];
}

export interface MayaSocialConfig {
  handle: string;
  platforms: ('Instagram' | 'Facebook')[];
  captionVoice: string;
  dailyStory: boolean;
  autoPost: boolean;
  scheduledPosts: {
    id: string;
    text: string;
    time: string;
  }[];
}

export interface MayaConnectorItem {
  id: string;
  name: string;
  description: string;
  category: 'Files' | 'Code' | 'Notes & tasks' | 'Messages';
  connected: boolean;
  iconLetter: string;
}

export interface MayaConnectorsConfig {
  connectors: MayaConnectorItem[];
}

export interface MayaBackupStats {
  memories: number;
  conversations: number;
  favoriteContacts: number;
}

export interface MayaOptionalConfig {
  geminiApiKey: string;
  placesApiKey: string;
  tavilyApiKey: string;
  braveSearchApiKey: string;
  serpApiKey: string;
  pollinationsToken: string;
  imageGenerators: {
    id: string;
    name: string;
    provider: string;
    model: string;
  }[];
}

export interface MayaThemeConfig {
  theme: 'Midnight' | 'Obsidian' | 'Nocturne' | 'Ember' | 'Abyss' | 'Rosewood' | 'Daylight';
  typeface: 'Inter' | 'System' | 'Serif' | 'Monospace' | 'Handwritten';
  size: 'Compact' | 'Default' | 'Large' | 'Larger';
  surfaceStyle: 'Flat' | 'Glass' | 'Soft' | 'Clay';
  surfaceCorners: 'Sharp' | 'Soft' | 'Rounded' | 'Pillowy';
}

export interface MayaBehaviourConfig {
  floatingOrb: boolean;
  edgeGlow: boolean;
  echoGuard: boolean;
  screenRecordingMode: boolean;
  startOnBoot: boolean;
}

export interface MayaTypingConfig {
  humanTypingInEditors: boolean;
  speed: 'Slow' | 'Normal' | 'Fast';
  realisticTypingWhileCoding: boolean;
  packages: string;
}

export interface MayaAppearanceConfig {
  orbStyle: string;
  color: string;
  orbSize: number;
  useOrbOnHome: boolean;
}

export interface MayaVoiceGuardianConfig {
  voiceGuardianOn: boolean;
  awayGuardMode: boolean;
  listenMode: 'Everyone' | 'Owner only' | 'Owner + family';
  matchStrictness: number;
  enrolledVoices: { id: string; role: string; label: string }[];
}

export interface MayaEmergencySosConfig {
  countryCode: string;
  contacts: { id: string; name: string; phone: string }[];
}

export interface MayaTouchGuardConfig {
  enabled: boolean;
  armTheGuard: boolean;
  godMode: boolean;
  recogniseMyVoice: boolean;
  letAnyoneDisarmWhileLocked: boolean;
  photosCount: number; // 1 to 5, default 3
  sirenSeconds: number; // default 30
  warnFirstSirenSecond: boolean; // default true
  lockScreenImmediately: boolean; // default true
  blinkTorchWithSiren: boolean; // default true
  textSosContactsAfter3Touches: boolean; // default false
  movementSensitivity: 'Low' | 'Medium' | 'High'; // default Medium
  tripWhenChargerPulled: boolean; // default true
  stealthRecordOnly: boolean; // default false
  touchHistory: {
    id: string;
    timestamp: string;
    trigger: string;
    location: string;
    photoPlaceholder?: string;
  }[];
}

export interface MayaScreenLockConfig {
  wakeTheScreen: boolean; // default true
  unlockForMe: boolean; // default false
  patternDots: number[]; // e.g. [0, 1, 2, 5]
  pinCode: string;
  fineTuningDelayMs: number;
}

export interface MayaEventTriggersConfig {
  screenTurnsOn: boolean;
  screenUnlocks: boolean;
  chargerConnected: boolean;
  chargerDisconnected: boolean;
  batteryLow: boolean;
  whatsAppMessage: boolean;
  incomingCall: boolean;
  hourlyTrigger: boolean;
  dailyMorning: boolean;
  nightRoutine: boolean;
  arriveHome: boolean;
  leaveHome: boolean;
}

export interface MayaWhatsAppAutoReplyConfig {
  enabled: boolean;
  replyToGroups: boolean;
  cozyDelay: boolean;
  allowedContacts: 'Everyone' | 'Only contacts' | 'Custom allowlist';
  customAllowlist: string[];
  replyPrompt: string;
}

export interface MayaPermissionsConfig {
  notificationAccess: boolean;
  microphone: boolean;
  camera: boolean;
  accessibilityService: boolean;
  displayOverlay: boolean;
  locationGps: boolean;
  batteryOptimization: boolean;
  storageMedia: boolean;
  phoneCallState: boolean;
}

export interface MayaMemoryItem {
  id: string;
  category: 'Preference' | 'Personal' | 'Work' | 'Rules';
  text: string;
  learnedAt: string;
}

export interface MayaMemorySettings {
  proactiveQuestionsEnabled: boolean;
  intervalSeconds: number;
  autoAskOnAppPlay: boolean;
}

export interface MayaWatchlistItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changeAmount: string;
  isUp: boolean;
}

export interface MayaMarketsConfig {
  watchlist: MayaWatchlistItem[];
}

const STORAGE_PERSONAL = 'maya_personal_config_v1';
const STORAGE_ASSISTANT = 'maya_assistant_config_v1';
const STORAGE_SKILLS = 'maya_skills_config_v1';
const STORAGE_SUBAGENTS = 'maya_subagents_config_v1';
const STORAGE_EMAIL = 'maya_email_config_v1';
const STORAGE_WHATSAPP = 'maya_whatsapp_config_v1';
const STORAGE_SOCIAL = 'maya_social_config_v1';
const STORAGE_CONNECTORS = 'maya_connectors_config_v1';
const STORAGE_OPTIONAL = 'maya_optional_config_v1';
const STORAGE_THEME = 'maya_theme_config_v1';
const STORAGE_BEHAVIOUR = 'maya_behaviour_config_v1';
const STORAGE_TYPING = 'maya_typing_config_v1';
const STORAGE_APPEARANCE = 'maya_appearance_config_v1';
const STORAGE_VOICE_GUARDIAN = 'maya_voice_guardian_config_v1';
const STORAGE_EMERGENCY_SOS = 'maya_emergency_sos_config_v1';
const STORAGE_TOUCH_GUARD = 'maya_touch_guard_config_v1';
const STORAGE_SCREEN_LOCK = 'maya_screen_lock_config_v1';
const STORAGE_EVENT_TRIGGERS = 'maya_event_triggers_config_v1';
const STORAGE_WHATSAPP_AUTOREPLY = 'maya_whatsapp_autoreply_config_v1';
const STORAGE_PERMISSIONS = 'maya_permissions_config_v1';
const STORAGE_MEMORIES = 'maya_memories_config_v1';
const STORAGE_MEMORY_SETTINGS = 'maya_memory_settings_v1';
const STORAGE_MARKETS = 'maya_markets_config_v1';

export const DEFAULT_MAYA_CONFIG: MayaPersonalConfig = {
  name: 'Hunter',
  gender: 'Female',
  phone: '+91 98765 43210',
  musicApp: 'YT Music',
  favoriteSong: 'Kesariya',
  geminiApiKey: '',
  youtubeChannel: '@yourchannel',
  youtubeApiKey: '',
};

export const DEFAULT_ASSISTANT_CONFIG: MayaAssistantConfig = {
  assistantName: 'Molla',
  persona: 'Molla',
  girlfriendMode: true,
  romanticStyle: 'Sweet & Caring',
  petName: 'সোনা',
  rememberOnHerOwn: true,
  incognito: false,
  voiceTab: 'Molla',
  selectedVoice: 'Breezy (Aoede)',
  conversationMode: false,
  messageAlerts: true,
  language: 'Bengali (বাংলা)',
  autoStartWakeWord: true,
  proactiveMaya: true,
  callAnnouncement: true,
  keepRingtonePlaying: false,
};

export const DEFAULT_INSTALLED_SKILLS: MayaSkillItem[] = [
  {
    id: 'pro-email',
    name: 'pro-email',
    description: 'Professional email likhna aur bhejna — leave, apology, follow-up, application, client mail',
    enabled: true,
  },
  {
    id: 'group-report',
    name: 'group-report',
    description: 'Job/work WhatsApp group me fixed format wali daily report bhejna — value poochh ke, confirm le ke',
    enabled: true,
  },
  {
    id: 'pro-whatsapp',
    name: 'pro-whatsapp',
    description: 'Professional WhatsApp message likhna — client, boss, HR, vendor ko dhang ka message',
    enabled: true,
  },
  {
    id: 'youtube-script',
    name: 'youtube-script',
    description: 'YouTube video ka ready-to-speak script likhne ka tarika — hook, retention, CTA aur bolne layak language',
    enabled: true,
  },
  {
    id: 'youtube-title-thumbnail',
    name: 'youtube-title-thumbnail',
    description: 'YouTube title aur thumbnail text likhna — curiosity gap banao, jhooth nahi',
    enabled: true,
  },
  {
    id: 'youtube-upload',
    name: 'youtube-upload',
    description: 'Video upload se pehle ka kaam — description, chapters, tags, pinned comment ka checklist',
    enabled: true,
  },
  {
    id: 'social-posting',
    name: 'social-posting',
    description: 'Photo ya poster ko Instagram/Facebook pe story ya post ki tarah daalna, sahi size aur sahi rasta',
    enabled: true,
  },
  {
    id: 'web-design',
    name: 'web-design',
    description: 'Website banate waqt colour, layout aur phone-first rules — jo bhi Maya khud code karti hai uspe lagte hain',
    enabled: true,
  },
  {
    id: 'coding-agent',
    name: 'coding-agent',
    description: 'Maya khud coding karti hai — kab kaunsa coding tool, kya poochhna hai, aur user ko kya batana hai',
    enabled: true,
  },
  {
    id: 'code-publish',
    name: 'code-publish',
    description: 'Maya ka banaya project GitHub pe daalna aur Vercel/Netlify se deploy karwana',
    enabled: true,
  },
];

export const DEFAULT_STORE_SKILLS: MayaSkillItem[] = [
  {
    id: 'daily-briefing',
    name: 'daily-briefing',
    description: 'Subah "good morning" / "din ka update do" bole to phone ka pura ek-baar-me briefing dena',
    enabled: false,
    isStore: true,
  },
  {
    id: 'whatsapp-pro',
    name: 'whatsapp-pro',
    description: 'WhatsApp ka koi bhi kaam (message, reply, group, file, call) galti-free tarike se karna',
    enabled: false,
    isStore: true,
  },
  {
    id: 'call-secretary',
    name: 'call-secretary',
    description: 'Incoming phone call aane pe announce/pickup/reject aur call ke baad ka pura etiquette',
    enabled: false,
    isStore: true,
  },
  {
    id: 'photo-share',
    name: 'photo-share',
    description: 'Photo/video khinch ke ya gallery se nikaal ke WhatsApp pe bhejne ka end-to-end flow',
    enabled: false,
    isStore: true,
  },
  {
    id: 'music-dj',
    name: 'music-dj',
    description: 'Gaana/music/video bajane, control karne aur mood ke hisaab se DJ banne ka tarika',
    enabled: false,
    isStore: true,
  },
  {
    id: 'phone-care',
    name: 'phone-care',
    description: 'Battery bachane, phone slow/garam hone par optimize karne ki guidelines',
    enabled: false,
    isStore: true,
  },
];

export const DEFAULT_SUBAGENT_CONFIG: MayaSubAgentConfig = {
  customProviders: true,
  strategy: 'ranked',
  providers: [
    {
      id: '1',
      name: 'Gemini (default)',
      model: 'Gemini · default',
      enabled: true,
    },
  ],
};

export const DEFAULT_EMAIL_CONFIG: MayaEmailConfig = {
  emailAddress: '',
  appPassword: '',
  nameOnOutgoing: '',
  signature: 'Regards,\nYour Name\n+91 90000 00000',
  smtpHost: '',
  smtpPort: '465',
};

export const DEFAULT_WHATSAPP_CONFIG: MayaWhatsAppConfig = {
  groups: [],
  reportFormats: [],
};

export const DEFAULT_SOCIAL_CONFIG: MayaSocialConfig = {
  handle: '',
  platforms: ['Instagram'],
  captionVoice: '',
  dailyStory: false,
  autoPost: false,
  scheduledPosts: [],
};

export function loadMayaConfig(): MayaPersonalConfig {
  try {
    const raw = localStorage.getItem(STORAGE_PERSONAL);
    if (!raw) return DEFAULT_MAYA_CONFIG;
    return { ...DEFAULT_MAYA_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MAYA_CONFIG;
  }
}

export function saveMayaConfig(config: MayaPersonalConfig): void {
  try {
    localStorage.setItem(STORAGE_PERSONAL, JSON.stringify(config));
  } catch {}
}

export function loadAssistantConfig(): MayaAssistantConfig {
  try {
    const raw = localStorage.getItem(STORAGE_ASSISTANT);
    if (!raw) return DEFAULT_ASSISTANT_CONFIG;
    const parsed = JSON.parse(raw);
    const loaded = { ...DEFAULT_ASSISTANT_CONFIG, ...parsed };
    if (loaded.language && loaded.language.includes('Hinglish')) {
      loaded.language = 'Bengali (বাংলা)';
    }
    return loaded;
  } catch {
    return DEFAULT_ASSISTANT_CONFIG;
  }
}

export function saveAssistantConfig(config: MayaAssistantConfig): void {
  try {
    localStorage.setItem(STORAGE_ASSISTANT, JSON.stringify(config));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('maya_assistant_config_updated', { detail: config }));
    }, 0);
  } catch {}
}

export function loadSkillsConfig(): { installed: MayaSkillItem[]; store: MayaSkillItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_SKILLS);
    if (!raw) return { installed: DEFAULT_INSTALLED_SKILLS, store: DEFAULT_STORE_SKILLS };
    return JSON.parse(raw);
  } catch {
    return { installed: DEFAULT_INSTALLED_SKILLS, store: DEFAULT_STORE_SKILLS };
  }
}

export function saveSkillsConfig(data: { installed: MayaSkillItem[]; store: MayaSkillItem[] }): void {
  try {
    localStorage.setItem(STORAGE_SKILLS, JSON.stringify(data));
  } catch {}
}

export function loadSubAgentConfig(): MayaSubAgentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_SUBAGENTS);
    if (!raw) return DEFAULT_SUBAGENT_CONFIG;
    return { ...DEFAULT_SUBAGENT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SUBAGENT_CONFIG;
  }
}

export function saveSubAgentConfig(config: MayaSubAgentConfig): void {
  try {
    localStorage.setItem(STORAGE_SUBAGENTS, JSON.stringify(config));
  } catch {}
}

export function loadEmailConfig(): MayaEmailConfig {
  try {
    const raw = localStorage.getItem(STORAGE_EMAIL);
    if (!raw) return DEFAULT_EMAIL_CONFIG;
    return { ...DEFAULT_EMAIL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMAIL_CONFIG;
  }
}

export function saveEmailConfig(config: MayaEmailConfig): void {
  try {
    localStorage.setItem(STORAGE_EMAIL, JSON.stringify(config));
  } catch {}
}

export function loadWhatsAppConfig(): MayaWhatsAppConfig {
  try {
    const raw = localStorage.getItem(STORAGE_WHATSAPP);
    if (!raw) return DEFAULT_WHATSAPP_CONFIG;
    return { ...DEFAULT_WHATSAPP_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WHATSAPP_CONFIG;
  }
}

export function saveWhatsAppConfig(config: MayaWhatsAppConfig): void {
  try {
    localStorage.setItem(STORAGE_WHATSAPP, JSON.stringify(config));
  } catch {}
}

export function loadSocialConfig(): MayaSocialConfig {
  try {
    const raw = localStorage.getItem(STORAGE_SOCIAL);
    if (!raw) return DEFAULT_SOCIAL_CONFIG;
    return { ...DEFAULT_SOCIAL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOCIAL_CONFIG;
  }
}

export function saveSocialConfig(config: MayaSocialConfig): void {
  try {
    localStorage.setItem(STORAGE_SOCIAL, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_CONNECTORS_LIST: MayaConnectorItem[] = [
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Files you create or pick',
    category: 'Files',
    connected: true,
    iconLetter: 'G',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repos, issues and files',
    category: 'Code',
    connected: true,
    iconLetter: 'G',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Put a site online',
    category: 'Code',
    connected: true,
    iconLetter: 'V',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Pages, notes and databases',
    category: 'Notes & tasks',
    connected: true,
    iconLetter: 'N',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send yourself messages and files',
    category: 'Messages',
    connected: true,
    iconLetter: 'T',
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Your real task list',
    category: 'Notes & tasks',
    connected: false,
    iconLetter: 'T',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Projects, issues and files',
    category: 'Code',
    connected: false,
    iconLetter: 'G',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issues and cycles',
    category: 'Notes & tasks',
    connected: false,
    iconLetter: 'L',
  },
];

export const DEFAULT_CONNECTORS_CONFIG: MayaConnectorsConfig = {
  connectors: DEFAULT_CONNECTORS_LIST,
};

export function loadConnectorsConfig(): MayaConnectorsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONNECTORS);
    if (!raw) return DEFAULT_CONNECTORS_CONFIG;
    return { ...DEFAULT_CONNECTORS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONNECTORS_CONFIG;
  }
}

export function saveConnectorsConfig(config: MayaConnectorsConfig): void {
  try {
    localStorage.setItem(STORAGE_CONNECTORS, JSON.stringify(config));
  } catch {}
}

export function loadBackupStats(): MayaBackupStats {
  try {
    const saved = localStorage.getItem('molla_chat_sessions_v1');
    let convCount = 0;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.sessions?.length) {
        convCount = parsed.sessions.length;
      }
    }
    return {
      memories: 0,
      conversations: convCount,
      favoriteContacts: 0,
    };
  } catch {
    return {
      memories: 0,
      conversations: 0,
      favoriteContacts: 0,
    };
  }
}

export const STORAGE_GEMINI_API_KEY = 'maya_gemini_api_key_v1';

export function getStoredGeminiApiKey(): string {
  try {
    const directKey = localStorage.getItem(STORAGE_GEMINI_API_KEY);
    if (directKey && directKey.trim()) return directKey.trim();

    const optRaw = localStorage.getItem(STORAGE_OPTIONAL);
    if (optRaw) {
      const parsed = JSON.parse(optRaw);
      if (parsed.geminiApiKey && parsed.geminiApiKey.trim()) return parsed.geminiApiKey.trim();
    }

    const persRaw = localStorage.getItem(STORAGE_PERSONAL);
    if (persRaw) {
      const parsed = JSON.parse(persRaw);
      if (parsed.geminiApiKey && parsed.geminiApiKey.trim()) return parsed.geminiApiKey.trim();
    }
  } catch {}
  return '';
}

export function saveStoredGeminiApiKey(apiKey: string): void {
  const clean = (apiKey || '').trim();
  try {
    if (clean) {
      localStorage.setItem(STORAGE_GEMINI_API_KEY, clean);
    } else {
      localStorage.removeItem(STORAGE_GEMINI_API_KEY);
    }

    // Sync to backend server
    if (clean) {
      fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: clean }),
      }).catch((err) => console.warn('Sync gemini key to server error:', err));
    }

    // Broadcast change
    window.dispatchEvent(new CustomEvent('gemini_api_key_updated', { detail: { apiKey: clean } }));
  } catch {}
}

export const DEFAULT_OPTIONAL_CONFIG: MayaOptionalConfig = {
  geminiApiKey: '',
  placesApiKey: '',
  tavilyApiKey: '',
  braveSearchApiKey: '',
  serpApiKey: '',
  pollinationsToken: '',
  imageGenerators: [],
};

export function loadOptionalConfig(): MayaOptionalConfig {
  try {
    const raw = localStorage.getItem(STORAGE_OPTIONAL);
    const base = raw ? { ...DEFAULT_OPTIONAL_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_OPTIONAL_CONFIG };
    if (!base.geminiApiKey) {
      base.geminiApiKey = getStoredGeminiApiKey();
    }
    return base;
  } catch {
    return { ...DEFAULT_OPTIONAL_CONFIG, geminiApiKey: getStoredGeminiApiKey() };
  }
}

export function saveOptionalConfig(config: MayaOptionalConfig): void {
  try {
    localStorage.setItem(STORAGE_OPTIONAL, JSON.stringify(config));
    if (config.geminiApiKey) {
      saveStoredGeminiApiKey(config.geminiApiKey);
    }
  } catch {}
}

export const DEFAULT_THEME_CONFIG: MayaThemeConfig = {
  theme: 'Midnight',
  typeface: 'Inter',
  size: 'Default',
  surfaceStyle: 'Glass',
  surfaceCorners: 'Rounded',
};

export function loadMayaThemeConfig(): MayaThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_THEME);
    if (!raw) return DEFAULT_THEME_CONFIG;
    return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveMayaThemeConfig(config: MayaThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_THEME, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_BEHAVIOUR_CONFIG: MayaBehaviourConfig = {
  floatingOrb: true,
  edgeGlow: true,
  echoGuard: true,
  screenRecordingMode: false,
  startOnBoot: true,
};

export function loadBehaviourConfig(): MayaBehaviourConfig {
  try {
    const raw = localStorage.getItem(STORAGE_BEHAVIOUR);
    if (!raw) return DEFAULT_BEHAVIOUR_CONFIG;
    return { ...DEFAULT_BEHAVIOUR_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BEHAVIOUR_CONFIG;
  }
}

export function saveBehaviourConfig(config: MayaBehaviourConfig): void {
  try {
    localStorage.setItem(STORAGE_BEHAVIOUR, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_TYPING_CONFIG: MayaTypingConfig = {
  humanTypingInEditors: true,
  speed: 'Normal',
  realisticTypingWhileCoding: true,
  packages:
    'com.google.android.keep,com.google.android.apps.docs.editors.docs,com.samsung.android.app.notes,com.termux,net.gsantner.markor,com.foxdebug.acode,org.jotdown.jota',
};

export function loadTypingConfig(): MayaTypingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_TYPING);
    if (!raw) return DEFAULT_TYPING_CONFIG;
    return { ...DEFAULT_TYPING_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TYPING_CONFIG;
  }
}

export function saveTypingConfig(config: MayaTypingConfig): void {
  try {
    localStorage.setItem(STORAGE_TYPING, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_APPEARANCE_CONFIG: MayaAppearanceConfig = {
  orbStyle: 'Maya Nova',
  color: 'Persona',
  orbSize: 190,
  useOrbOnHome: false,
};

export function loadAppearanceConfig(): MayaAppearanceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_APPEARANCE);
    if (!raw) return DEFAULT_APPEARANCE_CONFIG;
    return { ...DEFAULT_APPEARANCE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APPEARANCE_CONFIG;
  }
}

export function saveAppearanceConfig(config: MayaAppearanceConfig): void {
  try {
    localStorage.setItem(STORAGE_APPEARANCE, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_VOICE_GUARDIAN_CONFIG: MayaVoiceGuardianConfig = {
  voiceGuardianOn: true,
  awayGuardMode: false,
  listenMode: 'Everyone',
  matchStrictness: 0.4,
  enrolledVoices: [
    {
      id: '1',
      role: 'Owner',
      label: 'boss',
    },
  ],
};

export function loadVoiceGuardianConfig(): MayaVoiceGuardianConfig {
  try {
    const raw = localStorage.getItem(STORAGE_VOICE_GUARDIAN);
    if (!raw) return DEFAULT_VOICE_GUARDIAN_CONFIG;
    return { ...DEFAULT_VOICE_GUARDIAN_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_VOICE_GUARDIAN_CONFIG;
  }
}

export function saveVoiceGuardianConfig(config: MayaVoiceGuardianConfig): void {
  try {
    localStorage.setItem(STORAGE_VOICE_GUARDIAN, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_EMERGENCY_SOS_CONFIG: MayaEmergencySosConfig = {
  countryCode: 'India (+91)',
  contacts: [],
};

export function loadEmergencySosConfig(): MayaEmergencySosConfig {
  try {
    const raw = localStorage.getItem(STORAGE_EMERGENCY_SOS);
    if (!raw) return DEFAULT_EMERGENCY_SOS_CONFIG;
    return { ...DEFAULT_EMERGENCY_SOS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EMERGENCY_SOS_CONFIG;
  }
}

export function saveEmergencySosConfig(config: MayaEmergencySosConfig): void {
  try {
    localStorage.setItem(STORAGE_EMERGENCY_SOS, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_TOUCH_GUARD_CONFIG: MayaTouchGuardConfig = {
  enabled: false,
  armTheGuard: false,
  godMode: false,
  recogniseMyVoice: true,
  letAnyoneDisarmWhileLocked: false,
  photosCount: 3,
  sirenSeconds: 30,
  warnFirstSirenSecond: true,
  lockScreenImmediately: true,
  blinkTorchWithSiren: true,
  textSosContactsAfter3Touches: false,
  movementSensitivity: 'Medium',
  tripWhenChargerPulled: true,
  stealthRecordOnly: false,
  touchHistory: [],
};

export function loadTouchGuardConfig(): MayaTouchGuardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_TOUCH_GUARD);
    if (!raw) return DEFAULT_TOUCH_GUARD_CONFIG;
    return { ...DEFAULT_TOUCH_GUARD_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TOUCH_GUARD_CONFIG;
  }
}

export function saveTouchGuardConfig(config: MayaTouchGuardConfig): void {
  try {
    localStorage.setItem(STORAGE_TOUCH_GUARD, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_SCREEN_LOCK_CONFIG: MayaScreenLockConfig = {
  wakeTheScreen: true,
  unlockForMe: false,
  patternDots: [],
  pinCode: '',
  fineTuningDelayMs: 150,
};

export function loadScreenLockConfig(): MayaScreenLockConfig {
  try {
    const raw = localStorage.getItem(STORAGE_SCREEN_LOCK);
    if (!raw) return DEFAULT_SCREEN_LOCK_CONFIG;
    return { ...DEFAULT_SCREEN_LOCK_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCREEN_LOCK_CONFIG;
  }
}

export function saveScreenLockConfig(config: MayaScreenLockConfig): void {
  try {
    localStorage.setItem(STORAGE_SCREEN_LOCK, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_EVENT_TRIGGERS_CONFIG: MayaEventTriggersConfig = {
  screenTurnsOn: false,
  screenUnlocks: false,
  chargerConnected: false,
  chargerDisconnected: false,
  batteryLow: false,
  whatsAppMessage: false,
  incomingCall: false,
  hourlyTrigger: false,
  dailyMorning: false,
  nightRoutine: false,
  arriveHome: false,
  leaveHome: false,
};

export function loadEventTriggersConfig(): MayaEventTriggersConfig {
  try {
    const raw = localStorage.getItem(STORAGE_EVENT_TRIGGERS);
    if (!raw) return DEFAULT_EVENT_TRIGGERS_CONFIG;
    return { ...DEFAULT_EVENT_TRIGGERS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_EVENT_TRIGGERS_CONFIG;
  }
}

export function saveEventTriggersConfig(config: MayaEventTriggersConfig): void {
  try {
    localStorage.setItem(STORAGE_EVENT_TRIGGERS, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_WHATSAPP_AUTOREPLY_CONFIG: MayaWhatsAppAutoReplyConfig = {
  enabled: false,
  replyToGroups: false,
  cozyDelay: true,
  allowedContacts: 'Everyone',
  customAllowlist: [],
  replyPrompt: 'You are Maya, replying on behalf of Hunter. Keep replies short, polite, helpful, and natural. Do not disclose sensitive info.',
};

export function loadWhatsAppAutoReplyConfig(): MayaWhatsAppAutoReplyConfig {
  try {
    const raw = localStorage.getItem(STORAGE_WHATSAPP_AUTOREPLY);
    if (!raw) return DEFAULT_WHATSAPP_AUTOREPLY_CONFIG;
    return { ...DEFAULT_WHATSAPP_AUTOREPLY_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WHATSAPP_AUTOREPLY_CONFIG;
  }
}

export function saveWhatsAppAutoReplyConfig(config: MayaWhatsAppAutoReplyConfig): void {
  try {
    localStorage.setItem(STORAGE_WHATSAPP_AUTOREPLY, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_PERMISSIONS_CONFIG: MayaPermissionsConfig = {
  notificationAccess: false,
  microphone: true,
  camera: true,
  accessibilityService: false,
  displayOverlay: true,
  locationGps: true,
  batteryOptimization: true,
  storageMedia: true,
  phoneCallState: true,
};

export function loadPermissionsConfig(): MayaPermissionsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_PERMISSIONS);
    if (!raw) return DEFAULT_PERMISSIONS_CONFIG;
    return { ...DEFAULT_PERMISSIONS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PERMISSIONS_CONFIG;
  }
}

export function savePermissionsConfig(config: MayaPermissionsConfig): void {
  try {
    localStorage.setItem(STORAGE_PERMISSIONS, JSON.stringify(config));
  } catch {}
}

export const DEFAULT_MEMORIES: MayaMemoryItem[] = [
  {
    id: 'm-1',
    category: 'Preference',
    text: 'Hunter prefers Hindi and English (Hinglish) conversations with a warm and polite tone.',
    learnedAt: 'Learned 2 days ago',
  },
  {
    id: 'm-2',
    category: 'Personal',
    text: 'Favorite music app is set to YT Music with preference for melodic Indian songs like Kesariya.',
    learnedAt: 'Learned 3 days ago',
  },
  {
    id: 'm-3',
    category: 'Work',
    text: 'Always provide concise code explanations with TypeScript snippets and clean architecture.',
    learnedAt: 'Learned 4 days ago',
  },
  {
    id: 'm-4',
    category: 'Rules',
    text: 'Do not share personal home location or phone contact info in external chat contexts.',
    learnedAt: 'Added manually',
  },
  {
    id: 'm-5',
    category: 'Work',
    text: 'Daily job/work reports need to be drafted in WhatsApp group report format before 7:00 PM.',
    learnedAt: 'Learned 5 days ago',
  },
];

export function loadMemories(): MayaMemoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_MEMORIES);
    if (!raw) return DEFAULT_MEMORIES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MEMORIES;
  }
}

export function saveMemories(memories: MayaMemoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_MEMORIES, JSON.stringify(memories));
    window.dispatchEvent(new CustomEvent('maya_memories_updated', { detail: memories }));
  } catch {}
}

export const DEFAULT_MEMORY_SETTINGS: MayaMemorySettings = {
  proactiveQuestionsEnabled: true,
  intervalSeconds: 30,
  autoAskOnAppPlay: true,
};

export function loadMemorySettings(): MayaMemorySettings {
  try {
    const raw = localStorage.getItem(STORAGE_MEMORY_SETTINGS);
    if (!raw) return DEFAULT_MEMORY_SETTINGS;
    return { ...DEFAULT_MEMORY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MEMORY_SETTINGS;
  }
}

export function saveMemorySettings(settings: MayaMemorySettings): void {
  try {
    localStorage.setItem(STORAGE_MEMORY_SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('maya_memory_settings_updated', { detail: settings }));
  } catch {}
}

export const DEFAULT_MARKETS_CONFIG: MayaMarketsConfig = {
  watchlist: [],
};

export function loadMarketsConfig(): MayaMarketsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_MARKETS);
    if (!raw) return DEFAULT_MARKETS_CONFIG;
    return { ...DEFAULT_MARKETS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MARKETS_CONFIG;
  }
}

export function saveMarketsConfig(config: MayaMarketsConfig): void {
  try {
    localStorage.setItem(STORAGE_MARKETS, JSON.stringify(config));
  } catch {}
}

// -------------------------------------------------------------
// Maya Rules Types and Storage
// -------------------------------------------------------------
export interface MayaRuleItem {
  id: string;
  category: 'Persona & Voice' | 'Privacy & Security' | 'Automation' | 'Custom';
  title: string;
  description: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface MayaRulesConfig {
  rules: MayaRuleItem[];
}

export const STORAGE_RULES = 'maya_rules_config_v1';

export const DEFAULT_RULES: MayaRuleItem[] = [
  {
    id: 'r-1',
    category: 'Persona & Voice',
    title: 'Always address Hunter warmly and respectfully',
    description: 'Use friendly, attentive phrasing and remember personal context across sessions.',
    enabled: true,
  },
  {
    id: 'r-2',
    category: 'Persona & Voice',
    title: 'Speak naturally in Hinglish or preferred language',
    description: 'Blend conversational Hindi and English without forced formal structures.',
    enabled: true,
  },
  {
    id: 'r-3',
    category: 'Persona & Voice',
    title: 'Keep voice answers concise (< 30 seconds)',
    description: 'Deliver punchy, direct voice answers unless explicitly asked for full explanation.',
    enabled: true,
  },
  {
    id: 'r-4',
    category: 'Privacy & Security',
    title: 'Never disclose personal contact info or address',
    description: 'Shield phone numbers, residential details, and API keys from external group chats.',
    enabled: true,
  },
  {
    id: 'r-5',
    category: 'Privacy & Security',
    title: 'Ask confirmation before sending outgoing emails or messages',
    description: 'Show preview draft modal before executing any external dispatch tool.',
    enabled: true,
  },
  {
    id: 'r-6',
    category: 'Privacy & Security',
    title: 'Incognito mode auto-clears conversation memory',
    description: 'When incognito is active, do not record or persist memories to local storage.',
    enabled: true,
  },
  {
    id: 'r-7',
    category: 'Automation',
    title: 'Never interrupt active phone calls with notifications',
    description: 'Silence background message and trigger chime alerts during active call state.',
    enabled: true,
  },
  {
    id: 'r-8',
    category: 'Automation',
    title: 'Generate daily work summary before 7:00 PM',
    description: 'Draft daily activity logs and compile WhatsApp report format automatically.',
    enabled: true,
  },
];

export function loadRulesConfig(): MayaRulesConfig {
  try {
    const raw = localStorage.getItem(STORAGE_RULES);
    if (!raw) return { rules: DEFAULT_RULES };
    return JSON.parse(raw);
  } catch {
    return { rules: DEFAULT_RULES };
  }
}

export function saveRulesConfig(config: MayaRulesConfig): void {
  try {
    localStorage.setItem(STORAGE_RULES, JSON.stringify(config));
  } catch {}
}

// -------------------------------------------------------------
// Website / Coding Types and Storage
// -------------------------------------------------------------
export interface MayaCodeProject {
  id: string;
  name: string;
  framework: string;
  description: string;
  lastModified: string;
  files: {
    name: string;
    code: string;
    language: string;
  }[];
}

export interface MayaWebsiteCodingConfig {
  activeProjectId: string;
  projects: MayaCodeProject[];
  devServerPort: number;
  isServerRunning: boolean;
}

export const STORAGE_WEBSITE_CODING = 'maya_website_coding_config_v1';

export const DEFAULT_WEBSITE_CODING_CONFIG: MayaWebsiteCodingConfig = {
  activeProjectId: 'proj-1',
  devServerPort: 3000,
  isServerRunning: true,
  projects: [
    {
      id: 'proj-1',
      name: 'portfolio-hunter-ai',
      framework: 'Vite + React + Tailwind',
      description: 'Personal AI showcase and interactive agent portfolio with dark theme.',
      lastModified: 'Modified 15m ago',
      files: [
        {
          name: 'App.tsx',
          language: 'typescript',
          code: `import React, { useState } from 'react';\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  return (\n    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">\n      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-xl">\n        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">\n          Maya Live Workspace\n        </span>\n        <h1 className="text-2xl font-bold">Hunter AI Portfolio</h1>\n        <p className="text-sm text-slate-400">Autonomous voice, vision & memory intelligence engine.</p>\n        <button\n          onClick={() => setCount((c) => c + 1)}\n          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95"\n        >\n          Interactive Counter: {count}\n        </button>\n      </div>\n    </main>\n  );\n}`,
        },
        {
          name: 'index.css',
          language: 'css',
          code: `@import "tailwindcss";\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n  background-color: #070b14;\n  color: #f8fafc;\n}`,
        },
        {
          name: 'types.ts',
          language: 'typescript',
          code: `export interface ProjectItem {\n  id: string;\n  title: string;\n  tech: string[];\n  stars: number;\n}`,
        },
      ],
    },
    {
      id: 'proj-2',
      name: 'whatsapp-automation-bot',
      framework: 'Node.js + Baileys / WhatsApp API',
      description: 'Auto-reply dispatcher for customer inquiries and lead sorting.',
      lastModified: 'Modified yesterday',
      files: [
        {
          name: 'bot.ts',
          language: 'typescript',
          code: `// WhatsApp Bot Entrypoint\nexport async function handleIncomingMessage(msg: any) {\n  console.log('Received:', msg.body);\n}`,
        },
      ],
    },
    {
      id: 'proj-3',
      name: 'market-ticker-widget',
      framework: 'React + D3 Charts',
      description: 'Real-time financial tickers with candlestick calculations.',
      lastModified: 'Modified 3 days ago',
      files: [
        {
          name: 'Ticker.tsx',
          language: 'typescript',
          code: `export const Ticker = () => <div>NIFTY 50: ₹24,852.15 (+0.58%)</div>;`,
        },
      ],
    },
  ],
};

export function loadWebsiteCodingConfig(): MayaWebsiteCodingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_WEBSITE_CODING);
    if (!raw) return DEFAULT_WEBSITE_CODING_CONFIG;
    return { ...DEFAULT_WEBSITE_CODING_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WEBSITE_CODING_CONFIG;
  }
}

export function saveWebsiteCodingConfig(config: MayaWebsiteCodingConfig): void {
  try {
    localStorage.setItem(STORAGE_WEBSITE_CODING, JSON.stringify(config));
  } catch {}
}

// -------------------------------------------------------------
// Whiteboard / Study Types and Storage
// -------------------------------------------------------------
export interface MayaWhiteboardNote {
  id: string;
  title: string;
  subject: string;
  diagramsCount: number;
  lastUpdated: string;
  dataUrl?: string;
  notesText: string;
}

export interface MayaWhiteboardConfig {
  activeNoteId: string;
  notes: MayaWhiteboardNote[];
}

export const STORAGE_WHITEBOARD = 'maya_whiteboard_config_v1';

export const DEFAULT_WHITEBOARD_CONFIG: MayaWhiteboardConfig = {
  activeNoteId: 'note-1',
  notes: [
    {
      id: 'note-1',
      title: 'Physics: Thermodynamics & Carnot Cycle',
      subject: 'Physics',
      diagramsCount: 4,
      lastUpdated: 'Edited 2h ago',
      notesText: 'ΔU = Q - W. The first law of thermodynamics is an adaptation of the law of conservation of energy.',
    },
    {
      id: 'note-2',
      title: 'React Architecture & State Lifecycle',
      subject: 'Computer Science',
      diagramsCount: 2,
      lastUpdated: 'Edited yesterday',
      notesText: 'Props flow downwards, state lives at common ancestors, callbacks bubble up with events.',
    },
    {
      id: 'note-3',
      title: 'Calculus: Integration by Parts Cheat Sheet',
      subject: 'Mathematics',
      diagramsCount: 6,
      lastUpdated: 'Edited 3 days ago',
      notesText: '∫ u dv = u v - ∫ v du. Choose u using LIATE: Logarithmic, Inverse trig, Algebraic, Trig, Exponential.',
    },
  ],
};

export function loadWhiteboardConfig(): MayaWhiteboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_WHITEBOARD);
    if (!raw) return DEFAULT_WHITEBOARD_CONFIG;
    return { ...DEFAULT_WHITEBOARD_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_WHITEBOARD_CONFIG;
  }
}

export function saveWhiteboardConfig(config: MayaWhiteboardConfig): void {
  try {
    localStorage.setItem(STORAGE_WHITEBOARD, JSON.stringify(config));
  } catch {}
}




