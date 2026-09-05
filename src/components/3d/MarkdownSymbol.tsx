import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group } from 'three';

interface MarkdownSymbolProps {
  position?: [number, number, number];
  scale?: number;
  reducedMotion?: boolean;
}

/**
 * A small floating Markdown document card.
 * Shows a minimal "M↓" symbol built from geometry.
 */
export default function MarkdownSymbol({
  position = [0, 0, 0],
  scale = 0.5,
  reducedMotion = false,
}: MarkdownSymbolProps) {
  const groupRef = useRef<Group>(null);
  const time = useRef(9.4);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    time.current += delta;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.5) * 0.05;
    groupRef.current.rotation.y = Math.sin(time.current * 0.25) * 0.05;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Card body */}
      <RoundedBox args={[1.2, 1.0, 0.06]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0D0D16"
          transparent
          opacity={0.88}
          roughness={0.1}
          metalness={0.15}
          clearcoat={0.5}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>

      {/* Border */}
      <RoundedBox args={[1.22, 1.02, 0.05]} radius={0.06} smoothness={4}>
        <meshBasicMaterial color="#A855F7" transparent opacity={0.1} wireframe />
      </RoundedBox>

      {/* "M" letter — built from box geometry */}
      {/* Left vertical */}
      <mesh position={[-0.22, 0.1, 0.04]}>
        <boxGeometry args={[0.06, 0.45, 0.008]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* Right vertical */}
      <mesh position={[0.22, 0.1, 0.04]}>
        <boxGeometry args={[0.06, 0.45, 0.008]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* Left diagonal */}
      <mesh position={[-0.1, 0.3, 0.04]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.05, 0.22, 0.008]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* Right diagonal */}
      <mesh position={[0.1, 0.3, 0.04]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.05, 0.22, 0.008]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Down arrow below */}
      <mesh position={[0, -0.18, 0.04]}>
        <boxGeometry args={[0.05, 0.12, 0.008]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* Arrow head left */}
      <mesh position={[-0.04, -0.26, 0.04]} rotation={[0, 0, 0.7]}>
        <boxGeometry args={[0.04, 0.08, 0.008]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* Arrow head right */}
      <mesh position={[0.04, -0.26, 0.04]} rotation={[0, 0, -0.7]}>
        <boxGeometry args={[0.04, 0.08, 0.008]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.5} toneMapped={false} />
      </mesh>

      {/* Bottom label strip */}
      <mesh position={[0, -0.38, 0.04]}>
        <planeGeometry args={[0.6, 0.06]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
      </mesh>

      {/* Top accent */}
      <mesh position={[0, 0.42, 0.04]}>
        <planeGeometry args={[1.0, 0.012]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}
