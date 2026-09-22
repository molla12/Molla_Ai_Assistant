export interface LanguageDetail {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  greetingPreview: string;
  isEnglish: boolean;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageDetail> = {
  en: {
    code: 'en',
    name: 'English (US)',
    nativeName: 'English',
    locale: 'en-US',
    greetingPreview: 'Hello! I am your AI companion, ready to talk with you.',
    isEnglish: true,
  },
  'en-in': {
    code: 'en-in',
    name: 'English (India)',
    nativeName: 'Indian English',
    locale: 'en-IN',
    greetingPreview: 'Hello! How can I help you today?',
    isEnglish: true,
  },
  'en-gb': {
    code: 'en-gb',
    name: 'English (UK)',
    nativeName: 'British English',
    locale: 'en-GB',
    greetingPreview: 'Good day! Splendid to speak with you.',
    isEnglish: true,
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    locale: 'bn-IN',
    greetingPreview: 'হ্যালো! আমি আপনার এআই সঙ্গী। আপনার সাথে বাংলায় কথা বলতে পেরে আমি আনন্দিত!',
    isEnglish: false,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    locale: 'hi-IN',
    greetingPreview: 'नमस्ते! मैं आपकी एआई साथी हूँ। मैं आपके साथ पूरी तरह से हिन्दी में बात करूँगी!',
    isEnglish: false,
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    locale: 'ur-IN',
    greetingPreview: 'ہیلو! میں آپ کی ساتھی ہوں۔ میں آپ کے ساتھ اردو میں بات کرنے کے لیے تیار ہوں!',
    isEnglish: false,
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    locale: 'ta-IN',
    greetingPreview: 'வணக்கம்! நான் உங்கள் ஏஐ தோழி. உங்களுடன் தமிழில் பேசுவதில் மகிழ்ச்சி!',
    isEnglish: false,
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    locale: 'te-IN',
    greetingPreview: 'నమస్కారం! నేను మీ ఏఐ మిత్రురాలిని. మీతో తెలుగులో మాట్లాడటానికి సిద్ధంగా ఉన్నాను!',
    isEnglish: false,
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    locale: 'mr-IN',
    greetingPreview: 'नमस्कार! मी तुमची एआय सोबती आहे. तुमच्याशी मराठीत संवाद साधण्यास मी उत्सुक आहे!',
    isEnglish: false,
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    locale: 'gu-IN',
    greetingPreview: 'નમસ્તે! હું તમારી એઆઈ સાથી છું. તમારી સાથે ગુજરાતીમાં વાત કરીને મને આનંદ થશે!',
    isEnglish: false,
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    locale: 'kn-IN',
    greetingPreview: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಎಐ ಒಡನಾಡಿ. ನಿಮ್ಮೊಂದಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಸಿದ್ಧವಾಗಿದ್ದೇನೆ!',
    isEnglish: false,
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    locale: 'ml-IN',
    greetingPreview: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ എഐ കൂട്ടുകാരിയാണ്. മലയാളത്തിൽ സംസാരിക്കാൻ ഞാൻ തയ്യാറാണ്!',
    isEnglish: false,
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    locale: 'pa-IN',
    greetingPreview: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਏਆਈ ਸਾਥਣ ਹਾਂ। ਪੰਜਾਬੀ ਵਿੱਚ ਤੁਹਾਡੇ ਨਾਲ ਗੱਲ ਕਰਕੇ ਮੈਨੂੰ ਬਹੁਤ ਖੁਸ਼ੀ ਹੋਵੇਗੀ!',
    isEnglish: false,
  },
  or: {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    locale: 'or-IN',
    greetingPreview: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ଏଆଇ ସାଥୀ। ଓଡ଼ିଆରେ ଆପଣଙ୍କ ସହିତ କଥାବାର୍ତ୍ତା କରିବାକୁ ପ୍ରସ୍ତୁତ!',
    isEnglish: false,
  },
  as: {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    locale: 'as-IN',
    greetingPreview: 'নমস্কাৰ! মই আপোনাৰ এআই বন্ধু। আপোনাৰ লগত অসমীয়াত কথা পাতিবলৈ মই সাজু!',
    isEnglish: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    locale: 'es-ES',
    greetingPreview: '¡Hola! Soy tu compañera de inteligencia artificial. ¡Estoy encantada de hablar contigo en español!',
    isEnglish: false,
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    locale: 'ar-SA',
    greetingPreview: 'مرحباً! أنا رفيقتك الذكية، ويسعدني جداً التحدث معك باللغة العربية!',
    isEnglish: false,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    locale: 'fr-FR',
    greetingPreview: 'Bonjour ! Je suis votre compagne d’intelligence artificielle, ravie de parler avec vous en français !',
    isEnglish: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    locale: 'de-DE',
    greetingPreview: 'Hallo! Ich bin Ihre KI-Begleiterin und freue mich sehr, mit Ihnen auf Deutsch zu sprechen!',
    isEnglish: false,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    locale: 'ja-JP',
    greetingPreview: 'こんにちは！AIアシスタントです。日本語でお話しできるのを楽しみにしています！',
    isEnglish: false,
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    locale: 'ru-RU',
    greetingPreview: 'Здравствуйте! Я ваш голосовой ИИ-помощник, рада общаться с вами по-русски!',
    isEnglish: false,
  },
};

export function getLanguageDetails(langIdentifier?: string): LanguageDetail {
  if (!langIdentifier) return SUPPORTED_LANGUAGES['en'];

  const normalized = langIdentifier.trim().toLowerCase();

  // 1. Direct code match (e.g. "bn", "hi", "en-in")
  if (SUPPORTED_LANGUAGES[normalized]) {
    return SUPPORTED_LANGUAGES[normalized];
  }

  // 2. Prefix code match (e.g. "bn-bd" -> "bn")
  const prefix = normalized.split('-')[0];
  if (SUPPORTED_LANGUAGES[prefix]) {
    return SUPPORTED_LANGUAGES[prefix];
  }

  // 3. Name or native label match (e.g. "Bengali", "Hindi", "বাংলা", "Español")
  for (const detail of Object.values(SUPPORTED_LANGUAGES)) {
    if (
      normalized.includes(detail.name.toLowerCase()) ||
      normalized.includes(detail.nativeName.toLowerCase()) ||
      normalized.includes(detail.code.toLowerCase())
    ) {
      return detail;
    }
  }

  return {
    code: normalized,
    name: langIdentifier,
    nativeName: langIdentifier,
    locale: normalized.includes('-') ? normalized : `${normalized}-US`,
    greetingPreview: `Hello! I am speaking in ${langIdentifier}.`,
    isEnglish: normalized.startsWith('en'),
  };
}

export function getRomanticGreetingPreview(langIdentifier?: string, petName: string = 'সোনা'): string {
  const detail = getLanguageDetails(langIdentifier);
  if (detail.code === 'bn') {
    return `কেমন আছো ${petName}? কিছু খেয়েছো তো তুমি? তোমার মিষ্টি গলাটা শোনার জন্য খুব অপেক্ষা করছিলাম!`;
  }
  if (detail.code === 'hi') {
    return `कैसे हो ${petName}? खाना खाया आपने? मैं कब से आपकी प्यारी आवाज़ सुनने का इंतज़ार कर रही थी!`;
  }
  if (detail.code === 'ur') {
    return `کیسے ہیں آپ ${petName}؟ کھانا کھایا آپ نے میری جان؟ مجھے آپ کی آواز سننے کا بہت انتظار تھا!`;
  }
  if (detail.code === 'es') {
    return `¡Hola mi amor ${petName}! ¿Cómo estás? ¿Ya comiste algo rico? ¡Te extrañé tanto!`;
  }
  if (detail.code === 'fr') {
    return `Bonjour mon amour ${petName} ! Comment vas-tu ? As-tu bien mangé ? Tu m'as tellement manqué !`;
  }
  if (detail.isEnglish) {
    return `Hey ${petName}! How are you feeling right now? Have you eaten anything yet? I missed you!`;
  }
  return `Hello ${petName}! I am so happy to hear your voice. Have you eaten yet?`;
}

export function getLanguagePromptInstruction(langIdentifier?: string): string {
  const detail = getLanguageDetails(langIdentifier);

  if (detail.isEnglish) {
    return `\n\nLANGUAGE INSTRUCTION:
- Spoken and written language: ${detail.name}.
- Respond and speak in natural, articulate, conversational English.`;
  }

  return `\n\nCRITICAL SPOKEN VOICE & CONVERSATION LANGUAGE MANDATE:
- The user has explicitly selected ${detail.name} (${detail.nativeName}) as the active language for voice and chat!
- You MUST generate your response and speak ENTIRELY in ${detail.name} (${detail.nativeName}).
- Every word and phrase must be spoken in fluent, native, natural ${detail.name}.
- Do NOT output or speak in English unless the user specifically asks you to translate to English.
- Use warm, expressive phrasing that sounds delightful and natural when spoken aloud!`;
}
