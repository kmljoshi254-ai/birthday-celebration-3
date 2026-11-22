"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { friendshipConfig } from "@/config/friendship";

interface Envelope3DMeshProps {
  isOpen: boolean;
  onOpenTrigger?: () => void;
  onProceed?: () => void;
}

export const Envelope3DMesh: React.FC<Envelope3DMeshProps> = ({
  isOpen,
  onOpenTrigger,
  onProceed,
}) => {
  const envelopeGroupRef = useRef<THREE.Group>(null);
  const flapGroupRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Mesh>(null);

  const w = 4.4;
  const h = 2.8;
  const thickness = 0.03;

  // Extrude settings for tactile paper volume
  const extrudeSettings = useMemo(() => ({
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01,
  }), []);

  // Left Flap Shape
  const leftFlapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, h / 2);
    shape.lineTo(0, 0);
    shape.lineTo(-w / 2, -h / 2);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [w, h, extrudeSettings]);

  // Right Flap Shape
  const rightFlapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(w / 2, h / 2);
    shape.lineTo(0, 0);
    shape.lineTo(w / 2, -h / 2);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [w, h, extrudeSettings]);

  // Bottom Flap Shape
  const bottomFlapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(0, -0.2);
    shape.lineTo(w / 2, -h / 2);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [w, h, extrudeSettings]);

  // Top Hinged Flap Shape (Points down when rotation is 0)
  const topFlapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(0, -h / 2 - 0.1);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [w, h, extrudeSettings]);

  useFrame((state) => {
    if (!envelopeGroupRef.current) return;

    // 1. Slow, organic hovering/floating motion
    if (!isOpen) {
      envelopeGroupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.15;
      envelopeGroupRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.8) * 0.03;
    } else {
      // Settle down slightly when opened
      envelopeGroupRef.current.position.y = THREE.MathUtils.lerp(envelopeGroupRef.current.position.y, -0.6, 0.08);
      envelopeGroupRef.current.rotation.z = THREE.MathUtils.lerp(envelopeGroupRef.current.rotation.z, 0, 0.08);
    }

    // 2. Animate the top flap hinge swing
    if (flapGroupRef.current) {
      // 0 is closed (facing down), -Math.PI + 0.35 is fully open (swung up)
      const targetRotationX = isOpen ? -Math.PI + 0.35 : 0;
      flapGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        flapGroupRef.current.rotation.x,
        targetRotationX,
        0.08
      );
    }

    // 3. Animate the letter sliding out vertically
    if (letterRef.current) {
      const targetY = isOpen ? 2.3 : 0;
      const targetZ = isOpen ? 0.2 : -0.04;
      letterRef.current.position.y = THREE.MathUtils.lerp(letterRef.current.position.y, targetY, 0.07);
      letterRef.current.position.z = THREE.MathUtils.lerp(letterRef.current.position.z, targetZ, 0.07);
    }
  });

  return (
    <group ref={envelopeGroupRef}>
      {/* 1. BACK PLATE (The main body frame container) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.08]} />
        <meshStandardMaterial color="#F7E5A9" roughness={0.7} metalness={0.05} />
      </mesh>
      
      {/* Back inner shadow shadow mask */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[w - 0.1, h - 0.1]} />
        <meshStandardMaterial color="#EAD695" roughness={0.9} />
      </mesh>

      {/* 2. EMERGING LETTER CARD */}
      <mesh ref={letterRef} position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[w - 0.3, h - 0.2, 0.03]} />
        <meshStandardMaterial color="#FFFDF9" roughness={0.8} />

        {/* Real HTML contents inside the WebGL letter card using Drei */}
        {isOpen && (
          <Html
            position={[0, 0.05, 0.022]}
            transform
            occlude="blending"
            scale={0.4}
            className="w-[290px] h-[190px] select-none pointer-events-auto flex flex-col justify-between p-5"
          >
            <div className="w-full h-full flex flex-col justify-between text-left font-sans text-text-ink relative pointer-events-auto">
              {/* Notebook margin line visual */}
              <div className="absolute inset-y-0 -left-2 w-0.5 bg-red-300/40" />

              <div>
                <span className="font-handwritten text-xl text-accent-pink font-bold block mb-1">
                  Dear {friendshipConfig.recipient},
                </span>
                <p className="text-xs font-semibold text-text-ink/80 leading-relaxed font-sans">
                  {friendshipConfig.envelopeMessage}
                </p>
              </div>

              {/* proceed button rendered directly on the note */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onProceed) onProceed();
                }}
                className="px-3 py-1.5 bg-accent-pink text-white font-bold rounded-full text-[9px] tracking-widest shadow-xs hover:shadow-sm hover:bg-accent-pink/90 active:scale-95 transition-all self-end flex items-center gap-1 cursor-pointer pointer-events-auto mt-3 mb-1"
              >
                {friendshipConfig.envelopeButton}
              </button>
            </div>
          </Html>
        )}
      </mesh>

      {/* 3. LEFT SHAPE FLAP */}
      <mesh geometry={leftFlapGeometry} position={[0, 0, 0.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#A2C2E1" roughness={0.75} />
      </mesh>

      {/* 4. RIGHT SHAPE FLAP */}
      <mesh geometry={rightFlapGeometry} position={[0, 0, 0.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#A2C2E1" roughness={0.75} />
      </mesh>

      {/* 5. BOTTOM SHAPE FLAP */}
      <mesh geometry={bottomFlapGeometry} position={[0, 0, 0.06]} castShadow receiveShadow>
        <meshStandardMaterial color="#B4CBB7" roughness={0.7} />
      </mesh>

      {/* 6. TOP FLAP PIECE (Hinged at Y = h/2) */}
      <group ref={flapGroupRef} position={[0, h / 2, 0.07]}>
        <mesh geometry={topFlapGeometry} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#F3A3B4" roughness={0.72} />
        </mesh>
        
        {/* Heart Wax Seal Sticker on the flap tips */}
        <mesh position={[0, -h / 2 - 0.06, 0.04]} castShadow onClick={onOpenTrigger}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          {/* Rotate cylinder to align horizontally */}
          <meshStandardMaterial color="#E25B72" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
