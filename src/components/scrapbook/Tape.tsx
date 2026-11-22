import React from "react";

interface TapeProps {
  className?: string;
  color?: "yellow" | "pink" | "blue" | "green";
  tilt?: number;
}

export const Tape: React.FC<TapeProps> = ({
  className = "",
  color = "yellow",
  tilt = -3,
}) => {
  // Map Tailwind v4 accent colors to washi tape rgba colors for transparency
  const colorMap = {
    yellow: "bg-accent-yellow/60 border-accent-yellow/30 text-accent-yellow",
    pink: "bg-accent-pink/60 border-accent-pink/30 text-accent-pink",
    blue: "bg-accent-blue/60 border-accent-blue/30 text-accent-blue",
    green: "bg-accent-green/60 border-accent-green/30 text-accent-green",
  };

  return (
    <div
      className={`absolute h-8 w-28 washi-tape flex items-center justify-center pointer-events-none select-none z-20 ${colorMap[color]} ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        clipPath: "polygon(0% 15%, 5% 0%, 12% 12%, 18% 3%, 25% 15%, 32% 4%, 39% 14%, 48% 2%, 55% 12%, 62% 3%, 70% 14%, 78% 2%, 85% 15%, 92% 5%, 100% 15%, 98% 85%, 93% 100%, 86% 89%, 79% 97%, 72% 86%, 65% 98%, 56% 87%, 48% 99%, 40% 86%, 33% 97%, 26% 86%, 19% 99%, 11% 88%, 4% 100%, 0% 85%)",
      }}
    />
  );
};
