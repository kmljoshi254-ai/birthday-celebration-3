"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CinematicCamera } from "./CinematicCamera";
import { Particles3D } from "./Particles3D";
import { SceneIntro3D } from "./SceneIntro3D";

interface CanvasContainerProps {
  activeSceneIndex: number;
  isEnvelopeOpen: boolean;
  onEnvelopeOpenTrigger: () => void;
  onProceed?: () => void;
  onMusicToast?: (msg: string) => void;
  isScrapbookOpening?: boolean;
  accentColor?: string;
}

// Synced lighting component that derives soft ambient and fill tints from the chosen theme color
const CinematicLights: React.FC<{ accentColor?: string }> = ({ accentColor }) => {
  const baseColor = useMemo(() => new THREE.Color(accentColor || "#F3A3B4"), [accentColor]);
  
  const ambientColor = useMemo(() => {
    const temp = baseColor.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    temp.getHSL(hsl);
    // Soft, high-lightness tint for ambient bounce reflections
    return temp.setHSL(hsl.h, Math.min(0.4, hsl.s * 0.6), Math.max(0.9, hsl.l * 1.1));
  }, [baseColor]);

  const fillColor = useMemo(() => {
    const temp = baseColor.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    temp.getHSL(hsl);
    // Soft fill tint to contrast edges
    return temp.setHSL(hsl.h, Math.min(0.5, hsl.s * 0.8), Math.max(0.78, hsl.l * 1.0));
  }, [baseColor]);

  return (
    <>
      <ambientLight color={ambientColor} intensity={0.5} />
      
      {/* Warm desk key light */}
      <directionalLight
        position={[5, 10, 3]}
        intensity={0.85}
        color="#FFFDF9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Color-synced fill light */}
      <directionalLight
        position={[-6, -4, 2]}
        intensity={0.4}
        color={fillColor}
        castShadow={false}
      />
    </>
  );
};

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  activeSceneIndex,
  isEnvelopeOpen,
  onEnvelopeOpenTrigger,
  onProceed,
  onMusicToast,
  isScrapbookOpening = false,
  accentColor,
}) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#F8F1E7] overflow-hidden z-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 7], fov: 45 }}
      >
        <color attach="background" args={["#F8F1E7"]} />

        {/* Cinematic Camera Rig */}
        <CinematicCamera
          activeSceneIndex={activeSceneIndex}
          isEnvelopeOpen={isEnvelopeOpen}
          isScrapbookOpening={isScrapbookOpening}
        />

        {/* Theme Synced Lights */}
        <CinematicLights accentColor={accentColor} />

        {/* Drifting warm particles representing dust motes */}
        <Particles3D />

        {/* 3D Scene layout */}
        <SceneIntro3D
          isOpen={isEnvelopeOpen}
          onOpenTrigger={onEnvelopeOpenTrigger}
          onProceed={onProceed}
          onMusicToast={onMusicToast}
          isScrapbookOpening={isScrapbookOpening}
          accentColor={accentColor}
        />
      </Canvas>
    </div>
  );
};
