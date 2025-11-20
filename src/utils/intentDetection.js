// Keywords for Farming (እርሻ)
const farmingKeywords = ['ጤፍ', 'ወeat', 'ብር', 'ሙሉ', 'ተክል', 'ማሳ', 'ገዶ', 'በሎሻ', 'ምርት', 'ሰብሳቢ', 'ምጥ', 'ፈሪቃ', 'ሕንጻ'];

// Keywords for Weather (አየር ሁኔታ)
const weatherKeywords = ['ዝናብ', 'አየር', 'ሙቀት', 'ቀዝቃዝ', 'ነፋስ', 'ደመና', 'ፀሐይ', 'ከባቢ', 'ሁኔታ'];

// Keywords for Health (ጤና)
const healthKeywords = ['ህመም', 'በሽታ', 'ሕክምና', 'ዶክተር', 'ክሊኒክ', 'መድሃኒት', 'ህክምት', 'ደም', 'ታካሚ'];

// Keywords for Education (ትምህርት)
const educationKeywords = ['ትምህርት', 'ትምህርት', 'ብሙት', 'ቃላት', 'ማሰልጠን', 'ት', 'ዩኒቨርሲቲ', 'ትምህርት', 'ክፍል'];

// Keywords for Jobs (ስራ)
const jobsKeywords = ['ስራ', 'ስራ', 'ቦታ', 'ስራ', 'ሥራ', 'ሥራ', 'ሥራ', 'ክፍል'];

// Keywords for Market (ገበያ)
const marketKeywords = ['ዋጋ', 'ገቢ', 'መደብር', 'ሸያጥ', 'ኩሪ', 'ምግብ', 'ዓይነት', 'ገበያ'];

/**
 * Detects the intent of a given text string based on a predefined list of Amharic keywords.
 * Performs case-insensitive matching.
 *
 * @param {string} text - The input text string (expected to be in Amharic).
 * @returns {string} The detected intent category. Defaults to 'general'.
 */
export function detectIntent(text) {
  const lowerText = text.toLowerCase();

  if (farmingKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'farming';
  }
  if (weatherKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'weather';
  }
  if (healthKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'health';
  }
  if (educationKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'education';
  }
  if (jobsKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'jobs';
  }
  if (marketKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
    return 'market';
  }

  return 'general';
}
