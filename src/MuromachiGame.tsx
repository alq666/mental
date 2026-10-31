import "./MuromachiGame.css";
import { Duel, type DuelTheme } from "./Duel";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Badge = {
  id: string;
  name: string;
  title: string;
  description: string;
  threshold: number;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:muromachi-badges:v1";

// The ranks of a Muromachi-era student of the sword and the abacus alike:
// from a first sortie (初陣) to an exhibition before the Ashikaga shogun
// in his Kyoto palace (室町御所).
const BADGES: Badge[] = [
  { id: "uijin", name: "初陣", title: "算術の初伝", description: "三問、続けざまに正解する。", threshold: 3, mark: "三" },
  { id: "samurai", name: "侍", title: "武家の名乗り", description: "五問、続けざまに正解する。", threshold: 5, mark: "五" },
  { id: "heiho", name: "兵法者", title: "軍学の達人", description: "十問、続けざまに正解する。", threshold: 10, mark: "十" },
  { id: "tenka", name: "天下無双", title: "将軍の御前の演武", description: "二十問を一つも違わず正解する。", threshold: 20, mark: "廿" },
];

const KANJI_DIGITS = "〇一二三四五六七八九";

function toKanjiNumeral(value: number): string {
  if (value < 10) return KANJI_DIGITS[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${tens === 1 ? "" : KANJI_DIGITS[tens]}十${ones ? KANJI_DIGITS[ones] : ""}`;
}

// A samurai of the shogun's guard against a wandering ronin of the Kyoto outskirts.
const DUEL_THEME: DuelTheme = {
  className: "duel-muromachi",
  player: { h: "#23262e", c: "#b18a3c", t: "#233a5c", d: "#b18a3c", l: "#33363e" },
  foe: { h: "#33291f", c: "#77281f", t: "#493c31", d: "#33291f", l: "#40372d" },
  win: "勝",
  lose: "負",
};

function MuromachiGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    timerEnabled, setTimerEnabled, timerMinutes, setTimerMinutes,
    timeLeft, round, score, streak, bestStreak, endReason,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "見事！鮮やかな手並み。" : feedback === "wrong" ? `無念——積は ${num1 * num2}。` : "";

  return (
    <main className="muro-app" lang="ja">
      <header className="muro-nav">
        <a className="muro-brand" href="/muromachi" aria-label="室町算術道場の表">
          <span className="muro-brand-mark">算</span>
          <span><b>室町算術道場</b><small>足利幕府 · 京都</small></span>
        </a>
        <nav aria-label="道場の道案内">
          <button className="muro-nav-link" onClick={() => setScreen("setup")}>道場</button>
          <button className="muro-nav-link muro-badges-link" onClick={openBadges}>武功 <span>{earnedIds.length}</span></button>
          <a className="muro-nav-link" href="/">定番</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="muro-hero">
          <div className="muro-hero-copy">
            <p className="muro-eyebrow"><span />禅 · 兵法 · 算術<span /></p>
            <h1>算術を磨き、<br /><em>侍となれ。</em></h1>
            <p className="muro-hero-subtitle">室町の将軍の都、京都。禅寺の道場で二十問の試練に挑み、乱世を生きる知恵を磨こう。</p>
            <form className="muro-setup-card" onSubmit={startGame}>
              <label>
                <span>修行者の名</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="例：雪舟" autoFocus />
              </label>
              <div className="muro-form-row">
                <label>
                  <span>最大因数</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>制限時限</span>
                  <div className="muro-timer-setting">
                    <button type="button" className={`muro-toggle ${timerEnabled ? "muro-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="制限時限を設ける"><i /></button>
                    <input aria-label="制限時限（分）" type="number" min="0.5" max="30" step="0.5" value={timerMinutes} onChange={(event) => setTimerMinutes(event.target.value)} disabled={!timerEnabled} />
                    <span>分</span>
                  </div>
                </label>
              </div>
              <button className="muro-primary" type="submit">試練に挑む <span>→</span></button>
              <p className="muro-setup-note">二十問 · 連続正解で武功 · {timerEnabled ? `制限 ${timerMinutes || 0} 分` : "時限なし"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="muro-game-stage">
          <div className="muro-game-topline">
            <div><span>修行者</span><strong>{playerName}</strong></div>
            <div className={`muro-game-clock ${timerEnabled && timeLeft <= 20 ? "muro-urgent" : ""}`}><span>{timerEnabled ? "残刻" : "時限なし"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>武功帖を見る</button>
          </div>
          <div className="muro-exam-card">
            <div className="muro-progress-meta"><span>第 {round} 問 · 全 {TOTAL_ROUNDS} 問</span><span>修行 {Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}%</span></div>
            <div className="muro-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="muro-inscription">今、{toKanjiNumeral(num1)}に{toKanjiNumeral(num2)}を乗ず。積は幾らか。</p>
            <div className="muro-question"><span>{num1}</span><i>×</i><span>{num2}</span><i>=</i><b>?</b></div>
            <form className="muro-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="答え" aria-label="答え" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>答える</button>
            </form>
            <div className={`muro-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Duel key={round} outcome={feedback === "correct" ? "win" : "lose"} theme={DUEL_THEME} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="muro-streak-panel">
            <div className="muro-streak-mark">連</div>
            <div><span>今の連続</span><strong>{streak} 問</strong></div>
            <div className="muro-streak-next">{nextBadge ? `あと ${nextBadge.threshold - streak} 問、続けて次の武功` : "武功は全て手中"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="muro-result-screen">
          <p className="muro-eyebrow"><span />採点<span /></p>
          <h1>{endReason === "time" ? "時は満ちぬ" : "試練、了んぬ"}</h1>
          <p>{playerName}の修行の記録、ここに刻む。</p>
          <div className="muro-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>正解</span></div>
            <div><strong>{bestStreak}</strong><span>最長連続</span></div>
            <div><strong>{earnedBadges.length}</strong><span>手にした武功</span></div>
          </div>
          {latestBadge && <div className="muro-new-badge"><BadgeCoin badge={latestBadge} earned /><div><span>新たな武功</span><strong>{latestBadge.name}</strong><small>{latestBadge.title}</small></div></div>}
          <div className="muro-result-actions"><button className="muro-primary" onClick={() => setScreen("setup")}>再び修行する</button><button className="muro-secondary" onClick={openBadges}>武功帖を見る</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="muro-badges-screen">
          <button className="muro-back-button" onClick={closeBadges}>← 道場へ</button>
          <p className="muro-eyebrow"><span />武家の誉れ<span /></p>
          <h1>武功の記録</h1>
          <p>続けざまの正解は戦功。一つ一つの武功は武家の誉れ。</p>
          <div className="muro-player-plaque"><span>武功帖</span><strong>{playerName.trim() || "名乗りなし"}</strong><small>得たり {earnedIds.length} / {BADGES.length}</small></div>
          <div className="muro-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`muro-badge-card ${earned ? "muro-earned" : "muro-locked"}`} key={badge.id}>
                <BadgeCoin badge={badge} earned={earned} />
                <span className="muro-badge-state">{earned ? "入手" : "未到"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.title}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>室町時代 · 足利幕府 · 京都</footer>
    </main>
  );
}

// A round coin with a square hole, as the copper cash that filled Muromachi purses
// (the imported Eiraku tsūhō and the home-made bitasen alike).
function BadgeCoin({ badge, earned }: { badge: Badge; earned: boolean }) {
  return <div className={`muro-coin ${earned ? "" : "muro-dim"}`} aria-hidden="true"><strong>{badge.mark}</strong><i /><small>室</small></div>;
}

export default MuromachiGame;