import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MicButton from '../components/MicButton';
import VoiceWave from '../components/VoiceWave';
import OrbVisualization from '../components/OrbVisualization';
import ProcessingCircle from '../components/ProcessingCircle';
import TranscriptionResult from '../components/TranscriptionResult';
import ResponseBox from '../components/ResponseBox';
import Timer from '../components/Timer';
import { Globe } from 'lucide-react';
import { detectLanguage, getLanguageName } from '../utils/languageDetection';
import { getAIResponse } from '../utils/aiService';
import { speakText } from '../utils/tts';
import { saveChatMessage } from '../utils/ChatHistory';

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage({ darkMode, selectedLanguage, setSelectedLanguage }) {
  const [state, setState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseCategory, setResponseCategory] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const processingIntervalRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const isManualStopRef = useRef(false);
  const stateRef = useRef(state);
  const levelAnimRef = useRef(null);

  stateRef.current = state;

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setRecognitionSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = selectedLanguage;

    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (fullTranscript) {
        accumulatedTranscriptRef.current += fullTranscript;
        setTranscribedText(accumulatedTranscriptRef.current.trim());
      }
    };

    recognition.onerror = () => {
      stopProcessingAnimation();
      stopAudioAnalysis();
      setState('idle');
    };

    recognition.onend = async () => {
      if (isManualStopRef.current) {
        isManualStopRef.current = false;
        const transcript = accumulatedTranscriptRef.current.trim();
        if (transcript && transcript.length > 2) {
          await processTranscript(transcript);
        } else {
          setState('idle');
        }
      } else if (stateRef.current === 'recording') {
        setTimeout(() => {
          try { recognition.start(); } catch { setState('idle'); }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
  }, [selectedLanguage]);

  useEffect(() => {
    if (state === 'recording') {
      timerRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
      startAudioAnalysis();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAudioAnalysis();
    };
  }, [state]);

  const processTranscript = async (transcript) => {
    setTranscribedText(transcript);
    const langCode = detectLanguage(transcript, selectedLanguage);
    setDetectedLanguage(langCode);
    setState('processing');
    startProcessingAnimation();

    try {
      const aiResult = await getAIResponse(transcript, langCode);
      setResponseText(aiResult.text);
      setResponseCategory(aiResult.category);
      saveChatMessage(transcript, aiResult.text, langCode);
      setState('completed');

      setTimeout(() => {
        speakText(aiResult.text, langCode);
      }, 500);
    } catch {
      setResponseText('');
      setState('idle');
    } finally {
      stopProcessingAnimation();
    }
  };

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
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
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
        if (stateRef.current !== 'recording') return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 128);
        levelAnimRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch {
      stopAudioAnalysis();
    }
  };

  const stopAudioAnalysis = () => {
    if (levelAnimRef.current) {
      cancelAnimationFrame(levelAnimRef.current);
      levelAnimRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const handleMicClick = () => {
    if (state === 'idle') {
      if (!recognitionRef.current) return;
      recognitionRef.current.lang = selectedLanguage;
      try {
        recognitionRef.current.start();
        accumulatedTranscriptRef.current = '';
        isManualStopRef.current = false;
        setState('recording');
        setSeconds(0);
        setTranscribedText('');
        setResponseText('');
        setResponseCategory('');
        setDetectedLanguage('');
      } catch {
        setState('idle');
      }
    } else if (state === 'recording') {
      isManualStopRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          setState('idle');
        }
      }
    }
  };

  const handleReset = () => {
    stopAudioAnalysis();
    setState('idle');
    setSeconds(0);
    setProcessingProgress(0);
    setTranscribedText('');
    setResponseText('');
    setResponseCategory('');
    setDetectedLanguage('');
  };

  const handleSpeak = () => {
    if (responseText && detectedLanguage) speakText(responseText, detectedLanguage);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-3 md:px-4 pb-1">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {state === 'completed' && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row justify-center md:justify-between items-center mb-2 md:mb-3 gap-2 md:gap-3"
              >
                <div
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl backdrop-blur-sm text-sm md:text-base ${
                    darkMode ? 'bg-slate-800/40 text-white' : 'bg-white text-black'
                  }`}
                >
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  <span className="font-semibold">
                    <span className="hidden sm:inline">Language: </span>
                    <strong>{getLanguageName(detectedLanguage)}</strong>
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <motion.h1
                  variants={fadeInUp}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-center px-2"
                >
                  Hello, would you like
                  <br />
                  to record now?
                </motion.h1>
                {!recognitionSupported && (
                  <motion.p variants={fadeInUp} className="text-red-400 text-sm mt-3 text-center">
                    Speech recognition not supported in this browser. Please use Chrome.
                  </motion.p>
                )}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center justify-center"
                >
                  <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px]">
                    <OrbVisualization />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {state === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <motion.h1
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-center"
                >
                  Recording...
                </motion.h1>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-full max-w-xl md:max-w-2xl h-[140px] sm:h-[160px] md:h-[180px]">
                    <VoiceWave isRecording={true} audioLevel={audioLevel} />
                  </div>
                  <div className="mt-1 md:mt-2">
                    <Timer seconds={seconds} />
                  </div>
                </div>
              </motion.div>
            )}

            {state === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex flex-col items-center"
              >
                <motion.h1
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-lg sm:text-xl md:text-2xl font-bold text-center"
                >
                  Processing your speech...
                </motion.h1>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <ProcessingCircle percentage={Math.round(processingProgress)} />
              </motion.div>
            )}

            {state === 'completed' && (
              <motion.div
                key="completed"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <motion.h1
                  variants={fadeInUp}
                  className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 md:mb-3"
                >
                  Transcription Complete
                </motion.h1>
                <div className="space-y-2 md:space-y-3">
                  <motion.div variants={fadeInUp}>
                    <TranscriptionResult text={transcribedText} onEdit={setTranscribedText} />
                  </motion.div>
                  {responseText && (
                    <motion.div variants={fadeInUp}>
                      <ResponseBox
                        responseText={responseText}
                        category={responseCategory}
                        onSpeak={handleSpeak}
                      />
                    </motion.div>
                  )}
                </div>
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center mt-2 md:mt-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(34,197,94,0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-2xl text-white font-semibold text-sm md:text-base transition-all duration-300"
                  >
                    Record Again
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 md:gap-6 pt-1 md:pt-2"
          >
            <div className="flex flex-col items-center gap-2 md:gap-4">
              <MicButton
                isRecording={state === 'recording'}
                isProcessing={state === 'processing'}
                onClick={handleMicClick}
              />
              <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                {state === 'recording'
                  ? 'Stop Recording'
                  : state === 'idle'
                  ? 'Tap to Record'
                  : state === 'processing'
                  ? 'Processing...'
                  : ''}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
