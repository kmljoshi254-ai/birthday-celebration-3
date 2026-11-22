"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";
import { fireCelebrationConfetti, fireSideConfetti } from "../ui/Confetti";
import { Polaroid } from "../scrapbook/Polaroid";
import { Doodle } from "../scrapbook/Doodle";

interface SurpriseBoxProps {
  title: string;
  prompt: string;
  revealText: string;
  surpriseImages: string[];
  onOpenComplete?: () => void;
}

export const SurpriseBox: React.FC<SurpriseBoxProps> = ({
  title,
  prompt,
  revealText,
  surpriseImages,
  onOpenComplete,
}) => {
  // Box state: "closed" | "opening" | "opened"
  const [boxState, setBoxState] = useState<"closed" | "opening" | "opened">("closed");

  const handleOpen = () => {
    if (boxState !== "closed") return;
    
    setBoxState("opening");
    
    // Fire side confetti shoot
    setTimeout(() => {
      fireSideConfetti();
    }, 300);

    // Fire big center celebration confetti
    setTimeout(() => {
      fireCelebrationConfetti();
      setBoxState("opened");
      if (onOpenComplete) onOpenComplete();
    }, 1000);
  };

  // Gift box wiggle shake keyframes
  const shakeVariants = {
    idle: { rotate: 0 },
    hover: {
      rotate: [-1, 2, -2, 2, -1, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
    opening: {
      rotate: [-5, 5, -8, 8, -12, 12, 0],
      scale: [1, 1.1, 1.15, 0.95, 1],
      transition: { duration: 1, ease: "easeInOut" as const },
    },
  };

  return (
    <section className="relative min-h-screen py-24 px-6 select-none bg-paper flex flex-col items-center justify-center overflow-visible">
      {/* Background doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <Doodle type="sparkle" className="absolute top-[20%] left-[10%] w-14 h-14" color="yellow" />
        <Doodle type="heart" className="absolute bottom-[20%] right-[12%] w-16 h-16" color="pink" />
      </div>

      <div className="text-center max-w-xl z-20 mb-12">
        <span className="font-handwritten text-2xl text-accent-pink font-bold block mb-1">
          {title}
        </span>
        <h2 className="font-sans text-3xl md:text-4xl font-extrabold text-text-ink leading-tight">
          {boxState === "opened" ? "🎉 surprise! 🎉" : "The Ultimate Friendship Capsule"}
        </h2>
      </div>

      <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center">
        {/* Closed/Opening Gift Box */}
        {boxState !== "opened" && (
          <motion.div
            onClick={handleOpen}
            className="cursor-pointer relative z-20 flex flex-col items-center justify-center group"
            variants={shakeVariants}
            animate={boxState === "opening" ? "opening" : "idle"}
            whileHover={boxState === "closed" ? "hover" : undefined}
          >
            {/* Glow backing */}
            <div className="absolute -inset-8 bg-accent-yellow/40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Box Lid */}
            <motion.div
              className="w-44 h-12 bg-accent-pink rounded-t-lg border-2 border-text-ink/10 relative z-30 shadow-md flex items-center justify-center"
              animate={boxState === "opening" ? { y: -80, rotate: 20, opacity: 0 } : { y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Ribbon Bow */}
              <div className="absolute -top-6 w-12 h-6 bg-red-400 rounded-t-full border border-text-ink/10" />
            </motion.div>

            {/* Box Body */}
            <div className="w-40 h-36 bg-accent-pink/90 rounded-b-lg border-2 border-text-ink/10 shadow-lg flex items-center justify-center relative overflow-hidden">
              {/* Ribbon line */}
              <div className="absolute inset-y-0 w-8 bg-red-400 border-x border-text-ink/5" />
              <Gift className="w-12 h-12 text-white/90 z-10" />
            </div>

            <span className="font-handwritten text-2xl text-text-ink/80 mt-6 block font-bold border-2 border-dashed border-accent-pink/50 p-2.5 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
              {boxState === "opening" ? "opening..." : prompt}
            </span>
          </motion.div>
        )}

        {/* Opened reveal sequence */}
        <AnimatePresence>
          {boxState === "opened" && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Glowing Aura */}
              <motion.div
                className="absolute w-80 h-80 rounded-full bg-gradient-radial from-accent-yellow/50 via-accent-pink/20 to-transparent blur-3xl -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />

              {/* Reveal text card */}
              <motion.div
                className="bg-white p-6 rounded-2xl polaroid-shadow border-2 border-text-ink/5 text-center max-w-sm mb-8 relative z-20"
                initial={{ scale: 0.4, rotate: -15, y: 50 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              >
                <h3 className="font-handwritten text-4xl text-accent-pink font-bold leading-tight mb-2">
                  {revealText}
                </h3>
                <p className="font-sans text-sm text-text-ink/60 font-semibold">
                  (Custom stickers printed inside) 🍕🌸🚀
                </p>
              </motion.div>

              {/* Floating memories coming out of the box */}
              <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
                
                {/* Floating Polaroid left */}
                {surpriseImages[0] && (
                  <motion.div
                    className="absolute left-[5%] max-w-[140px] md:max-w-[180px] pointer-events-auto"
                    initial={{ x: 100, y: 150, rotate: 30, scale: 0.2 }}
                    animate={{ x: 0, y: -40, rotate: -8, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.2 }}
                  >
                    <Polaroid
                      src={surpriseImages[0]}
                      caption="Dynamic Duo"
                      rotation={-8}
                      tapeColor="green"
                    />
                  </motion.div>
                )}

                {/* Floating Polaroid right */}
                {surpriseImages[1] && (
                  <motion.div
                    className="absolute right-[5%] max-w-[140px] md:max-w-[180px] pointer-events-auto"
                    initial={{ x: -100, y: 150, rotate: -30, scale: 0.2 }}
                    animate={{ x: 0, y: -40, rotate: 8, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.4 }}
                  >
                    <Polaroid
                      src={surpriseImages[1]}
                      caption="Best Friends Forever"
                      rotation={8}
                      tapeColor="blue"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
