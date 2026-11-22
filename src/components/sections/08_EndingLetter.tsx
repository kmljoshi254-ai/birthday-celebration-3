"use client";

import React, { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Doodle } from "../scrapbook/Doodle";

interface EndingLetterProps {
  greeting: string;
  body: string[];
  signoff: string;
  onReplay: () => void;
}

export const EndingLetter: React.FC<EndingLetterProps> = ({
  greeting,
  body,
  signoff,
  onReplay,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);

  // Slowly fade and cascade paragraph reveals
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveParagraphIndex((prev) => {
        if (prev < body.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 2800); // Wait 2.8s per paragraph to give reading time

    return () => clearInterval(interval);
  }, [isInView, body.length]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 px-6 select-none bg-paper/40 flex flex-col items-center justify-center overflow-visible"
    >
      {/* Decorative Hearts floating around ending section */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <Doodle type="heart" className="absolute top-[10%] left-[20%] w-10 h-10 rotate-[20deg]" color="pink" />
        <Doodle type="heart" className="absolute bottom-[20%] right-[15%] w-14 h-14 rotate-[-15deg]" color="pink" />
      </div>

      <div className="w-full max-w-2xl relative">
        {/* Envelope Paper visual container */}
        <div className="absolute -inset-4 bg-[#EDE4D8] border border-text-ink/5 rounded-3xl -z-10 shadow-inner rotate-1" />

        {/* Paper Sheet Letter */}
        <motion.div
          className="bg-[#FCFAF2] border-t-8 border-t-accent-pink border border-zinc-200/80 p-8 sm:p-12 rounded-2xl polaroid-shadow relative overflow-hidden -rotate-1"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
        >
          {/* Notebook Margin Line visual */}
          <div className="absolute top-0 bottom-0 left-6 sm:left-10 w-0.5 bg-red-200/50" />

          {/* Letter Content */}
          <div className="pl-6 sm:pl-10 text-left">
            {/* Header Greeting */}
            <motion.h2
              className="font-handwritten text-4xl text-text-ink font-bold mb-6 block"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {greeting}
            </motion.h2>

            {/* Paragraph lines reveal */}
            <div className="space-y-6">
              {body.map((paragraph, index) => {
                const isVisible = index <= activeParagraphIndex;

                return (
                  <motion.p
                    key={index}
                    className="font-sans text-base sm:text-lg leading-relaxed text-text-ink/85 font-medium min-h-[1.5em]"
                    initial={{ opacity: 0, y: 15 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    {paragraph}
                  </motion.p>
                );
              })}
            </div>

            {/* Cursive sign-off signature */}
            {activeParagraphIndex >= body.length - 1 && (
              <motion.div
                className="mt-12 text-right mr-6 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <span className="font-handwritten text-3xl text-accent-pink font-bold block">
                  {signoff}
                </span>
                
                {/* Heart outline doodle next to signature */}
                <Doodle
                  type="heart"
                  className="absolute right-0 top-8 w-8 h-8 opacity-60"
                  color="pink"
                  delay={1.5}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Replay controller button */}
      {activeParagraphIndex >= body.length - 1 && (
        <motion.div
          className="mt-16 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2 }}
        >
          <button
            onClick={onReplay}
            className="px-6 py-3.5 bg-text-ink text-paper font-semibold rounded-full text-base shadow-md hover:bg-text-ink/90 active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Replay our memories ↻
          </button>
        </motion.div>
      )}
    </section>
  );
};
