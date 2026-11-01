import "./SoccerGame.css";
import { Penalty } from "./Penalty";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Badge = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  threshold: number;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:soccer-badges:v1";

const BADGES: Badge[] = [
  { id: "hattrick", name: "Hat-trick", tagline: "Three in the net", description: "Score 3 penalties in a row.", threshold: 3 },
  { id: "motm", name: "Player of the Match", tagline: "The crowd knows your name", description: "Score 5 penalties in a row.", threshold: 5 },
  { id: "boot", name: "Golden Boot", tagline: "Top scorer of the tournament", description: "Score 10 penalties in a row.", threshold: 10 },
  { id: "cup", name: "World Cup", tagline: "Lift the trophy", description: "Score all 20 penalties.", threshold: 20 },
];

function SoccerGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    timerEnabled, setTimerEnabled, timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "Right in the corner!" : feedback === "wrong" ? `The keeper read it — the answer is ${num1 * num2}.` : feedback === "timeout" ? `Time's up — the answer is ${num1 * num2}.` : "";
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
            <div className="soccer-question"><span>{num1}</span><i>×</i><span>{num2}</span><i>=</i><b>?</b></div>
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
          {latestBadge && <div className="sc-new-badge"><BadgeShirt badge={latestBadge} earned /><div><span>New trophy</span><strong>{latestBadge.name}</strong><small>{latestBadge.tagline}</small></div></div>}
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
                <BadgeShirt badge={badge} earned={earned} />
                <span className="sc-badge-state">{earned ? "Won" : "Locked"}</span>
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

// Each trophy is a shirt printed with the length of the scoring run.
function BadgeShirt({ badge, earned }: { badge: Badge; earned: boolean }) {
  return <div className={`sc-shirt ${earned ? "" : "sc-dim"}`} aria-hidden="true"><strong>{badge.threshold}</strong></div>;
}

export default SoccerGame;
