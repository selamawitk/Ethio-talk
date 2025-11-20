const CHAT_HISTORY_KEY = 'voice_chat_history';
const STATS_HISTORY_KEY = 'voice_stats_history';

export function saveChatMessage(transcription, response, language, score) {
  const history = getChatHistory();
  const newMessage = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    transcription,
    response,
    language,
    pronunciationScore: score
  };

  history.unshift(newMessage);

  if (history.length > 100) {
    history.splice(100);
  }

  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  updateStats(language, score);
}

export function getChatHistory() {
  try {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

function updateStats(language, score) {
  const stats = getStats();

  stats.totalRecordings += 1;
  stats.languages[language] = (stats.languages[language] || 0) + 1;

  if (score) {
    stats.pronunciationScores.push(score);
    if (stats.pronunciationScores.length > 100) {
      stats.pronunciationScores.shift();
    }
  }

  stats.lastUpdated = new Date().toISOString();

  localStorage.setItem(STATS_HISTORY_KEY, JSON.stringify(stats));
}

export function getStats() {
  try {
    const data = localStorage.getItem(STATS_HISTORY_KEY);
    return data ? JSON.parse(data) : {
      totalRecordings: 0,
      languages: {},
      pronunciationScores: [],
      lastUpdated: null
    };
  } catch (error) {
    console.error('Error loading stats:', error);
    return {
      totalRecordings: 0,
      languages: {},
      pronunciationScores: [],
      lastUpdated: null
    };
  }
}

export function clearStats() {
  localStorage.removeItem(STATS_HISTORY_KEY);
}
