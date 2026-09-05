import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useDeviceQuality } from '../hooks/useDeviceQuality';

const GLYPHS = '01{}[]<>/=#*+-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * A lightweight canvas "code rain" layer — a field of softly falling glyphs
 * that reads like a live, running background. Dense enough to feel alive,
 * dim enough to never compete with the interface.
 */
export default function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const quality = useDeviceQuality();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = quality === 'high' ? 13 : 15;
    const colWidth = fontSize * 1.35;
    let width = 0;
    let height = 0;
    let drops: number[] = [];
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(width / colWidth);
      drops = Array.from({ length: cols }, () => Math.random() * -height);
    };

    const step = () => {
      // Fade the previous frame for trailing effect (light trail on white).
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * colWidth;
        const y = drops[i];
        const alpha = 0.35 + Math.sin(y * 0.03) * 0.1;
        const accent = Math.random() < 0.05;

        ctx.fillStyle = accent
          ? 'rgba(129, 140, 248, 0.5)'
          : `rgba(99, 102, 241, ${alpha.toFixed(2)})`;
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = y + (0.8 + (y % 5) * 0.2);
        }
      }

      frame = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener('resize', resize);

    if (!reducedMotion) {
      frame = requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion, quality]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-25"
      aria-hidden="true"
    />
  );
}
