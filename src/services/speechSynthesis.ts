import { VoiceOption } from '../types';

export interface SpeakMollaOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  voice?: VoiceOption;
  gender?: 'female' | 'male';
}

const FEMALE_VOICE_KEYWORDS = [
  'female',
  'woman',
  'girl',
  'zira',
  'samantha',
  'victoria',
  'karen',
  'lekha',
  'kalpana',
  'geeta',
  'shruti',
  'anjali',
  'priya',
  'neerja',
  'tessa',
  'fiona',
  'moira',
  'swara',
  'maya',
  'aditi',
];

const MALE_VOICE_KEYWORDS = [
  'male',
  'man',
  'boy',
  'david',
  'mark',
  'george',
  'rishi',
  'anil',
  'prabhat',
  'hemant',
  'madhav',
  'guy',
];

// Web Speech Synthesis service for speaking out Molla's replies with strict gender accuracy
export function speakMollaReply(
  text: string,
  lang: string = 'en',
  options?: SpeakMollaOptions
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean text of markdown formatting so speech flows naturally
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Determine target gender (Default is ALWAYS female: Female Voice)
    const isExplicitMale =
      options?.voice === 'Fenrir' ||
      options?.voice === 'Puck' ||
      options?.gender === 'male';
    const isFemale = !isExplicitMale;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.toLowerCase().split('-')[0];

    // Filter voices matching the requested language
    const langVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isFemale) {
      // 1. Look for a voice with explicit female indicator in the current language
      selectedVoice = langVoices.find((v) => {
        const vName = v.name.toLowerCase();
        const hasFemale = FEMALE_VOICE_KEYWORDS.some((kw) => vName.includes(kw));
        const hasMale = MALE_VOICE_KEYWORDS.some((kw) => vName.includes(kw));
        return hasFemale && !hasMale;
      });

      // 2. If not found, pick any language voice that does NOT say "male"
      if (!selectedVoice && langVoices.length > 0) {
        selectedVoice = langVoices.find(
          (v) => !MALE_VOICE_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw))
        );
      }

      // 3. Fallback to first language voice or default
      if (!selectedVoice && langVoices.length > 0) {
        selectedVoice = langVoices[0];
      }

      if (!selectedVoice) {
        selectedVoice =
          voices.find((v) =>
            FEMALE_VOICE_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw))
          ) || voices[0];
      }

      // Elevated pitch and lively rate for sweet feminine tone
      utterance.pitch = 1.32;
      utterance.rate = 1.04;
    } else {
      // MALE VOICE: 'Fenrir' / 'Puck' (Male Voice)
      selectedVoice = langVoices.find((v) => {
        const vName = v.name.toLowerCase();
        return MALE_VOICE_KEYWORDS.some((kw) => vName.includes(kw));
      });

      if (!selectedVoice && langVoices.length > 0) {
        selectedVoice = langVoices[0];
      }

      if (!selectedVoice) {
        selectedVoice =
          voices.find((v) =>
            MALE_VOICE_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw))
          ) || voices[0];
      }

      // Deep, clear, masculine pitch
      utterance.pitch = 0.82;
      utterance.rate = 0.98;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    const langTagMap: Record<string, string> = {
      bn: 'bn-IN',
      hi: 'hi-IN',
      'en-in': 'en-IN',
      en: 'en-US',
      'en-gb': 'en-GB',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      or: 'or-IN',
      as: 'as-IN',
      ur: 'ur-IN',
    };
    utterance.lang = langTagMap[lang] || (lang.includes('-') ? lang : `${lang}-IN`);

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('[SpeechSynthesis] Failed to speak:', err);
    options?.onEnd?.();
    return false;
  }
}

export function stopMollaSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
