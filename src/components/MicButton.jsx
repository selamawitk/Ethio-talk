import { Mic, MicOff, Square } from 'lucide-react';

export default function MicButton({ isRecording, isProcessing, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
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
          w-28 h-28 rounded-full flex items-center justify-center
          transition-all duration-300 ease-in-out relative z-10
          ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
              : isProcessing
              ? 'bg-gradient-to-br from-gray-600 to-gray-700 opacity-80 animate-pulse'
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.5)]'
          }
          ${!isProcessing ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
        `}
      >
        {isRecording ? (
          <MicOff className="w-10 h-10 text-white" />
        ) : isProcessing ? (
          // Replace Square with subtle spinner animation for better feedback
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </div>

      {/* Background Effects */}
      {!isProcessing && (
        <>
          {/* Animated Glow / Ping */}
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
          {/* Outer Blur */}
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
        </>
      )}
    </button>
  );
}
