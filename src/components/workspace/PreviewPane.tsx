import { isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';
import 'highlight.js/styles/github.css';

interface PreviewPaneProps {
  markdown: string;
  /** An accessibility label for the preview region. */
  ariaLabel?: string;
}

/** Recursively extract the raw text from a HAST node (for copyable source). */
function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { type?: string; value?: unknown; children?: unknown[] };
  if (n.type === 'text' && typeof n.value === 'string') return n.value;
  if (Array.isArray(n.children)) return n.children.map(extractText).join('');
  return '';
}

/** Allow http(s), mailto, and relative links; reject javascript:/data:/etc. */
function safeUrl(url?: string): string | null {
  if (!url || url.trim() === '') return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed)) {
    if (!/^(https?:|mailto:)/i.test(trimmed)) return null;
  }
  return trimmed;
}

export default function PreviewPane({ markdown, ariaLabel }: PreviewPaneProps) {
  return (
    <div
      className="h-full overflow-y-auto"
      role="region"
      aria-label={ariaLabel ?? 'Markdown preview'}
    >
      <div className="preview-prose px-6 md:px-8 py-6 md:py-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
          components={{
            // Code blocks — wrapped in a copyable shell with language label.
            pre: ({ node, children }) => {
              const codeEl = isValidElement(children) ? children : null;
              const props = codeEl?.props as { className?: string; node?: unknown } | undefined;
              const className = props?.className ?? '';
              const match = /language-([\w-]+)/.exec(className);
              const language = match ? match[1] : null;
              const raw = extractText(props?.node ?? node).trim();
              return (
                <CodeBlock code={raw} language={language}>
                  {children}
                </CodeBlock>
              );
            },
            // Inline code (no language) — styled inline; block code is handled
            // by the `pre` renderer above.
            code: ({ className, children }) => {
              const isBlock = /language-[a-z0-9]+/i.test(className ?? '');
              if (isBlock) return <code className={className}>{children}</code>;
              return <code className="preview-inline-code">{children}</code>;
            },
            a: ({ href, children }) => {
              const target = safeUrl(href);
              if (!target) {
                // Unsafe or empty link — render as inert text rather than a link.
                return <span className="preview-bad-link">{children}</span>;
              }
              const isExternal = /^https?:/i.test(target);
              return (
                <a
                  href={target}
                  {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="preview-link"
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt ?? ''}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="preview-img"
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}