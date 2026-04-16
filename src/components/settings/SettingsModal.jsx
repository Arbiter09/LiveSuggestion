import { useState } from 'react';
import useSessionStore from '../../store/useSessionStore';
import SettingsField from './SettingsField';

const TABS = ['API Key', 'Prompts', 'Context'];

export default function SettingsModal({ onClose }) {
  const { apiKey, setApiKey, settings, updateSettings, resetSettings } = useSessionStore();
  const [activeTab, setActiveTab] = useState('API Key');
  const [localKey, setLocalKey] = useState(apiKey);

  const handleSaveKey = () => {
    setApiKey(localKey.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-surface-1 rounded-xl shadow-2xl border border-surface-3 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-3 shrink-0">
          <h2 className="text-sm font-semibold text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 text-lg leading-none transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-3'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {activeTab === 'API Key' && (
            <>
              <SettingsField
                label="Groq API Key"
                description="Your key is stored only in your browser's localStorage and never sent to any server other than Groq."
                value={localKey}
                onChange={setLocalKey}
                type="password"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 text-xs font-medium bg-accent hover:bg-accent-hover rounded-md text-white transition-colors"
              >
                Save Key
              </button>
              {apiKey && (
                <p className="text-xs text-green-400">✓ API key is set</p>
              )}
            </>
          )}

          {activeTab === 'Prompts' && (
            <>
              <SettingsField
                label="Live Suggestion Prompt"
                description="System prompt for generating the 3 live suggestions."
                multiline
                value={settings.suggestionPrompt}
                onChange={(v) => updateSettings({ suggestionPrompt: v })}
              />
              <SettingsField
                label="Detailed Answer Prompt (on click)"
                description="System prompt when a suggestion card is clicked for more detail."
                multiline
                value={settings.detailedAnswerPrompt}
                onChange={(v) => updateSettings({ detailedAnswerPrompt: v })}
              />
              <SettingsField
                label="Chat System Prompt"
                description="System prompt for the freeform chat panel."
                multiline
                value={settings.chatPrompt}
                onChange={(v) => updateSettings({ chatPrompt: v })}
              />
            </>
          )}

          {activeTab === 'Context' && (
            <>
              <SettingsField
                label="Suggestion Context (characters)"
                description="How many recent transcript characters to include when generating suggestions."
                value={String(settings.suggestionContextChars)}
                onChange={(v) => updateSettings({ suggestionContextChars: Number(v) })}
                type="number"
              />
              <SettingsField
                label="Detailed Answer Context (characters)"
                description="Transcript chars included when a suggestion card is clicked. Default: 6000."
                value={String(settings.detailedAnswerContextChars)}
                onChange={(v) => updateSettings({ detailedAnswerContextChars: Number(v) })}
                type="number"
              />
              <SettingsField
                label="Chat Context (characters)"
                description="Transcript chars included in freeform chat queries. Default: 10000."
                value={String(settings.chatContextChars)}
                onChange={(v) => updateSettings({ chatContextChars: Number(v) })}
                type="number"
              />
              <SettingsField
                label="Auto-refresh Interval (ms)"
                description="How often suggestions auto-refresh while recording. Default: 30000."
                value={String(settings.refreshIntervalMs)}
                onChange={(v) => updateSettings({ refreshIntervalMs: Number(v) })}
                type="number"
              />
              <SettingsField
                label="Transcription Language"
                description="BCP-47 language code for Whisper (e.g. en, es, fr)."
                value={settings.transcriptionLanguage}
                onChange={(v) => updateSettings({ transcriptionLanguage: v })}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-surface-3 shrink-0">
          <button
            onClick={resetSettings}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-surface-3 hover:bg-surface-2 rounded-md text-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
