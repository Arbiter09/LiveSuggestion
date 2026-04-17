import { useEffect, useRef } from 'react';
import useSessionStore from '../../store/useSessionStore';
import MicButton from './MicButton';
import TranscriptEntry from './TranscriptEntry';

export default function TranscriptPanel() {
  const { transcriptChunks, isRecording, transcriptionError } = useSessionStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptChunks.length]);

  return (
    <div className="flex flex-col h-full">
      <PanelHeader isRecording={isRecording} />

      <div className="panel-scroll px-4 py-3 space-y-4">
        {transcriptionError && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            Transcription failed: {transcriptionError}
          </div>
        )}
        {transcriptChunks.length === 0 ? (
          <EmptyState isRecording={isRecording} />
        ) : (
          transcriptChunks.map((chunk) => <TranscriptEntry key={chunk.id} chunk={chunk} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function PanelHeader({ isRecording }) {
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-surface-3 shrink-0">
      <div className="flex items-center gap-2">
        <MicPanelIcon />
        <span className="text-sm font-semibold text-gray-200">Transcript</span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
            Live
          </span>
        )}
      </div>
      <MicButton />
    </div>
  );
}

function EmptyState({ isRecording }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center gap-3 px-4">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-gray-600">
        <MicPanelIcon size={20} />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        {isRecording
          ? 'Listening… transcript updates every 30s.'
          : 'Press the mic button to start recording.'}
      </p>
    </div>
  );
}

function MicPanelIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
