import { useCallback, useEffect, useRef, useState } from "react";
import { SCENE_MS } from "./sceneTimeline";

export type Screen = "setup" | "game" | "result" | "badges";
type PlayerBadges = Record<string, string[]>;

export type StreakBadge = { id: string; threshold: number };

export const TOTAL_ROUNDS = 20;
export const MIN_NUMBER = 2;

// How the question is posed. The operands are always drawn from the same range; only
// which of the three numbers is hidden changes:
//   multiply — a × b = ?
//   missing  — a × ? = a·b   (solve for the factor)
//   divide   — a·b ÷ a = ?   (solve for the quotient)
export type Mode = "multiply" | "missing" | "divide";
export const MODE_ORDER: Mode[] = ["multiply", "missing", "divide"];

export type EquationToken = { kind: "operand" | "operator" | "unknown"; text: string };
export type Equation = {
  /** The five slots of the equation, in reading order. */
  tokens: EquationToken[];
  /** The number the player has to type. */
  expected: number;
  /** num1 × num2 — the full product, whether or not it is shown. */
  product: number;
};

export function buildEquation(mode: Mode, num1: number, num2: number): Equation {
  const product = num1 * num2;
  const unknown: EquationToken = { kind: "unknown", text: "?" };
  const equals: EquationToken = { kind: "operator", text: "=" };
  const times: EquationToken = { kind: "operator", text: "×" };
  const operand = (value: number): EquationToken => ({ kind: "operand", text: String(value) });

  if (mode === "missing") {
    return { tokens: [operand(num1), times, unknown, equals, operand(product)], expected: num2, product };
  }
  if (mode === "divide") {
    return { tokens: [operand(product), { kind: "operator", text: "÷" }, operand(num1), equals, unknown], expected: num2, product };
  }
  return { tokens: [operand(num1), times, operand(num2), equals, unknown], expected: product, product };
}

// The countdown each single guess runs on, in seconds.
export const DEFAULT_SECONDS_PER_GUESS = 5;

function loadBadges(storageKey: string): PlayerBadges {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return typeof parsed === "object" && parsed !== null ? parsed as PlayerBadges : {};
  } catch {
    return {};
  }
}

export function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Game loop shared by the themed variants (Roman, French, Tang, Soccer, Muromachi,
// Baghdad, Byzantine): 20 rounds, a configurable countdown on every guess, one of three
// ways of posing the question (see Mode), and streak badges stored per player in
// localStorage. A guess the clock runs out on counts as a miss — the answer is revealed
// and the next question comes around; only finishing all 20 ends the game.
export function useStreakGame<B extends StreakBadge>(badges: B[], storageKey: string) {
  const [screen, setScreen] = useState<Screen>("setup");
  const [mode, setMode] = useState<Mode>("multiply");
  const [returnScreen, setReturnScreen] = useState<Screen>("setup");
  const [playerName, setPlayerName] = useState("");
  const [maxMultiple, setMaxMultiple] = useState("12");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(String(DEFAULT_SECONDS_PER_GUESS));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SECONDS_PER_GUESS);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [num1, setNum1] = useState(2);
  const [num2, setNum2] = useState(2);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"" | "correct" | "wrong" | "timeout">("");
  const [badgesByPlayer, setBadgesByPlayer] = useState<PlayerBadges>(() => loadBadges(storageKey));
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const answerInput = useRef<HTMLInputElement>(null);
  // The live guess's budget, and whether that guess is already settled by an answer
  // or the clock — refs rather than state so the countdown's interval can never race
  // a last-instant answer into settling the same guess twice.
  const guessMs = useRef(DEFAULT_SECONDS_PER_GUESS * 1000);
  const guessSettled = useRef(false);

  const playerKey = playerName.trim().toLocaleLowerCase() || "anonymous";
  const earnedIds = badgesByPlayer[playerKey] || [];

  // The question as it is posed in the chosen mode; `equation.expected` is the number
  // the player types, `equation.tokens` the slots each variant renders.
  const equation = buildEquation(mode, num1, num2);

  const secondsPerGuess = Math.max(1, Math.round(Number(timerSeconds) || DEFAULT_SECONDS_PER_GUESS));

  const makeQuestion = useCallback(() => {
    const max = Math.max(MIN_NUMBER, Number(maxMultiple) || 12);
    setNum1(Math.floor(Math.random() * (max - MIN_NUMBER + 1)) + MIN_NUMBER);
    setNum2(Math.floor(Math.random() * (max - MIN_NUMBER + 1)) + MIN_NUMBER);
    setAnswer("");
    setFeedback("");
    guessSettled.current = false;
    guessMs.current = secondsPerGuess * 1000;
    setTimeLeft(secondsPerGuess);
    requestAnimationFrame(() => answerInput.current?.focus());
  }, [maxMultiple, secondsPerGuess]);

  const endGame = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setScreen("result");
  }, []);

  // A settled guess (answered or expired) shows its scene, then the next question
  // arrives — or the result screen, on the last round.
  const advanceAfterGuess = useCallback(() => {
    advanceTimer.current = window.setTimeout(() => {
      if (round >= TOTAL_ROUNDS) endGame();
      else {
        setRound((value) => value + 1);
        makeQuestion();
      }
    }, SCENE_MS + 300);
  }, [endGame, makeQuestion, round]);

  useEffect(() => {
    // The clock stops while the scene for the last answer plays; every new question
    // restarts it from the full per-guess budget.
    if (screen !== "game" || !timerEnabled || feedback) return;
    const startedAt = Date.now();
    const budget = guessMs.current;
    const tick = window.setInterval(() => {
      const left = budget - (Date.now() - startedAt);
      setTimeLeft(Math.max(0, Math.ceil(left / 1000)));
      if (left <= 0) {
        window.clearInterval(tick);
        if (!guessSettled.current) {
          guessSettled.current = true;
          setStreak(0);
          setFeedback("timeout");
          advanceAfterGuess();
        }
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [advanceAfterGuess, feedback, screen, timerEnabled]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const unlockForStreak = (nextStreak: number) => {
    const newlyEarned = badges.filter((badge) => badge.threshold <= nextStreak && !earnedIds.includes(badge.id));
    if (!newlyEarned.length) return;
    const ids = [...earnedIds, ...newlyEarned.map((badge) => badge.id)];
    const next = { ...badgesByPlayer, [playerKey]: ids };
    setBadgesByPlayer(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage may be full or blocked; badges still count for this visit.
    }
    setNewBadgeId(newlyEarned[newlyEarned.length - 1].id);
  };

  const startGame = (event: React.FormEvent) => {
    event.preventDefault();
    if (!playerName.trim() || Number(maxMultiple) < MIN_NUMBER || (timerEnabled && Number(timerSeconds) <= 0)) return;
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setNewBadgeId(null);
    makeQuestion();
    setScreen("game");
  };

  const submitAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!answer || feedback || guessSettled.current) return;
    guessSettled.current = true;
    const correct = Number(answer) === equation.expected;
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

    advanceAfterGuess();
  };

  const openBadges = () => {
    setReturnScreen(screen);
    setScreen("badges");
  };

  const closeBadges = () => setScreen(returnScreen === "badges" ? "setup" : returnScreen);

  return {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName,
    maxMultiple, setMaxMultiple,
    mode, setMode, equation,
    timerEnabled, setTimerEnabled,
    timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer,
    earnedIds,
    earnedBadges: badges.filter((badge) => earnedIds.includes(badge.id)),
    latestBadge: badges.find((badge) => badge.id === newBadgeId),
    nextBadge: badges.find((badge) => !earnedIds.includes(badge.id)),
  };
}
