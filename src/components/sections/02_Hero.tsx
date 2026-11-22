"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Polaroid } from "../scrapbook/Polaroid";
import { Doodle } from "../scrapbook/Doodle";
import { Sticker } from "../scrapbook/Sticker";
import { MemoryPhoto } from "@/config/friendship";

interface HeroProps {
  title: string;
  subtitle: string;
  polaroids: MemoryPhoto[];
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle, polaroids }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Framer Motion values for cursor-following parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate cursor positions relative to container center
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Reset positions on leave
    mouseX.set(0);
    mouseY.set(0);
  };

  // Create different movement ranges for each polaroid for layered parallax depth
  const px1 = useTransform(mouseX, [-300, 300], [-15, 15]);
  const py1 = useTransform(mouseY, [-300, 300], [-15, 15]);

  const px2 = useTransform(mouseX, [-300, 300], [25, -25]);
  const py2 = useTransform(mouseY, [-300, 300], [25, -25]);

  const px3 = useTransform(mouseX, [-300, 300], [-8, 8]);
  const py3 = useTransform(mouseY, [-300, 300], [-8, 8]);

  // Tape color assignments
  const tapeColors: ("yellow" | "pink" | "blue" | "green")[] = ["yellow", "pink", "blue"];
  const tapePositions: ("top-center" | "top-left" | "top-right")[] = ["top-left", "top-right", "top-center"];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen py-20 px-6 flex flex-col items-center justify-center overflow-visible select-none"
    >
      {/* Background doodles and stars */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <Doodle type="star" className="absolute top-[15%] left-[20%] w-10 h-10 rotate-12" color="yellow" />
        <Doodle type="heart" className="absolute top-[35%] right-[25%] w-12 h-12 -rotate-12" color="pink" />
        <Doodle type="sparkle" className="absolute bottom-[20%] left-[15%] w-8 h-8" color="green" />
        <Doodle type="underline" className="absolute bottom-[35%] right-[10%] w-36 h-8 rotate-3" color="blue" />
      </div>

      {/* Main Title Header */}
      <div className="text-center max-w-2xl z-20 mb-16 md:mb-24">
        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Big cursive text */}
          <h1 className="font-handwritten text-7xl md:text-9xl font-bold tracking-tight text-text-ink">
            {title}
          </h1>
          <Doodle
            type="circle"
            className="absolute -inset-4 w-[120%] h-[120%] -translate-x-[8%] -translate-y-[2%] opacity-75"
            color="pink"
            duration={1.2}
            delay={0.6}
          />
        </motion.div>

        <motion.p
          className="font-sans text-xl md:text-2xl text-text-ink/80 font-semibold mt-6 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Scattered Polaroid Collage Container */}
      <div className="relative w-full max-w-4xl h-[400px] md:h-[500px] flex items-center justify-center">
        
        {/* POLAROID 1 (Left background layer) */}
        {polaroids[0] && (
          <motion.div
            className="absolute left-[5%] md:left-[15%] top-[10%] max-w-[200px] md:max-w-[250px] z-10"
            style={{ x: px1, y: py1 }}
          >
            <Polaroid
              src={polaroids[0].src}
              caption={polaroids[0].caption}
              date={polaroids[0].date}
              rotation={polaroids[0].rotation}
              tapeColor={tapeColors[0]}
              tapePosition={tapePositions[0]}
            />
          </motion.div>
        )}

        {/* POLAROID 2 (Right background layer) */}
        {polaroids[1] && (
          <motion.div
            className="absolute right-[5%] md:right-[15%] top-[15%] max-w-[200px] md:max-w-[250px] z-10"
            style={{ x: px2, y: py2 }}
          >
            <Polaroid
              src={polaroids[1].src}
              caption={polaroids[1].caption}
              date={polaroids[1].date}
              rotation={polaroids[1].rotation}
              tapeColor={tapeColors[1]}
              tapePosition={tapePositions[1]}
            />
          </motion.div>
        )}

        {/* POLAROID 3 (Center foreground layer) */}
        {polaroids[2] && (
          <motion.div
            className="absolute top-[35%] md:top-[30%] max-w-[220px] md:max-w-[280px] z-20"
            style={{ x: px3, y: py3 }}
          >
            <Polaroid
              src={polaroids[2].src}
              caption={polaroids[2].caption}
              date={polaroids[2].date}
              rotation={polaroids[2].rotation}
              tapeColor={tapeColors[2]}
              tapePosition={tapePositions[2]}
            />
          </motion.div>
        )}

        {/* Scattered Stickers around the collage */}
        <Sticker
          emoji="🍕"
          className="absolute left-[38%] top-[12%] z-20"
          rotation={-15}
          scale={0.9}
        />
        <Sticker
          emoji="💖"
          className="absolute right-[36%] bottom-[45%] z-20"
          rotation={10}
          scale={1}
        />
        <Sticker
          emoji="☕"
          className="absolute left-[20%] bottom-[8%] z-20"
          rotation={25}
          scale={0.9}
        />
        <Sticker
          emoji="🌈"
          className="absolute right-[18%] top-[8%] z-20"
          rotation={-5}
          scale={0.95}
        />
      </div>
    </section>
  );
};
