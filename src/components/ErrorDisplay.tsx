import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './ui';

interface ErrorDisplayProps {
  message: string;
  code?: string | null;
  onRetry?: () => void;
  title?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

const errorHints: Record<string, string> = {
  INVALID_URL: "Make sure the URL looks like: https://github.com/username/project",
  NOT_FOUND:
    "Double-check that the repository exists and is public. Private repositories can't be analyzed.",
  RATE_LIMITED:
    'We\'ve hit a rate limit. Please wait a minute and try again.',
  EMPTY_REPO:
    "This repository appears to be empty. Try one with at least one commit.",
  GITHUB_API_ERROR:
    'The GitHub API had trouble responding. This is usually temporary — please try again.',
  NETWORK_ERROR:
    'Could not reach our server. Check your internet connection and try again.',
  CONFIG_ERROR:
    'The AI service is not configured on the server. The server administrator needs to set the GROQ_API_KEY environment variable.',
  PROVIDER_ERROR:
    'The AI service returned an unexpected error. This is usually temporary — please try again.',
  TIMEOUT:
    'The AI request took too long. Try regenerating, or try a smaller repository.',
  EMPTY_OUTPUT:
    'The AI service returned an empty response. Please try again.',
  EMPTY_CONTEXT:
    'No usable project context was available. The repository may be too minimal for analysis.',
  INVALID_OUTPUT:
    'The generated Markdown was incomplete or malformed. Please try again.',
};

export default function ErrorDisplay({ message, code, onRetry, title = 'Something went wrong' }: ErrorDisplayProps) {
  const hint = code ? errorHints[code] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="max-w-lg mx-auto text-center py-12"
    >
      {/* Error icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center"
      >
        <svg
          className="w-8 h-8 text-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </motion.div>

      <h2 className="text-xl font-bold text-text-primary mb-3">
        {title}
      </h2>

      <p className="text-text-secondary mb-2 leading-relaxed">{message}</p>

      {hint && (
        <p className="text-sm text-text-tertiary leading-relaxed mb-6">
          {hint}
        </p>
      )}

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try again
          </Button>
        )}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary bg-white hover:bg-slate-50 border border-slate-200 hover:border-accent-indigo/40 transition-all duration-200"
        >
          Back to home
        </Link>
      </div>
    </motion.div>
  );
}