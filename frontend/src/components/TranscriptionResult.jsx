import { Copy, Check, Pencil, Save } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TranscriptionResult({ text, className, onEdit, large }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [toast, setToast] = useState(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editText);
      setCopied(true);
      setToast({ type: 'success', message: 'Copied successfully!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToast({ type: 'error', message: 'Copy failed. Please copy manually.' });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = () => {
    setEditText(text);
    setEditing(true);
  };

  const handleSave = () => {
    if (onEdit) onEdit(editText);
    setEditing(false);
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
          <h3 className="text-sm md:text-base font-semibold text-cyan-400">Transcribed Text</h3>
          <div className="flex gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={editing ? handleSave : handleEdit}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 text-xs"
            >
              {editing ? (
                <>
                  <Save className="w-3 h-3" />
                  <span className="font-medium">Save</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3 h-3" />
                  <span className="font-medium">Edit</span>
                </>
              )}
            </motion.button>
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

        {editing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-white text-sm md:text-base leading-relaxed font-['Noto_Sans_Ethiopic',_sans-serif] min-h-[60px] md:min-h-[80px] bg-slate-700/50 rounded-lg p-2 outline-none border border-cyan-500/30 focus:border-cyan-400 resize-y"
          />
        ) : (
          <div className={`text-white font-['Noto_Sans_Ethiopic',_sans-serif] min-h-[40px] md:min-h-[50px] break-words whitespace-pre-wrap ${
            large
              ? 'text-xl sm:text-2xl md:text-3xl font-semibold leading-relaxed tracking-wide'
              : 'text-sm md:text-base leading-relaxed'
          }`}>
            {text}
          </div>
        )}

        <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none" />
      </div>
    </div>
  );
}
