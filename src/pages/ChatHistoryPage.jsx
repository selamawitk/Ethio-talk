import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Volume2, Copy, Check } from 'lucide-react';
import { getChatHistory, clearChatHistory } from '../utils/chatHistory';
import { getLanguageName } from '../utils/languageDetection';
import { speakWithGoogleTTS } from '../utils/googleTTS';

export default function ChatHistoryPage() {
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    loadHistory();
  }, [darkMode]);

  const loadHistory = () => {
    const chatHistory = getChatHistory();
    setHistory(chatHistory);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      clearChatHistory();
      setHistory([]);
    }
  };

  const handleSpeak = (text, language) => {
    speakWithGoogleTTS(text, language);
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white' : 'bg-green-50 text-black'}`}>
      <div className="flex justify-between items-center p-6">
        <button onClick={() => navigate('/')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/70 text-cyan-500' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/70' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
          <span>{darkMode ? '☀️ Light' : '🌙 Dark'}</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">Chat History</h1>
          {history.length > 0 && (
            <button onClick={handleClearHistory} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}>
              <Trash2 className="w-5 h-5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No chat history yet. Start recording to see your conversations here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className={`rounded-3xl p-6 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.01] ${darkMode ? 'bg-slate-800/50 border-cyan-500/20' : 'bg-white border-green-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatDate(item.timestamp)}
                    </span>
                    <span className="ml-3 text-sm font-semibold text-green-500">
                      {getLanguageName(item.language)}
                    </span>
                    {item.pronunciationScore && (
                      <span className="ml-3 text-sm text-yellow-400">
                        {item.pronunciationScore}% clarity
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-green-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-cyan-400">You said:</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleSpeak(item.transcription, item.language)} className="p-1 hover:bg-slate-600/50 rounded transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCopy(item.transcription, `t-${item.id}`)} className="p-1 hover:bg-slate-600/50 rounded transition-colors">
                          {copiedId === `t-${item.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className={`${darkMode ? 'text-white' : 'text-black'} font-['Noto_Sans_Ethiopic',_sans-serif]`}>
                      {item.transcription}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-purple-400">AI replied:</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleSpeak(item.response, item.language)} className="p-1 hover:bg-slate-600/50 rounded transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleCopy(item.response, `r-${item.id}`)} className="p-1 hover:bg-slate-600/50 rounded transition-colors">
                          {copiedId === `r-${item.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className={`${darkMode ? 'text-white' : 'text-black'} font-['Noto_Sans_Ethiopic',_sans-serif]`}>
                      {item.response}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
