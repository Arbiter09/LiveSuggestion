import { useEffect, useRef } from 'react';
import useSessionStore from '../../store/useSessionStore';
import { streamChatReply } from '../../lib/groq';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatPanel() {
  const { chatMessages, isStreaming, apiKey, settings, addChatMessage, appendToLastMessage, setIsStreaming } =
    useSessionStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, isStreaming]);

  const sendMessage = async (userText) => {
    if (!apiKey || isStreaming) return;

    addChatMessage('user', userText);
    addChatMessage('assistant', '');
    setIsStreaming(true);

    try {
      const transcript = useSessionStore.getState().getChatTranscript();

      // Build history: exclude the empty assistant placeholder just added,
      // and filter out any empty messages from prior incomplete responses.
      const history = useSessionStore
        .getState()
        .chatMessages.slice(0, -1)
        .filter((m) => m.content.trim())
        .map(({ role, content }) => ({ role, content }));

      const systemWithTranscript = `${settings.chatPrompt}\n\n---\nSession transcript:\n${transcript || '(no transcript yet)'}`;

      await streamChatReply(history, systemWithTranscript, apiKey, (token) => {
        appendToLastMessage(token);
      });
    } catch (err) {
      appendToLastMessage(`\n\n⚠️ Error: ${err.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PanelHeader />

      <div className="panel-scroll px-4 py-3 space-y-3">
        {chatMessages.length === 0 ? (
          <EmptyState />
        ) : (
          chatMessages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming || !apiKey} />
    </div>
  );
}

function PanelHeader() {
  return (
    <div className="px-4 py-3 border-b border-surface-3 shrink-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        3. Chat (Detailed Answers)
      </span>
      <span className="ml-2 text-xs text-gray-600">Session-only</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
      <p className="text-sm text-gray-500">
        Click a suggestion or type a question to start chatting.
      </p>
    </div>
  );
}
