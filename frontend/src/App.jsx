import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ChatHistoryPage = lazy(() => import('./pages/ChatHistoryPage'));
const StatsHistoryPage = lazy(() => import('./pages/StatsHistoryPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ethiotalk-darkmode');
    return saved !== null ? saved === 'true' : true;
  });

  const [selectedLanguage, setSelectedLanguage] = useState('am-ET');

  useEffect(() => {
    localStorage.setItem('ethiotalk-darkmode', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <div className={darkMode ? 'dark' : ''}>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showLanguage={true}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage darkMode={darkMode} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />} />
              <Route path="/about" element={<AboutPage darkMode={darkMode} />} />
              <Route path="/chat-history" element={<ChatHistoryPage darkMode={darkMode} />} />
              <Route path="/stats-history" element={<StatsHistoryPage darkMode={darkMode} />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
