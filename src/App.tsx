import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const TOTAL_ROUNDS = 20;
  const MIN_NUMBER = 2;
  const MAX_NUMBER = 20;

  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Generate new random numbers
  const generateNewQuestion = () => {
    const newNum1 = Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER;
    const newNum2 = Math.floor(Math.random() * MAX_NUMBER) + MIN_NUMBER;
    setNum1(newNum1);
    setNum2(newNum2);
    setUserAnswer("");
    setFeedback("");
    setShowAnswer(false);
  };

  // Initialize first question
  useEffect(() => {
    generateNewQuestion();
  }, []);

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
    generateNewQuestion();
  };

  if (gameOver) {
    const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
    return (
      <div className="game-container">
        <div className="game-over">
          <h1>Game Over! 🎉</h1>
          <div className="final-score">
            <p className="score-large">
              {score} / {TOTAL_ROUNDS}
            </p>
            <p className="percentage">{percentage}% Correct</p>
          </div>
          <button onClick={restartGame} className="restart-button">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Mental Math Challenge</h1>
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
