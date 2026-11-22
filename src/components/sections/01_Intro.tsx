"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen } from "lucide-react";
import { fireDefaultConfetti } from "../ui/Confetti";
import { Doodle } from "../scrapbook/Doodle";

interface IntroProps {
  onOpen: () => void;
  recipient: string;
}

export const Intro: React.FC<IntroProps> = ({ onOpen, recipient }) => {
  const [isOpenClicked, setIsOpenClicked] = useState(false);

  const handleOpen = () => {
    setIsOpenClicked(true);
    // Fire confetti immediately
    fireDefaultConfetti();
    // Wait a brief moment for envelope animation, then trigger reveal
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper px-4 overflow-hidden">
      {/* Decorative stars/hearts scattered around background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Doodle type="sparkle" className="absolute top-[10%] left-[15%] w-12 h-12" color="pink" />
        <Doodle type="heart" className="absolute bottom-[20%] left-[10%] w-16 h-16 -rotate-12" color="pink" />
        <Doodle type="star" className="absolute top-[20%] right-[12%] w-14 h-14 rotate-12" color="yellow" />
        <Doodle type="sparkle" className="absolute bottom-[15%] right-[18%] w-10 h-10" color="green" />
      </div>

      <AnimatePresence>
        {!isOpenClicked ? (
          <motion.div
            className="w-full max-w-lg text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, y: -50, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            {/* Sealed Envelope Graphic Container */}
            <div className="relative mx-auto w-64 h-48 md:w-80 md:h-56 bg-accent-pink/20 rounded-2xl border-4 border-text-ink/10 flex flex-col items-center justify-center p-6 polaroid-shadow select-none bg-paper/60 mb-8 overflow-visible">
              
              {/* Wax Seal / Heart Sticker */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-accent-pink rounded-full border-2 border-white flex items-center justify-center shadow-lg text-white text-3xl cursor-pointer"
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                }}
              >
                ❤️
              </motion.div>

              {/* Envelope Lines Visual */}
              <div className="absolute inset-0 pointer-events-none border-b-[8px] border-r-[4px] border-l-[4px] border-text-ink/5 rounded-2xl" />
              
              {/* Decorative Handwritten text inside envelope */}
              <div className="absolute top-6 left-6 font-handwritten text-xl text-text-ink/40">
                To: {recipient}
              </div>
            </div>

            {/* Title text */}
            <div className="relative inline-block mb-2">
              <h1 className="font-handwritten text-4xl md:text-5xl font-bold text-text-ink tracking-wide">
                hey {recipient}...
              </h1>
              <Doodle type="underline" className="w-full h-4 -mt-1" color="pink" />
            </div>
            
            <p className="font-sans text-lg text-text-ink/70 max-w-md mx-auto mb-8 font-medium">
              someone made a little digital scrapbook just for you 👀
            </p>

            {/* Bouncy Open Button */}
            <motion.button
              onClick={handleOpen}
              className="relative px-8 py-4 bg-accent-pink text-white font-bold rounded-full text-lg shadow-lg border-2 border-white hover:bg-accent-pink/90 active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2 mx-auto"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
            >
              <MailOpen className="w-5 h-5 animate-pulse" />
              OPEN THE ENVELOPE
            </motion.button>
          </motion.div>
        ) : (
          /* Envelope Opening/Flying Stickers Animation Overlay */
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Flying stickers popping from center */}
            <motion.div
              className="text-6xl md:text-8xl select-none"
              initial={{ scale: 0.1, rotate: 0 }}
              animate={{ scale: [1, 2.5, 0], rotate: 360, y: [0, -100, -250] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              🎈🌸✨💖
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
