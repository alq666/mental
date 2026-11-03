import "./VeniceGame.css";
import { useId } from "react";
import { Regata } from "./Regata";
import { EquationSlots } from "./Equation";
import { ModePicker, type ModeLabels } from "./ModePicker";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Metal = "wax" | "sealing" | "gold" | "glow";

type Badge = {
  id: string;
  name: string;
  motto: string;
  description: string;
  threshold: number;
  /** Detail level of the seal: 0 plain wax, 1 ribbon, 2 lion, 3 gilded. */
  rank: number;
  metal: Metal;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:venice-badges:v1";

// The abacus schools of the Serenissima trained the merchants who kept the books of the
// Republic; the ladder runs from counter boy to patrician of the Great Council.
const BADGES: Badge[] = [
  { id: "fante", name: "Fante di banco", motto: "Prima la carta, poi il conto", description: "Tre risposte giuste di fila.", threshold: 3, rank: 0, metal: "wax", mark: "III" },
  { id: "computista", name: "Computista", motto: "Chi tiene i libri, tiene la città", description: "Cinque risposte giuste di fila.", threshold: 5, rank: 1, metal: "sealing", mark: "V" },
  { id: "maestro", name: "Maestro d'abaco", motto: "L'arte della ragione", description: "Dieci risposte giuste di fila.", threshold: 10, rank: 2, metal: "gold", mark: "X" },
  { id: "patrizio", name: "Patrizio", motto: "Nel Maggior Consiglio", description: "Venti conti senza un errore.", threshold: 20, rank: 3, metal: "glow", mark: "XX" },
];

const MODE_LABELS: ModeLabels = {
  multiply: "Moltiplicazione",
  missing: "Fattore mancante",
  divide: "Divisione",
};

const METALS: Record<Metal, { wax: [string, string]; edge: string; ribbon: string; ink: string; glow: boolean }> = {
  wax: { wax: ["#9c3a2f", "#6d231c"], edge: "#c2705f", ribbon: "#e8dcc0", ink: "#3a1410", glow: false },
  sealing: { wax: ["#a34435", "#71281f"], edge: "#d08a72", ribbon: "#e8dcc0", ink: "#3a1812", glow: false },
  gold: { wax: ["#c9a227", "#8a6a12"], edge: "#efd28f", ribbon: "#f4e6bd", ink: "#4a3a0c", glow: false },
  glow: { wax: ["#e6c34a", "#8f6d10"], edge: "#ffeaa8", ribbon: "#fff3c4", ink: "#4a3a0c", glow: true },
};

function VeniceGame() {
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
    ? "Ben fatto! La barca avanza."
    : feedback === "wrong"
      ? `Errore — la risposta è ${equation.expected}.`
      : feedback === "timeout"
        ? `Tempo scaduto — la risposta è ${equation.expected}.`
        : "";

  return (
    <main className="venice-app" lang="it">
      <header className="ve-nav">
        <a className="ve-brand" href="/venice" aria-label="Scuola d'Abaco">
          <span className="ve-brand-mark" aria-hidden="true">☙</span>
          <span><b>Scuola d'Abaco</b><small>Venezia · l'arte della ragione</small></span>
        </a>
        <nav aria-label="Navigazione del gioco">
          <button className="ve-nav-link" onClick={() => setScreen("setup")}>Il banco</button>
          <button className="ve-nav-link ve-badges-link" onClick={openBadges}>Sigilli <span>{earnedIds.length}</span></button>
          <a className="ve-nav-link" href="/">Classico</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="ve-hero">
          <div className="ve-hero-copy">
            <p className="ve-rubric">☙ La regata del Canal Grande ☙</p>
            <h1>Venti conti in Laguna.<br /><em>Nessun errore, nessun naufragio.</em></h1>
            <p className="ve-hero-subtitle">
              All'alba la regata parte da San Marco: venti conti vi separano dal palio,
              e il banco vi guarda.
            </p>
            <form className="ve-setup-card" onSubmit={startGame}>
              <label>
                <span>Nome del mercante</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="es. Marco" autoFocus />
              </label>
              <div className="ve-form-row">
                <label>
                  <span>Massimo fattore</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Tempo per conto</span>
                  <div className="ve-timer-setting">
                    <button type="button" className={`ve-toggle ${timerEnabled ? "ve-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="Accendi la clessidra"><i /></button>
                    <input aria-label="Secondi per conto" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>s</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="Genere di conto" labels={MODE_LABELS} />
              <button className="ve-primary" type="submit">Salpa per la regata <span>→</span></button>
              <p className="ve-setup-note">{TOTAL_ROUNDS} conti · Sigilli di serie · {timerEnabled ? `${timerSeconds || 0} secondi a conto` : "senza clessidra"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="ve-game-stage">
          <div className="ve-game-topline">
            <div><span>Mercante</span><strong>{playerName}</strong></div>
            <div className={`ve-game-clock ${timerEnabled && timeLeft <= 3 ? "ve-urgent" : ""}`}><span>{timerEnabled ? "Clessidra" : "Senza tempo"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>Vedi i sigilli</button>
          </div>
          <div className="ve-card">
            <div className="ve-progress-meta"><span>Conto {round} di {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)}% di Laguna</span></div>
            <div className="ve-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="ve-inscription">Contate presto e senza errori</p>
            <div className="ve-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="ve-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="La vostra risposta" aria-label="La vostra risposta" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Verifica</button>
            </form>
            <div className={`ve-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Regata key={round} outcome={feedback === "correct" ? "win" : "lose"} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="ve-streak-panel">
            <div className="ve-streak-mark" aria-hidden="true">☙</div>
            <div><span>Serie in corso</span><strong>{streak} giusti</strong></div>
            <div className="ve-streak-next">{nextBadge ? `Prossimo sigillo a ${nextBadge.threshold}` : "Tutti i sigilli sono vostri"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="ve-result-screen">
          <p className="ve-rubric">☙ Fine della regata ☙</p>
          <h1>La regata è finita</h1>
          <p>{playerName}, i vostri conti sono sul libro del banco.</p>
          <div className="ve-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Risposte giuste</span></div>
            <div><strong>{bestStreak}</strong><span>Serie migliore</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Sigilli</span></div>
          </div>
          {latestBadge && <div className="ve-new-badge"><WaxSeal badge={latestBadge} earned /><div><span>Nuovo sigillo</span><strong>{latestBadge.name}</strong><small>{latestBadge.motto}</small></div></div>}
          <div className="ve-result-actions"><button className="ve-primary" onClick={() => setScreen("setup")}>Di nuovo in Laguna</button><button className="ve-secondary" onClick={openBadges}>Tutti i sigilli</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="ve-badges-screen">
          <button className="ve-back-button" onClick={closeBadges}>← Indietro</button>
          <p className="ve-rubric">☙ Libro dei sigilli ☙</p>
          <h1>I vostri sigilli</h1>
          <p>Ogni serie è una prova; ogni sigillo, un credito che il banco riconosce.</p>
          <div className="ve-player-plaque"><span>Mercante</span><strong>{playerName.trim() || "Senza nome"}</strong><small>{earnedIds.length} di {BADGES.length}</small></div>
          <div className="ve-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`ve-badge-card ${earned ? "ve-earned" : "ve-locked"}`} key={badge.id}>
                <WaxSeal badge={badge} earned={earned} />
                <span className="ve-badge-state">{earned ? "Ottenuto" : "Da ottenere"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.motto}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>Scuola d'Abaco · Venezia · MCCCCLXXXIX</footer>
    </main>
  );
}

/**
 * A wax seal stamped on a ledger: plain wax, then its ribbon, then the winged lion, then
 * the gilding. Gradient ids come from useId so four seals never share one.
 */
function WaxSeal({ badge, earned }: { badge: Badge; earned: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const waxId = `ve-wax-${uid}`;
  const glowId = `ve-glow-${uid}`;
  const metal = METALS[badge.metal];

  return (
    <div className={`ve-seal ${earned ? "" : "ve-dim"}`} aria-hidden="true">
      <svg viewBox="0 0 120 118" role="presentation">
        <defs>
          <linearGradient id={waxId} x1="24" y1="18" x2="96" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={metal.wax[0]} />
            <stop offset=".6" stopColor={metal.wax[0]} stopOpacity=".9" />
            <stop offset="1" stopColor={metal.wax[1]} />
          </linearGradient>
          {metal.glow && (
            <radialGradient id={glowId} cx=".42" cy=".34" r=".66">
              <stop offset="0" stopColor="#fffdf2" stopOpacity=".85" />
              <stop offset=".55" stopColor="#fff3c4" stopOpacity=".2" />
              <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
            </radialGradient>
          )}
        </defs>

        {metal.glow && <circle cx="60" cy="52" r="50" fill={`url(#${glowId})`} />}

        {/* Ribbons below the wax, from the second rank on. */}
        {badge.rank >= 1 && (
          <g fill={metal.ribbon} stroke={metal.edge} strokeWidth=".8">
            <path d="M48 78l-8 32 8-5 6 6 2-33Z" />
            <path d="M72 78l8 32-8-5-6 6-2-33Z" />
          </g>
        )}

        {/* The wax itself: a disc with the irregular edge of a hand press. */}
        <path
          d="M60 8c14 0 24 6 30 16 6 10 8 22 5 33-3 12-12 21-24 24-12 3-26 0-34-9-8-9-11-22-8-34C32 24 44 8 60 8Z"
          fill={`url(#${waxId})`}
          stroke={metal.edge}
          strokeWidth="1.6"
        />
        <path d="M60 15c11 0 20 5 25 13 5 8 7 18 4 27-2 9-9 16-19 19-10 2-21 0-28-7-6-7-9-18-7-28C37 28 47 15 60 15Z" fill="none" stroke={metal.edge} strokeWidth=".9" opacity=".55" />

        {/* The winged lion, from the third rank on; before that, a merchant's mark. */}
        {badge.rank >= 2 ? (
          <g fill={metal.ink} opacity=".92">
            <ellipse cx="58" cy="50" rx="15" ry="8.5" />
            <circle cx="73" cy="41" r="6" />
            <path d="M69 34l4-7 4 7Z" />
            <path d="M46 45l-13-11 5 12 8 3Z" />
            <rect x="48" y="55" width="4" height="11" rx="1" />
            <rect x="62" y="55" width="4" height="11" rx="1" />
            <path d="M77 48l9 4-9 3Z" />
          </g>
        ) : (
          <g stroke={metal.ink} strokeWidth="2.4" strokeLinecap="round" opacity=".85">
            <path d="M52 38v22M68 38v22M52 49h16" />
          </g>
        )}

        {badge.rank >= 3 && (
          <path d="M60 2l2.6 5.4 6 .9-4.3 4.2 1 6L60 15.6l-5.3 2.9 1-6-4.3-4.2 6-.9Z" fill="#ffeaa8" />
        )}
      </svg>
      <strong>{badge.mark}</strong>
    </div>
  );
}

export default VeniceGame;
