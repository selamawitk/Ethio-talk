const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function safeGetLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (raw.length > 500000) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeSetLocal(key, value) {
  try {
    const str = JSON.stringify(value);
    if (str.length > 500000) return;
    localStorage.setItem(key, str);
  } catch {}
}

export async function saveChatMessage(transcription, response, language, score) {
  try {
    await fetchWithTimeout(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription, response, language, pronunciationScore: score }),
    });
  } catch {
    saveToLocal(transcription, response, language, score);
  }
}

export async function getChatHistory() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/chat`);
    if (!res.ok) throw new Error('Backend error');
    return await res.json();
  } catch {
    return getFromLocal();
  }
}

export async function clearChatHistory() {
  try {
    await fetchWithTimeout(`${API_BASE}/api/chat`, { method: 'DELETE' });
  } catch {
    localStorage.removeItem('voice_chat_history');
  }
}

export async function getStats() {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/chat/stats`);
    if (!res.ok) throw new Error('Backend error');
    return await res.json();
  } catch {
    return getStatsFromLocal();
  }
}

export async function clearStats() {
  try {
    await fetchWithTimeout(`${API_BASE}/api/chat/stats`, { method: 'DELETE' });
  } catch {
    localStorage.removeItem('voice_stats_history');
  }
}

function saveToLocal(transcription, response, language, score) {
  const history = getFromLocal();
  history.unshift({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    transcription,
    response,
    language,
    pronunciationScore: score,
  });
  if (history.length > 100) history.splice(100);
  safeSetLocal('voice_chat_history', history);
  updateLocalStats(language, score);
}

function getFromLocal() {
  return safeGetLocal('voice_chat_history') || [];
}

function updateLocalStats(language, score) {
  const stats = getStatsFromLocal();
  stats.totalRecordings += 1;
  stats.languages[language] = (stats.languages[language] || 0) + 1;
  if (score != null) {
    stats.pronunciationScores.push(score);
    if (stats.pronunciationScores.length > 100) stats.pronunciationScores.shift();
  }
  stats.lastUpdated = new Date().toISOString();
  safeSetLocal('voice_stats_history', stats);
}

function getStatsFromLocal() {
  return safeGetLocal('voice_stats_history') || {
    totalRecordings: 0, languages: {}, pronunciationScores: [], lastUpdated: null,
  };
}
