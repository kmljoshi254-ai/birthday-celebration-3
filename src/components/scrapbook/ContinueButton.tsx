"use client";

import React from "react";
import { motion } from "framer-motion";

interface ContinueButtonProps {
  onClick: () => void;
  label?: string;
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({
  onClick,
  label = "Continue our story →",
}) => {
  return (
    <div className="relative md:absolute bottom-auto md:bottom-6 left-auto md:left-1/2 transform-none md:-translate-x-1/2 z-40 pointer-events-auto mt-8 md:mt-0 mb-6 md:mb-0 flex justify-center w-full md:w-auto">
      <motion.button
        onClick={onClick}
        className="relative px-6 py-2.5 bg-[#FFFDF9] text-text-ink/80 border-2 border-text-ink/10 shadow-[2px_4px_8px_rgba(44,37,32,0.06)] rounded-full hover:shadow-[3px_6px_12px_rgba(44,37,32,0.1)] active:scale-97 hover:border-accent-pink/40 hover:text-accent-pink cursor-pointer font-handwritten text-xl font-bold transition-colors select-none group"
        initial={{ opacity: 0, y: 30, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={{ delay: 2.2, duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Subtle decorative tape overlay on the side of the tab */}
        <span className="absolute -top-3 -left-3 w-8 h-4 bg-accent-yellow/45 border-l border-r border-dashed border-text-ink/10 rotate-[-15deg] pointer-events-none group-hover:bg-accent-yellow/60 transition-colors" />
        <span className="absolute -bottom-2.5 -right-2 w-6 h-3 bg-accent-pink/40 border-l border-r border-dashed border-text-ink/10 rotate-[25deg] pointer-events-none group-hover:bg-accent-pink/55 transition-colors" />
        
        <span className="relative z-10 flex items-center gap-1.5 px-2">
          {label}
        </span>
      </motion.button>
    </div>
  );
};
