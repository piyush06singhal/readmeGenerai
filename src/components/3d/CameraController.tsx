import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface CameraControllerProps {
  scrollProgress: React.MutableRefObject<number>;
  reducedMotion?: boolean;
}

/**
 * Smooth camera controller with:
 * - Mouse-based parallax (desktop only)
 * - Scroll-driven camera movement (pulls back and up as user scrolls past hero)
 * All positions are lerped for smooth, premium motion.
 */
export default function CameraController({ scrollProgress, reducedMotion = false }: CameraControllerProps) {
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    const handleMouse = (e: MouseEvent) => {
      // Normalize to -1..1
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    if (!isMobile.current) {
      window.addEventListener('mousemove', handleMouse, { passive: true });
    }
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;
    const { camera } = state;
    const sp = scrollProgress.current;
    const t = state.clock.elapsedTime;

    // --- Mouse parallax (desktop only) ---
    if (!isMobile.current) {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.03;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.03;
    }

    // --- Idle cinematic drift (active even at rest, scaled down on scroll) ---
    // A slow sine pan so the backdrop always feels alive, like drifting video.
    const idleWeight = 1 - sp * 1.5;            // fades as user scrolls past hero
    const idleDriftX = Math.sin(t * 0.1) * 0.18 * idleWeight;
    const idleDriftY = Math.cos(t * 0.08) * 0.12 * idleWeight;
    const idleDriftZ = Math.sin(t * 0.06) * 0.15 * idleWeight;

    // --- Scroll-driven camera position ---
    // Hero fully visible at sp=0, scrolled past at sp=1
    const baseX = 0;
    const baseY = 0;
    const baseZ = 9;

    const scrollOffsetY = sp * 1.5;       // Camera moves up
    const scrollOffsetZ = sp * 2.5;       // Camera pulls back
    const scrollOffsetLookY = sp * 0.8;   // Look target shifts up

    // Apply mouse parallax scaled by scroll progress
    const mx = isMobile.current ? 0 : mouseCurrent.current.x * 0.4 * (1 - sp * 1.5);
    const my = isMobile.current ? 0 : mouseCurrent.current.y * 0.25 * (1 - sp * 1.5);

    // Lerp camera position
    const targetX = baseX + mx + idleDriftX;
    const targetY = baseY + scrollOffsetY + my + idleDriftY;
    const targetZ = baseZ + scrollOffsetZ + idleDriftZ;

    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;

    // Look-at target also shifts with scroll
    camera.lookAt(0, scrollOffsetLookY, 0);
  });

  return null;
}
