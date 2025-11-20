import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function TranscriptionResult({ text, className }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto animate-fade-in ${className || ''}`}>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-cyan-400">Transcribed Text</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="text-white text-lg leading-relaxed font-['Noto_Sans_Ethiopic',_sans-serif] min-h-[100px]">
          {text}
        </div>

        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none" />
      </div>
    </div>
  );
}
