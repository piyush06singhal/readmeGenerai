import { useEffect, useRef, useState } from 'react';
import type { BadgeKey } from '../../types';

const KEY_META: Record<BadgeKey, { label: string; hint: string }> = {
  license: { label: 'License', hint: 'License from the repository' },
  stars: { label: 'Stars', hint: 'Star count' },
  forks: { label: 'Forks', hint: 'Fork count' },
  issues: { label: 'Issues', hint: 'Open issue count' },
  language: { label: 'Language', hint: 'Primary language' },
  framework: { label: 'Framework', hint: 'Primary framework' },
  repo: { label: 'Repository', hint: 'Repo & visibility' },
};

interface BadgeSelectorProps {
  /** Badge kinds the repository can actually support. */
  available: BadgeKey[];
  enabled: BadgeKey[];
  onChange: (enabled: BadgeKey[]) => void;
  /** Disable while there is no generated README to attach badges to. */
  disabled?: boolean;
}

export default function BadgeSelector({
  available,
  enabled,
  onChange,
  disabled,
}: BadgeSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = 'badge-selector-panel';

  useEffect(() => {
    if (!open) return;
    // Move focus into the dialog so keyboard users land on the controls.
    const firstCheckbox = ref.current?.querySelector<HTMLElement>('input[type="checkbox"]');
    firstCheckbox?.focus();
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (key: BadgeKey) => {
    const has = enabled.includes(key);
    onChange(has ? enabled.filter((k) => k !== key) : [...enabled, key]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-label="Badge options"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Badges to include in the exported README"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Badges
        {enabled.length > 0 && !disabled && (
          <span className="px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-accent-indigo/20 text-accent-indigo-light">
            {enabled.length}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Badge options"
          className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-64 z-[100] rounded-xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/15 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-200">
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
              Badges
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Shown below the title when you copy or download.
            </p>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {available.length === 0 ? (
              <p className="px-2 py-3 text-[12px] text-text-muted text-center">
                No badges available for this repository.
              </p>
            ) : (
              available.map((key) => {
                const meta = KEY_META[key];
                const checked = enabled.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-start gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(key)}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#6366F1] rounded"
                    />
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-text-primary leading-5">
                        {meta.label}
                      </span>
                      <span className="block text-[11px] text-text-muted leading-4">
                        {meta.hint}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}