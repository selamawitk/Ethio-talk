export function speakText(text, languageCode = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  const speak = () => {
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const targetLang = languageCode === 'am-ET' ? 'am' : languageCode === 'om-ET' ? 'om' : 'en';
    const selectedVoice = voices.find(v => v.lang.startsWith(targetLang)) || voices[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speak;
  } else {
    speak();
  }
}
