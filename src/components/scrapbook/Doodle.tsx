"use client";

import React from "react";
import { motion } from "framer-motion";

export type DoodleType = "heart" | "star" | "arrow" | "circle" | "underline" | "sparkle";

interface DoodleProps {
  type: DoodleType;
  className?: string;
  color?: "pink" | "yellow" | "blue" | "green" | "ink";
  duration?: number;
  delay?: number;
}

export const Doodle: React.FC<DoodleProps> = ({
  type,
  className = "",
  color = "ink",
  duration = 0.8,
  delay = 0.2,
}) => {
  const colorMap = {
    pink: "#F3A3B4",
    yellow: "#F7E5A9",
    blue: "#A2C2E1",
    green: "#B4CBB7",
    ink: "#2C2520",
  };

  const strokeColor = colorMap[color];

  const drawTransition = {
    duration,
    delay,
    ease: "easeInOut" as const,
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: drawTransition,
    },
  };

  // SVG paths for each doodle type
  switch (type) {
    case "heart":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M50,30 C35,10 5,20 5,50 C5,75 40,90 50,95 C60,90 95,75 95,50 C95,20 65,10 50,30 Z"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    case "star":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M50,5 L63,35 L95,38 L70,60 L78,92 L50,75 L22,92 L30,60 L5,38 L37,35 Z"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    case "arrow":
      return (
        <svg
          viewBox="0 0 100 60"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main curved arrow body */}
          <motion.path
            d="M10,10 C40,45 60,45 85,25"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
          {/* Arrowhead side 1 */}
          <motion.path
            d="M72,23 L85,25 L81,38"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    case "circle":
      return (
        <svg
          viewBox="0 0 100 100"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* A loose hand-drawn double loop circle */}
          <motion.path
            d="M52,8 C27,10 8,28 9,53 C10,79 32,94 57,91 C80,88 93,65 91,42 C89,20 63,7 44,14 C29,19 19,39 23,55"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    case "underline":
      return (
        <svg
          viewBox="0 0 150 20"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Curved highlight underline */}
          <motion.path
            d="M5,10 Q40,16 75,10 T145,12"
            stroke={strokeColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    case "sparkle":
      return (
        <svg
          viewBox="0 0 60 60"
          className={`fill-none select-none pointer-events-none ${className}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Star sparkle doodles */}
          <motion.path
            d="M30,5 L30,55 M5,30 L55,30 M15,15 L45,45 M45,15 L15,45"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            variants={pathVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          />
        </svg>
      );

    default:
      return null;
  }
};
