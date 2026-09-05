import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { generateReadme } from '../services/ai';
import useReadmeDocument from '../hooks/useReadmeDocument';
import useReadmeQuality from '../hooks/useReadmeQuality';
import { availableBadgeKeys, generateBadges, injectBadges } from '../services/readme/badgeGenerator';
import type {
  ProjectContext,
  ReadmeStyle,
  GenerationProgress,
  BadgeKey,
} from '../types';
import WorkspaceHeader from './workspace/WorkspaceHeader';
import { Button, useToast } from './ui';
import ErrorDisplay from './ErrorDisplay';

const ease = [0.22, 1, 0.36, 1] as const;
const EditorPane = lazy(() => import('./workspace/EditorPane'));
const PreviewPane = lazy(() => import('./workspace/PreviewPane'));

// Staged UI messages while the generation request is in flight.
const STAGES: GenerationProgress[] = [
  { stage: 'preparing', message: 'Preparing project context...' },
  { stage: 'analyzing', message: 'Analyzing documentation structure...' },
  { stage: 'generating', message: 'Generating README...' },
  { stage: 'formatting', message: 'Formatting Markdown...' },
];

type GenState =
  | { status: 'idle' }
  | { status: 'generating'; progress: GenerationProgress }
  | { status: 'success'; markdown: string }
  | { status: 'error'; message: string; code?: string };

interface ReadmeWorkspaceProps {
  context: ProjectContext;
  onBack?: () => void;
}

export default function ReadmeWorkspace({ context, onBack }: ReadmeWorkspaceProps) {
  const [style, setStyle] = useState<ReadmeStyle>('standard');
  const [personalization, setPersonalization] = useState('');
  const [genState, setGenState] = useState<GenState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');
  const { document: readmeDoc, setMarkdown, replaceWithGenerated } = useReadmeDocument();
  const quality = useReadmeQuality(readmeDoc.markdown, context);
  const stageIndexRef = useRef(0);
  const { toast } = useToast();

  const repo = context.repo;

  // --- Badges (deterministic, repo-aware) ---
  const badgesAvailable = useMemo(() => availableBadgeKeys(context), [context]);
  const [enabledBadges, setEnabledBadges] = useState<BadgeKey[]>(() => badgesAvailable);
  const badges = useMemo(
    () => generateBadges(context, enabledBadges),
    [context, enabledBadges]
  );
  // The document as it will actually be exported (badges injected).
  const exportMarkdown = useMemo(
    () => injectBadges(readmeDoc.markdown, badges),
    [readmeDoc.markdown, badges]
  );

  const run = async (selectedStyle: ReadmeStyle) => {
    setGenState({ status: 'generating', progress: STAGES[0] });
    stageIndexRef.current = 0;

    const stageTimer = setInterval(() => {
      stageIndexRef.current = Math.min(stageIndexRef.current + 1, STAGES.length - 1);
      setGenState((prev) =>
        prev.status === 'generating'
          ? { status: 'generating', progress: STAGES[stageIndexRef.current] }
          : prev,
      );
    }, 700);

    try {
      const { markdown } = await generateReadme({
        projectContext: context,
        style: selectedStyle,
        personalization: personalization.trim() || undefined,
      });
      replaceWithGenerated(markdown);
      setGenState({ status: 'success', markdown });
      toast({ title: 'README generated', message: `Generated with the ${selectedStyle} style.`, tone: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      const code =
        err && typeof err === 'object' && 'code' in err
          ? (err as { code: string }).code
          : undefined;
      setGenState({ status: 'error', message, code });
      toast({ title: 'Generation failed', message, tone: 'error' });
    } finally {
      clearInterval(stageTimer);
    }
  };

  const handleCopy = useCallback(async () => {
    if (genState.status !== 'success') return;
    try {
      await navigator.clipboard.writeText(exportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard', message: 'README Markdown copied.', tone: 'success' });
    } catch {
      toast({ title: 'Copy failed', message: 'Could not access the clipboard.', tone: 'error' });
    }
  }, [genState.status, exportMarkdown, toast]);

  const handleDownload = useCallback(() => {
    if (genState.status !== 'success') return;
    const blob = new Blob([exportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'README downloaded', message: 'README.md saved to your downloads.', tone: 'success' });
  }, [genState.status, exportMarkdown, toast]);

  const handleBadgesChange = (next: BadgeKey[]) => {
    setEnabledBadges(next);
    toast({ title: 'Badges updated', message: `${next.length} selected.`, tone: 'info' });
  };

  const handleRegenerate = () => {
    if (readmeDoc.isDirty) {
      const confirmed = window.confirm(
        'You have unsaved edits. Regenerating will replace your current changes. Continue?',
      );
      if (!confirmed) return;
    }
    run(style);
  };

  // Keyboard shortcuts: Cmd/Ctrl+S → download, Cmd/Ctrl+Shift+C → copy.
  // These only fire once a README actually exists.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (genState.status !== 'success') return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        handleDownload();
      } else if (key === 'c' && e.shiftKey) {
        e.preventDefault();
        handleCopy();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [genState.status, handleCopy, handleDownload]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
      {/* Header — always visible */}
      <WorkspaceHeader
        repo={repo}
        isDirty={genState.status === 'success' && readmeDoc.isDirty}
        quality={genState.status === 'success' ? quality : null}
        style={style}
        isGenerating={genState.status === 'generating'}
        copied={copied}
        badgesAvailable={badgesAvailable}
        badgesEnabled={enabledBadges}
        onBadgesChange={handleBadgesChange}
        badgesDisabled={genState.status !== 'success'}
        shortcutsActive={genState.status === 'success'}
        personalization={personalization}
        onPersonalizationChange={setPersonalization}
        showPersonalization={genState.status === 'success'}
        onStyleChange={setStyle}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onBack={onBack}
      />

      {/* Idle — no README generated yet */}
      {genState.status === 'idle' && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }}
            className="text-center max-w-md mx-auto p-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-indigo-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No README yet
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-7">
              {repo.fullName} has been analyzed. Generate documentation to start
              working, or analyze a different repository.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => run(style)}
                className="w-full sm:w-auto sm:min-w-[220px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate README
              </Button>
              {onBack && (
                <Button variant="secondary" size="lg" onClick={onBack} className="w-full sm:w-auto sm:min-w-[220px]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Review analysis
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Generating — staged progress */}
      {genState.status === 'generating' && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full bg-accent-indigo/20 blur-xl animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-accent-indigo/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-indigo border-r-accent-purple animate-spin" />
            </div>
            <p className="text-text-primary font-medium text-sm">
              {genState.progress.message}
            </p>
            <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-purple rounded-full"
                initial={{ width: '5%' }}
                animate={{ width: '92%' }}
                transition={{ duration: 12, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Error */}
      {genState.status === 'error' && (
        <div className="flex-1 flex items-center justify-center">
          <ErrorDisplay
            title="Generation failed"
            message={genState.message}
            code={genState.code}
            onRetry={() => run(style)}
          />
        </div>
      )}

      {/* Editor + Preview — split pane after successful generation */}
      {genState.status === 'success' && (
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite">
              <div className="flex items-center gap-3 text-sm text-text-tertiary">
                <span className="w-4 h-4 rounded-full border-2 border-accent-indigo/20 border-t-accent-indigo animate-spin" aria-hidden="true" />
                Loading workspace...
              </div>
            </div>
          }
        >
          {/* Mobile tab bar */}
          <div className="md:hidden flex shrink-0 border-b border-slate-200 bg-white" role="tablist" aria-label="View toggle">
            <button
              role="tab"
              aria-selected={mobileTab === 'editor'}
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'editor'
                  ? 'text-accent-indigo-light border-b-2 border-accent-indigo'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Editor
            </button>
            <button
              role="tab"
              aria-selected={mobileTab === 'preview'}
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'preview'
                  ? 'text-accent-indigo-light border-b-2 border-accent-indigo'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Desktop: resizable split pane */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            <PanelGroup orientation="horizontal">
              <Panel defaultSize={50} minSize={25}>
                <EditorPane value={readmeDoc.markdown} onChange={setMarkdown} />
              </Panel>
              <PanelResizeHandle className="w-px bg-slate-200 hover:bg-accent-indigo/50 transition-colors relative group">
                <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-accent-indigo/10 transition-colors" />
              </PanelResizeHandle>
              <Panel defaultSize={50} minSize={25}>
                <PreviewPane markdown={exportMarkdown} />
              </Panel>
            </PanelGroup>
          </div>

          {/* Mobile: tab panels */}
          <div className="flex-1 md:hidden overflow-hidden">
            {mobileTab === 'editor' ? (
              <EditorPane value={readmeDoc.markdown} onChange={setMarkdown} />
            ) : (
              <PreviewPane markdown={exportMarkdown} />
            )}
          </div>
        </Suspense>
      )}
    </div>
  );
}
