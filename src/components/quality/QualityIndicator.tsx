import { useEffect, useRef, useState } from 'react';
import type { ReadmeQualityResult } from '../../types';
import QualityPanel from './QualityPanel';

interface QualityIndicatorProps {
  result: ReadmeQualityResult;
}

function scoreTone(score: number): { ring: string; label: string } {
  if (score >= 80) return { ring: 'text-accent-emerald', label: 'good' };
  if (score >= 50) return { ring: 'text-amber-400', label: 'needs work' };
  return { ring: 'text-red-400', label: 'incomplete' };
}

export default function QualityIndicator({ result }: QualityIndicatorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { ring, label } = scoreTone(result.score);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`README quality ${result.score} out of ${result.maxScore}, ${label}. ${open ? 'Close' : 'Open'} quality panel.`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-slate-100 border border-slate-200 transition-colors"
      >
        <svg className={`w-3.5 h-3.5 ${ring}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="tabular-nums">Quality {result.score}/{result.maxScore}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && <QualityPanel result={result} onClose={() => setOpen(false)} />}
    </div>
  );
}
