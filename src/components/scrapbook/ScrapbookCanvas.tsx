"use client";

import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { friendshipConfig } from "@/config/friendship";

interface ScrapbookCanvasProps {
  children: React.ReactNode;
}

export const ScrapbookCanvas: React.FC<ScrapbookCanvasProps> = ({
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion raw values for cursor coordinates (centered at 0)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth springs for buttery parallax motion
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      rawX.set(x);
      rawY.set(y);
    };

    const handleMouseLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [rawX, rawY]);

  // We provide context/values or expose standard styles through class-based wrappers.
  // We'll define coordinate transformations for child elements to read or hook into.
  const isDark = friendshipConfig.theme === "dark";

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-full h-full overflow-y-auto md:overflow-hidden select-none flex flex-col justify-start md:justify-between z-10 ${
        isDark ? "bg-[#090B0E] text-zinc-100" : "bg-[#F8F1E7] text-text-ink"
      }`}
      style={{
        backgroundImage: isDark
          ? `
            linear-gradient(rgba(255, 255, 255, 0.015) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1.5px, transparent 1.5px),
            radial-gradient(circle at center, rgba(92, 110, 158, 0.12) 0%, transparent 78%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")
          `
          : `
            linear-gradient(rgba(243, 163, 180, 0.05) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(243, 163, 180, 0.05) 1.5px, transparent 1.5px),
            radial-gradient(circle at center, rgba(247, 229, 169, 0.25) 0%, transparent 75%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E")
          `,
        backgroundSize: "40px 40px, 40px 40px, 100% 100%, auto",
      }}
    >
      {/* Soft desk vignette shadow & ambient paper depth shadow */}
      <div className={`absolute inset-0 pointer-events-none z-30 ${
        isDark ? "shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]" : "shadow-[inset_0_0_100px_rgba(44,37,32,0.08)]"
      }`} />
      
      {/* Decorative notebook binding line */}
      <div className={`absolute top-0 bottom-0 left-0 w-8 md:w-12 pointer-events-none z-30 ${
        isDark ? "bg-gradient-to-r from-black/20 to-transparent" : "bg-gradient-to-r from-black/[0.04] to-transparent"
      }`} />
      
      {/* Red vertical margin line of scrapbook paper */}
      <div className={`absolute top-0 bottom-0 left-10 md:left-16 w-[1.5px] pointer-events-none z-30 ${
        isDark ? "bg-indigo-400/20" : "bg-red-300/40"
      }`} />

      {/* Realistic Notebook Punch Holes on the left edge */}
      <div className="absolute left-3 md:left-5 top-0 bottom-0 flex flex-col justify-around py-8 pointer-events-none z-30 opacity-70">
        {[...Array(9)].map((_, i) => (
          <div key={i} className={`relative w-3.5 h-3.5 rounded-full shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.2),0_1px_rgba(255,255,255,0.6)] ${
            isDark ? "bg-zinc-800" : "bg-[#E5DBCB]"
          }`} />
        ))}
      </div>

      {/* Main interactive content wrapper */}
      <div className="w-full h-auto md:h-full relative z-10 pl-12 md:pl-16 pr-4 md:pr-6">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && typeof child.type !== "string") {
            // Pass mouse x & y coordinates to childrens if they want parallax
            return React.cloneElement(child as React.ReactElement<any>, { mouseX, mouseY });
          }
          return child;
        })}
      </div>
    </div>
  );
};
