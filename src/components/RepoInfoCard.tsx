import { motion } from 'framer-motion';
import type { GitHubRepoInfo } from '../types';
import { formatNumber, formatDate } from '../utils/validation';

interface RepoInfoCardProps {
  repo: GitHubRepoInfo;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function RepoInfoCard({ repo }: RepoInfoCardProps) {
  const stats = [
    {
      label: 'Stars',
      value: repo.stars,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      label: 'Forks',
      value: repo.forks,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
    },
    {
      label: 'Issues',
      value: repo.openIssues,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl overflow-hidden shadow-sm"
    >
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent-indigo/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-primary mb-1 truncate">
              {repo.name}
            </h2>
            <p className="text-sm text-text-secondary">{repo.fullName}</p>
          </div>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary bg-white hover:bg-slate-50 border border-slate-200 hover:border-accent-indigo/40 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Description */}
        {repo.description && (
          <p className="text-sm text-text-secondary leading-relaxed mb-5">
            {repo.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent-indigo/10 text-accent-indigo-light border border-accent-indigo/20 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-accent-indigo" />
              {repo.language}
            </span>
          )}
          {repo.license && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white text-text-secondary border border-slate-200 rounded-lg">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {repo.license}
            </span>
          )}
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white text-text-secondary border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Website
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-text-tertiary">{stat.icon}</span>
              <span className="text-sm font-medium text-text-primary">
                {formatNumber(stat.value)}
              </span>
              <span className="text-xs text-text-tertiary">{stat.label}</span>
            </div>
          ))}
          <div className="ml-auto text-xs text-text-tertiary">
            Updated {formatDate(repo.pushedAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}