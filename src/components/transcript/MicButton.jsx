import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import useSessionStore from '../../store/useSessionStore';

export default function MicButton() {
  const { isRecording, apiKey } = useSessionStore();
  const { start, stop } = useAudioRecorder();

  const toggle = () => (isRecording ? stop() : start());
  const disabled = !apiKey;

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title={disabled ? 'Add your Groq API key in Settings first' : undefined}
      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
          : 'bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20'
      }`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
      )}
      <MicIcon active={isRecording} />
    </button>
  );
}

function MicIcon({ active }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      {active ? (
        // Stop icon
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
      ) : (
        // Mic icon
        <>
          <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </>
      )}
    </svg>
  );
}
