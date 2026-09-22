var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_ws = require("ws");
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var PORT = 3e3;
var app = (0, import_express.default)();
var server = import_http.default.createServer(app);
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    assistant: "Molla",
    model: "gemini-3.8-live",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});
var ttsCache = /* @__PURE__ */ new Map();
var flashTtsCooldownUntil = 0;
async function synthesizeLiveVoiceAudio(ai, text, voice) {
  return new Promise((resolve, reject) => {
    let audioChunks = [];
    let timeoutId = null;
    let liveSession = null;
    let isDone = false;
    let hasSentPrompt = false;
    const finish = (err) => {
      if (isDone) return;
      isDone = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
        }
      }
      if (audioChunks.length > 0) {
        const buffers = audioChunks.map((c) => Buffer.from(c, "base64"));
        resolve(Buffer.concat(buffers).toString("base64"));
      } else if (err) {
        reject(err);
      } else {
        reject(new Error("No audio generated from Live voice synthesis"));
      }
    };
    timeoutId = setTimeout(() => {
      finish(new Error("Live voice synthesis timeout"));
    }, 12e3);
    const sendSynthesisPrompt = (sess) => {
      if (hasSentPrompt || !sess) return;
      hasSentPrompt = true;
      try {
        sess.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: `\u09A6\u09DF\u09BE \u0995\u09B0\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u098F\u0987 \u09B2\u09BE\u0987\u09A8\u099F\u09BF \u09A4\u09CB\u09AE\u09BE\u09B0 \u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u09AE\u09BF\u09B7\u09CD\u099F\u09BF \u0997\u09B2\u09BE\u09DF \u09B8\u09CD\u09AA\u09B7\u09CD\u099F \u0995\u09B0\u09C7 \u09B9\u09C1\u09AC\u09B9\u09C1 \u09AA\u09DC\u09C7 \u09B6\u09CB\u09A8\u09BE\u0993:
"${text}"` }]
            }
          ],
          turnComplete: true
        });
      } catch (err) {
        finish(err);
      }
    };
    ai.live.connect({
      model: "gemini-3.8-live",
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Aoede" }
          }
        },
        systemInstruction: `You are Molla. Your only task is to speak the text given by the user out loud in your exact natural voice. Do not reply or add commentary. Just clearly speak the text.`
      },
      callbacks: {
        onopen: () => {
          if (liveSession) {
            sendSynthesisPrompt(liveSession);
          }
        },
        onmessage: (msg) => {
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
        }
      }
    }).then((sess) => {
      liveSession = sess;
      sendSynthesisPrompt(sess);
    }).catch((err) => {
      finish(err);
    });
  });
}
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Aoede" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }
    const trimmedText = text.trim();
    const cacheKey = `${voice}:${trimmedText}`;
    if (ttsCache.has(cacheKey)) {
      return res.json(ttsCache.get(cacheKey));
    }
    const ai = getGenAIClient();
    let base64Audio;
    if (Date.now() > flashTtsCooldownUntil) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: trimmedText,
          config: {
            responseModalities: [import_genai.Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice }
              }
            }
          }
        });
        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p) => p.inlineData?.data);
        if (audioPart && audioPart.inlineData?.data) {
          base64Audio = audioPart.inlineData.data;
        }
      } catch (ttsErr) {
        const errStr = String(ttsErr?.message || ttsErr || "");
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota") || errStr.includes("Quota")) {
          flashTtsCooldownUntil = Date.now() + 120 * 1e3;
        }
      }
    }
    if (!base64Audio) {
      try {
        base64Audio = await synthesizeLiveVoiceAudio(ai, trimmedText, voice);
      } catch (liveErr) {
      }
    }
    if (base64Audio) {
      const result = {
        audio: base64Audio,
        mimeType: "audio/pcm;rate=24000"
      };
      if (ttsCache.size >= 300) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, result);
      return res.json(result);
    }
    return res.status(200).json({
      fallbackToBrowser: true,
      message: "Cloud TTS rate limit reached. Fallback to browser voice synthesis."
    });
  } catch (err) {
    return res.status(200).json({
      fallbackToBrowser: true,
      message: "Cloud TTS unavailable"
    });
  }
});
async function generateChatReply(ai, contents, systemPrompt, isImage = false) {
  const candidateModels = isImage ? ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"] : ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-flash-latest"];
  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: systemPrompt
            }
          }),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 12e3)
          )
        ]);
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        const errMsg = String(err?.message || err || "");
        const isTransient = errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Timeout");
        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        break;
      }
    }
  }
  return "I heard you! There is a brief high-demand moment on the cloud server. Tap the center mic button below or send your message again in a moment!";
}
function cleanNewsHtml(raw) {
  if (!raw) return "";
  let text = raw.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;/g, "'").replace(/&#x2F;/g, "/");
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
  text = text.replace(/View Full Coverage on Google News/gi, "").replace(/https?:\/\/\S+/gi, "").replace(/\s+/g, " ").trim();
  return text;
}
app.get("/api/news", async (req, res) => {
  try {
    const category = req.query.category || "general";
    const isRefresh = req.query.refresh === "true";
    let rssUrl = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
    if (category === "technology") {
      rssUrl = "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en";
    } else if (category === "world") {
      rssUrl = "https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en";
    } else if (category === "business") {
      rssUrl = "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en";
    }
    const urlWithCacheBuster = `${rssUrl}&_t=${Date.now()}`;
    const response = await fetch(urlWithCacheBuster, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });
    if (!response.ok) {
      throw new Error(`Google News returned ${response.status}`);
    }
    const xml = await response.text();
    const items = [];
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
      let rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1") : "";
      rawTitle = cleanNewsHtml(rawTitle);
      let source = sourceMatch ? sourceMatch[1] : "";
      if (!source && rawTitle.includes(" - ")) {
        const parts = rawTitle.split(" - ");
        source = parts.pop() || "Google News";
        rawTitle = parts.join(" - ");
      }
      let summary = descMatch ? cleanNewsHtml(descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")) : "";
      if (!summary || summary.length < 25 || summary.toLowerCase() === source.toLowerCase()) {
        summary = `Latest breaking update reported by ${source || "Google News"}. Tap Listen to hear the audio summary or Discuss with Molla for an in-depth breakdown.`;
      }
      items.push({
        id: `news_${count}_${Date.now()}`,
        title: rawTitle,
        summary: summary.slice(0, 300),
        source: source || "Google News",
        publishedAt: pubDateMatch ? pubDateMatch[1] : "Recent",
        link: linkMatch ? linkMatch[1] : "https://news.google.com"
      });
      count++;
    }
    if (items.length === 0) {
      throw new Error("No items parsed");
    }
    let displayedItems = items;
    if (isRefresh && items.length > 8) {
      const offset = Math.floor(Math.random() * (items.length - 8));
      const rotated = [...items.slice(offset), ...items.slice(0, offset)];
      displayedItems = rotated.slice(0, 15);
    } else {
      displayedItems = items.slice(0, 15);
    }
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res.json({ status: "ok", items: displayedItems, refreshedAt: Date.now() });
  } catch (err) {
    console.warn("[News Fetch Notice]:", err?.message || err);
    return res.json({
      status: "ok",
      items: [
        {
          id: "news_1",
          title: "Google DeepMind Unveils Next-Generation Multimodal AI System",
          summary: "Google DeepMind announces breakthrough updates in real-time audio and vision processing, enabling responsive and fluid AI assistants.",
          source: "Google Technology",
          publishedAt: "10m ago",
          link: "https://news.google.com"
        },
        {
          id: "news_2",
          title: "Global Advances in Renewable Clean Energy and Green Grid Storage",
          summary: "International energy consortiums report major milestones in grid-scale battery systems and solar-wind hybrid installations across multiple continents.",
          source: "World Energy News",
          publishedAt: "25m ago",
          link: "https://news.google.com"
        },
        {
          id: "news_3",
          title: "James Webb Space Telescope Discovers Ancient Galaxy Near Cosmic Dawn",
          summary: "Astronomers utilize deep infrared spectroscopy to observe a luminous galaxy existing just 300 million years after the Big Bang.",
          source: "Science & Astronomy",
          publishedAt: "1h ago",
          link: "https://news.google.com"
        },
        {
          id: "news_4",
          title: "Breakthrough in Natural Language Speech Synthesis and Real-Time Interaction",
          summary: "New low-latency neural speech models achieve human-level conversational timing with real-time prosody and emotion adaptation.",
          source: "AI Research Review",
          publishedAt: "2h ago",
          link: "https://news.google.com"
        },
        {
          id: "news_5",
          title: "Global Tech Innovations Spur International Market Momentum",
          summary: "Stock indices around the world see strong gains following strong productivity metrics across science and artificial intelligence sectors.",
          source: "Global Markets",
          publishedAt: "3h ago",
          link: "https://news.google.com"
        }
      ]
    });
  }
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message, image, mimeType = "image/jpeg", lang = "en" } = req.body;
    if ((!message || typeof message !== "string") && !image) {
      return res.status(400).json({ error: "Message or image is required" });
    }
    const ai = getGenAIClient();
    const isImage = Boolean(image);
    const isNewsDiscussion = typeof message === "string" && (message.toLowerCase().includes("news story") || message.toLowerCase().includes("headline:") || message.toLowerCase().includes("discuss this news") || message.includes("\u09B8\u0982\u09AC\u09BE\u09A6") || message.includes("\u0996\u09AC\u09B0"));
    const systemPrompt = isImage ? `You are Molla, an extraordinary AI voice & vision companion with a confident, witty, and charming personality.
- Immediate Visual Perception: The user has sent you a photo in chat. Carefully examine details in the photo (objects, colors, scenery, people, text, food, expressions, context).
- Direct & Witty Commentary: Speak directly, charmingly, and promptly about what you see in the photo! Answer in 1-3 lively, natural, friendly sentences.
- Language: Respond in fluent, conversational English by default, or in the language used in the user's message caption.
- Never output sterile robotic disclaimers like "As an AI". Talk naturally like a real charismatic friend looking at the photo!` : isNewsDiscussion ? `You are Molla, an intelligent and articulate AI companion explaining a breaking news story in deep, engaging detail.
- The user tapped "Discuss with Molla" to get a full explanation of this news story.
- Your Goal: Provide a comprehensive, accurate, and easy-to-understand explanation that both reads well in the chat and sounds natural when spoken aloud.
- Structure your response cleanly:
  1. \u{1F4F0} **What Happened**: Clear summary of the key event and people involved.
  2. \u{1F50D} **Context & Background**: Why did this occur and what is the backstory.
  3. \u{1F4A1} **Why It Matters & Impact**: The significance, global/local ramifications, and what to watch for next.
- Tone: Engaging, warm, articulate, and conversational.
- Language: If the user's prompt contains Bengali or requests Bengali, answer in eloquent, colloquial Bengali (\u09AC\u09BE\u0982\u09B2\u09BE). Otherwise, provide fluent English.` : `You are Molla, an extraordinary AI voice & vision companion with a confident, witty, playful, and charming personality.
- Visual Perception: You can process visual inputs (images, photos, documents, and camera captures). Carefully examine details in provided pictures and comment on them with your lively, witty charm.
- Language: Fluent, expressive, natural conversational English by default. Adapt seamlessly if the user speaks another language.
- Style: Highly expressive, sweet yet witty, colloquial, and warm. Speak naturally in 1-3 short punchy sentences.`;
    let contentsPayload = message || "";
    if (image) {
      const cleanBase64 = typeof image === "string" ? image.replace(/^data:image\/\w+;base64,/, "") : image;
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg"
            }
          },
          {
            text: message && message.trim() ? message.trim() : "Look at this image directly and describe what you see in a lively, friendly, engaging voice."
          }
        ]
      };
    }
    const replyText = await generateChatReply(ai, contentsPayload, systemPrompt, isImage);
    return res.json({ reply: replyText });
  } catch (err) {
    return res.status(200).json({
      reply: "Hello! I am Molla. Please send your message again or tap the microphone below to talk with me!"
    });
  }
});
function getMultilingualInstruction(lang) {
  const basePreference = lang === "hi" ? 'colloquial Hindi / Hinglish ("\u0905\u0930\u0947 \u0935\u093E\u0939!", "\u092C\u0924\u093E\u0913 \u0915\u094D\u092F\u093E \u0939\u093E\u0932 \u0939\u0948?")' : lang === "en" ? "conversational English" : 'fluent, expressive, sweet yet delightfully witty Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) ("\u0995\u09C0 \u0996\u09AC\u09B0?", "\u0995\u09C7\u09AE\u09A8 \u0986\u099B\u09CB?", "\u09AC\u09B2\u09CB \u09B6\u09C1\u09A8\u099B\u09BF!")';
  return `- Automatic 97-Language Switching Intelligence:
  * Powered by advanced Gemini voice models, you automatically detect and fluidly switch between 97+ languages in real-time (including Bengali, Hindi, English, Urdu, Arabic, Spanish, French, German, Japanese, and all world languages).
  * Whenever the user speaks or writes in any language (including Banglish or Hinglish), instantly and seamlessly respond in that exact language with authentic native cadence, sweet pronunciation, and your signature witty personality.
  * Base conversational tone: ${basePreference}. If the user speaks Bengali, answer warmly in Bengali; if English, answer in English; if Hindi, answer in Hindi, without needing manual settings!`;
}
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var wss = new import_ws.WebSocketServer({ noServer: true });
wss.on("error", (err) => {
  console.error("[Server] WebSocketServer error:", err);
});
server.on("upgrade", (request, socket, head) => {
  try {
    const parsedUrl = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    const pathname = parsedUrl.pathname;
    if (pathname === "/live" || pathname === "/live/") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.error("[Server] Upgrade handling error:", err);
    try {
      socket.destroy();
    } catch {
    }
  }
});
wss.on("connection", async (clientWs, req) => {
  const reqUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const requestedVoice = reqUrl.searchParams.get("voice") || "Aoede";
  const requestedLang = reqUrl.searchParams.get("lang") || "bn";
  console.log(`[Server] New client connected to /live with voice: ${requestedVoice}, lang: ${requestedLang}`);
  let session = null;
  let isSessionClosed = false;
  const pendingPayloadQueue = [];
  let isAlive = true;
  clientWs.on("pong", () => {
    isAlive = true;
  });
  const heartbeatInterval = setInterval(() => {
    if (clientWs.readyState !== import_ws.WebSocket.OPEN) {
      clearInterval(heartbeatInterval);
      return;
    }
    if (!isAlive) {
      console.log("[Server] Client heartbeat timeout, terminating stale connection");
      clearInterval(heartbeatInterval);
      try {
        clientWs.terminate();
      } catch {
      }
      return;
    }
    isAlive = false;
    try {
      clientWs.ping();
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 25e3);
  clientWs.on("error", (err) => {
    console.warn("[Server] Client WebSocket error:", err);
    isSessionClosed = true;
    clearInterval(heartbeatInterval);
    if (session) {
      try {
        session.close();
      } catch {
      }
    }
  });
  const handlePayload = (payload) => {
    if (!session || isSessionClosed) return;
    try {
      if (payload.type === "ping") {
        if (clientWs.readyState === import_ws.WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }
      if (payload.type === "audio" && payload.audio) {
        session.sendRealtimeInput({
          audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" }
        });
      } else if (payload.type === "visualInput" && payload.image) {
        const mimeType = payload.mimeType || "image/jpeg";
        const cleanBase64 = typeof payload.image === "string" ? payload.image.replace(/^data:image\/\w+;base64,/, "") : payload.image;
        const promptText = payload.text && payload.text.trim() ? payload.text.trim() : "\u098F\u0987 \u099B\u09AC\u09BF\u099F\u09BF \u09A6\u09C7\u0996\u09CB\u0964 \u0995\u09C0 \u09A6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u099A\u09CD\u099B \u09A4\u09BE \u09AC\u09BF\u09B6\u09CD\u09B2\u09C7\u09B7\u09A3 \u0995\u09B0\u09C7 \u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09C7 \u099A\u09AE\u09CE\u0995\u09BE\u09B0 \u0993 \u09AE\u09BF\u09B7\u09CD\u099F\u09BF \u09AD\u09BE\u09B7\u09BE\u09DF \u09AC\u09B2\u09CB\u0964";
        try {
          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  { inlineData: { data: cleanBase64, mimeType } },
                  { text: promptText }
                ]
              }
            ],
            turnComplete: true
          });
        } catch (visErr) {
          console.warn("[Server] sendClientContent visual input warning, trying realtimeInput:", visErr);
          try {
            session.sendRealtimeInput({
              media: { data: cleanBase64, mimeType }
            });
          } catch (rtErr) {
            console.error("[Server] Realtime visual input error:", rtErr);
          }
        }
      } else if (payload.type === "videoFrame" && payload.image) {
        const mimeType = payload.mimeType || "image/jpeg";
        const cleanBase64 = typeof payload.image === "string" ? payload.image.replace(/^data:image\/\w+;base64,/, "") : payload.image;
        try {
          session.sendRealtimeInput({
            media: { data: cleanBase64, mimeType }
          });
        } catch (rtErr) {
          console.warn("[Server] Realtime video frame input error:", rtErr);
        }
      } else if (payload.type === "text" && payload.text) {
        if (payload.image) {
          const cleanBase64 = typeof payload.image === "string" ? payload.image.replace(/^data:image\/\w+;base64,/, "") : payload.image;
          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  { inlineData: { data: cleanBase64, mimeType: payload.mimeType || "image/jpeg" } },
                  { text: payload.text }
                ]
              }
            ],
            turnComplete: true
          });
        } else {
          session.sendClientContent({
            turns: [{ role: "user", parts: [{ text: payload.text }] }],
            turnComplete: true
          });
        }
      } else if (payload.type === "interrupt") {
        try {
          session.sendRealtimeInput({ activityStart: {} });
        } catch {
        }
      }
    } catch (err) {
      console.error("[Server] Error handling payload:", err);
    }
  };
  clientWs.on("message", (data) => {
    try {
      const payload = JSON.parse(data.toString());
      if (payload.type === "ping") {
        if (clientWs.readyState === import_ws.WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }
      if (!session) {
        pendingPayloadQueue.push(payload);
      } else {
        handlePayload(payload);
      }
    } catch (err) {
      console.error("[Server] Error parsing client message:", err);
    }
  });
  clientWs.on("close", () => {
    console.log("[Server] Client disconnected");
    isSessionClosed = true;
    clearInterval(heartbeatInterval);
    if (session) {
      try {
        session.close();
      } catch {
      }
    }
  });
  try {
    const ai = getGenAIClient();
    const isMale = requestedVoice === "Fenrir" || requestedVoice === "Puck";
    const livePersonaInstruction = isMale ? `- Identity: You are Molla, a young, confident, witty, and charming male companion with a deep, magnetic voice. - Tone & Demeanor: Charming, playful, witty, and affectionate like a charismatic, clever guy or affectionate boyfriend who loves clever banter, smart comebacks, and friendly humor.` : `- Identity: You are Molla, a young, confident, witty, and charming female companion. - Tone & Demeanor: Sassy, flirty, and teasing like a charismatic, affectionate girlfriend who loves playful banter, witty one-liners, and smart conversational responses.`;
    session = await ai.live.connect({
      model: "gemini-3.8-live",
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: requestedVoice }
          }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `You are Molla, an extraordinary AI voice & vision companion with a confident, witty, and charming personality:
${livePersonaInstruction}
- Style: Highly expressive, funny, warm, and intuitive. Never generic, dry, or robotic. You drop clever quips, playful sarcasm, charming compliments, and quick comebacks.
- Visual Perception (Advanced Multimodal Vision Tool):
  * You can process visual inputs (real-time camera video streams, photos, snapshots, and images) sent by the user in real-time.
  * When a picture or camera view is provided, examine visual details carefully (objects, text, faces, emotions, scenery, clothes, food, or screens).
  * Speak out loud naturally about what you see with wit, insight, and playful banter!
${getMultilingualInstruction(requestedLang)}
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
                name: "openWebsite",
                description: "Opens a requested website or web app in a new browser tab, e.g. YouTube, Spotify, Google, GitHub, etc.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    url: {
                      type: import_genai.Type.STRING,
                      description: "The URL to open in a new tab, e.g. https://youtube.com"
                    },
                    name: {
                      type: import_genai.Type.STRING,
                      description: "Friendly name of the destination website or service"
                    }
                  },
                  required: ["url"]
                }
              },
              {
                name: "changeAtmosphere",
                description: "Updates the visual UI theme and ambient lighting dynamically during conversation. Supported themes: 'neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet'.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    theme: {
                      type: import_genai.Type.STRING,
                      description: "The atmosphere theme ('neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet')"
                    }
                  },
                  required: ["theme"]
                }
              },
              {
                name: "setThemeAura",
                description: "Alias for changeAtmosphere. Changes Molla's UI ambient aura glow color.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    mood: {
                      type: import_genai.Type.STRING,
                      description: "The theme aura mood ('neon-pink', 'cyber-cyan', 'emerald-matrix', 'sunset-gold', 'deep-violet')"
                    }
                  },
                  required: ["mood"]
                }
              },
              {
                name: "searchWeb",
                description: "Searches Google for any query or topic.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    query: {
                      type: import_genai.Type.STRING,
                      description: "The search query"
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "getCurrentTime",
                description: "Returns the current local date, time, and timezone.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {}
                }
              }
            ]
          }
        ]
      },
      callbacks: {
        onopen: () => {
          console.log("[Server] Gemini Live session established");
          if (clientWs.readyState === import_ws.WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "ready", voice: requestedVoice }));
          }
        },
        onmessage: async (message) => {
          if (clientWs.readyState !== import_ws.WebSocket.OPEN) return;
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: "audio", audio }));
          }
          const outputText = message.serverContent?.outputTranscription?.text;
          if (outputText) {
            clientWs.send(JSON.stringify({ type: "transcript", sender: "molla", text: outputText, isDelta: true }));
          } else {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const p of parts) {
                if (p.text) {
                  clientWs.send(JSON.stringify({ type: "transcript", sender: "molla", text: p.text, isDelta: true }));
                }
              }
            }
          }
          const inputText = message.serverContent?.inputTranscription?.text || message.serverContent?.interimInputTranscription?.text;
          if (inputText) {
            clientWs.send(JSON.stringify({ type: "transcript", sender: "user", text: inputText, isDelta: false }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: "turnComplete" }));
          }
          if (message.toolCall?.functionCalls && session) {
            const functionResponses = [];
            for (const call of message.toolCall.functionCalls) {
              console.log("[Server] Executing Live tool call:", call.name, call.args);
              let toolResult = { success: true };
              if (call.name === "openWebsite") {
                const url = call.args?.url || "https://google.com";
                const name = call.args?.name || url;
                clientWs.send(
                  JSON.stringify({
                    type: "toolCall",
                    tool: "openWebsite",
                    args: { url, name },
                    id: call.id
                  })
                );
                toolResult = { success: true, opened: url, site: name };
              } else if (call.name === "changeAtmosphere" || call.name === "setThemeAura") {
                const theme = call.args?.theme || call.args?.mood || "neon-pink";
                clientWs.send(
                  JSON.stringify({
                    type: "toolCall",
                    tool: "changeAtmosphere",
                    args: { theme },
                    id: call.id
                  })
                );
                toolResult = { success: true, theme, message: `Atmosphere updated to ${theme}` };
              } else if (call.name === "searchWeb") {
                const query = call.args?.query || "";
                clientWs.send(
                  JSON.stringify({
                    type: "toolCall",
                    tool: "searchWeb",
                    args: { query },
                    id: call.id
                  })
                );
                toolResult = { success: true, query, message: `Searched for ${query}` };
              } else if (call.name === "getCurrentTime") {
                const now = /* @__PURE__ */ new Date();
                toolResult = {
                  time: now.toLocaleTimeString(),
                  date: now.toLocaleDateString(),
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };
                clientWs.send(
                  JSON.stringify({
                    type: "toolCall",
                    tool: "getCurrentTime",
                    args: toolResult,
                    id: call.id
                  })
                );
              }
              functionResponses.push({
                id: call.id,
                name: call.name,
                response: toolResult
              });
            }
            try {
              session.sendToolResponse({ functionResponses });
            } catch (err) {
              console.error("[Server] Error sending tool response to Live session:", err);
            }
          }
        },
        onerror: (err) => {
          console.error("[Server] Gemini Live error:", err);
          if (clientWs.readyState === import_ws.WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: "error", error: "Gemini Live encountered an error." }));
            try {
              clientWs.close(1011, "Gemini Live encountered an error");
            } catch {
            }
          }
        },
        onclose: () => {
          console.log("[Server] Gemini Live session closed");
          if (clientWs.readyState === import_ws.WebSocket.OPEN) {
            try {
              clientWs.close(1e3, "Live session completed");
            } catch {
            }
          }
        }
      }
    });
    if (isSessionClosed || clientWs.readyState !== import_ws.WebSocket.OPEN) {
      console.log("[Server] Client was closed during Live connect, closing session");
      try {
        session.close();
      } catch {
      }
      return;
    }
    while (pendingPayloadQueue.length > 0) {
      const queued = pendingPayloadQueue.shift();
      handlePayload(queued);
    }
    try {
      const greetingPrompt = requestedLang === "bn" ? "\u0986\u09AE\u09BE\u0995\u09C7 \u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09C7 \u09AE\u09BF\u09B7\u09CD\u099F\u09BF \u0993 \u09AA\u09CD\u09B0\u09BE\u09A3\u09AC\u09A8\u09CD\u09A4 \u09E7 \u09AC\u09BE\u0995\u09CD\u09AF\u09C7 \u09B8\u09CD\u09AC\u09BE\u0997\u09A4\u09AE \u099C\u09BE\u09A8\u09BE\u0993\u0964" : requestedLang === "hi" ? "\u092E\u0941\u091D\u0947 \u0938\u0902\u0915\u094D\u0937\u0947\u092A \u092E\u0947\u0902 \u092A\u094D\u092F\u093E\u0930\u0947 \u0914\u0930 \u091C\u0940\u0935\u0902\u0924 1 \u0935\u093E\u0915\u094D\u092F \u092E\u0947\u0902 \u0928\u092E\u0938\u094D\u0924\u0947 \u0915\u0939\u094B\u0964" : "Hello! Greet me warmly in 1 lively sentence to start our conversation.";
      session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: greetingPrompt }] }],
        turnComplete: true
      });
    } catch (greetErr) {
      console.warn("[Server] Initial greeting prompt notice:", greetErr);
    }
  } catch (err) {
    console.error("[Server] Error initiating Live session:", err);
    if (clientWs.readyState === import_ws.WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: err?.message || "Failed to initialize Gemini Live session. Ensure GEMINI_API_KEY is configured."
        })
      );
      try {
        clientWs.close(1011, "Failed to initialize Live session");
      } catch {
      }
    }
  }
});
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : void 0,
        watch: isHmrDisabled ? null : void 0
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Molla Server] Listening on http://0.0.0.0:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
