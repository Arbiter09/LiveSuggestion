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
  const lastTriggeredChunkCountRef = useRef(0);
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

  const refresh = async () => {
    if (!apiKey || !transcriptChunks.length) return;
    const latestChunk = transcriptChunks[transcriptChunks.length - 1]?.text ?? '';
    if (!latestChunk.trim()) return;

    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const suggestions = await fetchSuggestions(transcriptChunks, settings.suggestionPrompt, apiKey);
      if (suggestions.length) addSuggestionBatch(suggestions);
      else setSuggestionError('No valid suggestions returned. Try reload or tweak the prompt.');
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

  // Trigger suggestions shortly after each new transcript chunk arrives.
  useEffect(() => {
    if (!isRecording || !apiKey || transcriptChunks.length === 0) return;
    if (lastTriggeredChunkCountRef.current === transcriptChunks.length) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refresh();
      lastTriggeredChunkCountRef.current = transcriptChunks.length;
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptChunks.length, isRecording, apiKey]);

  return { refresh };
}
