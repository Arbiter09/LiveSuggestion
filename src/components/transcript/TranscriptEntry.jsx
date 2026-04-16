/**
 * A single transcript chunk with timestamp.
 */
export default function TranscriptEntry({ chunk }) {
  const time = new Date(chunk.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="flex gap-3 group">
      <span className="text-xs text-gray-600 mt-0.5 shrink-0 tabular-nums">{time}</span>
      <p className="text-sm text-gray-300 leading-relaxed">{chunk.text}</p>
    </div>
  );
}
