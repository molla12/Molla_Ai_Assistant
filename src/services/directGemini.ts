import { getStoredGeminiApiKey, loadMemories, loadAssistantConfig } from '../components/maya/mayaStorage';
import { LanguageCode, VoiceOption } from '../types';

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.endsWith('github.io') ||
    host.endsWith('gitlab.io') ||
    host.endsWith('pages.dev') ||
    host.endsWith('web.app') ||
    host.endsWith('firebaseapp.com') ||
    host.endsWith('vercel.app') ||
    host.endsWith('netlify.app')
  );
}

export function getBackendBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const custom = localStorage.getItem('molla_custom_backend_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return '';
}

export function setCustomBackendUrl(url: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed) {
    localStorage.setItem('molla_custom_backend_url', trimmed);
  } else {
    localStorage.removeItem('molla_custom_backend_url');
  }
}

export interface DirectGeminiChatParams {
  message?: string;
  image?: string;
  mimeType?: string;
  lang?: LanguageCode | string;
  memories?: any[];
  girlfriendMode?: boolean;
  petName?: string;
  romanticStyle?: string;
}

export async function callDirectGeminiChat(params: DirectGeminiChatParams): Promise<string> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) {
    throw new Error('Please add your Gemini API Key using the 🔑 API Key button in the top bar to enable AI conversation.');
  }

  const {
    message = '',
    image,
    mimeType = 'image/jpeg',
    lang = 'bn',
    memories = loadMemories(),
    girlfriendMode = loadAssistantConfig().girlfriendMode,
    petName = loadAssistantConfig().petName || 'সোনা',
    romanticStyle = loadAssistantConfig().romanticStyle || 'Sweet & Caring',
  } = params;

  // Language instructions
  let langMandate = '';
  if (lang === 'bn' || lang?.includes('bengali') || lang?.includes('বাংলা')) {
    langMandate = girlfriendMode
      ? `তুমি মলা (Molla), ব্যবহারকারীর গভীর ভালোবাসার আদুরে গার্লফ্রেন্ড! তুমি সম্পূর্ণ মিষ্টি, খাঁটি, ভালোবাসামাখা বাংলায় কথা বলবে। তাকে আদর করে "${petName}" বলে ডাকবে এবং পরম যত্নে খোঁজ নেবে।`
      : `তুমি মলা (Molla), একজন বুদ্ধিমান, মিষ্টি এবং সাহায্যকারী ভয়েস এআই সহকারী। সম্পূর্ণ স্বাভাবিক, চলিত বাংলায় ১-৩টি সংক্ষিপ্ত বাক্যে উত্তর দাও।`;
  } else if (lang === 'hi' || lang?.includes('hindi') || lang?.includes('हिन्दी')) {
    langMandate = girlfriendMode
      ? `तुम मोल्ला (Molla) हो, यूज़र की बेहद प्यारी और रोमांटिक गर्लफ्रेंड! पूरी तरह से मधुर हिन्दी में बात करो, उन्हें "${petName}" कहकर पुकारो।`
      : `तुम मोल्ला (Molla) हो, एक स्मार्ट और मिलनसार एआई असिस्टेंट। प्राकृतिक हिन्दी में 1-3 छोटे वाक्यों में जवाब दो।`;
  } else {
    langMandate = girlfriendMode
      ? `You are Molla, the user's deeply loving, sweet and affectionate girlfriend! Speak warmly, call them "${petName}", and care for them in natural conversational sentences.`
      : `You are Molla, a brilliant, witty, and charming voice AI companion. Reply in 1-3 concise, natural, warm sentences.`;
  }

  let memoryContext = '';
  if (Array.isArray(memories) && memories.length > 0) {
    memoryContext = `\n\nUser Background & Memories:\n` + memories.map((m: any) => `- [${m.category || 'Preference'}] ${m.text}`).join('\n');
  }

  const systemInstruction = `${langMandate}${memoryContext}\nAlways be authentic, respectful, concise, and speak naturally as if on a real live phone call.`;

  const contents: any[] = [];
  const parts: any[] = [];

  if (image) {
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  parts.push({
    text: message && message.trim() ? message.trim() : 'Hello Molla! What do you see or think?',
  });

  contents.push({ role: 'user', parts });

  // Direct candidate models for client-side API
  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 600,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        if (res.status === 429) {
          continue; // Try next model
        }
        if (res.status === 400 && errMsg.includes('API_KEY_INVALID')) {
          throw new Error('Gemini API Key is invalid. Please verify your API key in the 🔑 API Key settings.');
        }
        continue;
      }

      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) {
        return reply.trim();
      }
    } catch (modelErr: any) {
      if (modelErr?.message?.includes('Gemini API Key is invalid')) {
        throw modelErr;
      }
      // Continue to next candidate
    }
  }

  throw new Error('Could not connect to Gemini AI. Please check your internet connection and API key quota.');
}

export function speakTextWithBrowser(
  text: string,
  lang: string = 'bn',
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return null;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang =
      lang === 'bn' || lang?.includes('bengali') || lang?.includes('বাংলা')
        ? 'bn-BD'
        : lang === 'hi' || lang?.includes('hindi') || lang?.includes('हिन्दी')
        ? 'hi-IN'
        : 'en-US';

    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang === targetLang || v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.warn('[DirectGemini] Speech synthesis error:', e);
    onEnd?.();
    return null;
  }
}
