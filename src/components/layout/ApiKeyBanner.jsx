import { useState } from 'react';
import useSessionStore from '../../store/useSessionStore';
import SettingsModal from '../settings/SettingsModal';

/**
 * Shown at the top of the app when no Groq API key has been set.
 * Disappears once a key is saved.
 */
export default function ApiKeyBanner() {
  const { apiKey } = useSessionStore();
  const [showSettings, setShowSettings] = useState(false);

  if (apiKey) return null;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚠</span>
          <p className="text-xs text-amber-300">
            No Groq API key set — mic and suggestions won't work until you add one.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="text-xs font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors shrink-0 ml-4"
        >
          Add API Key →
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
