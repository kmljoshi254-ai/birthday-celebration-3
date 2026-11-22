"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { friendshipConfig } from "@/config/friendship";
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

// 1. Ambient Background: quiet grid lines, soft drifting sparks
const AmbientBackground: React.FC = () => {
  const isDark = friendshipConfig.theme === "dark";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Warm layout colors */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isDark
            ? "radial-gradient(circle at 50% 50%, #111827 0%, #030712 100%)"
            : "radial-gradient(circle at 50% 50%, #FCFAF6 0%, #FAF1E6 60%, #EADDC9 100%)",
        }}
      />
      {/* Quiet handwriting paper grid lines */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: isDark
          ? "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
          : "linear-gradient(#8C7D70 1px, transparent 1px), linear-gradient(90deg, #8C7D70 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Floating subtle paper scraps */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/20 rounded-xs"
          style={{
            width: `${12 + (i % 2) * 8}px`,
            height: `${8 + (i % 3) * 6}px`,
            top: `${20 + i * 9}%`,
            left: `${10 + (i * 12) % 80}%`,
            backgroundColor: isDark
              ? (i % 2 === 0 ? "#EC4899" : "#38BDF8")
              : (i % 2 === 0 ? "#F3A3B4" : "#F7E5A9"),
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// --- CORE MEMORY CAPSULE SCENE ---
interface MemoryCapsuleSceneProps {
  onBackToLetter: () => void;
  onReplay: () => void;
  onContinue?: () => void;
}

export const MemoryCapsuleScene: React.FC<MemoryCapsuleSceneProps> = ({ onBackToLetter, onReplay, onContinue }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Capsule states: "closed" -> "opening" -> "open"
  const [capsuleState, setCapsuleState] = useState<"closed" | "opening" | "open">("closed");
  const [activeItem, setActiveItem] = useState<"memory" | "question" | "challenge" | "futureNote" | "surprise" | null>(null);
  
  // Interactive inputs
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [challengeDone, setChallengeDone] = useState(false);
  const [surpriseOpened, setSurpriseOpened] = useState(false);
  
  // Shaking wiggles
  const [jarShaking, setJarShaking] = useState(false);
  const [sparkleBlast, setSparkleBlast] = useState(false);

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionStage, setTransitionStage] = useState<"idle" | "capsule-close" | "polaroid-zoom" | "polaroid-cracking" | "polaroid-break" | "complete">("idle");

  // Drag physics for constrained capsule rotation
  const dragX = useMotionValue(0);
  const dragSpring = useSpring(dragX, { stiffness: 120, damping: 20 });
  const jarRotation = useTransform(dragSpring, [-100, 100], [-25, 25]);

  const config = friendshipConfig.page5;

  // Load saved answer from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("memoryCapsuleAnswer");
    if (saved) {
      setQuestionAnswer(saved);
      setIsSaved(true);
    }
  }, []);

  // exit sequence: closes lid, zooms Polaroid, cracks with light, breaks to particles
  const handleFinalContinue = () => {
    if (!onContinue) {
      onReplay();
      return;
    }
    setIsTransitioning(true);
    setTransitionStage("capsule-close");
    setCapsuleState("closed");
    
    // Zoom Polaroid
    setTimeout(() => {
      setTransitionStage("polaroid-zoom");
      playSound("pop");
    }, 900);

    // Crack lines overlay
    setTimeout(() => {
      setTransitionStage("polaroid-cracking");
      playSound("sparkle");
    }, 2200);

    // Break to particles
    setTimeout(() => {
      setTransitionStage("polaroid-break");
    }, 3400);

    // Fade to Page 6
    setTimeout(() => {
      onContinue();
    }, 4500);
  };

  // Audio cues
  const playSound = (type: "click" | "pop" | "sparkle" | "paper") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "pop") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "sparkle") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "paper") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenCapsule = () => {
    if (capsuleState !== "closed") return;
    playSound("click");
    setJarShaking(true);

    setTimeout(() => {
      setJarShaking(false);
      setCapsuleState("opening");
      playSound("pop");
    }, 450);

    setTimeout(() => {
      setCapsuleState("open");
    }, 1200);
  };

  const handleSaveMemory = () => {
    if (!questionAnswer.trim()) return;
    playSound("pop");
    localStorage.setItem("memoryCapsuleAnswer", questionAnswer);
    setIsSaved(true);

    // Animate folding back into capsule
    setActiveItem(null);
  };

  const handleTriggerSurprise = () => {
    if (surpriseOpened) return;
    playSound("sparkle");
    setSurpriseOpened(true);
    setSparkleBlast(true);
    setTimeout(() => setSparkleBlast(false), 1000);
  };

  return (
    <div className="relative w-full h-dvh flex flex-col justify-between items-center overflow-y-auto md:overflow-hidden py-6 pb-12 md:pb-6 px-4 select-none z-10">
      <AmbientBackground />

      {/* Header labels */}
      <div className="w-full text-center mt-2 z-20 pointer-events-none">
        <span className="font-handwritten text-lg text-accent-pink tracking-wider font-extrabold uppercase select-none block mb-1">
          one more thing...
        </span>
        <h1 className={`font-sans text-3xl md:text-4xl font-black tracking-tight leading-none transition-colors duration-500 ${
          friendshipConfig.theme === "dark" ? "text-zinc-100" : "text-text-ink/90"
        }`}>
          {config.title}
        </h1>
        <p className={`font-handwritten text-md md:text-lg font-bold italic mt-1 transition-colors duration-500 ${
          friendshipConfig.theme === "dark" ? "text-zinc-400" : "text-text-ink/65"
        }`}>
          Pick something to open.
        </p>
      </div>

      {/* CONFETTI SPARKLE BLAST */}
      <AnimatePresence>
        {sparkleBlast && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-accent-yellow"
                style={{
                  backgroundColor: i % 3 === 0 ? "#F7E5A9" : i % 3 === 1 ? "#F3A3B4" : "#A2C2E1",
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                  scale: [1, 1.5, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* MAIN KEEPSAKE CONTAINER (GLASS JAR CAPSULE) */}
      <div className="flex-grow w-full flex flex-col md:flex-row items-center justify-center relative select-none z-20">
        
        {/* The Capsule Glass Jar */}
        <motion.div
          className={`relative pointer-events-auto cursor-grab active:cursor-grabbing aspect-[0.7/1] flex flex-col items-center justify-end pb-4 transition-all duration-300 ${
            capsuleState === "open" ? "w-[125px]" : "w-[200px]"
          } md:w-[190px] ${
            jarShaking ? "animate-shake" : ""
          }`}
          style={{
            x: dragSpring,
            rotate: jarRotation,
            transformStyle: "preserve-3d",
          }}
          drag="x"
          dragConstraints={{ left: -120, right: 120 }}
          dragElastic={0.15}
          onClick={capsuleState === "closed" ? handleOpenCapsule : undefined}
          whileHover={capsuleState === "closed" ? { scale: 1.03 } : {}}
        >
          {/* Glass Jar Body (Drawn with SVG paths) */}
          <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-xl z-10 pointer-events-none">
            {/* Glass Jar Base */}
            <path d="M15,35 C15,35 15,30 20,30 L80,30 C85,30 85,35 85,35 L85,120 C85,130 75,135 50,135 C25,135 15,130 15,120 Z" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(140, 125, 112, 0.4)" strokeWidth="1.5" />
            <path d="M18,35 L82,35 L82,118 C82,126 73,131 50,131 C27,131 18,126 18,118 Z" fill="rgba(255, 255, 255, 0.08)" />
            
            {/* Label inside (saved label) */}
            {isSaved && (
              <g transform="translate(30, 75) rotate(-5)">
                <rect width="40" height="15" fill="#FAF6EB" stroke="#DFD8C4" strokeWidth="1" rx="2" />
                <text x="20" y="10" fill="#EFA2B1" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  saved. ♡
                </text>
              </g>
            )}

            {/* Neck of the Jar */}
            <rect x="30" y="20" width="40" height="10" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(140, 125, 112, 0.4)" strokeWidth="1.5" rx="2" />
            
            {/* Glass reflections */}
            <path d="M22,40 C22,40 25,60 25,80" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeLinecap="round" />
            <path d="M78,45 C78,45 75,70 75,95" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeLinecap="round" />
          </svg>

          {/* Cork Lid (Separates and pops off) */}
          <motion.div
            className="absolute top-[8%] z-20 w-[42%] aspect-[3/1] bg-[#C59B7E] rounded-xs border-b border-[#A0785C] shadow-inner"
            style={{ transformOrigin: "bottom center" }}
            animate={
              capsuleState === "opening"
                ? { y: -45, opacity: [1, 1, 0], rotate: 15 }
                : capsuleState === "open"
                ? { y: -100, opacity: 0 }
                : { y: 0, opacity: 1 }
            }
            transition={{ duration: 1.0 }}
          />

          {/* Magic memory dust rising from the open bottle */}
          {capsuleState === "open" && (
            <div className="absolute top-[10%] inset-x-0 h-40 pointer-events-none z-10">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: `${4 + (i % 3) * 3}px`,
                    height: `${4 + (i % 3) * 3}px`,
                    backgroundColor: i % 3 === 0 ? "#FCD5B5" : i % 3 === 1 ? "#F3A3B4" : "#A2C2E1",
                    boxShadow: i % 2 === 0 ? "0 0 8px #FCD5B5" : "0 0 8px #F3A3B4",
                    bottom: "0%",
                  }}
                  animate={{
                    y: [0, -130 - (i % 4) * 20],
                    x: [0, (i % 2 === 0 ? 40 : -40) * Math.random()],
                    opacity: [0, 0.9, 0],
                    scale: [0.2, 1, 0.1],
                  }}
                  transition={{
                    duration: 2.8 + (i % 3) * 0.5,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Warm glow light inside */}
          <AnimatePresence>
            {capsuleState !== "closed" && (
              <motion.div
                className="absolute inset-x-8 bottom-6 top-[28%] bg-gradient-to-t from-amber-200/40 via-amber-100/10 to-transparent rounded-full blur-md z-5 pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>

          {/* Prompt labels */}
          {capsuleState === "closed" && (
            <span className="absolute bottom-[-1.5rem] font-handwritten text-xs text-text-ink/60 select-none animate-pulse">
              [ Click to open jar ]
            </span>
          )}
        </motion.div>

        {/* 4 INTERACTIVE OBJECTS (Become accessible outside/around the jar after it opens) */}
        <AnimatePresence>
          {capsuleState === "open" && !activeItem && (
            <>
              {/* Mobile responsive flex-flow grid underneath the jar */}
              <div className="w-full grid grid-cols-2 gap-3 px-2 mt-6 pointer-events-auto z-30 select-none pb-4 md:hidden">
                {/* 1. Memory */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { playSound("paper"); setActiveItem("memory"); }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-white p-2 border border-zinc-200 shadow-md w-[115px] aspect-[1/1.22] flex flex-col justify-between rounded-xs">
                    <div className="w-full aspect-square bg-zinc-50 border border-zinc-100 overflow-hidden">
                      <img src={config.memory.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="font-handwritten text-[10px] text-center text-text-ink/80 font-black select-none mt-1">
                      Memory 🌸
                    </span>
                  </div>
                </motion.div>

                {/* 2. Challenge */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { playSound("paper"); setActiveItem("challenge"); }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-[#FAF8F5] border border-[#EADDC9] rounded-full py-2 px-3 shadow-md font-handwritten text-[11px] font-black text-[#8C7D70] flex items-center gap-1 cursor-pointer w-full justify-center max-w-[130px] h-[38px] text-center">
                    <span>📜</span>
                    <span className="truncate">Challenge</span>
                    {challengeDone && <span className="text-emerald-500 font-extrabold text-[10px]">✓</span>}
                  </div>
                </motion.div>

                {/* 3. Future Note */}
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { playSound("paper"); setActiveItem("futureNote"); }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-white border border-zinc-200 shadow-md py-2 px-3 rounded-sm font-handwritten text-[11px] font-bold text-text-ink/80 flex items-center gap-1 cursor-pointer w-full justify-center max-w-[130px] h-[38px] text-center">
                    <span className="text-red-400 text-sm">⏳</span>
                    <span>Future Note</span>
                  </div>
                </motion.div>

                {/* 4. Question */}
                <motion.div
                  className="col-span-2 flex items-center justify-center mt-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { playSound("paper"); setActiveItem("question"); }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-[#FAF5E6] border border-[#E9DFB9] shadow-md py-2 px-4 rounded-md font-handwritten text-xs font-black text-text-ink/90 flex items-center gap-1.5 cursor-pointer max-w-[190px] justify-center w-full h-[38px]">
                    <span>✉</span>
                    <span>Write memory card</span>
                  </div>
                </motion.div>

                {/* 5. Surprise */}
                <motion.div
                  className="col-span-2 flex items-center justify-center mt-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={() => { playSound("paper"); setActiveItem("surprise"); }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-rose-100 border border-rose-200 shadow-md py-2 px-4 rounded-md font-handwritten text-xs font-black text-rose-500 flex items-center gap-1.5 cursor-pointer max-w-[190px] justify-center w-full h-[38px]">
                    <span>🎁</span>
                    <span>{surpriseOpened ? "Opened Surprise" : "don't open"}</span>
                  </div>
                </motion.div>
              </div>

              {/* Desktop absolute positioned items surrounding the jar */}
              <div className="absolute inset-0 pointer-events-none z-30 hidden md:block">
                {/* 1. MEMORY OBJECT (Polaroid frame wiggling on left) */}
                <motion.div
                  className="absolute left-[5%] md:left-[12%] top-[20%] pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  whileHover={{ scale: 1.08, rotate: -6 }}
                  onClick={() => { playSound("paper"); setActiveItem("memory"); }}
                >
                  <Tape color="pink" className="-top-4 left-6 w-20 h-6 opacity-75 z-40" tilt={-4} />
                  <div className="bg-white p-3 border border-zinc-200/80 shadow-xl w-[120px] md:w-[150px] aspect-[1/1.2] flex flex-col justify-between rounded-xs">
                    <div className="w-full aspect-square bg-zinc-50 border border-zinc-100 overflow-hidden">
                      <img src={config.memory.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="font-handwritten text-xs md:text-sm text-center text-text-ink/80 font-black select-none mt-1">
                      Memory 🌸
                    </span>
                  </div>
                </motion.div>

                {/* 2. QUESTION OBJECT (Folded note in center bottom) */}
                <motion.div
                  className="absolute left-[38%] md:left-[42%] bottom-[12%] pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  onClick={() => { playSound("paper"); setActiveItem("question"); }}
                >
                  <div className="bg-[#FAF5E6] border border-[#E9DFB9] shadow-xl p-4 px-6 rounded-md font-handwritten text-sm md:text-lg font-black text-text-ink/90 flex items-center gap-2.5 rotate-[3deg] cursor-pointer hover:border-accent-pink/40">
                    <span className="text-lg md:text-xl">✉</span>
                    <span>Write memory card</span>
                  </div>
                </motion.div>

                {/* 3. CHALLENGE OBJECT (Rolled scroll with ribbon) */}
                <motion.div
                  className="absolute right-[5%] md:right-[12%] top-[18%] pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.5, rotate: 25 }}
                  animate={{ opacity: 1, scale: 1, rotate: 15 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  whileHover={{ scale: 1.08, rotate: 8 }}
                  onClick={() => { playSound("paper"); setActiveItem("challenge"); }}
                >
                  <Tape color="yellow" className="-top-4 left-6 w-20 h-6 opacity-75 z-40" tilt={3} />
                  <div className="bg-[#FAF8F5] border-2 border-[#EADDC9] rounded-full p-3 px-6 shadow-xl font-handwritten text-xs md:text-base font-black text-[#8C7D70] flex items-center gap-2 cursor-pointer hover:border-accent-yellow/45">
                    <span className="text-lg md:text-xl">📜</span>
                    <span>Challenge</span>
                    {challengeDone && <span className="text-emerald-500 font-extrabold">✓</span>}
                  </div>
                </motion.div>

                {/* 4. FUTURE NOTE OBJECT (Folded letter with red seal) */}
                <motion.div
                  className="absolute left-[6%] md:left-[16%] bottom-[16%] pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: -8 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  onClick={() => { playSound("paper"); setActiveItem("futureNote"); }}
                >
                  <div className="bg-white border border-zinc-200/80 shadow-xl p-3 px-5 rounded-sm font-handwritten text-xs md:text-md font-bold text-text-ink/80 flex items-center gap-2 rotate-[-6deg] cursor-pointer hover:border-accent-pink/20">
                    <span className="text-red-400 text-sm md:text-base">⏳</span>
                    <span>Future Note</span>
                  </div>
                </motion.div>

                {/* 5. SURPRISE OBJECT (Wrapped gift box) */}
                <motion.div
                  className="absolute right-[8%] md:right-[16%] bottom-[18%] pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.5, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 8 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  onClick={() => { playSound("paper"); setActiveItem("surprise"); }}
                >
                  <div className="bg-rose-100 border border-rose-200 shadow-xl p-3.5 px-6 rounded-md font-handwritten text-xs md:text-md font-black text-rose-500 flex items-center gap-2 rotate-[8deg] cursor-pointer hover:border-rose-300">
                    <span className="text-lg">🎁</span>
                    <span>{surpriseOpened ? "Opened Surprise" : "don't open"}</span>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* FOOTER CTA ROUTING BAR */}
      <div className="w-full flex flex-col items-center gap-3 z-30 pointer-events-auto">
        <div className="flex flex-col items-center gap-2">
          {isSaved && (
            <motion.span
              className="font-handwritten text-md text-accent-pink font-bold"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Memory saved in time capsule ♡
            </motion.span>
          )}
          
          <button
            onClick={handleFinalContinue}
            className="relative px-8 py-2.5 bg-accent-pink text-white border-2 border-accent-pink shadow-md rounded-full hover:shadow-lg hover:bg-accent-pink/90 active:scale-95 cursor-pointer font-handwritten text-lg font-bold transition-all group flex items-center gap-2"
          >
            {isSaved ? "One last thing →" : "Skip to final memory →"}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-2 mb-1">
          <button
            onClick={onBackToLetter}
            className="text-[10px] md:text-xs font-sans font-bold tracking-wider text-text-ink/50 hover:text-text-ink uppercase transition-colors cursor-pointer focus-visible:outline-none"
          >
            [ Read Letter Again ]
          </button>
        </div>
      </div>

      {/* ACTIVE ITEM DETAILS VIEWPORTS (Rendered at root level to prevent z-index stacking conflicts) */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 bg-black/60 z-[99] backdrop-blur-xs flex items-center justify-center p-6 pointer-events-auto" onClick={() => setActiveItem(null)}>
            <motion.div
              className={`w-full max-w-[480px] md:max-w-[550px] border-2 shadow-2xl p-5 md:p-8 relative rounded-md flex flex-col justify-between transition-colors duration-500 ${
                friendshipConfig.theme === "dark"
                  ? "bg-zinc-900/95 border-zinc-800/80 text-zinc-100"
                  : "bg-[#FCFAF5] border-[#E9DFB9] text-text-ink"
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Washi tape details */}
              <Tape color="pink" className="-top-4.5 left-10 w-28 h-6 z-40" tilt={-2} />
              
              {/* 1. MEMORY DETAILS VIEW */}
              {activeItem === "memory" && (
                <div className="text-center">
                  <div className="w-full max-w-[180px] md:max-w-none mx-auto aspect-square bg-zinc-50 border border-zinc-200 overflow-hidden mb-3 rounded-xs">
                    <img src={config.memory.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className={`font-sans text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    friendshipConfig.theme === "dark" ? "text-zinc-500" : "text-[#BFA28F]"
                  }`}>
                    {config.memory.date}
                  </span>
                  <p className={`font-handwritten text-base md:text-xl leading-relaxed font-bold px-4 ${
                    friendshipConfig.theme === "dark" ? "text-zinc-100" : "text-text-ink"
                  }`}>
                    {config.memory.caption}
                  </p>
                </div>
              )}

              {/* 2. QUESTION DETAILS VIEW */}
              {activeItem === "question" && (
                <div className="text-center flex flex-col gap-4">
                  <h3 className="font-handwritten text-lg md:text-xl font-extrabold text-accent-pink leading-snug">
                    {config.question.text}
                  </h3>
                  
                  <div className={`w-full border rounded-md p-4 shadow-inner relative ${
                    friendshipConfig.theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-[#FAF5E6] border-[#DFD8C4]"
                  }`}>
                    <textarea
                      value={questionAnswer}
                      onChange={(e) => setQuestionAnswer(e.target.value)}
                      placeholder="Type your memory response here..."
                      className={`w-full h-28 md:h-44 bg-transparent resize-none border-none font-handwritten text-base md:text-xl focus:outline-none leading-relaxed ${
                        friendshipConfig.theme === "dark" ? "text-zinc-100 placeholder-zinc-700" : "text-text-ink placeholder-text-ink/35"
                      }`}
                    />
                  </div>
                  
                  {!isSaved ? (
                    <button
                      onClick={handleSaveMemory}
                      disabled={!questionAnswer.trim()}
                      className={`px-8 py-3 rounded-md font-handwritten text-lg font-bold transition-all shadow-md disabled:opacity-40 active:scale-95 ${
                        friendshipConfig.theme === "dark" 
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700" 
                          : "bg-[#FAF6EB] text-text-ink border-2 border-[#DFD8C4] hover:bg-white"
                      }`}
                    >
                      Save this memory ♡
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <span className="font-handwritten text-md md:text-lg text-emerald-500 font-extrabold">
                        Saved in time capsule ✓
                      </span>
                      <button
                        onClick={() => setIsSaved(false)}
                        className="text-xs font-sans text-accent-pink hover:underline font-extrabold uppercase cursor-pointer"
                      >
                        [ Edit response ]
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. CHALLENGE DETAILS VIEW */}
              {activeItem === "challenge" && (
                <div className="text-center flex flex-col gap-4 py-2">
                  <span className="text-4xl md:text-5xl">⚡</span>
                  <h3 className="font-handwritten text-xl md:text-2xl font-bold text-accent-pink leading-snug">
                    Your Challenge
                  </h3>
                  <p className={`font-handwritten text-lg md:text-xl leading-relaxed font-bold italic px-4 ${
                    friendshipConfig.theme === "dark" ? "text-zinc-100" : "text-text-ink/80"
                  }`}>
                    "{config.challenge.text}"
                  </p>
                  
                  {!challengeDone ? (
                    <button
                      onClick={() => { playSound("sparkle"); setChallengeDone(true); }}
                      className={`px-8 py-3 bg-[#EFA2B1] text-white rounded-md font-handwritten text-lg font-bold hover:bg-[#e28a9b] active:scale-95 transition-all shadow-md mt-4 ${
                        friendshipConfig.theme === "dark" ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100" : ""
                      }`}
                    >
                      I did it! 🎉
                    </button>
                  ) : (
                    <span className="font-handwritten text-md md:text-lg text-emerald-500 font-extrabold mt-4 block">
                      Challenge completed ✓
                    </span>
                  )}
                </div>
              )}

              {/* 4. FUTURE NOTE DETAILS VIEW */}
              {activeItem === "futureNote" && (
                <div className="text-center flex flex-col gap-4 py-2">
                  <span className="text-4xl md:text-5xl">⏳</span>
                  <h3 className="font-handwritten text-xl md:text-2xl font-bold text-accent-pink leading-snug">
                    Open in the future
                  </h3>
                  <p className={`font-handwritten text-lg md:text-xl leading-relaxed font-bold italic px-4 ${
                    friendshipConfig.theme === "dark" ? "text-zinc-100" : "text-text-ink/80"
                  }`}>
                    "{config.futureNote.text}"
                  </p>
                </div>
              )}

              {/* 5. SURPRISE NOTE VIEW */}
              {activeItem === "surprise" && (
                <div className="text-center flex flex-col gap-4 py-2">
                  <span className="text-4xl md:text-5xl">🎁</span>
                  <h3 className="font-handwritten text-xl md:text-2xl font-bold text-rose-500">
                    Intruder Alert!
                  </h3>
                  {!surpriseOpened ? (
                    <button
                      onClick={handleTriggerSurprise}
                      className="px-8 py-3 bg-rose-500 text-white rounded-md font-handwritten text-lg font-bold hover:bg-rose-600 active:scale-95 transition-all shadow-md mt-4"
                    >
                      Open anyway 🤫
                    </button>
                  ) : (
                    <p className={`font-handwritten text-lg md:text-xl font-bold leading-relaxed px-4 ${
                      friendshipConfig.theme === "dark" ? "text-zinc-100" : "text-[#2C2520]"
                    }`}>
                      {config.surprise.message}
                    </p>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className={`mt-4 text-[10px] font-sans font-bold uppercase transition-colors ${
                  friendshipConfig.theme === "dark" 
                    ? "text-zinc-500 hover:text-accent-pink" 
                    : "text-text-ink/40 hover:text-accent-pink"
                }`}
              >
                [ Put Back ]
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRANSITION OVERLAY */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-transparent z-[100] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Zooming Polaroid */}
            {(transitionStage === "polaroid-zoom" || transitionStage === "polaroid-cracking" || transitionStage === "polaroid-break") && (
              <motion.div
                className="relative w-[min(90vw,480px)] aspect-[1/1.2] bg-white p-5 border border-zinc-200 shadow-2xl flex flex-col justify-between"
                initial={{ scale: 0.1, rotate: -45, opacity: 0 }}
                animate={
                  transitionStage === "polaroid-break"
                    ? { scale: 1.4, opacity: 0, rotate: 12 }
                    : { scale: 1.0, rotate: 0, opacity: 1 }
                }
                transition={{ duration: 1.2, ease: "easeInOut" }}
              >
                <div className="w-full aspect-square bg-[#FBF9F6] border border-zinc-200 overflow-hidden relative">
                  <img src={config.memory.image} className="w-full h-full object-cover" alt="" />
                  
                  {/* Cracks of light overlay */}
                  {transitionStage === "polaroid-cracking" && (
                    <motion.svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 w-full h-full fill-none stroke-amber-300 stroke-[1.5]"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: [0, 1, 0.8] }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                    >
                      <path d="M0,50 L30,45 L50,55 L70,40 L100,50 M50,0 L45,30 L50,55 L55,80 L50,100" />
                      <path d="M25,25 L40,35 M75,75 L60,65 M80,20 L65,30 M20,80 L35,70" />
                    </motion.svg>
                  )}
                </div>
                <div className="font-handwritten text-center text-2xl text-text-ink/90 font-extrabold pb-3">
                  Let's make another memory.
                </div>
              </motion.div>
            )}

            {/* Exploding particles */}
            {transitionStage === "polaroid-break" && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white border border-zinc-200/50"
                    style={{
                      width: `${15 + (i % 3) * 10}px`,
                      height: `${12 + (i % 2) * 8}px`,
                    }}
                    initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 0.9 }}
                    animate={{
                      x: Math.cos((i * 15 * Math.PI) / 180) * (200 + Math.random() * 150),
                      y: Math.sin((i * 15 * Math.PI) / 180) * (200 + Math.random() * 150),
                      scale: [1, 0.2],
                      rotate: [0, 360],
                      opacity: 0,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shake animations styles */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.3s infinite;
        }
      `}</style>
    </div>
  );
};
