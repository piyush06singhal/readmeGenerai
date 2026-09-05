import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div
        className="relative backdrop-blur-[24px] saturate-150 border-b transition-all duration-500"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
          borderColor: scrolled ? 'rgba(15,23,42,0.12)' : 'rgba(15,23,42,0.06)',
          boxShadow: scrolled ? '0 8px 24px rgba(15,23,42,0.06)' : 'none',
        }}
      >
        {/* Animated gradient border at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(6,182,212,0.2), rgba(168,85,247,0.3), transparent)',
            opacity: scrolled ? 1 : 0.4,
            transition: 'opacity 0.5s ease',
          }}
        />

        <div className="container-app h-16 flex items-center justify-between">
          {/* Logo with 3D rotation on hover */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="README Home">
            <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center shadow-glow-sm transition-all duration-300 group-hover:shadow-glow-md group-hover:scale-110 group-hover:rotate-6">
              <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:-rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-text-primary tracking-tight">README</span>
            </div>
          </Link>

          <nav className="flex items-center gap-6" aria-label="Main navigation">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              GitHub
            </a>

            {/* About link with active indicator */}
            <Link
              to={isHome ? '/about' : '/'}
              className="hidden md:inline-flex items-center gap-1.5 text-sm transition-colors duration-200 relative py-1"
              style={{
                color: !isHome ? '#0F172A' : '#64748B',
              }}
            >
              {isHome ? 'About' : 'Home'}
              {/* Active indicator dot */}
              {!isHome && (
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-indigo-light"
                  style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
                />
              )}
            </Link>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-slate-50 hover:border-accent-indigo/40 hover:shadow-[0_0_12px_rgba(99,102,241,0.18)] transition-all duration-200"
              aria-label="GitHub profile"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
