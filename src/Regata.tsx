import "./Duel.css";
import "./Regata.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A sandolo with its rower standing to the oar, in profile facing right. 18 × 9.
// h hull, w waterline, o oar, r rower's robe, s skin.
const BOAT = [
  "..................",
  "................s.",
  "...............sss",
  "..............rrrr",
  "...o.........rrrr.",
  "..ooo.oooooooooo..",
  ".hhhhhhhhhhhhhhhh.",
  "..hhhhhhhhhhhhhh..",
  "...wwwwwwwwwwww...",
];

const COLORS = {
  player: { h: "#6b4326", w: "#efe6d2", o: "#c9a227", r: "#a8452c", s: "#d9a878" },
  foe: { h: "#4a3423", w: "#e6dcc4", o: "#8d9aa8", r: "#2f4c6b", s: "#c68f61" },
};

const START = -74;
const FINISH = 332;
const RUN = FINISH - START;

// Timeline in ticks: 0–15 the two sandoli race up the canal, the winner pulling ahead from
// the first stroke; 15+ the verdict under the palio.
export function Regata({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";
  const settled = tick >= 15;

  const progress = Math.min(1, Math.max(0, tick / 16));
  const drift = Math.max(0, tick - 16) * 6;
  const playerX = START + (won ? progress : progress * 0.85) * RUN + (won ? drift : 0);
  const foeX = START + (won ? progress * 0.85 : progress) * RUN + (won ? 0 : drift);
  const bob = tick % 2 ? -2 : 0;

  return (
    <div className="duel-overlay duel-venice" aria-hidden="true">
      <div className="regata-stage">
        <svg className="regata-canal" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="regata-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c7d80" />
              <stop offset=".45" stopColor="#1f5c63" />
              <stop offset="1" stopColor="#14424a" />
            </linearGradient>
          </defs>

          {/* Palazzi along the canal: walls, arched windows, a campanile behind. */}
          <g fill="rgba(36, 31, 28, .55)">
            <rect x="0" y="52" width="120" height="46" />
            <rect x="132" y="40" width="86" height="58" />
            <rect x="230" y="58" width="104" height="40" />
            <rect x="348" y="62" width="52" height="36" />
            <rect x="300" y="18" width="18" height="42" />
            <path d="M300 18l9-14 9 14Z" />
          </g>
          <g fill="rgba(246, 241, 230, .30)">
            {[0, 132, 230, 348].map((x) =>
              [0, 1, 2].map((col) => (
                <rect key={`${x}-${col}`} x={x + 14 + col * 22} y="64" width="12" height="18" rx="6" />
              ))
            )}
          </g>

          {/* The palio: a striped banner on the finishing pole. */}
          <rect x={FINISH + 8} y="30" width="3" height="120" fill="rgba(201, 162, 39, .85)" />
          <g>
            <rect x={FINISH + 11} y="32" width="34" height="10" fill="#a8452c" />
            <rect x={FINISH + 11} y="42" width="34" height="10" fill="#f6f1e6" />
            <rect x={FINISH + 11} y="52" width="34" height="10" fill="#a8452c" />
          </g>

          {/* Water. */}
          <rect x="0" y="98" width="400" height="102" fill="url(#regata-water)" />
          <g stroke="rgba(246, 241, 230, .18)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="0" y1="118" x2="46" y2="118" /><line x1="86" y1="112" x2="150" y2="112" />
            <line x1="190" y1="124" x2="262" y2="124" /><line x1="300" y1="116" x2="372" y2="116" />
            <line x1="24" y1="150" x2="98" y2="150" /><line x1="150" y1="158" x2="214" y2="158" />
            <line x1="250" y1="148" x2="330" y2="148" /><line x1="60" y1="184" x2="140" y2="184" />
            <line x1="210" y1="190" x2="300" y2="190" /><line x1="330" y1="178" x2="396" y2="178" />
          </g>
        </svg>

        <div className="duel-tag regata-tag" style={{ left: `${Math.max(48, playerX + 34)}px`, top: "46px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className="regata-boat regata-player" style={{ left: `${playerX}px`, top: "112px", transform: `translateY(${bob}px)` }}>
          <PixelSprite rows={BOAT} colors={COLORS.player} />
        </div>
        <div className="regata-boat regata-foe" style={{ left: `${foeX}px`, top: "152px", transform: `translateY(${bob ? 0 : -2}px)` }}>
          <PixelSprite rows={BOAT} colors={COLORS.foe} />
        </div>

        <span className="regata-wake" style={{ left: `${playerX - 40}px`, top: "146px" }} />
        <span className="regata-wake regata-wake-foe" style={{ left: `${foeX - 40}px`, top: "186px" }} />

        {settled && won && <span className="regata-palio" style={{ left: `${FINISH + 26}px`, top: "24px" }}>✦</span>}
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "Viva San Marco!" : "Sconfitta…"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
