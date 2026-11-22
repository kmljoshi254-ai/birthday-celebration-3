"use client";

import React, { useState } from "react";
import { friendshipConfig } from "@/config/friendship";
import { PremiumIntro } from "@/components/intro/PremiumIntro";
import { USScene } from "@/components/scrapbook/USScene";
import { MemoryDeskScene } from "@/components/scrapbook/MemoryDeskScene";
import { Page4Scene } from "@/components/scrapbook/page4/Page4Scene";
import { MemoryCapsuleScene } from "@/components/scrapbook/page5/MemoryCapsuleScene";
import { MemorySkyScene } from "@/components/scrapbook/page6/MemorySkyScene";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

export type Scene = "intro" | "us" | "memories" | "letter" | "rocket" | "sky";

export default function Home() {
  const [scene, setScene] = useState<Scene>("intro");
  const [audioTrigger, setAudioTrigger] = useState(false);

  const handleEnvelopeOpen = () => {
    setScene("us");
  };

  const handleContinueStory = () => {
    setScene("memories");
  };

  const handleReplay = () => {
    setScene("intro");
    setAudioTrigger(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <main className="w-full min-h-screen bg-paper overflow-hidden relative">
      {scene === "intro" && (
        <PremiumIntro
          onOpenComplete={handleEnvelopeOpen}
          onEnvelopeOpen={() => setAudioTrigger(true)}
        />
      )}

      {scene === "us" && (
        <USScene
          onContinue={handleContinueStory}
        />
      )}

      {scene === "memories" && (
        <MemoryDeskScene
          onReplay={handleReplay}
          onContinue={() => setScene("letter")}
        />
      )}

      {scene === "letter" && (
        <Page4Scene
          onReplay={handleReplay}
          onBackToDesk={() => setScene("memories")}
          onContinue={() => setScene("rocket")}
        />
      )}

      {scene === "rocket" && (
        <MemoryCapsuleScene
          onBackToLetter={() => setScene("letter")}
          onReplay={handleReplay}
          onContinue={() => setScene("sky")}
        />
      )}

      {scene === "sky" && (
        <MemorySkyScene
          onContinue={handleReplay}
        />
      )}

      {/* Aesthetic Background Music Player */}
      <AudioPlayer scene={scene} autoPlayTrigger={audioTrigger} />
    </main>
  );
}

