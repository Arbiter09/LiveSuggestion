import SuggestionCard from './SuggestionCard';

export default function SuggestionBatch({ batch, onSuggestionClick, isLatest }) {
  const time = new Date(batch.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-surface-3" />
        <span className={`text-[10px] tabular-nums shrink-0 px-1.5 py-0.5 rounded ${isLatest ? 'text-accent bg-accent/10' : 'text-gray-600'}`}>
          {isLatest ? 'Latest · ' : ''}{time}
        </span>
        <div className="h-px flex-1 bg-surface-3" />
      </div>
      <div className={`space-y-2 ${isLatest ? '' : 'opacity-40'}`}>
        {batch.suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onClick={onSuggestionClick} />
        ))}
      </div>
    </div>
  );
}
