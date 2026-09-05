import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useEffect } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import SceneContent from './SceneContent';
import { useDeviceQuality, type QualityLevel } from '../../hooks/useDeviceQuality';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SceneProps {
  className?: string;
}

export default function Scene({ className = '' }: SceneProps) {
  const quality: QualityLevel = useDeviceQuality();
  const reducedMotion = useReducedMotion();

  // Scroll progress: 0 = hero visible, 1 = hero scrolled past
  const scrollProgress = useRef(0);

  useEffect(() => {
    const update = () => {
      const heroEl = document.querySelector('[data-hero]');
      if (!heroEl) {
        scrollProgress.current = 0;
        return;
      }
      const rect = heroEl.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress from 0 (hero bottom at viewport bottom) to 1 (hero top at viewport top)
      scrollProgress.current = Math.max(0, Math.min(1, 1 - (rect.bottom / (rect.height + vh))));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  const dpr: [number, number] =
    quality === 'high' ? [1, 1.5] : quality === 'medium' ? [1, 1.25] : [1, 1];

  const usePostProcessing = quality !== 'low';

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: 0, overflow: 'hidden', width: '100vw', height: '100vh' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={dpr}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent
            quality={quality}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
          />
          {usePostProcessing && (
            <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
              <Bloom
                intensity={0.45}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={0.65}
              />
              <Vignette eskil={false} offset={0.2} darkness={0.12} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
