const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export async function getDeepSeekResponse(userMessage, language) {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API key not configured');
    return { text: '', language: language, error: true, noKey: true };
  }

  const systemPrompt = language === 'am-ET'
    ? 'አንተ እርዳታ ያለው የAI ረዳት ነህ። በአማርኛ በግልጽ እና በተፈጥሮ መልስ ስጥ። መልስህ ትክክለኛ፣ ጠቃሚ እና ተስማሚ መሆን አለበት።'
    : 'You are a helpful AI assistant. Respond clearly and naturally in English. Your responses should be accurate, helpful, and relevant.';

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content.trim(),
      language: language
    };
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return {
      text: '',
      language: language,
      error: true
    };
  }
}

export async function translateWithDeepSeek(text, targetLanguage) {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API key not configured');
    return text;
  }

  const systemPrompt = targetLanguage === 'am-ET'
    ? 'You are a professional translator. Translate the following text to Amharic. Only provide the translation, no explanations.'
    : 'You are a professional translator. Translate the following text to English. Only provide the translation, no explanations.';

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('DeepSeek Translation Error:', error);
    return text;
  }
}
