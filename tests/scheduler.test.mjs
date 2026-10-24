import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const directory = await mkdtemp(join(tmpdir(), 'mental-scheduler-'));
let source;
try {
 execFileSync('./node_modules/.bin/tsc', ['src/practiceScheduler.ts', '--outDir', directory, '--target', 'es2020', '--module', 'es2020', '--skipLibCheck']);
 source = await readFile(join(directory, 'practiceScheduler.js'), 'utf8');
} finally { await rm(directory, {recursive:true, force:true}); }
const { DAY, emptySession, chooseFact, recordAttempt, threshold, loadProgress } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const now = new Date(2026, 9, 24, 12).getTime();
const fact = { a: 7, b: 8, stage: 3, due: now, advancedDay: '', failedDay: '', attempts: [], retry: false };
const attempt = (correct, elapsedMs = 2000, at = now, timingValid = true) => ({ correct, elapsedMs, at, timingValid, a: 7, b: 8 });
test('errors reset the interval and wait for three intervening questions', () => {
 const result = recordAttempt({'7x8':fact},emptySession(),fact,attempt(false),0,()=>0);
 assert.equal(result.progress['7x8'].stage,0);
 assert.equal(result.progress['7x8'].due,now+DAY);
 const eligibleOnly = {...result.session,newCount:2};
 assert.equal(chooseFact(result.progress,eligibleOnly,8,3,now,()=>0),null);
 assert.equal(chooseFact(result.progress,eligibleOnly,8,4,now,()=>0).a,7);
 const retry = recordAttempt(result.progress,result.session,result.progress['7x8'],attempt(true),4);
 assert.equal(retry.progress['7x8'].due,now+DAY);
 assert.equal(retry.progress['7x8'].stage,0);
});
test('slow recall gets a shorter interval and six intervening questions', () => {
 const result = recordAttempt({'7x8':fact},emptySession(),fact,attempt(true,12000),0,()=>0);
 assert.equal(result.progress['7x8'].due,now+7*DAY);
 assert.equal(result.session.eligible['7x8'],7);
});
test('advance at most once a day and cap fact appearances', () => {
 const known = {...fact,attempts:[attempt(true,2000,now-DAY)]};
 const first = recordAttempt({'7x8':known},emptySession(),known,attempt(true),0);
 assert.equal(first.progress['7x8'].stage,4);
 const second = recordAttempt(first.progress,first.session,first.progress['7x8'],attempt(true),4);
 assert.equal(second.progress['7x8'].stage,4);
 assert.equal(second.progress['7x8'].due,first.progress['7x8'].due);
 assert.equal(chooseFact(second.progress,{...second.session,newCount:2,seen:{'7x8':3}},8,20,now,()=>0),null);
});
test('interrupted attempts preserve accuracy without advancing', () => {
 const result = recordAttempt({'7x8':fact},emptySession(),fact,attempt(true,2000,now,false),0);
 assert.equal(result.progress['7x8'].stage,3);
 assert.equal(result.progress['7x8'].attempts[0].timingValid,false);
});
test('personal timing threshold is bounded and ignores interrupted attempts', () => {
 assert.equal(threshold({}),6000);
 assert.equal(threshold({'7x8':{...fact,attempts:Array(20).fill(attempt(true,20000))}}),10000);
 assert.equal(threshold({'7x8':{...fact,attempts:Array(20).fill(attempt(true,100))}}),4000);
});
test('new fact budget and empty pools finish without breaking cooldowns', () => {
 assert.ok(chooseFact({},emptySession(),12,0,now,()=>0));
 assert.equal(chooseFact({},{...emptySession(),newCount:2},12,0,now,()=>0),null);
});
test('storage tolerates malformed data and reloads valid progress', () => {
 globalThis.localStorage={getItem:()=>'{bad'};
 assert.deepEqual(loadProgress('Sam'),{});
 globalThis.localStorage={getItem:()=>JSON.stringify({'7x8':fact,broken:{stage:NaN}})};
 assert.deepEqual(loadProgress('Sam'),{'7x8':fact});
});

test('early familiar reviews do not advance the due date', () => {
 const future = {...fact, due:now+7*DAY, attempts:[attempt(true,2000,now-DAY)]};
 const result = recordAttempt({'7x8':future},emptySession(),future,attempt(true),0);
 assert.equal(result.progress['7x8'].stage,3);
 assert.equal(result.progress['7x8'].due,future.due);
});
