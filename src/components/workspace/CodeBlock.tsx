import { useState, type ReactNode } from 'react';

interface CodeBlockProps {
  // Raw source text (copied verbatim when the user clicks Copy).
  code: string;
  // Optional detected language tag, e.g. 'bash', 'js'.
  language?: string | null;
  children: ReactNode;
}

const LANGUAGE_NAMES: Record<string, string> = {
  bash: 'bash',
  sh: 'shell',
  shell: 'shell',
  zsh: 'zsh',
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  php: 'PHP',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  sql: 'SQL',
  md: 'Markdown',
  markdown: 'Markdown',
  dockerfile: 'Dockerfile',
  diff: 'diff',
  graphql: 'GraphQL',
  ini: 'INI',
  toml: 'TOML',
  kotlin: 'Kotlin',
  swift: 'Swift',
  scala: 'Scala',
  tsconfig: 'JSON',
  env: 'env',
  gitignore: 'Git',
};

export default function CodeBlock({ code, language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable (e.g. permissions); do nothing.
    }
  };

  const langLabel = language ? LANGUAGE_NAMES[language] ?? language : null;

  return (
    <div className="group/code relative my-4 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-1.5 border-b border-slate-200 bg-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-slate-300" aria-hidden="true" />
          {langLabel ? (
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">
              {langLabel}
            </span>
          ) : (
            <span className="text-[11px] text-text-muted">code</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-text-tertiary hover:text-text-primary hover:bg-white transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code region — horizontal scroll, generous line height */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-[13px] leading-[1.7] font-mono">{children}</pre>
      </div>
    </div>
  );
}