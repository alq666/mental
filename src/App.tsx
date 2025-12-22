import { useState, useEffect } from "react";
import "./App.css";
import { getUserSessions, saveUserSession, GameSession } from "./utils/edgeConfig";

function App() {
  const TOTAL_ROUNDS = 20;
  const MIN_NUMBER = 2;

  // Setup state
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [maxMultiple, setMaxMultiple] = useState("");
  const [previousSessions, setPreviousSessions] = useState<GameSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

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

  // Generate new random numbers
  const generateNewQuestion = () => {
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
  };

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      playerName.trim() === "" ||
      maxMultiple === "" ||
      parseInt(maxMultiple) < MIN_NUMBER
    ) {
      return;
    }
    
    // Load previous sessions for this user
    setLoadingSessions(true);
    try {
      const sessions = await getUserSessions(playerName.trim());
      setPreviousSessions(sessions);
    } catch (error) {
      console.error('Error loading previous sessions:', error);
      setPreviousSessions([]);
    }
    setLoadingSessions(false);
    
    setGameStarted(true);
    setStartTime(Date.now());
  };

  // Initialize first question when game starts
  useEffect(() => {
    if (gameStarted && !gameOver) {
      generateNewQuestion();
    }
  }, [gameStarted]);

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
                parseInt(maxMultiple) < MIN_NUMBER ||
                loadingSessions
              }
            >
              {loadingSessions ? "Loading..." : "Start Game"}
            </button>
          </form>

          {previousSessions.length > 0 && (
            <div className="previous-sessions">
              <h3>Your Previous Sessions</h3>
              <div className="sessions-list">
                {previousSessions.map((session, index) => (
                  <div key={index} className="session-item">
                    <div className="session-score">
                      {session.score}/{session.totalRounds} ({Math.round((session.score / session.totalRounds) * 100)}%)
                    </div>
                    <div className="session-details">
                      <span className="session-time">⏱️ {session.timeTaken}s</span>
                      <span className="session-date">
                        {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
    const timeTaken =
      startTime && endTime ? ((endTime - startTime) / 1000).toFixed(2) : "0";

    // Save session when game ends (only once)
    useEffect(() => {
      if (gameOver && startTime && endTime) {
        const session: GameSession = {
          score,
          totalRounds: TOTAL_ROUNDS,
          timestamp: endTime,
          timeTaken: parseFloat(timeTaken)
        };
        saveUserSession(playerName.trim(), session);
      }
    }, [gameOver, startTime, endTime, score, playerName, timeTaken]);

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
