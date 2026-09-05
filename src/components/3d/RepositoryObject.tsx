import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group } from 'three';

interface RepositoryObjectProps {
  position?: [number, number, number];
  scale?: number;
  reducedMotion?: boolean;
}

/**
 * A compact GitHub-inspired repository visualization.
 * Dark base with colored folder/file indicators and a subtle label strip.
 */
export default function RepositoryObject({
  position = [0, 0, 0],
  scale = 0.7,
  reducedMotion = false,
}: RepositoryObjectProps) {
  const groupRef = useRef<Group>(null);
  const time = useRef(17.3);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    time.current += delta;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.6) * 0.06;
    groupRef.current.rotation.y = Math.sin(time.current * 0.3) * 0.04;
  });

  const folders = [
    { x: -0.5, y: 0.2, color: '#818CF8' },
    { x: 0.0, y: 0.2, color: '#06B6D4' },
    { x: 0.5, y: 0.2, color: '#A855F7' },
  ];

  const files = [
    { x: -0.5, y: -0.15, color: '#10B981' },
    { x: 0.0, y: -0.15, color: '#F59E0B' },
    { x: 0.5, y: -0.15, color: '#818CF8' },
    { x: -0.25, y: -0.45, color: '#06B6D4' },
    { x: 0.25, y: -0.45, color: '#EF4444' },
  ];

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Base panel */}
      <RoundedBox args={[1.8, 1.4, 0.06]} radius={0.06} smoothness={4}>
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
      <RoundedBox args={[1.82, 1.42, 0.05]} radius={0.06} smoothness={4}>
        <meshBasicMaterial color="#818CF8" transparent opacity={0.1} wireframe />
      </RoundedBox>

      {/* Top accent line */}
      <mesh position={[0, 0.62, 0.035]}>
        <planeGeometry args={[1.6, 0.015]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.3} toneMapped={false} />
      </mesh>

      {/* Branch indicator dots */}
      {[
        { x: -0.65, color: '#10B981' },
        { x: -0.43, color: '#F59E0B' },
        { x: -0.21, color: '#818CF8' },
      ].map((d) => (
        <mesh key={d.x} position={[d.x, 0.52, 0.04]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color={d.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Folder icons */}
      {folders.map((f, i) => (
        <group key={i} position={[f.x, f.y, 0.04]}>
          {/* Folder body */}
          <mesh>
            <boxGeometry args={[0.32, 0.22, 0.01]} />
            <meshBasicMaterial color={f.color} transparent opacity={0.4} />
          </mesh>
          {/* Folder tab */}
          <mesh position={[-0.08, 0.12, 0.005]}>
            <boxGeometry args={[0.16, 0.04, 0.01]} />
            <meshBasicMaterial color={f.color} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}

      {/* File icons */}
      {files.map((f, i) => (
        <mesh key={i} position={[f.x, f.y, 0.04]}>
          <boxGeometry args={[0.24, 0.18, 0.008]} />
          <meshBasicMaterial color={f.color} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Name label strip */}
      <mesh position={[0, -0.55, 0.04]}>
        <planeGeometry args={[1.3, 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>

      {/* Subtle edge glow */}
      <mesh position={[0.92, 0, 0]}>
        <planeGeometry args={[0.015, 1.3]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.12} toneMapped={false} />
      </mesh>
    </group>
  );
}
