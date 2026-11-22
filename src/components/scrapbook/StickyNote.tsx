"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface StickyNoteProps {
  question: string;
  answer: string;
  reaction: string;
  color?: "yellow" | "pink" | "blue" | "green";
  tilt?: number;
  className?: string;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  question,
  answer,
  reaction,
  color = "yellow",
  tilt = 2,
  className = "",
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Styling maps for the front/back colors
  const colorMap = {
    yellow: "bg-[#FCF6C5] border-[#F0E6A0] text-amber-950",
    pink: "bg-[#FFD2DF] border-[#FFAEC4] text-rose-950",
    blue: "bg-[#D6ECFF] border-[#B8D8F7] text-blue-950",
    green: "bg-[#D5F3DB] border-[#BCE1C5] text-emerald-950",
  };

  const pinColors = {
    yellow: "bg-red-500 shadow-red-700/50",
    pink: "bg-teal-500 shadow-teal-700/50",
    blue: "bg-amber-500 shadow-amber-700/50",
    green: "bg-indigo-500 shadow-indigo-700/50",
  };

  return (
    <div
      className={`relative w-full aspect-square max-w-[280px] cursor-pointer select-none perspective-[1000px] ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        transform: `rotate(${tilt}deg)`,
      }}
    >
      {/* Visual Push Pin */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        {/* Pin Head */}
        <div
          className={`w-4 h-4 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_3px_5px_rgba(0,0,0,0.2)] ${pinColors[color]}`}
        />
        {/* Pin Neck */}
        <div className="w-1 h-3 bg-zinc-400 -mt-1 shadow-sm" />
      </div>

      {/* 3D Card Container */}
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-700 ease-out"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={{
          scale: 1.03,
          y: -4,
          transition: { duration: 0.2 },
        }}
      >
        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden sticky-shadow p-6 flex flex-col justify-between border-t-4 border-l ${colorMap[color]}`}
          style={{
            borderRadius: "4px 20px 8px 25px / 20px 8px 25px 4px",
          }}
        >
          {/* Note Lines Visual */}
          <div className="absolute inset-0 bg-transparent opacity-10 pointer-events-none flex flex-col justify-evenly py-6 px-4">
            <hr className="border-current" />
            <hr className="border-current" />
            <hr className="border-current" />
            <hr className="border-current" />
          </div>

          <div className="z-10 flex-grow flex items-center justify-center text-center">
            <h3 className="font-handwritten text-3xl leading-snug font-bold">
              {question}
            </h3>
          </div>
          <div className="z-10 text-right font-handwritten text-sm opacity-60">
            Click to open card ✨
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 w-full h-full backface-hidden rotateY-180 sticky-shadow p-6 flex flex-col justify-between border-t-4 border-l ${colorMap[color]} bg-opacity-95`}
          style={{
            borderRadius: "4px 20px 8px 25px / 20px 8px 25px 4px",
          }}
        >
          {/* Reaction Emoji Watermark */}
          <div className="absolute top-2 right-4 text-4xl select-none opacity-30 animate-bounce duration-[2000ms]">
            {reaction}
          </div>

          <div className="z-10 flex-grow flex flex-col justify-center items-center text-center pt-4">
            <p className="font-sans text-lg font-medium leading-relaxed mb-4">
              {answer}
            </p>
            <span className="text-4xl animate-bounce">{reaction}</span>
          </div>

          <div className="z-10 text-center font-handwritten text-sm opacity-60">
            Click to close card 🫂
          </div>
        </div>
      </motion.div>
    </div>
  );
};
