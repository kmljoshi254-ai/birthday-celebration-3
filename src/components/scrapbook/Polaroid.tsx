"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Tape } from "./Tape";

interface PolaroidProps {
  src: string;
  caption: string;
  date?: string;
  rotation?: number; // Initial tilt angle (in degrees)
  className?: string;
  tapeColor?: "yellow" | "pink" | "blue" | "green";
  tapePosition?: "top-center" | "top-left" | "top-right" | "none";
  onClick?: () => void;
  interactive?: boolean;
}

export const Polaroid: React.FC<PolaroidProps> = ({
  src,
  caption,
  date,
  rotation = 0,
  className = "",
  tapeColor = "yellow",
  tapePosition = "top-center",
  onClick,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Motion values for cursor coordinates relative to Polaroid center
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);

  // Smooth springs for cursor follow tilt
  const rx = useSpring(rotateXRaw, { stiffness: 120, damping: 15 });
  const ry = useSpring(rotateYRaw, { stiffness: 120, damping: 15 });

  // Detect mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || isMobile || isExpanded || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Convert offsets to mild tilt angles
    rotateXRaw.set(-y * 0.12);
    rotateYRaw.set(x * 0.12);
  };

  const handleMouseLeave = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
    setIsHovered(false);
  };

  const getTapeClass = () => {
    switch (tapePosition) {
      case "top-left":
        return "-top-4 -left-6 -rotate-12";
      case "top-right":
        return "-top-4 -right-6 rotate-12";
      case "top-center":
      default:
        return "-top-5 left-1/2 -translate-x-1/2 -rotate-3";
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    if (!interactive) return;
    if (onClick) {
      onClick();
    }
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Build the idle breathing offset
  // We use a slight delay variation based on rotation to avoid synchronized breathing
  const breathingDelay = Math.abs(rotation) % 2;

  // Render expanded modal overlay on mobile/desktop via portal to prevent CSS transform conflicts
  if (isExpanded) {
    const modalContent = (
      <div
        className="fixed inset-0 bg-black/45 z-[99] pointer-events-auto backdrop-blur-xs flex items-center justify-center p-6"
        onClick={() => setIsExpanded(false)}
      >
        <motion.div
          className="w-full max-w-[340px] bg-white p-5 pb-8 polaroid-shadow border border-gray-150 cursor-pointer select-none origin-center text-center relative z-[100] flex flex-col justify-between"
          style={{
            borderRadius: "15px 4px 13px 5px / 5px 13px 4px 15px",
          }}
          initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when card itself is clicked
        >
          {tapePosition !== "none" && (
            <Tape color={tapeColor} className="-top-5 left-1/2 -translate-x-1/2 -rotate-2" />
          )}
          <div className="relative aspect-square w-full overflow-hidden bg-gray-50 border border-gray-150">
            <Image
              src={src}
              alt={caption}
              fill
              sizes="100vw"
              className="object-cover pointer-events-none"
              priority
            />
          </div>
          <div className="mt-5">
            <p className="font-handwritten text-3xl text-text-ink/95 leading-tight">
              {caption}
            </p>
            {date && (
              <span className="font-handwritten text-lg text-text-ink/60 mt-1 select-none block">
                {date}
              </span>
            )}
          </div>
          <p className="text-[11px] font-sans font-bold text-accent-pink/80 uppercase mt-4 tracking-wider" onClick={() => setIsExpanded(false)}>
            Tap anywhere to close
          </p>
        </motion.div>
      </div>
    );
    return mounted ? createPortal(modalContent, document.body) : null;
  }

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      className={`relative inline-block bg-white p-3.5 pb-6 polaroid-shadow border border-gray-100/80 select-none cursor-pointer origin-center ${className}`}
      style={{
        rotate: rotation,
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        perspective: 1000,
        borderRadius: "15px 4px 13px 5px / 5px 13px 4px 15px",
      }}
      animate={{}}
      whileHover={
        interactive && !isMobile
          ? {
              scale: 1.08,
              y: -12,
              rotate: rotation * 0.4,
              boxShadow:
                "0 25px 35px rgba(44, 37, 32, 0.18), 0 6px 12px rgba(44, 37, 32, 0.08)",
              zIndex: 35,
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      {/* Sparkle effect on hover */}
      {isHovered && !isMobile && (
        <motion.div
          className="absolute -top-3 -right-3 text-2xl pointer-events-none select-none z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: 1, rotate: [0, 45, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          ✨
        </motion.div>
      )}

      {/* Washi Tape overlay with staggered landing delay */}
      {tapePosition !== "none" && (
        <motion.div
          initial={{ scale: 1.4, opacity: 0, y: -20, rotate: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          transition={{
            delay: 1.5,
            type: "spring",
            stiffness: 140,
            damping: 12,
          }}
          className="absolute inset-0 pointer-events-none z-20"
        >
          <Tape color={tapeColor} className={getTapeClass()} />
        </motion.div>
      )}

      {/* Picture Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 border border-gray-100/50 pointer-events-none">
        <Image
          src={src}
          alt={caption}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover pointer-events-none"
          priority
        />
      </div>

      {/* Handwritten Caption & Date */}
      <div className="mt-3 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="font-handwritten text-xl md:text-2xl text-text-ink/90 leading-tight">
          {caption}
        </p>
        {date && (
          <span className="font-handwritten text-sm md:text-base text-text-ink/45 mt-0.5 select-none">
            {date}
          </span>
        )}
      </div>
    </motion.div>
  );
};
