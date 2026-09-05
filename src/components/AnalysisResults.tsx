import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { ProjectContext } from '../types';
import RepoInfoCard from './RepoInfoCard';
import TechStackDisplay from './TechStackDisplay';
import FileTreeView from './FileTreeView';
import FilePreview from './FilePreview';
import { Button } from './ui';
import { formatNumber } from '../utils/validation';

interface AnalysisResultsProps {
  context: ProjectContext;
  onGenerate?: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className="p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2.5 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalysisResults({ context, onGenerate }: AnalysisResultsProps) {
  const { repo, techStack, dependencies, projectStructure } = context;
  const [showAllDeps, setShowAllDeps] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  // Owner/repo for on-demand preview via the server's /api/file route.
  const [repoOwner, repoName] = repo.fullName.split('/');

  const depEntries = Object.entries(dependencies.dependencies);
  const devDepEntries = Object.entries(dependencies.devDependencies);
  const scriptEntries = Object.entries(dependencies.scripts);

  const renderDeps = () => {
    const maxShown = showAllDeps ? depEntries.length : Math.min(12, depEntries.length);

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {depEntries.slice(0, maxShown).map(([name, version]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-2 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm overflow-hidden"
            >
              <span className="text-text-secondary font-mono text-xs truncate min-w-0" title={name}>
                {name}
              </span>
              <span className="text-text-tertiary font-mono text-xs shrink-0">
                {version}
              </span>
            </div>
          ))}
        </div>
        {depEntries.length > 12 && (
          <button
            onClick={() => setShowAllDeps(!showAllDeps)}
            className="mt-3 text-xs text-accent-indigo-light hover:text-accent-indigo transition-colors"
          >
            {showAllDeps ? 'Show less' : `Show all ${depEntries.length} dependencies`}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Generate README CTA */}
      {onGenerate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-accent-indigo/[0.12] to-accent-purple/[0.08] border border-accent-indigo/20"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Ready for documentation?
              </h3>
              <p className="text-sm text-text-secondary mt-1 max-w-md">
                Generate a polished README from this analyzed repository —
                tuned to its actual tech stack, scripts and structure.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onGenerate}
              className="shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate README
            </Button>
          </div>
        </motion.div>
      )}

      {/* Repo Info */}
      <RepoInfoCard repo={repo} />

      {/* Tech Stack */}
      <TechStackDisplay techStack={techStack} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Files', value: projectStructure.length, color: '#818CF8' },
          { label: 'Dependencies', value: depEntries.length, color: '#22D3EE' },
          { label: 'Dev Deps', value: devDepEntries.length, color: '#A855F7' },
          { label: 'Scripts', value: scriptEntries.length, color: '#10B981' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease }}
            className="p-4 rounded-xl bg-white border border-slate-200 text-center"
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-xs text-text-tertiary">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* File tree + Dependencies */}
      <div className="grid lg:grid-cols-2 gap-6">
        <FileTreeView nodes={projectStructure} onFileSelect={(path) => setPreviewPath(path)} />

        <div className="space-y-6">
          {/* Dependencies */}
          {depEntries.length > 0 && (
            <Section title="Dependencies" icon={<span className="text-base">📦</span>}>
              {renderDeps()}
            </Section>
          )}
        </div>
      </div>

      {/* Dev Dependencies */}
      {devDepEntries.length > 0 && (
        <Section title="Dev Dependencies" icon={<span className="text-base">🧰</span>} delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {devDepEntries.map(([name, version]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm overflow-hidden"
              >
                <span className="text-text-secondary font-mono text-xs truncate min-w-0" title={name}>
                  {name}
                </span>
                <span className="text-text-tertiary font-mono text-xs shrink-0">
                  {version}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Python dependencies */}
      {dependencies.pipDependencies && dependencies.pipDependencies.length > 0 && (
        <Section title="Python Dependencies" icon={<span className="text-base">🐍</span>} delay={0.18}>
          <div className="flex flex-wrap gap-2">
            {dependencies.pipDependencies.map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 text-xs font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg"
              >
                {name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Other ecosystems */}
      {dependencies.otherDependencies && dependencies.otherDependencies.length > 0 && (
        <Section title="Ecosystem Manifests" icon={<span className="text-base">🧩</span>} delay={0.19}>
          <div className="flex flex-wrap gap-2">
            {dependencies.otherDependencies.map((name) => (
              <span
                key={name}
                className="px-2.5 py-1 text-xs font-mono text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-lg"
              >
                {name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Scripts */}
      {scriptEntries.length > 0 && (
        <Section title="Scripts" icon={<span className="text-base">⚡</span>} delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scriptEntries.map(([name, script]) => (
              <div
                key={name}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-accent-indigo-light">
                    {name}
                  </span>
                </div>
                <code className="text-xs text-text-tertiary font-mono block truncate">
                  {script}
                </code>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Existing README */}
      {context.existingReadme && (
        <Section title="Existing README" icon={<span className="text-base">📝</span>} delay={0.25}>
          <div className="max-h-[400px] overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-5">
            <div className="max-w-none prose-sm prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary">
              <ReactMarkdown>{context.existingReadme.slice(0, 2000)}</ReactMarkdown>
            </div>
          </div>
        </Section>
      )}

      {/* .env.example */}
      {((context.envVariables && context.envVariables.length > 0) || context.envExample) && (
        <Section title="Environment Variables" icon={<span className="text-base">🔐</span>} delay={0.3}>
          {context.envVariables && context.envVariables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {context.envVariables.slice(0, 24).map((v) => (
                <div
                  key={v.name}
                  className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <code className="text-xs font-mono text-accent-cyan block truncate">
                    {v.name}
                  </code>
                  {v.description && (
                    <p className="text-[11px] text-text-tertiary mt-1 leading-snug line-clamp-2">
                      {v.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
          {context.envExample && (
            <pre className="max-h-[200px] overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-accent-cyan">
              {context.envExample.slice(0, 2000)}
            </pre>
          )}
        </Section>
      )}

      {/* Entry points & config files */}
      <div className="grid md:grid-cols-2 gap-6">
        {(context.entryPoints.length > 0 || context.configFiles.length > 0) && (
          <Section title="Key Files" icon={<span className="text-base">🎯</span>} delay={0.35}>
            {context.entryPoints.length > 0 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
                  Entry Points
                </p>
                <div className="flex flex-wrap gap-2">
                  {context.entryPoints.map((file) => (
                    <span
                      key={file}
                      className="px-2.5 py-1 text-xs font-mono text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 rounded-lg"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {context.configFiles.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide text-text-muted mb-2">
                  Config Files
                </p>
                <div className="flex flex-wrap gap-2">
                  {context.configFiles.map((file) => (
                    <span
                      key={file}
                      className="px-2.5 py-1 text-xs font-mono text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-lg"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}
      </div>

      {previewPath && (
        <FilePreview
          key={`${repoOwner}/${repoName}/${previewPath}`}
          owner={repoOwner}
          repo={repoName}
          path={previewPath}
          onClose={() => setPreviewPath(null)}
        />
      )}

      {/* Summary */}
      <Section title="Analysis Summary" icon={<span className="text-base">📊</span>} delay={0.4}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-text-muted mb-1">Repository Size</p>
            <p className="text-sm font-medium text-text-primary">
              {repo.size ? `${formatNumber(repo.size)} KB` : 'Unknown'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-text-muted mb-1">Default Branch</p>
            <p className="text-sm font-medium text-text-primary font-mono">
              {repo.defaultBranch}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-text-muted mb-1">Source Files Detected</p>
            <p className="text-sm font-medium text-text-primary">
              {context.sourceFiles.length}
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}