const GOOGLE_TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY;

export async function speakWithGoogleTTS(text, languageCode = 'en-US') {
  const voiceConfig =
    languageCode === 'am-ET'
      ? { languageCode: 'am-ET', name: 'am-ET-Standard-A', ssmlGender: 'FEMALE' }
      : { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' };

  try {
    const response = await fetch(`${GOOGLE_TTS_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: voiceConfig,
        audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 1.0 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error('No audio content returned from Google TTS API');
    }

    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    await audio.play();

    return { success: true };
  } catch (error) {
    console.error('Google TTS Error:', error);
    fallbackBrowserTTS(text, languageCode);
    return { success: false, fallback: true };
  }
}

function fallbackBrowserTTS(text, languageCode = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported in this browser');
    return;
  }

  const speak = () => {
    const voices = window.speechSynthesis.getVoices();
    const targetLang = languageCode === 'am-ET' ? 'am' : 'en';
    const selectedVoice = voices.find(v => v.lang.startsWith(targetLang)) || voices[0];

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = speak;
  } else {
    speak();
  }
}
