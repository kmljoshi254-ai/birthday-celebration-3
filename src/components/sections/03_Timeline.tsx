"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Polaroid } from "../scrapbook/Polaroid";
import { Doodle } from "../scrapbook/Doodle";
import { Sticker } from "../scrapbook/Sticker";
import { TimelineEvent } from "@/config/friendship";

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress for drawing the dashed path line
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col items-center select-none"
    >
      {/* Section Header */}
      <div className="text-center mb-20 relative">
        <h2 className="font-handwritten text-5xl md:text-6xl font-bold text-text-ink relative inline-block">
          Our Little Timeline
          <Doodle
            type="underline"
            className="absolute left-0 bottom-[-12px] w-full h-4"
            color="green"
          />
        </h2>
        <p className="font-sans text-lg text-text-ink/60 font-semibold mt-6">
          A scrapbook record of how we survived each other so far.
        </p>
      </div>

      {/* Timeline Content */}
      <div className="relative w-full mt-12 flex flex-col items-center">
        {/* Draw-on-scroll center line */}
        <div className="absolute top-0 bottom-0 left-[20px] md:left-1/2 md:-translate-x-1/2 w-1 z-0">
          {/* Base Light Dashed Line */}
          <div className="absolute inset-0 border-r-4 border-dashed border-text-ink/10" />
          {/* Solid Colored Active Scroll Line */}
          <motion.div
            className="absolute top-0 w-1 bg-accent-green rounded-full origin-top"
            style={{ height: "100%", scaleY }}
          />
        </div>

        {/* Timeline Events List */}
        <div className="w-full flex flex-col gap-24 z-10">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={event.year}
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between w-full pl-12 md:pl-0 ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Center Timeline Node Marker */}
                <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 top-4 md:top-auto z-20 flex items-center justify-center">
                  <motion.div
                    className="w-10 h-10 rounded-full border-4 border-white paper-shadow flex items-center justify-center text-xl font-bold bg-[#FCF6C5] select-none"
                    initial={{ scale: 0.6, rotate: -30 }}
                    whileInView={{ scale: 1.1, rotate: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    🌻
                  </motion.div>
                </div>

                {/* Left Side: Photo Polaroid */}
                <div className="w-full md:w-[45%] flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 80 : -80, rotate: isEven ? 10 : -10 }}
                    whileInView={{ opacity: 1, x: 0, rotate: isEven ? -4 : 4 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="max-w-[240px] md:max-w-[280px]"
                  >
                    <Polaroid
                      src={event.image}
                      caption={event.year}
                      date={event.tag}
                      rotation={isEven ? -4 : 4}
                      tapeColor={isEven ? "green" : "pink"}
                    />
                  </motion.div>
                </div>

                {/* Right Side: Text details */}
                <div className="w-full md:w-[45%] mt-6 md:mt-0 flex flex-col justify-center items-start text-left bg-white/40 p-6 rounded-2xl border border-text-ink/5 paper-shadow backdrop-blur-sm relative group hover:bg-white/60 transition-colors duration-300">
                  {/* Pin doodle decoration */}
                  <div className="absolute top-2 right-4 font-handwritten text-xl font-bold text-accent-pink select-none">
                    ⭐
                  </div>

                  <span className="font-handwritten text-4xl text-accent-green font-bold leading-none mb-2 block">
                    {event.year}
                  </span>
                  
                  <h3 className="font-sans text-xl font-extrabold text-text-ink mb-3">
                    {event.title}
                  </h3>

                  <p className="font-sans text-base leading-relaxed text-text-ink/80 font-medium">
                    {event.text}
                  </p>

                  {/* Curvy underline svg under title */}
                  <Doodle type="underline" className="w-32 h-3 mt-1.5 opacity-60" color="green" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative timeline bottom sticker */}
      <div className="mt-16 text-center z-10">
        <Sticker emoji="🎈" rotation={-10} scale={1.1} />
      </div>
    </section>
  );
};
