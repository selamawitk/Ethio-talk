import { Injectable } from '@nestjs/common';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function sanitize(input: string): string {
  return input.replace(/[<>=]/g, '').slice(0, 5000);
}

function langName(code: string): string {
  if (code === 'am-ET') return 'Amharic';
  if (code === 'om-ET') return 'Oromiffa (Afaan Oromo)';
  return 'English';
}

function localizeMessage(language: string, type: 'noKey' | 'error', detail?: string): string {
  if (language === 'am-ET') {
    return type === 'noKey'
      ? 'የAI ቁልፍ አልተገኘም። እባክዎን GROQ_API_KEY ወይም GEMINI_API_KEY ያዘጋጁ።'
      : `ስህተት: ${detail || 'AI ምላሽ ማግኘት አልተቻለም'}`;
  }
  if (language === 'om-ET') {
    return type === 'noKey'
      ? 'Furtuu AI hin argamne. Mee GROQ_API_KEY ykn GEMINI_API_API_KEY qindeessi.'
      : `Dogoggora: ${detail || 'Deebii AI argachuu hin dandeenye'}`;
  }
  return type === 'noKey'
    ? 'AI service not configured. Please set GROQ_API_KEY or GEMINI_API_KEY.'
    : `Error: ${detail || 'Could not get AI response'}`;
}

@Injectable()
export class AiService {
  private get groqKey() { return process.env.GROQ_API_KEY || ''; }
  private get geminiKey() { return process.env.GEMINI_API_KEY || ''; }

  async getResponse(userMessage: string, language: string): Promise<{ text: string; category: string }> {
    const needsTranslation = language !== 'en-US';

    const inputForAI = needsTranslation
      ? await this.translateText(userMessage, 'en-US') || userMessage
      : userMessage;

    let result = await this.callGemini(inputForAI, 'en-US');
    if (result.error) result = await this.callGroq(inputForAI, 'en-US');

    if (!result.error && !result.noKey && result.text && needsTranslation) {
      const translatedBack = await this.translateText(result.text, language);
      if (translatedBack) result.text = translatedBack;
    }

    if (result.noKey) {
      return { text: localizeMessage(language, 'noKey'), category: 'System' };
    }

    if (result.error) {
      return { text: localizeMessage(language, 'error', result.errorMessage), category: 'System' };
    }

    return { text: sanitize(result.text), category: 'AI Response' };
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const targetName = langName(targetLanguage);
    const prompt = `Translate the following text to ${targetName}. Only provide the translation, nothing else:\n\n${text}`;

    if (this.geminiKey) {
      try {
        const res = await this.callGeminiRaw(prompt);
        if (res) return sanitize(res);
      } catch {}
    }

    if (this.groqKey) {
      try {
        const res = await this.callGroqRaw(prompt);
        if (res) return sanitize(res);
      } catch {}
    }

    return text;
  }

  private async callGroq(message: string, language: string) {
    if (!this.groqKey) return { text: '', error: true, noKey: true };

    const systemPrompt = 'You are a helpful Ethiopian voice AI assistant. If the user asks a question, answer it directly. If they make a statement or share something, respond naturally and conversationally. Keep responses concise, warm, and useful.';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: sanitize(message) },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Groq API ${response.status}: ${body.slice(0, 200)}`);
      }

      const data = await response.json();
      return { text: data.choices[0].message.content.trim(), language };
    } catch (e) {
      return { text: '', error: true, errorMessage: e.message };
    }
  }

  private async callGroqRaw(prompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  private async callGemini(message: string, language: string) {
    if (!this.geminiKey) return { text: '', error: true, noKey: true };

    const systemPrompt = 'You are a helpful Ethiopian voice AI assistant. If the user asks a question, answer it directly. If they make a statement or share something, respond naturally and conversationally. Keep responses concise, warm, and useful.';

    try {
      const text = await this.callGeminiRaw(`${systemPrompt}\n\nUser: ${message}`);
      if (!text) throw new Error('Gemini returned empty response');
      return { text: text.trim(), language };
    } catch (e) {
      return { text: '', error: true, errorMessage: e.message };
    }
  }

  private async callGeminiRaw(prompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const response = await fetch(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.geminiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: sanitize(prompt) }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini API ${response.status}: ${body.slice(0, 200)}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }
}
