import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ChatHistoryPage from './pages/ChatHistoryPage';
import StatsHistoryPage from './pages/StatsHistoryPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/chat-history" element={<ChatHistoryPage />} />
      <Route path="/stats-history" element={<StatsHistoryPage />} />
    </Routes>
  );
}
