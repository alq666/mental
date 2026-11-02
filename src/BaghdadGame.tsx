import "./BaghdadGame.css";
import { useId } from "react";
import { Duel, type DuelTheme } from "./Duel";
import { EquationSlots } from "./Equation";
import { ModePicker, type ModeLabels } from "./ModePicker";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Metal = "bronze" | "silver" | "gold" | "glow";

type Badge = {
  id: string;
  name: string;
  motto: string;
  description: string;
  threshold: number;
  /** Detail level of the astrolabe: 0 ring, 1 rete, 2 star pointers, 3 the full instrument. */
  rank: number;
  metal: Metal;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:baghdad-badges:v1";

// The House of Wisdom under al-Ma'mun: scribes, geometers, and the astronomers of the
// observatory. The ladder ends in the assembly of scholars itself.
const BADGES: Badge[] = [
  { id: "katib", name: "الكاتب", motto: "أوّل ما خلق الله القلم", description: "ثلاث إجابات صحيحة متتابعة.", threshold: 3, rank: 0, metal: "bronze", mark: "٣" },
  { id: "muhandis", name: "المهندس", motto: "في الأعداد صناعة", description: "خمس إجابات صحيحة متتابعة.", threshold: 5, rank: 1, metal: "silver", mark: "٥" },
  { id: "rasid", name: "الراصد", motto: "حركة الأفلاك", description: "عشر إجابات صحيحة متتابعة.", threshold: 10, rank: 2, metal: "gold", mark: "١٠" },
  { id: "hakim", name: "حكيم بيت الحكمة", motto: "مجلس العلماء", description: "عشرون مسألة بلا خطأ.", threshold: 20, rank: 3, metal: "glow", mark: "٢٠" },
];

const MODE_LABELS: ModeLabels = {
  multiply: "ضرب",
  missing: "العامل المجهول",
  divide: "قسمة",
};

const METALS: Record<Metal, { face: [string, string]; ring: string; detail: string; glow: boolean }> = {
  bronze: { face: ["#a8763f", "#6d4522"], ring: "#c99a5c", detail: "#f1dbb4", glow: false },
  silver: { face: ["#aeb7c0", "#6c7681"], ring: "#e0e6ec", detail: "#f7fafc", glow: false },
  gold: { face: ["#d8b43c", "#8a6a12"], ring: "#f3df95", detail: "#fff6cf", glow: false },
  glow: { face: ["#e8c94a", "#8f6d10"], ring: "#ffe9a3", detail: "#fffbe6", glow: true },
};

// A scholar against a court astronomer, as at a disputation in the House of Wisdom.
const DUEL_THEME: DuelTheme = {
  className: "duel-baghdad",
  player: { h: "#ece5d3", c: "#c9a227", t: "#1a4f7a", d: "#c9a227", l: "#3a3226" },
  foe: { h: "#3f382f", c: "#a8452c", t: "#7c6a4a", d: "#5e4f36", l: "#2c2620" },
  win: "أصبت!",
  lose: "لم تُصب",
};

function BaghdadGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    mode, setMode, equation,
    timerEnabled, setTimerEnabled, timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct"
    ? "أصبت! زاد فضلك في المجلس."
    : feedback === "wrong"
      ? `لم تُصب — الجواب ${equation.expected}.`
      : feedback === "timeout"
        ? `انقضى الوقت — الجواب ${equation.expected}.`
        : "";

  return (
    <main className="baghdad-app" lang="ar" dir="rtl">
      <header className="baghdad-nav">
        <a className="baghdad-brand" href="/baghdad" aria-label="بيت الحكمة">
          <span className="bg-brand-mark">ح</span>
          <span><b>بيت الحكمة</b><small>بغداد · دار الحكمة · الحساب</small></span>
        </a>
        <nav aria-label="تنقّل اللعبة">
          <button className="bg-nav-link" onClick={() => setScreen("setup")}>المجلس</button>
          <button className="bg-nav-link bg-badges-link" onClick={openBadges}>الأوسمة <span>{earnedIds.length}</span></button>
          <a className="bg-nav-link" href="/">الكلاسيكية</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="baghdad-hero">
          <div className="bg-hero-copy">
            <p className="bg-rubric">✧ مجلس الحساب ✧</p>
            <h1>أحكِم الحساب،<br /><em>وارتقِ في مجلس الحكماء.</em></h1>
            <p className="bg-hero-subtitle">عشرون مسألة تفصلك عن مجلس العلماء في بيت الحكمة ببغداد.</p>
            <form className="baghdad-setup-card" onSubmit={startGame}>
              <label>
                <span>اسم الحاسب</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="مثال: موسى" autoFocus />
              </label>
              <div className="bg-form-row">
                <label>
                  <span>أكبر عامل</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>وقت كل مسألة</span>
                  <div className="bg-timer-setting">
                    <button type="button" className={`bg-toggle ${timerEnabled ? "bg-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="تشغيل الساعة"><i /></button>
                    <input aria-label="وقت كل مسألة بالثواني" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>ث</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="نوع الحساب" labels={MODE_LABELS} />
              <button className="baghdad-primary" type="submit">ادخل المجلس <span>←</span></button>
              <p className="bg-setup-note">{TOTAL_ROUNDS} مسألة · أوسمة السلسلة · {timerEnabled ? `${timerSeconds || 0} ثانية لكل مسألة` : "بلا حدّ زمني"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="bg-game-stage">
          <div className="bg-game-topline">
            <div><span>الحاسب</span><strong>{playerName}</strong></div>
            <div className={`bg-game-clock ${timerEnabled && timeLeft <= 3 ? "bg-urgent" : ""}`}><span>{timerEnabled ? "الساعة" : "بلا حدّ"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>الأوسمة</button>
          </div>
          <div className="bg-card">
            <div className="bg-progress-meta"><span>المسألة {round} من {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}% تمّ</span></div>
            <div className="baghdad-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="bg-inscription">احسب بسرعةٍ وإتقان</p>
            <div className="baghdad-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="baghdad-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="جوابك" aria-label="جوابك" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>تحقّق</button>
            </form>
            <div className={`bg-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Duel key={round} outcome={feedback === "correct" ? "win" : "lose"} theme={DUEL_THEME} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="bg-streak-panel">
            <div className="bg-streak-mark">✧</div>
            <div><span>السلسلة الحالية</span><strong>{streak} صحيحة</strong></div>
            <div className="bg-streak-next">{nextBadge ? `الوسام التالي عند ${nextBadge.threshold}` : "نلت كل الأوسمة"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="bg-result-screen">
          <p className="bg-rubric">✧ ختام المجلس ✧</p>
          <h1>تمّت المسألة</h1>
          <p>{playerName}، سُجّلت أعمالك في سجلّ بيت الحكمة.</p>
          <div className="bg-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>أجوبة صحيحة</span></div>
            <div><strong>{bestStreak}</strong><span>أطول سلسلة</span></div>
            <div><strong>{earnedBadges.length}</strong><span>أوسمة</span></div>
          </div>
          {latestBadge && <div className="bg-new-badge"><BadgeAstrolabe badge={latestBadge} earned /><div><span>وسام جديد</span><strong>{latestBadge.name}</strong><small>{latestBadge.motto}</small></div></div>}
          <div className="bg-result-actions"><button className="baghdad-primary" onClick={() => setScreen("setup")}>أعد التجربة</button><button className="baghdad-secondary" onClick={openBadges}>كل الأوسمة</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="bg-badges-screen">
          <button className="bg-back-button" onClick={closeBadges}>→ رجوع</button>
          <p className="bg-rubric">✧ سجلّ الأوسمة ✧</p>
          <h1>أوسمتك</h1>
          <p>كل سلسلة درجة، وكل وسام منزلة في مجلس الحكمة.</p>
          <div className="bg-player-plaque"><span>سجلّ</span><strong>{playerName.trim() || "حاسب بلا اسم"}</strong><small>{earnedIds.length} من {BADGES.length}</small></div>
          <div className="bg-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`bg-badge-card ${earned ? "bg-earned" : "bg-locked"}`} key={badge.id}>
                <BadgeAstrolabe badge={badge} earned={earned} />
                <span className="bg-badge-state">{earned ? "نالها" : "لم تُنل بعد"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.motto}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>بيت الحكمة · بغداد · زمن المأمون</footer>
    </main>
  );
}

/**
 * An astrolabe plate that gains its parts as the rank climbs: bare graduated ring,
 * then the rete, then the star pointers, then the whole gilded instrument with its
 * suspension throne. One component for all four ranks; every gradient id is derived
 * from useId so four copies on the badge screen never share a gradient.
 */
function BadgeAstrolabe({ badge, earned }: { badge: Badge; earned: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const faceId = `bg-face-${uid}`;
  const glowId = `bg-glow-${uid}`;
  const metal = METALS[badge.metal];
  const cx = 60;
  const cy = 64;
  const r = 44;

  const ticks = Array.from({ length: 36 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 36;
    const outer = r - 1;
    const inner = index % 3 === 0 ? r - 9 : r - 5;
    return (
      <line
        key={index}
        x1={cx + outer * Math.cos(angle)} y1={cy + outer * Math.sin(angle)}
        x2={cx + inner * Math.cos(angle)} y2={cy + inner * Math.sin(angle)}
        stroke={metal.detail} strokeWidth={index % 3 === 0 ? 1.6 : 0.9} strokeLinecap="round"
      />
    );
  });

  const stars = [
    { x: 82, y: 34 }, { x: 40, y: 46 }, { x: 74, y: 90 }, { x: 33, y: 80 },
  ].map((point, index) => (
    <circle key={index} cx={point.x} cy={point.y} r={2.2} fill={metal.detail} stroke="none" />
  ));

  return (
    <div className={`bg-astrolabe ${earned ? "" : "bg-dim"}`} aria-hidden="true">
      <svg viewBox="0 0 120 126" role="presentation">
        <defs>
          <linearGradient id={faceId} x1="20" y1="20" x2="100" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={metal.face[0]} />
            <stop offset=".55" stopColor={metal.face[0]} stopOpacity=".82" />
            <stop offset="1" stopColor={metal.face[1]} />
          </linearGradient>
          {metal.glow && (
            <radialGradient id={glowId} cx=".38" cy=".3" r=".78">
              <stop offset="0" stopColor="#fffdf0" stopOpacity=".95" />
              <stop offset=".45" stopColor="#fff6d0" stopOpacity=".28" />
              <stop offset="1" stopColor="#fff6d0" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {/* Suspension throne and ring. */}
        <path d={`M52 8h16v6h-16z`} fill={metal.ring} />
        <circle cx="60" cy="7" r="5" fill="none" stroke={metal.ring} strokeWidth="2.4" />
        <path d={`M${cx} ${cy - r - 10}v6`} stroke={metal.ring} strokeWidth="4" strokeLinecap="round" />

        {/* The plate. */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#${faceId})`} stroke={metal.ring} strokeWidth="2.6" />
        <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke={metal.detail} strokeWidth=".9" opacity=".55" />
        {ticks}

        {/* The rete: the ecliptic ring and, at the higher ranks, its star pointers. */}
        {badge.rank >= 1 && (
          <circle cx={cx} cy={cy - 4} r="26" fill="none" stroke={metal.detail} strokeWidth="1.5" opacity=".9" />
        )}
        {badge.rank >= 2 && stars}

        {/* The alidade — the sighting rule across the plate. */}
        <g transform={`rotate(-24 ${cx} ${cy})`}>
          <rect x={cx - r + 2} y={cy - 1.6} width={(r - 2) * 2} height="3.2" rx="1.6" fill={metal.ring} />
          <circle cx={cx - r + 8} cy={cy} r="2.6" fill={metal.detail} />
          <circle cx={cx + r - 8} cy={cy} r="2.6" fill={metal.detail} />
        </g>
        <circle cx={cx} cy={cy} r="3.4" fill={metal.detail} stroke={metal.face[1]} strokeWidth="1" />

        {metal.glow && <circle cx={cx} cy={cy} r={r + 8} fill={`url(#${glowId})`} />}
      </svg>
      <strong>{badge.mark}</strong>
    </div>
  );
}

export default BaghdadGame;
