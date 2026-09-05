import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BufferAttribute, Points } from 'three';
import type { QualityLevel } from '../../hooks/useDeviceQuality';

interface FloatingParticlesProps {
  quality: QualityLevel;
  reducedMotion?: boolean;
}

function seededValue(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Ambient floating particles that create atmospheric depth.
 * Small points drifting slowly through the scene at various depths.
 */
export default function FloatingParticles({ quality, reducedMotion = false }: FloatingParticlesProps) {
  const count = quality === 'high' ? 260 : quality === 'medium' ? 150 : 80;
  const pointsRef = useRef<Points>(null);
  const time = useRef(0);
  const velocitiesRef = useRef<Float32Array | null>(null);

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0.506, 0.545, 0.969],  // #818CF8
      [0.024, 0.714, 0.831],  // #06B6D4
      [0.659, 0.333, 0.969],  // #A855F7
      [0.392, 0.709, 0.965],  // #64B5F6 — brighter accent
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (seededValue(i, 1) - 0.5) * 22;
      pos[i3 + 1] = (seededValue(i, 2) - 0.5) * 14;
      pos[i3 + 2] = (seededValue(i, 3) - 0.5) * 10 - 3;
      vel[i3] = (seededValue(i, 4) - 0.5) * 0.004;
      vel[i3 + 1] = 0.004 + seededValue(i, 5) * 0.008;
      vel[i3 + 2] = (seededValue(i, 6) - 0.5) * 0.002;
      const c = palette[Math.floor(seededValue(i, 7) * palette.length)];
      col[i3] = c[0];
      col[i3 + 1] = c[1];
      col[i3 + 2] = c[2];
    }
    return { positions: pos, velocities: vel, colors: col };
  }, [count]);

  useEffect(() => {
    velocitiesRef.current = velocities;
  }, [velocities]);

  useFrame((_, delta) => {
    if (!pointsRef.current || reducedMotion) return;
    const velocities = velocitiesRef.current;
    if (!velocities) return;
    time.current += delta;
    const posAttr = pointsRef.current.geometry.attributes.position as BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3] += velocities[i3];
      arr[i3 + 1] += velocities[i3 + 1];
      arr[i3 + 2] += velocities[i3 + 2];

      // Reset particles that drift too far
      if (arr[i3 + 1] > 8) {
        arr[i3 + 1] = -8;
        arr[i3] = (seededValue(i, Math.floor(time.current)) - 0.5) * 22;
        velocities[i3] = (seededValue(i, Math.floor(time.current) + 1) - 0.5) * 0.004;
        velocities[i3 + 1] = 0.004 + seededValue(i, Math.floor(time.current) + 2) * 0.008;
      }
      if (Math.abs(arr[i3]) > 12) {
        arr[i3] = -arr[i3] * 0.5;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={quality === 'high' ? 0.05 : 0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
