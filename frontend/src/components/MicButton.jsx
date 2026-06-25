import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MicButton({ isRecording, isProcessing, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isProcessing}
      whileHover={!isProcessing ? { scale: 1.08 } : {}}
      whileTap={!isProcessing ? { scale: 0.92 } : {}}
      aria-label={
        isRecording
          ? 'Stop recording'
          : isProcessing
          ? 'Processing audio'
          : 'Start recording'
      }
      className="relative group focus:outline-none focus:ring-4 focus:ring-purple-400/50 rounded-full"
    >
      {/* Inner Circle */}
      <div
        className={`
          w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center
          transition-all duration-300 ease-in-out relative z-10
          ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
              : isProcessing
              ? 'bg-gradient-to-br from-gray-600 to-gray-700 opacity-80 animate-pulse'
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.5)]'
          }
          ${!isProcessing ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
      >
        {isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
        ) : isProcessing ? (
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
        )}
      </div>

      {/* Background Effects */}
      {!isProcessing && (
        <>
          <div
            className={`
              absolute inset-0 rounded-full scale-125 opacity-60
              ${
                isRecording
                  ? 'bg-red-500/30 animate-ping'
                  : 'bg-purple-500/30 animate-pulse'
              }
            `}
          />
          <div
            className={`
              absolute inset-0 rounded-full blur-xl scale-125
              ${
                isRecording
                  ? 'bg-red-500/40'
                  : 'bg-purple-500/40'
              }
            `}
          />
          {!isRecording && (
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-purple-400/30"
            />
          )}
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-red-400/40"
            />
          )}
        </>
      )}
    </motion.button>
  );
}
