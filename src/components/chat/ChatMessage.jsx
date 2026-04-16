/**
 * A single chat message bubble — user or assistant.
 */
export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="text-[10px] text-gray-600 px-1">
        {isUser ? 'You' : 'Assistant'} ·{' '}
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div
        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-surface-2 text-gray-200 rounded-bl-sm'
        }`}
      >
        {message.content || <span className="opacity-40 animate-pulse">▍</span>}
      </div>
    </div>
  );
}
