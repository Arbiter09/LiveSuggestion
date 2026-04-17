import { useState } from 'react';
import useSessionStore from '../../store/useSessionStore';
import SettingsModal from '../settings/SettingsModal';

/**
 * Shown at the top of the app when no Groq API key has been set.
 * Disappears once a key is saved.
 */
function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function ApiKeyBanner() {
  const { apiKey } = useSessionStore();
  const [showSettings, setShowSettings] = useState(false);

  if (apiKey) return null;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
        <div className="flex items-center gap-2">
          <WarningIcon />
          <p className="text-xs text-amber-300">
            No Groq API key set — mic and suggestions won&apos;t work until you add one.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 transition-colors shrink-0 ml-4"
        >
          Add API Key
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
