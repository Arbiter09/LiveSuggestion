import useSessionStore from '../../store/useSessionStore';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SuggestionBatch from './SuggestionBatch';

export default function SuggestionsPanel({ onSuggestionClick }) {
  const { suggestionBatches, isLoadingSuggestions, suggestionError, transcriptChunks } = useSessionStore();
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
        {suggestionError && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            {suggestionError}
          </div>
        )}
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
    <div className="flex items-center justify-between px-4 h-12 border-b border-surface-3 shrink-0">
      <div className="flex items-center gap-2">
        <SparkleIcon />
        <span className="text-sm font-semibold text-gray-200">Suggestions</span>
        {batchCount > 0 && (
          <span className="text-xs text-gray-600 bg-surface-2 px-1.5 py-0.5 rounded-full tabular-nums">{batchCount}</span>
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
  if (isLoading) {
    return (
      <div className="space-y-2">
        <SkeletonCard wide />
        <SkeletonCard />
        <SkeletonCard wide />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-48 text-center gap-3 px-4">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-gray-600">
        <SparkleIcon size={20} />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        Suggestions will appear here as you record.
      </p>
    </div>
  );
}

function SkeletonCard({ wide }) {
  return (
    <div className="rounded-lg border border-surface-3 border-l-2 border-l-surface-3 bg-surface-2 p-3.5 animate-pulse">
      <div className="h-4 w-24 rounded-full bg-surface-3 mb-3" />
      <div className="space-y-2">
        <div className={`h-3 rounded bg-surface-3 ${wide ? 'w-full' : 'w-4/5'}`} />
        <div className="h-3 w-3/5 rounded bg-surface-3" />
      </div>
    </div>
  );
}

function SparkleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
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
