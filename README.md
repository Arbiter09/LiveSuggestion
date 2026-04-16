# TwinMind Live Suggestions

A web app that listens to live audio from the user's mic and continuously surfaces 3 contextual suggestions based on what is being said. Clicking a suggestion opens a detailed streamed answer in the chat panel on the right.

**[Live Demo →](https://live-suggestion.vercel.app)** · **[GitHub →](https://github.com/Arbiter09/LiveSuggestion)**

---

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, click **Settings**, paste your [Groq API key](https://console.groq.com/keys), and click **Save Key**. Then press the mic button.

No backend required. Your API key is stored only in `localStorage` and sent directly to Groq.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite (JavaScript) | Component model maps cleanly to 3 independent stateful panels |
| State | Zustand | Shared state across panels driven by timers and audio events; lighter than Redux, cleaner than prop-drilling |
| Styling | Tailwind CSS | Dark theme, utility-first, fast iteration |
| Markdown | react-markdown | Assistant responses render bold/bullets/code from the model |
| Transcription | Groq Whisper Large V3 | Fastest Whisper inference available; ~100MB file limit |
| LLM | Groq `openai/gpt-oss-120b` | Specified by the assignment; ~500 t/s production model |
| Deployment | Vercel | Zero-config static deploy for Vite projects |

No backend. All API calls go browser → Groq directly.

---

## Architecture

```
src/
├── components/
│   ├── layout/       AppLayout, Header, ApiKeyBanner
│   ├── transcript/   TranscriptPanel, TranscriptEntry, MicButton
│   ├── suggestions/  SuggestionsPanel, SuggestionBatch, SuggestionCard
│   ├── chat/         ChatPanel, ChatMessage, ChatInput
│   └── settings/     SettingsModal, SettingsField
├── store/
│   └── useSessionStore.js   Single Zustand store — all session state
├── lib/
│   ├── groq.js              All Groq API calls (transcribe, suggestions, chat)
│   ├── audio.js             MediaRecorder stop-start cycle
│   ├── prompts.js           Default prompts + settings constants
│   └── export.js            Session JSON export
└── hooks/
    ├── useAudioRecorder.js  Record → transcribe → store pipeline
    └── useAutoRefresh.js    Suggestion refresh logic (interval + chunk-arrival)
```

---

## Audio Pipeline

**Why stop-start instead of `timeslice`:**
`MediaRecorder.start(timeslice)` produces audio fragments. The first fragment includes codec initialization headers; all subsequent fragments do not. Whisper cannot decode headerless blobs and returns empty text silently.

The fix is a stop-start cycle: each `MediaRecorder` runs for 30 seconds with no timeslice, then `.stop()` is called. This fires `ondataavailable` with a complete, self-contained blob that any decoder can process. `onstop` immediately starts the next cycle.

Final chunk handling: when the user clicks stop, `setIsRecording(false)` fires immediately but the last Whisper response is async. The chunk-arrival trigger in `useAutoRefresh` intentionally does **not** gate on `isRecording`, so the post-stop transcription always produces a suggestion batch.

---

## Prompt Strategy

### Suggestion Generation

The suggestion prompt uses a 4-step reasoning chain:

**Step 1 — Detect meeting type**
The model classifies the conversation into one of 7 types:
`technical_interview`, `sales_call`, `planning_meeting`, `brainstorm`, `lecture_or_briefing`, `one_on_one`, `general`

**Step 2 — Select type mix from a lookup table**

| Meeting Type | Default Mix |
|---|---|
| Technical interview / system design | ANSWER → QUESTION_TO_ASK → FACT_CHECK |
| Sales / client call | TALKING_POINT → QUESTION_TO_ASK → CLARIFICATION |
| Planning / sprint | QUESTION_TO_ASK → TALKING_POINT → ANSWER |
| Brainstorm / ideation | TALKING_POINT → TALKING_POINT → QUESTION_TO_ASK |
| Lecture / briefing | CLARIFICATION → FACT_CHECK → QUESTION_TO_ASK |
| 1:1 / personal | QUESTION_TO_ASK → TALKING_POINT → CLARIFICATION |
| General / unclear | Signal-driven (see below) |

**Step 3 — Apply context overrides**
These always apply on top of the meeting type default:
- `question_detected=true` → at least one ANSWER
- `number_or_metric_detected=true` → consider FACT_CHECK
- `architecture_terms_detected=true` → consider TALKING_POINT or CLARIFICATION

**Step 4 — Quality constraints**
- Each preview must be self-contained and immediately useful without clicking
- Reference exact words, names, numbers from the transcript
- Each card must cover a materially different angle
- No generic advice — say exactly what to do or ask

The prompt requires the model to produce an `analysis` block (meeting type, what just happened, chosen mix) before `suggestions`. This chain-of-thought step measurably reduces generic output.

### Context Structure

Rather than passing a flat transcript blob, the API call separates context into:

```
BROADER_CONTEXT: older chunks (background)
RECENT_CONTEXT:  latest chunk only (highest weight)
CLIENT_SIGNALS:  { question_detected, number_or_metric_detected, architecture_terms_detected }
ALREADY_SHOWN:   previews from the last batch (model instructed not to repeat)
```

`ALREADY_SHOWN` prevents duplicate suggestions across consecutive batches. If it over-constrains the model and fewer than 3 valid suggestions are returned, a single retry runs without it.

### Detailed Answer (on card click)

Each suggestion type gets a distinct response structure:

| Type | Response style |
|---|---|
| ANSWER | Lead with bottom line, then support. 2–3 short paragraphs. |
| FACT_CHECK | Lead with correction. State what was said vs. accurate. Provide correct figure. |
| QUESTION_TO_ASK | Give exact phrasing. Explain what it reveals. Describe strong vs. weak answer. |
| TALKING_POINT | Why it matters now. How it connects to what was just said. Exact intro sentences. |
| CLARIFICATION | Plain-language definition. One concrete example. Why it matters in this context. |

The suggestion `type` is injected into the system prompt at click time so the model applies the correct structure.

### Chat

Full transcript context is included in every chat turn (up to `chatContextChars`, default 8,000 chars). Chat history is passed for multi-turn continuity. Empty messages from incomplete prior responses are filtered before sending.

---

## Tradeoffs

**No backend:** All API calls go browser → Groq directly. This means the user's API key is in `localStorage` (visible in devtools) — acceptable for an assessment where users supply their own key. A production version would proxy through a backend.

**30-second chunks:** Shorter chunks (10–15s) would reduce first-suggestion latency but increase Whisper API calls. 30s is the spec requirement and a reasonable balance.

**Client-side signal detection:** The `question_detected`, `number_detected` heuristics are regex-based, not semantic. They're fast and free (no extra LLM call) but will miss some signals (e.g. implicit questions). A second lightweight LLM call for signal extraction would be more accurate at higher cost and latency.

**`ALREADY_SHOWN` deduplication:** Passing previous previews works well for consecutive batches but doesn't track across the full session. If the same topic recurs 10 minutes later, the model might repeat older suggestions. Full session-level deduplication would require maintaining a rolling list of all previews shown.

**Temperature 0.75 for suggestions:** High enough for varied, creative suggestions; low enough for factual accuracy on FACT_CHECK cards. ANSWER cards might benefit from lower temperature (0.4–0.5) but this would require per-type API calls.

---

## Settings

All prompts and context windows are editable at runtime via the Settings modal:

| Setting | Default | Description |
|---|---|---|
| Suggestion prompt | See `prompts.js` | Full system prompt for suggestion generation |
| Detailed answer prompt | See `prompts.js` | System prompt when a card is clicked |
| Chat system prompt | See `prompts.js` | System prompt for the freeform chat panel |
| Suggestion context | 3,000 chars | Recent transcript chars passed for suggestion generation |
| Chat context | 8,000 chars | Transcript chars included in chat queries |
| Refresh interval | 30,000 ms | Auto-refresh cadence while recording |
| Transcription language | `en` | BCP-47 language code passed to Whisper |
