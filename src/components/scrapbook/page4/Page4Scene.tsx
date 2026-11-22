"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { friendshipConfig } from "@/config/friendship";
import { page2Config } from "@/config/modules/page2";
import { Doodle } from "@/components/scrapbook/Doodle";
import { Sticker } from "@/components/scrapbook/Sticker";
import { Tape } from "@/components/scrapbook/Tape";

// --- HELPERS ---
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

// --- SUB-COMPONENTS ---

// 3D Photo Globe Components (Billboards always facing camera to prevent edge-on slivers)
interface GlobeCardProps {
  src: string;
  position: [number, number, number];
}

const GlobeCard: React.FC<GlobeCardProps> = ({ src, position }) => {
  return (
    <Html position={position} distanceFactor={4.5} occlude={false}>
      <motion.div
        className="w-14 h-[72px] bg-white p-1.5 border border-zinc-200 shadow-md flex flex-col justify-between rounded-xs pointer-events-auto cursor-pointer select-none"
        whileHover={{ scale: 1.15 }}
      >
        <div className="w-full aspect-square bg-zinc-150 overflow-hidden rounded-xs">
          <img src={src} className="w-full h-full object-cover pointer-events-none" alt="" />
        </div>
        <span className="font-handwritten text-[7px] text-center font-black select-none text-accent-pink mt-0.5 block">
          ♡
        </span>
      </motion.div>
    </Html>
  );
};

const RotatingGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.006;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00025) * 0.1;
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

export const PhotoGlobe3D: React.FC = () => {
  // Use images from config
  const images = page2Config.polaroids.map(p => p.src);
  
  // Coordinate positions on a sphere
  const points: [number, number, number][] = [
    [0, 1.2, 0],
    [1.0, 0.3, 0.6],
    [-1.0, 0.3, -0.6],
    [0.6, -0.4, 1.0],
    [-0.6, -0.4, -1.0],
    [-0.8, 0.3, 0.8],
    [0.8, 0.3, -0.8],
    [0, -1.2, 0],
  ];

  return (
    <div className="w-full h-36 md:h-44 relative my-2.5 pointer-events-auto z-20 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <RotatingGroup>
          {images.map((src, idx) => {
            const pos = points[idx % points.length];
            return <GlobeCard key={idx} src={src} position={pos} />;
          })}
        </RotatingGroup>
      </Canvas>
    </div>
  );
};

// 1. LetterBackground: Candlelight glow with flicker & floating dust/fibers/sparkles
export const LetterBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#FAF7F2]">
      {/* Candlelight / Sunset warm light drifting & flickering */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background: "radial-gradient(circle at var(--light-x, 50%) var(--light-y, 50%), #FCD5B5 0%, #FAF1E7 50%, transparent 80%)",
          animation: "lightFloat 24s ease-in-out infinite alternate, candleFlicker 4s ease-in-out infinite alternate",
        }}
      />

      {/* Floating dust/paper fibers & small sparkling dots */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#8C7D70]/10"
            style={{
              width: i % 3 === 0 ? "4px" : i % 3 === 1 ? "2px" : "1.5px",
              height: i % 3 === 0 ? "4px" : i % 3 === 1 ? "6px" : "1.5px",
              backgroundColor: i % 4 === 0 ? "#F3A3B4" : i % 4 === 1 ? "#F7E5A9" : "#8C7D70",
              opacity: i % 3 === 0 ? 0.25 : 0.15,
              borderRadius: "50%",
              top: `${10 + i * 8}%`,
              left: `${5 + (i * 17) % 90}%`,
            }}
            animate={{
              y: [0, -70, -140],
              x: [0, Math.sin(i) * 20, 0],
              scale: i % 3 === 0 ? [1, 1.4, 1] : 1,
              opacity: [0, 0.45, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes lightFloat {
          0% { --light-x: 35%; --light-y: 35%; }
          50% { --light-x: 65%; --light-y: 40%; }
          100% { --light-x: 40%; --light-y: 65%; }
        }
        @keyframes candleFlicker {
          0% { opacity: 0.32; filter: brightness(0.98); }
          25% { opacity: 0.36; filter: brightness(1.01); }
          50% { opacity: 0.34; filter: brightness(0.99); }
          75% { opacity: 0.38; filter: brightness(1.02); }
          100% { opacity: 0.33; filter: brightness(0.97); }
        }
      `}</style>
    </div>
  );
};

// 2. IntroText: "one more thing..."
interface IntroTextProps {
  visible: boolean;
}
export const IntroText: React.FC<IntroTextProps> = ({ visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-[12%] text-center z-10 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 1.0 }}
        >
          <span className={`font-handwritten text-2xl md:text-3xl italic select-none ${
            friendshipConfig.theme === "dark" ? "text-zinc-300" : "text-text-ink"
          }`}>
            {friendshipConfig.page4.openingLine}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 3. Interactive Letter with Typewriter & 3D Tilt Parallax & Smooth Drag
interface LetterProps {
  onRevealFinish: () => void;
  isOpened: boolean;
  onReplayReveal?: boolean;
}
export const Letter: React.FC<LetterProps> = ({ onRevealFinish, isOpened, onReplayReveal }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Typewriting states
  const [typedGreeting, setTypedGreeting] = useState("");
  const [typedParagraphs, setTypedParagraphs] = useState<string[]>([]);
  const [typedSignature, setTypedSignature] = useState("");
  const [isDone, setIsDone] = useState(false);

  // Folded Corner State
  const [cornerUnfolded, setCornerUnfolded] = useState(false);

  // Parallax motion variables (relative to window center to eliminate client-rect feedback loops / jitter)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXSpring = useSpring(useTransform(mouseY, [-400, 400], [5, -5]), { stiffness: 90, damping: 20 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-400, 400], [-5, 5]), { stiffness: 90, damping: 20 });

  const letterRef = useRef<HTMLDivElement>(null);

  // Track cursor position globally relative to viewport center (prevents feedback loop jitter / blurring)
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  // Reset function to clear and restart animations
  const runTypewriter = () => {
    setIsDone(false);
    setTypedGreeting("");
    setTypedParagraphs([]);
    setTypedSignature("");
    setCornerUnfolded(false);

    const config = friendshipConfig.page4;
    const greetingText = `Dear ${config.recipient},`;
    
    if (prefersReducedMotion) {
      setTypedGreeting(greetingText);
      setTypedParagraphs(config.paragraphs);
      setTypedSignature(config.signature);
      setIsDone(true);
      onRevealFinish();
      return;
    }

    let isCancelled = false;

    const typeString = (text: string, onChar: (typed: string) => void, speed: number = 10): Promise<void> => {
      return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          if (isCancelled) {
            clearInterval(interval);
            resolve();
            return;
          }
          onChar(text.slice(0, i + 1));
          i++;
          if (i >= text.length) {
            clearInterval(interval);
            resolve();
          }
        }, speed);
      });
    };

    const runSeq = async () => {
      await typeString(greetingText, setTypedGreeting, 50);
      if (isCancelled) return;
      
      for (let pIdx = 0; pIdx < config.paragraphs.length; pIdx++) {
        setTypedParagraphs((prev) => [...prev, ""]);
        await typeString(
          config.paragraphs[pIdx],
          (val) => {
            setTypedParagraphs((prev) => {
              const next = [...prev];
              next[pIdx] = val;
              return next;
            });
          },
          25
        );
        if (isCancelled) return;
      }
      
      await typeString(config.signature, setTypedSignature, 40);
      if (isCancelled) return;
      
      setIsDone(true);
      onRevealFinish();
    };

    runSeq();

    return () => {
      isCancelled = true;
    };
  };

  useEffect(() => {
    if (isOpened) {
      const cleanup = runTypewriter();
      return cleanup;
    }
  }, [isOpened, onReplayReveal]);

  return (
    <motion.div
      ref={letterRef}
      className={`relative bg-[#FCFAF5] w-[min(90vw,620px)] rounded-[3px] border border-[#E9DFB9]/70 p-4 md:p-12 text-left pointer-events-auto flex flex-col font-handwritten select-text select-none md:select-auto ${
        isMobile ? "" : "cursor-grab active:cursor-grabbing"
      }`}
      style={{
        boxShadow: "0 10px 30px rgba(44,37,32,0.06), 0 1px 3px rgba(44,37,32,0.03)",
        rotateX: isMobile ? 0 : rotateXSpring,
        rotateY: isMobile ? 0 : rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      // GPU accelerated drag handled by framer motion to avoid jitter or blur
      drag={!isMobile}
      dragConstraints={{ left: -60, right: 60, top: -60, bottom: 60 }}
      dragElastic={0.15}
      dragMomentum={true}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Red line margin */}
      <div className="absolute top-0 bottom-0 left-5 md:left-14 w-[1px] bg-accent-pink/15 pointer-events-none" />

      {/* Tactile paper texture background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-multiply rounded-[3px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />


      {/* 3D Rotating Globe of images */}
      <PhotoGlobe3D />

      {/* Main Content inside paper */}
      <div className="pl-4 md:pl-10 relative z-10 flex-grow max-h-none md:max-h-[55dvh] md:overflow-y-auto pr-2">
        <h2 className="text-xl md:text-3xl font-extrabold text-text-ink/90 mb-5 min-h-[30px]">
          {typedGreeting}
        </h2>

        <div className="space-y-4 text-[15px] md:text-2xl text-text-ink/80 leading-relaxed font-semibold">
          {typedParagraphs.map((para, idx) => (
            <p key={idx} className="min-h-[22px]">
              {para}
            </p>
          ))}
        </div>

        <div className="mt-6 text-right text-lg md:text-2xl font-extrabold text-accent-pink/90 min-h-[28px] pr-2">
          {typedSignature}
        </div>
      </div>

      {/* PSST... HIDDEN CORNER SURPRISE */}
      {isDone && (
        <div className="absolute bottom-0 right-0 z-30 pointer-events-auto">
          <motion.button
            onClick={() => setCornerUnfolded(!cornerUnfolded)}
            className="absolute bottom-0 right-0 w-12 h-12 bg-transparent select-none cursor-pointer flex items-end justify-end group p-1"
            aria-label="Reveal secret message"
          >
            <motion.div
              className="absolute bottom-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-transparent border-l-transparent shadow-xs"
              style={{
                borderRight: "32px solid #FAF6EB",
                borderBottom: "32px solid #FAF6EB",
                transformOrigin: "bottom right",
              }}
              animate={cornerUnfolded ? { rotate: -180, scale: 0, opacity: 0 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-0 h-0 border-t-[32px] border-r-[32px] border-t-[#DFD7BF]/30 border-r-transparent pointer-events-none"
              animate={cornerUnfolded ? { rotate: -180, scale: 0, opacity: 0 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            />

            {!cornerUnfolded && (
              <span className="font-handwritten text-[10px] text-accent-pink/60 rotate-[-45deg] mr-2 mb-2 group-hover:scale-105 transition-transform">
                psst...
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {cornerUnfolded && (
              <motion.div
                className="absolute bottom-3 right-6 bg-[#FEF9E7] border border-[#E9DFB9] rounded-sm p-3.5 shadow-md w-[220px] rotate-[-2deg] select-text z-20 pointer-events-auto"
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 150 }}
              >
                <div className="absolute top-[-8px] left-[40%] w-6 h-3 bg-accent-yellow/40 pointer-events-none rotate-[10deg] border border-dashed border-accent-yellow/10" />
                <p className="font-handwritten text-sm text-text-ink/80 leading-normal">
                  {friendshipConfig.page4.closingMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN PAGE 4 SCENE ---
interface Page4SceneProps {
  onReplay: () => void;
  onBackToDesk: () => void;
  onContinue?: () => void;
}

export const Page4Scene: React.FC<Page4SceneProps> = ({ onReplay, onBackToDesk, onContinue }) => {
  // Opening animation stages: "closed" -> "open-flap" -> "slide-out" -> "unfolded"
  const [animationStage, setAnimationStage] = useState<"closed" | "open-flap" | "slide-out" | "unfolded">("closed");
  const [revealFinished, setRevealFinished] = useState(false);
  const [replayTrigger, setReplayTrigger] = useState(false);
  const [sealPulse, setSealPulse] = useState(true);
  const [isFoldingExit, setIsFoldingExit] = useState(false);

  // Pulse effect on the wax seal while closed
  useEffect(() => {
    if (animationStage !== "closed") return;
    const interval = setInterval(() => {
      setSealPulse((p) => !p);
    }, 2800);
    return () => clearInterval(interval);
  }, [animationStage]);

  // Orchestrate the envelope opening sequence
  const handleOpenEnvelope = () => {
    if (animationStage !== "closed" || isFoldingExit) return;
    setAnimationStage("open-flap");
    setTimeout(() => {
      setAnimationStage("slide-out");
    }, 850);
    setTimeout(() => {
      setAnimationStage("unfolded");
    }, 2050);
  };

  const handleRevealFinish = () => {
    setTimeout(() => {
      setRevealFinished(true);
    }, 2000);
  };

  const handleReadAgain = () => {
    setRevealFinished(false);
    setReplayTrigger((t) => !t);
  };

  // exit sequence: folds letter, closes flap, pulls back camera
  const handleContinueTransition = () => {
    if (!onContinue) {
      onReplay();
      return;
    }
    setIsFoldingExit(true);
    setRevealFinished(false);
    
    // Step 1: Slide letter back into slot
    setAnimationStage("slide-out");
    
    // Step 2: Push envelope flap open flap
    setTimeout(() => {
      setAnimationStage("open-flap");
    }, 1000);

    // Step 3: Close flap
    setTimeout(() => {
      setAnimationStage("closed");
    }, 1800);

    // Step 4: Finalize transition callback
    setTimeout(() => {
      onContinue();
    }, 2800);
  };

  const firstMemoryPhoto = friendshipConfig.hero.polaroids[0];

  return (
    <motion.div 
      className="relative w-full h-dvh flex flex-col md:flex-row items-center justify-start md:justify-center overflow-y-auto md:overflow-hidden py-10 pb-24 md:pb-10 px-4 select-none"
      animate={isFoldingExit ? { scale: 0.82, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* 1. tactile ambient backdrop */}
      <LetterBackground />

      {/* 2. Intro text ("one more thing...") */}
      <IntroText visible={animationStage === "closed"} />

      {/* 3. AESTHETICS & CUTE BACKGROUND OBJECTS */}
      <AnimatePresence>
        {animationStage === "unfolded" && (
          <>
            {/* Left side: Taped Coffee Mug receipt & Doodle */}
            <motion.div
              className="absolute left-[5%] bottom-[12%] pointer-events-auto hidden xl:block z-20 w-[140px] bg-[#FAF8F4] border border-[#DFD8C4] shadow-xs p-4 rotate-[-8deg] font-mono text-[9px] text-[#2C2520]/60 select-none cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0, x: -50, rotate: -15 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              drag
              dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
            >
              <Tape color="blue" className="-top-4 left-6 w-20 h-6 z-30" tilt={2} />
              <div className="text-center font-bold border-b border-dashed border-[#2C2520]/15 pb-1 mb-2 font-sans tracking-wide uppercase text-[7px] text-accent-pink">
                Bestie Cafe Receipt
              </div>
              <div className="flex justify-between"><span>Matcha Latte</span><span>$5.50</span></div>
              <div className="flex justify-between"><span>Warm Memories</span><span>Priceless</span></div>
              <div className="border-t border-dashed border-[#2C2520]/15 mt-2 pt-1 font-bold text-right text-[8px]">
                Total: Infinite ♡
              </div>
            </motion.div>

            {/* Right side: Draggable Creative polaroid displaying a memory */}
            {firstMemoryPhoto && (
              <motion.div
                className="absolute right-[5%] bottom-[15%] pointer-events-auto hidden lg:block z-20 w-[150px] bg-white p-3 border border-zinc-200/60 shadow-md rotate-[6deg] cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                initial={{ opacity: 0, x: 50, rotate: 15 }}
                animate={{ opacity: 0.9, x: 0, rotate: 6 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                drag
                dragConstraints={{ left: -40, right: 40, top: -40, bottom: 40 }}
              >
                <Tape color="pink" className="-top-3 left-4 w-20 h-6 z-30" tilt={-4} />
                <div className="aspect-square bg-zinc-100 overflow-hidden border border-zinc-200/50 mb-2">
                  <img src={firstMemoryPhoto.src} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="font-handwritten text-center text-xs text-text-ink/80 font-extrabold tracking-tight">
                  Where we began! 🌸
                </div>
              </motion.div>
            )}

            {/* Left Top: Pressed Flower Doodle taped */}
            <motion.div
              className="absolute left-[8%] top-[10%] hidden md:block z-10 w-20 h-28 pointer-events-auto opacity-40 select-none cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: 0.6 }}
              drag
              dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
            >
              <Tape color="yellow" className="-top-3 -left-3 w-16 h-5 opacity-80" tilt={25} />
              <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-[#8C7D70] stroke-[2.5]">
                <path d="M50,110 C52,90 48,50 50,30" strokeLinecap="round" />
                <path d="M50,75 C38,70 30,62 34,58 C38,54 46,65 50,75" fill="rgba(243, 163, 180, 0.1)" />
                <path d="M50,55 C62,50 70,42 66,38 C62,34 54,45 50,55" fill="rgba(162, 194, 225, 0.1)" />
                <circle cx="50" cy="30" r="6" fill="rgba(247, 229, 169, 0.3)" />
              </svg>
            </motion.div>

            {/* Floating Cute Sticker Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              <Sticker emoji="🌸" className="absolute top-[8%] right-[15%] hidden md:inline-flex" rotation={-12} scale={0.7} />
              <Sticker emoji="☕" className="absolute bottom-[8%] right-[25%] hidden md:inline-flex" rotation={15} scale={0.65} />
              <Sticker emoji="✨" className="absolute top-[28%] left-[20%] hidden xl:inline-flex" rotation={8} scale={0.6} />
              <Sticker emoji="💖" className="absolute bottom-[28%] left-[25%] hidden xl:inline-flex" rotation={-8} scale={0.65} />
            </div>

            {/* Aesthetic hand-drawn background stars */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <Doodle type="star" color="yellow" className="absolute top-[22%] right-[28%] w-6 h-6 opacity-30" delay={0.1} />
              <Doodle type="heart" color="pink" className="absolute bottom-[20%] left-[28%] w-8 h-8 opacity-25" delay={0.3} />
              <Doodle type="sparkle" color="blue" className="absolute top-[45%] left-[10%] w-6 h-6 opacity-20" delay={0.5} />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 4. Physical Envelope & Unfolding Letter Animation Space */}
      <div className="relative z-10 w-full flex items-center justify-center flex-col mt-4 md:mt-0">
        {animationStage !== "unfolded" ? (
          <motion.div
            onClick={handleOpenEnvelope}
            className="relative w-[min(88vw,460px)] aspect-[1.5/1] z-20 cursor-pointer focus:outline-none group rounded-md"
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            animate={animationStage === "slide-out" ? { y: 140, opacity: 0.8, scale: 0.95 } : { y: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {/* Envelope Shadow */}
            <div className="absolute inset-0 bg-text-ink/5 rounded-md blur-md transform translate-y-2 translate-x-1" />

            {/* Back base of envelope */}
            <div className="absolute inset-0 bg-[#FAF7F0] border border-[#EBE5D3] rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-[#F4EFE3] opacity-60" />
            </div>

            {/* THE LETTER (Slides out from inside) */}
            <motion.div
              className="absolute inset-x-4 top-2 bg-[#FCFAF5] rounded-xs border border-[#E9DFB9]/60 p-6 flex flex-col font-handwritten select-none z-5 h-[90%]"
              initial={{ y: 0 }}
              animate={animationStage === "slide-out" ? { y: -250, scale: 1.02 } : { y: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <div className="absolute top-0 bottom-0 left-5 w-[1px] bg-accent-pink/10" />
              <div className="pl-4 pt-2">
                <span className="font-extrabold text-text-ink/30 text-lg">Dear {friendshipConfig.page4.recipient},</span>
                <div className="w-full h-2 bg-text-ink/5 rounded-full mt-4" />
                <div className="w-2/3 h-2 bg-text-ink/5 rounded-full mt-2" />
                <div className="w-3/4 h-2 bg-text-ink/5 rounded-full mt-2" />
              </div>
            </motion.div>

            {/* Front Left/Right/Bottom Triangular Flaps overlay */}
            <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none z-10">
              <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#F9F5EC] border-r border-[#EBE5D3]/60 shadow-xs" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
              <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#F9F5EC] border-l border-[#EBE5D3]/60 shadow-xs" style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#F6F1E5] border-t border-[#EBE5D3]/60 shadow-xs" style={{ clipPath: "polygon(0 100%, 50% 0, 100% 100%)" }} />
            </div>

            {/* Top Flap (opens up) */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-1/2 bg-[#FAF7F0] border-b border-[#EBE5D3]/50 z-20"
              style={{ transformOrigin: "top center", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              animate={animationStage !== "closed" ? { rotateX: 180, zIndex: 0, opacity: 0.9 } : { rotateX: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Wax Seal */}
            {animationStage === "closed" && (
              <motion.div
                className="absolute top-[42%] left-[45%] w-[10%] aspect-square bg-[#E07A8F] rounded-full z-30 flex items-center justify-center border border-[#CC687D] shadow-md"
                animate={sealPulse ? { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] } : { scale: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <span className="text-[10px] md:text-sm text-[#F7D2DB] font-extrabold select-none">♡</span>
              </motion.div>
            )}

            {/* Annotation Hint */}
            {animationStage === "closed" && (
              <motion.div
                className="absolute bottom-[-2.5rem] left-0 right-0 text-center z-30"
                animate={sealPulse ? { opacity: [0.4, 0.8, 0.4] } : { opacity: 0.5 }}
                transition={{ duration: 2.8, repeat: Infinity }}
              >
                <span className="font-handwritten text-lg text-text-ink/65 italic select-none">open me...</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <Letter
            onRevealFinish={handleRevealFinish}
            isOpened={true}
            onReplayReveal={replayTrigger}
          />
        )}
      </div>

      {/* 4. Controls & CTA (appear after reveal completes) */}
      <AnimatePresence>
        {revealFinished && (
          <motion.div
            className="relative md:absolute mt-8 md:mt-0 bottom-auto md:bottom-[4%] left-auto md:left-0 right-auto md:right-0 flex flex-col items-center gap-4 z-30 pointer-events-auto w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.8 }}
          >
            <motion.button
              onClick={handleContinueTransition}
              className="relative px-8 py-3 bg-[#FFFDF9] text-text-ink border-2 border-text-ink/10 shadow-sm rounded-sm hover:shadow-md active:scale-97 hover:border-accent-pink/40 hover:text-accent-pink cursor-pointer font-handwritten text-xl font-bold transition-all group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute -top-2.5 -left-2.5 w-6 h-3 bg-accent-yellow/45 border-l border-r border-dashed border-text-ink/10 rotate-[-15deg] pointer-events-none" />
              <span className="absolute -bottom-2 -right-2 w-5 h-2.5 bg-accent-pink/40 border-l border-r border-dashed border-text-ink/10 rotate-[20deg] pointer-events-none" />
              
              <span className="relative z-10">keep this memory →</span>
            </motion.button>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={onBackToDesk}
                className="text-[10px] md:text-xs font-sans font-bold tracking-wider text-text-ink/50 hover:text-text-ink uppercase transition-colors cursor-pointer focus-visible:outline-none"
              >
                [ Go back to desk ]
              </button>
              <span className="text-text-ink/20 font-bold select-none">•</span>
              <button
                onClick={handleReadAgain}
                className="text-[10px] md:text-xs font-sans font-bold tracking-wider text-text-ink/50 hover:text-text-ink uppercase transition-colors cursor-pointer focus-visible:outline-none"
              >
                [ Read Again 🔄 ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
