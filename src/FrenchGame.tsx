import "./FrenchGame.css";
import { Duel, type DuelTheme } from "./Duel";
import { EquationSlots } from "./Equation";
import { ModePicker, type ModeLabels } from "./ModePicker";
import { formatClock, TOTAL_ROUNDS, useStreakGame } from "./useStreakGame";

type Badge = {
  id: string;
  name: string;
  motto: string;
  description: string;
  threshold: number;
  mark: string;
};

const BADGE_STORAGE_KEY = "mental-math-challenge:french-badges:v1";

// Ranks of chivalry, ending with Charles VII's coronation at Reims (1429).
// Marks are written as a 15th-century scribe would: lowercase, final i as j.
const BADGES: Badge[] = [
  { id: "page", name: "Page", motto: "Au service du seigneur", description: "Trois bonnes réponses d'affilée.", threshold: 3, mark: "iij" },
  { id: "ecuyer", name: "Écuyer", motto: "Porteur de l'écu", description: "Cinq bonnes réponses d'affilée.", threshold: 5, mark: "v" },
  { id: "chevalier", name: "Chevalier", motto: "Adoubé sur le champ", description: "Dix bonnes réponses d'affilée.", threshold: 10, mark: "x" },
  { id: "sacre", name: "Le Sacre de Reims", motto: "Reims, l'an MCDXXIX", description: "Les vingt épreuves sans une seule faute.", threshold: 20, mark: "xx" },
];

const frenchNumber = (value: string) => value.replace(".", ",");

// A knight of France against an English man-at-arms, as at Formigny (1450).
const DUEL_THEME: DuelTheme = {
  className: "duel-france",
  player: { h: "#a3acb8", c: "#c39a3b", t: "#1f3b78", d: "#c39a3b", l: "#7b8591" },
  foe: { h: "#8d939c", c: "#e8e2d4", t: "#ece6d6", d: "#b3261e", l: "#5b4a3a" },
  win: "Victoire !",
  lose: "Défaite…",
};

const MODE_LABELS: ModeLabels = {
  multiply: "Multiplication",
  missing: "Facteur manquant",
  divide: "Division",
};

function FrenchGame() {
  const {
    screen, setScreen, openBadges, closeBadges,
    playerName, setPlayerName, maxMultiple, setMaxMultiple,
    mode, setMode, equation,
    timerEnabled, setTimerEnabled, timerSeconds, setTimerSeconds,
    timeLeft, round, score, streak, bestStreak,
    answer, setAnswer, feedback, answerInput,
    startGame, submitAnswer, earnedIds, earnedBadges, latestBadge, nextBadge,
  } = useStreakGame(BADGES, BADGE_STORAGE_KEY);
  const feedbackText = feedback === "correct" ? "Juste ! Montjoie Saint-Denis !" : feedback === "wrong" ? `Que nenni — la réponse est ${equation.expected}.` : feedback === "timeout" ? `Le temps est écoulé — la réponse est ${equation.expected}.` : "";

  return (
    <main className="france-app" lang="fr">
      <header className="france-nav">
        <a className="france-brand" href="/france" aria-label="Accueil du Comptoir des Nombres">
          <span className="fr-brand-mark">⚜</span>
          <span><b>Le Comptoir des Nombres</b><small>Science · Vaillance · Honneur</small></span>
        </a>
        <nav aria-label="Navigation du jeu">
          <button className="fr-nav-link" onClick={() => setScreen("setup")}>Accueil</button>
          <button className="fr-nav-link fr-badges-link" onClick={openBadges}>Blasons <span>{earnedIds.length}</span></button>
          <a className="fr-nav-link" href="/">Classique</a>
        </nav>
      </header>

      {screen === "setup" && (
        <section className="france-hero">
          <div className="fr-hero-copy">
            <p className="fr-rubric">✠ Exercice de l'esprit ✠</p>
            <h1><span className="fr-lettrine">E</span>xercez l'esprit,<br /><em>gagnez vos éperons.</em></h1>
            <p className="fr-hero-subtitle">Prenez place au comptoir des calculateurs du roi. Vingt épreuves vous séparent de la gloire du royaume.</p>
            <form className="france-setup-card" onSubmit={startGame}>
              <label>
                <span>Nom du champion</span>
                <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="ex. Jehanne" autoFocus />
              </label>
              <div className="fr-form-row">
                <label>
                  <span>Facteur maximal</span>
                  <input type="number" min="2" max="99" value={maxMultiple} onChange={(event) => setMaxMultiple(event.target.value)} />
                </label>
                <label>
                  <span>Temps par calcul</span>
                  <div className="fr-timer-setting">
                    <button type="button" className={`fr-toggle ${timerEnabled ? "fr-on" : ""}`} onClick={() => setTimerEnabled((value) => !value)} aria-pressed={timerEnabled} aria-label="Activer le sablier"><i /></button>
                    <input aria-label="Temps par calcul, en secondes" type="number" min="1" max="60" step="1" value={timerSeconds} onChange={(event) => setTimerSeconds(event.target.value)} disabled={!timerEnabled} />
                    <span>s</span>
                  </div>
                </label>
              </div>
              <ModePicker value={mode} onChange={setMode} label="Type de calcul" labels={MODE_LABELS} />
              <button className="france-primary" type="submit">Entrer en lice <span>→</span></button>
              <p className="fr-setup-note">xx épreuves · Blasons de série · {timerEnabled ? `${frenchNumber(timerSeconds || "0")} secondes par calcul` : "Sans limite de temps"}</p>
            </form>
          </div>
        </section>
      )}

      {screen === "game" && (
        <section className="fr-game-stage">
          <div className="fr-game-topline">
            <div><span>Champion</span><strong>{playerName}</strong></div>
            <div className={`fr-game-clock ${timerEnabled && timeLeft <= 3 ? "fr-urgent" : ""}`}><span>{timerEnabled ? "Sablier" : "Sans limite"}</span><strong>{timerEnabled ? formatClock(timeLeft) : "∞"}</strong></div>
            <button onClick={openBadges}>Voir les blasons</button>
          </div>
          <div className="fr-lists-card">
            <div className="fr-progress-meta"><span>Épreuve {round} sur {TOTAL_ROUNDS}</span><span>{Math.round(((round - 1) / TOTAL_ROUNDS) * 100)} % accompli</span></div>
            <div className="france-progress"><i style={{ width: `${((round - 1) / TOTAL_ROUNDS) * 100}%` }} /></div>
            <p className="fr-inscription">Calculez avec promptitude et justesse</p>
            <div className="france-question"><EquationSlots tokens={equation.tokens} /></div>
            <form className="france-answer" onSubmit={submitAnswer}>
              <input ref={answerInput} type="number" inputMode="numeric" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Votre réponse" aria-label="Votre réponse" disabled={!!feedback} />
              <button type="submit" disabled={!answer || !!feedback}>Valider</button>
            </form>
            <div className={`france-feedback ${feedback}`} aria-live="polite">{feedbackText}</div>
            {feedback && <Duel key={round} outcome={feedback === "correct" ? "win" : "lose"} theme={DUEL_THEME} playerName={playerName} caption={feedbackText} />}
          </div>
          <div className="fr-streak-panel">
            <div className="fr-streak-mark">⚔</div>
            <div><span>Série en cours</span><strong>{streak} {streak > 1 ? "justes" : "juste"}</strong></div>
            <div className="fr-streak-next">{nextBadge ? `Prochain blason à ${nextBadge.threshold}` : "Tous les blasons sont acquis"}</div>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="fr-result-screen">
          <p className="fr-rubric">✠ Explicit ✠</p>
          <h1>L'épreuve est accomplie</h1>
          <p>{playerName}, vos exploits sont consignés dans les chroniques du royaume.</p>
          <div className="fr-result-card">
            <div><strong>{score}<small> / {TOTAL_ROUNDS}</small></strong><span>Bonnes réponses</span></div>
            <div><strong>{bestStreak}</strong><span>Meilleure série</span></div>
            <div><strong>{earnedBadges.length}</strong><span>Blasons obtenus</span></div>
          </div>
          {latestBadge && <div className="fr-new-badge"><BadgeShield badge={latestBadge} earned /><div><span>Nouveau blason</span><strong>{latestBadge.name}</strong><small>{latestBadge.motto}</small></div></div>}
          <div className="fr-result-actions"><button className="france-primary" onClick={() => setScreen("setup")}>Relever le défi</button><button className="france-secondary" onClick={openBadges}>Voir tous les blasons</button></div>
        </section>
      )}

      {screen === "badges" && (
        <section className="fr-badges-screen">
          <button className="fr-back-button" onClick={closeBadges}>← Retour</button>
          <p className="fr-rubric">✠ Armorial ✠</p>
          <h1>Vos blasons</h1>
          <p>Chaque série est une chevauchée. Chaque blason, une victoire que l'on chantera.</p>
          <div className="fr-player-plaque"><span>Armorial de</span><strong>{playerName.trim() || "Champion sans nom"}</strong><small>{earnedIds.length} sur {BADGES.length} obtenus</small></div>
          <div className="fr-badge-grid">
            {BADGES.map((badge) => {
              const earned = earnedIds.includes(badge.id);
              return <article className={`fr-badge-card ${earned ? "fr-earned" : "fr-locked"}`} key={badge.id}>
                <BadgeShield badge={badge} earned={earned} />
                <span className="fr-badge-state">{earned ? "Acquis" : "À conquérir"}</span>
                <h2>{badge.name}</h2>
                <em>{badge.motto}</em>
                <p>{badge.description}</p>
              </article>;
            })}
          </div>
        </section>
      )}
      <footer>Montjoie Saint-Denis · Le Comptoir des Nombres · L'an de grâce MCDLIII</footer>
    </main>
  );
}

function BadgeShield({ badge, earned }: { badge: Badge; earned: boolean }) {
  return <div className={`fr-shield ${earned ? "" : "fr-dim"}`} aria-hidden="true"><span>⚜</span><strong>{badge.mark}</strong></div>;
}

export default FrenchGame;
