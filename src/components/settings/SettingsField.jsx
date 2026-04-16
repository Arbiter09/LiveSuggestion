/**
 * Reusable labeled field for the settings modal.
 * Renders a <textarea> for long text, <input> for short values.
 */
export default function SettingsField({ label, description, value, onChange, multiline = false, type = 'text' }) {
  const baseClass =
    'w-full bg-surface-3 border border-surface-3 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent resize-none';

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-300">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {multiline ? (
        <textarea
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </div>
  );
}
