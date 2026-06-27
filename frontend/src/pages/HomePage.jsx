import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Globe } from 'lucide-react';
import MicButton from '../components/MicButton';
import VoiceWave from '../components/VoiceWave';
import OrbVisualization from '../components/OrbVisualization';
import TranscriptionResult from '../components/TranscriptionResult';
import ResponseBox from '../components/ResponseBox';
import Timer from '../components/Timer';
import { detectLanguage, getLanguageName, cleanTranscript, isRecognitionSupported, getRecognitionLang } from '../utils/languageDetection';
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

export default function HomePage({ darkMode, selectedLanguage }) {
  const [state, setState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseCategory, setResponseCategory] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [detectedLang, setDetectedLang] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const stateRef = useRef(state);
  const levelAnimRef = useRef(null);
  const mountedRef = useRef(true);

  stateRef.current = state;

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const stopAudioAnalysis = useCallback(() => {
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
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
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
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('No microphone found. Please connect a microphone and try again.');
      } else {
        setErrorMsg('Could not access microphone. Please check your device settings.');
      }
      setState('error');
    }
  }, []);

  const processTranscript = useCallback(async (rawTranscript) => {
    accumulatedTranscriptRef.current = '';
    const transcript = cleanTranscript(rawTranscript);
    if (!transcript || transcript.length < 2) {
      stopAudioAnalysis();
      if (mountedRef.current) setState('idle');
      return;
    }

    setTranscribedText(transcript);
    const langCode = detectLanguage(transcript);
    setDetectedLang(langCode);
    setState('transcribing');

    await new Promise((r) => setTimeout(r, 400));

    if (!mountedRef.current) return;
    setState('ai_processing');

    try {
      const aiResult = await getAIResponse(transcript, langCode);
      if (!mountedRef.current) return;
      setResponseText(aiResult.text);
      setResponseCategory(aiResult.category || '');
      saveChatMessage(transcript, aiResult.text, langCode).catch(() => {});
      setState('completed');
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMsg(err.message || 'Failed to get AI response. Please check your connection.');
      setState('error');
    }
  }, [stopAudioAnalysis]);

  const processTranscriptRef = useRef(processTranscript);
  processTranscriptRef.current = processTranscript;

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
    recognition.lang = getRecognitionLang(selectedLanguage);

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        accumulatedTranscriptRef.current += finalTranscript;
        setTranscribedText(accumulatedTranscriptRef.current.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      stopAudioAnalysis();
      if (!mountedRef.current) return;
      const transcript = accumulatedTranscriptRef.current.trim();
      if (event.error === 'no-speech' && transcript && transcript.length > 2) {
        accumulatedTranscriptRef.current = '';
        processTranscriptRef.current(transcript);
        return;
      }
      if (event.error === 'no-speech') {
        setErrorMsg('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access denied. Please allow microphone permissions.');
      } else {
        setErrorMsg(`Speech recognition error: ${event.error}`);
      }
      setState('error');
    };

    recognition.onend = async () => {
      const transcript = accumulatedTranscriptRef.current.trim();
      if (transcript && transcript.length > 2) {
        accumulatedTranscriptRef.current = '';
        await processTranscriptRef.current(transcript);
        return;
      }
      if (stateRef.current === 'recording') {
        if (mountedRef.current) {
          try { recognition.start(); } catch {
            if (mountedRef.current) setState('idle');
          }
        }
      } else if (stateRef.current === 'idle' || stateRef.current === 'completed') {
        if (mountedRef.current) setState('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      } catch {}
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  }, [selectedLanguage, stopAudioAnalysis]);

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
  }, [state, startAudioAnalysis, stopAudioAnalysis]);

  const handleMicClick = () => {
    if (state === 'idle' || state === 'completed' || state === 'error') {
      if (!recognitionRef.current) {
        setErrorMsg('Speech recognition not available in this browser.');
        setState('error');
        return;
      }
      const recognitionLang = getRecognitionLang(selectedLanguage);
      recognitionRef.current.lang = recognitionLang;
      accumulatedTranscriptRef.current = '';
      setSeconds(0);
      setTranscribedText('');
      setResponseText('');
      setResponseCategory('');
      setDetectedLang('');
      setErrorMsg('');
      try {
        recognitionRef.current.start();
        setState('recording');
      } catch {
        setErrorMsg('Failed to start recording. Please try again.');
        setState('error');
      }
    } else if (state === 'recording') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          stopAudioAnalysis();
          setState('idle');
        }
      }
    }
  };

  const handleSpeak = () => {
    if (responseText && detectedLang) speakText(responseText, detectedLang);
  };

  const isProcessing = state === 'ai_processing' || state === 'transcribing';

  const showMic = state === 'idle' || state === 'recording' || state === 'completed' || state === 'error';

  const micLabel = {
    idle: 'Tap to Record',
    recording: 'Stop Recording',
    transcribing: 'Transcribing...',
    ai_processing: 'Processing...',
    completed: 'Tap to Record',
    error: 'Try Again',
  }[state] || 'Tap to Record';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex-1 flex flex-col transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      }`}
    >
      <div className="flex-1 flex flex-col items-center px-3 md:px-4 pt-1 md:pt-2 pb-3 md:pb-4">
        <div className="w-full max-w-4xl flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {state === 'completed' && detectedLang && (
              <motion.div
                key="badges"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-2"
              >
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs md:text-sm ${
                    darkMode ? 'bg-slate-800/40 text-white' : 'bg-white text-black'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-semibold">{getLanguageName(detectedLang)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <AnimatePresence mode="wait">
              {state === 'idle' && (
                <motion.div
                  key="idle"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-4 md:gap-6"
                >
                  <motion.h1
                    variants={fadeInUp}
                    className="text-2xl sm:text-3xl md:text-5xl font-bold text-center px-2"
                  >
                    Hello, would you like
                    <br />
                    to record now?
                  </motion.h1>
                  <motion.div variants={fadeInUp} className="flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-sm text-xs md:text-sm bg-cyan-500/10 text-cyan-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="font-semibold">{getLanguageName(selectedLanguage)}</span>
                    <span className="opacity-60">selected</span>
                  </motion.div>
                  {!recognitionSupported && (
                    <motion.p variants={fadeInUp} className="text-red-400 text-sm text-center">
                      Speech recognition not supported in this browser. Please use Chrome on desktop or Android.
                    </motion.p>
                  )}
                  <motion.div variants={fadeInUp}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
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
                  className="flex flex-col items-center gap-3 md:gap-4 w-full"
                >
                  <motion.h1
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-sm sm:text-base md:text-lg font-bold text-center text-cyan-400"
                  >
                    Recording...
                  </motion.h1>
                  <div className="w-full max-w-xl h-14 sm:h-16 md:h-20">
                    <VoiceWave isRecording={true} audioLevel={audioLevel} />
                  </div>
                  {transcribedText && (
                    <div className={`w-full max-w-xl text-sm md:text-base text-center px-2 py-2 rounded-lg ${darkMode ? 'bg-slate-800/40 text-gray-300' : 'bg-white/70 text-gray-700'}`}>
                      {transcribedText}
                    </div>
                  )}
                  <Timer seconds={seconds} />
                </motion.div>
              )}

              {state === 'transcribing' && (
                <motion.div
                  key="transcribing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="text-base sm:text-lg md:text-xl font-semibold text-cyan-400">
                    Transcribing...
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}

              {state === 'ai_processing' && (
                <motion.div
                  key="ai_processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-xl px-2"
                >
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl md:text-4xl font-semibold leading-relaxed tracking-wide max-w-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transcribedText}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400 text-sm md:text-base">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="font-medium">Generating response...</span>
                  </div>
                </motion.div>
              )}

              {state === 'completed' && (
                <motion.div
                  key="completed"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-3 md:gap-4 w-full"
                >
                  <div className="w-full max-w-xl space-y-3 md:space-y-4">
                    <motion.div variants={fadeInUp}>
                      <TranscriptionResult text={transcribedText} onEdit={setTranscribedText} large />
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
                </motion.div>
              )}

              {state === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-3 w-full max-w-md px-4"
                >
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-semibold text-red-400">Error</div>
                    <p className="text-gray-400 text-sm mt-1">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showMic && (
            <div className="flex flex-col items-center gap-2 md:gap-3 pt-3 md:pt-4 pb-1">
              <MicButton
                isRecording={state === 'recording'}
                isProcessing={isProcessing}
                onClick={handleMicClick}
              />
              <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {micLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
