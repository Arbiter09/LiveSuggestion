import { useState } from 'react';

const TYPE_STYLES = {
  QUESTION_TO_ASK: { label: 'Question to Ask', badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20',    accent: 'hover:border-l-blue-400/60',   sent: 'border-l-blue-400/80 bg-blue-400/10' },
  TALKING_POINT:   { label: 'Talking Point',   badge: 'text-purple-400 bg-purple-400/10 border-purple-400/20', accent: 'hover:border-l-purple-400/60', sent: 'border-l-purple-400/80 bg-purple-400/10' },
  ANSWER:          { label: 'Answer',           badge: 'text-green-400 bg-green-400/10 border-green-400/20',   accent: 'hover:border-l-green-400/60',  sent: 'border-l-green-400/80 bg-green-400/10' },
  FACT_CHECK:      { label: 'Fact Check',       badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', accent: 'hover:border-l-yellow-400/60', sent: 'border-l-yellow-400/80 bg-yellow-400/10' },
  CLARIFICATION:   { label: 'Clarification',    badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20', accent: 'hover:border-l-orange-400/60', sent: 'border-l-orange-400/80 bg-orange-400/10' },
};

const DEFAULT_STYLE = { label: 'Suggestion', badge: 'text-gray-400 bg-gray-400/10 border-gray-400/20', accent: 'hover:border-l-gray-400/60', sent: 'border-l-gray-400/80 bg-gray-400/10' };

export default function SuggestionCard({ suggestion, onClick }) {
  const style = TYPE_STYLES[suggestion.type] ?? DEFAULT_STYLE;
  const [sent, setSent] = useState(false);

  const handleClick = () => {
    onClick(suggestion);
    setSent(true);
    setTimeout(() => setSent(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left rounded-lg border border-surface-3 border-l-2 p-3.5 transition-all duration-200 group ${
        sent ? style.sent : `bg-surface-2 hover:bg-surface-3 ${style.accent}`
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
          {style.label}
        </span>
        {sent && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <SentIcon />
            Sent to chat
          </span>
        )}
      </div>
      <p className="text-sm text-gray-300 leading-snug group-hover:text-gray-100 transition-colors">
        {suggestion.preview}
      </p>
    </button>
  );
}

function SentIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
