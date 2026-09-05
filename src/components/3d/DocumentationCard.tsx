import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import type { Group } from 'three';

interface DocumentationCardProps {
  reducedMotion?: boolean;
}

interface LineDef {
  y: number;
  width: number;
  color: string;
  opacity: number;
  height: number;
  radius?: number;
}

function buildContent(): LineDef[] {
  return [
    // Title
    { y: 1.42, width: 1.3, color: '#F8F8FC', opacity: 0.92, height: 0.055 },
    // Blank
    // Subtitle
    { y: 1.18, width: 2.0, color: '#A0A0B0', opacity: 0.4, height: 0.028 },
    { y: 1.04, width: 1.6, color: '#A0A0B0', opacity: 0.35, height: 0.028 },
    // Blank
    // Section header
    { y: 0.78, width: 0.85, color: '#818CF8', opacity: 0.65, height: 0.032 },
    // Blank
    // Feature lines with accent
    { y: 0.56, width: 0.12, color: '#10B981', opacity: 0.75, height: 0.025 },
    { y: 0.56, width: 1.35, color: '#A0A0B0', opacity: 0.3, height: 0.025, radius: 0.01 },
    { y: 0.40, width: 0.12, color: '#10B981', opacity: 0.75, height: 0.025 },
    { y: 0.40, width: 1.1, color: '#A0A0B0', opacity: 0.3, height: 0.025 },
    { y: 0.24, width: 0.12, color: '#10B981', opacity: 0.75, height: 0.025 },
    { y: 0.24, width: 1.5, color: '#A0A0B0', opacity: 0.3, height: 0.025 },
    // Blank
    // Section header
    { y: -0.02, width: 1.0, color: '#06B6D4', opacity: 0.65, height: 0.032 },
    // Blank
    // Code block
    { y: -0.3, width: 2.0, color: '#111118', opacity: 0.85, height: 0.5, radius: 0.06 },
    // Code lines inside block
    { y: -0.18, width: 0.6, color: '#06B6D4', opacity: 0.5, height: 0.022 },
    { y: -0.32, width: 1.2, color: '#10B981', opacity: 0.4, height: 0.022 },
    { y: -0.46, width: 0.9, color: '#A855F7', opacity: 0.4, height: 0.022 },
    // Blank
    // Install section
    { y: -0.7, width: 0.75, color: '#F59E0B', opacity: 0.55, height: 0.032 },
    { y: -0.9, width: 1.8, color: '#1A1A24', opacity: 0.6, height: 0.22, radius: 0.04 },
    // Command inside install block
    { y: -0.86, width: 1.1, color: '#10B981', opacity: 0.4, height: 0.022 },
  ];
}

export default function DocumentationCard({ reducedMotion = false }: DocumentationCardProps) {
  const groupRef = useRef<Group>(null);
  const lines = useMemo(() => buildContent(), []);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    time.current += delta;
    // Gentle floating
    groupRef.current.position.y = Math.sin(time.current * 0.5) * 0.08;
    groupRef.current.rotation.y = Math.sin(time.current * 0.25) * 0.025;
    groupRef.current.rotation.x = Math.cos(time.current * 0.2) * 0.012;
  });

  return (
    <group ref={groupRef} scale={1.35}>
      {/* Back glow plane for bloom pickup */}
      <mesh position={[0, 0.2, -0.08]}>
        <planeGeometry args={[3.2, 2.8]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.08} toneMapped={false} />
      </mesh>

      {/* Card body — main glass panel with depth */}
      <RoundedBox args={[2.8, 2.4, 0.1]} radius={0.08} smoothness={4} position={[0, 0.2, 0]}>
        <meshPhysicalMaterial
          color="#0D0D16"
          transparent
          opacity={0.94}
          roughness={0.08}
          metalness={0.15}
          clearcoat={0.7}
          clearcoatRoughness={0.06}
          emissive="#818CF8"
          emissiveIntensity={0.04}
        />
      </RoundedBox>

      {/* Border wireframe for definition */}
      <RoundedBox args={[2.82, 2.42, 0.09]} radius={0.08} smoothness={4} position={[0, 0.2, 0]}>
        <meshBasicMaterial color="#818CF8" transparent opacity={0.12} wireframe />
      </RoundedBox>

      {/* Title bar background */}
      <mesh position={[0, 1.28, 0.055]}>
        <planeGeometry args={[2.7, 0.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.025} />
      </mesh>

      {/* Traffic light dots */}
      {[
        { x: -1.15, color: '#FF5F57' },
        { x: -0.97, color: '#FEBC2E' },
        { x: -0.79, color: '#28C840' },
      ].map((dot) => (
        <mesh key={dot.x} position={[dot.x, 1.28, 0.06]}>
          <circleGeometry args={[0.038, 16]} />
          <meshBasicMaterial color={dot.color} transparent opacity={0.7} />
        </mesh>
      ))}

      {/* File name label */}
      <Text
        position={[0, 1.28, 0.06]}
        fontSize={0.075}
        color="#6B6B80"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwY.woff2"
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. "
      >
        README.md
      </Text>

      {/* Content lines */}
      {lines.map((line, i) => {
        const isBlock = line.height > 0.1;
        const xOffset = isBlock ? 0 : -1.0 + line.width / 2 + 0.15;
        return (
          <mesh key={i} position={[xOffset, 0.2 + line.y, 0.055]}>
            {isBlock ? (
              <planeGeometry args={[line.width, line.height]} />
            ) : (
              <boxGeometry args={[line.width, line.height, 0.008]} />
            )}
            <meshBasicMaterial
              color={line.color}
              transparent
              opacity={line.opacity}
            />
          </mesh>
        );
      })}

      {/* Right edge glow — catches light for depth */}
      <mesh position={[1.42, 0.2, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.02, 2.3]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.15} toneMapped={false} />
      </mesh>

      {/* Top edge glow */}
      <mesh position={[0, 1.42, 0]}>
        <planeGeometry args={[2.7, 0.015]} />
        <meshBasicMaterial color="#06B6D4" transparent opacity={0.12} toneMapped={false} />
      </mesh>

      {/* Bottom edge glow */}
      <mesh position={[0, -0.98, 0]}>
        <planeGeometry args={[2.7, 0.01]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.1} toneMapped={false} />
      </mesh>
    </group>
  );
}
