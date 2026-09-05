import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group } from 'three';

interface CodeObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  reducedMotion?: boolean;
}

interface CodeLine {
  width: number;
  offset: number;
  color: string;
  opacity: number;
}

const codeLines: CodeLine[] = [
  { width: 1.1, offset: 0.35, color: '#818CF8', opacity: 0.5 },
  { width: 0.7, offset: 0.05, color: '#06B6D4', opacity: 0.45 },
  { width: 1.6, offset: -0.25, color: '#A0A0B0', opacity: 0.35 },
  { width: 1.3, offset: -0.55, color: '#A855F7', opacity: 0.4 },
  { width: 0.9, offset: -0.85, color: '#10B981', opacity: 0.45 },
  { width: 0.5, offset: -1.15, color: '#F59E0B', opacity: 0.35 },
];

/**
 * A floating code editor / terminal panel with syntax-colored lines
 * and a blinking cursor. Represents source code being analyzed.
 */
export default function CodeObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.65,
  reducedMotion = false,
}: CodeObjectProps) {
  const groupRef = useRef<Group>(null);
  const time = useRef(31.7);
  const cursorRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;
    time.current += delta;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.55) * 0.05;
    groupRef.current.rotation.y =
      rotation[1] + Math.sin(time.current * 0.3) * 0.03;
    // Blinking cursor
    if (cursorRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 3) > 0 ? 0.7 : 0;
      cursorRef.current.visible = blink > 0;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Panel body */}
      <RoundedBox args={[2.2, 1.7, 0.05]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0A0A12"
          transparent
          opacity={0.9}
          roughness={0.12}
          metalness={0.15}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Border */}
      <RoundedBox args={[2.22, 1.72, 0.04]} radius={0.06} smoothness={4}>
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.08} wireframe />
      </RoundedBox>

      {/* Title bar */}
      <mesh position={[0, 0.7, 0.03]}>
        <planeGeometry args={[2.1, 0.18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.025} />
      </mesh>

      {/* Window dots */}
      {[
        { x: -0.9, color: '#FF5F57' },
        { x: -0.72, color: '#FEBC2E' },
        { x: -0.54, color: '#28C840' },
      ].map((d) => (
        <mesh key={d.x} position={[d.x, 0.7, 0.035]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Terminal label */}
      <mesh position={[0.5, 0.7, 0.035]}>
        <planeGeometry args={[0.5, 0.08]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.08} />
      </mesh>

      {/* Code lines with syntax colors */}
      {codeLines.map((line, i) => (
        <mesh key={i} position={[-0.7 + line.width / 2, line.offset, 0.035]}>
          <boxGeometry args={[line.width, 0.04, 0.006]} />
          <meshBasicMaterial color={line.color} transparent opacity={line.opacity} />
        </mesh>
      ))}

      {/* Line numbers */}
      {codeLines.map((_, i) => (
        <mesh key={`ln-${i}`} position={[-0.95, codeLines[i].offset, 0.035]}>
          <boxGeometry args={[0.08, 0.03, 0.005]} />
          <meshBasicMaterial color="#4A4A5A" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Blinking cursor */}
      <group ref={cursorRef} position={[0.8, -1.15, 0.035]}>
        <mesh>
          <boxGeometry args={[0.015, 0.045, 0.005]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.7} toneMapped={false} />
        </mesh>
      </group>

      {/* Right edge glow */}
      <mesh position={[1.12, 0, 0]}>
        <planeGeometry args={[0.012, 1.6]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  );
}
