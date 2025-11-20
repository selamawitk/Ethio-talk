export const amharicResponses = {
  greeting: [
    'ሰላም! እንዴት ነህ? ዛሬ እንዴት ተሰማህ?',
    'ሰላም! እንኳን ደህና መጣህ። እንዴት ነህ?',
    'ሰላም ጓደኛዬ! ዛሬ እንደምን ነው አይተኝ?',
    'ሰላም! በዛሬ ቀን ምን ታደርጋለህ?'
  ],

  health: [
    'ጤናህ እንደምን ነው? ቢሆን እንኳን እርግጠኛ ሆነኝ። በቀላሉ ይሻላል።',
    'ጤና በሰው ሕይወት በጣም አስፈላጊ ነው። እርግጠኛ ሆነኝ እንደምታሻል።',
    'አምላክ ጤና ይስጥህ። ብዙ ዕረፍት እና ውሃ ይርዳሃል።',
    'እንደምታሻል ተስፋ አደርጋለሁ። ከባድ ከሆነ ዶክተር መመከት አስፈላጊ ነው።'
  ],

  farming: [
    'እርሻ እጅግ አስፈላጊ ነው። ጊዜውን በጥንቃቄ መጠቀም ያስፈልጋል።',
    'የሰብል አመት በተሻለ መልኩ ይሂድ ዘንድ አምላክ ይባርክ።',
    'መሬት መዝራት ወይም መከር ያስተማረከኝ። ስራ በጥንቃቄ አድርግ።',
    'ለገበሬዎች ጊዜ አስፈላጊ ነው። በእርሻ ላይ መጠን በመጠቀም እንዲበቃ ትኩረት አድርግ።'
  ],

  weather: [
    'ዝናብ እየዘነበ ነው። ቤት ውስጥ መቆየት ይሻላል።',
    'ዛሬ ቀዝቃዛ ነው። ልብስ ያዘጋጁ እና በቀዝቃዛ አየር ትኩረት ይስጡ።',
    'ሙቀት እጅግ ከፍ ነው። ውሃ ብዙ ጠጣ እና በጥሩ ቦታ ዕረፍት አድርግ።',
    'አየሩ ቀላል ነው። ዛሬ ውጭ መውጣት አስተስፋ ነው።'
  ],

  education: [
    'ትምህርት ሀብት ነው። ሁልጊዜ በመማር ላይ ቆይ።',
    'መማር አትዘን። እውቀት የህይወት ብርሃን ነው።',
    'ዛሬ በማማር ላይ ስራ አድርግ። የተማርከው እንደገና አይጠፋም።',
    'መማር ትኩረት አስፈላጊ ነው። ሁሉን ቀን ትኩረት ስጥ።'
  ],

  work: [
    'ስራ ታላቅ ነው። አንተን እና ቤተሰብህን ያስተዳድራል።',
    'በትኩረት ስራህን አድርግ። ውጤቱ በኋላ ይታያል።',
    'ስራ ይሻላል። የምታደርገውን አትቋረጥ። በጥሩ አእምሮ ቀጥል።',
    'እንኳን በስራ ደስ ይበልህ። ታቀደ ሰው ሁሌ ይጠቃል።'
  ],

  market: [
    'ገበያ ዛሬ ተወዳጅ ነው። ዕቃህን በጥሩ ዋጋ ሊሸጥ ትችላለህ።',
    'ዋጋ በግልጽ ሁኔታ ቀንሷል። መግዛት ወይም መሸጥ በጊዜ አድርግ።',
    'ገበያ የተሻለ እድል ነው። በትኩረት አንተ ትችላለህ።',
    'ዛሬ በገበያ ውስጥ በጥሩ አየር ነው። የተሻለ ዕቃ ለመሸጥ እድል አለ።'
  ],

  general: [
    'እሺ፣ አዎን። ሌላ ምን ልረዳህ?',
    'ጥያቄህን አውቃለሁ። እንደገና ጠይቅ እና እርዳለሁ።',
    'እንደምታስተምር ይመስላል። ተጨማሪ መረጃ ትፈልጋለህ?',
    'አመሰግናለሁ። እንደገና ተናገር። እኔ እርዳለሁ።'
  ]
};

export function getAmharicResponse(detectedCategory = 'general') {
  const responses = amharicResponses[detectedCategory] || amharicResponses.general;
  return responses[Math.floor(Math.random() * responses.length)];
}

export function detectAmharicCategory(text) {
  const lowerText = text.toLowerCase();

  const greetingKeywords = ['ሰላም', 'እንዴት', 'ምን አደርኩ', 'እንኳን', 'መልካም'];
  const healthKeywords = ['ህመም', 'በሽታ', 'ጤና', 'እባክህ', 'ዶክተር', 'ክሊኒክ'];
  const farmingKeywords = ['እርሻ', 'ተክል', 'ሰብል', 'ገብር', 'አርሶ', 'መሬት'];
  const weatherKeywords = ['ዝናብ', 'ሙቀት', 'ቀዝቃዛ', 'አየር', 'ነፋስ'];
  const educationKeywords = ['ትምህርት', 'መማር', 'ተማሪ', 'ትምህርት ቤት', 'መምህር'];
  const workKeywords = ['ስራ', 'ቦታ', 'ሥራ', 'ተቀጠር', 'ገቢ'];
  const marketKeywords = ['ገበያ', 'ዋጋ', 'ተገዛ', 'ሸጥ', 'መደብር'];

  if (healthKeywords.some(kw => lowerText.includes(kw))) return 'health';
  if (farmingKeywords.some(kw => lowerText.includes(kw))) return 'farming';
  if (weatherKeywords.some(kw => lowerText.includes(kw))) return 'weather';
  if (educationKeywords.some(kw => lowerText.includes(kw))) return 'education';
  if (workKeywords.some(kw => lowerText.includes(kw))) return 'work';
  if (marketKeywords.some(kw => lowerText.includes(kw))) return 'market';
  if (greetingKeywords.some(kw => lowerText.includes(kw))) return 'greeting';

  return 'general';
}
