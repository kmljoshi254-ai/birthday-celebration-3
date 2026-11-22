"use client";

import React, { useState, useEffect } from "react";
import { motion, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { RotateCcw, ArrowRight } from "lucide-react";
import html2canvas from "html2canvas";
import { ScrapbookCanvas } from "./ScrapbookCanvas";
import { Polaroid } from "./Polaroid";
import { Doodle } from "./Doodle";
import { Sticker } from "./Sticker";
import { Tape } from "./Tape";
import { friendshipConfig } from "@/config/friendship";

interface MemoryDeskSceneProps {
  onReplay: () => void;
  onContinue: () => void;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}

export const MemoryDeskScene: React.FC<MemoryDeskSceneProps> = ({ onReplay, onContinue, mouseX, mouseY }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDark = friendshipConfig.theme === "dark";

  // --- STATE FOR INTERACTION MODES & DISCOVERIES ---
  // Draggable photo offsets (resting positions relative to custom grid layout offsets)
  const [photo1Pos, setPhoto1Pos] = useState({ x: 0, y: 0 });
  const [photo2Pos, setPhoto2Pos] = useState({ x: 0, y: 0 });
  const [photo3Pos, setPhoto3Pos] = useState({ x: 0, y: 0 });

  // Discovery states
  const [discovery1Revealed, setDiscovery1Revealed] = useState(false); // Move photo 2 -> hidden note
  const [discovery2Revealed, setDiscovery2Revealed] = useState(false); // Slide off paperclip -> sketch
  const [discovery3Revealed, setDiscovery3Revealed] = useState(false); // Open memory box -> fourth item
  const [paperclipRemoved, setPaperclipRemoved] = useState(false);

  // Focus modals
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [albumPage, setAlbumPage] = useState(0);
  const [boxOpen, setBoxOpen] = useState(false);
  const [activeBoxItem, setActiveBoxItem] = useState<string | null>(null);

  // Camera state
  const [cameraFlash, setCameraFlash] = useState(false);
  const [printedPhotos, setPrintedPhotos] = useState<string[]>([]);
  const [printedPos, setPrintedPos] = useState({ x: 0, y: 0 });

  // Cassette player state
  const [isPlaying, setIsPlaying] = useState(false);

  // Parallax layers (desktop pointer coordinate values)
  const dummyValue = new MotionValue(0);
  const mX = mouseX || dummyValue;
  const mY = mouseY || dummyValue;

  const bgX = useTransform(mX, [-500, 500], [-3, 3]);
  const bgY = useTransform(mY, [-500, 500], [-3, 3]);
  const px = useTransform(mX, [-500, 500], [-7, 7]);
  const py = useTransform(mY, [-500, 500], [-7, 7]);
  const fgX = useTransform(mX, [-500, 500], [-11, 11]);
  const fgY = useTransform(mY, [-500, 500], [-11, 11]);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const photos = friendshipConfig.hero.polaroids;

  // Trigger camera click (takes a real DOM screenshot of the desk page)
  const handleCameraClick = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 200);

    const targetElement = document.body;
    if (!targetElement) return;

    // Capture screenshot after a brief delay so the flash overlay begins rendering correctly
    setTimeout(() => {
      html2canvas(targetElement, {
        ignoreElements: (element) => {
          return element.hasAttribute("data-html2canvas-ignore");
        },
        useCORS: true,
        scale: 1,
      }).then((canvas) => {
        const dataUrl = canvas.toDataURL("image/png");
        setPrintedPhotos((prev) => [...prev, dataUrl]);
      });
    }, 150);
  };

  const handleContinueClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onContinue();
    }, 2200);
  };

  return (
    <ScrapbookCanvas>
      {/* Seamless transition entrance overlay */}
      <motion.div
        className="fixed inset-0 bg-[#FAF8F5] z-[90] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Screen flash effect driven by camera shutter */}
      <AnimatePresence>
        {cameraFlash && (
          <motion.div
            className="fixed inset-0 bg-white z-[95] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Ambient peach lighting drift */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-20"
        style={{
          background: "radial-gradient(circle at 65% 35%, #F7E5A9 0%, transparent 60%)",
          animation: "deskLightDrift 20s ease-in-out infinite alternate"
        }}
      />
      <style>{`
        @keyframes deskLightDrift {
          0% { background-position: 0% 0%; filter: saturate(1); }
          100% { background-position: 100% 100%; filter: saturate(1.2) hue-rotate(10deg); }
        }
      `}</style>

      {/* Floating dust motes */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-accent-pink/15"
            style={{
              top: `${15 + i * 18}%`,
              left: `${10 + Math.sin(i) * 20 + 35}%`,
            }}
            animate={{
              y: [0, -40, -80],
              x: [0, Math.sin(i) * 12, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 9 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main viewport desk layout */}
      <motion.div
        className="w-full h-dvh relative flex flex-col justify-start items-center py-6 px-4 md:py-8 md:px-8 select-none z-20 overflow-y-auto md:overflow-hidden pb-24 md:pb-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: isTransitioning ? 0 : 1,
          scale: isTransitioning ? 0.95 : 1,
          filter: isTransitioning ? "blur(12px)" : "blur(0px)"
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* ==================== 1. DESKTOP TITLE BLOCK ==================== */}
        <div className="w-full max-w-lg text-center mt-2 z-30">
          <motion.h1
            className={`font-handwritten text-3xl md:text-5xl font-black tracking-tight ${
              isDark ? "text-zinc-100" : "text-text-ink/90"
            }`}
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {friendshipConfig.deskTitle}
          </motion.h1>
          <motion.p
            className={`font-sans text-[10px] md:text-xs font-bold uppercase tracking-wider mt-2 ${
              isDark ? "text-zinc-400" : "text-text-ink/60"
            }`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {friendshipConfig.deskSubtitle}
          </motion.p>
        </div>

        {/* ==================== DESKTOP SPACIOUS MEMORY DESK / MOBILE CURATED GRID ==================== */}
        {isMobile ? (
          <div className="flex-1 w-full flex flex-col justify-between items-center py-2 z-20 select-none">
            {/* Hero Polaroid at top/center */}
            {photos[0] && (
              <div className="w-[155px] z-30 mt-6">
                <Polaroid
                  src={photos[0].src}
                  caption={photos[0].caption}
                  date={photos[0].date}
                  rotation={-3}
                  tapeColor="yellow"
                  tapePosition="top-center"
                  interactive={true}
                />
              </div>
            )}

            {/* Curated 3 items in a neat layout below */}
            <div className="grid grid-cols-2 gap-3.5 w-full px-2 max-w-[320px] mb-2">
              {/* Envelope */}
              <div
                className="bg-[#F7F2E7] border border-[#DFD6BF] shadow-xs rounded-xs cursor-pointer p-3.5 h-[80px] flex flex-col justify-center items-center"
                onClick={() => setEnvelopeOpen(true)}
              >
                <span className="font-handwritten text-xs text-text-ink/80">{friendshipConfig.deskEnvelopeLabel}</span>
                <span className="text-[5px] font-sans font-bold tracking-widest text-[#BFA28F] uppercase mt-0.5">Open</span>
              </div>

              {/* Memory Box */}
              <div
                className="bg-[#F5ECE1] border-2 border-[#D5CBB9] shadow-sm rounded-sm p-3.5 h-[80px] flex flex-col justify-center items-center"
                onClick={() => setBoxOpen(true)}
              >
                <span className="font-handwritten text-xs text-[#8E8171] font-bold">{friendshipConfig.deskBoxLabel}</span>
                <span className="text-[5px] font-sans font-bold uppercase tracking-wider text-[#AFA292] mt-0.5">Open</span>
              </div>

              {/* Photo Album (Spans full width) */}
              <div
                className="col-span-2 bg-[#FAF8F5] border-l-[5px] border-l-[#A68F81] border border-[#DFD8C4] shadow-sm rounded-xs p-3 h-[52px] flex justify-between items-center cursor-pointer"
                onClick={() => setAlbumOpen(true)}
              >
                <h2 className="font-handwritten text-base text-text-ink/90 font-bold leading-none">Our Album</h2>
                <span className="text-[7px] font-sans font-bold uppercase tracking-widest text-[#BFA28F] pt-0.5">Browse →</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full max-w-6xl mx-auto relative flex flex-col md:block items-center gap-8 md:gap-0 my-4 py-8 md:py-0 h-auto md:h-full z-20">
            
            {/* Faint large handwriting details (Layer 2) */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none hidden md:block"
              style={{ x: bgX, y: bgY }}
            >
              <span className="font-handwritten text-4xl text-text-ink/6 rotate-[-8deg] absolute left-[15%] top-[18%]">
                remember when...
              </span>
              <span className="font-handwritten text-5xl text-text-ink/5 rotate-[12deg] absolute right-[15%] bottom-[20%]">
                the little things ♡
              </span>
            </motion.div>

            {/* ==================== DISCOVERY 1: NOTE UNDER POLAROID 2 ==================== */}
            {discovery1Revealed && (
              <motion.div
                className="relative md:absolute md:left-[calc(50%-440px)] md:top-[calc(50%+40px)] bg-[#FEF9E7] border border-[#E9DFB9] shadow-xs p-3.5 w-[140px] rotate-[-5deg] pointer-events-auto z-10 mx-auto"
                style={{ x: px, y: py }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ type: "spring", stiffness: 180 }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-4 bg-accent-yellow/30 border border-accent-yellow/10 rotate-2" />
                <p className="font-handwritten text-xs text-text-ink/80 leading-normal">
                  psst... you found this note! I knew we'd make it. ♡
                </p>
              </motion.div>
            )}

            {/* ==================== PHOTO 1 (TOP LEFT) ==================== */}
            {photos[0] && (
              <motion.div
                className="relative md:absolute w-[185px] md:w-[165px] pointer-events-auto cursor-grab active:cursor-grabbing z-25 mx-auto"
                style={{
                  x: isMobile ? 0 : px,
                  y: isMobile ? 0 : py,
                  left: isMobile ? undefined : "calc(50% - 460px)",
                  top: isMobile ? undefined : "calc(50% - 260px)",
                }}
                drag
                dragMomentum={false}
                dragConstraints={isMobile ? { left: -50, right: 50, top: -50, bottom: 50 } : { left: -100, right: 100, top: -100, bottom: 100 }}
                animate={{
                  x: photo1Pos.x,
                  y: photo1Pos.y,
                }}
                onDragEnd={(e, info) => {
                  const newX = photo1Pos.x + info.offset.x;
                  const newY = photo1Pos.y + info.offset.y;
                  if (Math.abs(info.offset.x) > 80 || Math.abs(info.offset.y) > 80) {
                    setPhoto1Pos({ x: 0, y: 0 });
                  } else {
                    setPhoto1Pos({ x: newX, y: newY });
                  }
                }}
                transition={{ type: "spring", stiffness: 140, damping: 15 }}
              >
                <Polaroid
                  src={photos[0].src}
                  caption={photos[0].caption}
                  date={photos[0].date}
                  rotation={-6}
                  tapeColor="yellow"
                  tapePosition="top-center"
                  interactive={true}
                />
              </motion.div>
            )}

            {/* ==================== PHOTO 2 (BOTTOM LEFT - COVERS SECRET NOTE) ==================== */}
            {photos[1] && (
              <motion.div
                className="relative md:absolute w-[185px] md:w-[165px] pointer-events-auto cursor-grab active:cursor-grabbing z-25 mx-auto"
                style={{
                  x: isMobile ? 0 : px,
                  y: isMobile ? 0 : py,
                  left: isMobile ? undefined : "calc(50% - 460px)",
                  top: isMobile ? undefined : "calc(50% + 80px)",
                }}
                drag
                dragMomentum={false}
                dragConstraints={isMobile ? { left: -50, right: 50, top: -50, bottom: 50 } : { left: -100, right: 100, top: -100, bottom: 100 }}
                animate={{
                  x: photo2Pos.x,
                  y: photo2Pos.y,
                }}
                onDragEnd={(e, info) => {
                  const newX = photo2Pos.x + info.offset.x;
                  const newY = photo2Pos.y + info.offset.y;
                  
                  // Reveal Secret Note if dragged far enough
                  if (Math.abs(newX) > 40 || Math.abs(newY) > 40) {
                    setDiscovery1Revealed(true);
                  }

                  if (Math.abs(info.offset.x) > 80 || Math.abs(info.offset.y) > 80) {
                    setPhoto2Pos({ x: 0, y: 0 });
                  } else {
                    setPhoto2Pos({ x: newX, y: newY });
                  }
                }}
                transition={{ type: "spring", stiffness: 140, damping: 15 }}
              >
                <Polaroid
                  src={photos[1].src}
                  caption={photos[1].caption}
                  date={photos[1].date}
                  rotation={-4}
                  tapeColor="blue"
                  tapePosition="top-left"
                  interactive={true}
                />
              </motion.div>
            )}

            {/* ==================== PHOTO 3 (TOP RIGHT) ==================== */}
            {/* Supporting memory 2: Right Polaroid */}
            {!isMobile && photos[2] && (
              <motion.div
                className="absolute w-[185px] md:w-[165px] pointer-events-auto cursor-grab active:cursor-grabbing z-25 mx-auto"
                style={{
                  x: isMobile ? 0 : px,
                  y: isMobile ? 0 : py,
                  left: isMobile ? undefined : "calc(50% + 310px)",
                  top: isMobile ? undefined : "calc(50% - 260px)",
                }}
                drag
                dragMomentum={false}
                dragConstraints={isMobile ? { left: -50, right: 50, top: -50, bottom: 50 } : { left: -100, right: 100, top: -100, bottom: 100 }}
                animate={{
                  x: photo3Pos.x,
                  y: photo3Pos.y,
                }}
                onDragEnd={(e, info) => {
                  const newX = photo3Pos.x + info.offset.x;
                  const newY = photo3Pos.y + info.offset.y;
                  if (Math.abs(info.offset.x) > 80 || Math.abs(info.offset.y) > 80) {
                    setPhoto3Pos({ x: 0, y: 0 });
                  } else {
                    setPhoto3Pos({ x: newX, y: newY });
                  }
                }}
                transition={{ type: "spring", stiffness: 140, damping: 15 }}
              >
                <Polaroid
                  src={photos[2].src}
                  caption={photos[2].caption}
                  date={photos[2].date}
                  rotation={5}
                  tapeColor="pink"
                  tapePosition="top-right"
                  interactive={true}
                />
              </motion.div>
            )}

            {/* ==================== INTERACTIVE OBJECT 2: SECRET ENVELOPE (CENTER LEFT) ==================== */}
            <motion.div
              className="relative md:absolute md:left-[calc(50%-250px)] md:top-[calc(50%+80px)] w-[200px] md:w-[180px] h-[120px] bg-[#F7F2E7] border border-[#DFD6BF] shadow-xs rounded-xs cursor-pointer pointer-events-auto z-20 mx-auto"
              style={{ x: isMobile ? 0 : px, y: isMobile ? 0 : py }}
              animate={isMobile ? {} : { y: [0, -3, 0], rotate: [2, 1, 2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => setEnvelopeOpen(true)}
              whileHover={{ scale: 1.03 }}
            >
              <div className="absolute top-1.5 left-4 w-7 h-4 bg-accent-yellow/20 rotate-[-15deg] border border-dashed border-accent-yellow/10" />
              <div className="text-center pt-8">
                <span className="font-handwritten text-md text-text-ink/80 block">for you... ♡</span>
                <span className="text-[6px] font-sans font-bold tracking-widest text-[#BFA28F] uppercase mt-2 block">
                  Click to open
                </span>
              </div>
            </motion.div>

            {/* ==================== INTERACTIVE OBJECT 3: PHOTO ALBUM (BOTTOM RIGHT) ==================== */}
            <motion.div
              className="relative md:absolute md:left-[calc(50%+310px)] md:top-[calc(50%+90px)] w-[200px] md:w-[180px] h-[130px] bg-[#FAF8F5] border-l-[8px] border-l-[#A68F81] border border-[#DFD8C4] shadow-sm rounded-xs flex flex-col justify-end p-3.5 rotate-[4deg] cursor-pointer pointer-events-auto z-20 mx-auto"
              style={{ x: isMobile ? 0 : px, y: isMobile ? 0 : py }}
              whileHover={{ scale: 1.03, rotate: 2 }}
              onClick={() => setAlbumOpen(true)}
            >
              <div className="w-4 h-4 bg-[#CBB5A6] rounded-full self-end mb-2" />
              <div>
                <h2 className="font-handwritten text-xl text-text-ink/90 font-bold leading-none">Our Album</h2>
                <span className="text-[6px] font-sans font-bold uppercase tracking-widest text-[#BFA28F] mt-1.5 block">
                  Click to Browse
                </span>
              </div>
            </motion.div>

            {/* ==================== INTERACTIVE OBJECT 4: MEMORY BOX (CENTER RIGHT) ==================== */}
            <motion.div
              className="relative md:absolute md:left-[calc(50%+120px)] md:top-[calc(50%+70px)] w-[200px] md:w-[180px] h-[130px] bg-[#F5ECE1] border-2 border-[#D5CBB9] shadow-sm rounded-sm p-4 rotate-[-8deg] cursor-pointer pointer-events-auto z-20 mx-auto"
              style={{ x: isMobile ? 0 : px, y: isMobile ? 0 : py }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setBoxOpen(true)}
            >
              <div className="border border-[#E2D8C6] border-dashed p-2 rounded-xs text-center w-full h-full flex flex-col justify-center">
                <span className="font-handwritten text-xl text-[#8E8171] font-bold">little things</span>
                <span className="text-[6px] font-sans font-bold uppercase tracking-wider text-[#AFA292] mt-1.5 block">
                  Click to open
                </span>
              </div>
            </motion.div>

            {/* ==================== INTERACTIVE OBJECT 5: VINTAGE CAMERA (BOTTOM CENTER) ==================== */}
            <motion.div
              className="hidden md:flex md:absolute md:left-[calc(50%-70px)] md:top-[calc(50%+140px)] w-[120px] h-[75px] bg-[#E6DEC9] border border-[#C7B79D] shadow-md rounded-sm cursor-pointer pointer-events-auto items-center justify-center group z-20 rotate-[3deg]"
              style={{ x: fgX, y: fgY }}
              whileHover={{ scale: 1.05, y: -4, rotate: 2 }}
              onClick={handleCameraClick}
              data-html2canvas-ignore="true"
            >
              <div className="absolute top-[-5px] right-4 w-4 h-1.5 bg-[#B5A591] rounded-t-xs" />
              <div className="w-10 h-10 rounded-full bg-[#1A1816] border-[4px] border-[#5C544C] flex items-center justify-center relative overflow-hidden">
                <div className="w-3 h-3 rounded-full bg-cyan-400/40 absolute top-1.5 left-1.5 blur-xs group-hover:scale-125 transition-transform" />
              </div>
              <div className="absolute bottom-2 text-[6px] font-sans font-bold text-text-ink/65 uppercase tracking-widest">
                lofi-cam
              </div>
            </motion.div>

            {/* ==================== SHUTTER PRINTED PHOTOS ==================== */}
            {!isMobile && printedPhotos.map((src, idx) => (
              <motion.div
                key={src}
                className="relative md:absolute w-[150px] pointer-events-auto cursor-grab active:cursor-grabbing z-35 mx-auto"
                style={{ 
                  x: px, 
                  y: py, 
                  left: "calc(50% + 220px)", 
                  top: "calc(50% - 80px)" 
                }}
                drag
                dragMomentum={false}
                animate={{
                  x: printedPos.x,
                  y: printedPos.y,
                }}
                onDragEnd={(e, info) => {
                  setPrintedPos({
                    x: printedPos.x + info.offset.x,
                    y: printedPos.y + info.offset.y
                  });
                }}
                transition={{ type: "spring", stiffness: 120 }}
                data-html2canvas-ignore="true"
              >
                <div className="absolute -top-3 left-6 w-8 h-4 bg-sky-200/40 border border-dashed border-sky-300/10 rotate-[5deg] z-20 shadow-xs" />
                <Polaroid
                  src={src}
                  caption="shutter printed! 📸"
                  date=""
                  rotation={-8}
                  tapeColor="blue"
                  tapePosition="none"
                  interactive={true}
                />
              </motion.div>
            ))}

            {/* ==================== INTERACTIVE OBJECT 6: CASSETTE MUSIC PLAYER (CENTER) ==================== */}
            <motion.div
              className="relative md:absolute md:left-[calc(50%+30px)] md:top-[calc(50%-170px)] w-[150px] md:w-[140px] h-[95px] bg-[#FAF8F5] border-2 border-[#D5CBB9] shadow-xs rounded-xs p-3 rotate-[-4deg] pointer-events-auto cursor-pointer flex flex-col justify-between z-20 mx-auto"
              style={{ x: isMobile ? 0 : px, y: isMobile ? 0 : py }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <div className="flex justify-between items-center border-b border-text-ink/10 pb-1">
                <span className="font-sans text-[7px] font-bold text-[#A59587] uppercase tracking-wider">
                  LO-FI TAPE PLAYER
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
              </div>

              {/* Reels animation */}
              <div className="flex justify-center gap-6 py-1">
                <div className="w-7 h-7 rounded-full bg-[#EBE5D3] border-2 border-text-ink/10 flex items-center justify-center">
                  <motion.div
                    className="w-4 h-1 bg-[#8C7D70]"
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ ease: "linear", duration: 2.2, repeat: Infinity }}
                  />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#EBE5D3] border-2 border-text-ink/10 flex items-center justify-center">
                  <motion.div
                    className="w-4 h-1 bg-[#8C7D70]"
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ ease: "linear", duration: 2.2, repeat: Infinity }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[7px] font-sans font-bold text-[#8C7D70]">
                <span>TAPE STATUS:</span>
                <span>{isPlaying ? "PLAYING" : "PAUSED"}</span>
              </div>
            </motion.div>

            {/* ==================== INTERACTIVE OBJECT 7: HANDWRITTEN PAPERNOTE WITH PAPERCLIP (FAR LEFT) ==================== */}
            <motion.div
              className="relative md:absolute md:left-[calc(50%-250px)] md:top-[calc(50%-220px)] bg-[#FCFAF7] border border-[#DFD7C0] shadow-xs p-4 w-[140px] rotate-[-12deg] pointer-events-auto z-20 mx-auto"
              style={{ x: isMobile ? 0 : px, y: isMobile ? 0 : py }}
            >
              {/* Paperclip (Discovery 2: Click to slide off) */}
              {!paperclipRemoved ? (
                <svg
                  viewBox="0 0 24 60"
                  className="w-5 h-12 text-zinc-400 drop-shadow-md select-none pointer-events-auto absolute -top-4 left-6 rotate-[-12deg] z-30 fill-none cursor-pointer"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaperclipRemoved(true);
                    setDiscovery2Revealed(true);
                  }}
                >
                  <path d="M6,45 L6,14 C6,8 10,4 15,4 C20,4 23,8 23,14 L23,38 C23,43 19,47 14,47 C9,47 5,43 5,38 L5,16 C5,13 7,11 10,11 C13,11 15,13 15,16 L15,32" strokeLinecap="round" />
                </svg>
              ) : null}

              <p className="font-handwritten text-xs text-text-ink/80 leading-normal pt-2">
                "you probably forgot this one."
              </p>

              {/* Discovery 2 Sketch revealed */}
              {discovery2Revealed && (
                <motion.div
                  className="mt-2.5 pt-2 border-t border-dashed border-text-ink/10 text-center font-handwritten text-[10px] text-accent-pink"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ☕ Coffee Cup Doodle! 🎨
                </motion.div>
              )}
            </motion.div>

          </div>
        )}

        {/* ==================== FOCUSED MODAL OVERLAYS (PORTAL) ==================== */}
        {mounted && (
          <>
            {/* Envelope focused modal */}
            {envelopeOpen && createPortal(
              <div 
                className="fixed inset-0 bg-black/40 z-[99] pointer-events-auto backdrop-blur-xs flex items-center justify-center p-6" 
                onClick={() => setEnvelopeOpen(false)}
              >
                <motion.div
                  className="w-full max-w-[450px] bg-[#FCFAF5] p-8 border border-[#E9DFB9] shadow-2xl rounded-md text-center relative z-[100]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-handwritten text-3xl text-text-ink/90 font-bold mb-4">A letter for you...</h3>
                  <p className="font-handwritten text-xl text-accent-pink leading-relaxed">
                    "Remember when we thought that was a good idea?"
                  </p>
                  <button 
                    onClick={() => setEnvelopeOpen(false)} 
                    className="mt-8 px-6 py-2.5 bg-white border border-text-ink/10 rounded-full text-xs font-sans font-bold hover:shadow-md cursor-pointer active:scale-95 transition-all text-text-ink/70"
                  >
                    Close Letter
                  </button>
                </motion.div>
              </div>,
              document.body
            )}

            {/* Photo Album focused modal */}
            {albumOpen && createPortal(
              <div 
                className="fixed inset-0 bg-black/40 z-[99] pointer-events-auto backdrop-blur-xs flex items-center justify-center p-6" 
                onClick={() => setAlbumOpen(false)}
              >
                <motion.div
                  className="w-full max-w-[550px] aspect-[4/3] bg-white p-6 border-l-[12px] border-l-[#A68F81] border border-[#DFD8C4] shadow-2xl rounded-md flex flex-col justify-between relative z-[100]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1 w-full bg-zinc-50 border border-zinc-200/50 overflow-hidden flex items-center justify-center rounded-xs relative">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={albumPage}
                        src={friendshipConfig.memories[albumPage]?.src || photos[0]?.src || ""}
                        className="object-cover w-full h-full"
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        alt=""
                      />
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-between items-center text-xs font-sans font-bold text-text-ink/60 mt-4">
                    <button 
                      onClick={() => setAlbumPage((p) => Math.max(0, p - 1))} 
                      disabled={albumPage === 0} 
                      className="hover:text-accent-pink disabled:opacity-30 cursor-pointer"
                    >
                      ← PREV PAGE
                    </button>
                    <span>PAGE {albumPage + 1} / 3</span>
                    <button 
                      onClick={() => setAlbumPage((p) => Math.min(2, p + 1))} 
                      disabled={albumPage === 2} 
                      className="hover:text-accent-pink disabled:opacity-30 cursor-pointer"
                    >
                      NEXT PAGE →
                    </button>
                  </div>
                  <button 
                    onClick={() => setAlbumOpen(false)} 
                    className="text-center text-xs uppercase tracking-wider text-text-ink/40 mt-4 hover:text-accent-pink cursor-pointer font-bold"
                  >
                    [ Close Album Cover ]
                  </button>
                </motion.div>
              </div>,
              document.body
            )}

            {/* Memory Box focused modal */}
            {boxOpen && createPortal(
              <div 
                className="fixed inset-0 bg-black/40 z-[99] pointer-events-auto backdrop-blur-xs flex items-center justify-center p-6" 
                onClick={() => setBoxOpen(false)}
              >
                <motion.div
                  className="w-full max-w-[480px] bg-[#F5ECE1] p-6 border-2 border-[#D5CBB9] shadow-2xl rounded-md flex flex-col justify-between relative z-[100]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <h3 className="font-handwritten text-3xl text-[#8E8171] font-bold mb-1">little things box</h3>
                    <span className="text-[9px] font-sans font-bold text-text-ink/40 uppercase tracking-widest block mb-4 border-b border-text-ink/10 pb-1">
                      click items to inspect:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-sans font-bold text-text-ink/75 my-4">
                    <button 
                      onClick={() => setActiveBoxItem("ticket")} 
                      className={`p-2.5 bg-white border border-text-ink/5 rounded-xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-accent-pink/40 ${
                        activeBoxItem === "ticket" ? "text-accent-pink border-accent-pink/30" : ""
                      }`}
                    >
                      🎟 ticket stub
                    </button>
                    <button 
                      onClick={() => setActiveBoxItem("stamp")} 
                      className={`p-2.5 bg-white border border-text-ink/5 rounded-xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-accent-pink/40 ${
                        activeBoxItem === "stamp" ? "text-accent-pink border-accent-pink/30" : ""
                      }`}
                    >
                      🌸 postage stamp
                    </button>
                    <button 
                      onClick={() => setActiveBoxItem("leaf")} 
                      className={`p-2.5 bg-white border border-text-ink/5 rounded-xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-accent-pink/40 ${
                        activeBoxItem === "leaf" ? "text-accent-pink border-accent-pink/30" : ""
                      }`}
                    >
                      🍀 clover leaf
                    </button>
                    <button 
                      onClick={() => { setDiscovery3Revealed(true); setActiveBoxItem("bracelet"); }} 
                      className={`p-2.5 bg-white border border-text-ink/5 rounded-xs flex items-center justify-center gap-1.5 cursor-pointer hover:border-accent-pink/40 ${
                        activeBoxItem === "bracelet" ? "text-accent-pink border-accent-pink/30" : ""
                      }`}
                    >
                      📿 secret charm
                    </button>
                  </div>
                  <div className="min-h-[60px] flex items-center justify-center border border-dashed border-[#DFD8C4] p-3 rounded-xs text-center text-sm font-handwritten text-text-ink/90 bg-white/50">
                    {activeBoxItem ? (
                      <>
                        {activeBoxItem === "ticket" && "ticket stub: 'remember this trip?' 🎟"}
                        {activeBoxItem === "stamp" && "postage stamp: 'sent with love' 🌸"}
                        {activeBoxItem === "leaf" && "clover leaf: 'for good luck' 🍀"}
                        {activeBoxItem === "bracelet" && "secret charm: 'you found the friendship lock!' 📿"}
                      </>
                    ) : (
                      <span className="text-text-ink/40">Select an item above...</span>
                    )}
                  </div>
                  <button 
                    onClick={() => { setBoxOpen(false); setActiveBoxItem(null); }} 
                    className="text-center text-xs uppercase tracking-wider text-text-ink/40 mt-6 hover:text-accent-pink cursor-pointer font-bold"
                  >
                    [ Close Box ]
                  </button>
                </motion.div>
              </div>,
              document.body
            )}
          </>
        )}

        {/* Bottom center: Replay & Continue navigation */}
        <div className="relative md:absolute mt-8 md:mt-0 bottom-auto md:bottom-6 left-auto md:left-1/2 transform-none md:-translate-x-1/2 z-40 pointer-events-auto flex items-center justify-center flex-wrap gap-4 w-full md:w-auto" data-html2canvas-ignore="true">
          <motion.button
            onClick={onReplay}
            className="group px-5 py-2.5 bg-white/80 backdrop-blur-xs border border-text-ink/10 shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 text-xs font-sans font-bold text-text-ink/70 rounded-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-[-180deg]" />
            REPLAY STORY
          </motion.button>

          <motion.button
            onClick={handleContinueClick}
            className="group px-6 py-2.5 bg-gradient-to-r from-accent-pink to-[#E55B7F] hover:from-[#E55B7F] hover:to-accent-pink text-white shadow-[0_4px_14px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.45)] active:scale-95 transition-all duration-300 cursor-pointer flex items-center gap-2 text-xs font-sans font-bold rounded-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1 }}
          >
            CONTINUE
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>

      </motion.div>

      {/* Cinematic Transition to Page 4 */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-[98] flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {/* Soft Warm Candlelight / Sunset backdrop blur */}
            <div 
              className="absolute inset-0 bg-[#FAF8F5]/85 backdrop-blur-md"
              style={{
                background: "radial-gradient(circle at 50% 50%, #FCFAF2 0%, #FAF6EE 50%, #F5ECE1 100%)",
              }}
            />
            
            {/* Soft drifting ambient glow */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30"
              style={{
                background: "radial-gradient(circle at 50% 50%, #F7E5A9 0%, transparent 70%)",
                animation: "candleGlow 3s ease-in-out infinite alternate"
              }}
            />
            
            {/* Drifting dust particles / fibers */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-[#8C7D70]/20 rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatParticle ${5 + Math.random() * 5}s ease-in-out infinite alternate`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* The single focused physical envelope */}
            <motion.div
              className="relative w-[min(85vw,360px)] aspect-[1.5/1] bg-[#FAF7F0] border border-[#EBE5D3] rounded-md shadow-2xl flex flex-col justify-center items-center z-10 rotate-[-1.5deg]"
              initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
              animate={{ scale: 1.05, opacity: 1, rotate: -1 }}
              transition={{ delay: 0.3, duration: 1.2, type: "spring", stiffness: 80 }}
            >
              {/* Envelope back flap overlay representation */}
              <div className="absolute inset-0 border border-dashed border-[#DFD6BF]/40 rounded-md pointer-events-none" />
              <span className="font-handwritten text-3xl text-text-ink/80 block select-none">For you ♡</span>
              <span className="text-[9px] font-sans font-bold tracking-widest text-[#BFA28F]/70 uppercase mt-3 select-none">
                one more thing...
              </span>
            </motion.div>
            
            <style>{`
              @keyframes candleGlow {
                0% { opacity: 0.25; transform: scale(0.98); }
                100% { opacity: 0.4; transform: scale(1.02); }
              }
              @keyframes floatParticle {
                0% { transform: translateY(0) translateX(0) rotate(0deg); }
                100% { transform: translateY(-30px) translateX(15px) rotate(180deg); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrapbookCanvas>
  );
};
