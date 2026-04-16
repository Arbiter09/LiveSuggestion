import ReactMarkdown from 'react-markdown';

/**
 * A single chat message bubble — user or assistant.
 * Assistant messages render markdown (bold, bullets, etc).
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
        {!message.content ? (
          <span className="opacity-40 animate-pulse">▍</span>
        ) : isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
              li: ({ children }) => <li className="text-gray-300">{children}</li>,
              code: ({ children }) => (
                <code className="bg-surface-3 text-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
