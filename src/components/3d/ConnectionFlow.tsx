import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group, MeshBasicMaterial } from 'three';

type Vec3 = [number, number, number];

interface ConnectionFlowProps {
  reducedMotion?: boolean;
}

/**
 * Thin glowing connection lines from surrounding objects toward the central
 * documentation card, with small animated particles traveling along each path.
 * Represents the data flow: repository → analysis → documentation.
 */

const connectionPaths: { from: Vec3; to: Vec3; color: string }[] = [
  { from: [-4.2, 2.0, -0.8], to: [-0.3, 0.4, 0.1], color: '#818CF8' },
  { from: [4.4, 1.5, -1.2], to: [0.3, 0.3, 0.1], color: '#06B6D4' },
  { from: [3.8, -2.0, -1.8], to: [0.2, 0.1, 0.1], color: '#F59E0B' },
  { from: [-3.6, -1.8, -1.5], to: [-0.2, 0.0, 0.1], color: '#A855F7' },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getPointOnPath(from: Vec3, to: Vec3, t: number): Vec3 {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

export default function ConnectionFlow({ reducedMotion = false }: ConnectionFlowProps) {
  const particleRefs = useRef<(Group | null)[]>([]);
  const coreMatRefs = useRef<(MeshBasicMaterial | null)[]>([]);
  const glowMatRefs = useRef<(MeshBasicMaterial | null)[]>([]);

  const particlePhases = useMemo(
    () => connectionPaths.map((_, i) => i * 0.25),
    [],
  );

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    particleRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const phase = particlePhases[i];
      const progress = (t * 0.12 + phase) % 1;
      const path = connectionPaths[i];
      const pos = getPointOnPath(path.from, path.to, progress);
      ref.position.set(pos[0], pos[1], pos[2]);

      const fadeIn = Math.min(progress * 5, 1);
      const fadeOut = Math.min((1 - progress) * 5, 1);
      const pulse = fadeIn * fadeOut;

      const scale = 0.8 + Math.sin(t * 4 + i) * 0.2;
      ref.scale.setScalar(scale);

      if (coreMatRefs.current[i]) coreMatRefs.current[i]!.opacity = pulse * 0.9;
      if (glowMatRefs.current[i]) glowMatRefs.current[i]!.opacity = pulse * 0.22;
    });
  });

  return (
    <group>
      {/* Static connection lines */}
      {connectionPaths.map((path, i) => (
        <Line
          key={`line-${i}`}
          points={[path.from, path.to]}
          color={path.color}
          transparent
          opacity={0.15}
          lineWidth={0.8}
        />
      ))}

      {/* Animated particles along paths */}
      {connectionPaths.map((path, i) => (
        <group
          key={`particle-${i}`}
          ref={(el) => { particleRefs.current[i] = el; }}
        >
          <mesh>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial
              ref={(el) => { coreMatRefs.current[i] = el; }}
              color={path.color}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              ref={(el) => { glowMatRefs.current[i] = el; }}
              color={path.color}
              transparent
              opacity={0.15}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
