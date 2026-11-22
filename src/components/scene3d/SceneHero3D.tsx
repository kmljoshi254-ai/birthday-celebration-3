"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export const SceneHero3D: React.FC = () => {
  // Load local memory illustrations as WebGL textures
  const textures = useTexture([
    "/images/hero_1.png",
    "/images/hero_2.png",
    "/images/hero_3.png",
  ]);

  const p1Ref = useRef<THREE.Group>(null);
  const p2Ref = useRef<THREE.Group>(null);
  const p3Ref = useRef<THREE.Group>(null);

  // Polaroid meshes assembly sizes
  const w = 2.2;
  const h = 2.7;
  const cardThickness = 0.04;

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Subtle drifting movement for each polaroid mesh
    if (p1Ref.current) {
      p1Ref.current.position.y = Math.sin(elapsed * 1.2) * 0.12 + 0.5;
      p1Ref.current.rotation.y = Math.cos(elapsed * 0.7) * 0.05 - 0.1;
    }
    if (p2Ref.current) {
      p2Ref.current.position.y = Math.cos(elapsed * 1.4) * 0.1 - 0.6;
      p2Ref.current.rotation.y = Math.sin(elapsed * 0.9) * 0.06 + 0.15;
    }
    if (p3Ref.current) {
      p3Ref.current.position.y = Math.sin(elapsed * 0.9) * 0.15 + 0.1;
      p3Ref.current.rotation.y = Math.cos(elapsed * 1.1) * 0.04 - 0.02;
    }
  });

  return (
    <group position={[25, 0, 0]}>
      {/* POLAROID 1 (Left Back) */}
      <group ref={p1Ref} position={[-3.6, 0.5, -0.8]} rotation={[0.05, -0.1, 0.12]}>
        {/* White Cardboard Base */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, cardThickness]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
        {/* Mapped Image Texture */}
        <mesh position={[0, 0.2, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.25, w - 0.25]} />
          <meshStandardMaterial map={textures[0]} roughness={0.5} />
        </mesh>
        {/* Shadow Mask Bottom Block (Polaroid Label border) */}
        <mesh position={[0, -0.9, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.25, 0.4]} />
          <meshStandardMaterial color="#FCFAF2" roughness={0.9} />
        </mesh>
      </group>

      {/* POLAROID 2 (Right Back) */}
      <group ref={p2Ref} position={[3.6, -0.6, -1]} rotation={[-0.08, 0.15, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, cardThickness]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.25, w - 0.25]} />
          <meshStandardMaterial map={textures[1]} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.9, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.25, 0.4]} />
          <meshStandardMaterial color="#FCFAF2" roughness={0.9} />
        </mesh>
      </group>

      {/* POLAROID 3 (Center Front) */}
      <group ref={p3Ref} position={[0, 0.1, 0.5]} rotation={[0.02, -0.02, -0.04]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w + 0.1, h + 0.1, cardThickness]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.22, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.2, w - 0.2]} />
          <meshStandardMaterial map={textures[2]} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.95, cardThickness / 2 + 0.005]}>
          <planeGeometry args={[w - 0.2, 0.4]} />
          <meshStandardMaterial color="#FCFAF2" roughness={0.9} />
        </mesh>
      </group>

      {/* Spotlights and Ambient filling for Scene 2 */}
      <directionalLight position={[0, 4, 3]} intensity={0.8} castShadow />
    </group>
  );
};
