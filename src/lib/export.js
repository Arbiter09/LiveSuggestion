/**
 * Builds and triggers a download of the full session export.
 * Format: structured JSON with timestamps for transcript, suggestions, and chat.
 */

/**
 * @param {object} session
 * @param {Array} session.transcriptChunks
 * @param {Array} session.suggestionBatches
 * @param {Array} session.chatMessages
 */
export function exportSession({ transcriptChunks, suggestionBatches, chatMessages }) {
  const payload = {
    exportedAt: new Date().toISOString(),
    transcript: transcriptChunks.map((c) => ({
      timestamp: c.timestamp,
      text: c.text,
    })),
    suggestions: suggestionBatches.map((b) => ({
      timestamp: b.timestamp,
      suggestions: b.suggestions.map(({ type, preview, detail }) => ({ type, preview, detail })),
    })),
    chat: chatMessages.map((m) => ({
      timestamp: m.timestamp,
      role: m.role,
      content: m.content,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(d) {
  return d.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
