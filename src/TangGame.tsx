import "./TangGame.css";
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

const BADGE_STORAGE_KEY = "mental-math-challenge:tang-badges:v1";

// The Tang School of Mathematics (算學) sat within the Imperial Academy (國子監),
// and the civil examinations had a mathematics track (明算科).
const BADGES: Badge[] = [
  { id: "rods", name: "初執算籌", title: "《孫子算經》入門", description: "連續答對三題。", threshold: 3, mark: "三" },
  { id: "mingsuan", name: "明算及第", title: "登明算科", description: "連續答對五題。", threshold: 5, mark: "五" },
  { id: "boshi", name: "算學博士", title: "國子監 · 從九品下", description: "連續答對十題。", threshold: 10, mark: "十" },
  { id: "zhuangyuan", name: "金榜題名", title: "雁塔題名，榜上第一", description: "二十題全對，無一差錯。", threshold: 20, mark: "廿" },
];

const DIGITS = "〇一二三四五六七八九";

function toChineseNumeral(value: number): string {
  if (value < 10) return DIGITS[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${tens === 1 ? "" : DIGITS[tens]}十${ones ? DIGITS[ones] : ""}`;
}

const DUEL_THEME: DuelTheme = {
  className: "duel-tang",
  player: { h: "#241c18", c: "#241c18", t: "#b0362a", d: "#c08f2e", l: "#3b2a1c" },
  foe: { h: "#4a4a4a", c: "#7a2a2a", t: "#2f4c6b", d: "#1e3247", l: "#2a2a2a" },
  win: "勝",
  lose: "敗",
};

function TangGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    timerEnabled, setTimerEnabled, timerMinutes, setTimerMinutes,
    timeLeft, round, score, streak, bestStreak, endReason,
    num1, num2, answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "答對了！功名可期。" : feedback === "wrong" ? `非也——答案是 ${num1 * num2}。` : "";

  return (
    <main className="tang-app" lang="zh-Hant">
      <header className="tang-nav">
        <a className="tang-brand" href="/tang" aria-label="算學館首頁">
          <span className="tang-brand-mark">算</span>
          <span><b>大唐算學館</b><small>國子監 · 明算科</small></span>
        </a>
        <nav aria-label="遊戲導覽">
          <button className="tang-nav-link" onClick={() => setScreen("setup")}>前堂</button>
          <button className="tang-nav-link tang-badges-link" onClick={openBadges}>功名 <span>{earnedIds.length}</span></button>
          <a className="tang-nav-link" href="/">經典版</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="tang-hero">
          <div className="tang-hero-copy">
            <p className="tang-eyebrow"><span />明算之道<span /></p>
            <h1>磨礪心算，<br /><em>金榜題名。</em></h1>
            <p className="tang-hero-subtitle">步入長安國子監算學館。二十道考題，助你明算及第、雁塔題名。</p>
            <form className="tang-setup-card" onSubmit={startGame}>
              <label>
                <span>考生姓名</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="例：李白" autoFocus />
              </label>
              <div className="tang-form-row">
                <label>
                  <span>最大因數</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>限時</span>
                  <div className="tang-timer-setting">
                    <button type="button" className={`tang-toggle ${timerEnabled ? "tang-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="開啟計時"><i /></button>
                    <input aria-label="限時（分鐘）" type="number" min="0.5" max="30" step="0.5" value={timerMinutes} onChange={(event) => setTimerMinutes(event.target.value)} disabled={!timerEnabled} />
                    <span>分鐘</span>
                  </div>
                </label>
              </div>
              <button className="tang-primary" type="submit">入場應試 <span>→</span></button>
              <p className="tang-setup-note">廿題 · 連對可得功名 · {timerEnabled ? `限時 ${timerMinutes || 0} 分鐘` : "不限時"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="tang-game-stage">
          <div className="tang-game-topline">
            <div><span>考生</span><strong>{playerName}</strong></div>
            <div className={`tang-game-clock ${timerEnabled && timeLeft <= 20 ? "tang-urgent" : ""}`}><span>{timerEnabled ? "剩餘時間" : "不限時"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>查看功名</button>
          </div>
          <div className="tang-exam-card">
            <div className="tang-progress-meta"><span>第 {round} 題 · 共 {TOTAL_ROUNDS} 題</span><span>已完成 {Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}%</span></div>
            <div className="tang-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="tang-inscription">今有{toChineseNumeral(num1)}乘{toChineseNumeral(num2)}，問得幾何？</p>
            <div className="tang-question"><span>{num1}</span><i>×</i><span>{num2}</span><i>=</i><b>?</b></div>
            <form className="tang-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="你的答案" aria-label="你的答案" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>作答</button>
            </form>
            <div className={`tang-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Duel key={round} outcome={feedback === "correct" ? "win" : "lose"} theme={DUEL_THEME} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="tang-streak-panel">
            <div className="tang-streak-mark">籌</div>
            <div><span>目前連對</span><strong>{streak} 題</strong></div>
            <div className="tang-streak-next">{nextBadge ? `連對 ${nextBadge.threshold} 題可得下一功名` : "功名已盡得"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="tang-result-screen">
          <p className="tang-eyebrow"><span />放榜<span /></p>
          <h1>{endReason === "time" ? "時辰已到" : "考試完畢"}</h1>
          <p>{playerName}，你的成績已載入史冊。</p>
          <div className="tang-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>答對題數</span></div>
            <div><strong>{bestStreak}</strong><span>最佳連對</span></div>
            <div><strong>{earnedBadges.length}</strong><span>所得功名</span></div>
          </div>
          {latestBadge && <div className="tang-new-badge"><BadgeCoin badge={latestBadge} earned /><div><span>新得功名</span><strong>{latestBadge.name}</strong><small>{latestBadge.title}</small></div></div>}
          <div className="tang-result-actions"><button className="tang-primary" onClick={() => setScreen("setup")}>再考一場</button><button className="tang-secondary" onClick={openBadges}>查看全部功名</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="tang-badges-screen">
          <button className="tang-back-button" onClick={closeBadges}>← 返回</button>
          <p className="tang-eyebrow"><span />凌煙閣<span /></p>
          <h1>你的功名</h1>
          <p>每一回連對都是一場征程，每一枚功名都是一段傳奇。</p>
          <div className="tang-player-plaque"><span>功名簿</span><strong>{playerName.trim() || "無名考生"}</strong><small>已得 {earnedIds.length} / {BADGES.length}</small></div>
          <div className="tang-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`tang-badge-card ${earned ? "tang-earned" : "tang-locked"}`} key={badge.id}>
                <BadgeCoin badge={badge} earned={earned} />
                <span className="tang-badge-state">{earned ? "已得" : "未得"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.title}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>大唐 · 國子監算學館 · 開元盛世</footer>
    </main>
  );
}

// A bronze cash coin in the style of the Kaiyuan Tongbao (開元通寶), with its square hole.
function BadgeCoin({ badge, earned }: { badge: Badge; earned: boolean }) {
  return <div className={`tang-coin ${earned ? "" : "tang-dim"}`} aria-hidden="true"><strong>{badge.mark}</strong><i /><small>唐</small></div>;
}

export default TangGame;
