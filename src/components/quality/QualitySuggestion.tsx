import type { ReadmeSuggestion, SuggestionSeverity } from '../../types';

const SEVERITY_META: Record<
  SuggestionSeverity,
  { icon: string; className: string; label: string }
> = {
  critical: { icon: '✕', className: 'text-red-400 border-red-400/40', label: 'Recommended' },
  warning: { icon: '!', className: 'text-amber-400 border-amber-400/40', label: 'Improvement' },
  info: { icon: 'i', className: 'text-accent-indigo-light border-accent-indigo-light/40', label: 'Suggestion' },
};

export default function QualitySuggestion({ suggestion }: { suggestion: ReadmeSuggestion }) {
  const meta = SEVERITY_META[suggestion.severity];
  return (
    <li className="flex gap-3 px-4 py-2.5 border-t border-slate-200">
      <span
        className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold ${meta.className}`}
        aria-hidden="true"
      >
        {meta.icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-text-primary leading-snug">{suggestion.message}</p>
        <p className="text-[11px] text-text-tertiary mt-0.5 leading-snug">{suggestion.reason}</p>
      </div>
    </li>
  );
}
