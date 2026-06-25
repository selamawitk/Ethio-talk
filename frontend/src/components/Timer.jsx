import { motion } from 'framer-motion';

export default function Timer({ seconds }) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatTime = (val) => val.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-2xl md:rounded-3xl px-6 md:px-12 py-4 md:py-6 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]"
    >
      <div className="flex items-center gap-2 md:gap-3 font-mono text-3xl sm:text-4xl md:text-5xl font-bold">
        <span className="text-cyan-400">{formatTime(hours)}</span>
        <span className="text-cyan-300 animate-pulse">:</span>
        <span className="text-blue-400">{formatTime(minutes)}</span>
        <span className="text-cyan-300 animate-pulse">:</span>
        <span className="text-purple-400">{formatTime(secs)}</span>
      </div>
    </motion.div>
  );
}
