import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const steps = [
  {
    number: '01',
    title: 'Paste a repository',
    description: 'Drop in any public GitHub URL. We analyze the structure, metadata, and key files.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
      </svg>
    ),
    color: '#818CF8',
    colorDark: 'rgba(99,102,241,0.15)',
    glow: 'rgba(99,102,241,0.25)',
  },
  {
    number: '02',
    title: 'We understand the code',
    description: 'Relevant files are selected and distilled into concise context before any model runs.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: '#22D3EE',
    colorDark: 'rgba(6,182,212,0.12)',
    glow: 'rgba(6,182,212,0.22)',
  },
  {
    number: '03',
    title: 'Generate the README',
    description: 'An LLM drafts a structured, professional markdown file tailored to your stack.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: '#A855F7',
    colorDark: 'rgba(168,85,247,0.12)',
    glow: 'rgba(168,85,247,0.22)',
  },
  {
    number: '04',
    title: 'Edit, preview, export',
    description: 'Refine with live preview, then copy or download your README.md file.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: '#10B981',
    colorDark: 'rgba(16,185,129,0.12)',
    glow: 'rgba(16,185,129,0.22)',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

// Stagger directions for visual variety
const staggerDirections = [
  { x: -20, y: 28 },
  { x: 0, y: 28 },
  { x: 0, y: 28 },
  { x: 20, y: 28 },
];

export default function WorkflowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-60px' });
  const [lineProgress, setLineProgress] = useState(0);

  // Animate line drawing on scroll
  useEffect(() => {
    if (!inView) return;
    let start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setLineProgress(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 400);
    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <section className="relative py-24 md:py-32">
      <div className="container-app">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-accent-indigo-light mb-4 font-medium">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            From repository to polished README
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-lg mx-auto">
            A focused workflow that turns your code into clear, maintainable documentation —
            without dumping entire repositories into a model.
          </p>
        </motion.div>

        {/* Pipeline visualization */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* SVG connecting line with draw animation (desktop) */}
          <div className="hidden lg:block absolute top-[56px] left-[12%] right-[12%] h-px" aria-hidden="true">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                  <stop offset="33%" stopColor="rgba(6,182,212,0.25)" />
                  <stop offset="66%" stopColor="rgba(168,85,247,0.25)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                </linearGradient>
              </defs>
              <line
                x1="0" y1="0" x2="100%" y2="0"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                strokeDasharray="1000"
                strokeDashoffset={1000 - lineProgress * 1000}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
          </div>

          {/* Glowing node dots on the connecting line (desktop) */}
          <div className="hidden lg:flex absolute top-[56px] left-[12%] right-[12%] justify-between pointer-events-none" aria-hidden="true">
            {steps.map((step, i) => (
              <motion.div
                key={`node-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.2, ease }}
                className="relative -mt-[5px]"
              >
                {/* Pulse ring */}
                <div
                  className="absolute inset-0 w-[10px] h-[10px] rounded-full"
                  style={{
                    background: step.color,
                    animation: inView ? `pulse-glow-ring 2s ease-out ${1 + i * 0.3}s infinite` : 'none',
                  }}
                />
                {/* Core dot */}
                <div
                  className="w-[10px] h-[10px] rounded-full relative"
                  style={{
                    background: step.color,
                    boxShadow: `0 0 12px ${step.glow}, 0 0 24px ${step.glow}`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Step cards */}
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: staggerDirections[index].x, y: staggerDirections[index].y }}
              animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: staggerDirections[index].x, y: staggerDirections[index].y }}
              transition={{ duration: 0.6, delay: index * 0.15, ease }}
              className="relative group"
            >
              <div
                className="relative h-full p-6 rounded-[var(--radius-card)] bg-white/80 border border-slate-200 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-500 overflow-hidden hover:translate-y-[-4px] hover:shadow-[0_12px_32px_rgba(99,102,241,0.12)]"
                style={{
                  // @ts-expect-error CSS custom properties
                  '--hover-glow': step.glow,
                  '--step-color': step.color,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
                  style={{ background: step.glow }}
                  aria-hidden="true"
                />

                {/* Top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${step.color}60, transparent)` }}
                  aria-hidden="true"
                />

                {/* Bottom glow border on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${step.color}40, transparent)` }}
                  aria-hidden="true"
                />

                <div className="relative">
                  {/* Icon + number */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-200 transition-all duration-300 group-hover:scale-110 group-hover:border-accent-indigo/40 group-hover:shadow-lg"
                      style={{
                        color: step.color,
                        background: `linear-gradient(135deg, ${step.colorDark}, transparent 70%)`,
                        boxShadow: `0 0 0 1px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.6)`,
                      }}
                    >
                      <span className="group-hover:animate-[icon-pulse_0.6s_ease-in-out]">{step.icon}</span>
                    </div>
                    <span
                      className="font-mono text-xs group-hover:scale-110 transition-all duration-300"
                      style={{ color: `${step.color}90` }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[15px] mb-2 relative tracking-tight group-hover:text-accent-indigo transition-colors duration-300">{step.title}</h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed relative group-hover:text-text-secondary/90 transition-colors duration-300">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
