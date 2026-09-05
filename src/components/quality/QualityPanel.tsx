import type { ReadmeQualityResult } from '../../types';
import QualityChecklist from './QualityChecklist';
import QualitySuggestion from './QualitySuggestion';

interface QualityPanelProps {
  result: ReadmeQualityResult;
  onClose: () => void;
}

export default function QualityPanel({ result, onClose }: QualityPanelProps) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-[19rem] md:w-80 z-50 rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-400/40 backdrop-blur-xl overflow-hidden"
      role="dialog"
      aria-label="README quality panel"
    >
      {/* Header with score */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
            README Quality
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-text-primary tabular-nums">{result.score}</span>
            <span className="text-sm text-text-tertiary tabular-nums">/ {result.maxScore}</span>
            <span className="ml-2 text-[11px] text-text-secondary truncate">{result.projectType}</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            {result.summary.complete} complete · {result.summary.partial} partial ·{' '}
            {result.summary.missing} missing
          </p>
        </div>
        <button
          onClick={onClose}
          autoFocus
          aria-label="Close quality panel"
          className="shrink-0 p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[50vh] overflow-y-auto">
        <QualityChecklist result={result} />

        <div className="px-4 pt-1 pb-2">
          {result.markdownIssues.length > 0 && (
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium mt-2 mb-1">
              Markdown issues
            </p>
          )}
          <ul>
            {result.suggestions.map((s) => (
              <QualitySuggestion key={s.id} suggestion={s} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
