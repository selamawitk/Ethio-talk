import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Volume2, Copy, Check } from 'lucide-react';
import { getChatHistory, clearChatHistory, deleteChatMessage } from '../utils/ChatHistory';
import { getLanguageName } from '../utils/languageDetection';
import { speakText } from '../utils/tts';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardSlide = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function ChatHistoryPage({ darkMode }) {
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const chatHistory = await getChatHistory();
      if (!Array.isArray(chatHistory)) {
        setLoadError(true);
      } else {
        setHistory(chatHistory);
      }
    } catch {
      setLoadError(true);
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      await clearChatHistory();
      setHistory([]);
    }
  };

  const handleDeleteMessage = async (id) => {
    await deleteChatMessage(id);
    setHistory(prev => prev.filter(m => m.id !== id));
  };

  const handleSpeak = (text, language) => {
    speakText(text, language);
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setToast({ type: 'success', message: 'Copied!' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setToast({ type: 'error', message: 'Copy failed' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      }`}
    >
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 md:px-4 pb-12">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            Chat History
          </motion.h1>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 animate-pulse ${
                  darkMode ? 'bg-slate-800/50' : 'bg-white'
                }`}
              >
                <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-4" />
                <div className="h-16 bg-slate-700/30 rounded-xl mb-3" />
                <div className="h-16 bg-slate-700/30 rounded-xl" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg md:text-xl text-red-400">
              Failed to load chat history.
            </p>
            <button
              onClick={loadHistory}
              className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-all text-sm"
            >
              Try Again
            </button>
          </motion.div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg md:text-xl text-gray-500">
              No chats yet. Start recording to see your conversations here.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-4 md:space-y-6"
          >
            {history.map((item) => (
              <motion.div
                key={item.id}
                variants={cardSlide}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`rounded-2xl md:rounded-3xl p-4 md:p-6 backdrop-blur-sm border transition-all duration-300 ${
                  darkMode
                    ? 'bg-slate-800/50 border-cyan-500/20'
                    : 'bg-white border-green-200'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3 md:mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(item.timestamp || item.createdAt)}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                      {getLanguageName(item.language)}
                    </span>
                    {item.pronunciationScore && (
                      <span className="text-xs md:text-sm text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                        {item.pronunciationScore}% clarity
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteMessage(item.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </motion.button>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className={`p-3 md:p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-green-50'}`}>
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <p className="text-xs md:text-sm font-semibold text-cyan-400">You said:</p>
                      <div className="flex gap-1 md:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSpeak(item.transcription, item.language)}
                          className="p-1.5 hover:bg-slate-600/50 rounded transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(item.transcription, `t-${item.id}`)}
                          className="p-1.5 hover:bg-slate-600/50 rounded transition-colors"
                        >
                          {copiedId === `t-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <p
                      className={`text-sm md:text-base ${
                        darkMode ? 'text-white' : 'text-black'
                      } font-['Noto_Sans_Ethiopic',_sans-serif] break-words`}
                    >
                      {item.transcription}
                    </p>
                  </div>

                  <div className={`p-3 md:p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <p className="text-xs md:text-sm font-semibold text-purple-400">AI replied:</p>
                      <div className="flex gap-1 md:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSpeak(item.response, item.language)}
                          className="p-1.5 hover:bg-slate-600/50 rounded transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(item.response, `r-${item.id}`)}
                          className="p-1.5 hover:bg-slate-600/50 rounded transition-colors"
                        >
                          {copiedId === `r-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <p
                      className={`text-sm md:text-base ${
                        darkMode ? 'text-white' : 'text-black'
                      } font-['Noto_Sans_Ethiopic',_sans-serif] break-words`}
                    >
                      {item.response}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
