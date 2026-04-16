import { useEffect, useRef } from 'react';
import useSessionStore from '../store/useSessionStore';
import { fetchSuggestions } from '../lib/groq';

/**
 * Automatically refreshes suggestions every `refreshIntervalMs`.
 * Only fires when recording is active and there is transcript content.
 * Exposes a manual `refresh` function for the Reload button.
 */
export function useAutoRefresh() {
  const timerRef = useRef(null);
  const {
    apiKey,
    settings,
    isRecording,
    transcriptChunks,
    setIsLoadingSuggestions,
    setSuggestionError,
    addSuggestionBatch,
  } = useSessionStore();

  const refresh = async () => {
    if (!apiKey || !transcriptChunks.length) return;
    const recentTranscript = useSessionStore.getState().getRecentTranscript();
    if (!recentTranscript.trim()) return;

    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const suggestions = await fetchSuggestions(
        recentTranscript,
        settings.suggestionPrompt,
        apiKey,
      );
      if (suggestions.length) addSuggestionBatch(suggestions);
    } catch (err) {
      console.error('[Suggestions]', err);
      setSuggestionError(err.message);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Auto-refresh loop — only ticks when recording
  useEffect(() => {
    if (!isRecording) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(refresh, settings.refreshIntervalMs);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, settings.refreshIntervalMs, apiKey]);

  return { refresh };
}
