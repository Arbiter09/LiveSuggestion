import { useEffect, useRef } from 'react';
import useSessionStore from '../store/useSessionStore';
import { fetchSuggestions } from '../lib/groq';

// Skip auto-refresh if fewer than this many new chars since the last batch.
// Applied only during active recording — post-stop and manual refreshes always run.
const MIN_NEW_CHARS_THRESHOLD = 80;

/**
 * Drives suggestion refreshes in two ways:
 *   1. Interval-based — fires every `refreshIntervalMs` while recording is active.
 *   2. On new transcript chunk — fires shortly after any chunk arrives (including
 *      the final chunk after recording stops).
 *
 * Exposes a manual `refresh()` that always runs regardless of threshold.
 */
export function useAutoRefresh() {
  const timerRef = useRef(null);
  const debounceRef = useRef(null);

  const {
    apiKey,
    settings,
    isRecording,
    transcriptChunks,
    setIsLoadingSuggestions,
    setSuggestionError,
    addSuggestionBatch,
  } = useSessionStore();

  /**
   * Core refresh logic.
   * @param {boolean} force - bypass the new-chars threshold
   */
  const runRefresh = async ({ force = false } = {}) => {
    const state = useSessionStore.getState();
    if (!state.apiKey || !state.transcriptChunks.length) return;

    const recentText = state.transcriptChunks[state.transcriptChunks.length - 1]?.text ?? '';
    if (!recentText.trim()) return;

    // Threshold guard — skipped when forced or when recording has just stopped.
    if (!force) {
      const allText = state.transcriptChunks.map((c) => c.text).join('');
      const newChars = allText.length - state.lastSuggestedTranscript.length;
      if (newChars < MIN_NEW_CHARS_THRESHOLD) return;
    }

    const transcriptSnapshot = state.transcriptChunks.map((c) => c.text).join('');
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

  // Manual refresh — always forced.
  const refresh = () => runRefresh({ force: true });

  // Interval-based refresh while recording is active.
  useEffect(() => {
    if (!isRecording) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => runRefresh({ force: false }), settings.refreshIntervalMs);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, settings.refreshIntervalMs, apiKey]);

  // Chunk-arrival trigger — intentionally does NOT gate on isRecording so the
  // final post-stop transcription chunk always produces suggestions.
  // force=true when recording is off (i.e. this is the last chunk after stop).
  useEffect(() => {
    if (!apiKey || !transcriptChunks.length) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Read isRecording from store at call time, not from stale closure.
      const recordingNow = useSessionStore.getState().isRecording;
      runRefresh({ force: !recordingNow });
    }, 600);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptChunks.length]);

  return { refresh };
}
