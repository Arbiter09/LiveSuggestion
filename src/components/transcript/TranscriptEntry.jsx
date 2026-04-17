export default function TranscriptEntry({ chunk }) {
  const time = new Date(chunk.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex gap-3 pt-3 border-t border-surface-3/60 first:border-t-0 first:pt-0 group">
      <span className="text-xs text-gray-600 mt-0.5 shrink-0 tabular-nums">{time}</span>
      <p className="text-sm text-gray-300 leading-relaxed">{chunk.text}</p>
    </div>
  );
}
