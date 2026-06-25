import { motion } from 'framer-motion';

export default function ProcessingCircle({ percentage }) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center my-0"
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-out"
          style={{ filter: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.5))' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="absolute rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-2xl transition-all duration-300"
        style={{
          width: `${Math.min(120 + percentage * 0.8, 200)}px`,
          height: `${Math.min(120 + percentage * 0.8, 200)}px`,
        }}
      />

      <div className="absolute text-center">
        <motion.div
          key={percentage}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-cyan-300 bg-clip-text text-transparent"
        >
          {percentage}%
        </motion.div>
        <div className="text-sm md:text-base text-blue-200 mt-0 tracking-wide">
          Processing
        </div>
      </div>
    </motion.div>
  );
}
