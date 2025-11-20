// src/utils/translate.js

const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_TRANSLATE_API_KEY;

/**
 * Translate text to a target language using Google Translate API.
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code ('en' for English, 'am' for Amharic)
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLanguage) {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Translate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation Error:', error);
    return text; // fallback: return original text
  }
}

/**
 * Translate Amharic text to English
 * @param {string} amharicText
 * @returns {Promise<string>} - Translated English text
 */
export async function translateAmharicToEnglish(amharicText) {
  return translateText(amharicText, 'en');
}

/**
 * Translate English text to Amharic
 * @param {string} englishText
 * @returns {Promise<string>} - Translated Amharic text
 */
export async function translateEnglishToAmharic(englishText) {
  return translateText(englishText, 'am');
}
