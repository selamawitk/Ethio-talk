export default function Timer({ seconds, showHours = true }) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatTime = (val) => val.toString().padStart(2, '0');

  const timeDisplay = showHours
    ? `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(secs)}`
    : `${formatTime(minutes)}:${formatTime(secs)}`;

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-3xl px-12 py-6 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
      <div className="flex items-center gap-3 font-mono text-5xl font-bold">
        {showHours && (
          <>
            <span className="text-cyan-400">{formatTime(hours)}</span>
            <span className="text-cyan-300 animate-pulse">:</span>
          </>
        )}
        <span className="text-blue-400">{formatTime(minutes)}</span>
        <span className="text-cyan-300 animate-pulse">:</span>
        <span className="text-purple-400">{formatTime(secs)}</span>
      </div>
    </div>
  );
}
