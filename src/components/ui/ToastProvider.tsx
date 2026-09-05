import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastContext, type ToastInput, type ToastTone } from './ToastContext';

interface Toast {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

const DURATION_MS = 3800;

/** Small, short-lived, accessible notifications (top-center, below the nav). */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, ...input, tone: input.tone ?? 'info' }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  const toneStyles: Record<ToastTone, { ring: string; dot: string }> = {
    success: { ring: 'border-accent-emerald/30', dot: 'bg-accent-emerald' },
    error: { ring: 'border-error/40', dot: 'bg-error' },
    info: { ring: 'border-accent-indigo/30', dot: 'bg-accent-indigo' },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Live region for assistive tech; stack is short-lived and unobtrusive. */}
      <div
        aria-live="polite"
        role="status"
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const tone = toneStyles[t.tone];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`pointer-events-auto w-full flex items-start gap-3 px-4 py-2.5 rounded-xl bg-white/95 border ${tone.ring} shadow-xl shadow-slate-400/30 backdrop-blur-xl`}
              >
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${tone.dot}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary leading-5">{t.title}</p>
                  {t.message && (
                    <p className="text-[13px] text-text-secondary mt-0.5 leading-5">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}