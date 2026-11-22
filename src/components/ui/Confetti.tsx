import confetti from "canvas-confetti";

// Trigger a classic colorful confetti explosion from the center
export const fireDefaultConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#F3A3B4", "#F7E5A9", "#A2C2E1", "#B4CBB7", "#FF7096"],
  });
};

// Trigger a burst of custom colors shooting upwards from left and right edges
export const fireSideConfetti = () => {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ["#F3A3B4", "#F7E5A9", "#A2C2E1"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ["#F3A3B4", "#F7E5A9", "#A2C2E1"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

// Trigger a celebration confetti explosion
export const fireCelebrationConfetti = () => {
  // Fire multiple rounds
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ["#F3A3B4", "#F7E5A9", "#A2C2E1", "#B4CBB7"],
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};
