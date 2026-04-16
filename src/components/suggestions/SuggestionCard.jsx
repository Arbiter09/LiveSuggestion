const TYPE_STYLES = {
  QUESTION_TO_ASK: { label: 'Question to Ask', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  TALKING_POINT:   { label: 'Talking Point',   color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  ANSWER:          { label: 'Answer',           color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  FACT_CHECK:      { label: 'Fact Check',       color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  CLARIFICATION:   { label: 'Clarification',    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
};

const DEFAULT_STYLE = { label: 'Suggestion', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' };

export default function SuggestionCard({ suggestion, onClick }) {
  const style = TYPE_STYLES[suggestion.type] ?? DEFAULT_STYLE;

  return (
    <button
      onClick={() => onClick(suggestion)}
      className="w-full text-left rounded-lg border border-surface-3 bg-surface-2 hover:bg-surface-3 hover:border-surface-3 p-3.5 transition-all duration-150 group"
    >
      <span
        className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2 ${style.color}`}
      >
        {style.label}
      </span>
      <p className="text-sm text-gray-300 leading-snug group-hover:text-gray-100 transition-colors">
        {suggestion.preview}
      </p>
    </button>
  );
}
