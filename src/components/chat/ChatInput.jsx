import { useState, useRef, useEffect } from 'react';

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 px-3 py-3 border-t border-surface-3 shrink-0">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything…"
        disabled={disabled}
        className="flex-1 bg-surface-2 border border-surface-3 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40 leading-relaxed overflow-hidden"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        title="Send message"
        aria-label="Send message"
        className="flex items-center justify-center w-9 h-9 bg-accent hover:bg-accent-hover rounded-xl text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <SendIcon />
      </button>
    </div>
  );
}
