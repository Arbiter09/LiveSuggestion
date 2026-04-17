import { useState } from 'react';
import useSessionStore from '../../store/useSessionStore';
import { exportSession } from '../../lib/export';
import SettingsModal from '../settings/SettingsModal';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const { transcriptChunks, suggestionBatches, chatMessages, clearSession, isRecording } = useSessionStore();

  const handleExport = () => {
    exportSession({ transcriptChunks, suggestionBatches, chatMessages });
  };

  const handleNewSession = () => {
    if (confirmClear) {
      clearSession();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const hasContent = transcriptChunks.length > 0 || suggestionBatches.length > 0 || chatMessages.length > 0;

  return (
    <>
      <header className="flex items-center justify-between px-5 border-b border-surface-3 bg-surface-1 shrink-0 shadow-sm h-12">
        <div className="flex items-center gap-2.5">
          <WaveformIcon />
          <h1 className="text-base font-bold tracking-tight text-gray-100">Live Suggestions</h1>
        </div>

        <div className="flex items-center gap-1.5">
          {hasContent && !isRecording && (
            <button
              onClick={handleNewSession}
              onBlur={() => setConfirmClear(false)}
              title="Start a new session"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                confirmClear
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white'
              }`}
            >
              <NewSessionIcon />
              {confirmClear ? 'Confirm clear?' : 'New Session'}
            </button>
          )}
          <button
            onClick={handleExport}
            title="Export session"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white transition-colors"
          >
            <ExportIcon />
            Export
          </button>
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white transition-colors"
            aria-label="Settings"
          >
            <GearIcon />
            Settings
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

function NewSessionIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function WaveformIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
      <rect x="2" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
      <rect x="6" y="5" width="2.5" height="14" rx="1.25" fill="currentColor" />
      <rect x="10" y="2" width="2.5" height="20" rx="1.25" fill="currentColor" />
      <rect x="14" y="5" width="2.5" height="14" rx="1.25" fill="currentColor" />
      <rect x="18" y="9" width="2.5" height="6" rx="1.25" fill="currentColor" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
