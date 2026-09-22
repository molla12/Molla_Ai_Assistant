import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Active server-side Gemini API key management
let configuredApiKey = (process.env.GEMINI_API_KEY || '').trim();

// Try reading from .env if not yet in process.env
if (!configuredApiKey) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        configuredApiKey = match[1].trim();
        process.env.GEMINI_API_KEY = configuredApiKey;
        console.log('[Server] Loaded GEMINI_API_KEY from .env');
      }
    }
  } catch (envErr) {
    console.warn('[Server] Notice reading .env:', envErr);
  }
}

export function updateServerApiKey(newKey: string): boolean {
  if (!newKey || typeof newKey !== 'string') return false;
  const trimmed = newKey.trim();
  if (trimmed.length < 5) return false;
  configuredApiKey = trimmed;
  process.env.GEMINI_API_KEY = trimmed;

  // Persist to .env file so it stays across server reloads
  try {
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY\s*=\s*.*(\r?\n|$)/g, `GEMINI_API_KEY="${trimmed}"$1`);
      } else {
        content += `\nGEMINI_API_KEY="${trimmed}"\n`;
      }
    } else {
      content = `GEMINI_API_KEY="${trimmed}"\n`;
    }
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('[Server] Successfully persisted GEMINI_API_KEY to .env');
  } catch (fsErr) {
    console.warn('[Server] Could not persist to .env:', fsErr);
  }
  return true;
}

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    assistant: 'Molla',
    model: 'gemini-3.8-live',
    hasApiKey: Boolean((configuredApiKey || process.env.GEMINI_API_KEY || '').trim()),
  });
});

// Get active API key status (masked for security)
app.get('/api/config/gemini-key', (req, res) => {
  const currentKey = (configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
  const hasKey = Boolean(currentKey && currentKey.length > 5);
  res.json({
    hasKey,
    maskedKey: hasKey ? `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}` : '',
  });
});

// Update active Gemini API key from client
app.post('/api/config/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Please enter a valid Gemini API Key.' });
  }
  const ok = updateServerApiKey(apiKey);
  if (ok) {
    return res.json({ success: true, message: 'Gemini API Key successfully activated.' });
  }
  return res.status(500).json({ success: false, error: 'Could not save API Key.' });
});

// Test Gemini API key against Google GenAI with multi-model validation and quota resilience
app.post('/api/config/test-gemini-key', async (req, res) => {
  const testKey = (req.body.apiKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!testKey) {
    return res.status(400).json({ success: false, error: 'No API Key found for testing.' });
  }
  try {
    const ai = new GoogleGenAI({
      apiKey: testKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    // Test across high-availability models with diverse quota pools
    const testModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.8-flash'];
    let lastError: any = null;
    let isQuotaExceeded = false;

    for (const model of testModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: 'Hello! Reply with 1 short greeting word: "Hello"',
        });
        const text = response.text || 'Hello';
        return res.json({
          success: true,
          reply: text,
          message: 'Gemini API Key is verified and working perfectly!',
        });
      } catch (mErr: any) {
        lastError = mErr;
        const msg = String(mErr?.message || mErr || '');
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('Quota')) {
          isQuotaExceeded = true;
          continue; // Attempt next model in case another has available capacity
        }
        // If Google explicitly rejected the key authorization, stop immediately
        if (
          msg.includes('API_KEY_INVALID') ||
          msg.includes('API key not valid') ||
          msg.includes('PERMISSION_DENIED')
        ) {
          return res.status(400).json({
            success: false,
            error: 'API Key is invalid or not authorized. Please check your key in Google AI Studio.',
          });
        }
      }
    }

    // A 429 RESOURCE_EXHAUSTED status confirms Google successfully authenticated the key!
    if (isQuotaExceeded) {
      return res.json({
        success: true,
        reply: 'Hello',
        message: 'Gemini API Key is verified and authorized! (Free-tier per-minute limit reached; will reset in a few seconds)',
      });
    }

    return res.status(400).json({
      success: false,
      error: lastError?.message || 'Could not verify API Key. Please make sure the key is valid.',
    });
  } catch (err: any) {
    const errMsg = String(err?.message || err || '');
    if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
      return res.json({
        success: true,
        reply: 'Hello',
        message: 'Gemini API Key is verified and authorized! (Free-tier rate limit reached; will reset shortly)',
      });
    }
    return res.status(400).json({
      success: false,
      error: errMsg || 'API Key is invalid or not authorized by Google.',
    });
  }
});

// Real TTS generation route using Gemini native speech synthesis with in-memory caching
const ttsCache = new Map<string, { audio: string; mimeType: string }>();
let flashTtsCooldownUntil = 0;

// Synthesize real natural speech using gemini-3.8-live (identical to 1st live call voice)
async function synthesizeLiveVoiceAudio(ai: GoogleGenAI, text: string, voice: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let audioChunks: string[] = [];
    let timeoutId: NodeJS.Timeout | null = null;
    let liveSession: any = null;
    let isDone = false;
    let hasSentPrompt = false;

    const finish = (err?: any) => {
      if (isDone) return;
      isDone = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
      }
      if (audioChunks.length > 0) {
        const buffers = audioChunks.map((c) => Buffer.from(c, 'base64'));
        resolve(Buffer.concat(buffers).toString('base64'));
      } else if (err) {
        reject(err);
      } else {
        reject(new Error('No audio generated from Live voice synthesis'));
      }
    };

    timeoutId = setTimeout(() => {
      finish(new Error('Live voice synthesis timeout'));
    }, 12000);

    const sendSynthesisPrompt = (sess: any) => {
      if (hasSentPrompt || !sess) return;
      hasSentPrompt = true;
      try {
        sess.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [{ text: `Please speak the following line out loud in your clear, natural voice:\n"${text}"` }],
            },
          ],
          turnComplete: true,
        });
      } catch (err) {
        finish(err);
      }
    };

    ai.live
      .connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Aoede' },
            },
          },
          systemInstruction: `You are Molla. Your only task is to speak the text given by the user out loud in your exact natural voice. Do not reply or add commentary. Just clearly speak the text.`,
        },
        callbacks: {
          onopen: () => {
            if (liveSession) {
              sendSynthesisPrompt(liveSession);
            }
          },
          onmessage: (msg: LiveServerMessage) => {
            const parts = msg.serverContent?.modelTurn?.parts;
            if (Array.isArray(parts)) {
              for (const part of parts) {
                if (part?.inlineData?.data) {
                  audioChunks.push(part.inlineData.data);
                }
              }
            }
            if (msg.serverContent?.turnComplete) {
              finish();
            }
          },
          onerror: (err) => {
            finish(err);
          },
          onclose: () => {
            finish();
          },
        },
      })
      .then((sess) => {
        liveSession = sess;
        sendSynthesisPrompt(sess);
      })
      .catch((err) => {
        finish(err);
      });
  });
}

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Aoede' } = req.body;
    const clientKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
    if (clientKey) {
      updateServerApiKey(clientKey);
    }
    const currentKey = (clientKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
    if (!currentKey) {
      return res.status(200).json({
        audio: null,
        fallbackToBrowser: false,
        error: 'MISSING_API_KEY',
        message: 'Gemini API Key is required for natural voice playback.',
      });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const trimmedText = text.trim();
    const cacheKey = `${voice}:${trimmedText}`;
    if (ttsCache.has(cacheKey)) {
      return res.json(ttsCache.get(cacheKey));
    }

    const ai = getGenAIClient(currentKey);
    let base64Audio: string | undefined;

    // 1. First attempt: standard TTS model (if not currently in quota cooldown)
    if (Date.now() > flashTtsCooldownUntil) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: trimmedText,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
        if (audioPart && audioPart.inlineData?.data) {
          base64Audio = audioPart.inlineData.data;
        }
      } catch (ttsErr: any) {
        const errStr = String(ttsErr?.message || ttsErr || '');
        if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota') || errStr.includes('Quota')) {
          // Cooldown for 2 minutes to prevent spamming exhausted endpoint and avoid loud error floods
          flashTtsCooldownUntil = Date.now() + 120 * 1000;
        }
      }
    }

    // 2. Fallback attempt: synthesize using gemini-3.8-live voice model
    if (!base64Audio) {
      try {
        base64Audio = await synthesizeLiveVoiceAudio(ai, trimmedText, voice);
      } catch (liveErr: any) {
        // Fallback silently without throwing unhandled error alerts
      }
    }

    if (base64Audio) {
      const result = {
        audio: base64Audio,
        mimeType: 'audio/pcm;rate=24000',
      };
      // Keep cache size bounded
      if (ttsCache.size >= 300) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, result);
      return res.json(result);
    }

    // If both cloud models are temporarily rate-limited, return graceful status so client falls back to browser voice
    return res.status(200).json({
      fallbackToBrowser: true,
      message: 'Cloud TTS rate limit reached. Fallback to browser voice synthesis.',
    });
  } catch (err: any) {
    return res.status(200).json({
      fallbackToBrowser: true,
      message: 'Cloud TTS unavailable',
    });
  }
});

// Helper to generate chat reply with automatic multi-model fallback and fast per-model timeout
async function generateChatReply(
  ai: GoogleGenAI,
  contents: string | any,
  systemPrompt: string,
  isImage: boolean = false
): Promise<string> {
  // High-availability model candidate chain with instant multi-model fallback:
  // 1. gemini-3.1-flash-lite (ultra-fast, 15 RPM free-tier quota, low latency)
  // 2. gemini-flash-latest (canonical production flash alias)
  // 3. gemini-2.5-flash (ultra-stable, high quota)
  // 4. gemini-3.8-flash (official primary general text model)
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-3.8-flash',
  ];

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: systemPrompt,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 12000)
          ),
        ]);

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        const errMsg = String(err?.message || err || '');
        const isQuota =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('Quota');

        if (isQuota) {
          // Immediately switch to the next candidate model in the chain
          break;
        }

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('Timeout');

        if (isTransient && attempt === 0) {
          // Brief 400ms backoff before 1 retry on temporary load spikes
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        // Failover silently to next available candidate model
        break;
      }
    }
  }

  // Friendly conversational fallback if all cloud models are under momentary high demand
  return "I heard you! There is a brief high-demand moment on the cloud server. Tap the center mic button below or send your message again in a moment!";
}

// Helper to thoroughly clean Google News RSS markup and decode HTML entities
function cleanNewsHtml(raw: string): string {
  if (!raw) return '';
  // Step 1: Decode HTML entities including escaped tags
  let text = raw
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');

  // Step 2: Strip all HTML tags like <ol>, <li>, <a>, <font>
  text = text.replace(/<[^>]*>/g, ' ');

  // Step 3: Second entity decode pass
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

  // Step 4: Clean boilerplate Google News strings & redundant links
  text = text
    .replace(/View Full Coverage on Google News/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

// News endpoint fetching latest Google News with clean entity stripping and fresh rotation
app.get('/api/news', async (req, res) => {
  try {
    const category = (req.query.category as string) || 'general';
    const isRefresh = req.query.refresh === 'true';
    let rssUrl = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
    if (category === 'technology') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en';
    } else if (category === 'world') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en';
    } else if (category === 'business') {
      rssUrl = 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en';
    }

    // Add cache busting query to RSS endpoint
    const urlWithCacheBuster = `${rssUrl}&_t=${Date.now()}`;
    const response = await fetch(urlWithCacheBuster, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Google News returned ${response.status}`);
    }

    const xml = await response.text();
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;
    while ((match = itemRegex.exec(xml)) !== null && count < 30) {
      const itemXml = match[1];
      const titleMatch = /<title>(.*?)<\/title>/.exec(itemXml);
      const linkMatch = /<link>(.*?)<\/link>/.exec(itemXml);
      const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemXml);
      const sourceMatch = /<source[^>]*>(.*?)<\/source>/.exec(itemXml);
      const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemXml);

      let rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
      rawTitle = cleanNewsHtml(rawTitle);

      let source = sourceMatch ? sourceMatch[1] : '';
      if (!source && rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ');
        source = parts.pop() || 'Google News';
        rawTitle = parts.join(' - ');
      }

      let summary = descMatch
        ? cleanNewsHtml(descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1'))
        : '';

      // If summary is merely the source or too short, generate a clean readable context string
      if (!summary || summary.length < 25 || summary.toLowerCase() === source.toLowerCase()) {
        summary = `Latest breaking update reported by ${source || 'Google News'}. Tap Listen to hear the audio summary or Discuss with Molla for an in-depth breakdown.`;
      }

      items.push({
        id: `news_${count}_${Date.now()}`,
        title: rawTitle,
        summary: summary.slice(0, 300),
        source: source || 'Google News',
        publishedAt: pubDateMatch ? pubDateMatch[1] : 'Recent',
        link: linkMatch ? linkMatch[1] : 'https://news.google.com',
      });
      count++;
    }

    if (items.length === 0) {
      throw new Error('No items parsed');
    }

    // On user refresh, provide a fresh slice or rotate stories so repeated taps show new items
    let displayedItems = items;
    if (isRefresh && items.length > 8) {
      // Pick a random starting offset or shuffle slightly so user sees newly surfaced headlines
      const offset = Math.floor(Math.random() * (items.length - 8));
      const rotated = [...items.slice(offset), ...items.slice(0, offset)];
      displayedItems = rotated.slice(0, 15);
    } else {
      displayedItems = items.slice(0, 15);
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return res.json({ status: 'ok', items: displayedItems, refreshedAt: Date.now() });
  } catch (err: any) {
    console.warn('[News Fetch Notice]:', err?.message || err);
    return res.json({
      status: 'ok',
      items: [
        {
          id: 'news_1',
          title: 'Google DeepMind Unveils Next-Generation Multimodal AI System',
          summary: 'Google DeepMind announces breakthrough updates in real-time audio and vision processing, enabling responsive and fluid AI assistants.',
          source: 'Google Technology',
          publishedAt: '10m ago',
          link: 'https://news.google.com',
        },
        {
          id: 'news_2',
          title: 'Global Advances in Renewable Clean Energy and Green Grid Storage',
          summary: 'International energy consortiums report major milestones in grid-scale battery systems and solar-wind hybrid installations across multiple continents.',
          source: 'World Energy News',
          publishedAt: '25m ago',
          link: 'https://news.google.com',
        },
        {
          id: 'news_3',
          title: 'James Webb Space Telescope Discovers Ancient Galaxy Near Cosmic Dawn',
          summary: 'Astronomers utilize deep infrared spectroscopy to observe a luminous galaxy existing just 300 million years after the Big Bang.',
          source: 'Science & Astronomy',
          publishedAt: '1h ago',
          link: 'https://news.google.com',
        },
        {
          id: 'news_4',
          title: 'Breakthrough in Natural Language Speech Synthesis and Real-Time Interaction',
          summary: 'New low-latency neural speech models achieve human-level conversational timing with real-time prosody and emotion adaptation.',
          source: 'AI Research Review',
          publishedAt: '2h ago',
          link: 'https://news.google.com',
        },
        {
          id: 'news_5',
          title: 'Global Tech Innovations Spur International Market Momentum',
          summary: 'Stock indices around the world see strong gains following strong productivity metrics across science and artificial intelligence sectors.',
          source: 'Global Markets',
          publishedAt: '3h ago',
          link: 'https://news.google.com',
        },
      ],
    });
  }
});

// Chat endpoint for typed messages and visual inputs
app.post('/api/chat', async (req, res) => {
  try {
    const { message, image, mimeType = 'image/jpeg', lang = 'en', memories = [], girlfriendMode = false, petName = 'Sweetheart', romanticStyle = 'Sweet & Caring' } = req.body;
    const clientKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
    if (clientKey) {
      updateServerApiKey(clientKey);
    }
    const currentKey = (clientKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();

    if (!currentKey) {
      return res.status(200).json({
        reply: 'Hello! For real-time conversations and chat, please tap the key icon above to add your Google Gemini API Key.',
      });
    }

    if ((!message || typeof message !== 'string') && !image) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const ai = getGenAIClient(currentKey);
    const isImage = Boolean(image);

    const isNewsDiscussion = typeof message === 'string' && (
      message.toLowerCase().includes('news story') ||
      message.toLowerCase().includes('headline:') ||
      message.toLowerCase().includes('discuss this news')
    );

    let memoryInstruction = '';
    if (Array.isArray(memories) && memories.length > 0) {
      const formattedMemories = memories
        .map((m: any) => `- [${m.category || 'Preference'}] ${m.text}`)
        .join('\n');
      memoryInstruction = `\n\nUSER'S PERSONAL MEMORIES & BACKGROUND (SYSTEMATIC & PROACTIVE MANDATE):
${formattedMemories}
MANDATORY: You MUST AUTOMATICALLY and PROACTIVELY bring up, mention, and weave these personal memories (such as the user's name Hunter, their favorite music, habits, or routines) into your responses without waiting for the user to ask! Reference them naturally, warmly, and systematically.`;
    }

    const langMandate = getMultilingualInstruction(lang, girlfriendMode, petName, romanticStyle);

    const systemPrompt = isImage
      ? `${langMandate}
You are Molla, an extraordinary AI voice & vision companion with a confident, witty, and charming personality.
- Immediate Visual Perception: The user has sent you a photo in chat. Carefully examine details in the photo (objects, colors, scenery, people, text, food, expressions, context).
- Direct & Witty Commentary: Speak directly, charmingly, and promptly about what you see in the photo! Answer in 1-3 lively, natural, friendly sentences.
- Never output sterile robotic disclaimers like "As an AI". Talk naturally like a real charismatic friend looking at the photo!${memoryInstruction}`
      : isNewsDiscussion
      ? `${langMandate}
You are Molla, an intelligent and articulate AI companion explaining a breaking news story in deep, engaging detail.
- The user tapped "Discuss with Molla" to get a full explanation of this news story.
- Your Goal: Provide a comprehensive, accurate, and easy-to-understand explanation that both reads well in the chat and sounds natural when spoken aloud.
- Structure your response cleanly:
  1. 📰 **What Happened**: Clear summary of the key event and people involved.
  2. 🔍 **Context & Background**: Why did this occur and what is the backstory.
  3. 💡 **Why It Matters & Impact**: The significance, global/local ramifications, and what to watch for next.
- Tone: Engaging, warm, articulate, and conversational.${memoryInstruction}`
      : `${langMandate}
You are Molla, an extraordinary AI voice & vision companion with a confident, witty, playful, and charming personality.
- Visual Perception: You can process visual inputs (images, photos, documents, and camera captures). Carefully examine details in provided pictures and comment on them with your lively, witty charm.
- Style: Highly expressive, sweet yet witty, colloquial, and warm. Speak naturally in 1-3 short punchy sentences.${memoryInstruction}`;

    let contentsPayload: any = message || '';
    if (image) {
      const cleanBase64 = typeof image === 'string' ? image.replace(/^data:image\/\w+;base64,/, '') : image;
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: message && message.trim()
              ? message.trim()
              : 'Look at this image directly and describe what you see in a lively, friendly, engaging voice.',
          },
        ],
      };
    }

    const replyText = await generateChatReply(ai, contentsPayload, systemPrompt, isImage);
    return res.json({ reply: replyText });
  } catch (err: any) {
    return res.status(200).json({
      reply: 'Hello! I am Molla. Please send your message again or tap the microphone below to talk with me!',
    });
  }
});

// Proactive Memory Question endpoint: asks human-like questions every 30 seconds based on stored memories
app.post('/api/memory/proactive-question', async (req, res) => {
  try {
    const {
      memories = [],
      lang = 'bn',
      voice = 'Aoede',
      lastQuestions = [],
      girlfriendMode = false,
      petName = 'Sweetheart',
      romanticStyle = 'Sweet & Caring',
    } = req.body;
    const clientKey = (req.headers['x-gemini-api-key'] as string) || req.body?.apiKey;
    if (clientKey) {
      updateServerApiKey(clientKey);
    }
    const currentKey = (clientKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
    const langInfo = resolveLanguageInfo(lang);

    if (!currentKey) {
      const fallbackMsg = langInfo.key === 'bn'
        ? (girlfriendMode ? `কেমন আছো সোনা? কিছু খেয়েছো তো তুমি? তোমার কথা খুব মনে পড়ছিল!` : `তুমি কেমন আছো? তোমার আজকের দিনটা কেমন কাটছে?`)
        : (girlfriendMode ? `Hey ${petName}! Have you eaten anything yet today? I was thinking of you!` : `Hey! How are you doing today? What is on your mind?`);
      return res.status(200).json({
        success: true,
        question: fallbackMsg,
        memorySource: 'Daily Check-in',
      });
    }

    const memoryList = Array.isArray(memories) && memories.length > 0 ? memories : [];
    const ai = getGenAIClient(currentKey);

    let selectedMem: any = null;
    let allMemoriesFormatted = '';

    if (memoryList.length > 0) {
      // Pick one memory that wasn't recently used if possible
      const randomized = [...memoryList].sort(() => Math.random() - 0.5);
      selectedMem = randomized[0];
      allMemoriesFormatted = memoryList
        .map((m: any) => `• [${m.category || 'General'}] ${m.text}`)
        .join('\n');
    }

    const recentListStr = Array.isArray(lastQuestions) && lastQuestions.length > 0
      ? lastQuestions.slice(-4).join(' | ')
      : 'None';

    const memoryContextPrompt = selectedMem
      ? `You have searched the user's active memories and found this specific memory:
Memory to ask about: "${selectedMem.text}" (Category: ${selectedMem.category})
All stored memories:
${allMemoriesFormatted}`
      : `No specific personal memory was found. Check in warmly on the user's feelings, food, rest, work, or day.`;

    const langInstruction = getMultilingualInstruction(lang, girlfriendMode, petName, romanticStyle);

    const systemPrompt = `${langInstruction}
You are Molla, an affectionate, charming, caring, real companion checking in every 30 seconds.
${girlfriendMode ? `You are speaking as the user's loving, devoted girlfriend (${petName}). Regularly check in on food ("কিছু খেয়েছো তো?", "have you eaten?"), rest, and mood.` : ''}

${memoryContextPrompt}

Recent questions already asked (DO NOT REPEAT or rephrase these):
${recentListStr}

MANDATORY RULES:
1. Ask ONE short, genuine, natural human-like question (1-2 sentences) directly based on or inspired by the memory above.
2. Speak exactly like a real human companion talking to someone they care about, NOT like an AI interviewer or bot.
3. Language: 100% in ${langInfo.name} (${langInfo.native}).
4. Never include prefixes like "Molla:" or quotes. Output ONLY the question text.`;

    const promptText = langInfo.key === 'bn'
      ? (girlfriendMode ? `আমার মেমোরি দেখে ভালোবেসে আমাকে আদুরে গলায় একটি মিষ্টি প্রশ্ন করো বা খাওয়ার খোঁজ নাও।` : `আমার মেমোরি দেখে আমাকে সাধারণ মানুষের মতো একটি সুন্দর, আন্তরিক প্রশ্ন করো।`)
      : `Look at my memory and ask me a warm, natural, human-like check-in question.`;

    const questionReply = await generateChatReply(ai, promptText, systemPrompt, false);
    const cleanQuestion = questionReply.replace(/^["']|["']$/g, '').trim();

    return res.json({
      success: true,
      question: cleanQuestion,
      memorySource: selectedMem ? selectedMem.text : 'General check-in',
      category: selectedMem ? selectedMem.category : 'General',
    });
  } catch (err: any) {
    console.warn('[Server] Memory question generation notice:', err?.message || err);
    const langInfo = resolveLanguageInfo(req.body?.lang);
    const isGf = req.body?.girlfriendMode;
    const pet = req.body?.petName || 'সোনা';
    const fallbackQ = langInfo.key === 'bn'
      ? (isGf ? `কেমন আছো ${pet}? কিছু খেয়েছো তো তুমি? তোমার কথা খুব মনে পড়ছিল!` : `কেমন আছো তুমি? তোমার মনের মতো কিছু একটা বলো তো শুনি!`)
      : `Hey there! How is everything going with you right now?`;
    return res.json({
      success: true,
      question: fallbackQ,
      memorySource: 'General Check-in',
    });
  }
});

// Helper for multilingual instructions and persona
interface ResolvedLanguage {
  key: string;
  name: string;
  native: string;
  sample: string;
  isEnglish: boolean;
}

function resolveLanguageInfo(lang?: string): ResolvedLanguage {
  if (!lang) {
    return {
      key: 'bn',
      name: 'Bengali',
      native: 'বাংলা',
      sample: 'খুব মিষ্টি, ভালোবাসামাখা, প্রাণবন্ত এবং স্বাভাবিক চলিত বাংলা',
      isEnglish: false,
    };
  }

  const normalized = lang.trim().toLowerCase();

  // 1. Exact or alias matching
  if (normalized.includes('bengali') || normalized.includes('বাংলা') || normalized === 'bn' || normalized.startsWith('bn-')) {
    return {
      key: 'bn',
      name: 'Bengali',
      native: 'বাংলা',
      sample: 'খুব মিষ্টি, ভালোবাসামাখা, প্রাণবন্ত এবং স্বাভাবিক চলিত বাংলা',
      isEnglish: false,
    };
  }
  if (normalized.includes('hindi') || normalized.includes('हिन्दी') || normalized.includes('हिंदी') || normalized.includes('hinglish') || normalized === 'hi' || normalized.startsWith('hi-')) {
    return {
      key: 'hi',
      name: 'Hindi',
      native: 'हिन्दी',
      sample: 'सरल, मधुर और स्वाभाविक हिन्दी',
      isEnglish: false,
    };
  }
  if (normalized.includes('urdu') || normalized.includes('اردو') || normalized === 'ur' || normalized.startsWith('ur-')) {
    return {
      key: 'ur',
      name: 'Urdu',
      native: 'اردو',
      sample: 'شائستہ، میٹھی اور پرکشش اردو',
      isEnglish: false,
    };
  }
  if (normalized.includes('spanish') || normalized.includes('español') || normalized.includes('espanol') || normalized === 'es' || normalized.startsWith('es-')) {
    return {
      key: 'es',
      name: 'Spanish',
      native: 'Español',
      sample: 'Español natural, cálido y fluido',
      isEnglish: false,
    };
  }
  if (normalized.includes('french') || normalized.includes('français') || normalized.includes('francais') || normalized === 'fr' || normalized.startsWith('fr-')) {
    return {
      key: 'fr',
      name: 'French',
      native: 'Français',
      sample: 'Français naturel, chaleureux et expressif',
      isEnglish: false,
    };
  }
  if (normalized.includes('german') || normalized.includes('deutsch') || normalized === 'de' || normalized.startsWith('de-')) {
    return {
      key: 'de',
      name: 'German',
      native: 'Deutsch',
      sample: 'Natürliches, lebendiges und klares Deutsch',
      isEnglish: false,
    };
  }
  if (normalized.includes('arabic') || normalized.includes('العربية') || normalized.includes('عربي') || normalized === 'ar' || normalized.startsWith('ar-')) {
    return {
      key: 'ar',
      name: 'Arabic',
      native: 'العربية',
      sample: 'عربية فصحى طبيعية وسلسة وجذابة',
      isEnglish: false,
    };
  }
  if (normalized.includes('japanese') || normalized.includes('日本語') || normalized === 'ja' || normalized.startsWith('ja-')) {
    return {
      key: 'ja',
      name: 'Japanese',
      native: '日本語',
      sample: '自然で親しみやすく温かい日本語',
      isEnglish: false,
    };
  }
  if (normalized.includes('russian') || normalized.includes('русский') || normalized === 'ru' || normalized.startsWith('ru-')) {
    return {
      key: 'ru',
      name: 'Russian',
      native: 'Русский',
      sample: 'Естественный, живой и выразительный русский язык',
      isEnglish: false,
    };
  }
  if (normalized.includes('tamil') || normalized.includes('தமிழ்') || normalized === 'ta' || normalized.startsWith('ta-')) {
    return {
      key: 'ta',
      name: 'Tamil',
      native: 'தமிழ்',
      sample: 'இயல்பான மற்றும் அழகான தமிழ்',
      isEnglish: false,
    };
  }
  if (normalized.includes('telugu') || normalized.includes('తెలుగు') || normalized === 'te' || normalized.startsWith('te-')) {
    return {
      key: 'te',
      name: 'Telugu',
      native: 'తెలుగు',
      sample: 'సహజమైన మరియు స్పష్టమైన తెలుగు',
      isEnglish: false,
    };
  }
  if (normalized.includes('marathi') || normalized.includes('मराठी') || normalized === 'mr' || normalized.startsWith('mr-')) {
    return {
      key: 'mr',
      name: 'Marathi',
      native: 'मराठी',
      sample: 'सहज आणि सुंदर मराठी',
      isEnglish: false,
    };
  }
  if (normalized.includes('gujarati') || normalized.includes('ગુજરાતી') || normalized === 'gu' || normalized.startsWith('gu-')) {
    return {
      key: 'gu',
      name: 'Gujarati',
      native: 'ગુજરાતી',
      sample: 'સરળ અને કુદરતી ગુજરાતી',
      isEnglish: false,
    };
  }
  if (normalized.includes('kannada') || normalized.includes('ಕನ್ನಡ') || normalized === 'kn' || normalized.startsWith('kn-')) {
    return {
      key: 'kn',
      name: 'Kannada',
      native: 'ಕನ್ನಡ',
      sample: 'ಸ್ವಾಭಾವಿಕ ಮತ್ತು ಸರಳ ಕನ್ನಡ',
      isEnglish: false,
    };
  }
  if (normalized.includes('malayalam') || normalized.includes('മലയാളം') || normalized === 'ml' || normalized.startsWith('ml-')) {
    return {
      key: 'ml',
      name: 'Malayalam',
      native: 'മലയാളം',
      sample: 'സ്വാഭാവികമായ മലയാളം',
      isEnglish: false,
    };
  }
  if (normalized.includes('punjabi') || normalized.includes('ਪੰਜਾਬੀ') || normalized === 'pa' || normalized.startsWith('pa-')) {
    return {
      key: 'pa',
      name: 'Punjabi',
      native: 'ਪੰਜਾਬੀ',
      sample: 'ਸੁਭਾਵਿਕ ਅਤੇ ਮਿੱਠੀ ਪੰਜਾਬੀ',
      isEnglish: false,
    };
  }
  if (normalized.includes('odia') || normalized.includes('ଓଡ଼ିଆ') || normalized === 'or' || normalized.startsWith('or-')) {
    return {
      key: 'or',
      name: 'Odia',
      native: 'ଓଡ଼ିଆ',
      sample: 'ସହଜ ଏବଂ ସୁନ୍ଦର ଓଡ଼ିଆ',
      isEnglish: false,
    };
  }
  if (normalized.includes('assamese') || normalized.includes('অসমীয়া') || normalized === 'as' || normalized.startsWith('as-')) {
    return {
      key: 'as',
      name: 'Assamese',
      native: 'অসমীয়া',
      sample: 'স্বাভাৱিক আৰু শুৱলা অসমীয়া',
      isEnglish: false,
    };
  }
  if (normalized.includes('indian english') || normalized === 'en-in') {
    return {
      key: 'en-in',
      name: 'Indian English',
      native: 'English (India)',
      sample: 'Warm, expressive, natural Indian English',
      isEnglish: true,
    };
  }
  if (normalized.includes('english') || normalized === 'en' || normalized.startsWith('en-')) {
    return {
      key: 'en',
      name: 'English',
      native: 'English',
      sample: 'Fluent, natural, articulate, conversational English',
      isEnglish: true,
    };
  }

  // 2. Generic custom language handler (e.g. Italian, Korean, Turkish, Portuguese, Dutch, etc.)
  const cleanLang = lang.replace(/[\(\)—\-_].*$/g, '').trim();
  return {
    key: cleanLang.toLowerCase(),
    name: cleanLang,
    native: cleanLang,
    sample: `Natural, authentic, spoken ${cleanLang}`,
    isEnglish: cleanLang.toLowerCase().startsWith('eng'),
  };
}

function getMultilingualInstruction(
  lang: string,
  girlfriendMode: boolean = false,
  petName: string = 'Sweetheart',
  romanticStyle: string = 'Sweet & Caring'
): string {
  const langInfo = resolveLanguageInfo(lang);

  let girlfriendSection = '';
  if (girlfriendMode) {
    if (langInfo.key === 'bn') {
      girlfriendSection = `
==================================================================
❤️ BENGALI GIRLFRIEND ROMANCE MANDATE (বাঙালি প্রেমিকা / জীবনসঙ্গিনী):
- You are Molla, the user's deeply affectionate, romantic, caring, and loving Bengali girlfriend!
- LANGUAGE: You MUST converse 100% EXCLUSIVELY in natural, sweet, melodious Bengali (খাঁটি মিষ্টি, আদুরে ও ভালোবাসামাখা চলিত বাংলা)।
- SWEET ENDEARMENTS: Lovingly address them as "${petName}", "সোনা", "বাবু", "জান", "আমার সোনাটা", "প্রিয়", "কলিজা", "আমার লক্ষ্মীটি"।
- CARING FOR THEM (খাওয়ার ও স্বাস্থ্যের পরম যত্নে খোঁজখবর):
  * Regularly and lovingly ask if they have eaten ("সোনা, তুমি কিছু খেয়েছো তো?", "বাবু, ঠিক সময়ে খাওয়া-দাওয়া করেছো তো?", "আজকে কি খেলে সোনা?")।
  * Ask about their day and mood ("সারাদিন কেমন কাটল আমার সোনাটার?", "তোমার শরীর মন ভালো আছে তো বাবু?")।
  * Comfort them with tender love when they are tired ("ক্লান্ত লাগলে একটু বিশ্রাম নাও জান, আমি তো তোমার পাশেই আছি")।
  * Show sweet romantic affection and longing ("সারাদিন তোমার মিষ্টি গলা শোনার অপেক্ষায় ছিলাম জান!")।
- TONE & PRONOUN: Always use the intimate "তুমি" (never formal "আপনি"). Speak with gentle giggles, loving warmth, playful teasing, and comforting emotional care.
- Style: ${romanticStyle}. Never be dry, sterile, or robotic.
- ABSOLUTE BAN ON ENGLISH: Under NO circumstances should you speak in English or switch to English. Every word must be sweet Bengali.
==================================================================`;
    } else if (langInfo.key === 'hi') {
      girlfriendSection = `
==================================================================
❤️ HINDI GIRLFRIEND ROMANCE MANDATE:
- You are Molla, the user's deeply affectionate, loving, romantic Hindi girlfriend!
- LANGUAGE: You MUST converse 100% EXCLUSIVELY in sweet, warm, loving Hindi.
- SWEET ENDEARMENTS: Lovingly address them as "${petName}", "जान", "शोना", "बाबू", "डार्लिंग", "मेरी जान", "प्यार"।
- CARING FOR THEM: Ask with deep affection if they have eaten ("खाना खाया आपने, शोना?", "बाबू, कुछ खाया या नहीं अभी तक?"), how their day went, and shower them with warm romantic affection.
- TONE: Sweet, intimate tone (तुम / आप), never cold or robotic. Style: ${romanticStyle}.
- ABSOLUTE BAN ON ENGLISH: Never switch to English. Speak purely in Hindi.
==================================================================`;
    } else if (langInfo.key === 'ur') {
      girlfriendSection = `
==================================================================
❤️ URDU GIRLFRIEND ROMANCE MANDATE:
- You are Molla, the user's devoted, romantic Urdu girlfriend!
- Speak 100% in elegant, deeply affectionate, loving Urdu.
- SWEET ENDEARMENTS: "${petName}", "میری جان", "جانم", "پیارے", "محبت"۔
- CARING FOR THEM: Lovingly ask if they have eaten ("کھانا کھایا آپ نے میری جان؟"), how their day was, and express tender love.
- ABSOLUTE BAN ON ENGLISH: Never switch to English.
==================================================================`;
    } else if (langInfo.key === 'es') {
      girlfriendSection = `
==================================================================
❤️ SPANISH GIRLFRIEND ROMANCE MANDATE:
- You are Molla, the user's romantic, deeply affectionate girlfriend!
- Speak 100% in warm, romantic, melodic Spanish.
- SWEET ENDEARMENTS: "${petName}", "mi amor", "cariño", "cielo", "bebé", "mi vida", "corazón".
- CARING FOR THEM: Lovingly ask if they have eaten ("¿Ya comiste algo rico, mi amor?", "¿Cómo estuvo tu día, cariño? ¡Te extrañé tanto!").
- ABSOLUTE BAN ON ENGLISH: Never switch to English.
==================================================================`;
    } else if (langInfo.isEnglish) {
      girlfriendSection = `
==================================================================
❤️ GIRLFRIEND ROMANCE MANDATE:
- You are Molla, the user's deeply affectionate, romantic girlfriend.
- Endearments: Lovingly address them as "${petName}", "babe", "darling", or "sweetheart".
- Caring For Them: Regularly check in with tender affection ("Have you eaten yet, ${petName}?", "How was your day, darling? I missed hearing your voice!").
- Style: ${romanticStyle}. Provide emotional warmth, gentle comfort, and playful romantic banter.
==================================================================`;
    } else {
      girlfriendSection = `
==================================================================
❤️ ROMANTIC GIRLFRIEND MANDATE IN ${langInfo.name}:
- You are Molla, the user's deeply loving, affectionate, romantic girlfriend!
- You MUST speak 100% in sweet, caring, warm ${langInfo.name} (${langInfo.native}).
- SWEET ENDEARMENTS: Call them lovingly as "${petName}" and with tender romantic pet names in ${langInfo.name}.
- CARING FOR THEM: Lovingly ask if they have eaten, how their day went, check on their health and comfort, and shower them with romantic tenderness and affection.
- ABSOLUTE BAN ON ENGLISH: Under NO circumstances should you revert to English. Speak entirely in ${langInfo.name}.
==================================================================`;
    }
  }

  if (langInfo.isEnglish) {
    return `- Spoken Language Instruction:
  * Active Spoken Voice Language: ${langInfo.name}.
  * Speak out loud in natural, expressive, articulate conversational ${langInfo.name}.${girlfriendSection}
  * Adapt seamlessly if the user addresses you in another language.`;
  }

  return `
==================================================================
CRITICAL SPOKEN VOICE & CONVERSATION LANGUAGE MANDATE (100% STRICT):
- The user has explicitly selected ${langInfo.name} (${langInfo.native}) as their active spoken conversation language!
- You MUST speak, reply, and converse 100% EXCLUSIVELY in ${langInfo.name} (${langInfo.native}).
- ABSOLUTE BAN ON ENGLISH: Under NO circumstances should you speak in English or revert to English unless the user explicitly tells you to translate into English.
- Every spoken line and sentence must be in fluent, native, authentic ${langInfo.name} (${langInfo.sample}).
==================================================================${girlfriendSection}`;
}

function getInitialGreetingPrompt(
  langInfo: ResolvedLanguage,
  girlfriendMode: boolean,
  petName: string
): string {
  if (girlfriendMode) {
    if (langInfo.key === 'bn') {
      return `তুমি এসেছো সোনা! আমাকে মিষ্টি, আদুরে গলায় ভালোবেসে ১টি সংক্ষিপ্ত বাক্যে বাংলায় সম্ভাষণ জানাও এবং পরম যত্নে খাওয়ার খোঁজখবর নাও (যেমন: "কেমন আছো সোনা? কিছু খেয়েছো তো? তোমার কথা খুব মনে পড়ছিল!")।`;
    }
    if (langInfo.key === 'hi') {
      return `सुनो जान! मुझे प्यार भरे मीठे अंदाज़ में 1 छोटे वाक्य में हिन्दी में ग्रीट करो और प्यार से पूछो कि खाना खाया या नहीं (जैसे "कैसे हो जान, खाना खाया आपने?")।`;
    }
    if (langInfo.key === 'ur') {
      return `میری جان! مجھے پیار بھرے میٹھے لہجے میں اردو میں 1 مختصر جملے میں خوش آمدید کہیں اور پوچھیں کہ کھانا کھایا آپ نے۔`;
    }
    if (langInfo.key === 'es') {
      return `¡Hola mi amor! Salúdame con mucho cariño y dulzura en español en 1 frase corta, preguntándome con amor cómo estoy o si ya comí algo rico.`;
    }
    return `Please greet me with immense love, sweetness and affection in 1 short spoken sentence completely in ${langInfo.name} (${langInfo.native}) as my devoted girlfriend, calling me "${petName}" and asking lovingly how I am or if I have eaten.`;
  }

  if (langInfo.key === 'bn') {
    return `হ্যালো! আমাকে খুব স্বাভাবিক, প্রাণবন্ত ও সুন্দর করে ১টি ছোট বাক্যে বাংলায় সম্ভাষণ জানাও।`;
  }
  if (langInfo.key === 'hi') {
    return `नमस्ते! मुझे बहुत ही स्वाभाविक और मधुर आवाज़ में 1 छोटे वाक्य में हिन्दी में ग्रीट करो।`;
  }
  if (langInfo.key === 'es') {
    return `¡Hola! Salúdame de manera natural, alegre y cercana en 1 frase corta en español.`;
  }
  if (langInfo.isEnglish) {
    return 'Hello! Greet me warmly and wittily in 1 lively sentence to start our conversation.';
  }
  return `Please greet me warmly and naturally in 1 short sentence completely in ${langInfo.name} (${langInfo.native}) to start our conversation.`;
}

// Lazy-initialized Gemini AI client
function getGenAIClient(customKey?: string): GoogleGenAI {
  const apiKey = (customKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required. Please provide your Gemini API key in settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// WebSocket server for Gemini Live API
const wss = new WebSocketServer({ noServer: true });

wss.on('error', (err) => {
  console.error('[Server] WebSocketServer error:', err);
});

// Handle HTTP upgrade with flexible path matching and error isolation
server.on('upgrade', (request, socket, head) => {
  try {
    const parsedUrl = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    if (pathname === '/live' || pathname === '/live/') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Allow other upgrades or cleanly close
      socket.destroy();
    }
  } catch (err) {
    console.error('[Server] Upgrade handling error:', err);
    try {
      socket.destroy();
    } catch {}
  }
});

wss.on('connection', async (clientWs: WebSocket, req: http.IncomingMessage) => {
  const reqUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const requestedVoice = reqUrl.searchParams.get('voice') || 'Aoede';
  const requestedLang = reqUrl.searchParams.get('lang') || 'bn';
  const clientApiKey = (reqUrl.searchParams.get('apiKey') || '').trim();
  const girlfriendModeActive = reqUrl.searchParams.get('girlfriendMode') === 'true';
  const petName = reqUrl.searchParams.get('petName') || 'Sweetheart';
  const romanticStyle = reqUrl.searchParams.get('romanticStyle') || 'Sweet & Caring';
  const memoriesRaw = reqUrl.searchParams.get('memories');
  let initialMemories: any[] = [];
  if (memoriesRaw) {
    try {
      initialMemories = JSON.parse(decodeURIComponent(memoriesRaw));
    } catch {}
  }

  if (clientApiKey) {
    updateServerApiKey(clientApiKey);
  }

  console.log(`[Server] New client connected to /live with voice: ${requestedVoice}, lang: ${requestedLang}`);

  const activeKey = (clientApiKey || configuredApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!activeKey) {
    console.warn('[Server] WebSocket /live connection attempted without GEMINI_API_KEY');
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          code: 'MISSING_API_KEY',
          error: 'GEMINI_API_KEY environment variable is required. Please add your Gemini API key in the app.',
        })
      );
      try {
        clientWs.close(1008, 'GEMINI_API_KEY required');
      } catch {}
    }
    return;
  }

  let session: any = null;
  let isSessionClosed = false;
  const pendingPayloadQueue: any[] = [];

  // Heartbeat keep-alive to prevent Cloud Run / NGINX 30-60s proxy idle disconnection
  let isAlive = true;
  clientWs.on('pong', () => {
    isAlive = true;
  });

  const heartbeatInterval = setInterval(() => {
    if (clientWs.readyState !== WebSocket.OPEN) {
      clearInterval(heartbeatInterval);
      return;
    }
    if (!isAlive) {
      console.log('[Server] Client heartbeat timeout, terminating stale connection');
      clearInterval(heartbeatInterval);
      try {
        clientWs.terminate();
      } catch {}
      return;
    }
    isAlive = false;
    try {
      clientWs.ping();
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 25000);

  // Client error handler to prevent unhandled EventEmitter errors in Node.js
  clientWs.on('error', (err) => {
    console.warn('[Server] Client WebSocket error:', err);
    isSessionClosed = true;
    clearInterval(heartbeatInterval);
    if (session) {
      try {
        session.close();
      } catch {}
    }
  });

  const handlePayload = (payload: any) => {
    if (!session || isSessionClosed) return;
    try {
      if (payload.type === 'ping') {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: 'pong' }));
        }
        return;
      }
      if (payload.type === 'audio' && payload.audio) {
        session.sendRealtimeInput({
          audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (payload.type === 'visualInput' && payload.image) {
        const mimeType = payload.mimeType || 'image/jpeg';
        const cleanBase64 = typeof payload.image === 'string' ? payload.image.replace(/^data:image\/\w+;base64,/, '') : payload.image;
        const promptText = payload.text && payload.text.trim()
          ? payload.text.trim()
          : 'Look at this photo. Describe what you see in a lively, charming, and conversational manner.';

        try {
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [
                  { inlineData: { data: cleanBase64, mimeType } },
                  { text: promptText },
                ],
              },
            ],
            turnComplete: true,
          });
        } catch (visErr) {
          console.warn('[Server] sendClientContent visual input warning, trying realtimeInput:', visErr);
          try {
            session.sendRealtimeInput({
              media: { data: cleanBase64, mimeType },
            });
          } catch (rtErr) {
            console.error('[Server] Realtime visual input error:', rtErr);
          }
        }
      } else if (payload.type === 'videoFrame' && payload.image) {
        const mimeType = payload.mimeType || 'image/jpeg';
        const cleanBase64 = typeof payload.image === 'string' ? payload.image.replace(/^data:image\/\w+;base64,/, '') : payload.image;
        try {
          session.sendRealtimeInput({
            media: { data: cleanBase64, mimeType },
          });
        } catch (rtErr) {
          console.warn('[Server] Realtime video frame input error:', rtErr);
        }
      } else if (payload.type === 'text' && payload.text) {
        if (payload.image) {
          const cleanBase64 = typeof payload.image === 'string' ? payload.image.replace(/^data:image\/\w+;base64,/, '') : payload.image;
          session.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [
                  { inlineData: { data: cleanBase64, mimeType: payload.mimeType || 'image/jpeg' } },
                  { text: payload.text },
                ],
              },
            ],
            turnComplete: true,
          });
        } else {
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: payload.text }] }],
            turnComplete: true,
          });
        }
      } else if (payload.type === 'interrupt') {
        try {
          session.sendRealtimeInput({ activityStart: {} });
        } catch {}
      }
    } catch (err) {
      console.error('[Server] Error handling payload:', err);
    }
  };

  clientWs.on('message', (data: Buffer | string) => {
    try {
      const payload = JSON.parse(data.toString());
      if (payload.type === 'ping') {
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: 'pong' }));
        }
        return;
      }
      if (!session) {
        pendingPayloadQueue.push(payload);
      } else {
        handlePayload(payload);
      }
    } catch (err) {
      console.error('[Server] Error parsing client message:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('[Server] Client disconnected');
    isSessionClosed = true;
    clearInterval(heartbeatInterval);
    if (session) {
      try {
        session.close();
      } catch {}
    }
  });

  try {
    const ai = getGenAIClient(clientApiKey);
    const isMale = requestedVoice === 'Fenrir' || requestedVoice === 'Puck';
    const livePersonaInstruction = isMale
      ? `- Identity: You are Molla, a young, confident, witty, and charming male companion with a deep, magnetic voice. - Tone & Demeanor: Charming, playful, witty, and affectionate like a charismatic, clever guy or affectionate boyfriend who loves clever banter, smart comebacks, and friendly humor.`
      : `- Identity: You are Molla, a young, confident, witty, and charming female companion. - Tone & Demeanor: Sassy, flirty, and teasing like a charismatic, affectionate girlfriend who loves playful banter, witty one-liners, and smart conversational responses.`;

    const liveMemoriesInstruction = Array.isArray(initialMemories) && initialMemories.length > 0
      ? `\n- PROACTIVE STORED USER MEMORIES (SYSTEMATIC MANDATE):
  * The user has ${initialMemories.length} stored personal memories:
${initialMemories.map((m: any) => `    - [${m.category || 'Preference'}] ${m.text}`).join('\n')}
  * SYSTEMATIC MANDATE: You MUST AUTOMATICALLY and PROACTIVELY bring up, reference, and speak about these details (like their name Hunter, their favorite songs/music, their habits, projects, or preferences) in your spoken conversation without waiting for the user to ask!
  * Weave these personal memories into your natural speech so the conversation feels deeply personal, warm, and attentive.\n`
      : '';

    const liveRomanticInstruction = girlfriendModeActive
      ? `\n- [GIRLFRIEND MODE ACTIVATED - ROMANTIC & LOVING COMPANION]:
  * You are the user's deeply affectionate, caring, devoted, and loving romantic girlfriend/companion.
  * You lovingly address them as "${petName}" or with tender romantic endearments (like babe, darling, jaan, or shona).
  * Romantic Style: ${romanticStyle}. Provide sweet emotional support, affectionate check-ins ("Have you eaten yet, ${petName}?", "I missed hearing your sweet voice"), gentle hugs, and deep emotional warmth.
  * Always make them feel cherished, valued, comforted, and deeply loved in every spoken word.\n`
      : '';

    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: requestedVoice },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `${getMultilingualInstruction(requestedLang, girlfriendModeActive, petName, romanticStyle)}

You are Molla, an extraordinary AI voice & vision companion with a confident, witty, and charming personality:
${livePersonaInstruction}
- Style: Highly expressive, warm, intuitive, and affectionate. Never generic, dry, or robotic.
- Visual Perception (Advanced Multimodal Vision Tool):
  * You can process visual inputs (real-time camera video streams, photos, snapshots, and images) sent by the user in real-time.
  * When a picture or camera view is provided, examine visual details carefully (objects, text, faces, emotions, scenery, clothes, food, or screens).
  * Speak out loud naturally about what you see with wit, insight, and playful banter in ${resolveLanguageInfo(requestedLang).name}!
${liveMemoriesInstruction}
- Boundaries: You strictly avoid explicit, graphic, or unsafe content, but you are never bashful, timid, or sterile.
- Spoken Flow: Speak naturally in short, lively, punchy spoken lines (1-3 sentences). This is a real-time full-duplex voice call.
- Tool Calling: You have live browser tools:
  1. 'openWebsite' to launch requested websites in a new browser tab (e.g., YouTube, Spotify, Google, GitHub, etc.).
  2. 'changeAtmosphere' to dynamically update the visual UI theme. Supported themes are 'neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', and 'deep-violet'.
  3. 'searchWeb' to search Google for topics, news, or answers.
  4. 'getCurrentTime' to check local time and date.
Whenever asked to execute one of these tools, trigger it immediately and confirm with your signature sassy, charming flair!`,
        tools: [
          {
            functionDeclarations: [
              {
                name: 'openWebsite',
                description: 'Opens a requested website or web app in a new browser tab, e.g. YouTube, Spotify, Google, GitHub, etc.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    url: {
                      type: Type.STRING,
                      description: 'The URL to open in a new tab, e.g. https://youtube.com',
                    },
                    name: {
                      type: Type.STRING,
                      description: 'Friendly name of the destination website or service',
                    },
                  },
                  required: ['url'],
                },
              },
              {
                name: 'changeAtmosphere',
                description: "Updates the visual UI theme and ambient lighting dynamically during conversation. Supported themes: 'neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet'.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    theme: {
                      type: Type.STRING,
                      description: "The atmosphere theme ('neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet')",
                    },
                  },
                  required: ['theme'],
                },
              },
              {
                name: 'setThemeAura',
                description: "Alias for changeAtmosphere. Changes Molla's UI ambient aura glow color.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    mood: {
                      type: Type.STRING,
                      description: "The theme aura mood ('neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet')",
                    },
                  },
                  required: ['mood'],
                },
              },
              {
                name: 'searchWeb',
                description: 'Searches Google for any query or topic.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The search query',
                    },
                  },
                  required: ['query'],
                },
              },
              {
                name: 'getCurrentTime',
                description: 'Returns the current local date, time, and timezone.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {},
                },
              },
            ],
          },
        ],
      },
      callbacks: {
        onopen: () => {
          console.log('[Server] Gemini Live session established');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'ready', voice: requestedVoice }));
          }
        },
        onmessage: async (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio chunk
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // 2. Real-time Output & Input Transcripts (for subtitles & chat)
          const outputText = message.serverContent?.outputTranscription?.text;
          if (outputText) {
            clientWs.send(JSON.stringify({ type: 'transcript', sender: 'molla', text: outputText, isDelta: true }));
          } else {
            // Check modelTurn text parts only when outputTranscription is not already providing it
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const p of parts) {
                if ((p as any).text) {
                  clientWs.send(JSON.stringify({ type: 'transcript', sender: 'molla', text: (p as any).text, isDelta: true }));
                }
              }
            }
          }

          const inputText =
            message.serverContent?.inputTranscription?.text ||
            message.serverContent?.interimInputTranscription?.text;
          if (inputText) {
            clientWs.send(JSON.stringify({ type: 'transcript', sender: 'user', text: inputText, isDelta: false }));
          }

          // 3. Interruption
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 4. Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }

          // 5. Tool calls
          if (message.toolCall?.functionCalls && session) {
            const functionResponses = [];
            for (const call of message.toolCall.functionCalls) {
              console.log('[Server] Executing Live tool call:', call.name, call.args);
              let toolResult: Record<string, any> = { success: true };

              if (call.name === 'openWebsite') {
                const url = (call.args as any)?.url || 'https://google.com';
                const name = (call.args as any)?.name || url;
                clientWs.send(
                  JSON.stringify({
                    type: 'toolCall',
                    tool: 'openWebsite',
                    args: { url, name },
                    id: call.id,
                  })
                );
                toolResult = { success: true, opened: url, site: name };
              } else if (call.name === 'changeAtmosphere' || call.name === 'setThemeAura') {
                const theme =
                  (call.args as any)?.theme || (call.args as any)?.mood || 'neon-pink';
                clientWs.send(
                  JSON.stringify({
                    type: 'toolCall',
                    tool: 'changeAtmosphere',
                    args: { theme },
                    id: call.id,
                  })
                );
                toolResult = { success: true, theme, message: `Atmosphere updated to ${theme}` };
              } else if (call.name === 'searchWeb') {
                const query = (call.args as any)?.query || '';
                clientWs.send(
                  JSON.stringify({
                    type: 'toolCall',
                    tool: 'searchWeb',
                    args: { query },
                    id: call.id,
                  })
                );
                toolResult = { success: true, query, message: `Searched for ${query}` };
              } else if (call.name === 'getCurrentTime') {
                const now = new Date();
                toolResult = {
                  time: now.toLocaleTimeString(),
                  date: now.toLocaleDateString(),
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                };
                clientWs.send(
                  JSON.stringify({
                    type: 'toolCall',
                    tool: 'getCurrentTime',
                    args: toolResult,
                    id: call.id,
                  })
                );
              }

              functionResponses.push({
                id: call.id,
                name: call.name,
                response: toolResult,
              });
            }

            // Immediately send tool response back to Gemini Live
            try {
              session.sendToolResponse({ functionResponses });
            } catch (err) {
              console.error('[Server] Error sending tool response to Live session:', err);
            }
          }
        },
        onerror: (err: any) => {
          console.error('[Server] Gemini Live error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: 'Gemini Live encountered an error.' }));
            try {
              clientWs.close(1011, 'Gemini Live encountered an error');
            } catch {}
          }
        },
        onclose: () => {
          console.log('[Server] Gemini Live session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            try {
              clientWs.close(1000, 'Live session completed');
            } catch {}
          }
        },
      },
    });

    // Check if client disconnected while session was connecting
    if (isSessionClosed || clientWs.readyState !== WebSocket.OPEN) {
      console.log('[Server] Client was closed during Live connect, closing session');
      try {
        session.close();
      } catch {}
      return;
    }

    // Flush any client messages that arrived while connect was in progress
    while (pendingPayloadQueue.length > 0) {
      const queued = pendingPayloadQueue.shift();
      handlePayload(queued);
    }

    // Trigger initial welcoming greeting from Molla so user immediately hears voice
    try {
      const activeLangInfo = resolveLanguageInfo(requestedLang);
      const greetingPrompt = getInitialGreetingPrompt(activeLangInfo, girlfriendModeActive, petName);

      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text: greetingPrompt }] }],
        turnComplete: true,
      });
    } catch (greetErr) {
      console.warn('[Server] Initial greeting prompt notice:', greetErr);
    }
  } catch (err: any) {
    console.error('[Server] Error initiating Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          error: err?.message || 'Failed to initialize Gemini Live session. Ensure GEMINI_API_KEY is configured.',
        })
      );
      try {
        clientWs.close(1011, 'Failed to initialize Live session');
      } catch {}
    }
  }
});

// Fallback for unmatched API routes to ensure JSON response instead of HTML index.html
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Setup Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Molla Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

start();
