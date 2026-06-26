const LANGUAGE_RANGES = {
  'am-ET': { pattern: /[\u1200-\u137F]/g, name: 'Amharic' },
  'om-ET': { pattern: /[\u1200-\u137F]/g, name: 'Oromiffa' },
};

const ENGLISH_PATTERN = /[a-zA-Z]/g;

export function cleanTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RECOGNITION_SUPPORT = {
  'am-ET': true,
  'en-US': true,
  'om-ET': false,
};

export function isRecognitionSupported(languageCode) {
  return RECOGNITION_SUPPORT[languageCode] === true;
}

export const detectLanguage = (text, preferredLanguage = null) => {
  if (!text) return preferredLanguage || 'en-US';

  if (preferredLanguage && ['am-ET', 'om-ET', 'en-US'].includes(preferredLanguage)) {
    return preferredLanguage;
  }

  const ethiopicCount = (text.match(LANGUAGE_RANGES['am-ET'].pattern) || []).length;
  const englishCount = (text.match(ENGLISH_PATTERN) || []).length;

  if (ethiopicCount > englishCount) {
    if (ethiopicCount > 0) return 'am-ET';
  }
  if (englishCount > 0) return 'en-US';

  return 'en-US';
};

export const getLanguageName = (languageCode) => {
  const languageNames = {
    'am-ET': 'Amharic',
    'om-ET': 'Oromiffa',
    'en-US': 'English',
  };
  return languageNames[languageCode] || 'Unknown';
};

export const getRecognitionLang = (languageCode) => {
  if (RECOGNITION_SUPPORT[languageCode]) return languageCode;
  return 'en-US';
};
