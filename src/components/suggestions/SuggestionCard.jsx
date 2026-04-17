const TYPE_STYLES = {
  QUESTION_TO_ASK: { label: 'Question to Ask', badge: 'text-blue-400 bg-blue-400/10 border-blue-400/20',   accent: 'hover:border-l-blue-400/60' },
  TALKING_POINT:   { label: 'Talking Point',   badge: 'text-purple-400 bg-purple-400/10 border-purple-400/20', accent: 'hover:border-l-purple-400/60' },
  ANSWER:          { label: 'Answer',           badge: 'text-green-400 bg-green-400/10 border-green-400/20',   accent: 'hover:border-l-green-400/60' },
  FACT_CHECK:      { label: 'Fact Check',       badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', accent: 'hover:border-l-yellow-400/60' },
  CLARIFICATION:   { label: 'Clarification',    badge: 'text-orange-400 bg-orange-400/10 border-orange-400/20', accent: 'hover:border-l-orange-400/60' },
};

const DEFAULT_STYLE = { label: 'Suggestion', badge: 'text-gray-400 bg-gray-400/10 border-gray-400/20', accent: 'hover:border-l-gray-400/60' };

export default function SuggestionCard({ suggestion, onClick }) {
  const style = TYPE_STYLES[suggestion.type] ?? DEFAULT_STYLE;

  return (
    <button
      onClick={() => onClick(suggestion)}
      className={`w-full text-left rounded-lg border border-surface-3 border-l-2 bg-surface-2 hover:bg-surface-3 p-3.5 transition-all duration-150 group ${style.accent}`}
    >
      <span
        className={`inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2 ${style.badge}`}
      >
        {style.label}
      </span>
      <p className="text-sm text-gray-300 leading-snug group-hover:text-gray-100 transition-colors">
        {suggestion.preview}
      </p>
    </button>
  );
}
