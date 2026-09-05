import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group } from 'three';

interface DependencyNodesProps {
  position?: [number, number, number];
  scale?: number;
  reducedMotion?: boolean;
}

type Vec3 = [number, number, number];

const COLORS = ['#818CF8', '#06B6D4', '#A855F7', '#10B981', '#F59E0B'] as const;

function seededValue(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function generateNodes(count: number) {
  const nodes: { pos: Vec3; color: string; size: number }[] = [];
  const angleStep = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const r = 0.45 + seededValue(i, 1) * 0.2;
    nodes.push({
      pos: [Math.cos(angle) * r, Math.sin(angle) * r, (seededValue(i, 2) - 0.5) * 0.3],
      color: COLORS[i % COLORS.length],
      size: 0.055 + seededValue(i, 3) * 0.04,
    });
  }
  return nodes;
}

function generateEdges(nodeCount: number) {
  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < nodeCount; i++) {
    // Connect to center
    edges.push({ from: -1, to: i });
    // Connect to next
    edges.push({ from: i, to: (i + 1) % nodeCount });
  }
  return edges;
}

/**
 * A small graph of connected nodes representing dependencies.
 * Center hub with surrounding nodes connected by thin lines.
 */
export default function DependencyNodes({
  position = [0, 0, 0],
  scale = 0.6,
  reducedMotion = false,
}: DependencyNodesProps) {
  const groupRef = useRef<Group>(null);
  const time = useRef(24.6);

  const nodeCount = 6;
  const nodes = useMemo(() => generateNodes(nodeCount), []);
  const edges = useMemo(() => generateEdges(nodeCount), []);

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion) return;
    time.current += delta;
    groupRef.current.rotation.z += delta * 0.08;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.45) * 0.05;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Center hub node */}
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color="#F8F8FC"
          emissive="#818CF8"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Hub glow */}
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#818CF8" transparent opacity={0.15} toneMapped={false} />
      </mesh>

      {/* Connection edges */}
      {edges.map((edge, i) => {
        const from: Vec3 = edge.from === -1 ? [0, 0, 0] : nodes[edge.from].pos;
        const to: Vec3 = edge.to === -1 ? [0, 0, 0] : nodes[edge.to].pos;
        return (
          <Line
            key={i}
            points={[from, to]}
            color="#6366F1"
            transparent
            opacity={0.2}
            lineWidth={0.8}
          />
        );
      })}

      {/* Outer nodes */}
      {nodes.map((node, i) => (
        <group key={i} position={node.pos}>
          {/* Glow */}
          <mesh>
            <sphereGeometry args={[node.size * 2.5, 10, 10]} />
            <meshBasicMaterial
              color={node.color}
              transparent
              opacity={0.12}
              toneMapped={false}
            />
          </mesh>
          {/* Core */}
          <mesh>
            <sphereGeometry args={[node.size, 12, 12]} />
            <meshStandardMaterial
              color="#F8F8FC"
              emissive={node.color}
              emissiveIntensity={1.2}
              roughness={0.25}
              metalness={0.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
