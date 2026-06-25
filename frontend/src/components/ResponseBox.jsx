import { Copy, Check, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ResponseBox({ responseText, category, onSpeak, className }) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setToast({ type: 'success', message: 'Copied successfully!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ type: 'error', message: 'Copy failed. Please copy manually.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className || ''}`}>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-cyan-400">System Reply</h3>
            <p className="text-xs text-gray-400">{category}</p>
          </div>
          <div className="flex gap-1.5">
            {onSpeak && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSpeak}
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 text-xs"
              >
                <Volume2 className="w-3 h-3" />
                <span className="font-medium">Speak</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span className="font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="font-medium">Copy</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="text-white text-sm md:text-base leading-relaxed font-['Noto_Sans_Ethiopic',_sans-serif] min-h-[40px] md:min-h-[50px] break-words">
          {responseText}
        </div>

        <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none" />
      </div>
    </div>
  );
}
