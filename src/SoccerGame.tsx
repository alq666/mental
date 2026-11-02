import "./SoccerGame.css";
import { useId } from "react";
import { Penalty } from "./Penalty";
import { EquationSlots } from "./Equation";
import { ModePicker, type ModeLabels } from "./ModePicker";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type TrophyMetal = "bronze" | "silver" | "gold";

type Badge = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  threshold: number;
  metal: TrophyMetal;
  featured?: boolean;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:soccer-badges:v1";

const BADGES: Badge[] = [
  { id: "hattrick", name: "Hat-trick", tagline: "Three in the net", description: "Score 3 penalties in a row.", threshold: 3, metal: "bronze" },
  { id: "motm", name: "Player of the Match", tagline: "The crowd knows your name", description: "Score 5 penalties in a row.", threshold: 5, metal: "silver" },
  { id: "boot", name: "Golden Boot", tagline: "Top scorer of the tournament", description: "Score 10 penalties in a row.", threshold: 10, metal: "gold" },
  { id: "cup", name: "World Cup", tagline: "Lift the trophy", description: "Score all 20 penalties.", threshold: 20, metal: "gold", featured: true },
];

const MODE_LABELS: ModeLabels = {
  multiply: "Multiply",
  missing: "Missing factor",
  divide: "Divide",
};

function SoccerGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    mode, setMode, equation,
    timerEnabled, setTimerEnabled, timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "Right in the corner!" : feedback === "wrong" ? `The keeper read it — the answer is ${equation.expected}.` : feedback === "timeout" ? `Time's up — the answer is ${equation.expected}.` : "";
  const taken = round - 1 + (feedback ? 1 : 0);

  return (
    <main className="soccer-app">
      <header className="soccer-nav">
        <a className="soccer-brand" href="/soccer" aria-label="Spot Kick home">
          <span className="sc-brand-mark" aria-hidden="true"><i /></span>
          <span><b>Spot Kick</b><small>The Mental Math Cup</small></span>
        </a>
        <nav aria-label="Soccer game navigation">
          <button className="sc-nav-link" onClick={() => setScreen("setup")}>Kick-off</button>
          <button className="sc-nav-link sc-badges-link" onClick={openBadges}>Trophies <span>{earnedIds.length}</span></button>
          <a className="sc-nav-link" href="/">Classic</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="soccer-hero">
          <div className="sc-hero-copy">
            <p className="sc-eyebrow">Penalty shootout</p>
            <h1>Step up to the spot.<br /><em>Score with your head.</em></h1>
            <p className="sc-hero-subtitle">Twenty penalties. Solve each sum to beat the keeper — get it wrong and the keeper saves it.</p>
            <form className="soccer-setup-card" onSubmit={startGame}>
              <label>
                <span>Striker name</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="e.g. Marta" autoFocus />
              </label>
              <div className="sc-form-row">
                <label>
                  <span>Highest factor</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Shot clock</span>
                  <div className="sc-timer-setting">
                    <button type="button" className={`sc-toggle ${timerEnabled ? "sc-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="Use the shot clock"><i /></button>
                    <input aria-label="Shot clock in seconds" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>sec</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="Mode of play" labels={MODE_LABELS} />
              <button className="soccer-primary" type="submit">Kick off <span>→</span></button>
              <p className="sc-setup-note">20 penalties · Trophies for scoring runs · {timerEnabled ? `${timerSeconds || 0} second shot clock` : "No clock"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="sc-game-stage">
          <div className="sc-scoreboard">
            <div><span>Striker</span><strong>{playerName}</strong></div>
            <div className="sc-score"><span>Goals</span><strong>{score}<i>–</i>{taken - score}</strong><span>Saved</span></div>
            <div className={`sc-game-clock ${timerEnabled && timeLeft <= 3 ? "sc-urgent" : ""}`}><span>{timerEnabled ? "Shot clock" : "No clock"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
          </div>
          <div className="sc-pitch-card">
            <div className="sc-progress-meta"><span>Penalty {round} of {TOTAL_ROUNDS}</span><button onClick={openBadges}>Trophies</button></div>
            <ol className="sc-kicks" aria-hidden="true">
              {Array.from({ length: TOTAL_ROUNDS }, (_, index) => <li key={index} className={index < round - 1 || (index === round - 1 && feedback) ? "sc-kick-taken" : index === round - 1 ? "sc-kick-now" : ""} />)}
            </ol>
            <p className="sc-inscription">Beat the keeper</p>
            <div className="soccer-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="soccer-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your answer" aria-label="Your answer" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Shoot</button>
            </form>
            <div className={`soccer-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Penalty key={round} outcome={feedback === "correct" ? "win" : "lose"} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="sc-streak-panel">
            <div className="sc-streak-mark" aria-hidden="true" />
            <div><span>Scoring run</span><strong>{streak} in a row</strong></div>
            <div className="sc-streak-next">{nextBadge ? `Next trophy at ${nextBadge.threshold}` : "Every trophy won"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="sc-result-screen">
          <p className="sc-eyebrow">Full time</p>
          <h1>Shootout complete</h1>
          <p>{playerName}, here is your match report.</p>
          <div className="sc-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Goals</span></div>
            <div><strong>{bestStreak}</strong><span>Best run</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Trophies</span></div>
          </div>
          {latestBadge && <div className="sc-new-badge"><BadgeTrophy badge={latestBadge} earned /><div><span>New trophy · {latestBadge.metal}</span><strong>{latestBadge.name}</strong><small>{latestBadge.tagline}</small></div></div>}
          <div className="sc-result-actions"><button className="soccer-primary" onClick={() => setScreen("setup")}>Play again</button><button className="soccer-secondary" onClick={openBadges}>Trophy cabinet</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="sc-badges-screen">
          <button className="sc-back-button" onClick={closeBadges}>← Back</button>
          <p className="sc-eyebrow">Trophy cabinet</p>
          <h1>Your trophies</h1>
          <p>Every scoring run is a match won. Every trophy, a night to remember.</p>
          <div className="sc-player-plaque"><span>Cabinet of</span><strong>{playerName.trim() || "Unnamed striker"}</strong><small>{earnedIds.length} of {BADGES.length} won</small></div>
          <div className="sc-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`sc-badge-card ${earned ? "sc-earned" : "sc-locked"}`} key={badge.id}>
                <BadgeTrophy badge={badge} earned={earned} />
                <span className="sc-badge-state">{earned ? "Won" : "Locked"} · {badge.metal} trophy</span>
                <h2>{badge.name}</h2>
                <em>{badge.tagline}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>Spot Kick · The Mental Math Cup · 2026</footer>
    </main>
  );
}

const TROPHY_STOPS = [0, 0.16, 0.32, 0.46, 0.66, 1];

type MetalSpec = { stops: string[]; edge: string; highlight: string; trim: string };

const TROPHY_METALS: Record<TrophyMetal, MetalSpec> = {
  bronze: {
    stops: ["#4a2205", "#93531f", "#efbc86", "#ffd9ae", "#b66c32", "#3a1a04"],
    edge: "#3a1a04",
    highlight: "#ffe2bd",
    trim: "#e0a36a",
  },
  silver: {
    stops: ["#3d454b", "#8f9ba3", "#f4f8fb", "#ffffff", "#b6c1c8", "#333b41"],
    edge: "#2d353a",
    highlight: "#ffffff",
    trim: "#d9e2e7",
  },
  gold: {
    stops: ["#5a2e04", "#b9781c", "#ffe9a4", "#fff6cf", "#e9b84a", "#4a2403"],
    edge: "#3f2002",
    highlight: "#fff5c8",
    trim: "#f0c766",
  },
};

// A World Cup-style trophy: two figures entwined around a globe, on the cup's
// malachite base. The metal follows the streak rank: bronze, silver, then gold.
function BadgeTrophy({ badge, earned }: { badge: Badge; earned: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const metalId = `sc-trophy-metal-${uid}`;
  const trimId = `sc-trophy-trim-${uid}`;
  const baseId = `sc-trophy-base-${uid}`;
  const glowId = `sc-trophy-glow-${uid}`;
  const metal = TROPHY_METALS[badge.metal];
  const metalFill = `url(#${metalId})`;
  const trimFill = `url(#${trimId})`;
  const baseFill = `url(#${baseId})`;
  const glowFill = `url(#${glowId})`;

  return (
    <svg className={`sc-trophy ${badge.featured ? "sc-trophy-featured" : ""} ${earned ? "sc-earned" : "sc-dim"}`} viewBox="0 0 120 150" role="img" aria-label={`${badge.metal} World Cup trophy`}>
      <defs>
        <linearGradient id={metalId} x1="28" y1="8" x2="94" y2="144" gradientUnits="userSpaceOnUse">
          {metal.stops.map((color, index) => <stop key={color + index} offset={TROPHY_STOPS[index]} stopColor={color} />)}
        </linearGradient>
        <linearGradient id={trimId} x1="31" y1="118" x2="89" y2="142" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={metal.highlight} />
          <stop offset=".45" stopColor={metal.trim} />
          <stop offset="1" stopColor={metal.stops[1]} />
        </linearGradient>
        <linearGradient id={baseId} x1="31" y1="116" x2="89" y2="144" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3aa578" />
          <stop offset=".35" stopColor="#146142" />
          <stop offset=".62" stopColor="#062b1c" />
          <stop offset="1" stopColor="#1d7552" />
        </linearGradient>
        <radialGradient id={glowId} cx=".34" cy=".28" r=".8">
          <stop offset="0" stopColor="#fffef0" stopOpacity=".9" />
          <stop offset=".4" stopColor="#fffbe8" stopOpacity=".12" />
          <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="144" rx="32" ry="4.5" fill="#000" opacity=".3" />

      {/* Two figures with head, shoulders and legs, lifting the globe. */}
      <g fill={metalFill} stroke={metal.edge} strokeWidth=".9" strokeOpacity=".6">
        <path d="M41 117 C42 108 46 101 48 94 C50 86 47 79 44 72 C42 66 43 59 47 55 C51 51 56 53 56 58 C57 64 54 69 53 75 C52 82 55 89 55 96 C55 104 50 111 48 117 Z" />
        <path d="M79 117 C78 108 74 101 72 94 C70 86 73 79 76 72 C78 66 77 59 73 55 C69 51 64 53 64 58 C63 64 66 69 67 75 C68 82 65 89 65 96 C65 104 70 111 72 117 Z" />
        <path d="M51 117 C53 108 56 105 60 105 C64 105 67 108 69 117 Z" />
        <circle cx="44" cy="51" r="5.3" />
        <circle cx="76" cy="51" r="5.3" />
      </g>
      <g fill="none" stroke={metalFill} strokeWidth="4.6" strokeLinecap="round">
        <path d="M47 57 C43 52 41.5 47 42 42 C42.3 39.5 43.2 37.5 44.5 36" />
        <path d="M73 57 C77 52 78.5 47 78 42 C77.7 39.5 76.8 37.5 75.5 36" />
      </g>
      <g fill={metalFill} stroke={metal.edge} strokeWidth=".7">
        <circle cx="44.5" cy="35.5" r="2.6" />
        <circle cx="75.5" cy="35.5" r="2.6" />
      </g>
      <g fill="none" stroke={metal.highlight} strokeWidth="1.1" strokeLinecap="round" opacity=".55">
        <path d="M46 111 C47 104 49 99 50 93 C51 86 48.5 80 46 74" />
        <path d="M74 111 C73 104 71 99 70 93 C69 86 71.5 80 74 74" />
      </g>

      {/* The globe. */}
      <g>
        <circle cx="60" cy="35" r="19.5" fill={metalFill} stroke={metal.edge} strokeWidth=".9" strokeOpacity=".55" />
        <ellipse cx="60" cy="35" rx="19.5" ry="6" fill="none" stroke={metal.edge} strokeWidth=".7" opacity=".5" />
        <ellipse cx="60" cy="35" rx="14" ry="19.5" fill="none" stroke={metal.edge} strokeWidth=".65" opacity=".4" />
        <ellipse cx="60" cy="35" rx="7.4" ry="19.5" fill="none" stroke={metal.edge} strokeWidth=".65" opacity=".4" />
        <path d="M47 24 C51 19 57 21 60 25 C63 29 61 34 57 37 C53 40 49 37 47 33 C45 30 44.5 27 47 24 Z" fill={metal.edge} opacity=".19" />
        <path d="M64 42 C67 39 72 40 73.5 44 C75 48 71 51 67.5 49 C64.5 47 62.5 44.5 64 42 Z" fill={metal.edge} opacity=".19" />
        <circle cx="60" cy="35" r="19.5" fill={glowFill} />
      </g>

      {/* Round malachite pedestal with metal bands, as on the real cup. */}
      <g>
        <path d="M49 110 C49 114 47 117 44 120 L76 120 C73 117 71 114 71 110 Z" fill={metalFill} stroke={metal.edge} strokeWidth=".8" strokeOpacity=".5" />
        <ellipse cx="60" cy="110" rx="11" ry="3.4" fill={metalFill} />
        <ellipse cx="60" cy="104" rx="8" ry="2.4" fill={metalFill} stroke={metal.edge} strokeWidth=".6" strokeOpacity=".4" />
        <path d="M30 121 V134 C30 139 43 142 60 142 C77 142 90 139 90 134 V121 Z" fill={baseFill} stroke="#041a11" strokeWidth="1" />
        <path d="M30 121 C30 116.5 43 117 60 117 C77 117 90 116.5 90 121 Z" fill={trimFill} stroke={metal.edge} strokeWidth=".7" strokeOpacity=".45" />
        <path d="M31 136 C36 140 46 142 60 142 C74 142 84 140 89 136" fill="none" stroke={trimFill} strokeWidth="3.2" />
        <path d="M37 127 H83" stroke="#3aa578" strokeWidth=".8" opacity=".5" />
        <path d="M37 132 H83" stroke="#3aa578" strokeWidth=".8" opacity=".35" />
      </g>
    </svg>
  );
}

export default SoccerGame;
