import type { ReadmeQualityResult, ReadmeSectionStatus } from '../../types';

const STATUS_META: Record<
  ReadmeSectionStatus,
  { icon: string; label: string; className: string }
> = {
  complete: { icon: '✓', label: 'Complete', className: 'text-accent-emerald' },
  partial: { icon: '◐', label: 'Partial', className: 'text-amber-400' },
  missing: { icon: '✕', label: 'Missing', className: 'text-red-400' },
  'not-applicable': { icon: '–', label: 'Not applicable', className: 'text-text-muted' },
};

export default function QualityChecklist({ result }: { result: ReadmeQualityResult }) {
  return (
    <ul className="px-2 py-2">
      {result.sections.map((s) => {
        const meta = STATUS_META[s.status];
        return (
          <li
            key={s.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <span
              className={`w-4 text-center text-sm shrink-0 ${meta.className}`}
              aria-hidden="true"
            >
              {meta.icon}
            </span>
            <span className="text-xs text-text-secondary flex-1">{s.label}</span>
            <span className="text-[10px] text-text-muted w-20 text-right">{meta.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
