import { useState } from 'react';
import useSessionStore from '../../store/useSessionStore';
import { exportSession } from '../../lib/export';
import SettingsModal from '../settings/SettingsModal';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const { transcriptChunks, suggestionBatches, chatMessages } = useSessionStore();

  const handleExport = () => {
    exportSession({ transcriptChunks, suggestionBatches, chatMessages });
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-surface-3 bg-surface shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <h1 className="text-sm font-semibold tracking-wide text-gray-100">Live Suggestions</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-surface-2 hover:bg-surface-3 text-gray-300 hover:text-white transition-colors"
            aria-label="Settings"
          >
            Settings
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
