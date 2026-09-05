import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GitHubUrlInput from './GitHubUrlInput';
import ReadmePreview from './ReadmePreview';

const fadeUp = (i: number) => ({
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
});

const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      delay: i * 0.08,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function Hero() {
  const [status, setStatus] = useState<{ type: 'loading' | 'coming-soon'; repoUrl: string } | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (url: string) => {
    setStatus({ type: 'loading', repoUrl: url });
    navigate(`/analyze?url=${encodeURIComponent(url)}`);
  };

  const handleTryExample = () => {
    setStatus({ type: 'loading', repoUrl: 'https://github.com/facebook/react' });
    navigate(`/analyze?url=${encodeURIComponent('https://github.com/facebook/react')}`);
  };

  return (
    <section
      ref={heroRef}
      data-hero
      className="relative overflow-hidden"
    >
      <div className="container-app w-full">
        <div className="max-w-3xl mx-auto text-center pt-36 md:pt-44 pb-16">
          {/* Badge with pulse glow ring */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp(0)}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-text-secondary shadow-[0_1px_2px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] relative">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-40" style={{ animation: 'pulse-glow-ring 2s ease-out infinite' }} />
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-60" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-accent-emerald" />
              </span>
              AI Documentation Generator
            </span>
          </motion.div>

          {/* Heading with word-by-word reveal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] mb-7">
            <motion.span
              className="block"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {'Turn Your Codebase'.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordReveal}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
            <motion.span
              className="block mt-1"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
              }}
            >
              <motion.span
                custom={4}
                variants={wordReveal}
                className="inline-block mr-[0.3em]"
              >
                Into
              </motion.span>
              <motion.span
                custom={5}
                variants={wordReveal}
                className="inline-block"
              >
                <span className="text-aurora relative">
                  Documentation.
                  <span className="relative z-10" aria-hidden="true">{/* gradient text stands alone on light bg */}</span>
                </span>
              </motion.span>
            </motion.span>
          </h1>

          {/* Description with staggered word reveal */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp(2)}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-11 leading-relaxed"
          >
            README analyzes any GitHub repository and generates a professional,
            structured README tailored to your codebase — markdown that just works.
          </motion.p>

          {/* GitHub URL Input */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp(3)} className="max-w-2xl mx-auto mb-6">
            <GitHubUrlInput onSubmit={handleSubmit} isLoading={status?.type === 'loading'} />
          </motion.div>

          {/* Try example button */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp(4)}>
            <button
              onClick={handleTryExample}
              className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors duration-200 group"
            >
              No repo handy? Try an example
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            </motion.div>
        </div>

        {/* Product preview with 3D perspective */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="pb-20"
        >
          <ReadmePreview />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 scroll-indicator"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Scroll</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
