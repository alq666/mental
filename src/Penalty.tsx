import { useState } from "react";
import "./Duel.css";
import "./Penalty.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// Sprites, 16 × 18. The striker is seen from behind, the keeper from the front.
// h hair, s skin, e eye, j shirt, n shirt number, k shorts, o socks, f boots, g gloves, q keeper's shirt.
const STRIKER_TOP = [
  "................",
  "......hhhh......",
  ".....hhhhhh.....",
  ".....hhhhhh.....",
  ".....shhhhs.....",
  "......ssss......",
  "....jjjjjjjj....",
  "...jjjjnnnjjj...",
  "...jjjjnjnjjj...",
  "..sjjjjnnnjjjs..",
  "..sjjjjjjnjjjs..",
];
const STRIKER_CHEER_TOP = [
  "..s..........s..",
  "..s...hhhh...s..",
  "..sj.hhhhhh.js..",
  "...j.hhhhhh.j...",
  "...jjshhhhsjj...",
  "....jjssssjj....",
  "....jjjjjjjj....",
  "...jjjjnnnjjj...",
  "...jjjjnjnjjj...",
  "...jjjjnnnjjj...",
  "...jjjjjjnjjj...",
];
const SHORTS = [
  "....kkkkkkkk....",
  "....kkkkkkkk....",
];
const STRIKER_LEGS = {
  stand: [
    ".....ss..ss.....",
    ".....oo..oo.....",
    ".....oo..oo.....",
    ".....oo..oo.....",
    "....fff..fff....",
  ],
  run: [
    ".....ss..ss.....",
    ".....oo..oo.....",
    ".....oo...oo....",
    "....fff....oo...",
    "...........ff...",
  ],
  kick: [
    ".....ss..ss.....",
    ".....oo..oo.....",
    ".....oo...ff....",
    ".....oo.........",
    "....fff.........",
  ],
};
const STRIKER = {
  stand: [...STRIKER_TOP, ...SHORTS, ...STRIKER_LEGS.stand],
  run: [...STRIKER_TOP, ...SHORTS, ...STRIKER_LEGS.run],
  kick: [...STRIKER_TOP, ...SHORTS, ...STRIKER_LEGS.kick],
  cheer: [...STRIKER_CHEER_TOP, ...SHORTS, ...STRIKER_LEGS.stand],
};

const KEEPER_LEGS = [
  "....kkkkkkkk....",
  "....kkkkkkkk....",
  "....ss....ss....",
  "....oo....oo....",
  "...oo......oo...",
  "...oo......oo...",
  "..fff......fff..",
];
const KEEPER = {
  ready: [
    "................",
    "......hhhh......",
    ".....hhhhhh.....",
    ".....sesses.....",
    ".....ssssss.....",
    "......ssss......",
    "gg..qqqqqqqq..gg",
    "ggqqqqqqqqqqqqgg",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    ...KEEPER_LEGS,
  ],
  reach: [
    "..gg........gg..",
    "..gg..hhhh..gg..",
    "...q.hhhhhh.q...",
    "...q.sesses.q...",
    "...qqssssssqq...",
    "....q.ssss.q....",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    "....qqqqqqqq....",
    ...KEEPER_LEGS,
  ],
};

const COLORS = {
  striker: { h: "#3b2414", s: "#e9b98f", j: "#ffd23f", n: "#0d1b2a", k: "#0d1b2a", o: "#ffd23f", f: "#111" },
  keeper: { h: "#1b1410", s: "#c98b5e", e: "#111", q: "#2bb3a3", g: "#f4f4f4", k: "#111", o: "#2bb3a3", f: "#111" },
};

// Stage coordinates (px): the goal spans x 70–330, crossbar at y 16, goal line at y 116.
const SPOT = { x: 200, y: 178 };
const KEEPER_HOME = { x: 200, y: 80 };

type Shot = { side: -1 | 1; high: boolean };

// Timeline in ticks: 0–5 run-up, 6 the kick, 6–9 ball in flight while the keeper dives,
// 9+ the ball is in the net or parried wide, 10+ the verdict.
export function Penalty({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const [shot] = useState<Shot>(() => ({ side: Math.random() < .5 ? -1 : 1, high: Math.random() < .5 }));
  const scored = outcome === "win";

  const target = { x: KEEPER_HOME.x + shot.side * 100, y: shot.high ? 40 : 88 };
  const kicked = tick >= 6;
  const settled = tick >= 9;

  const strikerX = Math.min(tick, 5) * 28;
  const strikerPose = tick < 6 ? (tick % 2 ? "run" : "stand") : tick < 8 ? "kick" : scored ? "cheer" : "stand";
  const strikerHop = scored && tick >= 10 && tick % 2 ? -10 : 0;

  // The keeper dives the shot's way on a save and the wrong way on a goal; the hands land on the target.
  const diveSide = scored ? -shot.side : shot.side;
  const keeper = kicked
    ? { x: KEEPER_HOME.x + diveSide * 68, y: Math.min(target.y + 12, KEEPER_HOME.y + 14), rotate: diveSide * 70, pose: "reach" as const }
    : { x: KEEPER_HOME.x + (tick % 2 ? 4 : -4), y: KEEPER_HOME.y, rotate: 0, pose: "ready" as const };

  const ball = !kicked
    ? { ...SPOT, scale: 1 }
    : !settled || scored
      ? { ...target, scale: settled ? .7 : .75 }
      : { x: target.x + shot.side * 40, y: 150, scale: .8 };

  return (
    <div className="duel-overlay duel-soccer" aria-hidden="true">
      <div className="penalty-stage">
        <svg className={`penalty-goal ${scored && settled ? "penalty-net-hit" : ""}`} viewBox="0 0 400 200">
          <defs>
            <pattern id="penalty-net" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M0 0L10 10M10 0L0 10" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="70" y="16" width="260" height="100" fill="url(#penalty-net)" />
          <path d="M70 116V16H330V116" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
          <line x1="0" y1="118" x2="400" y2="118" stroke="rgba(255,255,255,.7)" strokeWidth="2" />
          <path d="M40 200L60 140H340L360 200" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="2" />
          <ellipse cx={SPOT.x} cy={SPOT.y + 8} rx="5" ry="2" fill="rgba(255,255,255,.8)" />
        </svg>
        <div className="penalty-keeper" style={{ left: `${keeper.x - 32}px`, top: `${keeper.y - 36}px`, transform: `rotate(${keeper.rotate}deg)` }}>
          <PixelSprite rows={KEEPER[keeper.pose]} colors={COLORS.keeper} />
        </div>
        <div className={`penalty-ball ${kicked && !settled ? "penalty-ball-flying" : ""}`} style={{ left: `${ball.x - 11}px`, top: `${ball.y - 11}px`, transform: `scale(${ball.scale})` }}>
          <svg viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" fill="#fff" stroke="#222" strokeWidth="1" />
            <path d="M10 6.5L13.3 8.9L12 12.8H8L6.7 8.9Z" fill="#222" />
            <path d="M10 1v3M18.5 7.5l-3 1M15.5 17l-2-2.5M4.5 17l2-2.5M1.5 7.5l3 1" stroke="#222" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="penalty-striker" style={{ left: `${strikerX}px`, transform: `translateY(${strikerHop}px)` }}>
          <PixelSprite rows={STRIKER[strikerPose]} colors={COLORS.striker} />
        </div>
        <div className="duel-tag" style={{ left: `${strikerX + 40}px`, top: "84px", transform: `translate(-50%, ${strikerHop}px)` }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>
      </div>
      <strong className={`duel-verdict ${tick >= 10 ? "shown" : ""} ${outcome}`}>{scored ? "GOAL!" : "SAVED!"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
