import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import serverless from 'serverless-http';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(express.json({ limit: '100kb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (corsOrigins.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const limiter = rateLimit({
  windowMs: 60000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/ai', limiter);
app.use('/api/chat', limiter);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function sanitize(input: string): string {
  return input.replace(/[<>=]/g, '').slice(0, 5000);
}

// ─── Health ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── AI Chat ───────────────────────────────────────────────────
app.post('/api/ai/chat', async (req, res) => {
  const { message, language } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 3) {
    return res.status(400).json({ error: 'Text is required (min 3 characters)' });
  }
  if (!['am-ET', 'om-ET', 'en-US'].includes(language)) {
    return res.status(400).json({ error: 'Invalid language' });
  }

  const isAmharic = language === 'am-ET';
  const groqKey = process.env.GROQ_API_KEY || '';
  const geminiKey = process.env.GEMINI_API_KEY || '';

  let result: any;

  if (isAmharic) {
    result = await callGemini(message, 'am-ET', geminiKey);
    if (result.error) result = await callGroq(message, 'am-ET', groqKey);
  } else {
    result = await callGemini(message, 'en-US', geminiKey);
    if (result.error) result = await callGroq(message, 'en-US', groqKey);
  }

  if (result.noKey) {
    return res.json({
      text: isAmharic
        ? 'የAI ቁልፍ አልተገኘም። እባክዎን GROQ_API_KEY ወይም GEMINI_API_KEY ያዘጋጁ።'
        : 'AI service not configured. Please set GROQ_API_KEY or GEMINI_API_KEY.',
      category: 'System',
    });
  }

  if (result.error) {
    return res.json({
      text: isAmharic
        ? `ስህተት: ${result.errorMessage || 'AI ምላሽ ማግኘት አልተቻለም'}`
        : `Error: ${result.errorMessage || 'Could not get AI response'}`,
      category: 'System',
    });
  }

  res.json({ text: sanitize(result.text), category: 'AI Response' });
});

// ─── AI Translate ──────────────────────────────────────────────
app.post('/api/ai/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  const geminiKey = process.env.GEMINI_API_KEY || '';
  if (!geminiKey) return res.json({ text });

  const targetLang = targetLanguage === 'am-ET' ? 'Amharic' : 'English';
  const prompt = `Translate the following text to ${targetLang}. Only provide the translation:\n\n${text}`;

  try {
    const translated = await callGeminiRaw(prompt, geminiKey);
    res.json({ text: sanitize(translated || text) });
  } catch {
    res.json({ text });
  }
});

// ─── Chat CRUD ────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  transcription: string;
  response: string;
  language: string;
  pronunciationScore?: number;
  createdAt: string;
}

const historyStore: ChatMessage[] = [];
let statsStore = {
  totalRecordings: 0,
  languages: {} as Record<string, number>,
  pronunciationScores: [] as number[],
  lastUpdated: null as string | null,
};

app.get('/api/chat', (_req, res) => {
  res.json(historyStore);
});

app.post('/api/chat', (req, res) => {
  const { transcription, response, language, pronunciationScore } = req.body;
  const msg: ChatMessage = {
    id: Date.now().toString(),
    transcription,
    response,
    language,
    pronunciationScore,
    createdAt: new Date().toISOString(),
  };
  historyStore.unshift(msg);
  if (historyStore.length > 100) historyStore.splice(100);

  statsStore.totalRecordings += 1;
  statsStore.languages[language] = (statsStore.languages[language] || 0) + 1;
  if (pronunciationScore != null) {
    statsStore.pronunciationScores.push(pronunciationScore);
    if (statsStore.pronunciationScores.length > 100) statsStore.pronunciationScores.shift();
  }
  statsStore.lastUpdated = new Date().toISOString();

  res.json(msg);
});

app.delete('/api/chat', (_req, res) => {
  historyStore.length = 0;
  res.json({ success: true });
});

app.get('/api/chat/stats', (_req, res) => {
  res.json(statsStore);
});

app.delete('/api/chat/stats', (_req, res) => {
  statsStore = { totalRecordings: 0, languages: {}, pronunciationScores: [], lastUpdated: null };
  res.json({ success: true });
});

// ─── Helper Functions ──────────────────────────────────────────
async function callGroq(message: string, language: string, key: string) {
  if (!key) return { text: '', error: true, noKey: true };

  const systemPrompt = language === 'am-ET'
    ? 'አንተ እርዳታ የምትሰጥ የAI ረዳት ነህ። ጥያቄ ከሆነ መልስ ስጥ፣ ውይይት ከሆነ በተፈጥሮ ተነጋገር። በአማርኛ መልስህን አጭር አድርግ።'
    : 'You are a helpful Ethiopian voice AI assistant. If the user asks a question, answer it directly. If they make a statement or share something, respond naturally and conversationally. Keep responses concise, warm, and useful.';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const resp = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: sanitize(message) }],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Groq API ${resp.status}: ${body.slice(0, 200)}`);
    }
    const data = await resp.json();
    return { text: data.choices[0].message.content.trim(), language };
  } catch (e) {
    return { text: '', error: true, errorMessage: e.message };
  }
}

async function callGemini(message: string, language: string, key: string) {
  if (!key) return { text: '', error: true, noKey: true };

  const systemPrompt = language === 'am-ET'
    ? 'አንተ እርዳታ የምትሰጥ የAI ረዳት ነህ። ጥያቄ ከሆነ መልስ ስጥ፣ ውይይት ከሆነ በተፈጥሮ ተነጋገር። በአማርኛ መልስህን አጭር አድርግ።'
    : 'You are a helpful Ethiopian voice AI assistant. If the user asks a question, answer it directly. If they make a statement or share something, respond naturally and conversationally. Keep responses concise, warm, and useful.';

  try {
    const text = await callGeminiRaw(`${systemPrompt}\n\nUser: ${message}`, key);
    if (!text) throw new Error('Gemini returned empty response');
    return { text: text.trim(), language };
  } catch (e) {
    return { text: '', error: true, errorMessage: e.message };
  }
}

async function callGeminiRaw(prompt: string, key: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  const resp = await fetch(
    `${GEMINI_API_URL}/gemini-2.0-flash:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: sanitize(prompt) }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
      signal: controller.signal,
    },
  );
  clearTimeout(timeout);
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`Gemini API ${resp.status}: ${body.slice(0, 200)}`);
  }
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export const handler = serverless(app);
