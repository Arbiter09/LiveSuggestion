# TwinMind Live Suggestions

A web app that listens to live audio from the user's mic and continuously surfaces 3 contextual suggestions based on what is being said. Clicking a suggestion opens a detailed streamed answer in the chat panel.

## Features

- **Live transcription** via Groq Whisper Large V3 — mic audio chunked every 30s
- **Live suggestions** — 3 contextual cards per batch (question to ask, talking point, answer, fact-check, or clarification), refreshed every 30s or on demand
- **Streaming chat** — click any suggestion or type freely; full transcript context is included
- **Session export** — download full transcript + all suggestion batches + chat history as JSON
- **Editable settings** — prompts, context windows, refresh interval, all tunable in-app

## Stack

- React + Vite (JavaScript)
- Zustand for state
- Tailwind CSS for styling
- Groq API — Whisper Large V3 (transcription) + `meta-llama/llama-4-maverick-17b-128e-instruct` (suggestions & chat)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click **Settings**, paste your [Groq API key](https://console.groq.com/keys), and press **Save Key**. Then hit the mic button.

## Project Structure

```
src/
├── components/
│   ├── layout/       # AppLayout, Header
│   ├── transcript/   # TranscriptPanel, TranscriptEntry, MicButton
│   ├── suggestions/  # SuggestionsPanel, SuggestionBatch, SuggestionCard
│   ├── chat/         # ChatPanel, ChatMessage, ChatInput
│   └── settings/     # SettingsModal, SettingsField
├── store/
│   └── useSessionStore.js   # Zustand store — single source of truth
├── lib/
│   ├── groq.js              # All Groq API calls
│   ├── audio.js             # MediaRecorder abstraction
│   ├── prompts.js           # Default prompts + settings
│   └── export.js            # Session export
├── hooks/
│   ├── useAudioRecorder.js  # Record → transcribe → store pipeline
│   └── useAutoRefresh.js    # Interval-based suggestion refresh
└── App.jsx
```

## API Key

Your Groq API key is stored only in your browser's `localStorage`. It is never sent to any server other than Groq directly.
