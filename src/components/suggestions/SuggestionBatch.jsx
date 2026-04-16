import SuggestionCard from './SuggestionCard';

export default function SuggestionBatch({ batch, onSuggestionClick, isLatest }) {
  const time = new Date(batch.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className={isLatest ? '' : 'opacity-50'}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-surface-3" />
        <span className="text-[10px] text-gray-600 tabular-nums shrink-0">{time}</span>
        <div className="h-px flex-1 bg-surface-3" />
      </div>
      <div className="space-y-2">
        {batch.suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onClick={onSuggestionClick} />
        ))}
      </div>
    </div>
  );
}
