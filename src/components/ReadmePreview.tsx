import { useState, useRef, useCallback, useEffect } from 'react';

const sourceLines = [
  { num: 1, content: <><span className="text-accent-indigo-light">#</span> <span className="text-text-primary font-semibold">Aurora UI</span></> },
  { num: 2, content: <>&nbsp;</> },
  { num: 3, content: <><span className="text-text-secondary">{'>'} A lightweight, accessible React</span></> },
  { num: 4, content: <><span className="text-text-secondary">{'>'} component library.</span></> },
  { num: 5, content: <>&nbsp;</> },
  { num: 6, content: <><span className="text-accent-cyan">##</span> <span className="text-text-primary">Features</span></> },
  { num: 7, content: <>&nbsp;</> },
  { num: 8, content: <><span className="text-accent-emerald">-</span> <span className="text-text-secondary">Fast, tree-shakeable</span></> },
  { num: 9, content: <><span className="text-accent-emerald">-</span> <span className="text-text-secondary">MDX + Tailwind support</span></> },
  { num: 10, content: <><span className="text-accent-emerald">-</span> <span className="text-text-secondary">Zero runtime dependencies</span></> },
  { num: 11, content: <>&nbsp;</> },
  { num: 12, content: <><span className="text-accent-purple">```</span><span className="text-accent-cyan">bash</span></> },
  { num: 13, content: <><span className="text-accent-emerald">$</span> <span className="text-text-secondary">npm install aurora-ui</span></> },
  { num: 14, content: <><span className="text-accent-purple">```</span></> },
];

export default function ReadmePreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const animFrameRef = useRef<number>(0);

  // Typing animation — reveal lines one by one
  useEffect(() => {
    let lineIndex = 0;
    const interval = setInterval(() => {
      lineIndex++;
      setVisibleLines(lineIndex);
      if (lineIndex >= sourceLines.length) {
        clearInterval(interval);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({ x: y * -8, y: x * 8 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setTilt({ x: 0, y: 0 });
    });
  }, []);

  return (
    <div className="perspective-card w-full max-w-4xl mx-auto">
      {/* Glowing aura behind the card */}
      <div
        className="absolute -inset-12 rounded-[32px] blur-3xl transition-opacity duration-700"
        style={{
          background: 'linear-gradient(120deg, rgba(99,102,241,0.35), rgba(6,182,212,0.2), rgba(168,85,247,0.3))',
          opacity: isHovered ? 0.5 : 0.25,
          animation: 'pulse-glow 4s ease-in-out infinite',
        }}
        aria-hidden="true"
      />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-[18px] overflow-hidden border border-slate-200 bg-white backdrop-blur-2xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.28),0_0_0_1px_rgba(255,255,255,0.6)] transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateZ(10px)' : 'translateZ(0)'}`,
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
          </div>
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200">
              <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-xs font-mono text-text-secondary">README.md</span>
            </div>
          </div>
          <div className="flex items-center gap-1" aria-hidden="true">
            <div className="p-1.5 rounded-md text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div className="p-1.5 rounded-md text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
          </div>
        </div>

        {/* Body: source + preview */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Source pane with typing animation */}
          <div className="p-4 font-mono text-[11px] leading-[1.7] border-b md:border-b-0 md:border-r border-slate-200 bg-slate-100/70 min-h-[280px]">
            <div className="flex items-center gap-2 text-[10px] mb-3 text-text-muted uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              markdown
            </div>
            <pre className="whitespace-pre-wrap select-none">
              {sourceLines.map((line, idx) => (
                <span
                  key={line.num}
                  className="block transition-opacity duration-300"
                  style={{ opacity: idx < visibleLines ? 1 : 0 }}
                >
                  <span className="text-text-muted">{String(line.num).padStart(2, ' ')}</span>{'  '}
                  {line.content}
                </span>
              ))}
              {/* Blinking cursor */}
              <span
                className="inline-block w-[2px] h-[14px] bg-accent-indigo-light align-middle ml-1"
                style={{ animation: 'typing-cursor 1s step-end infinite' }}
              />
            </pre>
          </div>

          {/* Preview pane with shimmer */}
          <div className="p-5 text-[12.5px] leading-relaxed bg-gradient-to-b from-slate-50/80 to-transparent min-h-[280px] relative overflow-hidden">
            {/* Subtle shimmer sweep on preview */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.03) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 5s ease-in-out infinite',
              }}
              aria-hidden="true"
            />

            <div className="flex items-center gap-2 text-[10px] mb-4 text-text-muted uppercase tracking-wider relative">
              <svg className="w-3 h-3 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              preview
            </div>
            <h4 className="text-lg font-bold mb-2 tracking-tight relative">Aurora UI</h4>
            <p className="text-text-secondary mb-4 leading-relaxed text-[12px] relative">A lightweight, accessible React component library with first-class dark mode and animation support.</p>

            <div className="flex flex-wrap gap-1.5 mb-4 relative">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-accent-indigo/90 px-2 py-0.5 rounded-full">
                ⚡ Fast
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-accent-cyan/90 px-2 py-0.5 rounded-full">
                🎨 Dark Mode
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-accent-emerald/90 px-2 py-0.5 rounded-full">
                📦 Tiny
              </span>
            </div>

            <h5 className="text-xs font-semibold text-text-primary mb-2 uppercase tracking-wider relative">Features</h5>
            <ul className="text-text-secondary space-y-1 mb-4 text-[11.5px] relative">
              <li className="flex items-start gap-1.5"><span className="text-accent-emerald mt-0.5">✓</span> Blazing fast, tree-shakeable</li>
              <li className="flex items-start gap-1.5"><span className="text-accent-emerald mt-0.5">✓</span> MDX + Tailwind support</li>
              <li className="flex items-start gap-1.5"><span className="text-accent-emerald mt-0.5">✓</span> Zero runtime dependencies</li>
            </ul>

            <h5 className="text-xs font-semibold text-text-primary mb-2 uppercase tracking-wider relative">Install</h5>
            <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 font-mono text-[11px] flex items-center justify-between relative">
              <div>
                <span className="text-text-muted">$</span> <span className="text-accent-emerald">npm install</span> <span className="text-text-secondary">aurora-ui</span>
              </div>
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-px bg-gradient-to-r from-accent-indigo/0 via-accent-indigo/40 to-accent-purple/0" aria-hidden="true" />
      </div>
    </div>
  );
}
