"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface HeartMeshProps {
  hovered: boolean;
  setHovered: (val: boolean) => void;
}

const HeartMesh: React.FC<HeartMeshProps> = ({ hovered, setHovered }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Generate Extruded Shape for a clean 3D heart
  const heartShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    // Path starting from center bottom
    shape.moveTo(0, -0.6);
    shape.bezierCurveTo(-0.2, -0.6, -0.7, -0.15, -0.7, 0.25);
    shape.bezierCurveTo(-0.7, 0.6, -0.4, 0.9, 0, 0.45);
    shape.bezierCurveTo(0.4, 0.9, 0.7, 0.6, 0.7, 0.25);
    shape.bezierCurveTo(0.7, -0.15, 0.2, -0.6, 0, -0.6);
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.25,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    
    // Smooth auto-rotation
    meshRef.current.rotation.y = elapsed * (hovered ? 2.5 : 0.4);
    meshRef.current.rotation.x = Math.sin(elapsed * 0.8) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      rotation={[0, 0, Math.PI]} // Flip upside down since Y is down in standard shape layout
      scale={hovered ? 1.45 : 1.25}
    >
      <extrudeGeometry args={[heartShape, extrudeSettings]} />
      <meshStandardMaterial
        color={hovered ? "#FF5E7E" : "#F3A3B4"}
        roughness={0.15}
        metalness={0.7}
        emissive={hovered ? "#2C050B" : "#000000"}
      />
    </mesh>
  );
};

interface Floating3DObjectProps {
  className?: string;
}

export const Floating3DObject: React.FC<Floating3DObjectProps> = ({ className = "" }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`w-32 h-32 select-none pointer-events-auto z-20 ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.5], fov: 40 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 3]} intensity={1.5} color="#FFFDF9" />
        <directionalLight position={[-2, -2, 1]} intensity={0.5} color="#C3B1E1" />
        
        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.6}>
          <HeartMesh hovered={hovered} setHovered={setHovered} />
        </Float>
      </Canvas>
    </div>
  );
};
