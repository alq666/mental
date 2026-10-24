export const DAY = 86_400_000;
export const INTERVALS = [1, 3, 7, 14, 30, 60];
export type Attempt = { at: number; correct: boolean; elapsedMs: number; timingValid: boolean; a: number; b: number };
export type Fact = { a: number; b: number; stage: number; due: number; advancedDay: string; failedDay: string; attempts: Attempt[]; retry: boolean };
export type Progress = Record<string, Fact>;
export type Session = { seen: Record<string, number>; last: Record<string, number>; eligible: Record<string, number>; newCount: number };
export const emptySession = (): Session => ({ seen: {}, last: {}, eligible: {}, newCount: 0 });
export const factKey = (a: number, b: number) => `${Math.min(a, b)}x${Math.max(a, b)}`;
const dayKey = (now: number) => new Date(now).toLocaleDateString('en-CA');
export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
export function threshold(progress: Progress) {
  const times = Object.values(progress).flatMap(f => f.attempts).filter(a => a.correct && a.timingValid).sort((a,b) => b.at-a.at).slice(0, 100).map(a => a.elapsedMs);
  return times.length < 20 ? 6000 : Math.max(4000, Math.min(10000, median(times)));
}
export function chooseFact(progress: Progress, session: Session, max: number, index: number, now: number, random = Math.random): Fact | null {
  const review: Fact[] = [], familiar: Fact[] = [], fresh: Fact[] = [];
  for (let a = 2; a <= max; a++) for (let b = a; b <= max; b++) {
    const key = factKey(a,b), existing = progress[key];
    if ((session.seen[key] || 0) >= 3 || index < (session.eligible[key] ?? 0)) continue;
    if (session.last[key] !== undefined && index - session.last[key] < 4) continue;
    const fact = existing ?? { a, b, stage: 0, due: now, advancedDay: '', failedDay: '', attempts: [], retry: false };
    if (!existing) { if (session.newCount < 2) fresh.push(fact); }
    else if (fact.retry || fact.due <= now) review.push(fact);
    else familiar.push(fact);
  }
  const roll = random();
  const pool = roll < .7 ? (review.length ? review : familiar.length ? familiar : fresh) : roll < .9 ? (familiar.length ? familiar : review.length ? review : fresh) : (fresh.length && review.length < 20 ? fresh : review.length ? review : familiar);
  if (!pool.length) return null;
  const target = threshold(progress);
  const weights = pool.map(f => {
    const valid = f.attempts.filter(a => a.correct && a.timingValid).slice(-3).map(a => a.elapsedMs);
    const slow = valid.length ? Math.max(1, Math.min(2, median(valid) / target)) : 1;
    const overdue = 1 + Math.min(2, Math.max(0, now-f.due)/(INTERVALS[f.stage]*DAY));
    return overdue * (f.retry ? 3 : 1) * slow;
  });
  let draw = random() * weights.reduce((a,b) => a+b, 0);
  return pool.find((_, i) => (draw -= weights[i]) < 0) ?? pool[pool.length-1];
}
export function recordAttempt(progress: Progress, session: Session, fact: Fact, attempt: Attempt, index: number, random = Math.random) {
  const key = factKey(fact.a,fact.b), today = dayKey(attempt.at);
  const slow = attempt.timingValid && attempt.elapsedMs > threshold(progress);
  const updated: Fact = { ...fact, attempts: [...fact.attempts, attempt].slice(-30) };
  if (!attempt.correct) {
    updated.stage = 0; updated.due = attempt.at + DAY; updated.failedDay = today; updated.retry = true;
  } else if (fact.failedDay === today) {
    updated.retry = false;
  } else if (slow) {
    updated.due = Math.min(fact.due > attempt.at ? fact.due : Infinity, attempt.at + INTERVALS[fact.stage]*DAY/2); updated.retry = true;
  } else {
    if (attempt.timingValid && fact.advancedDay !== today && fact.due <= attempt.at) {
      updated.stage = fact.attempts.length ? Math.min(5, fact.stage+1) : 0;
      updated.advancedDay = today;
    }
    updated.due = fact.advancedDay === today || fact.due > attempt.at ? fact.due : attempt.at + INTERVALS[updated.stage]*DAY;
    updated.retry = false;
  }
  const gap = !attempt.correct ? 3 + Math.floor(random()*3) : slow ? 6 + Math.floor(random()*3) : 3;
  return { progress: { ...progress, [key]: updated }, session: { ...session, newCount: session.newCount + (progress[key] ? 0 : 1), seen: { ...session.seen, [key]: (session.seen[key] || 0)+1 }, last: { ...session.last, [key]: index }, eligible: { ...session.eligible, [key]: index+gap+1 } } };
}
export function loadProgress(name: string): Progress {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(name)) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const result: Progress = {};
    for (const [key, f] of Object.entries(parsed) as [string, Fact][]) {
      if (f && Number.isInteger(f.a) && Number.isInteger(f.b) && f.a >= 2 && f.b >= f.a && f.b <= 20 && key === factKey(f.a,f.b) && Number.isInteger(f.stage) && f.stage >= 0 && f.stage < 6 && Number.isFinite(f.due) && typeof f.advancedDay === 'string' && typeof f.failedDay === 'string' && typeof f.retry === 'boolean' && Array.isArray(f.attempts) && f.attempts.every(a => a && Number.isFinite(a.at) && Number.isFinite(a.elapsedMs) && a.elapsedMs >= 0 && typeof a.correct === 'boolean' && typeof a.timingValid === 'boolean' && Number.isInteger(a.a) && Number.isInteger(a.b))) result[key] = f;
    }
    return result;
  } catch { return {}; }
}
export const storageKey = (name: string) => `mental-math:practice:v1:${encodeURIComponent(name.trim().toLowerCase())}`;
export function strategy(a: number, b: number) {
  if (a > 5) return `Think: 5 × ${b} = ${5*b}, plus ${a-5} × ${b} = ${(a-5)*b}.`;
  return `Think of ${a} equal groups of ${b}: ${Array(a).fill(b).join(' + ')} = ${a*b}.`;
}
