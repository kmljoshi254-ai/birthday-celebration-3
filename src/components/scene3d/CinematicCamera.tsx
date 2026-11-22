"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CinematicCameraProps {
  activeSceneIndex: number;
  isEnvelopeOpen: boolean;
  isScrapbookOpening?: boolean;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({
  activeSceneIndex,
  isEnvelopeOpen,
  isScrapbookOpening = false,
}) => {
  const { camera, size } = useThree();
  const currentTargetX = useRef(0);

  // Set initial camera parameters on mount
  useEffect(() => {
    camera.position.set(0, 0, 7);
  }, [camera]);

  useFrame((state) => {
    // 1. Detect portrait orientation (mobile/tablet viewports)
    const isMobile = size.width < 768;

    // 2. Calculate active scene center X position
    const sceneCenterX = activeSceneIndex * 25;
    const elapsed = state.clock.getElapsedTime();

    let targetCameraX = sceneCenterX;
    let targetCameraY = isMobile ? 0.4 : 0;
    let targetCameraZ = isMobile ? 8.2 : 6.2;

    if (isScrapbookOpening) {
      // Rapid dolly-zoom transition: fly straight into the open note card so it fills the screen
      targetCameraX = sceneCenterX;
      targetCameraY = isMobile ? 0.6 : 1.0;
      targetCameraZ = isMobile ? 2.2 : 1.35;
    } else {
      // Normal overview camera with breathing and parallax
      const mult = isMobile ? 0.3 : 1.0;
      const parallaxX = state.pointer.x * 1.5 * mult;
      const parallaxY = state.pointer.y * 0.8 * mult;

      // Extremely subtle breathing motion (Living Room vibe)
      const breathX = Math.sin(elapsed * 0.15) * 0.02;
      const breathY = Math.cos(elapsed * 0.12) * 0.015;

      targetCameraX = sceneCenterX + parallaxX + breathX;
      targetCameraY = (isMobile ? 0.4 : 0) + parallaxY + breathY;
      targetCameraZ = isMobile ? 8.2 : 6.2;
    }

    // Lerp positions (rapid lerping during zoom transition, smooth during idle)
    const lerpSpeed = isScrapbookOpening ? 0.12 : 0.05;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCameraX, lerpSpeed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCameraY, lerpSpeed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, lerpSpeed);

    // Smoothly shift lookAt point to center of the active scene
    currentTargetX.current = THREE.MathUtils.lerp(currentTargetX.current, sceneCenterX, 0.05);
    camera.lookAt(new THREE.Vector3(currentTargetX.current, 0, 0));
  });

  return null;
};
