import "./OuterRimGame.css";
import { useId } from "react";
import { Dogfight } from "./Dogfight";
import { EquationSlots } from "./Equation";
import { ModePicker, type ModeLabels } from "./ModePicker";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Metal = "steel" | "ion" | "gold" | "glow";

type Badge = {
  id: string;
  name: string;
  motto: string;
  description: string;
  threshold: number;
  /** How many pips on the rank plaque are lit at this rank. */
  pips: number;
  metal: Metal;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:outerrim-badges:v1";

// The academy ladder of a far-away navy: a cadet's single pip up to a squadron legend
// wearing the full plaque.
const BADGES: Badge[] = [
  { id: "cadet", name: "Cadet", motto: "Cleared for the simulator", description: "Three correct in a row.", threshold: 3, pips: 1, metal: "steel", mark: "I" },
  { id: "navigator", name: "Navigator", motto: "Hold your lane in the asteroid field", description: "Five correct in a row.", threshold: 5, pips: 3, metal: "ion", mark: "III" },
  { id: "ace", name: "Ace", motto: "Twelve kills, no scratches", description: "Ten correct in a row.", threshold: 10, pips: 5, metal: "gold", mark: "V" },
  { id: "legend", name: "Squadron Legend", motto: "The squadron flies your callsign", description: "All twenty rounds without a miss.", threshold: 20, pips: 6, metal: "glow", mark: "VI" },
];

const MODE_LABELS: ModeLabels = {
  multiply: "Multiply",
  missing: "Missing factor",
  divide: "Divide",
};

const METALS: Record<Metal, { plate: string; plateEdge: string; pip: string; dim: string; glow: boolean }> = {
  steel: { plate: "#3c4a5c", plateEdge: "#7e8ea3", pip: "#9fd8ff", dim: "#2b3543", glow: false },
  ion: { plate: "#2f4258", plateEdge: "#6fc6ff", pip: "#8fe3ff", dim: "#2b3543", glow: false },
  gold: { plate: "#5a4a22", plateEdge: "#e0c05a", pip: "#ffd873", dim: "#2b3543", glow: false },
  glow: { plate: "#6b5416", plateEdge: "#ffe9a3", pip: "#fff3c4", dim: "#2b3543", glow: true },
};

function OuterRimGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName,
    mode, setMode, equation,
    maxMultiple, setMaxMultiple,
    timerEnabled, setTimerEnabled, timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct"
    ? "Direct hit!"
    : feedback === "wrong"
      ? `Shot went wide — the answer is ${equation.expected}.`
      : feedback === "timeout"
        ? `Engines stalled — the answer is ${equation.expected}.`
        : "";

  return (
    <main className="outerrim-app" lang="en">
      <header className="or-nav">
        <a className="or-brand" href="/outerrim" aria-label="Outer Rim Academy">
          <span className="or-brand-mark" aria-hidden="true">✦</span>
          <span><b>Outer Rim Academy</b><small>twelve parsecs · hyperspace · arithmetic</small></span>
        </a>
        <nav aria-label="Game navigation">
          <button className="or-nav-link" onClick={() => setScreen("setup")}>Briefing</button>
          <button className="or-nav-link or-badges-link" onClick={openBadges}>Ranks <span>{earnedIds.length}</span></button>
          <a className="or-nav-link" href="/">Classic</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="or-hero">
          <div className="or-hero-copy">
            <p className="or-rubric">✦ Flight school · sector nine ✦</p>
            <h1>Twenty rounds at lightspeed.<br /><em>Do the math, pilot.</em></h1>
            <p className="or-hero-subtitle">
              A desert world with two suns, a squadron that counts on you, and twenty
              problems between you and your wings.
            </p>
            <form className="or-setup-card" onSubmit={startGame}>
              <label>
                <span>Callsign</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="e.g. Nova" autoFocus />
              </label>
              <div className="or-form-row">
                <label>
                  <span>Highest multiplicand</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Time per round</span>
                  <div className="or-timer-setting">
                    <button type="button" className={`or-toggle ${timerEnabled ? "or-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="Toggle the chrono"><i /></button>
                    <input aria-label="Seconds per round" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>sec</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="Fire mode" labels={MODE_LABELS} />
              <button className="or-primary" type="submit">Launch <span>→</span></button>
              <p className="or-setup-note">{TOTAL_ROUNDS} rounds · rank plaques · {timerEnabled ? `${timerSeconds || 0} seconds a round` : "no chrono"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="or-game-stage">
          <div className="or-game-topline">
            <div><span>Pilot</span><strong>{playerName}</strong></div>
            <div className={`or-game-clock ${timerEnabled && timeLeft <= 3 ? "or-urgent" : ""}`}><span>{timerEnabled ? "Chrono" : "Untimed"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>View ranks</button>
          </div>
          <div className="or-card">
            <div className="or-progress-meta"><span>Round {round} of {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}% flown</span></div>
            <div className="or-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="or-inscription">Compute fast, keep your lane</p>
            <div className="or-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="or-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your answer" aria-label="Your answer" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Fire</button>
            </form>
            <div className={`or-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Dogfight key={round} outcome={feedback === "correct" ? "win" : "lose"} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="or-streak-panel">
            <div className="or-streak-mark" aria-hidden="true">✦</div>
            <div><span>Current streak</span><strong>{streak} clean</strong></div>
            <div className="or-streak-next">{nextBadge ? `Next rank at ${nextBadge.threshold}` : "Every rank earned"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="or-result-screen">
          <p className="or-rubric">✦ Debrief ✦</p>
          <h1>Back to the hangar</h1>
          <p>{playerName}, the squadron has your numbers on the board.</p>
          <div className="or-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Correct</span></div>
            <div><strong>{bestStreak}</strong><span>Best streak</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Ranks</span></div>
          </div>
          {latestBadge && <div className="or-new-badge"><RankPlaque badge={latestBadge} earned /><div><span>New rank</span><strong>{latestBadge.name}</strong><small>{latestBadge.motto}</small></div></div>}
          <div className="or-result-actions"><button className="or-primary" onClick={() => setScreen("setup")}>Fly again</button><button className="or-secondary" onClick={openBadges}>All ranks</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="or-badges-screen">
          <button className="or-back-button" onClick={closeBadges}>← Back</button>
          <p className="or-rubric">✦ Service record ✦</p>
          <h1>Your rank plaques</h1>
          <p>Each streak is a sortie; each plaque, a pip the squadron will notice.</p>
          <div className="or-player-plaque"><span>Pilot</span><strong>{playerName.trim() || "Unnamed pilot"}</strong><small>{earnedIds.length} of {BADGES.length}</small></div>
          <div className="or-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`or-badge-card ${earned ? "or-earned" : "or-locked"}`} key={badge.id}>
                <RankPlaque badge={badge} earned={earned} />
                <span className="or-badge-state">{earned ? "Awarded" : "Not yet"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.motto}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>Outer Rim Academy · flight school · sector nine</footer>
    </main>
  );
}

/**
 * A rank plaque: six pips on a service plate, lit one rank at a time. The last rank adds
 * the gold frame and the glow. Gradient ids come from useId so four plaques on the screen
 * never share one.
 */
function RankPlaque({ badge, earned }: { badge: Badge; earned: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const plateId = `or-plate-${uid}`;
  const glowId = `or-glow-${uid}`;
  const metal = METALS[badge.metal];

  const pips = Array.from({ length: 6 }, (_, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    return { x: 26 + column * 24, y: 30 + row * 22, lit: index < badge.pips };
  });

  return (
    <div className={`or-plaque ${earned ? "" : "or-dim"}`} aria-hidden="true">
      <svg viewBox="0 0 120 92" role="presentation">
        <defs>
          <linearGradient id={plateId} x1="16" y1="12" x2="104" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={metal.plateEdge} stopOpacity=".55" />
            <stop offset=".5" stopColor={metal.plate} />
            <stop offset="1" stopColor={metal.dim} />
          </linearGradient>
          {metal.glow && (
            <radialGradient id={glowId} cx=".5" cy=".45" r=".6">
              <stop offset="0" stopColor="#fff8dc" stopOpacity=".8" />
              <stop offset=".55" stopColor="#ffe9a3" stopOpacity=".2" />
              <stop offset="1" stopColor="#ffe9a3" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {metal.glow && <rect x="4" y="6" width="112" height="80" rx="12" fill={`url(#${glowId})`} />}

        <rect x="12" y="14" width="96" height="64" rx="7" fill={`url(#${plateId})`} stroke={metal.plateEdge} strokeWidth="2" />
        <rect x="18" y="20" width="84" height="52" rx="4" fill="none" stroke={metal.plateEdge} strokeWidth=".8" opacity=".5" />

        {pips.map((pip, index) => (
          <rect
            key={index}
            x={pip.x} y={pip.y} width="16" height="14" rx="2"
            fill={pip.lit ? metal.pip : metal.dim}
            stroke={pip.lit ? metal.plateEdge : "#1d2531"}
            strokeWidth="1"
            opacity={pip.lit ? 1 : .55}
          />
        ))}

        {metal.glow && (
          <path d="M60 2l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L60 18.6l-6.5 3.3 1.3-7.2-5.3-5.1 7.3-1Z" fill="#ffe9a3" />
        )}
      </svg>
      <strong>{badge.mark}</strong>
    </div>
  );
}

export default OuterRimGame;
