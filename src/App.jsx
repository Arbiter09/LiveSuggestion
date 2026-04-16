import { useCallback } from 'react';
import AppLayout from './components/layout/AppLayout';
import TranscriptPanel from './components/transcript/TranscriptPanel';
import SuggestionsPanel from './components/suggestions/SuggestionsPanel';
import ChatPanel from './components/chat/ChatPanel';
import useSessionStore from './store/useSessionStore';
import { streamChatReply } from './lib/groq';

export default function App() {
  const { apiKey, settings, addChatMessage, appendToLastMessage, setIsStreaming, isStreaming } = useSessionStore();

  /**
   * When a suggestion card is clicked:
   * 1. Add the preview as the user message
   * 2. Stream a detailed answer using the detailedAnswerPrompt + full transcript
   */
  const handleSuggestionClick = useCallback(
    async (suggestion) => {
      if (!apiKey || isStreaming) return;

      const userText = `[${suggestion.type.replace(/_/g, ' ')}] ${suggestion.preview}`;
      addChatMessage('user', userText);
      addChatMessage('assistant', '');
      setIsStreaming(true);

      try {
        const transcript = useSessionStore.getState().getDetailedAnswerTranscript();

        // Inject the suggestion type so the prompt can apply the right response style.
        const systemPrompt = `${settings.detailedAnswerPrompt}\n\nThe suggestion that was clicked is of type: ${suggestion.type}\n\n---\nFull session transcript:\n${transcript || '(no transcript yet)'}`;

        const messages = [
          {
            role: 'user',
            content: `Suggestion clicked:\nType: ${suggestion.type}\nPreview: "${suggestion.preview}"\nContext hint: ${suggestion.detail}\n\nProvide a detailed, immediately useful response following the style guide for ${suggestion.type}.`,
          },
        ];

        await streamChatReply(messages, systemPrompt, apiKey, (token) => {
          appendToLastMessage(token);
        });
      } catch (err) {
        appendToLastMessage(`\n\n⚠️ Error: ${err.message}`);
      } finally {
        setIsStreaming(false);
      }
    },
    [apiKey, settings.detailedAnswerPrompt, isStreaming, addChatMessage, appendToLastMessage, setIsStreaming],
  );

  return (
    <AppLayout
      left={<TranscriptPanel />}
      center={<SuggestionsPanel onSuggestionClick={handleSuggestionClick} />}
      right={<ChatPanel />}
    />
  );
}
