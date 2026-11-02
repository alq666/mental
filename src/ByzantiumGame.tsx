import "./ByzantiumGame.css";
import { useId } from "react";
import { Hippodrome } from "./Hippodrome";
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
  /** Detail level of the wreath: 0 leaves, 1 tesserae, 2 chrismon, 3 the gilded crown. */
  rank: number;
  metal: Metal;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:byzantium-badges:v1";

// The schools of the queen city, and the chariot factions of the Hippodrome: the ladder
// climbs from pupil to the crown worn by the victor of the games.
const BADGES: Badge[] = [
  { id: "mathetes", name: "Μαθητής", motto: "Ἀρχὴ σοφίας", description: "Τρεῖς ὀρθαὶ ἀποκρίσεις ἑξῆς.", threshold: 3, rank: 0, metal: "bronze", mark: "γ" },
  { id: "grammateus", name: "Γραμματεύς", motto: "Ὁ γράφων μένει", description: "Πέντε ὀρθαὶ ἀποκρίσεις ἑξῆς.", threshold: 5, rank: 1, metal: "silver", mark: "ε" },
  { id: "rhetor", name: "Ῥήτωρ", motto: "Λόγος ἰσχύει", description: "Δέκα ὀρθαὶ ἀποκρίσεις ἑξῆς.", threshold: 10, rank: 2, metal: "gold", mark: "ι" },
  { id: "stephanites", name: "Στεφανίτης", motto: "Νίκη ἐν Ἱπποδρομίῳ", description: "Εἴκοσι ἀγῶνες ἄνευ σφάλματος.", threshold: 20, rank: 3, metal: "glow", mark: "κ" },
];

const MODE_LABELS: ModeLabels = {
  multiply: "Πολλαπλασιασμός",
  missing: "Ἄγνωστος παράγων",
  divide: "Διαίρεσις",
};

const METALS: Record<Metal, { leaf: string; deep: string; detail: string; glow: boolean }> = {
  bronze: { leaf: "#a8763f", deep: "#6b4322", detail: "#f0d7ac", glow: false },
  silver: { leaf: "#aab3bd", deep: "#6a7480", detail: "#f4f7fa", glow: false },
  gold: { leaf: "#d3ac38", deep: "#8a6a12", detail: "#fff4c8", glow: false },
  glow: { leaf: "#e6c748", deep: "#8f6d10", detail: "#fffbe4", glow: true },
};

function ByzantiumGame() {
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
    ? "Ὀρθῶς! Ὁ στέφανος ἐγγύς."
    : feedback === "wrong"
      ? `Οὐχί — ἡ ἀπόκρισις ${equation.expected}.`
      : feedback === "timeout"
        ? `Ὁ χρόνος ἐξέλιπεν — ἡ ἀπόκρισις ${equation.expected}.`
        : "";

  return (
    <main className="byzantium-app" lang="el">
      <header className="byz-nav">
        <a className="byz-brand" href="/byzantium" aria-label="Ἡ Ἀριθμητική">
          <span className="byz-brand-mark">☧</span>
          <span><b>Ἡ Ἀριθμητική</b><small>Βυζάντιον · ἡ βασιλεύουσα</small></span>
        </a>
        <nav aria-label="Πλοήγησις">
          <button className="byz-nav-link" onClick={() => setScreen("setup")}>Ἀρχή</button>
          <button className="byz-nav-link byz-badges-link" onClick={openBadges}>Στέφανοι <span>{earnedIds.length}</span></button>
          <a className="byz-nav-link" href="/">Τὸ κλασικόν</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="byz-hero">
          <div className="byz-hero-copy">
            <p className="byz-rubric">✠ Ἀγὼν Λογισμοῦ ✠</p>
            <h1>Ἄσκησον τὸν νοῦν,<br /><em>καὶ στεφανώθητι.</em></h1>
            <p className="byz-hero-subtitle">Εἴκοσι ἀγῶνες ἵστανται μεταξὺ σοῦ καὶ τοῦ στεφάνου τῆς βασιλευούσης.</p>
            <form className="byz-setup-card" onSubmit={startGame}>
              <label>
                <span>Ὄνομα ἀθλητοῦ</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="π.χ. Ἄννα" autoFocus />
              </label>
              <div className="byz-form-row">
                <label>
                  <span>Μέγιστος παράγων</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Χρόνος ἑκάστου λογισμοῦ</span>
                  <div className="byz-timer-setting">
                    <button type="button" className={`byz-toggle ${timerEnabled ? "byz-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="ἐνεργοποίησις τῆς κλεψύδρας"><i /></button>
                    <input aria-label="Χρόνος ἑκάστου λογισμοῦ εἰς δευτερόλεπτα" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>δευτ.</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="Εἶδος λογισμοῦ" labels={MODE_LABELS} />
              <button className="byz-primary" type="submit">Εἴσελθε εἰς τὸν ἀγῶνα <span>→</span></button>
              <p className="byz-setup-note">{TOTAL_ROUNDS} ἀγῶνες · Στέφανοι σειρᾶς · {timerEnabled ? `${timerSeconds || 0} δευτερόλεπτα ἕκαστος` : "Ἄνευ χρόνου"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="byz-game-stage">
          <div className="byz-game-topline">
            <div><span>Ἀθλητής</span><strong>{playerName}</strong></div>
            <div className={`byz-game-clock ${timerEnabled && timeLeft <= 3 ? "byz-urgent" : ""}`}><span>{timerEnabled ? "Κλεψύδρα" : "Ἄνευ χρόνου"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>Ἴδε τοὺς στεφάνους</button>
          </div>
          <div className="byz-card">
            <div className="byz-progress-meta"><span>Ἀγὼν {round} ἐκ {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}% τετελεσμένον</span></div>
            <div className="byz-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="byz-inscription">Λόγισαι ταχέως καὶ ἀσφαλῶς</p>
            <div className="byz-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="byz-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Ἡ ἀπόκρισις" aria-label="Ἡ ἀπόκρισις" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Ἔλεγξον</button>
            </form>
            <div className={`byz-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Hippodrome key={round} outcome={feedback === "correct" ? "win" : "lose"} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="byz-streak-panel">
            <div className="byz-streak-mark">☧</div>
            <div><span>Σειρὰ νῦν</span><strong>{streak} ὀρθαί</strong></div>
            <div className="byz-streak-next">{nextBadge ? `Ὁ ἑπόμενος στέφανος ἐν ${nextBadge.threshold}` : "Πάντες οἱ στέφανοι ἐλήφθησαν"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="byz-result-screen">
          <p className="byz-rubric">✠ Τέλος Ἀγῶνος ✠</p>
          <h1>Ὁ ἀγὼν ἐτελέσθη</h1>
          <p>{playerName}, τὰ ἔργα σου ἀνεγράφησαν εἰς τὰ χρονικά.</p>
          <div className="byz-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Ὀρθαὶ ἀποκρίσεις</span></div>
            <div><strong>{bestStreak}</strong><span>Μακροτάτη σειρά</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Στέφανοι</span></div>
          </div>
          {latestBadge && <div className="byz-new-badge"><BadgeWreath badge={latestBadge} earned /><div><span>Νέος στέφανος</span><strong>{latestBadge.name}</strong><small>{latestBadge.motto}</small></div></div>}
          <div className="byz-result-actions"><button className="byz-primary" onClick={() => setScreen("setup")}>Αὖθις ἀγωνίσθητι</button><button className="byz-secondary" onClick={openBadges}>Πάντες οἱ στέφανοι</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="byz-badges-screen">
          <button className="byz-back-button" onClick={closeBadges}>← Ὀπίσω</button>
          <p className="byz-rubric">✠ Στεφανηφορία ✠</p>
          <h1>Οἱ στέφανοί σου</h1>
          <p>Ἑκάστη σειρὰ βαθμός, ἕκαστος στέφανος τιμή.</p>
          <div className="byz-player-plaque"><span>Χρονικόν</span><strong>{playerName.trim() || "Ἀνώνυμος ἀθλητής"}</strong><small>{earnedIds.length} ἐκ {BADGES.length}</small></div>
          <div className="byz-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`byz-badge-card ${earned ? "byz-earned" : "byz-locked"}`} key={badge.id}>
                <BadgeWreath badge={badge} earned={earned} />
                <span className="byz-badge-state">{earned ? "Ἐλήφθη" : "Οὔπω"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.motto}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>Ἡ Ἀριθμητική · Βυζάντιον · ἐν τῇ βασιλευούσῃ</footer>
    </main>
  );
}

/**
 * A laurel wreath that gains its layers as the rank climbs: bare leaves, then a band of
 * mosaic tesserae, then the chrismon in the roundel, then the gilded crown with its
 * pendilia. One component for all four ranks; gradient ids come from useId so no two
 * badges on the screen can share one.
 */
function BadgeWreath({ badge, earned }: { badge: Badge; earned: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const leafId = `byz-leaf-${uid}`;
  const glowId = `byz-glow-${uid}`;
  const metal = METALS[badge.metal];
  const cx = 60;
  const cy = 62;
  const radius = 38;
  const count = 9 + badge.rank * 2;

  // Leaves laid around the ring, 0 at the top, open where the two branches meet.
  const leaves = Array.from({ length: count }, (_, index) => {
    const angle = -156 + (index * 312) / (count - 1);
    const radians = (angle * Math.PI) / 180;
    const x = cx + radius * Math.sin(radians);
    const y = cy - radius * Math.cos(radians);
    return (
      <ellipse
        key={index}
        cx={x} cy={y} rx={8.6} ry={4.1}
        transform={`rotate(${angle} ${x} ${y})`}
        fill={`url(#${leafId})`}
        stroke={metal.deep} strokeWidth=".6"
      />
    );
  });

  // Mosaic tesserae just outside the leaves, from the second rank on.
  const tesserae = Array.from({ length: 16 }, (_, index) => {
    const radians = (index * Math.PI * 2) / 16;
    const x = cx + (radius + 12) * Math.sin(radians);
    const y = cy - (radius + 12) * Math.cos(radians);
    return <rect key={index} x={x - 2.6} y={y - 2.6} width="5.2" height="5.2" transform={`rotate(45 ${x} ${y})`} fill={index % 2 ? metal.detail : metal.leaf} opacity=".85" />;
  });

  return (
    <div className={`byz-wreath ${earned ? "" : "byz-dim"}`} aria-hidden="true">
      <svg viewBox="0 0 120 128" role="presentation">
        <defs>
          <linearGradient id={leafId} x1="20" y1="18" x2="100" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={metal.detail} stopOpacity=".95" />
            <stop offset=".45" stopColor={metal.leaf} />
            <stop offset="1" stopColor={metal.deep} />
          </linearGradient>
          {metal.glow && (
            <radialGradient id={glowId} cx=".4" cy=".34" r=".72">
              <stop offset="0" stopColor="#fffdf2" stopOpacity=".9" />
              <stop offset=".5" stopColor="#fff7d4" stopOpacity=".22" />
              <stop offset="1" stopColor="#fff7d4" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {metal.glow && <circle cx={cx} cy={cy} r="52" fill={`url(#${glowId})`} />}

        {/* The roundel the wreath encircles. */}
        <circle cx={cx} cy={cy} r="23" fill="#f7f1e2" stroke={metal.deep} strokeWidth="1.6" />
        <circle cx={cx} cy={cy} r="19" fill="none" stroke={metal.leaf} strokeWidth=".8" opacity=".55" />

        {leaves}
        {badge.rank >= 1 && tesserae}

        {/* The chrismon, from the third rank on. */}
        {badge.rank >= 2 && (
          <g stroke={metal.deep} strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M51 50l18 24M69 50L51 74" />
            <path d="M60 44v30" />
            <path d="M60 44a7.5 7.5 0 0 1 0 14" />
          </g>
        )}
        {badge.rank < 2 && <circle cx={cx} cy={cy} r="4" fill={metal.leaf} />}

        {/* Pendilia: the jewelled ribbons that hang from a crown. */}
        {badge.rank >= 3 && (
          <g fill={metal.leaf} stroke={metal.deep} strokeWidth=".8">
            <path d="M46 96l-3 20 5-4 4 5 1-21Z" />
            <path d="M74 96l3 20-5-4-4 5-1-21Z" />
          </g>
        )}
      </svg>
      <strong>{badge.mark}</strong>
    </div>
  );
}

export default ByzantiumGame;
