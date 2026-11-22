"use client";

import React from "react";
import { motion } from "framer-motion";

interface StickerProps {
  emoji: string;
  className?: string;
  rotation?: number; // initial tilt
  scale?: number;
}

export const Sticker: React.FC<StickerProps> = ({
  emoji,
  className = "",
  rotation = 0,
  scale = 1,
}) => {
  return (
    <motion.div
      className={`inline-flex items-center justify-center p-2.5 bg-white rounded-full border-2 border-white shadow-md cursor-pointer select-none origin-center pointer-events-auto ${className}`}
      style={{
        rotate: `${rotation}deg`,
        scale: scale,
      }}
      initial={{ scale: 0, opacity: 0, rotate: rotation - 20 }}
      whileInView={{
        scale: scale,
        opacity: 1,
        rotate: rotation,
        transition: { type: "spring", stiffness: 200, damping: 12, delay: 0.1 },
      }}
      whileHover={{
        scale: scale * 1.25,
        rotate: [rotation, rotation - 10, rotation + 10, rotation - 5, rotation],
        transition: { duration: 0.4 },
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <span className="text-3xl leading-none md:text-4xl filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
        {emoji}
      </span>
    </motion.div>
  );
};
