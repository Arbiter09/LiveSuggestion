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
          <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
            ⚠️ Transcription failed: {transcriptionError}
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
    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          1. Mic &amp; Transcript
        </span>
        {isRecording && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Recording
          </span>
        )}
      </div>
      <MicButton />
    </div>
  );
}

function EmptyState({ isRecording }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
      <p className="text-sm text-gray-500">
        {isRecording
          ? 'Listening… transcript updates every 30s.'
          : 'Press the mic button to start recording.'}
      </p>
    </div>
  );
}
