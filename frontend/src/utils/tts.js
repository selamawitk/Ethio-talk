function findVoice(voices, langPrefix) {
  return voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
    || voices.find(v => v.lang.toLowerCase().split('-')[0] === langPrefix)
    || voices.find(v => v.lang.toLowerCase().split('_')[0] === langPrefix);
}

export function speakText(text, languageCode = 'en-US') {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  const voices = speechSynthesis.getVoices();
  const targetLangPrefix = languageCode === 'am-ET' ? 'am' : languageCode === 'om-ET' ? 'om' : 'en';
  const matchingVoice = findVoice(voices, targetLangPrefix);

  const utterance = new SpeechSynthesisUtterance(text);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }
  utterance.lang = matchingVoice ? matchingVoice.lang : languageCode;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (voices.length === 0) {
    let tried = false;
    const onVoicesChanged = () => {
      if (tried) return;
      tried = true;
      speechSynthesis.cancel();
      const loadedVoices = speechSynthesis.getVoices();
      const loadedMatch = findVoice(loadedVoices, targetLangPrefix);
      if (loadedMatch) utterance.voice = loadedMatch;
      utterance.lang = loadedMatch ? loadedMatch.lang : languageCode;
      speechSynthesis.speak(utterance);
      speechSynthesis.onvoiceschanged = null;
    };
    speechSynthesis.onvoiceschanged = onVoicesChanged;
    setTimeout(() => {
      if (!tried) {
        tried = true;
        speechSynthesis.onvoiceschanged = null;
        speechSynthesis.speak(utterance);
      }
    }, 2000);
  } else {
    speechSynthesis.speak(utterance);
  }
}
