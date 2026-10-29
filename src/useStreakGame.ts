import { useCallback, useEffect, useRef, useState } from "react";
import { DUEL_MS } from "./Duel";

export type Screen = "setup" | "game" | "result" | "badges";
export type EndReason = "completed" | "time";
type PlayerBadges = Record<string, string[]>;

export type StreakBadge = { id: string; threshold: number };

export const TOTAL_ROUNDS = 20;
export const MIN_NUMBER = 2;

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

// Game loop shared by the themed variants (Roman, French, Tang): 20 rounds,
// optional countdown, and streak badges stored per player in localStorage.
export function useStreakGame<B extends StreakBadge>(badges: B[], storageKey: string) {
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
  const [badgesByPlayer, setBadgesByPlayer] = useState<PlayerBadges>(() => loadBadges(storageKey));
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
    // The clock stops while the duel for the last answer plays.
    if (screen !== "game" || !timerEnabled || feedback) return;
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
  }, [endGame, feedback, screen, timerEnabled]);

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
    }, DUEL_MS + 300);
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
    timerEnabled, setTimerEnabled,
    timerMinutes, setTimerMinutes,
    timeLeft, round, score, streak, bestStreak, endReason,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer,
    earnedIds,
    earnedBadges: badges.filter((badge) => earnedIds.includes(badge.id)),
    latestBadge: badges.find((badge) => badge.id === newBadgeId),
    nextBadge: badges.find((badge) => !earnedIds.includes(badge.id)),
  };
}
