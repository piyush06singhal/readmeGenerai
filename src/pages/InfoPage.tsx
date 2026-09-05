import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';

const pageContent = {
  documentation: {
    eyebrow: 'Resources',
    title: 'Documentation',
    intro: 'A practical guide to turning a public GitHub repository into clear, editable documentation.',
    sections: [
      { title: 'Analyze a repository', body: 'Paste a public GitHub repository URL on the home page. README reads repository metadata, languages, structure, manifests, scripts, configuration files, and selected source context.' },
      { title: 'Generate a README', body: 'After analysis, choose Standard, Detailed, or Minimal style. The server sends a bounded project context to the configured AI provider and returns Markdown grounded in the analyzed repository.' },
      { title: 'Edit and export', body: 'Review the generated document in the split editor, inspect its quality suggestions, select repository-aware badges, then copy the Markdown or download it as README.md.' },
    ],
  },
  'api-reference': {
    eyebrow: 'Resources',
    title: 'API Reference',
    intro: 'The internal API is JSON-based and is used by the web application to analyze repositories and generate documentation.',
    sections: [
      { title: 'POST /api/analyze', body: 'Accepts { "repoUrl": "https://github.com/owner/repository" }. Returns repository metadata, project structure, detected technologies, dependencies, scripts, and selected context. Analysis is limited to public GitHub repositories.' },
      { title: 'POST /api/generate', body: 'Accepts a ProjectContext, a style of standard, detailed, or minimal, and optional personalization instructions. Returns { "markdown": "# ..." } after validating the generated Markdown.' },
      { title: 'POST /api/file', body: 'Accepts an owner, repo, and repository-relative path to load a bounded file preview. Paths are checked for traversal and unsafe segments before GitHub is queried.' },
    ],
  },
  blog: {
    eyebrow: 'Resources',
    title: 'Blog',
    intro: 'Notes on practical documentation, repository analysis, and building tools that help developers keep project knowledge current.',
    sections: [
      { title: 'Documentation should follow the source', body: 'The most useful README is grounded in the files and commands a project actually contains. README starts with repository evidence before asking an AI model to structure the explanation.' },
      { title: 'Human review stays in the loop', body: 'Generated documentation is a draft, not an authority. The workspace keeps the Markdown editable, scores its structure, and makes the final export an explicit developer decision.' },
      { title: 'A focused product surface', body: 'The product is intentionally organized around one workflow: analyze, generate, review, and export. Every visual layer supports that path.' },
    ],
  },
  changelog: {
    eyebrow: 'Product',
    title: 'Changelog',
    intro: 'A concise record of the project improvements shipped so far.',
    sections: [
      { title: 'September 2026', body: 'Added repository-aware README badges, quality scoring, personalization instructions, safe Markdown previewing, responsive workspace tabs, and one-click copy and download.' },
      { title: 'Reliability and accessibility', body: 'Added structured API errors, request limits, malformed-output checks, reduced-motion support, live progress announcements, keyboard focus states, and automated core tests.' },
      { title: 'Performance', body: 'Lazy-loaded the 3D scene, analyzer route, README workspace, CodeMirror editor, and Markdown preview so heavy dependencies do not block the first screen.' },
    ],
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy',
    intro: 'README is designed to minimize the information it handles while generating documentation.',
    sections: [
      { title: 'Repository data', body: 'Only public GitHub repositories are supported. Repository metadata and selected files are fetched to build the analysis context required for documentation generation.' },
      { title: 'AI provider', body: 'The configured AI provider receives the bounded project context needed for generation. API credentials remain on the server and are never included in the browser bundle.' },
      { title: 'Your output', body: 'Generated Markdown is kept in the current browser session unless you copy or download it. Do not include secrets in repository files or personalization instructions.' },
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms',
    intro: 'Use README responsibly and review generated documentation before publishing it.',
    sections: [
      { title: 'Acceptable use', body: 'Use the service only with repositories you are allowed to inspect and document. Do not use it to circumvent access controls, abuse GitHub, or submit malicious content.' },
      { title: 'Generated content', body: 'AI-generated documentation can contain mistakes. You are responsible for checking commands, dependencies, security guidance, licenses, and claims before using or publishing the output.' },
      { title: 'Availability', body: 'The service depends on GitHub and the configured AI provider. Availability, response time, and generated output may vary with those external services.' },
    ],
  },
} as const;

type PageKey = keyof typeof pageContent;

export default function InfoPage() {
  const { page } = useParams<{ page: string }>();
  const content = page && page in pageContent ? pageContent[page as PageKey] : null;

  if (!content) {
    return (
      <>
        <section className="min-h-[70vh] pt-36 pb-24">
          <div className="container-app max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Page not found</h1>
            <Link to="/" className="text-accent-indigo hover:text-accent-purple transition-colors">Return home</Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-32 pb-24">
        <div className="container-app max-w-4xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-sm uppercase tracking-[0.2em] text-accent-indigo-light mb-4 font-medium">{content.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">{content.title}</h1>
            <p className="text-lg text-text-secondary leading-relaxed">{content.intro}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {content.sections.map((section, index) => (
              <article key={section.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <span className="font-mono text-xs text-accent-indigo-light">0{index + 1}</span>
                <h2 className="text-lg font-semibold mt-5 mb-3">{section.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
