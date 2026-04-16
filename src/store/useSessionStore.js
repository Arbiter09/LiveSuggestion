import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '../lib/prompts';

const STORAGE_KEY = 'livesuggestion_settings';

function loadPersistedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — continue without persistence
  }
}

const API_KEY_STORAGE = 'livesuggestion_apikey';

const useSessionStore = create((set, get) => ({
  // ── API Key ────────────────────────────────────────────────────────────────
  apiKey: localStorage.getItem(API_KEY_STORAGE) ?? '',

  setApiKey: (key) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    set({ apiKey: key });
  },

  // ── Settings ───────────────────────────────────────────────────────────────
  settings: loadPersistedSettings(),

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    persistSettings(next);
    set({ settings: next });
  },

  resetSettings: () => {
    persistSettings(DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },

  // ── Transcript ─────────────────────────────────────────────────────────────
  // Each chunk: { id, text, timestamp }
  transcriptChunks: [],
  isRecording: false,

  addTranscriptChunk: (text) => {
    const chunk = { id: crypto.randomUUID(), text, timestamp: new Date() };
    set((s) => ({ transcriptChunks: [...s.transcriptChunks, chunk] }));
  },

  setIsRecording: (val) => set({ isRecording: val }),

  // ── Suggestions ────────────────────────────────────────────────────────────
  // Each batch: { id, timestamp, suggestions: [{ id, type, preview, detail }] }
  suggestionBatches: [],
  isLoadingSuggestions: false,
  suggestionError: null,
  // Snapshot of the recent transcript text at the time the last batch was generated.
  // Used to skip refreshes when not enough new content has arrived.
  lastSuggestedTranscript: '',

  addSuggestionBatch: (suggestions, transcriptSnapshot) => {
    const batch = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      suggestions: suggestions.map((s) => ({ ...s, id: crypto.randomUUID() })),
    };
    set((s) => ({
      suggestionBatches: [batch, ...s.suggestionBatches],
      suggestionError: null,
      lastSuggestedTranscript: transcriptSnapshot ?? s.lastSuggestedTranscript,
    }));
  },

  setIsLoadingSuggestions: (val) => set({ isLoadingSuggestions: val }),
  setSuggestionError: (msg) => set({ suggestionError: msg }),

  // ── Chat ───────────────────────────────────────────────────────────────────
  // Each message: { id, role: 'user' | 'assistant', content, timestamp }
  chatMessages: [],
  isStreaming: false,

  addChatMessage: (role, content) => {
    const msg = { id: crypto.randomUUID(), role, content, timestamp: new Date() };
    set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
    return msg.id;
  },

  // Appends tokens to the last assistant message during streaming
  appendToLastMessage: (token) => {
    set((s) => {
      const messages = [...s.chatMessages];
      if (!messages.length) return s;
      const last = { ...messages[messages.length - 1] };
      last.content += token;
      messages[messages.length - 1] = last;
      return { chatMessages: messages };
    });
  },

  setIsStreaming: (val) => set({ isStreaming: val }),

  // ── Derived helpers ────────────────────────────────────────────────────────
  getFullTranscript: () => {
    return get()
      .transcriptChunks.map((c) => c.text)
      .join('\n\n');
  },

  getRecentTranscript: () => {
    const { transcriptChunks, settings } = get();
    const full = transcriptChunks.map((c) => c.text).join('\n\n');
    return full.slice(-settings.suggestionContextChars);
  },

  getChatTranscript: () => {
    const { transcriptChunks, settings } = get();
    const full = transcriptChunks.map((c) => c.text).join('\n\n');
    return full.slice(-settings.chatContextChars);
  },
}));

export default useSessionStore;
