"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerProps {
  scene?: string | number;
  autoPlayTrigger?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ scene = "intro", autoPlayTrigger = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Play automatically when autoPlayTrigger turns true
  useEffect(() => {
    if (autoPlayTrigger && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowTooltip(false);
        })
        .catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [autoPlayTrigger]);

  // Pause background playback when custom pause-global-audio is triggered from Page 6
  useEffect(() => {
    const handleGlobalPause = () => {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("pause-global-audio", handleGlobalPause);
    return () => {
      window.removeEventListener("pause-global-audio", handleGlobalPause);
    };
  }, [isPlaying]);

  // Show a gentle tooltip on first load to tell user they can play music
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);
    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7500);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Adjust volume based on active scene (quieter on emotional scenes)
  useEffect(() => {
    if (audioRef.current) {
      if (scene === "letter" || scene === "rocket" || scene === "sky" || scene === 3 || scene === 4) {
        audioRef.current.volume = 0.2;
      } else {
        audioRef.current.volume = 0.5;
      }
    }
  }, [scene]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowTooltip(false);
        })
        .catch((err) => console.log("Playback blocked:", err));
    }
  };

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[99] pointer-events-auto flex items-center gap-3">
      {/* Tooltip suggestion */}
      <AnimatePresence>
        {showTooltip && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-accent-pink/20 shadow-md text-[9px] font-sans font-bold text-accent-pink tracking-wider whitespace-nowrap select-none"
          >
            Play "Shape of You" 🎵
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src="https://archive.org/download/fave2/Ed%20Sheeran%20-%20Shape%20of%20You.mp3"
        loop
        preload="auto"
      />

      {/* Tiny Square Player Div */}
      <motion.button
        onClick={togglePlay}
        className={`w-10 h-10 md:w-11 h-11 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-md border shadow-md hover:shadow-lg transition-all duration-300 relative cursor-pointer group text-text-ink ${
          isPlaying ? "border-accent-pink/40" : "border-text-ink/10"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing border when paused */}
        {!isPlaying && (
          <span className="absolute inset-0 rounded-xl border border-accent-pink/40 animate-ping opacity-75 pointer-events-none" />
        )}

        {/* Action Icon */}
        {isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Visualizer Background */}
            <div className="absolute inset-2 flex items-end justify-center gap-[2px] opacity-20">
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  className="w-[2px] bg-accent-pink rounded-full"
                  animate={{ height: ["20%", "100%", "20%"] }}
                  transition={{
                    duration: 0.4 + i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15
                  }}
                />
              ))}
            </div>
            <Pause className="w-4 h-4 text-accent-pink fill-accent-pink/20 relative z-10" />
          </div>
        ) : (
          <Play className="w-4 h-4 text-text-ink group-hover:text-accent-pink transition-colors fill-current pl-[1px]" />
        )}
      </motion.button>
    </div>
  );
};
