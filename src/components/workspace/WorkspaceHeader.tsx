import type {
  GitHubRepoInfo,
  ReadmeStyle,
  ReadmeQualityResult,
  BadgeKey,
} from '../../types';
import { Button } from '../ui';
import { QualityIndicator } from '../quality';
import BadgeSelector from './BadgeSelector';
import ShortcutsHint from './ShortcutsHint';

const STYLE_OPTIONS: { value: ReadmeStyle; label: string; hint: string }[] = [
  { value: 'standard', label: 'Standard', hint: 'Balanced, professional' },
  { value: 'detailed', label: 'Detailed', hint: 'Thorough & expanded' },
  { value: 'minimal', label: 'Minimal', hint: 'Concise essentials' },
];

interface WorkspaceHeaderProps {
  repo: GitHubRepoInfo;
  isDirty: boolean;
  quality: ReadmeQualityResult | null;
  style: ReadmeStyle;
  isGenerating: boolean;
  // Badge controls
  badgesAvailable?: BadgeKey[];
  badgesEnabled?: BadgeKey[];
  onBadgesChange?: (enabled: BadgeKey[]) => void;
  badgesDisabled?: boolean;
  onStyleChange: (style: ReadmeStyle) => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onBack?: () => void;
  copied: boolean;
  shortcutsActive?: boolean;
  // Personalization — free-form instructions applied on regenerate.
  personalization?: string;
  onPersonalizationChange?: (value: string) => void;
  showPersonalization?: boolean;
}

export default function WorkspaceHeader({
  repo,
  isDirty,
  quality,
  style,
  isGenerating,
  badgesAvailable,
  badgesEnabled,
  onBadgesChange,
  badgesDisabled,
  onStyleChange,
  onRegenerate,
  onCopy,
  onDownload,
  onBack,
  copied,
  shortcutsActive = false,
  personalization = '',
  onPersonalizationChange,
  showPersonalization = false,
}: WorkspaceHeaderProps) {
  return (
    <div className="relative z-30 shrink-0 p-4 md:p-5 bg-white/80 border-b border-slate-200 backdrop-blur-xl">
      {/* Row 1: Repo info + dirty indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-slate-100 transition-colors"
              aria-label="Back to analysis"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-text-primary truncate">
              {repo.fullName}
            </h2>
            {repo.description && (
              <p className="text-xs text-text-tertiary truncate max-w-md">
                {repo.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full">
              Edited
            </span>
          )}
          {quality && <QualityIndicator result={quality} />}
        </div>
      </div>

      {/* Row 2: Style selector + action buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStyleChange(opt.value)}
              title={opt.hint}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                style === opt.value
                  ? 'bg-gradient-to-r from-accent-indigo to-accent-purple text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {onBadgesChange && badgesEnabled && (
          <BadgeSelector
            available={badgesAvailable ?? []}
            enabled={badgesEnabled}
            onChange={onBadgesChange}
            disabled={badgesDisabled}
          />
        )}

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isGenerating}
          isLoading={isGenerating}
          aria-label="Regenerate README"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Regenerate</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onCopy} aria-label={copied ? 'Copied' : 'Copy markdown'}>
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline text-accent-emerald">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>

        <Button variant="ghost" size="sm" onClick={onDownload} aria-label="Download README.md">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Download</span>
        </Button>

        <ShortcutsHint active={shortcutsActive} />
      </div>

      {/* Personalization — feedback applied on regenerate */}
      {showPersonalization && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-3.5 h-3.5 text-accent-indigo-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <label htmlFor="readme-personalization" className="text-xs font-semibold text-text-primary">
              Personalize your README
            </label>
          </div>
          <textarea
            id="readme-personalization"
            value={personalization}
            onChange={(e) => onPersonalizationChange?.(e.target.value)}
            rows={2}
            disabled={!onPersonalizationChange}
            placeholder="e.g. Write for a CTO audience, emphasize performance & benchmarks, add a quick-start, lead with the feature the users care about…"
            className="w-full resize-none rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-indigo/40 focus:border-accent-indigo transition-colors disabled:opacity-50"
          />
          <p className="mt-1 text-[11px] text-text-tertiary leading-snug">
            Hit <span className="font-semibold text-text-primary">Regenerate</span> — Groq rewrites the README to match your feedback.
          </p>
        </div>
      )}
    </div>
  );
}
