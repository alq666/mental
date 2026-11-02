import "./Duel.css";
import "./Majlis.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A scholar of the House of Wisdom, seated cross-legged, facing right. 16 × 18.
// t turban, s skin, e eye, b beard, r robe, f sandal.
const CROWN_UP = [
  "................",
  "....tttttt......",
  "...tttttttt.....",
  "....ssssss......",
  "....sesses......",
  "....ssssss......",
  ".....bbbb.......",
];
const CROWN_BOW = [
  "................",
  "................",
  "....tttttt......",
  "...tttttttt.....",
  "....ssssss......",
  "....sesses......",
  ".....bbbb.......",
];
const ARMS_REST = [
  "...rrrrrrrr.....",
  "..rrrrrrrrrr....",
  ".srrrrrrrrrrs...",
  "..rrrrrrrrrr....",
];
// The right arm thrusts out toward the opponent's side of the carpet.
const ARMS_POINT = [
  "...rrrrrrrr.....",
  "..rrrrrrrrrrss..",
  "..rrrrrrrrrr....",
  "..rrrrrrrrrr....",
];
// Both hands raised, sleeves falling back — the gesture of a point carried.
const ARMS_RAISE = [
  "..s..rrrrr..s...",
  "...rrrrrrrr.....",
  "..rrrrrrrrrr....",
  "..rrrrrrrrrr....",
];
const SKIRT = [
  ".rrrrrrrrrrrr...",
  ".rrrrrrrrrrrrr..",
  ".rrrrrrrrrrrr...",
  "..rrrrrrrrrr....",
  "..rrrrrrrrrr....",
];
const FEET = [
  "..ff......ff....",
  "...ff....ff.....",
];

const SCHOLAR = {
  sit: [...CROWN_UP, ...ARMS_REST, ...SKIRT, ...FEET],
  point: [...CROWN_UP, ...ARMS_POINT, ...SKIRT, ...FEET],
  raise: [...CROWN_UP, ...ARMS_RAISE, ...SKIRT, ...FEET],
  bow: [...CROWN_BOW, ...ARMS_REST, ...SKIRT, ...FEET],
};
type Pose = keyof typeof SCHOLAR;

const SCHOLAR_COLORS = {
  player: { t: "#f2e9d2", s: "#d9a878", e: "#241a12", b: "#3a2c1e", r: "#1a4f7a", f: "#5b4326" },
  foe: { t: "#e6dcc4", s: "#c68f61", e: "#1d150f", b: "#4a3524", r: "#7c6a4a", f: "#4a3524" },
};

const LEFT = { x: 96, y: 96 };
const RIGHT = { x: 244, y: 96 };

// Timeline in ticks: 0–2 both seated, 3–6 the player's argument crosses the carpet,
// 7–11 the opponent's answer comes back, 13+ one of them bows and the other rises.
export function Majlis({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";

  const playerPose: Pose = tick >= 13 ? (won ? "raise" : "bow") : tick >= 3 && tick < 7 ? "point" : "sit";
  const foePose: Pose = tick >= 13 ? (won ? "bow" : "raise") : tick >= 7 && tick < 12 ? "point" : "sit";

  const travelled = (from: number, to: number, start: number, span: number) => {
    const progress = Math.min(1, Math.max(0, (tick - start) / span));
    return from + (to - from) * progress;
  };
  const outbound = tick >= 3 && tick < 7;
  const inbound = tick >= 7 && tick < 12;
  const glyphX = outbound ? travelled(LEFT.x + 62, RIGHT.x - 8, 3, 110) : travelled(RIGHT.x - 8, LEFT.x + 62, 7, 133);
  const glyphY = 62 - Math.sin((tick % 6) * 0.5) * 8;

  const settled = tick >= 13;

  return (
    <div className="duel-overlay duel-majlis" aria-hidden="true">
      <div className="majlis-stage">
        <svg className="majlis-room" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="majlis-arch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(26,79,122,.30)" />
              <stop offset="1" stopColor="rgba(26,79,122,.04)" />
            </linearGradient>
          </defs>
          {/* The iwan: a pointed arch behind the disputants. */}
          <path d="M64 176V88a136 136 0 0 1 272 0v88Z" fill="url(#majlis-arch)" stroke="rgba(201,162,39,.55)" strokeWidth="2" />
          <path d="M82 176V92a118 118 0 0 1 236 0v84" fill="none" stroke="rgba(201,162,39,.28)" strokeWidth="1.5" />
          {/* Carpet. */}
          <rect x="0" y="152" width="400" height="48" fill="rgba(168,69,44,.14)" />
          <rect x="0" y="152" width="400" height="3" fill="rgba(201,162,39,.5)" />
          <g fill="rgba(201,162,39,.18)">
            <path d="M40 176l10-9 10 9-10 9Z" /><path d="M100 190l8-7 8 7-8 7Z" />
            <path d="M300 176l10-9 10 9-10 9Z" /><path d="M350 190l8-7 8 7-8 7Z" />
          </g>
          {/* The hanging lamp between them. */}
          <path d="M200 0v30" stroke="rgba(201,162,39,.5)" strokeWidth="2" />
          <path d="M186 44a14 14 0 0 0 28 0Z" fill="rgba(201,162,39,.75)" />
          <ellipse className={`majlis-flame ${settled ? (won ? "majlis-flare" : "majlis-dim") : ""}`} cx="200" cy="40" rx="5" ry="7" fill="#ffd77a" />
          <path d="M186 44h28" stroke="rgba(120,90,30,.55)" strokeWidth="2" />
        </svg>

        <div className="majlis-tag duel-tag" style={{ left: `${LEFT.x + 34}px`, top: "64px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className="majlis-scholar majlis-player" style={{ left: `${LEFT.x}px`, top: `${LEFT.y}px` }}>
          <PixelSprite rows={SCHOLAR[playerPose]} colors={SCHOLAR_COLORS.player} />
        </div>
        <div className="majlis-scholar majlis-foe" style={{ left: `${RIGHT.x}px`, top: `${RIGHT.y}px` }}>
          <PixelSprite rows={SCHOLAR[foePose]} colors={SCHOLAR_COLORS.foe} mirrored />
        </div>

        {(outbound || inbound) && (
          <span className={`majlis-glyph ${inbound ? "majlis-glyph-foe" : ""}`} style={{ left: `${glyphX}px`, top: `${glyphY}px` }}>
            {outbound ? "✧" : "✦"}
          </span>
        )}
        {settled && (
          <span className={`majlis-burst ${won ? "majlis-burst-win" : "majlis-burst-lose"}`} style={{ left: `${(won ? LEFT.x : RIGHT.x) + 20}px`, top: "52px" }}>
            ✧
          </span>
        )}
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "أصبت!" : "لم تُصب"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
