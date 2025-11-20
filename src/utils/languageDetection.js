export const detectLanguage = (text) => {
  if (!text) return 'en-US';

  const amharicPattern = /[አ-ፐ]/g;
  const englishPattern = /[a-zA-Z]/g;

  const amharicCount = (text.match(amharicPattern) || []).length;
  const englishCount = (text.match(englishPattern) || []).length;

  if (amharicCount > englishCount) return 'am-ET';
  if (englishCount > 0) return 'en-US';

  return 'en-US';
};

export const getLanguageName = (languageCode) => {
  const languageNames = {
    'am-ET': 'Amharic',
    'en-US': 'English',
  };
  return languageNames[languageCode] || 'Unknown';
};
