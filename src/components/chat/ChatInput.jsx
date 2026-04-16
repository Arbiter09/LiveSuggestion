import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-surface-3 shrink-0">
      <textarea
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything…"
        disabled={disabled}
        className="flex-1 bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40"
        style={{ maxHeight: '120px', overflowY: 'auto' }}
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 text-xs font-semibold bg-accent hover:bg-accent-hover rounded-lg text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        Send
      </button>
    </div>
  );
}
