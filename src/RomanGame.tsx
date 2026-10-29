import "./RomanGame.css";
import { Duel, type DuelTheme } from "./Duel";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Badge = {
  id: string;
  name: string;
  latin: string;
  description: string;
  threshold: number;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:roman-badges:v1";

const BADGES: Badge[] = [
  { id: "spark", name: "First Spark", latin: "Prima Scintilla", description: "Answer 3 in a row correctly.", threshold: 3, mark: "III" },
  { id: "laurel", name: "Laurel Mind", latin: "Mens Laureata", description: "Answer 5 in a row correctly.", threshold: 5, mark: "V" },
  { id: "eagle", name: "Eagle Standard", latin: "Aquila", description: "Answer 10 in a row correctly.", threshold: 10, mark: "X" },
  { id: "caesar", name: "Caesar's Crown", latin: "Corona Caesaris", description: "Complete all 20 without a mistake.", threshold: 20, mark: "XX" },
];

const DUEL_THEME: DuelTheme = {
  className: "duel-roman",
  player: { h: "#b98a3a", c: "#b3261e", t: "#8d2a24", d: "#c9a227", l: "#e2b48a" },
  foe: { h: "#c4672a", c: "#c4672a", t: "#55703f", d: "#3a4f2c", l: "#6b5236" },
  win: "Victoria!",
  lose: "Vae victis!",
};

function RomanGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    timerEnabled, setTimerEnabled, timerMinutes, setTimerMinutes,
    timeLeft, round, score, streak, bestStreak, endReason,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "Correct — the laurel grows." : feedback === "wrong" ? `Not so — the answer is ${num1 * num2}.` : "";

  return (
    <main className="roman-app">
      <header className="roman-nav">
        <a className="roman-brand" href="/roman" aria-label="Numeralia home">
          <span className="brand-mark">N</span>
          <span><b>Numeralia</b><small>Mens • Virtus • Gloria</small></span>
        </a>
        <nav aria-label="Roman game navigation">
          <button className="nav-link" onClick={() => setScreen("setup")}>Atrium</button>
          <button className="nav-link badges-link" onClick={openBadges}>Insignia <span>{earnedIds.length}</span></button>
          <a className="nav-link" href="/">Classic</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="roman-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Exercitatio Mentis <span /></p>
            <h1>Train the mind.<br /><em>Earn the laurel.</em></h1>
            <p className="hero-subtitle">Enter the forum of numbers. Twenty trials stand between you and mathematical glory.</p>
            <form className="roman-setup-card" onSubmit={startGame}>
              <label>
                <span>Challenger name</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="e.g. Marcus" autoFocus />
              </label>
              <div className="form-row">
                <label>
                  <span>Highest factor</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Time limit</span>
                  <div className="timer-setting">
                    <button type="button" className={`toggle ${timerEnabled ? "on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled}><i /></button>
                    <input aria-label="Time limit in minutes" type="number" min="0.5" max="30" step="0.5" value={timerMinutes} onChange={(event) => setTimerMinutes(event.target.value)} disabled={!timerEnabled} />
                    <span>min</span>
                  </div>
                </label>
              </div>
              <button className="roman-primary" type="submit">Enter the arena <span>→</span></button>
              <p className="setup-note">XX problems · Streak badges · {timerEnabled ? `${timerMinutes || 0} minute limit` : "Untimed"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="game-stage">
          <div className="game-topline">
            <div><span>Challenger</span><strong>{playerName}</strong></div>
            <div className={`game-clock ${timerEnabled && timeLeft <= 20 ? "urgent" : ""}`}><span>{timerEnabled ? "Time remaining" : "Untimed trial"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>View insignia</button>
          </div>
          <div className="arena-card">
            <div className="progress-meta"><span>Trial {round} of {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}% complete</span></div>
            <div className="roman-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="inscription">Solve with swiftness and precision</p>
            <div className="roman-question"><span>{num1}</span><i>×</i><span>{num2}</span><i>=</i><b>?</b></div>
            <form className="roman-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Your answer" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Submit answer</button>
            </form>
            <div className={`roman-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Duel key={round} outcome={feedback === "correct" ? "win" : "lose"} theme={DUEL_THEME} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="streak-panel">
            <div className="streak-flame">♨</div>
            <div><span>Current streak</span><strong>{streak} correct</strong></div>
            <div className="streak-next">{nextBadge ? `Next insignia at ${nextBadge.threshold}` : "All insignia earned"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="result-screen">
          <p className="eyebrow"><span /> Acta Est Fabula <span /></p>
          <h1>{endReason === "time" ? "The hourglass is empty" : "The trial is complete"}</h1>
          <p>{playerName}, your performance has been entered into the annals.</p>
          <div className="result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Correct answers</span></div>
            <div><strong>{bestStreak}</strong><span>Best streak</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Insignia held</span></div>
          </div>
          {latestBadge && <div className="new-badge"><BadgeMedallion badge={latestBadge} earned /><div><span>New insignia earned</span><strong>{latestBadge.name}</strong><small>{latestBadge.latin}</small></div></div>}
          <div className="result-actions"><button className="roman-primary" onClick={() => setScreen("setup")}>Challenge again</button><button className="roman-secondary" onClick={openBadges}>View all insignia</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="badges-screen">
          <button className="back-button" onClick={closeBadges}>← Return</button>
          <p className="eyebrow"><span /> Hall of Honors <span /></p>
          <h1>Your insignia</h1>
          <p>Every streak is a campaign. Every badge, a victory remembered.</p>
          <div className="player-plaque"><span>Collection of</span><strong>{playerName.trim() || "Unnamed challenger"}</strong><small>{earnedIds.length} of {BADGES.length} earned</small></div>
          <div className="badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`badge-card ${earned ? "earned" : "locked"}`} key={badge.id}>
                <BadgeMedallion badge={badge} earned={earned} />
                <span className="badge-state">{earned ? "Earned" : "Locked"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.latin}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>SPQR · The Numeralia Academy · MMXXVI</footer>
    </main>
  );
}

function BadgeMedallion({ badge, earned }: { badge: Badge; earned: boolean }) {
  return <div className={`medallion ${earned ? "" : "dim"}`} aria-hidden="true"><span>✦</span><strong>{badge.mark}</strong><small>SPQR</small></div>;
}

export default RomanGame;
