import { lazy, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analyzeRepository } from '../services/github';
import type { ProjectContext, AnalysisProgress } from '../types';
import AnalysisProgressComponent from '../components/AnalysisProgress';
import AnalysisResults from '../components/AnalysisResults';
import ErrorDisplay from '../components/ErrorDisplay';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ReadmeWorkspace = lazy(() => import('../components/ReadmeWorkspace'));

const ease = [0.22, 1, 0.36, 1] as const;

// Clean state machine — idle → analyzing → success | error.
// No scattered boolean flags.
type AnalysisState =
  | { status: 'idle' }
  | { status: 'analyzing'; progress: AnalysisProgress }
  | { status: 'success'; data: ProjectContext }
  | { status: 'error'; message: string; code?: string };

const ANALYSIS_PROGRESS: AnalysisProgress = {
  stage: 'validating',
  message: 'Analyzing repository...',
};

export default function AnalyzePage() {
  const [searchParams] = useSearchParams();
  const repoUrl = searchParams.get('url');
  const reducedMotion = useReducedMotion();

  const [state, setState] = useState<AnalysisState>(
    repoUrl ? { status: 'analyzing', progress: ANALYSIS_PROGRESS } : { status: 'idle' }
  );
  const [workspaceRepoUrl, setWorkspaceRepoUrl] = useState<string | null>(null);
  const showWorkspace = Boolean(repoUrl && workspaceRepoUrl === repoUrl);

  useEffect(() => {
    if (!repoUrl) {
      return;
    }

    let cancelled = false;
    const url = repoUrl;

    async function run() {
      try {
        const data = await analyzeRepository(url);
        if (cancelled) return;
        setState({ status: 'success', data });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Something went wrong';
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code: string }).code
            : undefined;
        setState({ status: 'error', message, code });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [repoUrl]);

  return (
    <section className="min-h-screen pt-24 pb-16">
      <div className={`container-app ${showWorkspace ? '' : 'max-w-5xl'} mx-auto`}>
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Repository Analysis
          </h1>
          {repoUrl && (
            <motion.p
              key={repoUrl}
              className="text-text-secondary font-mono text-sm break-all"
            >
              {repoUrl}
            </motion.p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease }}
        >
          {state.status === 'analyzing' && (
            <AnalysisProgressComponent progress={state.progress} />
          )}

          {state.status === 'error' && (
            <ErrorDisplay
              title="Analysis failed"
              message={state.message}
              code={state.code}
              onRetry={() => window.location.reload()}
            />
          )}

          {state.status === 'success' ? (
            showWorkspace ? (
              <ReadmeWorkspace
                key={state.data.repo.fullName}
                context={state.data}
                onBack={() => setWorkspaceRepoUrl(null)}
              />
            ) : (
              <AnalysisResults
                context={state.data}
                onGenerate={() => setWorkspaceRepoUrl(repoUrl)}
              />
            )
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}