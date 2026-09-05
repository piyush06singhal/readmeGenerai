import { motion } from 'framer-motion';
import type { AnalysisProgress } from '../types';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnalysisProgressProps {
  progress: AnalysisProgress;
}

const stages = [
  { key: 'validating', label: 'Validating URL', icon: 'link' },
  { key: 'fetching', label: 'Fetching metadata', icon: 'box' },
  { key: 'inspecting', label: 'Inspecting files', icon: 'search' },
  { key: 'detecting', label: 'Detecting tech stack', icon: 'settings' },
  { key: 'extracting', label: 'Extracting context', icon: 'file' },
  { key: 'complete', label: 'Complete', icon: 'check' },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

export default function AnalysisProgressComponent({
  progress,
}: AnalysisProgressProps) {
  const reducedMotion = useReducedMotion();
  const currentStageIndex = stages.findIndex(
    (s) => s.key === progress.stage
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-label="Analysis in progress">
          {typeof progress.progress === 'number' ? (
            <motion.div
              className="h-full bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-purple rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.5, ease }}
            />
          ) : (
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-purple rounded-full"
              initial={{ x: '-100%' }}
              animate={reducedMotion ? { x: '0%' } : { x: ['-100%', '300%'] }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-text-secondary" role="status" aria-live="polite">{progress.message}</p>
          <p className="text-sm text-text-tertiary font-mono">Working...</p>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.05, ease }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300
                ${
                  isCompleted
                    ? 'bg-accent-emerald/10 border-accent-emerald/30'
                    : isCurrent
                      ? 'bg-accent-indigo/10 border-accent-indigo/30'
                      : 'bg-white border-slate-200'
                }
              `}
            >
              {/* Pulse effect for current stage */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-accent-indigo/10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={reducedMotion ? { duration: 0 } : {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <span className={`flex w-5 h-5 items-center justify-center ${isPending ? 'opacity-50' : ''} ${isCompleted ? 'text-accent-emerald' : 'text-accent-indigo'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                    {stage.icon === 'link' && <><path strokeLinecap="round" strokeLinejoin="round" d="M13.8 10.2a4 4 0 010 5.6l-3 3a4 4 0 01-5.6-5.6l1.5-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.2 13.8a4 4 0 010-5.6l3-3a4 4 0 015.6 5.6l-1.5 1.5" /></>}
                    {stage.icon === 'box' && <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8l-9-5-9 5v8l9 5 9-5zM3.3 7.7L12 13l8.7-5.3M12 13v8" />}
                    {stage.icon === 'search' && <><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-4-4" /></>}
                    {stage.icon === 'settings' && <><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 000-6l-1-1.7a1.7 1.7 0 00-5-1.7h-2a1.7 1.7 0 00-5 1.7l-1 1.7a1.7 1.7 0 000 6l1 1.7a1.7 1.7 0 005 1.7h2a1.7 1.7 0 005-1.7l1-1.7z" /></>}
                    {stage.icon === 'file' && <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6" />}
                    {(stage.icon === 'check' || isCompleted) && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m5 12 4 4L19 7" />}
                  </svg>
                </span>

                {/* Label */}
                <span
                  className={`
                    text-sm font-medium
                    ${
                      isCompleted
                        ? 'text-accent-emerald'
                        : isCurrent
                          ? 'text-text-primary'
                          : 'text-text-tertiary'
                    }
                  `}
                >
                  {stage.label}
                </span>
              </div>

              {/* Checkmark for completed */}
              {isCompleted && (
                <motion.div
                  initial={{ scale: reducedMotion ? 1 : 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent-emerald flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Loading animation */}
      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.5 }}
      >
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Analyzing repository...</span>
        </div>
      </motion.div>
    </div>
  );
}