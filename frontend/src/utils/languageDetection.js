const ETHIOPIC_RANGE = /[\u1200-\u137F]/;
const OROMIFFA_COMMON = /\b(akkam|jirtu|hojii|nyaata|bishaan|gaafi|deebii|guyyaa|hanga|yoo|kan|itti|waan|tokko|lama|sadi|afur|shan|jaa|torba|saddeet|sagal|kudhan|maqaa|gama|keessa|irra|waliin|fakkaata|jedhu|jedhi)\b/i;

export function cleanTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRecognitionSupported(languageCode) {
  return ['am-ET', 'om-ET', 'en-US'].includes(languageCode);
}

export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en-US';

  if (ETHIOPIC_RANGE.test(text)) return 'am-ET';

  const lower = text.toLowerCase();
  if (OROMIFFA_COMMON.test(lower)) return 'om-ET';

  const latinWordCount = (text.match(/[a-zA-Z]{2,}/g) || []).length;
  if (latinWordCount > 0) return 'en-US';

  return 'en-US';
}

export function getLanguageName(languageCode) {
  const names = {
    'am-ET': 'Amharic',
    'om-ET': 'Oromiffa',
    'en-US': 'English',
  };
  return names[languageCode] || 'Unknown';
}

export function getRecognitionLang(languageCode) {
  if (['am-ET', 'om-ET', 'en-US'].includes(languageCode)) return languageCode;
  return 'en-US';
}
