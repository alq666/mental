import "./Duel.css";
import "./Shatranj.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A player of the House of Wisdom, seated cross-legged, facing right. 16 × 18.
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
// The near arm reaches out over the board.
const ARMS_REACH = [
  "...rrrrrrrr.....",
  "..rrrrrrrrrrss..",
  "..rrrrrrrrrr....",
  "..rrrrrrrrrr....",
];
// Both hands up: the move is made.
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

const PLAYER = {
  sit: [...CROWN_UP, ...ARMS_REST, ...SKIRT, ...FEET],
  reach: [...CROWN_UP, ...ARMS_REACH, ...SKIRT, ...FEET],
  win: [...CROWN_UP, ...ARMS_RAISE, ...SKIRT, ...FEET],
  lose: [...CROWN_BOW, ...ARMS_REST, ...SKIRT, ...FEET],
};
type Pose = keyof typeof PLAYER;

const PLAYER_COLORS = {
  player: { t: "#f2e9d2", s: "#d9a878", e: "#241a12", b: "#3a2c1e", r: "#1a4f7a", f: "#5b4326" },
  foe: { t: "#e6dcc4", s: "#c68f61", e: "#1d150f", b: "#4a3524", r: "#7c6a4a", f: "#4a3524" },
};

// Shatranj men, 7 × 8: abstract shapes, as the period's carvers kept them — a pawn, a
// rukh, and the shah with his finial. One key (k) so a side colour is all that changes.
const MEN = {
  pawn: [
    "..###..",
    ".#####.",
    "..###..",
    "...#...",
    "..###..",
    "..###..",
    ".#####.",
    "#######",
  ],
  rukh: [
    "#.###.#",
    "#######",
    ".#####.",
    "..###..",
    "..###..",
    ".#####.",
    ".#####.",
    "#######",
  ],
  shah: [
    "...#...",
    "..###..",
    ".#####.",
    "..###..",
    "..###..",
    "..###..",
    ".#####.",
    "#######",
  ],
};
type Man = keyof typeof MEN;

const PIECE_COLORS = { player: "#f6edd6", foe: "#3d2f21" };

const BOARD_TOP = 129;   // the surface the men stand on
const PIECE_H = 21;

// The two sides face each other across the board; the near pieces are the player's.
const SETUP: { id: string; side: "player" | "foe"; man: Man; x: number }[] = [
  { id: "player-shah", side: "player", man: "shah", x: 151 },
  { id: "player-rukh", side: "player", man: "rukh", x: 171 },
  { id: "player-pawn", side: "player", man: "pawn", x: 189 },
  { id: "foe-pawn", side: "foe", man: "pawn", x: 213 },
  { id: "foe-rukh", side: "foe", man: "rukh", x: 231 },
  { id: "foe-shah", side: "foe", man: "shah", x: 249 },
];

const LEFT = { x: 40, y: 62 };
const RIGHT = { x: 280, y: 62 };

// Timeline in ticks: 0–3 both study the board, 4–7 the winning man slides to the square,
// 8 the man it lands on topples, 10 the loser's shah goes over too, 13+ the verdict.
export function Shatranj({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";
  const moving = tick >= 4;
  const taken = tick >= 8;
  const mated = tick >= 10;
  const settled = tick >= 13;

  // The winner's pawn takes the square; on a loss it is the foil's pawn that comes across.
  const attackerFrom = won ? 189 : 213;
  const attackerTo = won ? 213 : 189;
  const victimX = attackerTo;

  const playerPose: Pose = settled ? (won ? "win" : "lose") : moving && won ? "reach" : "sit";
  const foePose: Pose = settled ? (won ? "lose" : "win") : moving && !won ? "reach" : "sit";

  return (
    <div className="duel-overlay duel-shatranj" aria-hidden="true">
      <div className="shatranj-stage">
        <svg className="shatranj-room" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="shatranj-arch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(26,79,122,.28)" />
              <stop offset="1" stopColor="rgba(26,79,122,.04)" />
            </linearGradient>
          </defs>

          {/* The iwan behind the two players. */}
          <path d="M56 176V86a144 144 0 0 1 288 0v90Z" fill="url(#shatranj-arch)" stroke="rgba(201,162,39,.5)" strokeWidth="2" />
          <path d="M74 176V90a126 126 0 0 1 252 0v86" fill="none" stroke="rgba(201,162,39,.24)" strokeWidth="1.5" />

          {/* Carpet. */}
          <rect x="0" y="154" width="400" height="46" fill="rgba(168,69,44,.13)" />
          <rect x="0" y="154" width="400" height="3" fill="rgba(201,162,39,.45)" />
          <g fill="rgba(201,162,39,.16)">
            <path d="M44 176l9-8 9 8-9 8Z" /><path d="M330 176l9-8 9 8-9 8Z" />
            <path d="M150 188l7-6 7 6-7 6Z" /><path d="M236 188l7-6 7 6-7 6Z" />
          </g>

          {/* The hanging lamp over the board. */}
          <path d="M200 0v28" stroke="rgba(201,162,39,.45)" strokeWidth="2" />
          <path d="M186 42a14 14 0 0 0 28 0Z" fill="rgba(201,162,39,.7)" />
          <ellipse className={`shatranj-flame ${settled ? (won ? "shatranj-flare" : "shatranj-dim") : ""}`} cx="200" cy="38" rx="5" ry="7" fill="#ffd77a" />
          <path d="M186 42h28" stroke="rgba(120,90,30,.5)" strokeWidth="2" />

          {/* The board: a low table, its top face checkered, seen almost edge-on. */}
          <rect x="138" y={BOARD_TOP + 5} width="124" height="11" rx="2" fill="rgba(94,64,32,.55)" />
          <rect x="136" y={BOARD_TOP} width="128" height="6" fill="rgba(126,92,48,.62)" />
          <g>
            {Array.from({ length: 8 }, (_, index) => (
              <rect
                key={index}
                x={136 + index * 16} y={BOARD_TOP} width="16" height="3.2"
                fill={index % 2 ? "rgba(74,50,24,.75)" : "rgba(236,220,186,.75)"}
              />
            ))}
            {Array.from({ length: 8 }, (_, index) => (
              <rect
                key={`b${index}`}
                x={136 + index * 16} y={BOARD_TOP + 3.2} width="16" height="2.8"
                fill={index % 2 ? "rgba(236,220,186,.55)" : "rgba(74,50,24,.55)"}
              />
            ))}
          </g>
          <rect x="150" y={BOARD_TOP + 16} width="6" height="12" fill="rgba(94,64,32,.45)" />
          <rect x="244" y={BOARD_TOP + 16} width="6" height="12" fill="rgba(94,64,32,.45)" />
        </svg>

        <div className="duel-tag shatranj-tag" style={{ left: `${LEFT.x + 34}px`, top: "34px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className="shatranj-player" style={{ left: `${LEFT.x}px`, top: `${LEFT.y}px` }}>
          <PixelSprite rows={PLAYER[playerPose]} colors={PLAYER_COLORS.player} />
        </div>
        <div className="shatranj-player shatranj-foe" style={{ left: `${RIGHT.x}px`, top: `${RIGHT.y}px` }}>
          <PixelSprite rows={PLAYER[foePose]} colors={PLAYER_COLORS.foe} mirrored />
        </div>

        {SETUP.map((piece) => {
          const isAttacker = piece.x === attackerFrom;
          const isVictim = piece.x === victimX && !isAttacker;
          const isShah = piece.man === "shah";
          const toppled = (isVictim && taken) || (isShah && mated && ((won && piece.side === "foe") || (!won && piece.side === "player")));
          const x = isAttacker && moving ? attackerTo : piece.x;
          return (
            <div
              key={piece.id}
              className={`shatranj-piece ${toppled ? "shatranj-toppled" : ""}`}
              style={{
                left: `${x - 9}px`,
                top: `${BOARD_TOP - PIECE_H}px`,
              }}
            >
              <PixelSprite rows={MEN[piece.man]} colors={{ k: PIECE_COLORS[piece.side] }} />
            </div>
          );
        })}

        {settled && (
          <span className={`shatranj-burst ${won ? "shatranj-burst-win" : "shatranj-burst-lose"}`} style={{ left: `${(won ? LEFT.x : RIGHT.x) + 34}px`, top: "40px" }}>
            ✦
          </span>
        )}
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "كش مات!" : "خسرت الجولة"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
