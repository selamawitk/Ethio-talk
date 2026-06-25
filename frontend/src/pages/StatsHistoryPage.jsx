import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trash2 } from 'lucide-react';
import { getStats, clearStats } from '../utils/ChatHistory';
import { getLanguageName } from '../utils/languageDetection';

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const cardFade = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StatsHistoryPage({ darkMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const statsData = await getStats();
    setStats(statsData);
    setLoading(false);
  };

  const handleClearStats = async () => {
    if (window.confirm('Are you sure you want to clear all statistics?')) {
      await clearStats();
      loadStats();
    }
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
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen transition-colors duration-500 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white'
          : 'bg-green-50 text-black'
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 md:px-4 pb-12">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-center gap-3"
          >
            <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-cyan-500" />
            Statistics
          </motion.h1>
          {stats && stats.totalRecordings > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearStats}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 animate-pulse ${
                  darkMode ? 'bg-slate-800/50' : 'bg-white'
                }`}
              >
                <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-3" />
                <div className="h-8 bg-slate-700/30 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : !stats || stats.totalRecordings === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <p className="text-lg md:text-xl text-gray-500">
              No statistics yet. Start recording to see your stats here.
            </p>
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <motion.div
                variants={cardFade}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`rounded-2xl md:rounded-3xl p-5 md:p-6 backdrop-blur-sm border ${
                  darkMode
                    ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20'
                    : 'bg-white border-green-200'
                }`}
              >
                <h3 className="text-base md:text-lg font-semibold text-cyan-400 mb-2">Total Recordings</h3>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold">{stats.totalRecordings}</p>
              </motion.div>

              <motion.div
                variants={cardFade}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`rounded-2xl md:rounded-3xl p-5 md:p-6 backdrop-blur-sm border ${
                  darkMode
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20'
                    : 'bg-white border-green-200'
                }`}
              >
                <h3 className="text-base md:text-lg font-semibold text-green-400 mb-2">Most Used Language</h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{getMostUsedLanguage()}</p>
              </motion.div>

              <motion.div
                variants={cardFade}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`rounded-2xl md:rounded-3xl p-5 md:p-6 backdrop-blur-sm border ${
                  darkMode
                    ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20'
                    : 'bg-white border-green-200'
                }`}
              >
                <h3 className="text-base md:text-lg font-semibold text-purple-400 mb-2">Last Activity</h3>
                <p className="text-sm md:text-lg font-bold">{formatDate(stats.lastUpdated)}</p>
              </motion.div>

              {stats.pronunciationScores && stats.pronunciationScores.length > 0 && (
                <motion.div
                  variants={cardFade}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`rounded-2xl md:rounded-3xl p-5 md:p-6 backdrop-blur-sm border ${
                    darkMode
                      ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
                      : 'bg-white border-green-200'
                  }`}
                >
                  <h3 className="text-base md:text-lg font-semibold text-yellow-400 mb-2">Avg Pronunciation Score</h3>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {Math.round(stats.pronunciationScores.reduce((a, b) => a + b, 0) / stats.pronunciationScores.length)}%
                  </p>
                </motion.div>
              )}
            </div>

            <motion.div
              variants={cardFade}
              className={`rounded-2xl md:rounded-3xl p-5 md:p-6 backdrop-blur-sm border ${
                darkMode ? 'bg-slate-800/50 border-cyan-500/20' : 'bg-white border-green-200'
              }`}
            >
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-cyan-400">Language Breakdown</h3>
              <div className="space-y-3 md:space-y-4">
                {Object.entries(stats.languages).map(([lang, count]) => {
                  const percentage = ((count / stats.totalRecordings) * 100).toFixed(1);
                  return (
                    <motion.div
                      key={lang}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between mb-1 md:mb-2 text-sm md:text-base">
                        <span className="font-semibold">{getLanguageName(lang)}</span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {count} recordings ({percentage}%)
                        </span>
                      </div>
                      <div
                        className={`w-full h-2 md:h-3 rounded-full overflow-hidden ${
                          darkMode ? 'bg-slate-700' : 'bg-gray-200'
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
