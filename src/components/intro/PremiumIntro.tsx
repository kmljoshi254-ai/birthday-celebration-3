"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasContainer } from "../scene3d/CanvasContainer";
import { AudioController } from "./AudioController";
import { Doodle } from "../scrapbook/Doodle";
import { fireCelebrationConfetti, fireSideConfetti } from "../ui/Confetti";
import { friendshipConfig } from "@/config/friendship";

interface PremiumIntroProps {
  onOpenComplete: () => void;
  onEnvelopeOpen?: () => void;
}

export const PremiumIntro: React.FC<PremiumIntroProps> = ({
  onOpenComplete,
  onEnvelopeOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrapbookOpening, setIsScrapbookOpening] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic Theme Colors
  const [accentColor, setAccentColor] = useState("#D47A8F"); // Warm Rose default
  const [pickerOpen, setPickerOpen] = useState(false);

  // Theme presets
  const themes = [
    { name: "Warm Rose", hex: "#D47A8F" },
    { name: "Sage Green", hex: "#89AC94" },
    { name: "Sky Blue", hex: "#7EAFCE" },
    { name: "Honey Yellow", hex: "#F2CA65" },
    { name: "Kraft Brown", hex: "#BFA28F" },
  ];

  // Mobile interactive states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Tailwind custom property variables dynamically on accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent-pink", accentColor);
  }, [accentColor]);

  // Monitor viewport size to scale UI layouts
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger opening animation sequence
  const handleOpen = () => {
    if (isOpen || isTransitioning) return;
    
    setIsOpen(true);
    if (onEnvelopeOpen) {
      onEnvelopeOpen();
    }

    // Burst confetti
    setTimeout(() => {
      if (isMobile) {
        fireSideConfetti();
      } else {
        fireCelebrationConfetti();
      }
    }, 1250);
  };

  // Trigger page transition once proceed card is clicked
  const handleProceed = () => {
    setIsScrapbookOpening(true);

    setTimeout(() => {
      setIsTransitioning(true);
    }, 450);

    setTimeout(() => {
      onOpenComplete();
    }, 1100);
  };

  // Trigger toast alerts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden select-none z-50">
      
      {/* 3D WEBGL CONTAINER (Active on all viewports) */}
      <CanvasContainer
        activeSceneIndex={0}
        isEnvelopeOpen={isOpen}
        onEnvelopeOpenTrigger={handleOpen}
        onProceed={handleProceed}
        onMusicToast={triggerToast}
        isScrapbookOpening={isScrapbookOpening}
        accentColor={accentColor}
      />

      {/* 2D/3D SYNCED THEME COLOR PICKER WIDGET */}
      <div className="absolute top-4 left-4 flex items-center pointer-events-auto z-40">
        <button
          onClick={() => {
            AudioController.playPopClick();
            setPickerOpen(!pickerOpen);
          }}
          className="w-10 h-10 rounded-full bg-white border border-text-ink/10 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all text-lg cursor-pointer"
          title="Pick theme color"
        >
          🎨
        </button>
        
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              className="flex items-center gap-2 bg-white/95 border border-text-ink/10 rounded-full px-3 py-1.5 shadow-md ml-2"
              initial={{ opacity: 0, x: -15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              {themes.map((t) => (
                <button
                  key={t.hex}
                  onClick={() => {
                    setAccentColor(t.hex);
                    AudioController.playPopClick();
                    triggerToast(`${t.name} Theme ✨`);
                  }}
                  style={{ backgroundColor: t.hex }}
                  className={`w-6 h-6 rounded-full border border-black/10 cursor-pointer transition-all hover:scale-115 active:scale-90 relative ${
                    accentColor === t.hex ? "ring-2 ring-zinc-800 ring-offset-1" : ""
                  }`}
                  title={t.name}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Toast Notification Bubble (HUD) */}
      <div className="absolute top-[20%] inset-x-0 flex justify-center pointer-events-none z-30">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="bg-white border border-text-ink/10 px-5 py-2.5 rounded-full shadow-lg text-xs font-handwritten font-extrabold text-accent-pink flex items-center gap-1.5"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              ✨ {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TOP Header (Soft typography style) */}
      <div className="absolute top-4.5 left-6 md:top-6 md:left-14 text-[9px] md:text-[10px] tracking-[0.25em] text-text-ink/55 uppercase font-bold font-sans flex items-center gap-1 select-none pointer-events-none z-10">
        <span>{friendshipConfig.headerTextLeft}</span>
        <span className="text-accent-pink">♡</span>
        <span>{friendshipConfig.headerTextRight}</span>
      </div>

      {/* DESKTOP BACKGROUND BANNER: Birds lifting ribbon banner (Desktop Only) */}
      {!isMobile && (
        <motion.div
          className="absolute top-[10%] left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-none z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: 0.4 },
            y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
          }}
        >
          {/* Left Flapping Bluebird */}
          <div className="flex flex-col items-center">
            <svg className="w-20 h-20 text-[#A2C2E1] fill-current drop-shadow-md" viewBox="0 0 64 64">
              <path d="M48,20 C42,20 38,24 34,28 C32,26 28,24 24,24 C14,24 8,32 8,42 C8,48 14,52 20,52 C26,52 30,48 34,44 C38,48 42,50 48,50 C56,50 60,42 60,35 C60,27 56,20 48,20 Z" />
              <motion.path
                d="M30,34 C26,26 24,18 28,16 C32,14 36,22 34,30 Z"
                className="origin-bottom-left"
                animate={{ scaleY: [1, -0.6, 1], y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 0.22, ease: "linear" }}
              />
              <polygon points="12,38 4,40 12,42" className="text-yellow-400 fill-current" />
              <circle cx="20" cy="34" r="2.5" className="text-zinc-800 fill-current" />
            </svg>
          </div>

          {/* Ribbon Banner Box */}
          <div className="relative bg-white border-2 border-text-ink/10 px-12 py-5 rounded-[28px] shadow-md flex flex-col items-center justify-center min-w-[460px] text-center">
            <div className="absolute left-[-35px] top-[26px] w-9 h-[2px] border-t-2 border-dashed border-text-ink/30" />
            <div className="absolute right-[-35px] top-[26px] w-9 h-[2px] border-t-2 border-dashed border-text-ink/30" />
            
            <span className="font-handwritten text-3xl text-accent-pink font-extrabold block mb-1">
              {friendshipConfig.bannerTitle}
            </span>
            <span className="font-sans text-xs text-text-ink/75 font-bold tracking-wide">
              {friendshipConfig.bannerSubtitle}
            </span>
          </div>

          {/* Right Flapping Pinkbird (Flipped X) */}
          <div className="flex-col items-center">
            <svg className="w-20 h-20 text-[#F3A3B4] fill-current scale-x-[-1] drop-shadow-md" viewBox="0 0 64 64">
              <path d="M48,20 C42,20 38,24 34,28 C32,26 28,24 24,24 C14,24 8,32 8,42 C8,48 14,52 20,52 C26,52 30,48 34,44 C38,48 42,50 48,50 C56,50 60,42 60,35 C60,27 56,20 48,20 Z" />
              <motion.path
                d="M30,34 C26,26 24,18 28,16 C32,14 36,22 34,30 Z"
                className="origin-bottom-left"
                animate={{ scaleY: [1, -0.6, 1], y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 0.25, ease: "linear" }}
              />
              <polygon points="12,38 4,40 12,42" className="text-yellow-400 fill-current" />
              <circle cx="20" cy="34" r="2.5" className="text-zinc-800 fill-current" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* BOTTOM HUD: Primary envelope CTA (Visible on both desktop & mobile) */}
      <div className="absolute bottom-10 w-full flex flex-col items-center justify-center z-10 pointer-events-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="intro_bottom"
              className="w-full flex flex-col items-center gap-4 pointer-events-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25, transition: { duration: 0.4 } }}
              transition={{ duration: 0.6 }}
            >
              <motion.button
                onClick={handleOpen}
                className="px-6 py-2.5 bg-white text-text-ink hand-drawn-border font-bold text-xs shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5 rotate-[-1deg]"
                whileHover={{ scale: 1.05, y: -2, rotate: 1 }}
                whileTap={{ scale: 0.96, y: 0 }}
              >
                OPEN THE ENVELOPE
                <span className="text-accent-pink animate-pulse">❤️</span>
              </motion.button>
              
              <div className="relative w-full h-4 mt-1 pointer-events-none">
                <Doodle
                  type="sparkle"
                  className="absolute left-[38%] top-0 w-4 h-4 opacity-40"
                  color="yellow"
                />
                <Doodle
                  type="sparkle"
                  className="absolute right-[38%] top-0 w-4 h-4 opacity-40"
                  color="green"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CINEMATIC BLOOM TRANSITION OVERLAY */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white z-[100] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
