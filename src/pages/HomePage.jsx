import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MicButton from '../components/MicButton';
import VoiceWave from '../components/VoiceWave';
import OrbVisualization from '../components/OrbVisualization';
import ProcessingCircle from '../components/ProcessingCircle';
import TranscriptionResult from '../components/TranscriptionResult';
import ResponseBox from '../components/ResponseBox';
import Timer from '../components/Timer';
import { MessageSquare, History, Info, Globe, Star } from 'lucide-react';
import { detectLanguage, getLanguageName } from '../utils/languageDetection';
import { getDeepSeekResponse } from '../utils/deepSeek';
import { speakWithGoogleTTS } from '../utils/googleTTS';
import { saveChatMessage } from '../utils/ChatHistory';
import { getAmharicResponse, detectAmharicCategory } from '../utils/amharicResponses';

export default function HomePage() {
  const [state, setState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseCategory, setResponseCategory] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const processingIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Speech recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = 'am-ET';

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      setTranscribedText(transcript);
      const langCode = detectLanguage(transcript);
      setDetectedLanguage(langCode);
      const clarity = Math.floor(confidence * 100);
      setPronunciationScore(clarity);
      setState('processing');
      startProcessingAnimation();

      try {
        let finalResponse = '';
        let category = 'AI Response';

        if (langCode === 'am-ET') {
          const amharicCategory = detectAmharicCategory(transcript);
          finalResponse = getAmharicResponse(amharicCategory);
          category = amharicCategory;
        } else {
          const deepSeekResp = await getDeepSeekResponse(transcript, 'en-US');
          if (deepSeekResp.error && deepSeekResp.noKey) {
            finalResponse = 'Hello! I am here to help you. Please ask your question.';
          } else if (deepSeekResp.error || !deepSeekResp.text) {
            finalResponse = 'I apologize, but I could not process your request. Please try again.';
          } else {
            finalResponse = deepSeekResp.text;
          }
        }

        setResponseText(finalResponse);
        setResponseCategory(category);
        saveChatMessage(transcript, finalResponse, langCode, clarity);
        stopProcessingAnimation();
        setState('completed');

        setTimeout(() => {
          speakWithGoogleTTS(finalResponse, langCode);
        }, 500);
      } catch (err) {
        console.error('Processing error:', err);
        stopProcessingAnimation();
        setState('idle');
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      stopProcessingAnimation();
      setState('idle');
    };

    recognitionRef.current = recognition;
  }, []);

  // Timer + audio visualizer
  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
      startAudioAnalysis();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudioAnalysis();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const startProcessingAnimation = () => {
    setProcessingProgress(0);
    let progress = 0;
    processingIntervalRef.current = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 95) {
        progress = 95;
        clearInterval(processingIntervalRef.current);
      }
      setProcessingProgress(Math.min(progress, 95));
    }, 300);
  };

  const stopProcessingAnimation = () => {
    if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
    setProcessingProgress(100);
  };

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (state !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 128);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (error) {
      console.error('Mic access error:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const handleMicClick = () => {
    if (state === 'idle') {
      setState('recording');
      setSeconds(0);
      setTranscribedText('');
      setResponseText('');
      setResponseCategory('');
      setDetectedLanguage('');
      setPronunciationScore(null);
      if (recognitionRef.current) recognitionRef.current.start();
    } else if (state === 'recording') {
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };

  const handleReset = () => {
    setState('idle');
    setSeconds(0);
    setProcessingProgress(0);
    setTranscribedText('');
    setResponseText('');
    setResponseCategory('');
    setDetectedLanguage('');
    setPronunciationScore(null);
  };

  const handleSpeak = () => {
    if (responseText && detectedLanguage) speakWithGoogleTTS(responseText, detectedLanguage);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      }`}
    >
      {/* Top bar */}
      <div className="flex justify-between p-6">
        <button
          onClick={() => navigate('/about')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            darkMode
              ? 'bg-slate-800/50 hover:bg-slate-700/70 text-cyan-500'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Info className="w-5 h-5" />
          <span>About</span>
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            darkMode
              ? 'bg-slate-800/50 hover:bg-slate-700/70'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <span>{darkMode ? '☀️ Light' : '🌙 Dark'}</span>
        </button>
      </div>

      {/* Main section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {state === 'completed' && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                  darkMode ? 'bg-slate-800/40 text-white' : 'bg-white text-black'
                }`}
              >
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-lg font-semibold">
                  Language: <strong>{getLanguageName(detectedLanguage)}</strong>
                </span>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                  darkMode ? 'bg-slate-800/40 text-white' : 'bg-white text-black'
                }`}
              >
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold">
                  Clarity: <strong>{pronunciationScore}%</strong>
                </span>
              </div>
            </div>
          )}

          {state === 'idle' && (
            <>
              <h1 className="text-4xl -mt-10 md:text-5xl font-bold text-center animate-fade-in">
                Hello, would you like
                <br />
                to record now?
              </h1>
              <div className="flex items-center justify-center animate-fade-in -mt-14 -mb-14">
                <div className="w-[405px] h-[405px]">
                  <OrbVisualization />
                </div>
              </div>
            </>
          )}

          {state === 'recording' && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-center">Recording...</h1>
              <div className="flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl h-[270px]">
                  <VoiceWave isRecording={true} audioLevel={audioLevel} />
                </div>
                {/* Small timer under the wave */}
                <div className="mt-2">
                  <Timer seconds={seconds} size="small" />
                </div>
              </div>
            </>
          )}

          {state === 'processing' && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-center">
                Processing your speech...
              </h1>
              <ProcessingCircle percentage={Math.round(processingProgress)} />
            </>
          )}

          {state === 'completed' && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
                Transcription Complete
              </h1>
              <div className="space-y-8">
                <TranscriptionResult text={transcribedText} />
                {responseText && (
                  <ResponseBox
                    responseText={responseText}
                    category={responseCategory}
                    onSpeak={handleSpeak}
                  />
                )}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-green-700 mt-4 rounded-2xl text-white font-semibold text-lg hover:shadow-[0_0_50px_rgba(34,197,94,0.4)] transition-all duration-300"
                >
                  🎙️ Record Again
                </button>
              </div>
            </>
          )}

          {/* Bottom controls */}
          <div className="flex items-center justify-center gap-8 pt-8">
            {state !== 'completed' && (
              <button
                onClick={() => navigate('/chat-history')}
                className={`w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 ${
                  darkMode
                    ? 'bg-gradient-to-br from-teal-600/30 to-teal-700/30 border border-teal-500/40'
                    : 'bg-green-200 border border-green-400'
                }`}
              >
                <MessageSquare
                  className={`w-6 h-6 ${darkMode ? 'text-teal-300' : 'text-green-600'}`}
                />
              </button>
            )}

            <div className="flex flex-col items-center gap-4">
              <MicButton
                isRecording={state === 'recording'}
                isProcessing={state === 'processing'}
                onClick={handleMicClick}
              />
              <span className={`${darkMode ? 'text-gray-600' : 'text-black'} text-lg mb-3`}>
                {state === 'recording'
                  ? 'Stop Recording'
                  : state === 'idle'
                  ? 'Record Now'
                  : state === 'processing'
                  ? 'Processing...'
                  : ''}
              </span>
            </div>

            {state !== 'completed' && (
              <button
                onClick={() => navigate('/stats-history')}
                className={`w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/40'
                    : 'bg-green-200 border border-green-400'
                }`}
              >
                <History
                  className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-green-600'}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
