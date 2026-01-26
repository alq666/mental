import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

type BestSession = {
  name: string;
  score: number;
  durationMs: number;
  completedAt: number;
};

const BEST_SESSIONS_STORAGE_KEY = "mental-math-challenge:best-sessions:v1";
const BEST_SESSIONS_LIMIT = 10;

function loadBestSessions(): BestSession[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(BEST_SESSIONS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const normalized = parsed
      .map((item): BestSession | null => {
        if (typeof item !== "object" || item === null) return null;

        const record = item as Record<string, unknown>;
        const name = typeof record.name === "string" ? record.name : null;
        const score = typeof record.score === "number" ? record.score : null;
        const durationMs =
          typeof record.durationMs === "number" ? record.durationMs : null;
        const completedAt =
          typeof record.completedAt === "number" ? record.completedAt : null;

        if (name === null || score === null || durationMs === null || completedAt === null) {
          return null;
        }

        return { name, score, durationMs, completedAt };
      })
      .filter((item): item is BestSession => item !== null);

    return rankBestSessions(normalized);
  } catch {
    return [];
  }
}

function saveBestSessions(sessions: BestSession[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      BEST_SESSIONS_STORAGE_KEY,
      JSON.stringify(sessions),
    );
  } catch {
    // localStorage might be full or unavailable; ignore and keep the game playable.
  }
}

function rankBestSessions(sessions: BestSession[]): BestSession[] {
  return [...sessions]
    .sort((a, b) => {
      // Higher score is better; for ties, faster time is better.
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;

      const durationDiff = a.durationMs - b.durationMs;
      if (durationDiff !== 0) return durationDiff;

      // For stable ordering, newest first.
      return b.completedAt - a.completedAt;
    })
    .slice(0, BEST_SESSIONS_LIMIT);
}

function formatDurationSeconds(durationMs: number): string {
  return (durationMs / 1000).toFixed(2);
}

function App() {
  const TOTAL_ROUNDS = 20;
  const MIN_NUMBER = 2;

  // Setup state
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [maxMultiple, setMaxMultiple] = useState("");

  // Game state
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Timer state
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  // Best sessions (persisted)
  const [bestSessions, setBestSessions] = useState<BestSession[]>([]);
  const lastSavedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    setBestSessions(loadBestSessions());
  }, []);

  useEffect(() => {
    if (!gameOver) return;
    if (startTime === null || endTime === null) return;

    const durationMs = endTime - startTime;
    const newSession: BestSession = {
      name: playerName.trim() || "Anonymous",
      score,
      durationMs,
      completedAt: endTime,
    };

    const sessionKey = `${newSession.completedAt}:${newSession.name}:${newSession.score}:${newSession.durationMs}`;
    if (lastSavedSessionRef.current === sessionKey) return;
    lastSavedSessionRef.current = sessionKey;

    setBestSessions((prev) => {
      const ranked = rankBestSessions([...prev, newSession]);
      saveBestSessions(ranked);
      return ranked;
    });
  }, [endTime, gameOver, playerName, score, startTime]);

  const clearBestSessions = () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(BEST_SESSIONS_STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    setBestSessions([]);
  };

  const BestSessionsPanel = () => {
    if (bestSessions.length === 0) return null;

    return (
      <div className="best-sessions">
        <div className="best-sessions-header">
          <h2>Best sessions</h2>
          <button
            type="button"
            className="clear-sessions-button"
            onClick={clearBestSessions}
          >
            Clear
          </button>
        </div>
        <ol className="best-sessions-list">
          {bestSessions.map((session, index) => (
            <li
              key={`${session.completedAt}-${index}`}
              className="best-session-row"
            >
              <span className="best-session-rank">{index + 1}.</span>
              <span className="best-session-name">{session.name}</span>
              <span className="best-session-score">
                {session.score} / {TOTAL_ROUNDS}
              </span>
              <span className="best-session-duration">
                {formatDurationSeconds(session.durationMs)}s
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  // Generate new random numbers
  const generateNewQuestion = useCallback(() => {
    const maxNum = parseInt(maxMultiple) || 20;
    const newNum1 =
      Math.floor(Math.random() * (maxNum - MIN_NUMBER + 1)) + MIN_NUMBER;
    const newNum2 =
      Math.floor(Math.random() * (maxNum - MIN_NUMBER + 1)) + MIN_NUMBER;
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer("");
    setFeedback("");
    setShowAnswer(false);
  }, [maxMultiple, MIN_NUMBER]);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      playerName.trim() === "" ||
      maxMultiple === "" ||
      parseInt(maxMultiple) < MIN_NUMBER
    ) {
      return;
    }

    setGameStarted(true);
    setStartTime(Date.now());
  };

  // Initialize first question when game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      generateNewQuestion();
    }
  }, [gameStarted, gameOver, generateNewQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userAnswer === "") return;

    const correctAnswer = num1 * num2;
    const isCorrect = parseInt(userAnswer) === correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("✓ Correct!");
    } else {
      setFeedback(`✗ Wrong! The answer was ${correctAnswer}`);
    }

    setShowAnswer(true);

    // Move to next round or end game
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setEndTime(Date.now());
        setGameOver(true);
      } else {
        setRound(round + 1);
        generateNewQuestion();
      }
    }, 1500);
  };

  const restartGame = () => {
    setScore(0);
    setRound(1);
    setGameOver(false);
    setGameStarted(false);
    setPlayerName("");
    setMaxMultiple("");
    setStartTime(null);
    setEndTime(null);
  };

  // Setup screen
  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="setup-container">
          <h1>Mental Math Challenge</h1>
          <form onSubmit={handleStartGame} className="setup-form">
            <div className="form-group">
              <label htmlFor="playerName">What's your name?</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="setup-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxMultiple">
                What is the highest multiplicand?
              </label>
              <input
                id="maxMultiple"
                type="number"
                value={maxMultiple}
                onChange={(e) => setMaxMultiple(e.target.value)}
                placeholder={`Minimum ${MIN_NUMBER}`}
                min={MIN_NUMBER}
                className="setup-input"
              />
              <small className="form-hint">
                Numbers to be multiplied, will range from {MIN_NUMBER} to your
                chosen maximum
              </small>
            </div>

            <button
              type="submit"
              className="start-button"
              disabled={
                playerName.trim() === "" ||
                maxMultiple === "" ||
                parseInt(maxMultiple) < MIN_NUMBER
              }
            >
              Start Game
            </button>
          </form>
          <BestSessionsPanel />
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
    const durationMs =
      startTime !== null && endTime !== null ? endTime - startTime : 0;
    const timeTaken = formatDurationSeconds(durationMs);

    return (
      <div className="game-container">
        <div className="game-over">
          <h1>Game Over, {playerName}! 🎉</h1>
          <div className="final-score">
            <p className="score-large">
              {score} / {TOTAL_ROUNDS}
            </p>
            <p className="percentage">{percentage}% Correct</p>
            <p className="time-taken">
              ⏱️ Time: <strong>{timeTaken}</strong> seconds
            </p>
          </div>
          <BestSessionsPanel />
          <button onClick={restartGame} className="restart-button">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Mental Math Challenge</h1>
        <p className="player-name">Player: {playerName}</p>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Round</span>
            <span className="stat-value">
              {round} / {TOTAL_ROUNDS}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>
      </div>

      <div className="question-container">
        <div className="question">
          <span className="number">{num1}</span>
          <span className="operator">×</span>
          <span className="number">{num2}</span>
          <span className="equals">=</span>
          <span className="question-mark">?</span>
        </div>

        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer"
            className="answer-input"
            autoFocus
            disabled={showAnswer}
          />
          <button
            type="submit"
            className="submit-button"
            disabled={showAnswer || userAnswer === ""}
          >
            Submit
          </button>
        </form>

        {feedback && (
          <div
            className={`feedback ${feedback.includes("Correct") ? "correct" : "incorrect"}`}
          >
            {feedback}
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default App;
