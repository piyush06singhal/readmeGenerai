/**
 * Carefully balanced lighting setup for the 3D scene.
 * Uses ambient, directional, point, and spot lights to create
 * enough contrast for depth without excessive bloom.
 */
export default function SceneLighting() {
  return (
    <>
      {/* Soft ambient fill — prevents pure black shadows */}
      <ambientLight intensity={0.4} />

      {/* Key light — primary illumination from upper right */}
      <directionalLight
        position={[5, 6, 4]}
        intensity={1.5}
        color="#F8F8FC"
      />

      {/* Accent light 1 — indigo from upper left */}
      <pointLight
        position={[-4, 3, 3]}
        intensity={2.6}
        color="#818CF8"
        distance={18}
        decay={2}
      />

      {/* Accent light 2 — cyan from lower right */}
      <pointLight
        position={[4, -2, 3]}
        intensity={1.8}
        color="#06B6D4"
        distance={16}
        decay={2}
      />

      {/* Accent light 3 — purple from center-behind */}
      <pointLight
        position={[0, -1, -2]}
        intensity={1.3}
        color="#A855F7"
        distance={14}
        decay={2}
      />

      {/* Top rim light — catches edges of objects */}
      <spotLight
        position={[0, 8, 4]}
        intensity={1.0}
        color="#E0E0FF"
        angle={0.6}
        penumbra={1}
        distance={20}
        decay={2}
      />
    </>
  );
}
