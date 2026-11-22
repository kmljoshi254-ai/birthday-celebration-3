"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Polaroid } from "../scrapbook/Polaroid";
import { Doodle } from "../scrapbook/Doodle";
import { Sticker } from "../scrapbook/Sticker";
import { MemoryPhoto } from "@/config/friendship";

interface ScrapbookProps {
  photos: MemoryPhoto[];
}

export const Scrapbook: React.FC<ScrapbookProps> = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);

  // Tape color lists to cycle through
  const tapeColors: ("yellow" | "pink" | "blue" | "green")[] = [
    "pink",
    "yellow",
    "blue",
    "green",
  ];

  return (
    <section className="relative min-h-screen py-24 px-6 select-none bg-paper/30 overflow-visible">
      {/* Section Header */}
      <div className="text-center mb-16 relative z-10">
        <h2 className="font-handwritten text-5xl md:text-6xl font-bold text-text-ink relative inline-block">
          Memory Scrapbook
          <Doodle
            type="circle"
            className="absolute -inset-4 w-[115%] h-[125%] -translate-x-[7%] -translate-y-[8%] opacity-30"
            color="pink"
          />
        </h2>
        <p className="font-sans text-lg text-text-ink/60 font-semibold mt-6">
          A scattered desk of moments. Tap to inspect up close.
        </p>
      </div>

      {/* Scattered Polaroids Layout */}
      {/* On desktop: grid of overlapping items with coordinate tweaks; on mobile: clean responsive masonry/list */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-y-16 md:gap-x-12 relative">
        {photos.map((photo, index) => {
          // Assign pseudo-random tapes & rotation adjustments
          const tapeColor = tapeColors[index % tapeColors.length];
          const tapePosition = index % 3 === 0 ? "top-left" : index % 3 === 1 ? "top-right" : "top-center";

          return (
            <motion.div
              key={photo.caption}
              className="flex justify-center items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: index * 0.05,
              }}
            >
              <Polaroid
                src={photo.src}
                caption={photo.caption}
                date={photo.date}
                rotation={photo.rotation}
                tapeColor={tapeColor}
                tapePosition={tapePosition}
                onClick={() => setSelectedPhoto(photo)}
              />
            </motion.div>
          );
        })}

        {/* Floating stickers layered between images */}
        <Sticker emoji="🌸" className="absolute left-[8%] top-[25%] z-0" rotation={15} scale={0.8} />
        <Sticker emoji="🎸" className="absolute right-[12%] top-[45%] z-0" rotation={-25} scale={0.85} />
        <Sticker emoji="🍉" className="absolute left-[45%] bottom-[12%] z-0" rotation={5} scale={0.8} />
        <Sticker emoji="🐱" className="absolute right-[25%] bottom-[4%] z-0" rotation={-10} scale={0.9} />
      </div>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
            {/* Click outside to close */}
            <div
              className="absolute inset-0 cursor-zoom-out"
              onClick={() => setSelectedPhoto(null)}
            />

            <motion.div
              className="relative bg-white p-6 pb-9 rounded-md polaroid-shadow border border-zinc-200 w-full max-w-lg z-10 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.85, opacity: 0, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-text-ink transition-colors cursor-pointer"
                aria-label="Close photo details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tape visual decoration */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-32 h-9 washi-tape bg-accent-pink/80 border-accent-pink/30 flex items-center justify-center text-accent-pink pointer-events-none select-none z-20"
                   style={{ transform: "rotate(-2deg)", clipPath: "polygon(0% 15%, 5% 0%, 12% 12%, 18% 3%, 25% 15%, 32% 4%, 39% 14%, 48% 2%, 55% 12%, 62% 3%, 70% 14%, 78% 2%, 85% 15%, 92% 5%, 100% 15%, 98% 85%, 93% 100%, 86% 89%, 79% 97%, 72% 86%, 65% 98%, 56% 87%, 48% 99%, 40% 86%, 33% 97%, 26% 86%, 19% 99%, 11% 88%, 4% 100%, 0% 85%)" }} />

              {/* Large Image Frame */}
              <div className="relative w-full aspect-square bg-gray-50 border border-gray-100 mt-4 overflow-hidden">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Custom Captions details inside Modal */}
              <div className="mt-6 text-center">
                <h3 className="font-handwritten text-4xl text-text-ink font-bold">
                  {selectedPhoto.caption}
                </h3>
                {selectedPhoto.date && (
                  <span className="font-handwritten text-xl text-text-ink/50 mt-1 block">
                    {selectedPhoto.date}
                  </span>
                )}
                
                {/* Cute heart outline drawing below caption */}
                <Doodle type="heart" className="w-8 h-8 mx-auto mt-3 opacity-60" color="pink" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
