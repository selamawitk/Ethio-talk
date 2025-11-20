import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Trash2 } from 'lucide-react';
import { getStats, clearStats } from '../utils/chatHistory';
import { getLanguageName } from '../utils/languageDetection';

export default function StatsHistoryPage() {
  const [stats, setStats] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    loadStats();
  }, [darkMode]);

  const loadStats = () => {
    const statsData = getStats();
    setStats(statsData);
  };

  const handleClearStats = () => {
    if (window.confirm('Are you sure you want to clear all statistics?')) {
      clearStats();
      loadStats();
    }
  };

  const getAveragePronunciation = () => {
    if (!stats || stats.pronunciationScores.length === 0) return 0;
    const sum = stats.pronunciationScores.reduce((a, b) => a + b, 0);
    return Math.round(sum / stats.pronunciationScores.length);
  };

  const getMostUsedLanguage = () => {
    if (!stats || Object.keys(stats.languages).length === 0) return 'None';
    const sortedLangs = Object.entries(stats.languages).sort((a, b) => b[1] - a[1]);
    return getLanguageName(sortedLangs[0][0]);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Never';
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
          <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-cyan-500" />
            Statistics
          </h1>
          {stats && stats.totalRecordings > 0 && (
            <button onClick={handleClearStats} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}>
              <Trash2 className="w-5 h-5" />
              <span>Clear Stats</span>
            </button>
          )}
        </div>

        {!stats || stats.totalRecordings === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No statistics yet. Start recording to see your stats here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20' : 'bg-white border-green-200'}`}>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Total Recordings</h3>
                <p className="text-5xl font-bold">{stats.totalRecordings}</p>
              </div>

              <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20' : 'bg-white border-green-200'}`}>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Average Pronunciation</h3>
                <p className="text-5xl font-bold">{getAveragePronunciation()}%</p>
              </div>

              <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-white border-green-200'}`}>
                <h3 className="text-lg font-semibold text-green-400 mb-2">Most Used Language</h3>
                <p className="text-3xl font-bold">{getMostUsedLanguage()}</p>
              </div>

              <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20' : 'bg-white border-green-200'}`}>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Last Activity</h3>
                <p className="text-lg font-bold">{formatDate(stats.lastUpdated)}</p>
              </div>
            </div>

            <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-slate-800/50 border-cyan-500/20' : 'bg-white border-green-200'}`}>
              <h3 className="text-2xl font-semibold mb-4 text-cyan-400">Language Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats.languages).map(([lang, count]) => {
                  const percentage = ((count / stats.totalRecordings) * 100).toFixed(1);
                  return (
                    <div key={lang}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{getLanguageName(lang)}</span>
                        <span className="text-gray-400">{count} recordings ({percentage}%)</span>
                      </div>
                      <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {stats.pronunciationScores.length > 0 && (
              <div className={`rounded-3xl p-6 backdrop-blur-sm border ${darkMode ? 'bg-slate-800/50 border-cyan-500/20' : 'bg-white border-green-200'}`}>
                <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Recent Pronunciation Scores</h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {stats.pronunciationScores.slice(-20).reverse().map((score, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm ${
                        score >= 90
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : score >= 75
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {score}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
