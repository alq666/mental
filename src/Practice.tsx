import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { chooseFact, emptySession, factKey, loadProgress, recordAttempt, storageKey, strategy, type Fact, type Progress } from './practiceScheduler';

export default function Practice({ challenge }: { challenge: () => void }) {
  const [name, setName] = useState('');
  const [max, setMax] = useState(12);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState<Progress>({});
  const session = useRef(emptySession());
  const [question, setQuestion] = useState<{ fact: Fact; a: number; b: number } | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [saved, setSaved] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [strengthened, setStrengthened] = useState<string[]>([]);
  const clock = useRef({ start: 0, valid: true, submitted: false });
  const sessionStart = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!paused && !feedback) input.current?.focus(); }, [paused, feedback]);
  useLayoutEffect(() => {
    if (!question) return;
    clock.current = { start: performance.now(), valid: !document.hidden, submitted: false };
    input.current?.focus();
  }, [question]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) { clock.current.valid = false; setPaused(true); } };
    document.addEventListener('visibilitychange', hidden);
    return () => document.removeEventListener('visibilitychange', hidden);
  }, []);
  function next(data: Progress, nextIndex: number) {
    if (nextIndex >= 20 || performance.now()-sessionStart.current >= 300000) { setDone(true); return; }
    const fact = chooseFact(data, session.current, max, nextIndex, Date.now());
    if (!fact) { setDone(true); return; }
    const previous = fact.attempts[fact.attempts.length - 1];
    const reverse = previous ? previous.a === fact.a : Math.random() < .5;
    setQuestion({ fact, a: reverse ? fact.b : fact.a, b: reverse ? fact.a : fact.b });
    setAnswer(''); setFeedback(null); setIndex(nextIndex);
  }
  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !Number.isInteger(max) || max < 2 || max > 20) return;
    const data = loadProgress(name);
    session.current = emptySession(); sessionStart.current = performance.now();
    setProgress(data); setCorrectCount(0); setStrengthened([]); setDone(false); setPaused(false); setStarted(true);
    next(data, 0);
  }
  function submit(unknown = false) {
    if (!question || paused || clock.current.submitted || (!unknown && !answer.trim())) return;
    clock.current.submitted = true;
    const correct = !unknown && Number(answer) === question.a*question.b;
    const result = recordAttempt(progress, session.current, question.fact, { at: Date.now(), correct, elapsedMs: Math.max(0, performance.now()-clock.current.start), timingValid: clock.current.valid && !document.hidden, a: question.a, b: question.b }, index);
    session.current = result.session; setProgress(result.progress);
    try { localStorage.setItem(storageKey(name), JSON.stringify(result.progress)); setSaved(true); } catch { setSaved(false); }
    if (correct) {
      setCorrectCount(c => c+1);
      const key = factKey(question.a,question.b);
      if (result.progress[key].stage > question.fact.stage) setStrengthened(keys => [...new Set([...keys,key])]);
    }
    setFeedback({ correct, text: correct ? '✓ You got it!' : `${question.a} × ${question.b} = ${question.a*question.b}. ${strategy(question.a,question.b)}` });
  }
  const facts = Object.values(progress).filter(f => f.b <= max);
  const due = facts.filter(f => f.due <= Date.now() || f.retry).length;
  if (!started) return <div className="setup-container"><h1>Multiplication practice</h1><p>A little practice each day. Take your time!</p><form onSubmit={start} className="setup-form"><div className="form-group"><label htmlFor="practice-name">What's your name?</label><input id="practice-name" className="setup-input" value={name} onChange={e => setName(e.target.value)} required maxLength={80} autoFocus /><small>Use the same name to continue your progress on this device.</small></div><div className="form-group"><label htmlFor="practice-max">Practice tables up to</label><input id="practice-max" className="setup-input" type="number" min={2} max={20} value={max} onChange={e => setMax(Number(e.target.value))} required /><small>Start with tables you have already learned.</small></div><button className="start-button">Let's practice</button></form><button onClick={challenge}>Play the timed challenge</button><a href="/roman" className="roman-variant-link">Try the Roman challenge</a></div>;
  if (done) return <div className="game-over"><h1>Nice practice, {name.trim()}!</h1><p>You recalled {correctCount} of {Object.values(session.current.seen).reduce((a,b) => a+b,0)} answers correctly.</p><p>{strengthened.length} facts moved to a longer review interval.</p><p>{due ? `${due} facts are ready for more practice.` : 'Your reviews are scheduled for later.'} Come back tomorrow for a little more.</p><p>Short sessions help your learning stick.</p>{!saved && <p role="status">Progress could not be saved on this device. Keep this tab open to continue.</p>}<button className="restart-button" onClick={() => setStarted(false)}>Back to practice setup</button></div>;
  return <div className="game-container"><header className="game-header"><h1>Multiplication practice</h1><p>{name.trim()} · Question {index+1} of up to 20</p><p>Think it through. There’s no rush.</p></header>{question && <div className="question-container"><div className="question" aria-live="polite">{question.a} × {question.b} = ?</div>{paused ? <div><p>Practice paused. Ready to keep going?</p><button onClick={() => { clock.current.valid = false; setPaused(false); input.current?.focus(); }}>Resume</button></div> : <><form className="answer-form" onSubmit={e => { e.preventDefault(); submit(); }}><label className="sr-only" htmlFor="practice-answer">Your answer</label><input ref={input} id="practice-answer" className="answer-input" type="number" step="1" min="0" value={answer} onChange={e => setAnswer(e.target.value)} disabled={!!feedback} /><button className="submit-button" disabled={!!feedback || !answer.trim()}>Check answer</button></form>{!feedback && <button onClick={() => submit(true)}>I don’t know yet</button>}{feedback && <div role="status" className={`feedback ${feedback.correct ? 'correct' : ''}`}><p>{feedback.text}</p>{!feedback.correct && <p>Picture equal rows or groups. We’ll try this again later.</p>}<button className="submit-button" onClick={() => next(progress,index+1)}>Continue</button></div>}</>}</div>}<div className="practice-actions"><button onClick={() => { clock.current.valid = false; setPaused(true); }}>Pause</button><button onClick={() => setDone(true)}>Finish practice</button></div>{!saved && <p role="status">Progress could not be saved on this device.</p>}</div>;
}
