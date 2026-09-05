import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { useReducedMotion } from '../hooks/useReducedMotion';

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Data ─── */
const pillars = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Real analysis',
    description: 'The GitHub REST API inspects repository metadata, structure, and key files — never fabricated or hallucinated data.',
    color: '#818CF8',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: 'Selective context',
    description: 'Relevant files and metadata are distilled into concise project context before any model is called — no information overload.',
    color: '#22D3EE',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Server-side secrets',
    description: 'API keys and credentials live on the server. Nothing sensitive ever reaches the client — fully secure by design.',
    color: '#A855F7',
  },
];

const pipelineStages = [
  { label: 'Repository', color: '#818CF8', icon: '📦' },
  { label: 'Parse', color: '#22D3EE', icon: '🔍' },
  { label: 'Context', color: '#A855F7', icon: '🧠' },
  { label: 'LLM', color: '#F472B6', icon: '⚡' },
  { label: 'README', color: '#10B981', icon: '📄' },
];

const techStack = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Three.js', color: '#3B82F6' },
  { name: 'Groq', color: '#F55036' },
  { name: 'GitHub API', color: '#8B5CF6' },
  { name: 'Tailwind CSS', color: '#38BDF8' },
  { name: 'Vite', color: '#BD34FE' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Framer Motion', color: '#FF4D8F' },
];

const principles = [
  { value: '01', label: 'Repository-aware', description: 'Grounded in the files, scripts, and dependencies your project actually uses.' },
  { value: '02', label: 'Context-first', description: 'Relevant project context is selected before the model is asked to write.' },
  { value: '03', label: 'Human-editable', description: 'Every generated README stays in your hands for review, editing, and export.' },
];

/* ─── Section wrapper with scroll animation ─── */
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 30 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main About Page ─── */
export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });
  const reducedMotion = useReducedMotion();

  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      <section className="pt-36 pb-20 relative overflow-hidden">
        <div className="container-app max-w-4xl mx-auto text-center">
          {/* Floating wireframe cube decoration + animated glow */}
          <div className="absolute top-16 right-[8%] w-36 h-36 opacity-30 pointer-events-none" aria-hidden="true">
            <div
              className="absolute inset-[-12px] rounded-[20px] opacity-60 blur-2xl"
              style={{ background: 'conic-gradient(from 0deg, rgba(99,102,241,0.35), rgba(6,182,212,0.25), rgba(168,85,247,0.3), rgba(99,102,241,0.35))', animation: 'mesh-rotate 16s linear infinite' }}
            />
            <div
              className="relative w-full h-full border border-accent-indigo/50 rounded-lg shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              style={{
                transformStyle: 'preserve-3d',
                animation: 'mesh-rotate 20s linear infinite',
              }}
            >
              <div className="absolute inset-2 border border-accent-cyan/40 rounded-md" style={{ transform: 'rotateX(45deg)' }} />
              <div className="absolute inset-4 border border-accent-purple/40 rounded-sm" style={{ transform: 'rotateY(45deg)' }} />
            </div>
          </div>

          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-indigo-light mb-4 font-medium">About the project</p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Documentation, generated from the{' '}
              <span className="text-aurora">source of truth.</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p className="text-lg text-text-secondary leading-relaxed mb-12 max-w-2xl mx-auto">
              README is built around a simple idea: the best documentation
              reflects the actual state of a codebase. We read your repository,
              understand its shape, and produce a README that developers can
              trust — then refine it until it's exactly what you need.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ The Problem Section ═══ */}
      <section className="py-20 relative">
        <div className="container-app max-w-5xl">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-cyan mb-4 font-medium text-center">The problem</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
              Why manual READMEs fail
            </h2>
            <p className="text-text-secondary leading-relaxed max-w-xl mx-auto text-center mb-12">
              Developers spend hours writing documentation that's outdated the moment it's committed.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual approach */}
            <AnimatedSection delay={0.1} className="h-full">
              <div className="h-full p-7 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl relative overflow-hidden group hover:border-red-500/20 transition-all duration-500">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-red-500/5 blur-3xl group-hover:bg-red-500/10 transition-all duration-700" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">😤</span>
                    <h3 className="font-semibold text-lg text-text-primary">Manual READMEs</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <span>Outdated within days of writing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <span>Missing setup steps and dependencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <span>Inconsistent across repositories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                      <span>Hours of tedious writing each time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* AI-generated approach */}
            <AnimatedSection delay={0.2} className="h-full">
              <div className="h-full p-7 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl relative overflow-hidden group hover:border-accent-emerald/20 transition-all duration-500">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-accent-emerald/5 blur-3xl group-hover:bg-accent-emerald/10 transition-all duration-700" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🚀</span>
                    <h3 className="font-semibold text-lg text-text-primary">README</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5 shrink-0">✓</span>
                      <span>Always reflects current codebase state</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5 shrink-0">✓</span>
                      <span>Auto-detects all dependencies and setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5 shrink-0">✓</span>
                      <span>Professional, consistent structure every time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5 shrink-0">✓</span>
                      <span>Generated in seconds, not hours</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══ How It Works — Pipeline ═══ */}
      <section className="py-20 relative">
        <div className="container-app max-w-5xl">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-purple mb-4 font-medium text-center">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">
              The analysis pipeline
            </h2>
          </AnimatedSection>

          {/* Pipeline visualization */}
          <AnimatedSection delay={0.1}>
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-[42px] left-[10%] right-[10%] h-px bg-gradient-to-r from-accent-indigo/30 via-accent-cyan/20 to-accent-emerald/30" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                {pipelineStages.map((stage, i) => (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease }}
                    className="flex flex-col items-center gap-3 group"
                  >
                    {/* Node with glow */}
                    <div
                      className="w-[84px] h-[84px] rounded-2xl flex items-center justify-center border border-slate-200 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg relative"
                      style={{
                        background: `linear-gradient(135deg, ${stage.color}15, transparent 70%)`,
                      }}
                    >
                      <span className="text-2xl">{stage.icon}</span>
                      {/* Glow on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                        style={{ background: `${stage.color}20` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-300">{stage.label}</span>

                    {/* Arrow between stages */}
                    {i < pipelineStages.length - 1 && (
                      <div className="hidden md:block absolute text-text-muted/30" style={{ left: `${(i + 1) * (100 / pipelineStages.length)}%`, top: '38px', transform: 'translateX(-50%)' }}>
                        →
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Core Pillars ═══ */}
      <section className="py-20 relative">
        <div className="container-app max-w-4xl">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-indigo-light mb-4 font-medium text-center">Core principles</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">
              What makes it different
            </h2>
          </AnimatedSection>

          <div className="space-y-5">
            {pillars.map((pillar, index) => (
              <AnimatedSection key={pillar.title} delay={index * 0.1}>
                <div className="relative group p-6 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl hover:border-slate-300 transition-all duration-500 overflow-hidden hover:translate-y-[-2px]">
                  {/* Hover glow */}
                  <div
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                    style={{ background: `${pillar.color}30` }}
                    aria-hidden="true"
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center border border-slate-200 shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ color: pillar.color, background: `${pillar.color}15` }}
                    >
                      {pillar.icon}
                    </div>
                    <div>
                      <h2 className="font-semibold mb-1.5 tracking-tight">{pillar.title}</h2>
                      <p className="text-sm text-text-secondary leading-relaxed">{pillar.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Tech Stack ═══ */}
      <section className="py-20 relative">
        <div className="container-app max-w-4xl">
          <AnimatedSection>
            <p className="text-sm uppercase tracking-[0.2em] text-accent-cyan mb-4 font-medium text-center">Technology</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-center">
              Built with modern tools
            </h2>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border backdrop-blur-sm cursor-default transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  color: '#1E293B',
                  background: `${tech.color}1A`,
                  borderColor: `${tech.color}45`,
                  boxShadow: `0 1px 3px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.5)`,
                }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Principles Section ═══ */}
      <section className="py-20 relative">
        <div className="container-app max-w-4xl">
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, i) => (
              <motion.div
                key={principle.label}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: reducedMotion ? 0 : 20 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: i * 0.15, ease }}
                className="text-center p-8 rounded-2xl bg-white border border-slate-200 backdrop-blur-xl relative overflow-hidden group hover:border-slate-300 transition-all duration-500"
              >
                <div
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{ background: i === 0 ? 'rgba(99,102,241,0.15)' : i === 1 ? 'rgba(6,182,212,0.12)' : 'rgba(168,85,247,0.12)' }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-aurora">
                    {principle.value}
                  </p>
                  <p className="text-sm font-semibold text-text-primary mb-2">{principle.label}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{principle.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Note ═══ */}
      <section className="py-12">
        <div className="container-app max-w-3xl">
          <AnimatedSection>
            <div className="p-6 rounded-2xl border border-accent-indigo/20 bg-accent-indigo/[0.04] backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-accent-indigo-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  <span className="text-accent-indigo-light font-medium">Note:</span>{' '}
                  The full analysis and generation pipeline is under active
                  development. This is the foundation — the visual system,
                  architecture, and workflow building blocks that the complete
                  flow will run on.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-indigo/[0.04] to-transparent pointer-events-none" />
        <div className="container-app max-w-3xl mx-auto text-center relative">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to generate your README?
            </h2>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto">
              Paste a GitHub repository URL and see what documentation looks like when it's generated from your actual code.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
              <Link to="/" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto sm:min-w-[230px]">
                  Get Started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <a
                href="https://github.com/piyush06singhal/readmeGenerai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="secondary" size="lg" className="w-full sm:w-auto sm:min-w-[230px]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Star on GitHub
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
