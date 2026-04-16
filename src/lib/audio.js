/**
 * Abstracts MediaRecorder into a stop-start cycle for chunked audio capture.
 *
 * WHY stop-start instead of timeslice:
 * MediaRecorder with timeslice produces chunks after the first that are missing
 * codec initialization headers. Most audio decoders (including Whisper) cannot
 * process these headerless blobs. Stopping and restarting the recorder every
 * CHUNK_INTERVAL_MS ensures every blob is a self-contained, fully decodable file.
 */

const CHUNK_INTERVAL_MS = 30_000;

/**
 * Starts a continuous stop-start recording cycle.
 * Calls onChunk with a complete, independently decodable Blob every ~30s.
 *
 * @param {{ onChunk: (blob: Blob) => void, onError: (err: Error) => void }}
 * @returns {Promise<{ stop: () => void } | null>}
 */
export async function startRecording({ onChunk, onError }) {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    onError(new Error(`Microphone access denied: ${err.message}`));
    return null;
  }

  let stopped = false;
  let currentRecorder = null;
  let cycleTimeout = null;

  function startCycle() {
    if (stopped) return;

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    currentRecorder = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) onChunk(e.data);
    };

    recorder.onerror = (e) => {
      onError(new Error(e.error?.message ?? 'MediaRecorder error'));
    };

    // When this cycle ends naturally (via the timeout), immediately start the next.
    recorder.onstop = () => {
      if (!stopped) startCycle();
    };

    recorder.start(); // no timeslice — collect the full interval as one blob

    cycleTimeout = setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, CHUNK_INTERVAL_MS);
  }

  startCycle();

  return {
    stop: () => {
      stopped = true;
      clearTimeout(cycleTimeout);
      // Stop current recorder to flush its final chunk before killing the stream.
      if (currentRecorder && currentRecorder.state === 'recording') {
        currentRecorder.stop();
      }
      // Give ondataavailable a moment to fire before tearing down the stream.
      setTimeout(() => stream.getTracks().forEach((t) => t.stop()), 300);
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
