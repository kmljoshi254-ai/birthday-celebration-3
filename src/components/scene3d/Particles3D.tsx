"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleData {
  position: THREE.Vector3;
  speed: number;
  scale: number;
  color: string;
}

export const Particles3D: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate 45 particles scattered around the active scenes area
  const count = 45;
  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    const colors = ["#F3A3B4", "#F7E5A9", "#A2C2E1", "#B4CBB7"];

    for (let i = 0; i < count; i++) {
      // Scatter them widely along the X axis (covering Scene 1 and Scene 2 space)
      const x = (Math.random() - 0.5) * 50; 
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 10 - 2;

      data.push({
        position: new THREE.Vector3(x, y, z),
        speed: 0.01 + Math.random() * 0.02,
        scale: 0.05 + Math.random() * 0.12,
        color: colors[i % colors.length],
      });
    }
    return data;
  }, []);

  // Temporary objects to build transformation matrices per frame
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      let { position, speed, scale, color } = particle;

      // Float upwards
      position.y += speed;

      // Add a slight horizontal wave drift based on time
      position.x += Math.sin(state.clock.getElapsedTime() + i) * 0.002;

      // Boundary reset at Y axis top limit
      if (position.y > 8) {
        position.y = -8;
      }

      // Update instanced object matrix
      tempObject.position.copy(position);
      tempObject.scale.set(scale, scale, scale);
      
      // Gentle spin rotation
      tempObject.rotation.y = state.clock.getElapsedTime() * (i % 2 === 0 ? 0.3 : -0.3);
      tempObject.rotation.x = state.clock.getElapsedTime() * 0.1;
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Apply pastel color
      tempColor.set(color);
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.DodecahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial(), count]}
      castShadow={false}
      receiveShadow={false}
    >
      <meshBasicMaterial transparent opacity={0.45} toneMapped={false} />
    </instancedMesh>
  );
};
