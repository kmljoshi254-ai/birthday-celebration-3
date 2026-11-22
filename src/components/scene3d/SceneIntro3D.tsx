"use client";

import React from "react";
import { Envelope3DStationery } from "./Envelope3DStationery";
import { DeskScene } from "./DeskScene";

interface SceneIntro3DProps {
  isOpen: boolean;
  onOpenTrigger: () => void;
  onProceed?: () => void;
  onMusicToast?: (msg: string) => void;
  isScrapbookOpening?: boolean;
  accentColor?: string;
}

export const SceneIntro3D: React.FC<SceneIntro3DProps> = ({
  isOpen,
  onOpenTrigger,
  onProceed,
  onMusicToast,
  accentColor,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Immersive Desk Scene */}
      <DeskScene onMusicToast={onMusicToast} isOpen={isOpen} accentColor={accentColor} />

      {/* 2. 3D Envelope Stationery Mesh */}
      <Envelope3DStationery
        isOpen={isOpen}
        onOpenTrigger={onOpenTrigger}
        onProceed={onProceed}
        accentColor={accentColor}
      />
    </group>
  );
};
