import { useEffect, useState } from "react";

// Shared clock for the short scenes played after each answer (the duel, the penalty kick).
export const SCENE_TICK_MS = 100;
export const SCENE_TICKS = 24;
/** Length of a scene; the game waits this long (plus a short hold) before the next question. */
export const SCENE_MS = SCENE_TICK_MS * SCENE_TICKS;

/** Counts from 0 to SCENE_TICKS, one step per tick; jumps to the end when the viewer prefers reduced motion. */
export function useSceneTick() {
  const [tick, setTick] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? SCENE_TICKS : 0);

  useEffect(() => {
    if (tick >= SCENE_TICKS) return;
    const timer = window.setTimeout(() => setTick((value) => value + 1), SCENE_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [tick]);

  return tick;
}
