"use client";

import React, { useMemo, useRef, useState } from "react";
import { useTexture, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { friendshipConfig } from "@/config/friendship";
import { AudioController } from "../intro/AudioController";

interface DeskSceneProps {
  onMusicToast?: (msg: string) => void;
  isOpen?: boolean;
  accentColor?: string;
}

export const DeskScene: React.FC<DeskSceneProps> = ({ 
  onMusicToast, 
  isOpen = false,
  accentColor,
}) => {
  // Load photo textures for the scattered polaroids
  const textures = useTexture([
    "/images/hero_1.png",
    "/images/hero_2.png",
    "/images/hero_3.png",
    "/images/surprise_1.png",
  ]);

  // Polaroid dims
  const pw = 1.4;
  const ph = 1.7;
  const thickness = 0.04;

  // Interaction refs
  const candleLightRef = useRef<THREE.PointLight>(null);
  const radioGroupRef = useRef<THREE.Group>(null);
  const catEarLRef = useRef<THREE.Mesh>(null);
  const catEarRRef = useRef<THREE.Mesh>(null);
  const catGroupRef = useRef<THREE.Group>(null);
  const personHeadRef = useRef<THREE.Mesh>(null);
  const personGroupRef = useRef<THREE.Group>(null);

  // States
  const [isCatHovered, setIsCatHovered] = useState(false);
  const radioWiggle = useRef(0);

  // Read config options
  const deskConfig = friendshipConfig.desk;

  // Toggle ambient audio on 3D Radio clicks
  const handleRadioClick = (e: any) => {
    e.stopPropagation();
    
    // Cycle ambient channels
    const newChannel = AudioController.cycleChannel();
    
    // Trigger wiggle animation physics
    radioWiggle.current = 1.0;

    // Toast alert HUD feedback
    let toastLabel = "Ambient Radio Off 🔇";
    if (newChannel === "lofi") toastLabel = "Best Friend Music 📻";
    if (newChannel === "rain") toastLabel = "Rainy Window 🌧️";
    if (newChannel === "crackle") toastLabel = "Vinyl Crackle 🎶";

    if (onMusicToast) {
      onMusicToast(toastLabel);
    }
  };

  // Generate pressed flowers coloring based on config
  const flowerColor = useMemo(() => {
    if (deskConfig.flowers === "roses") return "#E25B72";
    if (deskConfig.flowers === "tulips") return "#F7E5A9";
    return "#F3A3B4"; // default cherry-blossom
  }, [deskConfig.flowers]);

  const flowerPetals = useMemo(() => {
    const coords = [];
    const colors = [flowerColor, "#ECC6CE", "#F9EBC5", "#B4CBB7"];
    
    // Flower cluster (Left background)
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const r = 0.12;
      coords.push({
        id: `f1_${i}`,
        pos: [-2.4 + Math.cos(angle) * r, -0.98, -1.8 + Math.sin(angle) * r] as [number, number, number],
        color: colors[i % colors.length],
        scale: 0.07,
      });
    }
    coords.push({ id: "f1_c", pos: [-2.4, -0.97, -1.8] as [number, number, number], color: "#F7E5A9", scale: 0.05 });

    // Extra scattered petals
    coords.push({ id: "p1", pos: [-1.2, -0.99, -0.5] as [number, number, number], color: flowerColor, scale: 0.04 });
    coords.push({ id: "p2", pos: [1.8, -0.99, 0.6] as [number, number, number], color: flowerColor, scale: 0.05 });
    coords.push({ id: "p3", pos: [-0.6, -0.99, 1.2] as [number, number, number], color: "#F9EBC5", scale: 0.04 });

    return coords;
  }, [flowerColor]);

  // Cozy fairy lights coordinates
  const stringLights = useMemo(() => [
    { id: "l1", pos: [-4.5, 0.4, -3.2] as [number, number, number] },
    { id: "l2", pos: [-2.2, 0.7, -3.2] as [number, number, number] },
    { id: "l3", pos: [0.0, 0.8, -3.2] as [number, number, number] },
    { id: "l4", pos: [2.2, 0.7, -3.2] as [number, number, number] },
    { id: "l5", pos: [4.5, 0.4, -3.2] as [number, number, number] },
  ], []);

  // Friendship bracelet beads coordinates (circular layout)
  const braceletBeads = useMemo(() => {
    const beads = [];
    const colors = ["#F3A3B4", "#A2C2E1", "#F7E5A9", "#FFFDF9", "#B4CBB7"];
    const radius = 0.22;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      beads.push({
        id: `bead_${i}`,
        pos: [Math.cos(angle) * radius, 0.03, Math.sin(angle) * radius] as [number, number, number],
        color: colors[i % colors.length],
      });
    }
    return beads;
  }, []);

  // Compute a beautiful soft pastel sky color statically matching the selected theme color
  const skyColor = useMemo(() => {
    const temp = new THREE.Color(accentColor || "#F3A3B4");
    const hsl = { h: 0, s: 0, l: 0 };
    temp.getHSL(hsl);
    // Lower saturation and raise lightness to get a gorgeous soft backdrop tone
    return temp.setHSL(hsl.h, Math.min(0.55, hsl.s * 0.75), Math.min(0.96, hsl.l * 1.2));
  }, [accentColor]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // 1. Cozy pointLight breathing candle flicker (no random jitter, smooth sine waves)
    if (candleLightRef.current) {
      candleLightRef.current.intensity = 2.8 + Math.sin(elapsed * 7.5) * 0.15;
    }

    // 2. Click-to-wiggle Radio damping physics
    if (radioWiggle.current > 0.001) {
      radioWiggle.current = THREE.MathUtils.lerp(radioWiggle.current, 0, 0.1);
    }
    if (radioGroupRef.current) {
      const wiggleScale = radioWiggle.current * Math.sin(elapsed * 35) * 0.08;
      radioGroupRef.current.rotation.y = wiggleScale;
      radioGroupRef.current.scale.set(
        1.0 - radioWiggle.current * 0.04,
        1.0 + radioWiggle.current * 0.08,
        1.0 - radioWiggle.current * 0.04
      );
    }

    // 3. Sleeping Cat Breathing and ear twitches
    if (catGroupRef.current) {
      const breath = 1.0 + Math.sin(elapsed * 1.5) * 0.022;
      const isStretching = Math.sin(elapsed * 0.5) > 0.95;
      const stretchVal = isStretching ? 1.06 : 1.0;
      
      catGroupRef.current.scale.set(1.0, breath, stretchVal);
    }

    // Twitch ears on hover
    if (isCatHovered && catEarLRef.current && catEarRRef.current) {
      catEarLRef.current.rotation.z = Math.sin(elapsed * 40) * 0.2;
      catEarRRef.current.rotation.z = -Math.sin(elapsed * 40) * 0.2;
    } else if (catEarLRef.current && catEarRRef.current) {
      catEarLRef.current.rotation.z = 0;
      catEarRRef.current.rotation.z = 0;
    }

    // 4. Mini Person Head Tilt Tracker (Looks up when letter slides out)
    if (personHeadRef.current) {
      const targetPitch = isOpen ? -0.45 : -0.05; // tilt back when open to look up
      personHeadRef.current.rotation.x = THREE.MathUtils.lerp(personHeadRef.current.rotation.x, targetPitch, 0.06);
    }
    // Person breathing
    if (personGroupRef.current) {
      personGroupRef.current.scale.y = 1.0 + Math.sin(elapsed * 1.3) * 0.015;
    }
  });

  return (
    <group>
      {/* 1. DESK PLANE */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#F8F1E7" roughness={0.95} metalness={0.01} />
      </mesh>

      {/* 2. COZY CANDLE */}
      <group position={[3.5, -0.75, -2.4]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.5, 32]} />
          <meshStandardMaterial color="#FFF9E6" roughness={0.65} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
          <meshBasicMaterial color="#1A1512" />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#FFEAA7" toneMapped={false} />
        </mesh>
        <pointLight
          ref={candleLightRef}
          position={[0, 0.36, 0]}
          color="#FFE5B4"
          intensity={2.8}
          distance={15}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-bias={-0.0005}
        />
      </group>

      {/* 3. OPEN JOURNAL / DIARY */}
      <group position={[-1.2, -0.99, -2.0]} rotation={[-Math.PI / 2, 0, -0.1]}>
        <RoundedBox args={[3.2, 2.2, 0.06]} radius={0.02} smoothness={3} castShadow>
          <meshStandardMaterial color="#ECC6CE" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[1.5, 2.0, 0.04]} radius={0.01} smoothness={2} position={[-0.78, 0, 0.04]} castShadow>
          <meshStandardMaterial color="#FCFAF2" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[1.5, 2.0, 0.04]} radius={0.01} smoothness={2} position={[0.78, 0, 0.04]} castShadow>
          <meshStandardMaterial color="#FCFAF2" roughness={0.9} />
        </RoundedBox>
      </group>

      {/* 4. SAGE GREEN COFFEE MUG (Conditional) */}
      {deskConfig.mug && (
        <group position={[-3.5, -0.75, -2.0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
            <meshStandardMaterial color="#B4CBB7" roughness={0.5} />
          </mesh>
          <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.14, 0.04, 8, 24]} />
            <meshStandardMaterial color="#B4CBB7" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* 5. SLEEK PENCIL */}
      <group position={[-0.2, -0.97, -0.8]} rotation={[0, 0.8, Math.PI / 2 - 0.02]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.025, 0.025, 1.2, 12]} />
          <meshStandardMaterial color="#F7E5A9" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <coneGeometry args={[0.025, 0.08, 12]} />
          <meshStandardMaterial color="#EAD695" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <coneGeometry args={[0.01, 0.02, 12]} />
          <meshBasicMaterial color="#1A1512" />
        </mesh>
      </group>

      {/* 6. POTTED SUCCULENT PLANT */}
      <group position={[-4.5, -0.8, -2.5]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.13, 0.4, 16]} />
          <meshStandardMaterial color="#DCCBB1" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.02, 16]} />
          <meshStandardMaterial color="#5C4033" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.23, 0]} castShadow>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#B4CBB7" roughness={0.8} />
        </mesh>
        <mesh position={[0.07, 0.22, 0.04]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#B4CBB7" roughness={0.8} />
        </mesh>
        <mesh position={[-0.07, 0.22, -0.04]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#B4CBB7" roughness={0.8} />
        </mesh>
      </group>

      {/* 7. VINTAGE POLAROID CAMERA */}
      <group position={[-3.8, -0.75, 1.4]} rotation={[0, 0.45, 0]}>
        <RoundedBox args={[0.8, 0.52, 0.52]} radius={0.03} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFDF9" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
          <meshStandardMaterial color="#2C2520" roughness={0.4} />
        </mesh>
        <mesh position={[0.26, 0.18, 0.27]}>
          <boxGeometry args={[0.15, 0.1, 0.02]} />
          <meshStandardMaterial color="#EAEAEA" roughness={0.2} emissive="#FFFFFF" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* 8. CLOSED JOURNALS STACK */}
      <group position={[3.6, -0.92, -1.0]} rotation={[0, -0.25, 0]}>
        <RoundedBox args={[1.5, 0.16, 1.1]} radius={0.02} smoothness={3} position={[0, 0.08, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#B4CBB7" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[1.3, 0.12, 1.0]} radius={0.02} smoothness={3} position={[0.05, 0.22, 0.05]} rotation={[0, 0.15, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#F3A3B4" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* 9. WASHI TAPE ROLLS */}
      <group position={[1.8, -0.96, 1.4]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshStandardMaterial color="#F7E5A9" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, 0.12, -0.02]} rotation={[0.1, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 16]} />
          <meshStandardMaterial color="#ECC6CE" roughness={0.8} />
        </mesh>
      </group>

      {/* 10. SCATTERED POLAROIDS MAPPED TO PHOTOS */}
      <group position={[-3.4, -0.98, -0.6]} rotation={[-Math.PI / 2 + 0.06, 0.04, 0.32]}>
        <RoundedBox args={[pw, ph, thickness]} radius={0.02} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.15, thickness / 2 + 0.002]} receiveShadow>
          <planeGeometry args={[pw - 0.18, pw - 0.18]} />
          <meshStandardMaterial map={textures[0]} roughness={0.5} />
        </mesh>
        <RoundedBox args={[0.5, 0.14, 0.01]} radius={0.005} position={[-pw/2 + 0.15, ph/2 - 0.1, thickness / 2 + 0.01]} rotation={[0, 0, -0.5]}>
          <meshStandardMaterial color="#F7E5A9" transparent opacity={0.55} />
        </RoundedBox>
      </group>

      <group position={[2.6, -0.98, 0.8]} rotation={[-Math.PI / 2 + 0.08, -0.06, -0.42]}>
        <RoundedBox args={[pw, ph, thickness]} radius={0.02} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.15, thickness / 2 + 0.002]} receiveShadow>
          <planeGeometry args={[pw - 0.18, pw - 0.18]} />
          <meshStandardMaterial map={textures[1]} roughness={0.5} />
        </mesh>
        <RoundedBox args={[0.5, 0.14, 0.01]} radius={0.005} position={[0, ph/2 - 0.05, thickness / 2 + 0.01]} rotation={[0, 0, 0.2]}>
          <meshStandardMaterial color="#F3A3B4" transparent opacity={0.55} />
        </RoundedBox>
      </group>

      <group position={[-3.6, -0.98, 1.2]} rotation={[-Math.PI / 2 + 0.08, 0.08, 0.65]}>
        <RoundedBox args={[pw, ph, thickness]} radius={0.02} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.15, thickness / 2 + 0.002]}>
          <planeGeometry args={[pw - 0.18, pw - 0.18]} />
          <meshStandardMaterial map={textures[2]} roughness={0.5} />
        </mesh>
        <RoundedBox args={[0.5, 0.14, 0.01]} radius={0.005} position={[0, ph/2 - 0.05, thickness / 2 + 0.01]} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color="#B4CBB7" transparent opacity={0.55} />
        </RoundedBox>
      </group>

      <group position={[3.6, -0.98, -0.8]} rotation={[-Math.PI / 2 + 0.05, -0.05, -0.22]}>
        <RoundedBox args={[pw, ph, thickness]} radius={0.02} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, 0.15, thickness / 2 + 0.002]}>
          <planeGeometry args={[pw - 0.18, pw - 0.18]} />
          <meshStandardMaterial map={textures[3]} roughness={0.5} />
        </mesh>
        <RoundedBox args={[0.5, 0.14, 0.01]} radius={0.005} position={[-pw/2 + 0.15, ph/2 - 0.1, thickness / 2 + 0.01]} rotation={[0, 0, 0.4]}>
          <meshStandardMaterial color="#A2C2E1" transparent opacity={0.55} />
        </RoundedBox>
      </group>

      {/* 11. PRESSED FLOWER PETALS */}
      {flowerPetals.map((petal) => (
        <mesh key={petal.id} position={petal.pos} scale={[petal.scale, petal.scale, petal.scale * 0.2]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={petal.color} roughness={0.8} />
        </mesh>
      ))}

      {/* 12. COZY FAIRY STRING LIGHTS */}
      {stringLights.map((light) => (
        <group key={light.id} position={light.pos}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#FFEAA7" />
          </mesh>
          <pointLight color="#FFE5B4" intensity={0.4} distance={4} />
        </group>
      ))}

      {/* ========================================================
          CINEMATIC ADDITIONS
          ======================================================== */}

      {/* A. CONFIG-DRIVEN FRIENDSHIP BRACELET */}
      {deskConfig.bracelet && (
        <group position={[-0.4, -0.99, 1.2]} rotation={[0.05, 0.3, 0]}>
          {braceletBeads.map((bead) => (
            <mesh key={bead.id} position={bead.pos} castShadow>
              <sphereGeometry args={[0.038, 12, 12]} />
              <meshStandardMaterial color={bead.color} roughness={0.6} />
            </mesh>
          ))}
        </group>
      )}

      {/* B. CONFIG-DRIVEN RETRO MUSIC CASSETTE TAPE */}
      {deskConfig.cassette && (
        <group position={[1.4, -0.98, -0.6]} rotation={[-Math.PI / 2, 0, 0.45]}>
          <RoundedBox args={[0.7, 0.45, 0.032]} radius={0.015} smoothness={3} castShadow receiveShadow>
            <meshStandardMaterial color="#ECC6CE" roughness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.5, 0.26]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.8} />
          </mesh>
          {/* Left spool cutout */}
          <mesh position={[-0.14, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
            <meshBasicMaterial color="#2C2520" />
          </mesh>
          {/* Right spool cutout */}
          <mesh position={[0.14, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
            <meshBasicMaterial color="#2C2520" />
          </mesh>
        </group>
      )}

      {/* C. CONFIG-DRIVEN MOVIE TICKETS */}
      {deskConfig.tickets && (
        <group position={[-1.6, -0.98, 0.6]} rotation={[-Math.PI / 2, 0, -0.45]}>
          <mesh position={[0, 0, 0.002]} rotation={[0, 0, 0.1]} castShadow>
            <planeGeometry args={[0.42, 0.8]} />
            <meshStandardMaterial color="#F7E5A9" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.05, -0.05, 0.001]} rotation={[0, 0, -0.1]} castShadow>
            <planeGeometry args={[0.42, 0.8]} />
            <meshStandardMaterial color="#ECC6CE" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* D. INTERACTIVE 3D RETRO DESK RADIO */}
      <group 
        ref={radioGroupRef} 
        position={[2.0, -0.78, -2.4]}
        rotation={[0, -0.4, 0]}
        onClick={handleRadioClick}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}
      >
        <RoundedBox args={[0.7, 0.44, 0.32]} radius={0.025} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#C8B498" roughness={0.65} />
        </RoundedBox>
        <mesh position={[-0.14, 0, 0.17]}>
          <planeGeometry args={[0.26, 0.3]} />
          <meshStandardMaterial color="#2C2520" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.17]}>
          <planeGeometry args={[0.22, 0.22]} />
          <meshStandardMaterial color="#F9EBC5" roughness={0.7} />
        </mesh>
        <mesh position={[0.12, -0.12, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.04, 16]} />
          <meshStandardMaterial color="#2C2520" roughness={0.5} />
        </mesh>
        <mesh position={[0.24, -0.12, 0.18]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.04, 16]} />
          <meshStandardMaterial color="#2C2520" roughness={0.5} />
        </mesh>
      </group>

      {/* E. MINIMALIST CERAMIC SLEEPING CAT COMPANION */}
      {deskConfig.pet === "cat" && (
        <group 
          ref={catGroupRef}
          position={[-2.7, -0.84, -0.6]} 
          rotation={[0, 0.8, 0]}
          onPointerOver={() => setIsCatHovered(true)}
          onPointerOut={() => setIsCatHovered(false)}
        >
          <RoundedBox args={[0.54, 0.32, 0.32]} radius={0.12} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} metalness={0.04} />
          </RoundedBox>
          <RoundedBox args={[0.25, 0.25, 0.23]} radius={0.08} smoothness={4} position={[-0.26, 0.06, 0.02]} castShadow>
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} metalness={0.04} />
          </RoundedBox>
          <mesh ref={catEarLRef} position={[-0.32, 0.19, 0.06]}>
            <coneGeometry args={[0.04, 0.08, 4]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
          </mesh>
          <mesh ref={catEarRRef} position={[-0.24, 0.19, -0.06]}>
            <coneGeometry args={[0.04, 0.08, 4]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
          </mesh>
          <RoundedBox args={[0.3, 0.06, 0.06]} radius={0.025} position={[0.26, -0.1, -0.1]} rotation={[0, -0.4, 0]} castShadow>
            <meshStandardMaterial color="#FFFDF9" roughness={0.75} />
          </RoundedBox>
        </group>
      )}

      {/* G. MINI FACELESS PERSON figurines */}
      <group 
        ref={personGroupRef}
        position={[-2.4, -0.99, 0.9]} 
        rotation={[0, 1.0, 0]}
      >
        {/* Clay Sitting Torso */}
        <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.14, 0.38, 16]} />
          <meshStandardMaterial color="#E4BAC3" roughness={0.8} />
        </mesh>
        {/* Faceless Head Sphere */}
        <mesh ref={personHeadRef} position={[0, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.8} />
        </mesh>
        {/* Left Curled Leg */}
        <mesh position={[-0.08, 0.03, 0.08]} rotation={[Math.PI / 2, 0.3, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.26, 8]} />
          <meshStandardMaterial color="#E4BAC3" roughness={0.8} />
        </mesh>
        {/* Right Curled Leg */}
        <mesh position={[0.08, 0.03, 0.08]} rotation={[Math.PI / 2, -0.3, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.26, 8]} />
          <meshStandardMaterial color="#E4BAC3" roughness={0.8} />
        </mesh>
        {/* Left Resting Arm */}
        <mesh position={[-0.11, 0.22, 0.08]} rotation={[0.4, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.25, 8]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.8} />
        </mesh>
        {/* Right Resting Arm */}
        <mesh position={[0.11, 0.22, 0.08]} rotation={[0.4, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.25, 8]} />
          <meshStandardMaterial color="#FFFDF9" roughness={0.8} />
        </mesh>
      </group>

      {/* F. ROOM WINDOW & ANIMATED OUTSIDE SKY BACKGROUND (Synced with selected accent color) */}
      <group position={[0, 2.5, -4.5]}>
        {/* Sky gradient background plane */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[10, 7]} />
          <meshBasicMaterial color={skyColor} />
        </mesh>
        
        {/* Wooden window frame outer border */}
        <RoundedBox args={[7.2, 5.0, 0.08]} radius={0.02} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color="#DCD1C0" roughness={0.85} />
        </RoundedBox>
        
        {/* Wooden window frame dividers */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.08, 5.0, 0.04]} />
          <meshStandardMaterial color="#DCD1C0" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[7.2, 0.08, 0.04]} />
          <meshStandardMaterial color="#DCD1C0" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
};
