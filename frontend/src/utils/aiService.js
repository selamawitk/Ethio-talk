const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export async function getAIResponse(userMessage, detectedLanguage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, language: detectedLanguage }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeout);
    return {
      text: `Connection error: ${err.message}`,
      category: 'System',
    };
  }
}
