"use client";

import React from "react";
import { StickyNote } from "../scrapbook/StickyNote";
import { Doodle } from "../scrapbook/Doodle";
import { Sticker } from "../scrapbook/Sticker";
import { InsideJoke } from "@/config/friendship";

interface InsideJokesProps {
  jokes: InsideJoke[];
}

export const InsideJokes: React.FC<InsideJokesProps> = ({ jokes }) => {
  // Rotate styles for sticky notes to make it look messy
  const tilts = [-3, 2, -1, 4];
  const colors: ("yellow" | "pink" | "blue" | "green")[] = ["yellow", "pink", "blue", "green"];

  return (
    <section className="relative min-h-screen py-24 px-6 select-none bg-paper/20 overflow-visible flex flex-col items-center">
      {/* Section Header */}
      <div className="text-center mb-20 relative">
        <h2 className="font-handwritten text-5xl md:text-6xl font-bold text-text-ink relative inline-block">
          Things Only We Understand
          <Doodle
            type="arrow"
            className="absolute -right-16 -top-12 w-14 h-14 rotate-[130deg] hidden md:block"
            color="pink"
          />
        </h2>
        <p className="font-sans text-lg text-text-ink/60 font-semibold mt-6">
          Hover to tilt, click to reveal the story behind the quote.
        </p>
      </div>

      {/* Grid of Pinned Sticky Notes representing the board */}
      <div className="relative w-full max-w-5xl bg-[#efe3d3]/40 border-2 border-text-ink/5 p-8 md:p-12 rounded-3xl sticky-shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {/* Board grid pattern lines visual overlay */}
        <div className="absolute inset-0 bg-transparent grid grid-cols-4 grid-rows-4 pointer-events-none opacity-5 border-collapse">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="border border-text-ink" />
          ))}
        </div>

        {jokes.map((joke, index) => {
          const tilt = tilts[index % tilts.length];
          const color = colors[index % colors.length];

          return (
            <div key={joke.question} className="relative z-10">
              <StickyNote
                question={joke.question}
                answer={joke.answer}
                reaction={joke.reaction}
                color={color}
                tilt={tilt}
              />
            </div>
          );
        })}
      </div>

      {/* Decorative board stickers */}
      <div className="mt-16 relative flex gap-6 z-10">
        <Sticker emoji="🤫" rotation={10} scale={1.05} />
        <Sticker emoji="🤣" rotation={-15} scale={0.95} />
      </div>
    </section>
  );
};
