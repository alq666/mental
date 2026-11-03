import "./Duel.css";
import "./Dogfight.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A single-seat fighter in profile, facing right. 16 × 9.
// h hull, c canopy, w wing strake, e engine glow.
const FIGHTER = [
  "................",
  ".............hh.",
  "...........hhhhh",
  "..ww...hhhhhhcc.",
  "eewwhhhhhhhhhhhh",
  "eewwhhhhhhhhhhhh",
  ".www.hhhhhhhhhhh",
  "......hhhhhhhhh.",
  ".......hhhhhhh..",
];

const COLORS = {
  player: { h: "#c9d6e4", c: "#6fd3ff", w: "#97a9bd", e: "#8fe6ff" },
  foe: { h: "#5c6470", c: "#ff7a5f", w: "#414a56", e: "#ff9a72" },
};

const LEFT_START = -52;
const RIGHT_START = 336;
const TRAVEL = 150;

// Timeline in ticks: 0–4 the two close head-on, 5–7 they trade cannon fire,
// 8 the loser takes the hit and goes up, 13+ the verdict.
export function Dogfight({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";
  const closing = Math.min(1, tick / 8);
  const firing = tick >= 5 && tick < 9;
  const hit = tick >= 8;
  const settled = tick >= 13;

  const playerX = LEFT_START + closing * TRAVEL;
  const foeX = RIGHT_START - closing * TRAVEL;
  const bank = settled && won ? -14 : 0;

  // Each bolt flies from its ship toward the other; the losing one sails past.
  const boltProgress = firing ? Math.min(1, (tick - 5) / 3) : 0;
  const playerBoltX = playerX + 46 + boltProgress * 150;
  const foeBoltX = foeX - 22 - boltProgress * 150;
  const playerBoltY = 86 + (won ? 0 : -16) * boltProgress;
  const foeBoltY = 120 + (won ? 16 : 0) * boltProgress;

  return (
    <div className="duel-overlay duel-outerrim" aria-hidden="true">
      <div className="dogfight-stage">
        <svg className="dogfight-space" viewBox="0 0 400 200">
          <g fill="rgba(219, 230, 245, .5)">
            {STARS.map((star, index) => (
              <circle key={index} cx={star[0]} cy={star[1]} r={star[2]} opacity={star[3]} />
            ))}
          </g>
          {/* Streaks rushing past, to sell the speed. */}
          <g stroke="rgba(111, 211, 255, .28)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="0" y1="36" x2="58" y2="36" />
            <line x1="120" y1="24" x2="168" y2="24" />
            <line x1="60" y1="164" x2="128" y2="164" />
            <line x1="250" y1="176" x2="330" y2="176" />
            <line x1="300" y1="30" x2="352" y2="30" />
          </g>
        </svg>

        <div className="duel-tag dogfight-tag" style={{ left: `${Math.max(44, playerX + 30)}px`, top: "46px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className="dogfight-ship dogfight-player" style={{ left: `${playerX}px`, top: "72px", transform: `translateY(${bank}px)` }}>
          <PixelSprite rows={FIGHTER} colors={COLORS.player} />
        </div>
        <div className={`dogfight-ship dogfight-foe ${hit && won ? "dogfight-hit" : ""}`} style={{ left: `${foeX}px`, top: "112px" }}>
          <PixelSprite rows={FIGHTER} colors={COLORS.foe} mirrored />
        </div>

        {firing && (
          <>
            <span className={`dogfight-bolt ${won ? "dogfight-bolt-win" : "dogfight-bolt-lose"}`} style={{ left: `${playerBoltX}px`, top: `${playerBoltY}px` }} />
            <span className={`dogfight-bolt ${won ? "dogfight-bolt-lose" : "dogfight-bolt-win"}`} style={{ left: `${foeBoltX}px`, top: `${foeBoltY}px` }} />
          </>
        )}

        {hit && (
          <span className="dogfight-blast" style={{ left: `${(won ? foeX : playerX) + 28}px`, top: `${won ? 118 : 78}px` }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <i key={index} style={{ transform: `rotate(${index * 60}deg) translateY(-${10 + index * 3}px)` }} />
            ))}
          </span>
        )}
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "Splash one!" : "You're hit!"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}

// Fixed star field, so the scene never flickers between renders.
const STARS: [number, number, number, number][] = [
  [12, 18, 1.2, .5], [46, 62, 1, .35], [78, 12, 1.6, .6], [104, 92, 1, .3],
  [132, 40, 1.2, .45], [160, 150, 1, .3], [188, 22, 1.4, .55], [214, 68, 1, .35],
  [244, 140, 1.2, .4], [270, 12, 1, .3], [296, 96, 1.6, .6], [322, 52, 1, .35],
  [348, 168, 1.2, .45], [376, 24, 1, .3], [390, 120, 1.4, .5], [28, 132, 1, .28],
  [66, 172, 1.2, .4], [118, 6, 1, .3], [200, 182, 1.4, .5], [340, 8, 1.2, .4],
];
