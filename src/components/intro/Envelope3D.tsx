"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Doodle } from "../scrapbook/Doodle";

interface Envelope3DProps {
  isOpen: boolean;
  onOpenTrigger: () => void;
}

export const Envelope3D: React.FC<Envelope3DProps> = ({
  isOpen,
  onOpenTrigger,
}) => {
  // Parallax motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth springs for lag-free cursor tracking
  const springConfig = { stiffness: 85, damping: 22, mass: 0.6 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  // Map coordinate offsets to 3D rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const translateZ = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  useEffect(() => {
    if (isOpen) {
      // Reset parallax rotation when open is active to simplify transition
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position relative to window center (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      rawX.set(x);
      rawY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen, rawX, rawY]);

  return (
    <div className="relative w-80 h-52 md:w-96 md:h-60 perspective-[1200px] select-none z-10 flex items-center justify-center">
      {/* 3D Envelope Wrapper */}
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          z: translateZ,
        }}
        onClick={onOpenTrigger}
        whileHover={!isOpen ? { scale: 1.03 } : undefined}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* ENVELOPE BACK FLAP */}
        <div className="absolute inset-0 bg-[#EADCC7] rounded-xl border border-text-ink/5 shadow-md z-0" />

        {/* EMERGING LETTER CARD */}
        <motion.div
          className="absolute inset-x-4 top-2 bg-[#FCFAF2] rounded-lg border border-[#e2d5bd] polaroid-shadow p-6 flex flex-col justify-between z-10"
          style={{ height: "90%" }}
          initial={{ y: 0, z: -1, scale: 0.96 }}
          animate={
            isOpen
              ? { y: -140, z: 20, scale: 1.05, rotate: -2 }
              : { y: 0, z: -1, scale: 0.96 }
          }
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 18,
            delay: isOpen ? 0.6 : 0, // Wait for top flap to flip open
          }}
        >
          {/* Subtle notebook lines decoration */}
          <div className="absolute inset-y-0 left-6 w-0.5 bg-red-200/40" />
          
          <div className="pl-6 flex-grow flex flex-col justify-center text-left">
            <span className="font-handwritten text-lg text-accent-pink font-bold block mb-1">
              psst...
            </span>
            <p className="font-sans text-base md:text-lg font-bold text-text-ink leading-snug">
              someone has made a beautiful surprise just for you.
            </p>
          </div>
          <div className="text-right font-handwritten text-xs text-text-ink/40 pr-2">
            ♡ your bestie
          </div>
        </motion.div>

        {/* LEFT FLAP */}
        <div
          className="absolute left-0 inset-y-0 w-1/2 bg-[#E3D4BC] border-r border-text-ink/5 z-20"
          style={{
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
            transform: "translateZ(1px)",
          }}
        />

        {/* RIGHT FLAP */}
        <div
          className="absolute right-0 inset-y-0 w-1/2 bg-[#E3D4BC] border-l border-text-ink/5 z-20"
          style={{
            clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
            transform: "translateZ(1px)",
          }}
        />

        {/* BOTTOM FLAP */}
        <div
          className="absolute inset-x-0 bottom-0 h-3/5 bg-[#DCCBB1] border-t border-text-ink/5 rounded-b-xl z-20"
          style={{
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            transform: "translateZ(2px)",
          }}
        />

        {/* TOP FLAP (Folds downwards using origin-top 3D rotation) */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[52%] origin-top z-30"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            transformStyle: "preserve-3d",
          }}
          initial={{ rotateX: 0 }}
          animate={isOpen ? { rotateX: 185 } : { rotateX: 0 }}
          transition={{
            type: "spring",
            stiffness: 110,
            damping: 20,
            delay: isOpen ? 0.1 : 0,
          }}
        >
          {/* Outer Side (visible when closed) */}
          <div className="absolute inset-0 bg-[#D4C1A5] border-b border-text-ink/5 shadow-[inset_0_-8px_10px_rgba(0,0,0,0.05)] backface-hidden flex items-end justify-center pb-2">
            {/* Wax Seal Sticker */}
            <div className="w-10 h-10 rounded-full bg-accent-pink border border-white flex items-center justify-center text-white text-base shadow-md select-none transform translate-y-4">
              ❤️
            </div>
          </div>
          
          {/* Inner Side (visible when open) */}
          <div className="absolute inset-0 bg-[#C8B498] rotateX-180 backface-hidden" />
        </motion.div>

        {/* Decorative shadow layer beneath the envelope */}
        <div className="absolute -bottom-8 left-4 right-4 h-6 bg-black/10 rounded-full blur-lg pointer-events-none -z-10" />
      </motion.div>
    </div>
  );
};
