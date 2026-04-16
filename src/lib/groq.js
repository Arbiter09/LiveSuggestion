/**
 * All Groq API interactions live here.
 * Three responsibilities:
 *   1. transcribeAudio  — Whisper Large V3
 *   2. fetchSuggestions — LLM structured suggestion generation
 *   3. streamChatReply  — LLM streaming chat response
 */

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const WHISPER_MODEL = 'whisper-large-v3';
const LLM_MODEL = 'openai/gpt-oss-120b';

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
 * @param {Array<{text: string}>} transcriptChunks
 * @param {string} systemPrompt
 * @param {string} apiKey
 * @param {string[]} lastBatchPreviews - previews from the most recent batch to avoid repeating
 * @returns {Promise<Array<{type, preview, detail}>>}
 */
export async function fetchSuggestions(transcriptChunks, systemPrompt, apiKey, lastBatchPreviews = []) {
  const { broaderContext, recentContext } = splitTranscriptContext(transcriptChunks);
  const clientSignals = buildClientSignals(recentContext);

  const alreadyShown = lastBatchPreviews.length
    ? `\nALREADY_SHOWN (do NOT repeat or paraphrase these):\n${lastBatchPreviews.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    : '';

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      temperature: 0.75,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `BROADER_CONTEXT:\n${broaderContext || '(none)'}\n\nRECENT_CONTEXT:\n${recentContext || '(none)'}\n\nCLIENT_SIGNALS:\n${JSON.stringify(clientSignals, null, 2)}${alreadyShown}\n\nGenerate exactly 3 suggestions.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Suggestions error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content || '{}');
  const suggestions = sanitizeSuggestions(Array.isArray(parsed.suggestions) ? parsed.suggestions : []);

  // If the model returned fewer than 3 valid suggestions, retry once without
  // the ALREADY_SHOWN constraint so we always surface a full batch.
  if (suggestions.length < 3 && lastBatchPreviews.length > 0) {
    return fetchSuggestions(transcriptChunks, systemPrompt, apiKey, []);
  }

  return suggestions;
}

function splitTranscriptContext(chunks) {
  if (!chunks.length) return { broaderContext: '', recentContext: '' };
  const recentChunk = chunks[chunks.length - 1]?.text ?? '';
  const broaderContext = chunks
    .slice(0, -1)
    .map((c) => c.text)
    .join('\n\n')
    .slice(-5000);
  return { broaderContext, recentContext: recentChunk };
}

function buildClientSignals(recentContext) {
  const text = recentContext || '';
  return {
    question_detected: /\?/.test(text),
    number_or_metric_detected: /\b\d+([.,]\d+)?\b|%|\$|ms|sec|million|billion/gi.test(text),
    architecture_terms_detected:
      /(latency|throughput|cache|shard|kafka|queue|database|websocket|api|worker)/gi.test(text),
    recency_note: 'Prioritize RECENT_CONTEXT over BROADER_CONTEXT when conflicts exist.',
  };
}

function sanitizeSuggestions(items) {
  return items
    .filter((s) => s && s.type && s.preview && s.detail)
    .slice(0, 3)
    .map((s) => ({
      type: String(s.type).toUpperCase(),
      preview: String(s.preview).trim(),
      detail: String(s.detail).trim(),
    }));
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
