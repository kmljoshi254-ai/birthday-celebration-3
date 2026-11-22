"use client";

import React from "react";
import { motion } from "framer-motion";
import { Doodle } from "../scrapbook/Doodle";
import { Sticker } from "../scrapbook/Sticker";
import { Award } from "@/config/friendship";

interface AwardsProps {
  awards: Award[];
}

export const Awards: React.FC<AwardsProps> = ({ awards }) => {
  // Pastel colors to rotate for the yearbook frame cards
  const colors = [
    "bg-accent-pink/15 border-accent-pink/30 hover:bg-accent-pink/25",
    "bg-accent-yellow/20 border-accent-yellow/40 hover:bg-accent-yellow/30",
    "bg-accent-blue/15 border-accent-blue/30 hover:bg-accent-blue/25",
    "bg-accent-green/15 border-accent-green/30 hover:bg-accent-green/25",
  ];

  const badgeIcons = ["🏆", "🥇", "🎖️", "⭐"];

  return (
    <section className="relative min-h-screen py-24 px-6 select-none flex flex-col items-center justify-center">
      {/* Background doodles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Doodle type="star" className="absolute top-[10%] left-[8%] w-16 h-16" color="yellow" />
        <Doodle type="sparkle" className="absolute bottom-[10%] left-[20%] w-12 h-12" color="pink" />
        <Doodle type="heart" className="absolute top-[25%] right-[10%] w-14 h-14" color="pink" />
      </div>

      {/* Header */}
      <div className="text-center mb-20 relative">
        <span className="font-handwritten text-2xl text-accent-pink font-bold block mb-1">
          YEARBOOK HIGHLIGHTS
        </span>
        <h2 className="font-handwritten text-5xl md:text-6xl font-bold text-text-ink relative inline-block">
          Our Greatest Hits
          <Doodle
            type="circle"
            className="absolute -inset-3 w-[110%] h-[120%] -translate-x-[5%] opacity-45"
            color="yellow"
          />
        </h2>
        <p className="font-sans text-lg text-text-ink/60 font-semibold mt-6">
          Honorable mentions for surviving our shared chaos.
        </p>
      </div>

      {/* Cards Layout Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {awards.map((award, index) => {
          const colorClass = colors[index % colors.length];

          return (
            <motion.div
              key={award.title}
              className={`p-8 rounded-3xl border-2 paper-shadow flex items-start gap-6 transition-all duration-300 ${colorClass}`}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{
                scale: 1.03,
                y: -6,
                boxShadow: "0 12px 28px rgba(44, 37, 32, 0.1)",
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 14,
                delay: index * 0.05,
              }}
            >
              {/* Badge Icon circle */}
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-sm border border-text-ink/5 shrink-0 select-none">
                {badgeIcons[index % badgeIcons.length] || award.icon}
              </div>

              {/* Text */}
              <div className="flex-grow">
                <h3 className="font-sans text-xl font-extrabold text-text-ink mb-2">
                  {award.title}
                </h3>
                <p className="font-sans text-base leading-relaxed text-text-ink/75 font-medium">
                  {award.text}
                </p>
                {/* Visual sketch underline */}
                <Doodle type="underline" className="w-24 h-3 mt-2.5 opacity-40" color="pink" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative center stamp */}
      <div className="mt-16 text-center">
        <Sticker emoji="🏆" rotation={5} scale={1.1} />
      </div>
    </section>
  );
};
