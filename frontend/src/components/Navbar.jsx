import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Info, MessageSquare, BarChart3, Sun, Moon } from 'lucide-react';

const LANGUAGES = [
  { code: 'am-ET', label: 'Amharic' },
  { code: 'om-ET', label: 'Oromigna' },
  { code: 'en-US', label: 'English' },
];

const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export default function Navbar({ darkMode, setDarkMode, showLanguage, selectedLanguage, onLanguageChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/about', icon: Info, label: 'About' },
    { path: '/chat-history', icon: MessageSquare, label: 'History' },
    { path: '/stats-history', icon: BarChart3, label: 'Stats' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex justify-between items-center p-2 md:p-3"
    >
      <div className="flex items-center gap-1 md:gap-1.5">
        {navItems.map(({ path, icon: Icon, label }, i) => (
          <motion.button
            key={path}
            custom={i}
            variants={navVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(path)}
            className={`relative flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm transition-colors duration-300 ${
              isActive(path)
                ? darkMode
                  ? 'text-cyan-400'
                  : 'text-green-600'
                : darkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-green-700 hover:text-green-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{label}</span>
            {isActive(path) && (
              <motion.div
                layoutId="nav-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`absolute inset-0 rounded-xl -z-10 ${
                  darkMode
                    ? 'bg-cyan-500/15'
                    : 'bg-green-200/60'
                }`}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        {showLanguage && (
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className={`px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium outline-none cursor-pointer ${
              darkMode
                ? 'bg-slate-800/60 text-white border border-cyan-500/30 focus:border-cyan-400'
                : 'bg-white text-black border border-green-400 focus:border-green-600'
            }`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        )}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm transition-colors duration-300 ${
            darkMode
              ? 'bg-slate-800/50 hover:bg-slate-700/70 text-gray-300 hover:text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
