import { useEffect, useRef } from 'react';
import useSessionStore from '../store/useSessionStore';
import { fetchSuggestions } from '../lib/groq';

// Minimum new characters required before auto-triggering another batch.
const MIN_NEW_CHARS_THRESHOLD = 80;

/**
 * Drives suggestion refreshes in two ways:
 *   1. Interval-based — fires every `refreshIntervalMs` while recording.
 *   2. On new transcript chunk — fires shortly after a chunk arrives,
 *      but only if enough new content has accumulated since the last batch.
 *
 * Exposes a manual `refresh()` that bypasses the threshold (for the Reload button).
 */
export function useAutoRefresh() {
  const timerRef = useRef(null);
  const debounceRef = useRef(null);

  const {
    apiKey,
    settings,
    isRecording,
    transcriptChunks,
    suggestionBatches,
    lastSuggestedTranscript,
    setIsLoadingSuggestions,
    setSuggestionError,
    addSuggestionBatch,
  } = useSessionStore();

  const runRefresh = async ({ force = false } = {}) => {
    const state = useSessionStore.getState();
    if (!state.apiKey || !state.transcriptChunks.length) return;

    const recentText = state.transcriptChunks[state.transcriptChunks.length - 1]?.text ?? '';
    if (!recentText.trim()) return;

    // Skip if the transcript hasn't changed enough since the last batch, unless forced.
    const newChars = state.transcriptChunks
      .map((c) => c.text)
      .join('')
      .slice(state.lastSuggestedTranscript.length).length;

    if (!force && newChars < MIN_NEW_CHARS_THRESHOLD) return;

    // Snapshot of current full transcript to store after generation.
    const transcriptSnapshot = state.transcriptChunks.map((c) => c.text).join('');

    // Pass the last batch's previews so the model knows what to avoid repeating.
    const lastBatchPreviews = state.suggestionBatches[0]?.suggestions.map((s) => s.preview) ?? [];

    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const suggestions = await fetchSuggestions(
        state.transcriptChunks,
        state.settings.suggestionPrompt,
        state.apiKey,
        lastBatchPreviews,
      );
      if (suggestions.length) {
        addSuggestionBatch(suggestions, transcriptSnapshot);
      } else {
        setSuggestionError('No valid suggestions returned — try reload or adjust the prompt.');
      }
    } catch (err) {
      console.error('[Suggestions]', err);
      setSuggestionError(err.message);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Manual refresh — always runs regardless of threshold.
  const refresh = () => runRefresh({ force: true });

  // Interval-based auto-refresh.
  useEffect(() => {
    if (!isRecording) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => runRefresh({ force: false }), settings.refreshIntervalMs);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, settings.refreshIntervalMs, apiKey]);

  // Chunk-arrival trigger — debounced, threshold-gated.
  useEffect(() => {
    if (!isRecording || !apiKey || !transcriptChunks.length) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runRefresh({ force: false }), 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptChunks.length, isRecording, apiKey]);

  return { refresh };
}
