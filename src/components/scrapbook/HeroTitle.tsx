"use client";

import React from "react";
import { motion } from "framer-motion";
import { Doodle } from "./Doodle";
import { friendshipConfig } from "@/config/friendship";

interface HeroTitleProps {
  title: string;
  subtitle: string;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({ title, subtitle }) => {
  const isDark = friendshipConfig.theme === "dark";

  return (
    <div className="flex flex-col items-center justify-center text-center relative pointer-events-auto">
      {/* Cursive annotation above the main title */}
      <motion.span
        className={`font-handwritten text-lg md:text-2xl font-bold mb-1.5 md:mb-3 select-none rotate-[-4deg] block ${
          isDark ? "text-amber-200" : "text-accent-pink"
        }`}
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
      >
        {friendshipConfig.hero.annotation}
      </motion.span>

      {/* Main Title "US." */}
      <div className="relative inline-block px-4">
        <motion.h1
          className={`font-handwritten text-6xl md:text-8xl font-black tracking-tight relative z-10 ${
            isDark ? "text-zinc-100" : "text-text-ink"
          }`}
          style={{
            textShadow: isDark 
              ? "1px 1px 0px rgba(0,0,0,0.8), 2px 2px 0px rgba(255,255,255,0.05)"
              : "1px 1px 0px rgba(255,255,255,0.8), 2px 2px 0px rgba(44,37,32,0.15)",
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          {title}
        </motion.h1>

        {/* Loose hand-drawn double circle around the title */}
        <Doodle
          type="circle"
          className="absolute -inset-4 w-[115%] h-[125%] -translate-x-[4%] -translate-y-[8%] opacity-60 pointer-events-none z-0"
          color="pink"
          duration={1.2}
          delay={0.8}
        />
      </div>

      {/* Underline beneath the title */}
      <div className="relative w-48 h-4 mt-2">
        <Doodle
          type="underline"
          className="w-full h-full rotate-[-2deg] opacity-80"
          color="blue"
          duration={0.8}
          delay={0.8}
        />
      </div>

      {/* Subtitle / Caption block */}
      <motion.p
        className={`font-sans text-xs md:text-base font-semibold mt-3.5 max-w-xs md:max-w-md mx-auto leading-relaxed select-none px-4 ${
          isDark ? "text-zinc-300" : "text-text-ink/75"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};
