export function speakText(text, languageCode = 'en-US') {
  if (!('speechSynthesis' in window)) return;

  const voices = window.speechSynthesis.getVoices();
  const targetLangPrefix = languageCode === 'am-ET' ? 'am' : languageCode === 'om-ET' ? 'om' : 'en';
  const matchingVoice = voices.find(v => v.lang.startsWith(targetLangPrefix));

  const utterance = new SpeechSynthesisUtterance(text);
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }
  utterance.lang = languageCode;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  if (voices.length === 0) {
    const onVoicesChanged = () => {
      window.speechSynthesis.cancel();
      const loadedVoices = window.speechSynthesis.getVoices();
      const loadedMatch = loadedVoices.find(v => v.lang.startsWith(targetLangPrefix));
      if (loadedMatch) utterance.voice = loadedMatch;
      utterance.lang = languageCode;
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.onvoiceschanged = null;
    };
    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    setTimeout(() => {
      if (window.speechSynthesis.onvoiceschanged === onVoicesChanged) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
  } else {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
}
