import { useEffect, useRef, useState } from 'react';

interface ShortcutsHintProps {
  /** Enabled only when a README exists to export. */
  active: boolean;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'S'], label: 'Download README' },
  { keys: ['⌘', '⇧', 'C'], label: 'Copy Markdown' },
];

export default function ShortcutsHint({ active }: ShortcutsHintProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = 'shortcuts-hint-panel';

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Keyboard shortcuts"
        title={active ? 'Keyboard shortcuts' : 'Shortcuts available after generating'}
        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-slate-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18m-2 0a2 2 0 00-2 2v10a2 2 0 002 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15h3m6-2h1m-1 2h.01M10 15h.01" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Keyboard shortcuts"
          className="absolute right-0 top-full mt-2 w-64 z-50 rounded-xl bg-white border border-slate-200 shadow-2xl shadow-slate-400/40 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-slate-200">
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-tertiary font-medium">
              Keyboard shortcuts
            </p>
          </div>
          <div className="p-2">
            {SHORTCUTS.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg"
              >
                <span className="text-[12px] text-text-secondary">{s.label}</span>
                <span className="flex items-center gap-0.5">
                  {s.keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="px-1.5 py-0.5 text-[11px] font-medium text-text-primary bg-slate-100 border border-slate-200 rounded-md"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
            {!active && (
              <p className="px-2 pt-1 pb-2 text-[11px] text-text-muted">
                Shortcuts appear once a README has been generated.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}