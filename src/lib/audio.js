/**
 * Abstracts MediaRecorder lifecycle for 30-second chunked audio capture.
 * Returns a controller object so callers don't manage raw MediaRecorder state.
 */

const CHUNK_INTERVAL_MS = 30_000;

/**
 * Starts recording from the user's microphone.
 * Calls onChunk with each audio Blob as it's produced (every ~30s).
 * Calls onError if the mic cannot be accessed.
 *
 * @param {{ onChunk: (blob: Blob) => void, onError: (err: Error) => void }}
 * @returns {Promise<{ stop: () => void }>}
 */
export async function startRecording({ onChunk, onError }) {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    onError(new Error(`Microphone access denied: ${err.message}`));
    return null;
  }

  const mimeType = getSupportedMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) onChunk(e.data);
  };

  recorder.onerror = (e) => onError(new Error(e.error?.message ?? 'MediaRecorder error'));

  recorder.start(CHUNK_INTERVAL_MS);

  return {
    stop: () => {
      recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

/**
 * Prefers formats Groq Whisper accepts natively.
 * Falls back to browser default (webm/opus works fine with Groq).
 */
function getSupportedMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}
