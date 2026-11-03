import "./Duel.css";
import "./SaberDuel.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A robed duellist facing right, hands ready. 14 × 18. The blade is not part of the
// sprite — it is a glowing element pinned to the hilt so it can bloom and extend.
// h hood, f face, r robe, s hand, l legs, b boots.
const DUELLIST = [
  "..............",
  "....hhhhh.....",
  "...hhhhhhh....",
  "...hfffffh....",
  "...hfffffh....",
  "....fffff.....",
  "...rrrrrrr....",
  "..rrrrrrrrss..",
  "..rrrrrrrr....",
  "..rrrrrrrr....",
  ".rrrrrrrrrr...",
  ".rrrrrrrrrr...",
  ".rrrrrrrrrrr..",
  "..rrrr..rrrr..",
  "..rrr....rrr..",
  "..ll......ll..",
  ".bbb......bbb.",
  "..............",
];

const COLORS = {
  player: { h: "#4a5a6e", f: "#e8c9a0", r: "#c9d6e4", s: "#e8c9a0", l: "#8fa2b8", b: "#22303f" },
  foe: { h: "#3a2a2c", f: "#d8a37e", r: "#3b2b33", s: "#d8a37e", l: "#2a1f26", b: "#141014" },
};

const LEFT = { x: 96, y: 62 };
const RIGHT = { x: 236, y: 62 };

type Blade = { angle: number; extend: number; glow: "player" | "foe" | "off" };

// Timeline in ticks: 0–2 the blades ignite, 3–7 the two close, 8–11 they trade blows
// with sparks at the contact, 12 the beaten blade is knocked away, 13+ the verdict.
export function SaberDuel({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";
  const lit = tick >= 2;
  const closing = Math.min(1, Math.max(0, (tick - 3) / 4));
  const clashing = tick >= 8 && tick < 12;
  const beaten = tick >= 12;
  const settled = tick >= 13;

  const step = closing * 16;
  const playerX = LEFT.x + step;
  const foeX = RIGHT.x - step;

  const strikePhase = clashing ? (tick % 2 === 0 ? 1 : 0) : 0;
  const playerBlade: Blade = beaten && won ? { angle: -74, extend: 1, glow: "player" }
    : clashing ? { angle: strikePhase ? -48 : -14, extend: 1, glow: "player" }
      : { angle: -10, extend: lit ? 1 : 0, glow: "player" };
  const foeBlade: Blade = beaten && !won ? { angle: 46, extend: 1, glow: "foe" }
    : clashing ? { angle: strikePhase ? 44 : 8, extend: 1, glow: "foe" }
      : { angle: 10, extend: lit ? 1 : 0, glow: "foe" };

  // The loser: blade knocked away, then the duellist goes down.
  const playerDown = beaten && !won;
  const foeDown = beaten && won;

  return (
    <div className="duel-overlay duel-saber" aria-hidden="true">
      <div className="saber-stage">
        <svg className="saber-space" viewBox="0 0 400 200">
          <g fill="rgba(219, 230, 245, .45)">
            {STARS.map((star, index) => (
              <circle key={index} cx={star[0]} cy={star[1]} r={star[2]} opacity={star[3]} />
            ))}
          </g>
          {/* Hangar deck: a plate floor with two lit strips. */}
          <rect x="0" y="152" width="400" height="48" fill="rgba(111, 211, 255, .05)" />
          <rect x="0" y="152" width="400" height="1.5" fill="rgba(111, 211, 255, .3)" />
          <g stroke="rgba(111, 211, 255, .18)" strokeWidth="1">
            <line x1="40" y1="168" x2="150" y2="168" />
            <line x1="250" y1="168" x2="360" y2="168" />
          </g>
        </svg>

        <div className="duel-tag saber-tag" style={{ left: `${Math.max(48, playerX + 30)}px`, top: "38px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className={`saber-duellist saber-player ${playerDown ? "saber-down" : ""} ${clashing ? "saber-lunge" : ""}`} style={{ left: `${playerX}px`, top: `${LEFT.y}px` }}>
          <PixelSprite rows={DUELLIST} colors={COLORS.player} />
          <span className={`saber-blade saber-blade-player ${beaten && !won ? "saber-lost" : ""}`} style={{ transform: `rotate(${playerBlade.angle}deg) scaleX(${playerBlade.extend})` }} />
          <span className="saber-hilt" />
        </div>

        <div className={`saber-duellist saber-foe ${foeDown ? "saber-down" : ""}`} style={{ left: `${foeX}px`, top: `${RIGHT.y}px` }}>
          <PixelSprite rows={DUELLIST} colors={COLORS.foe} mirrored />
          <span className={`saber-blade saber-blade-foe ${beaten && won ? "saber-lost" : ""}`} style={{ transform: `rotate(${foeBlade.angle}deg) scaleX(${foeBlade.extend})` }} />
          <span className="saber-hilt saber-hilt-foe" />
        </div>

        {tick >= 2 && tick < 4 && <span className="saber-ignite" />}
        {clashing && <span className="saber-sparks" key={tick}>{[0, 1, 2, 3, 4].map((index) => <i key={index} style={{ transform: `rotate(${index * 72}deg) translateY(-8px)` }} />)}</span>}
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "Clean strike!" : "Disarmed!"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}

// Fixed star field so the backdrop never flickers between renders.
const STARS: [number, number, number, number][] = [
  [12, 18, 1.2, .5], [46, 62, 1, .35], [78, 12, 1.6, .6], [104, 92, 1, .3],
  [132, 40, 1.2, .45], [160, 122, 1, .3], [188, 22, 1.4, .55], [214, 68, 1, .35],
  [244, 116, 1.2, .4], [270, 12, 1, .3], [296, 96, 1.6, .6], [322, 52, 1, .35],
  [348, 132, 1.2, .45], [376, 24, 1, .3], [390, 104, 1.4, .5], [28, 118, 1, .28],
  [66, 142, 1.2, .4], [118, 6, 1, .3], [340, 8, 1.2, .4], [200, 44, 1.1, .4],
];
