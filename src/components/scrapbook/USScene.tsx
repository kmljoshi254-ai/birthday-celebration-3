"use client";

import React, { useState, useEffect } from "react";
import { motion, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { ScrapbookCanvas } from "./ScrapbookCanvas";
import { HeroTitle } from "./HeroTitle";
import { Polaroid } from "./Polaroid";
import { Doodle } from "./Doodle";
import { Sticker } from "./Sticker";
import { ContinueButton } from "./ContinueButton";
import { friendshipConfig } from "@/config/friendship";

interface USSceneProps {
  onContinue: () => void;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}

export const USScene: React.FC<USSceneProps> = ({ onContinue, mouseX, mouseY }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [isFolding, setIsFolding] = useState(false);
  const isDark = friendshipConfig.theme === "dark";

  const handleContinue = () => {
    setIsFolding(true);
    setTimeout(() => {
      onContinue();
    }, 1200);
  };

  // Fallback motion values for parallax
  const dummyValue = new MotionValue(0);
  const mX = mouseX || dummyValue;
  const mY = mouseY || dummyValue;

  // Pointer parallax layers disabled to keep elements stationary on mouse movement
  const bgX = 0;
  const bgY = 0;
  const px = 0;
  const py = 0;
  const fgX = 0;
  const fgY = 0;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch photos from config
  const mainPhoto = friendshipConfig.hero.polaroids[0];
  const supportPhoto1 = friendshipConfig.hero.polaroids[1];
  const supportPhoto2 = friendshipConfig.hero.polaroids[2];

  const mobilePhotos = [mainPhoto, supportPhoto1, supportPhoto2].filter(Boolean);
  const activePhoto = isMobile ? mobilePhotos[activeMobileIndex] : mainPhoto;

  return (
    <ScrapbookCanvas>
      {/* Seamless transition overlay */}
      <motion.div
        className="fixed inset-0 bg-white z-[90] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Interactive, slow blush light drifting across the page */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-25"
        style={{
          background: "radial-gradient(circle at 35% 45%, #F3A3B4 0%, transparent 60%)",
          animation: "ambientLightDrift 18s ease-in-out infinite alternate"
        }}
      />
      <style>{`
        @keyframes ambientLightDrift {
          0% { background-position: 0% 0%; filter: hue-rotate(0deg); }
          100% { background-position: 100% 100%; filter: hue-rotate(15deg); }
        }
      `}</style>

      {/* ==================== LAYER 4: FLOATING DUST MOTES ==================== */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent-pink/15"
            style={{
              top: `${25 + i * 12}%`,
              left: `${15 + Math.sin(i) * 20 + 35}%`,
            }}
            animate={{
              y: [0, -35, -70],
              x: [0, Math.sin(i) * 10, 0],
              opacity: [0, 0.45, 0],
            }}
            transition={{
              duration: 8 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* ==================== LAYER 4: DRIFTING PAPER SCRAPS ==================== */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 border border-white/10 shadow-xs"
            style={{
              width: `${12 + (i % 2) * 8}px`,
              height: `${12 + (i % 2) * 8}px`,
              top: `${10 + i * 22}%`,
              left: `${5 + Math.cos(i) * 15 + 20}%`,
              borderRadius: i % 2 === 0 ? "2px" : "50%",
            }}
            animate={{
              y: [0, -40, -80],
              x: [0, Math.sin(i) * 12, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.45, 0],
            }}
            transition={{
              duration: 12 + (i % 2) * 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* ==================== LAYER 2: FAINT GHOST-LIKE HANDWRITING ==================== */}
      {!isMobile && (
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-between p-16 select-none"
          style={{ x: bgX, y: bgY }}
        >
          <div className="font-handwritten text-4xl text-text-ink/6 rotate-[-12deg] w-max mt-4">
            the good old days
          </div>
          <div className="font-handwritten text-5xl text-text-ink/5 rotate-[8deg] w-max self-end mr-12">
            core memories
          </div>
          <div className="font-handwritten text-4xl text-text-ink/6 rotate-[-6deg] w-max ml-20 mb-16">
            remember when...
          </div>
        </motion.div>
      )}

      {/* Outer container forcing strict layout boundaries without scrolls */}
      <motion.div
        className="w-full h-dvh relative flex flex-col justify-start items-center py-6 px-4 md:py-8 md:px-8 select-none z-20 overflow-y-auto md:overflow-hidden pb-12 md:pb-0"
        style={{ transformOrigin: "left center", perspective: 1200 }}
        initial={{ x: "60vw", opacity: 0.6 }}
        animate={{
          x: isFolding ? "-100vw" : 0,
          rotateY: isFolding ? -95 : 0,
          opacity: isFolding ? 0 : 1,
        }}
        transition={{
          duration: isFolding ? 1.1 : 1.8,
          ease: isFolding ? "easeIn" : [0.16, 1, 0.3, 1],
        }}
      >
        {/* Coffee Ring Stain (Tactile Background Detail) */}
        <div className="absolute left-[6%] top-[8%] opacity-15 pointer-events-none select-none hidden lg:block z-0">
          <svg viewBox="0 0 100 100" className="w-28 h-28 text-amber-900/60 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
            <path d="M52,8 C27,10 8,28 9,53 C10,79 32,94 57,91 C80,88 93,65 91,42 C89,20 63,7 44,14 C29,19 19,39 23,55" />
          </svg>
        </div>

        {/* ==================== 1. VERTICAL HERO CENTER PIECE ==================== */}
        <div className="w-full flex flex-col items-center justify-start gap-4 md:gap-6 z-30 mt-4 md:mt-8 md:pt-4">
          
          {/* Title & Subtitle block */}
          <div className="w-full max-w-lg text-center">
            <HeroTitle
              title={friendshipConfig.hero.title}
              subtitle={friendshipConfig.hero.subtitle}
            />
          </div>

          {/* Hero Polaroid container */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              
              {/* Main Featured Photo / Mobile Sliding Carousel */}
              {isMobile ? (
                <div className="relative w-[235px] aspect-[1/1.2] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMobileIndex}
                      initial={{ x: 120, opacity: 0, rotate: 6 }}
                      animate={{ x: 0, opacity: 1, rotate: activePhoto.rotation * 0.7 || -2 }}
                      exit={{ x: -120, opacity: 0, rotate: -6 }}
                      transition={{ type: "spring", stiffness: 180, damping: 18 }}
                      className="w-full h-full absolute"
                    >
                      <Polaroid
                        src={activePhoto.src}
                        caption={activePhoto.caption}
                        date={activePhoto.date}
                        rotation={0}
                        tapeColor={activeMobileIndex % 2 === 0 ? "yellow" : "pink"}
                        tapePosition="top-center"
                        interactive={true}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  className="w-[clamp(230px,22vw,300px)] pointer-events-auto relative z-30"
                  style={{ x: px, y: py }}
                  initial={{ y: 150, opacity: 0, scale: 0.9, rotate: -8 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: -2 }}
                  transition={{
                    y: { type: "spring", stiffness: 80, damping: 16, delay: 0.8 },
                    opacity: { duration: 0.8, delay: 0.8 },
                    scale: { duration: 0.8, delay: 0.8 },
                    rotate: { duration: 0.8, delay: 1.0 }
                  }}
                >
                  <Polaroid
                    src={mainPhoto.src}
                    caption={mainPhoto.caption}
                    date={mainPhoto.date}
                    rotation={-2}
                    tapeColor="yellow"
                    tapePosition="top-center"
                    interactive={true}
                  />
                </motion.div>
              )}

            {/* ==================== EPHEMERA / NOTES (DESKTOP/TABLET ONLY) ==================== */}
            {/* Supporting memory 1: Left Polaroid */}
            {!isMobile && supportPhoto1 && (
              <motion.div
                className="absolute right-[calc(100%+2.5rem)] top-1/2 -translate-y-1/2 w-[clamp(170px,12vw,200px)] h-fit z-20 pointer-events-auto"
                style={{ x: px, y: py }}
                initial={{ x: -80, opacity: 0, rotate: -15 }}
                animate={{ x: 0, opacity: 0.85, rotate: -8 }}
                transition={{ type: "spring", stiffness: 85, damping: 18, delay: 1.2 }}
              >
                <Polaroid
                  src={supportPhoto1.src}
                  caption={supportPhoto1.caption}
                  date={supportPhoto1.date}
                  rotation={-8}
                  tapeColor="pink"
                  tapePosition="top-left"
                  interactive={true}
                />
              </motion.div>
            )}

            {/* Supporting memory 2: Right Polaroid */}
            {!isMobile && supportPhoto2 && (
              <motion.div
                className="absolute left-[calc(100%+2.5rem)] top-1/2 -translate-y-1/2 w-[clamp(170px,12vw,200px)] h-fit z-20 pointer-events-auto"
                style={{ x: px, y: py }}
                initial={{ x: 80, opacity: 0, rotate: 15 }}
                animate={{ x: 0, opacity: 0.85, rotate: 6 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 1.4 }}
              >
                <Polaroid
                  src={supportPhoto2.src}
                  caption={supportPhoto2.caption}
                  date={supportPhoto2.date}
                  rotation={6}
                  tapeColor="blue"
                  tapePosition="top-right"
                  interactive={true}
                />
              </motion.div>
            )}

            {/* Notebook Scrap Paper Note (Bottom Left of Main photo) */}
            {!isMobile && (
              <motion.div
                className="absolute left-[-220px] bottom-[-95px] bg-[#FAF8F5] border border-[#E5DEC9] shadow-sm p-3 rotate-[-5deg] w-[130px] pointer-events-auto cursor-pointer z-30"
                style={{ x: px, y: py }}
                whileHover={{ scale: 1.06, rotate: -2, y: -4, boxShadow: "0 6px 12px rgba(44,37,32,0.12)" }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-200/40 rotate-[3deg] shadow-sm border border-yellow-300/10" />
                <p className="font-handwritten text-[11px] text-text-ink/85 leading-relaxed">
                  remember this? 😂<br/>we really did that.
                </p>
              </motion.div>
            )}

            {/* Coffee Shop Receipt ephemera (Left corner of table) */}
            {!isMobile && (
              <motion.div
                className="absolute left-[-420px] bottom-[-130px] bg-[#FDFBF7] border border-gray-200/60 shadow-xs p-3 w-[105px] rotate-[10deg] pointer-events-auto font-mono text-[8px] text-zinc-500 leading-normal hidden lg:block z-20"
                style={{ x: px, y: py }}
                whileHover={{ scale: 1.05, rotate: 12, y: -2 }}
              >
                <div className="absolute -top-2.5 left-6 w-7 h-3 bg-red-200/30 rotate-[-5deg] border border-dashed border-red-300/10" />
                <div className="text-center font-bold border-b border-dashed border-zinc-300 pb-1 mb-1">LOFI COFFEE</div>
                <div>1x LATTE ....... $4.50</div>
                <div>1x MATCHA ...... $5.00</div>
                <div className="border-t border-dashed border-zinc-300 mt-1 pt-1 font-bold">TOTAL ....... $9.50</div>
                <div className="text-[6px] text-zinc-400 mt-2 text-center">THANKS FOR SHARING ♡</div>
              </motion.div>
            )}

            {/* Vintage Photobooth Strip (Top Right) */}
            {!isMobile && (
              <motion.div
                className="absolute right-[-440px] top-[-110px] bg-[#FAF8F5] border border-gray-200/80 shadow-md p-1.5 w-[75px] flex flex-col gap-1.5 rotate-[8deg] pointer-events-auto hidden lg:flex z-20"
                style={{ x: px, y: py }}
                whileHover={{ scale: 1.06, rotate: 4, y: -4 }}
                transition={{ type: "spring", stiffness: 180, damping: 15 }}
              >
                <div className="absolute -top-2.5 left-3 w-6 h-3.5 bg-sky-200/40 rotate-[-12deg] border border-sky-300/10 shadow-xs" />
                <div className="aspect-[4/3] bg-zinc-100 border border-zinc-200/50 flex items-center justify-center overflow-hidden">
                  <img src={supportPhoto1?.src || mainPhoto.src} className="object-cover w-full h-full grayscale opacity-75" alt="" />
                </div>
                <div className="aspect-[4/3] bg-zinc-100 border border-zinc-200/50 flex items-center justify-center overflow-hidden">
                  <img src={mainPhoto.src} className="object-cover w-full h-full grayscale opacity-75" alt="" />
                </div>
                <div className="aspect-[4/3] bg-zinc-100 border border-zinc-200/50 flex items-center justify-center overflow-hidden">
                  <img src={supportPhoto2?.src || mainPhoto.src} className="object-cover w-full h-full grayscale opacity-75" alt="" />
                </div>
                <div className="text-[6px] font-mono text-zinc-400 text-center uppercase tracking-widest pb-0.5">smile! ⚡</div>
              </motion.div>
            )}

            {/* Pressed Dried Flower (Bottom Right Corner) */}
            {!isMobile && (
              <motion.div
                className="absolute right-[-230px] bottom-[-110px] w-14 h-20 opacity-70 pointer-events-auto select-none hidden md:block z-30"
                style={{ x: fgX, y: fgY }}
                animate={{ rotate: [0, 1.5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.08, rotate: -3 }}
              >
                <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-current text-emerald-800/40">
                  <path d="M50,110 C52,90 48,50 50,30" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50,80 C35,75 25,65 30,60 C35,55 45,68 50,80" strokeWidth="2" fill="rgba(6, 78, 59, 0.08)" />
                  <path d="M50,60 C65,55 75,45 70,40 C65,35 55,48 50,60" strokeWidth="2" fill="rgba(6, 78, 59, 0.08)" />
                  <circle cx="50" cy="30" r="8" fill="rgba(245, 158, 11, 0.25)" className="text-amber-600/30" strokeWidth="1.5" />
                  {[...Array(6)].map((_, i) => {
                    const angle = (i * 60 * Math.PI) / 180;
                    const px_coord = 50 + Math.cos(angle) * 14;
                    const py_coord = 30 + Math.sin(angle) * 14;
                    return (
                      <path
                        key={i}
                        d={`M50,30 Q${50 + Math.cos(angle - 0.2) * 18},${30 + Math.sin(angle - 0.2) * 18} ${px_coord},${py_coord} Q${50 + Math.cos(angle + 0.2) * 18},${30 + Math.sin(angle + 0.2) * 18} 50,30`}
                        fill="rgba(244, 63, 94, 0.16)"
                        className="text-pink-500/20"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </motion.div>
            )}

            {/* Subtle background doodles & stickers framing the hero stack (Layer 4) */}
            <motion.div 
              className="absolute inset-0 pointer-events-none z-30 hidden md:block"
              style={{ x: fgX, y: fgY }}
            >
              <Doodle type="star" className="absolute top-[-25%] left-[-15%] w-8 h-8" color="yellow" delay={2.0} />
              <Doodle type="heart" className="absolute bottom-[-15%] right-[-15%] w-9 h-9" color="pink" delay={2.2} />
              <Sticker emoji="💖" className="absolute right-[calc(100%+6rem)] top-[-10%] scale-[0.8]" rotation={12} />
              <Sticker emoji="☕" className="absolute left-[calc(100%+6rem)] bottom-[-10%] scale-[0.75]" rotation={-15} />
            </motion.div>

            {/* Mobile Carousel Indicators (Dots) */}
            {isMobile && (
              <div className="flex gap-2.5 justify-center mt-6 z-40 relative">
                {mobilePhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMobileIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      activeMobileIndex === i
                        ? (isDark ? "bg-pink-400 scale-125 shadow-sm" : "bg-accent-pink scale-110")
                        : (isDark ? "bg-white/30" : "bg-text-ink/20")
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

        {/* Subtle Memory Counter Label (Ink Style) */}
        {!isMobile && (
          <div className="absolute right-[16%] bottom-[12%] opacity-55 hidden lg:block rotate-[3deg] z-20">
            <span className={`font-handwritten text-[13px] tracking-wide select-none ${
              isDark ? "text-zinc-300" : "text-text-ink/80"
            }`}>
              {friendshipConfig.hero.footerLabel}
            </span>
          </div>
        )}

        {/* Mobile-Only Cured Details */}
        {isMobile && (
          <div className="w-full flex flex-col items-center justify-center gap-1 z-30 px-6 -mt-2 mb-2">
            <span className={`font-handwritten text-xs italic ${
              isDark ? "text-zinc-400" : "text-text-ink/65"
            }`}>
              {friendshipConfig.hero.swipeLabel}
            </span>
          </div>
        )}

        {/* Continue Button */}
        <ContinueButton onClick={handleContinue} />

      </motion.div>
    </ScrapbookCanvas>
  );
};
