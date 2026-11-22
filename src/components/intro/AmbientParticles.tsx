"use client";

import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number;
  delay: number; // seconds
  duration: number; // seconds
  opacity: number;
  type: "circle" | "star" | "heart";
}

export const AmbientParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate a fixed set of subtle decorative particles
    const generated: Particle[] = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 70 + Math.random() * 30, // start near bottom
      size: 4 + Math.random() * 8,
      delay: Math.random() * -10, // negative delay so they start scattered in animation cycle
      duration: 12 + Math.random() * 16,
      opacity: 0.12 + Math.random() * 0.25,
      type: i % 3 === 0 ? "star" : i % 3 === 1 ? "heart" : "circle",
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {particles.map((p) => {
        // Simple float animation keyframes style
        const animationStyle: React.CSSProperties = {
          position: "absolute",
          left: `${p.x}%`,
          top: "100%",
          opacity: p.opacity,
          animation: `floatUp ${p.duration}s linear infinite`,
          animationDelay: `${p.delay}s`,
          transform: `scale(${p.size / 10})`,
        };

        return (
          <div key={p.id} style={animationStyle} className="text-text-ink/60">
            {p.type === "star" && (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 1.5l2.9 6.2 6.8.6-5.1 4.5 1.5 6.7-6.1-3.7-6.1 3.7 1.5-6.7-5.1-4.5 6.8-.6z" />
              </svg>
            )}
            {p.type === "heart" && (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            {p.type === "circle" && (
              <div className="w-2.5 h-2.5 rounded-full bg-current" />
            )}
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.3);
          }
          90% {
            opacity: var(--p-opacity, 0.3);
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
