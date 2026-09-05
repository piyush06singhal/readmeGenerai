import { useEffect, useMemo, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { fetchFileContent } from '../services/github';

interface FilePreviewProps {
  owner: string;
  repo: string;
  path: string;
  onClose: () => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; content: string; truncated: boolean }
  | { status: 'error'; message: string };

const EXT_LABELS: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX', mjs: 'JavaScript',
  json: 'JSON', md: 'Markdown', css: 'CSS', scss: 'SCSS', less: 'Less',
  html: 'HTML', yml: 'YAML', yaml: 'YAML', toml: 'TOML', py: 'Python',
  rs: 'Rust', go: 'Go', sh: 'Shell', bash: 'Shell', sql: 'SQL',
  xml: 'XML', vue: 'Vue', svelte: 'Svelte', java: 'Java', c: 'C',
  cpp: 'C++', rb: 'Ruby', php: 'PHP', dockerfile: 'Dockerfile', env: 'env',
};

function languageLabel(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return EXT_LABELS[ext] ?? (ext.toUpperCase() || 'text');
}

/** Close on Escape for keyboard accessibility. */
function useEscape(onEscape: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', onKey);
    // Prevent page scroll while the modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onEscape]);
}

export default function FilePreview({ owner, repo, path, onClose }: FilePreviewProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);

  useEscape(onClose);

  useEffect(() => {
    let cancelled = false;
    fetchFileContent(owner, repo, path)
      .then((res) => {
        if (cancelled) return;
        setState({ status: 'success', content: res.content, truncated: res.truncated });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Could not load this file.';
        setState({ status: 'error', message });
      });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, path]);

  const langLabel = useMemo(() => languageLabel(path), [path]);

  // Highlight the code with the detected language, falling back to auto-detect.
  const highlighted = useMemo(() => {
    if (state.status !== 'success') return '';
    const langName = hljs.getLanguage(langLabel.toLowerCase())?.name;
    try {
      if (langName) {
        return hljs.highlight(state.content, { language: langName }).value;
      }
      return hljs.highlightAuto(state.content).value;
    } catch {
      // Escape via the browser so nothing raw is ever injected.
      const div = document.createElement('div');
      div.textContent = state.content;
      return div.innerHTML;
    }
  }, [state, langLabel]);

  const handleCopy = async () => {
    if (state.status !== 'success') return;
    try {
      await navigator.clipboard.writeText(state.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${path}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-3xl max-h-[82vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-tertiary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M2 12a10 10 0 1120 0 10 10 0 01-20 0zm11-4.5a1.5 1.5 0 01-3 0v-1a1.5 1.5 0 013 0v1zm0 2c0 1.2-.9 1.7-1.7 2.1-.8.4-1.3.7-1.3 1.4h3v1.5H9.5v-1.5c0-1.2.9-1.7 1.7-2.1.8-.4 1.3-.7 1.3-1.4h2z" fillRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-text-primary truncate font-mono">{path}</span>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-accent-indigo/10 text-accent-indigo uppercase tracking-wide">
            {langLabel}
          </span>
          <button
            onClick={handleCopy}
            disabled={state.status !== 'success'}
            aria-label="Copy file contents"
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white border border-slate-200 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white border border-transparent transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        {state.status === 'loading' && (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-accent-indigo animate-spin" />
              Reading file…
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <p className="text-sm font-medium text-text-primary mb-1">Couldn't load this file</p>
            <p className="text-sm text-text-tertiary mb-6 max-w-sm">{state.message}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-purple text-white text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}

        {state.status === 'success' && (
          <>
            {state.truncated && (
              <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-200">
                This file is large — showing its first {Math.round(state.content.length / 1024)} KB.
              </div>
            )}
            <pre className="flex-1 overflow-auto p-4 text-[13px] leading-[1.7] font-mono bg-slate-50">
              <code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </>
        )}
      </div>
    </div>
  );
}