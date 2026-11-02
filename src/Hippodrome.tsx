import "./Duel.css";
import "./Hippodrome.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// A racing chariot in profile, facing right: driver, cart, wheel, and a single horse. 20 × 16.
// k driver's skin, t driver's tunic, c cart, w wheel rim, h horse, m mane and tail, l legs.
const CHARIOT = [
  "................hhhh",
  ".kkk............hhhh",
  ".kkk...........hhhh.",
  "ttttt..........hhh..",
  "ttttt.mhhhhhhhhhhh..",
  "ttttt.hhhhhhhhhhhh..",
  "cccccc.hhhhhhhhhh...",
  "cccccc.hhhhhhhhhhh..",
  "cccccc.hhhhhhhhhhh..",
  ".wwww...ll..ll......",
  "w....w...ll..ll.....",
  "w....w..ll...ll.....",
  "w....w..ll...ll.....",
  "w....w..............",
  ".wwww...............",
  "....................",
];

// The Blues carry the player, the Greens the rival — the two factions of the Hippodrome.
const COLORS = {
  // A bay for the Blues and a dapple grey for the Greens, dark enough to read on sand.
  player: { k: "#e6b98d", t: "#6b2338", c: "#7a5730", w: "#c8a03a", h: "#a9703f", m: "#5e3a1c", l: "#8c5a30" },
  foe: { k: "#c98b5e", t: "#2f6f6b", c: "#5d4a30", w: "#cfd6da", h: "#8d8b86", m: "#4a4a48", l: "#767470" },
};

const START = -70;
const FINISH = 352;
const RUN = FINISH - START;

// Timeline in ticks: 0–15 the two chariots run the course, the winner pulling ahead from
// the start; 15+ the verdict, with the beaten chariot labouring behind.
export function Hippodrome({ outcome, playerName, caption }: { outcome: "win" | "lose"; playerName: string; caption: string }) {
  const tick = useSceneTick();
  const won = outcome === "win";
  const settled = tick >= 15;

  const progress = Math.min(1, Math.max(0, tick / 16));
  const drift = Math.max(0, tick - 16) * 7;
  const playerX = START + (won ? progress : progress * 0.84) * RUN + (won ? drift : 0);
  const foeX = START + (won ? progress * 0.84 : progress) * RUN + (won ? 0 : drift);
  const bob = tick % 2 ? -2 : 0;

  return (
    <div className="duel-overlay duel-hippodrome" aria-hidden="true">
      <div className="hippo-stage">
        <svg className="hippo-track" viewBox="0 0 400 200">
          {/* Sky over the carceres, and the crowd of the Hippodrome. */}
          <rect x="0" y="0" width="400" height="58" fill="rgba(107,35,56,.16)" />
          <g fill="rgba(200,160,58,.35)">
            {Array.from({ length: 40 }, (_, index) => (
              <rect key={index} x={index * 10 + 1} y={index % 3 ? 8 : 12} width="6" height="6" />
            ))}
          </g>
          <rect x="0" y="24" width="400" height="34" fill="rgba(107,35,56,.14)" />
          {/* The obelisk of Theodosius, far side. */}
          <polygon points="58,58 64,12 70,58" fill="rgba(107,35,56,.4)" />
          <rect x="54" y="54" width="20" height="6" fill="rgba(107,35,56,.4)" />

          {/* The sand of the track. */}
          <rect x="0" y="58" width="400" height="142" fill="rgba(200,160,58,.14)" />
          <g stroke="rgba(107,35,56,.16)" strokeWidth="1.5" fill="none">
            <path d="M0 104H400M0 156H400" />
          </g>
          <rect x="0" y="104" width="400" height="52" fill="rgba(107,35,56,.05)" />

          {/* Starting gates at the left, the finish post and its laurel at the right. */}
          <g fill="rgba(107,35,56,.3)">
            <rect x="8" y="70" width="4" height="42" /><rect x="20" y="70" width="4" height="42" />
            <rect x="8" y="122" width="4" height="42" /><rect x="20" y="122" width="4" height="42" />
          </g>
          <rect x={FINISH + 6} y="60" width="3" height="136" fill="rgba(200,160,58,.85)" />
          <circle cx={FINISH + 7} cy="58" r="9" fill="none" stroke="rgba(200,160,58,.85)" strokeWidth="3" />
          <path d={`M${FINISH + 7} 62l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1Z`} fill="rgba(200,160,58,.5)" />
        </svg>

        <div className="duel-tag hippo-tag" style={{ left: `${Math.max(46, playerX + 40)}px`, top: "64px", transform: "translate(-50%, 0)" }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>

        <div className="hippo-chariot hippo-player" style={{ left: `${playerX}px`, top: "78px", transform: `translateY(${bob}px)` }}>
          <PixelSprite rows={CHARIOT} colors={COLORS.player} />
        </div>
        <div className={`hippo-chariot hippo-foe ${settled && won ? "hippo-beaten" : ""}`} style={{ left: `${foeX}px`, top: "134px", transform: `translateY(${bob ? 0 : -2}px)` }}>
          <PixelSprite rows={CHARIOT} colors={COLORS.foe} />
        </div>

        <span className="hippo-dust" style={{ left: `${playerX - 18}px`, top: "146px" }} />
        <span className="hippo-dust hippo-dust-foe" style={{ left: `${foeX - 18}px`, top: "192px" }} />
      </div>
      <strong className={`duel-verdict ${settled ? "shown" : ""} ${outcome}`}>{won ? "Νίκη!" : "Ἧττα…"}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
