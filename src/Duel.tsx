import "./Duel.css";
import { PixelSprite } from "./PixelSprite";
import { useSceneTick } from "./sceneTimeline";

// Pixel sprites, 16 × 18, facing right. Each character is a palette key; "." is transparent.
// h helmet/hair, c crest, s skin, e eye, t tunic, d tunic trim, b belt, l legs, f feet, w blade, g hilt.
const HEAD = [
  "......cc........",
  "....hhhhhh......",
  "...hhhhhhhh.....",
  "...hhsssss......",
  "...hhsssess.....",
  "....ssssss......",
  ".....ssss.......",
];
const SKIRT = [
  "...bbbbbbbb.....",
  "...tttttttt.....",
  "...tdtdtdtd.....",
];
const STANCE = [
  "....ll..ll......",
  "....ll..ll......",
  "....ll..ll......",
  "...fff.fff......",
];
const STRIDE = [
  "...ll....ll.....",
  "..ll......ll....",
  "..ll......ll....",
  ".fff......fff...",
];
const LUNGE = [
  "....ll...ll.....",
  "...ll.....ll....",
  "..ll.......ll...",
  ".fff.......fff..",
];
const withBlade = (rows: string[], col: number) => rows.map((row) => `${row.slice(0, col)}w${row.slice(col + 1)}`);

const GUARD = [
  ...HEAD.slice(0, 2),
  ...withBlade(HEAD.slice(2), 13),
  "....tttttt...w..",
  "...tttttttt.ggg.",
  "...tttttttssss..",
  "...tttttttt.....",
];
const THRUST = [
  ...HEAD,
  "....tttttt......",
  "...tttttttt.g...",
  "...tttttttssgwww",
  "...tttttttt.g...",
];
const RAISED = [
  "......cc....w...",
  "....hhhhhh..w...",
  "...hhhhhhhh.w...",
  "...hhsssss.ggg..",
  "...hhsssess.s...",
  "....ssssss..s...",
  ".....ssss..s....",
  "....tttttts.....",
  "...tttttttt.....",
  "...tttttttt.....",
  "...tttttttt.....",
];

const POSES = {
  idle: [...GUARD, ...SKIRT, ...STANCE],
  walk: [...GUARD, ...SKIRT, ...STRIDE],
  attack: [...THRUST, ...SKIRT, ...LUNGE],
  victory: [...RAISED, ...SKIRT, ...STANCE],
};
type Pose = keyof typeof POSES | "hurt" | "down";

export type Palette = Record<"h" | "c" | "t" | "d" | "l", string> & Partial<Record<"s", string>>;

export type DuelTheme = {
  className: string;
  player: Palette;
  foe: Palette;
  win: string;
  lose: string;
};

const BASE_COLORS: Record<string, string> = { s: "#efc39a", e: "#1b1410", b: "#4a3020", f: "#2a1d14", w: "#e8ebef", g: "#c9a227" };

function Sprite({ pose, palette, mirrored }: { pose: keyof typeof POSES; palette: Palette; mirrored: boolean }) {
  return <PixelSprite rows={POSES[pose]} colors={{ ...BASE_COLORS, ...palette }} mirrored={mirrored} />;
}

type Fighter = { pose: Pose; x: number; y: number };

// Timeline in ticks: 0–4 approach, 5–10 exchange of blows, 11–13 decisive strike, 14+ the loser lies down.
function choreograph(tick: number, isWinner: boolean): Fighter {
  if (tick < 5) return { pose: tick % 2 ? "walk" : "idle", x: tick * 21, y: 0 };
  if (tick < 11) {
    const leads = (tick % 2 === 0) === isWinner;
    return { pose: leads ? "attack" : "idle", x: 105 + (leads ? 6 : -6), y: 0 };
  }
  if (tick < 14) return isWinner ? { pose: "attack", x: 111, y: 0 } : { pose: "hurt", x: 105 - (tick - 10) * 18, y: 0 };
  return isWinner ? { pose: "victory", x: 111, y: tick < 18 && tick % 2 ? -12 : 0 } : { pose: "down", x: 40, y: 0 };
}

function FighterView({ fighter, palette, side }: { fighter: Fighter; palette: Palette; side: "player" | "foe" }) {
  const pose = fighter.pose === "hurt" || fighter.pose === "down" ? "idle" : fighter.pose;
  const style = { [side === "player" ? "left" : "right"]: `${fighter.x}px`, transform: `translateY(${fighter.y}px)` };
  return (
    <div className={`duel-fighter duel-${side} ${fighter.pose === "hurt" ? "duel-hurt" : ""} ${fighter.pose === "down" ? "duel-down" : ""}`} style={style}>
      <Sprite pose={pose} palette={palette} mirrored={side === "foe"} />
    </div>
  );
}

export function Duel({ outcome, theme, playerName, caption }: { outcome: "win" | "lose"; theme: DuelTheme; playerName: string; caption: string }) {
  const tick = useSceneTick();

  const player = choreograph(tick, outcome === "win");
  const foe = choreograph(tick, outcome === "lose");
  const clashing = tick >= 5 && tick < 14;

  return (
    <div className={`duel-overlay ${theme.className}`} aria-hidden="true">
      <div className="duel-stage">
        <div className="duel-tag" style={{ left: `${player.x + 48}px`, transform: `translate(-50%, ${player.pose === "down" ? 24 : player.y}px)` }}>
          <span>{playerName.trim() || "?"}</span><i />
        </div>
        <FighterView fighter={player} palette={theme.player} side="player" />
        <FighterView fighter={foe} palette={theme.foe} side="foe" />
        {clashing && <span className="duel-spark" key={tick}>✦</span>}
        <div className="duel-ground" />
      </div>
      <strong className={`duel-verdict ${tick >= 14 ? "shown" : ""} ${outcome}`}>{outcome === "win" ? theme.win : theme.lose}</strong>
      <p className="duel-caption">{caption}</p>
    </div>
  );
}
