"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Play, Pause, ChevronDown } from "lucide-react";
import { friendshipConfig } from "@/config/friendship";

// --- TYPES & CONSTANTS ---
type SceneStage = 
  | "transition-entry" // Capsule glow -> particles -> fading in room
  | "room-reveal"      // Medium-wide shot establishing the room
  | "camera-focus"     // Camera slowly settles near the photograph
  | "waiting-for-tap"  // Static state with handwritten tap instruction
  | "photo-lifting"    // Clicking/tapping triggers pick up, darken, zoom
  | "living-memory"    // Memory environment comes alive, breathing
  | "final-messages";  // Showing caption, message, and signature

interface ThemePreset {
  bgGradient: string;
  ambientColor: string;
  lampColor: string;
  accentColor: string;
  particleColor: string;
}

const THEME_PRESETS: Record<string, ThemePreset> = {
  friendship: {
    bgGradient: "radial-gradient(circle at 50% 50%, #FCFAF6 0%, #FAF1E6 60%, #EADDC9 100%)",
    ambientColor: "#FAF1E7",
    lampColor: "#FCD5B5",
    accentColor: "#FAF5EB",
    particleColor: "#F7E5A9"
  },
  dark: {
    bgGradient: "radial-gradient(circle at 50% 50%, #0F172A 0%, #020617 100%)",
    ambientColor: "#1E293B",
    lampColor: "#EC4899",
    accentColor: "#0F172A",
    particleColor: "#38BDF8"
  },
  love: {
    bgGradient: "radial-gradient(circle at 50% 50%, #FCFAF5 0%, #F9EBEF 60%, #E2C4C9 100%)",
    ambientColor: "#FAF1E7",
    lampColor: "#F3A3B4",
    accentColor: "#F9EBEF",
    particleColor: "#F3A3B4"
  },
  birthday: {
    bgGradient: "radial-gradient(circle at 50% 50%, #FDFCF7 0%, #FAF6EB 60%, #E5DFCF 100%)",
    ambientColor: "#FFFDF0",
    lampColor: "#FCD5B5",
    accentColor: "#FAF6EB",
    particleColor: "#DFD8C4"
  },
  anniversary: {
    bgGradient: "radial-gradient(circle at 50% 50%, #FCFAF6 0%, #FAF1E6 60%, #EADDC9 100%)",
    ambientColor: "#FAF1E7",
    lampColor: "#FCD5B5",
    accentColor: "#FAF5EB",
    particleColor: "#FAF1E7"
  },
  family: {
    bgGradient: "radial-gradient(circle at 50% 50%, #FBF9F6 0%, #F5EFE6 60%, #DFD5C6 100%)",
    ambientColor: "#F5EFE6",
    lampColor: "#EADDC9",
    accentColor: "#FBF9F6",
    particleColor: "#EADDC9"
  }
};

const DEFAULT_PRESET: ThemePreset = {
  bgGradient: "radial-gradient(circle at 50% 50%, #FCFAF6 0%, #FAF1E6 60%, #EADDC9 100%)",
  ambientColor: "#FAF1E7",
  lampColor: "#FCD5B5",
  accentColor: "#FAF5EB",
  particleColor: "#F7E5A9"
};

// --- SUB-COMPONENTS (3D) ---

// Camera choreography that drives the interactive sequence
const DreamCamera: React.FC<{ stage: SceneStage }> = ({ stage }) => {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 3.5, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.5, 0));

  useFrame(() => {
    const isMobile = size.width < 768;

    switch (stage) {
      case "transition-entry":
        // Distant wide starting position
        targetPos.current.set(0, 3.8, isMobile ? 15 : 12);
        targetLookAt.current.set(0, 1.2, 0);
        break;
      case "room-reveal":
        // Medium shot panning down
        targetPos.current.set(isMobile ? 1.0 : 0.6, isMobile ? 2.5 : 2.4, isMobile ? 7.8 : 6.2);
        targetLookAt.current.set(isMobile ? 1.8 : 1.4, isMobile ? 1.25 : 1.3, -1.0);
        break;
      case "camera-focus":
      case "waiting-for-tap":
        // Dolly close to the table holding the hero photo
        targetPos.current.set(isMobile ? 2.0 : 1.6, isMobile ? 1.62 : 1.7, isMobile ? 4.4 : 3.2);
        targetLookAt.current.set(2.25, 1.25, -1.0);
        break;
      case "photo-lifting":
      case "living-memory":
      case "final-messages":
        // Zoom fully into the photo plane to transition into the memory
        targetPos.current.set(2.21, 1.34, isMobile ? -0.2 : -0.6);
        targetLookAt.current.set(2.25, 1.33, -1.0);
        break;
    }

    // Smooth breathing offset in final/idle states
    if (stage === "waiting-for-tap" || stage === "living-memory" || stage === "final-messages") {
      const time = Date.now() * 0.00035;
      targetPos.current.x += Math.sin(time) * 0.0025;
      targetPos.current.y += Math.cos(time * 0.8) * 0.0018;
    }

    camera.position.lerp(targetPos.current, 0.03);

    // Dynamic lookAt calculation
    const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.03);
    camera.lookAt(currentLookAt);
  });

  return null;
};

// Simplified Cozy room with a desk, window, swaying curtains, and meaningful objects
const QuietRoom: React.FC<{ 
  stage: SceneStage; 
  preset: ThemePreset;
  heroPhotoTexture: THREE.Texture;
  onPhotoClick: () => void;
}> = ({ stage, preset, heroPhotoTexture, onPhotoClick }) => {
  const curtainLeftRef = useRef<THREE.Mesh>(null);
  const curtainRightRef = useRef<THREE.Mesh>(null);
  const photoRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Sway curtains gently
    if (curtainLeftRef.current) {
      curtainLeftRef.current.rotation.y = Math.sin(t * 1.1) * 0.035;
    }
    if (curtainRightRef.current) {
      curtainRightRef.current.rotation.y = -Math.sin(t * 1.1) * 0.035;
    }

    // Photo breathing float when waiting on desk
    if (photoRef.current) {
      if (stage === "room-reveal" || stage === "camera-focus" || stage === "waiting-for-tap") {
        photoRef.current.position.y = 1.32 + Math.sin(t * 1.2) * 0.02;
        photoRef.current.rotation.y = 0.1 + Math.cos(t * 0.6) * 0.02;
      } else if (stage === "photo-lifting" || stage === "living-memory") {
        // Face the camera directly during presentation
        photoRef.current.position.y = THREE.MathUtils.lerp(photoRef.current.position.y, 1.34, 0.05);
        photoRef.current.rotation.y = THREE.MathUtils.lerp(photoRef.current.rotation.y, 0, 0.05);
      }
    }
  });

  const isLivingMemory = stage === "living-memory" || stage === "final-messages" || stage === "photo-lifting";

  return (
    <group>
      {/* Floor & Walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color="#FAF5EB" roughness={0.8} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, 4.5, -4.5]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial color="#FDFBF7" roughness={0.9} />
      </mesh>

      {/* Side Wall */}
      <mesh position={[8, 4.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial color="#FCFAF5" roughness={0.9} />
      </mesh>

      {/* Cozy Table Desk */}
      <group position={[2.25, 0, -1.0]}>
        <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 1.2, 1.4]} />
          <meshStandardMaterial color="#8C7D70" roughness={0.7} />
        </mesh>

        {/* The Lamp */}
        <group position={[-0.4, 1.2, -0.3]}>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.1, 16]} />
            <meshStandardMaterial color="#DFD8C4" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.3, 0.5, 16]} />
            <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
          </mesh>
          <pointLight 
            position={[0, 0.45, 0]} 
            color={preset.lampColor} 
            intensity={isLivingMemory ? 0.3 : 1.6} 
            distance={5} 
            castShadow
          />
        </group>

        {/* Meaningful Object (Empty Memory Capsule) */}
        <group position={[0.4, 1.25, 0.3]} rotation={[0, -0.4, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
            <meshPhysicalMaterial 
              color="#FFF" 
              transparent 
              opacity={0.3} 
              roughness={0.05} 
              transmission={0.9} 
              thickness={0.15} 
            />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <sphereGeometry args={[0.075, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#F3A3B4" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.07, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.075, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#EADDC9" roughness={0.4} />
          </mesh>
        </group>

        {/* Hero Polaroid Photograph */}
        <group ref={photoRef} onClick={onPhotoClick} position={[0, 1.32, -0.3]} rotation={[0, 0.1, 0]}>
          {/* Polaroid white backing */}
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.88, 0.04]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {/* Inner image */}
          <mesh position={[0, 0.08, 0.021]}>
            <planeGeometry args={[0.64, 0.62]} />
            <meshStandardMaterial 
              map={heroPhotoTexture} 
              roughness={0.15} 
              color={isLivingMemory ? "#FFF" : "#EEE"}
            />
          </mesh>
          {/* Subtle highlight light when waiting for interaction */}
          {stage === "waiting-for-tap" && (
            <pointLight position={[0, 0.1, 0.2]} color={preset.lampColor} intensity={1.2} distance={0.8} />
          )}
        </group>
      </group>

      {/* Window letting light stream in */}
      <group position={[0, 5.0, -4.4]}>
        <mesh>
          <boxGeometry args={[3.2, 4.2, 0.1]} />
          <meshStandardMaterial color="#DFD8C4" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.9, 3.9]} />
          <meshPhysicalMaterial color="#E6F2F7" transparent opacity={0.3} transmission={0.95} />
        </mesh>
        {/* swaying curtains */}
        <mesh ref={curtainLeftRef} position={[-1.4, 0, 0.15]} castShadow>
          <boxGeometry args={[0.06, 4.0, 0.8]} />
          <meshStandardMaterial color="#FFFDF9" transparent opacity={0.7} roughness={0.9} />
        </mesh>
        <mesh ref={curtainRightRef} position={[1.4, 0, 0.15]} castShadow>
          <boxGeometry args={[0.06, 4.0, 0.8]} />
          <meshStandardMaterial color="#FFFDF9" transparent opacity={0.7} roughness={0.9} />
        </mesh>
      </group>

      {/* Shadow backing / general light darkening logic */}
      {isLivingMemory && (
        <ambientLight intensity={0.15} />
      )}
    </group>
  );
};

// Breathing visual response matching the café theme
const LivingCafeMemory: React.FC = () => {
  return (
    <group position={[2.25, 1.45, -1.05]}>
      {/* Light drifting particles from hot coffee steam */}
      <Sparkles count={15} scale={1.2} size={1.2} speed={0.4} color="#EADDC9" />
      <pointLight position={[0, 0, 0.1]} color="#FCD5B5" intensity={0.8} distance={1.2} />
    </group>
  );
};

// Reduced motion detector
const usePrefersReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);
  return reducedMotion;
};

// --- MAIN WRAPPER COMPONENT ---
interface MemorySkySceneProps {
  onContinue: () => void;
}

export const MemorySkyScene: React.FC<MemorySkySceneProps> = ({ onContinue }) => {
  const [stage, setStage] = useState<SceneStage>("transition-entry");
  const [fadedOverlay, setFadedOverlay] = useState(true);
  const [typedTitleIndex, setTypedTitleIndex] = useState(0);

  const config = friendshipConfig.page6;
  const memories = friendshipConfig.memories || friendshipConfig.hero.polaroids;
  const heroPhotoUrl = memories[config.heroMemoryIndex]?.src || "/images/gallery_1.png";

  const prefersReducedMotion = usePrefersReducedMotion();


  // Load appropriate theme presets
  const themeKey = friendshipConfig.theme || "friendship";
  const themePreset = THEME_PRESETS[themeKey] || DEFAULT_PRESET;

  // Pre-load hero photo texture
  const textureLoader = useRef(new THREE.TextureLoader());
  const [heroTexture, setHeroTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    textureLoader.current.load(heroPhotoUrl, (tex) => {
      setHeroTexture(tex);
    });
  }, [heroPhotoUrl]);

  // Choreographing step transitions
  useEffect(() => {
    if (prefersReducedMotion) {
      setFadedOverlay(false);
      setStage("waiting-for-tap");
      return;
    }

    // 1. Mount transitions
    const t0 = setTimeout(() => {
      setFadedOverlay(false);
      setStage("room-reveal");
    }, 1500);

    // 2. Slow dolly camera close to photo
    const t1 = setTimeout(() => {
      setStage("camera-focus");
    }, 4500);

    // 3. Stop and wait for user tap interaction
    const t2 = setTimeout(() => {
      setStage("waiting-for-tap");
    }, 7000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [prefersReducedMotion]);

  // Photo Click Interaction
  const handlePhotoClick = () => {
    if (stage !== "waiting-for-tap") return;
    
    // Play paper pickup sound from context if available
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}

    setStage("photo-lifting");

    // Transition photo into living memory representation
    setTimeout(() => {
      setStage("living-memory");
    }, 1200);

    // Display messages
    setTimeout(() => {
      setStage("final-messages");
    }, 3200);
  };

  return (
    <div 
      className="relative w-full h-dvh overflow-hidden select-none transition-all duration-[3000ms]"
      style={{ background: themePreset.bgGradient }}
    >
      
      {/* 3D WebGL Canvas */}
      {heroTexture && (
        <Canvas 
          shadows
          camera={{ position: [0, 3.5, 10], fov: 40 }}
          className="w-full h-full relative z-0 pointer-events-auto"
        >
          {/* Dynamic soft ambient light */}
          <ambientLight intensity={stage === "living-memory" ? 0.35 : 0.8} color={themePreset.ambientColor} />
          
          <directionalLight 
            castShadow 
            position={[4, 8, 3]} 
            intensity={stage === "living-memory" ? 0.4 : 1.1} 
            color={themePreset.ambientColor}
          />

          {/* Dream Camera & Cozy Room */}
          <group>
            <DreamCamera stage={stage} />
            <QuietRoom 
              stage={stage} 
              preset={themePreset} 
              heroPhotoTexture={heroTexture} 
              onPhotoClick={handlePhotoClick} 
            />
            {/* The photo breathing effect */}
            {stage === "living-memory" && <LivingCafeMemory />}
          </group>

          {/* Floating dust particles system */}
          <Sparkles 
            count={prefersReducedMotion ? 12 : 45} 
            scale={8} 
            size={1.5} 
            speed={0.25} 
            color={themePreset.particleColor} 
          />
        </Canvas>
      )}

      {/* --- DOM OVERLAYS --- */}

      {/* Entry glow / falling asleep transition */}
      <AnimatePresence>
        {fadedOverlay && (
          <motion.div 
            className="fixed inset-0 bg-[#FCFAF6] z-50 flex flex-col items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <motion.p 
              className="font-handwritten text-xl text-text-ink/40 italic"
              animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              loading final memory...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hand Written Instruction floating overlay */}
      <AnimatePresence>
        {stage === "waiting-for-tap" && (
          <motion.div 
            className="absolute bottom-[28%] left-0 right-0 flex justify-center pointer-events-none z-30"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.2 }}
          >
            <button 
              onClick={handlePhotoClick}
              className="font-handwritten text-2xl text-accent-pink font-extrabold italic animate-pulse cursor-pointer pointer-events-auto bg-[#FFFDF9]/60 px-4 py-1.5 rounded-full shadow-xs"
            >
              {config.instruction}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final reveal message layout */}
      <AnimatePresence>
        {(stage === "living-memory" || stage === "final-messages") && (
          <motion.div 
            className="absolute bottom-[10%] left-0 right-0 flex flex-col items-center justify-end px-6 z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
          >
            {/* Caption */}
            <h3 className="font-handwritten text-2xl md:text-3xl text-accent-pink font-extrabold italic mb-4 drop-shadow-sm select-none">
              {config.caption}
            </h3>

            {/* Main message card appearing slightly later */}
            {stage === "final-messages" && (
              <motion.div 
                className={`backdrop-blur-xs border shadow-2xl p-8 rounded-sm max-w-md text-center pointer-events-auto flex flex-col font-handwritten relative transition-colors duration-500 ${
                  themeKey === "dark" 
                    ? "bg-zinc-900/90 border-zinc-800/80 text-zinc-100" 
                    : "bg-[#FCFAF5]/90 border-[#E9DFB9]/70 text-text-ink"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.8 }}
              >
                {/* Accent tape */}
                <div className={`absolute top-[-10px] left-[35%] w-24 h-4 pointer-events-none rotate-[1.5deg] border border-dashed ${
                  themeKey === "dark"
                    ? "bg-accent-pink/20 border-accent-pink/10"
                    : "bg-accent-yellow/40 border-accent-yellow/10"
                }`} />

                <h2 className={`text-2xl md:text-3xl font-extrabold leading-relaxed mb-4 ${
                  themeKey === "dark" ? "text-zinc-100" : "text-text-ink/90"
                }`}>
                  {config.finalMessage}
                </h2>
                
                {config.finalSubtext && (
                  <p className={`text-lg md:text-xl font-bold leading-normal mb-4 ${
                    themeKey === "dark" ? "text-zinc-400" : "text-[#8C7D70]"
                  }`}>
                    {config.finalSubtext}
                  </p>
                )}

                <span className="text-xl md:text-2xl text-accent-pink font-black text-right mt-2 pr-2">
                  {config.signature}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>



      {/* Chevron down Replay/Restart Button at bottom */}
      <button 
        onClick={() => window.location.reload()}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/20 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg animate-bounce pointer-events-auto"
        aria-label="Restart Experience"
      >
        <ChevronDown size={18} className="text-white" />
      </button>

    </div>
  );
};
