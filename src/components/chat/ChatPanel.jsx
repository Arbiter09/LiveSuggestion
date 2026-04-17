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
    <div className="flex items-center gap-2 px-4 h-12 border-b border-surface-3 shrink-0">
      <ChatIcon />
      <span className="text-sm font-semibold text-gray-200">Chat</span>
      <span className="text-xs text-gray-600 bg-surface-2 px-1.5 py-0.5 rounded-full">Session-only</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center gap-3 px-4">
      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-gray-600">
        <ChatIcon size={20} />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        Click a suggestion or type a question to get a detailed answer.
      </p>
    </div>
  );
}

function ChatIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
