import { useRef, useCallback } from 'react';
import { startRecording } from '../lib/audio';
import { transcribeAudio } from '../lib/groq';
import useSessionStore from '../store/useSessionStore';

/**
 * Manages the full record → transcribe → store pipeline.
 * Returns start/stop handlers that components can wire to the mic button.
 */
export function useAudioRecorder() {
  const controllerRef = useRef(null);
  const { apiKey, settings, setIsRecording, addTranscriptChunk, setTranscriptionError } = useSessionStore();

  const handleChunk = useCallback(
    async (blob) => {
      if (!apiKey) return;
      try {
        const text = await transcribeAudio(blob, apiKey, settings.transcriptionLanguage);
        if (text?.trim()) addTranscriptChunk(text.trim());
      } catch (err) {
        console.error('[Transcription]', err);
        setTranscriptionError(err.message);
      }
    },
    [apiKey, settings.transcriptionLanguage, addTranscriptChunk, setTranscriptionError],
  );

  const start = useCallback(async () => {
    if (controllerRef.current) return;
    const controller = await startRecording({
      onChunk: handleChunk,
      onError: (err) => {
        console.error('[Recording]', err);
        setIsRecording(false);
      },
    });
    if (controller) {
      controllerRef.current = controller;
      setIsRecording(true);
    }
  }, [handleChunk, setIsRecording]);

  const stop = useCallback(() => {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setIsRecording(false);
  }, [setIsRecording]);

  return { start, stop };
}
