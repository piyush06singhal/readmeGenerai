import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Changelog', href: '/info/changelog' },
  ],
  Resources: [
    { label: 'Documentation', href: '/info/documentation' },
    { label: 'API Reference', href: '/info/api-reference' },
    { label: 'Blog', href: '/info/blog' },
  ],
  Legal: [
    { label: 'Privacy', href: '/info/privacy' },
    { label: 'Terms', href: '/info/terms' },
  ],
};

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/piyush06singhal/readmeGenerai',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/piyush06singhal/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.5 8.5H3.2V20h3.3V8.5zM4.85 3A1.95 1.95 0 104.85 6.9 1.95 1.95 0 004.85 3zM20.8 13.4c0-3.46-1.84-5.07-4.3-5.07-1.98 0-2.87 1.09-3.36 1.85V8.5H9.85V20h3.29v-5.69c0-1.5.28-2.95 2.14-2.95 1.84 0 1.87 1.71 1.87 3.05V20h3.29l.36-6.6z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Separator — spaced well above the content so it isn't glued to the text */}
      <div className="relative h-px" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-indigo/50 to-transparent" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-indigo/25 to-transparent blur-sm"
          style={{ filter: 'blur(4px)' }}
        />
      </div>

      {/* Footer — a soft blue-lavender band that carries the page palette through */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #F1F4FF 0%, #E8EEFC 42%, #E1EAF8 100%)' }}>
        {/* Subtle top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent-indigo/[0.16] to-transparent pointer-events-none" />

        <div
          className="container-app relative"
          style={{ paddingTop: '50px', paddingBottom: '36px' }}
        >
          {/* Main footer grid */}
          <div className="grid grid-cols-1 items-start gap-10 mb-12 md:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))_minmax(0,1.25fr)] md:gap-8 lg:gap-12">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center shadow-glow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-text-primary tracking-tight">README</span>
                </div>
              </div>
              <p className="text-[15px] text-text-secondary leading-relaxed mb-7 max-w-xs">
                AI-powered documentation generator that reads your codebase and produces professional READMEs.
              </p>

              {/* Social icons with glow */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-slate-50 hover:border-accent-indigo/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.18)] transition-all duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary mb-5">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/') ? (
                        <Link
                          to={link.href}
                          className="text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors duration-200 relative group inline-block"
                        >
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-indigo-light group-hover:w-full transition-all duration-300" />
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors duration-200 relative group inline-block"
                        >
                          {link.label}
                          <span className="absolute bottom-0 left-0 w-0 h-px bg-accent-indigo-light group-hover:w-full transition-all duration-300" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Tech stack column */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary mb-5">Built with</h3>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'Three.js', 'Groq', 'GitHub API'].map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-semibold text-text-secondary px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar with divider */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-medium text-text-tertiary">
                © {new Date().getFullYear()} README — Built with React, Three.js & AI
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-60" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-accent-emerald" />
                  </span>
                  All systems operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
