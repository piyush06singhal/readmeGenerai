import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Group } from 'three';
import DocumentationCard from './DocumentationCard';
import RepositoryObject from './RepositoryObject';
import CodeObject from './CodeObject';
import DependencyNodes from './DependencyNodes';
import MarkdownSymbol from './MarkdownSymbol';
import ConnectionFlow from './ConnectionFlow';
import FloatingParticles from './FloatingParticles';
import SceneLighting from './SceneLighting';
import CameraController from './CameraController';
import type { QualityLevel } from '../../hooks/useDeviceQuality';

interface SceneContentProps {
  quality: QualityLevel;
  reducedMotion: boolean;
  scrollProgress: React.MutableRefObject<number>;
}

/**
 * Orchestrates the entire 3D scene composition.
 *
 * Layout (top-down, with depth layers):
 *   Layer 0 (z ~ -4 to -3):  Background particles + wireframe icosahedron
 *   Layer 1 (z ~ -2 to -1):  Connection flow lines
 *   Layer 2 (z ~ -1.5 to 0): Supporting objects (repo, code, deps, markdown)
 *   Layer 3 (z ~ 0):         Central DocumentationCard
 *   Layer 4 (z ~ 1):         Sparkles overlay
 */
export default function SceneContent({ quality, reducedMotion, scrollProgress }: SceneContentProps) {
  const worldRef = useRef<Group>(null);
  const time = useRef(0);

  // Gentle world rotation driven by scroll
  useFrame((_, delta) => {
    if (!worldRef.current || reducedMotion) return;
    time.current += delta;
    const sp = scrollProgress.current;

    // Very subtle world rotation that increases with scroll
    worldRef.current.rotation.y = Math.sin(time.current * 0.15) * 0.03 * (1 + sp * 0.5);
    worldRef.current.rotation.x = Math.cos(time.current * 0.1) * 0.015 * (1 - sp * 0.3);

    // Fade the world as user scrolls past hero
    const targetOpacity = Math.max(0, 1 - sp * 1.2);
    worldRef.current.visible = targetOpacity > 0.01;
  });

  return (
    <>
      <CameraController scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <SceneLighting />

      <group ref={worldRef}>
        {/* === Layer 0: Background atmosphere === */}
        <FloatingParticles quality={quality} reducedMotion={reducedMotion} />

        {/* Wireframe icosahedron — distant geometric depth */}
        {quality !== 'low' && !reducedMotion && (
          <Float speed={0.4} rotationIntensity={0.2} floatIntensity={0.15}>
            <mesh position={[0, 0, -4]} rotation={[0.3, 0.5, 0]}>
              <icosahedronGeometry args={[4.5, 1]} />
              <meshBasicMaterial color="#6366F1" wireframe transparent opacity={0.17} />
            </mesh>
          </Float>
        )}

        {/* === Layer 1: Connection flow === */}
        {quality !== 'low' && (
          <ConnectionFlow reducedMotion={reducedMotion} />
        )}

        {/* === Layer 2: Supporting objects === */}

        {/* Repository — upper left */}
        <Float
          speed={reducedMotion ? 0 : 1.0}
          rotationIntensity={0.12}
          floatIntensity={0.3}
        >
          <RepositoryObject
            position={[-4.2, 2.0, -0.8]}
            scale={0.7}
            reducedMotion={reducedMotion}
          />
        </Float>

        {/* Code editor — upper right */}
        <Float
          speed={reducedMotion ? 0 : 1.1}
          rotationIntensity={0.1}
          floatIntensity={0.25}
        >
          <CodeObject
            position={[4.4, 1.5, -1.2]}
            rotation={[0.08, -0.15, 0.03]}
            scale={0.6}
            reducedMotion={reducedMotion}
          />
        </Float>

        {/* Dependencies — lower right */}
        <Float
          speed={reducedMotion ? 0 : 0.9}
          rotationIntensity={0.15}
          floatIntensity={0.2}
        >
          <DependencyNodes
            position={[3.8, -2.0, -1.8]}
            scale={0.7}
            reducedMotion={reducedMotion}
          />
        </Float>

        {/* Markdown symbol — lower left */}
        <Float
          speed={reducedMotion ? 0 : 1.0}
          rotationIntensity={0.12}
          floatIntensity={0.25}
        >
          <MarkdownSymbol
            position={[-3.6, -1.8, -1.5]}
            scale={0.55}
            reducedMotion={reducedMotion}
          />
        </Float>

        {/* === Layer 3: Central documentation card === */}
        <group position={[0, 0.3, 0]}>
          <Float
            speed={reducedMotion ? 0 : 0.8}
            rotationIntensity={0.04}
            floatIntensity={0.15}
          >
            <DocumentationCard reducedMotion={reducedMotion} />
          </Float>
        </group>

        {/* === Layer 4: Ambient sparkles === */}
        {quality !== 'low' && (
          <ambientLight intensity={0.1} />
        )}
      </group>
    </>
  );
}
