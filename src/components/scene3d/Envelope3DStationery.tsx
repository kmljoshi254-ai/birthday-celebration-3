"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { friendshipConfig } from "@/config/friendship";

interface Envelope3DStationeryProps {
  isOpen: boolean;
  onOpenTrigger?: () => void;
  onProceed?: () => void;
  accentColor?: string;
}

export const Envelope3DStationery: React.FC<Envelope3DStationeryProps> = ({
  isOpen,
  onOpenTrigger,
  onProceed,
  accentColor,
}) => {
  const envelopeGroupRef = useRef<THREE.Group>(null);
  const flapGroupRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Group>(null);

  // Note card drag tracking refs
  const isDraggingCard = useRef(false);
  const cardDragRotation = useRef([0, 0]); // [x, y]
  const cardPointerStart = useRef({ x: 0, y: 0 });

  // Envelope base drag tracking refs
  const isDraggingEnvelope = useRef(false);
  const envelopeDragRotation = useRef([0, 0]); // [x, y]
  const envelopePointerStart = useRef({ x: 0, y: 0 });

  // Geometry dimensions
  const ew = 4.0;
  const eh = 2.6;
  const thickness = 0.14; 
  const r = 0.04;

  // Dynamically calculate shaded envelope color palette in 3D using Three.js color math
  const baseColor = useMemo(() => new THREE.Color(accentColor || "#F3A3B4"), [accentColor]);
  
  const flapColor = useMemo(() => {
    // Lighten side flaps slightly for depth
    return baseColor.clone().multiplyScalar(1.06);
  }, [baseColor]);
  
  const bottomColor = useMemo(() => {
    // Darken bottom flap slightly for pocket shadows
    return baseColor.clone().multiplyScalar(0.92);
  }, [baseColor]);
  
  const sealColor = useMemo(() => {
    // Deep red/contrast color for the wax seal based on base HSL
    const temp = baseColor.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    temp.getHSL(hsl);
    return temp.setHSL(hsl.h, Math.min(1.0, hsl.s * 1.35), Math.max(0.2, hsl.l * 0.72));
  }, [baseColor]);

  // Handlers for dragging the note card (only active when open)
  const handleCardPointerDown = (e: any) => {
    if (!isOpen) return;
    e.stopPropagation();
    isDraggingCard.current = true;
    cardPointerStart.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
  };

  const handleCardPointerMove = (e: any) => {
    if (!isDraggingCard.current || !isOpen) return;
    e.stopPropagation();
    const dx = e.clientX - cardPointerStart.current.x;
    const dy = e.clientY - cardPointerStart.current.y;
    
    cardDragRotation.current[0] += dy * 0.006;
    cardDragRotation.current[1] += dx * 0.006;
    
    // Clamp rotation range
    cardDragRotation.current[0] = Math.max(-0.2, Math.min(0.2, cardDragRotation.current[0]));
    cardDragRotation.current[1] = Math.max(-0.4, Math.min(0.4, cardDragRotation.current[1]));
    
    cardPointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardPointerUp = (e: any) => {
    if (!isOpen) return;
    e.stopPropagation();
    isDraggingCard.current = false;
    e.target.releasePointerCapture(e.pointerId);
    document.body.style.cursor = "grab";
  };

  // Handlers for dragging the envelope base (only active when closed)
  const handleEnvelopePointerDown = (e: any) => {
    if (isOpen) return;
    e.stopPropagation();
    isDraggingEnvelope.current = true;
    envelopePointerStart.current = { x: e.clientX, y: e.clientY };
    e.target.setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
  };

  const handleEnvelopePointerMove = (e: any) => {
    if (!isDraggingEnvelope.current || isOpen) return;
    e.stopPropagation();
    const dx = e.clientX - envelopePointerStart.current.x;
    const dy = e.clientY - envelopePointerStart.current.y;

    envelopeDragRotation.current[0] += dy * 0.005;
    envelopeDragRotation.current[1] += dx * 0.005;

    // Clamp rotation range
    envelopeDragRotation.current[0] = Math.max(-0.15, Math.min(0.15, envelopeDragRotation.current[0]));
    envelopeDragRotation.current[1] = Math.max(-0.25, Math.min(0.25, envelopeDragRotation.current[1]));

    envelopePointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleEnvelopePointerUp = (e: any) => {
    if (isOpen) return;
    e.stopPropagation();
    isDraggingEnvelope.current = false;
    e.target.releasePointerCapture(e.pointerId);
    document.body.style.cursor = "grab";
  };

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (!envelopeGroupRef.current) return;

    // 1. Spring back envelope rotation offsets to zero when not holding
    if (!isDraggingEnvelope.current) {
      envelopeDragRotation.current[0] = THREE.MathUtils.lerp(envelopeDragRotation.current[0], 0, 0.1);
      envelopeDragRotation.current[1] = THREE.MathUtils.lerp(envelopeDragRotation.current[1], 0, 0.1);
    }

    // 2. Slow floating wobble combined with drag rotation
    if (!isOpen) {
      const floatY = -0.95 + Math.sin(elapsed * 1.5) * 0.05;
      const floatRotZ = 0.12 + Math.cos(elapsed * 0.8) * 0.02 + envelopeDragRotation.current[1];
      const floatRotX = -Math.PI / 2 + 0.05 + envelopeDragRotation.current[0];

      envelopeGroupRef.current.position.y = floatY;
      envelopeGroupRef.current.rotation.x = floatRotX;
      envelopeGroupRef.current.rotation.z = floatRotZ;
    } else {
      // Settle and slide back slightly to frame the card when open
      envelopeGroupRef.current.position.y = THREE.MathUtils.lerp(envelopeGroupRef.current.position.y, -0.95, 0.08);
      envelopeGroupRef.current.position.z = THREE.MathUtils.lerp(envelopeGroupRef.current.position.z, -0.4, 0.08);
      
      envelopeGroupRef.current.rotation.x = THREE.MathUtils.lerp(envelopeGroupRef.current.rotation.x, -Math.PI / 2 + 0.05, 0.08);
      envelopeGroupRef.current.rotation.z = THREE.MathUtils.lerp(envelopeGroupRef.current.rotation.z, 0, 0.08);
    }

    // 3. Swing the top flap hinge
    if (flapGroupRef.current) {
      const targetRotationX = isOpen ? -Math.PI + 0.15 : 0;
      flapGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        flapGroupRef.current.rotation.x,
        targetRotationX,
        0.08
      );
    }

    // 4. Spring back card rotation offsets
    if (!isDraggingCard.current) {
      cardDragRotation.current[0] = THREE.MathUtils.lerp(cardDragRotation.current[0], 0, 0.1);
      cardDragRotation.current[1] = THREE.MathUtils.lerp(cardDragRotation.current[1], 0, 0.1);
    }

    // 5. Translate, tilt and rotate the letter card (with spring offsets)
    if (letterRef.current) {
      const targetY = isOpen ? 2.3 : 0.25;
      const targetZ = isOpen ? 1.2 : 0.01;
      
      const targetRotationX = isOpen ? (Math.PI / 2 - 0.26 + cardDragRotation.current[0]) : 0;
      const targetRotationY = isOpen ? cardDragRotation.current[1] : 0;
      const targetRotationZ = isOpen ? -cardDragRotation.current[1] * 0.08 : 0;

      letterRef.current.position.y = THREE.MathUtils.lerp(letterRef.current.position.y, targetY, 0.07);
      letterRef.current.position.z = THREE.MathUtils.lerp(letterRef.current.position.z, targetZ, 0.07);
      
      letterRef.current.rotation.x = THREE.MathUtils.lerp(letterRef.current.rotation.x, targetRotationX, 0.07);
      letterRef.current.rotation.y = THREE.MathUtils.lerp(letterRef.current.rotation.y, targetRotationY, 0.07);
      letterRef.current.rotation.z = THREE.MathUtils.lerp(letterRef.current.rotation.z, targetRotationZ, 0.07);
    }
  });

  return (
    <group
      ref={envelopeGroupRef}
      position={[0, -0.95, 0]}
      rotation={[-Math.PI / 2 + 0.05, 0, 0.12]}
      onPointerDown={handleEnvelopePointerDown}
      onPointerMove={handleEnvelopePointerMove}
      onPointerUp={handleEnvelopePointerUp}
      onPointerOver={() => {
        if (!isOpen) document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!isOpen) {
          document.body.style.cursor = "auto";
          isDraggingEnvelope.current = false;
        }
      }}
    >
      {/* 1. ENVELOPE BACK SHELL (Base Color) */}
      <RoundedBox args={[ew, eh, thickness]} radius={r} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.7} metalness={0.05} />
      </RoundedBox>

      {/* Back inner pocket lining */}
      <mesh position={[0, 0, thickness / 2 + 0.002]}>
        <planeGeometry args={[ew - 0.08, eh - 0.08]} />
        <meshStandardMaterial color="#F9EBC5" roughness={0.8} />
      </mesh>

      {/* 2. EMERGING NOTE CARD GROUP */}
      <group
        ref={letterRef}
        position={[0, 0.25, 0.01]}
        onPointerDown={handleCardPointerDown}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerUp}
        onPointerOver={() => {
          if (isOpen) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (isOpen) {
            document.body.style.cursor = "auto";
            isDraggingCard.current = false;
          }
        }}
      >
        <RoundedBox args={[ew - 0.3, eh - 0.2, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
        </RoundedBox>

        {/* FRONT SIDE note content */}
        {isOpen && (
          <Html
            position={[0, 0.05, 0.026]}
            transform
            occlude="blending"
            scale={0.4}
            className="w-[290px] h-[190px] select-none pointer-events-auto flex flex-col justify-between p-5"
          >
            <div className="w-full h-full flex flex-col justify-between text-left font-handwritten text-text-ink relative pointer-events-auto">
              <div className="absolute inset-y-0 -left-2 w-0.5 bg-red-200/30" />

              <div className="pr-2 leading-relaxed">
                <span className="text-2xl text-accent-pink font-extrabold block mb-1">
                  Dear {friendshipConfig.recipient},
                </span>
                <p className="text-[15px] font-bold text-text-ink/90">
                  {friendshipConfig.envelopeMessage}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = "auto";
                  if (onProceed) onProceed();
                }}
                className="px-3.5 py-1.5 bg-accent-pink text-white font-bold rounded-full text-[10px] tracking-widest shadow-xs hover:shadow-sm hover:bg-accent-pink/90 active:scale-95 transition-all self-end flex items-center gap-1 cursor-pointer pointer-events-auto z-50 font-sans my-3"
              >
                {friendshipConfig.envelopeButton}
              </button>
            </div>
          </Html>
        )}
      </group>

      {/* 3. SIDE FLAPS (Shaded Flap Color) */}
      <group position={[0, 0, thickness / 2]}>
        <RoundedBox args={[ew / 2, eh, 0.03]} radius={0.01} smoothness={3} position={[-ew/4, 0, 0.015]} castShadow receiveShadow>
          <meshStandardMaterial color={flapColor} roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[ew / 2, eh, 0.03]} radius={0.01} smoothness={3} position={[ew/4, 0, 0.015]} castShadow receiveShadow>
          <meshStandardMaterial color={flapColor} roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[ew, eh / 2, 0.04]} radius={0.01} smoothness={3} position={[0, -eh/4, 0.03]} castShadow receiveShadow>
          <meshStandardMaterial color={bottomColor} roughness={0.7} />
        </RoundedBox>
      </group>

      {/* 4. TOP FLAP PIECE */}
      <group ref={flapGroupRef} position={[0, eh / 2, thickness / 2 + 0.01]}>
        <group position={[0, -eh / 4, 0]}>
          <RoundedBox args={[ew, eh / 2, 0.03]} radius={0.01} smoothness={3} position={[0, 0, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={baseColor} roughness={0.72} />
          </RoundedBox>
          <mesh position={[0, -eh / 4, 0.03]} castShadow onClick={onOpenTrigger}>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 32]} />
            <meshStandardMaterial color={sealColor} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
