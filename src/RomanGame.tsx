import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./RomanGame.css";

type Screen = "setup" | "game" | "result" | "badges";
type EndReason = "completed" | "time";
type PlayerBadges = Record<string, string[]>;

type Badge = {
  id: string;
  name: string;
  latin: string;
  description: string;
  threshold: number;
  mark: string;
};

const TOTAL_ROUNDS = 20;
const MIN_NUMBER = 2;
const BADGE_STORAGE_KEY = "mental-math-challenge:roman-badges:v1";

const BADGES: Badge[] = [
  { id: "spark", name: "First Spark", latin: "Prima Scintilla", description: "Answer 3 in a row correctly.", threshold: 3, mark: "III" },
  { id: "laurel", name: "Laurel Mind", latin: "Mens Laureata", description: "Answer 5 in a row correctly.", threshold: 5, mark: "V" },
  { id: "eagle", name: "Eagle Standard", latin: "Aquila", description: "Answer 10 in a row correctly.", threshold: 10, mark: "X" },
  { id: "caesar", name: "Caesar's Crown", latin: "Corona Caesaris", description: "Complete all 20 without a mistake.", threshold: 20, mark: "XX" },
];

function loadBadges(): PlayerBadges {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(BADGE_STORAGE_KEY) || "{}");
    return typeof parsed === "object" && parsed !== null ? parsed as PlayerBadges : {};
  } catch {
    return {};
  }
}

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function RomanGame() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [returnScreen, setReturnScreen] = useState<Screen>("setup");
  const [playerName, setPlayerName] = useState("");
  const [maxMultiple, setMaxMultiple] = useState("12");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState("2");
  const [timeLeft, setTimeLeft] = useState(120);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [num1, setNum1] = useState(2);
  const [num2, setNum2] = useState(2);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "">("");
  const [badgesByPlayer, setBadgesByPlayer] = useState<PlayerBadges>(loadBadges);
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<EndReason>("completed");
  const advanceTimer = useRef<number | null>(null);
  const answerInput = useRef<HTMLInputElement>(null);

  const playerKey = playerName.trim().toLocaleLowerCase() || "anonymous";
  const earnedIds = badgesByPlayer[playerKey] || [];

  const makeQuestion = useCallback(() => {
    const max = Math.max(MIN_NUMBER, Number(maxMultiple) || 12);
    setNum1(Math.floor(Math.random() * (max - MIN_NUMBER + 1)) + MIN_NUMBER);
    setNum2(Math.floor(Math.random() * (max - MIN_NUMBER + 1)) + MIN_NUMBER);
    setAnswer("");
    setFeedback("");
    requestAnimationFrame(() => answerInput.current?.focus());
  }, [maxMultiple]);

  const endGame = useCallback((reason: EndReason) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setEndReason(reason);
    setScreen("result");
  }, []);

  useEffect(() => {
    if (screen !== "game" || !timerEnabled) return;
    const tick = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(tick);
          endGame("time");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [endGame, screen, timerEnabled]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const unlockForStreak = (nextStreak: number) => {
    const newlyEarned = BADGES.filter((badge) => badge.threshold <= nextStreak && !earnedIds.includes(badge.id));
    if (!newlyEarned.length) return;
    const ids = [...earnedIds, ...newlyEarned.map((badge) => badge.id)];
    const next = { ...badgesByPlayer, [playerKey]: ids };
    setBadgesByPlayer(next);
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(next));
    setNewBadgeId(newlyEarned[newlyEarned.length - 1].id);
  };

  const startGame = (event: React.FormEvent) => {
    event.preventDefault();
    if (!playerName.trim() || Number(maxMultiple) < MIN_NUMBER || (timerEnabled && Number(timerMinutes) <= 0)) return;
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(Math.round(Number(timerMinutes) * 60));
    setNewBadgeId(null);
    setEndReason("completed");
    makeQuestion();
    setScreen("game");
  };

  const submitAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!answer || feedback) return;
    const correct = Number(answer) === num1 * num2;
    const nextStreak = correct ? streak + 1 : 0;
    if (correct) {
      setScore((value) => value + 1);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      unlockForStreak(nextStreak);
      setFeedback("correct");
    } else {
      setStreak(0);
      setFeedback("wrong");
    }

    advanceTimer.current = window.setTimeout(() => {
      if (round >= TOTAL_ROUNDS) endGame("completed");
      else {
        setRound((value) => value + 1);
        makeQuestion();
      }
    }, 850);
  };

  const openBadges = () => {
    setReturnScreen(screen);
    setScreen("badges");
  };

  const earnedBadges = useMemo(() => BADGES.filter((badge) => earnedIds.includes(badge.id)), [earnedIds]);
  const latestBadge = BADGES.find((badge) => badge.id === newBadgeId);

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
            <div className={`roman-feedback ${feedback}`} aria-live="polite">
              {feedback === "correct" && "Correct — the laurel grows."}
              {feedback === "wrong" && `Not so — the answer is ${num1 * num2}.`}
            </div>
          </div>
          <div className="streak-panel">
            <div className="streak-flame">♨</div>
            <div><span>Current streak</span><strong>{streak} correct</strong></div>
            <div className="streak-next">{BADGES.find((badge) => !earnedIds.includes(badge.id)) ? `Next insignia at ${BADGES.find((badge) => !earnedIds.includes(badge.id))?.threshold}` : "All insignia earned"}</div>
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
          <button className="back-button" onClick={() => setScreen(returnScreen === "badges" ? "setup" : returnScreen)}>← Return</button>
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
