import { Injectable } from '@nestjs/common';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function sanitize(input: string): string {
  return input.replace(/[<>=]/g, '').slice(0, 5000);
}

@Injectable()
export class AiService {
  private get groqKey() { return process.env.GROQ_API_KEY || ''; }
  private get geminiKey() { return process.env.GEMINI_API_KEY || ''; }

  async getResponse(userMessage: string, language: string): Promise<{ text: string; category: string }> {
    const isAmharic = language === 'am-ET';
    let result;

    if (isAmharic) {
      result = await this.callGemini(userMessage, 'am-ET');
      if (result.error) result = await this.callGroq(userMessage, 'am-ET');
    } else {
      result = await this.callGroq(userMessage, 'en-US');
      if (result.error) result = await this.callGemini(userMessage, 'en-US');
    }

    if (result.noKey) {
      return {
        text: isAmharic
          ? 'ለመረጃ ረዳት አገልግሎት የAI ቁልፍ (API Key) አልተዘጋጀም።'
          : 'AI service not configured. Please add a Groq or Gemini API key.',
        category: 'System',
      };
    }

    if (result.error) {
      return {
        text: isAmharic
          ? 'ይቅርታ፣ መልስ ማግኘት አልተቻለም። እባክዎን እንደገና ይሞክሩ።'
          : 'Sorry, I could not get a response. Please try again.',
        category: 'System',
      };
    }

    return { text: sanitize(result.text), category: 'AI Response' };
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.geminiKey) return text;

    const targetLang = targetLanguage === 'am-ET' ? 'Amharic' : 'English';
    const prompt = `Translate the following text to ${targetLang}. Only provide the translation:\n\n${text}`;

    try {
      const res = await this.callGeminiRaw(prompt);
      return sanitize(res || text);
    } catch {
      return text;
    }
  }

  private async callGroq(message: string, language: string) {
    if (!this.groqKey) return { text: '', error: true, noKey: true };

    const systemPrompt = language === 'am-ET'
      ? 'አንተ እርዳታ የምትሰጥ የAI ረዳት ነህ። በአማርኛ በተፈጥሮ እና በግልጽ መልስ ስጥ። መልስህ አጭር እና ጠቃሚ ይሁን።'
      : 'You are a helpful AI assistant. Respond clearly and naturally in English. Keep responses concise and useful.';

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

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

      const data = await response.json();
      return { text: data.choices[0].message.content.trim(), language };
    } catch {
      return { text: '', error: true };
    }
  }

  private async callGemini(message: string, language: string) {
    if (!this.geminiKey) return { text: '', error: true, noKey: true };

    const systemPrompt = language === 'am-ET'
      ? 'አንተ እርዳታ የምትሰጥ የAI ረዳት ነህ። በአማርኛ በተፈጥሮ እና በግልጽ መልስ ስጥ። መልስህ አጭር እና ጠቃሚ ይሁን።'
      : 'You are a helpful AI assistant. Respond clearly and naturally in English. Keep responses concise and useful.';

    try {
      const text = await this.callGeminiRaw(`${systemPrompt}\n\nUser: ${message}`);
      if (!text) throw new Error('Empty Gemini response');
      return { text: text.trim(), language };
    } catch {
      return { text: '', error: true };
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

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }
}
