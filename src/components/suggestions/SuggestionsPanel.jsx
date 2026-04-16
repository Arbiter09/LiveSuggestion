import useSessionStore from '../../store/useSessionStore';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SuggestionBatch from './SuggestionBatch';

export default function SuggestionsPanel({ onSuggestionClick }) {
  const { suggestionBatches, isLoadingSuggestions, transcriptChunks } = useSessionStore();
  const { refresh } = useAutoRefresh();

  return (
    <div className="flex flex-col h-full">
      <PanelHeader
        batchCount={suggestionBatches.length}
        onRefresh={refresh}
        isLoading={isLoadingSuggestions}
        hasTranscript={transcriptChunks.length > 0}
      />

      <div className="panel-scroll px-4 py-3 space-y-5">
        {suggestionBatches.length === 0 ? (
          <EmptyState isLoading={isLoadingSuggestions} />
        ) : (
          suggestionBatches.map((batch, i) => (
            <SuggestionBatch
              key={batch.id}
              batch={batch}
              onSuggestionClick={onSuggestionClick}
              isLatest={i === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PanelHeader({ batchCount, onRefresh, isLoading, hasTranscript }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          2. Live Suggestions
        </span>
        {batchCount > 0 && (
          <span className="text-xs text-gray-500">{batchCount} batch{batchCount !== 1 ? 'es' : ''}</span>
        )}
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading || !hasTranscript}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshIcon spinning={isLoading} />
        {isLoading ? 'Loading…' : 'Reload'}
      </button>
    </div>
  );
}

function EmptyState({ isLoading }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
      <p className="text-sm text-gray-500">
        {isLoading ? 'Generating suggestions…' : 'Suggestions appear here after recording starts.'}
      </p>
    </div>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
