/**
 * All Groq API interactions live here.
 * Three responsibilities:
 *   1. transcribeAudio  — Whisper Large V3
 *   2. fetchSuggestions — LLM structured suggestion generation
 *   3. streamChatReply  — LLM streaming chat response
 */

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const WHISPER_MODEL = 'whisper-large-v3';
const LLM_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';

// ── Transcription ────────────────────────────────────────────────────────────

/**
 * @param {Blob} audioBlob
 * @param {string} apiKey
 * @param {string} language
 * @returns {Promise<string>} transcript text
 */
export async function transcribeAudio(audioBlob, apiKey, language = 'en') {
  const form = new FormData();
  form.append('file', audioBlob, 'audio.webm');
  form.append('model', WHISPER_MODEL);
  form.append('language', language);
  form.append('response_format', 'text');

  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper error ${res.status}: ${err}`);
  }

  return res.text();
}

// ── Suggestions ──────────────────────────────────────────────────────────────

/**
 * @param {string} recentTranscript
 * @param {string} systemPrompt
 * @param {string} apiKey
 * @returns {Promise<Array<{type, preview, detail}>>}
 */
export async function fetchSuggestions(recentTranscript, systemPrompt, apiKey) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Recent transcript:\n\n${recentTranscript}\n\nGenerate 3 suggestions.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Suggestions error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.suggestions ?? [];
}

// ── Streaming Chat ────────────────────────────────────────────────────────────

/**
 * Streams a chat completion and calls onToken for each text delta.
 *
 * @param {Array<{role, content}>} messages
 * @param {string} systemPrompt
 * @param {string} apiKey
 * @param {(token: string) => void} onToken
 * @returns {Promise<void>}
 */
export async function streamChatReply(messages, systemPrompt, apiKey, onToken) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.6,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chat error ${res.status}: ${err}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
      try {
        const json = JSON.parse(line.slice(6));
        const token = json.choices?.[0]?.delta?.content;
        if (token) onToken(token);
      } catch {
        // malformed SSE line — skip
      }
    }
  }
}
