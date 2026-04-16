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
        const transcript = useSessionStore.getState().getChatTranscript();
        const systemPrompt = `${settings.detailedAnswerPrompt}\n\n---\nFull session transcript:\n${transcript || '(no transcript yet)'}`;

        // Provide the detail field as extra context in the user turn
        const messages = [
          {
            role: 'user',
            content: `The user clicked this suggestion:\nType: ${suggestion.type}\nPreview: ${suggestion.preview}\nInternal detail hint: ${suggestion.detail}\n\nPlease provide a helpful, detailed response.`,
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
