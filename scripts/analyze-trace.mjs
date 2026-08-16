#!/usr/bin/env node
/**
 * Reads a Chrome DevTools performance trace and says where the time actually went.
 *
 * Why this exists: hand-placed `performance.now()` timers can only measure the thread they run on,
 * and they measure *wall clock* — so a renderer blocked waiting on the GPU process reads as
 * expensive JavaScript. That mistake cost a long chase: an avatar composition timed at 5ms turned
 * out to be a thread idling on a synchronous canvas readback, and no amount of extra timers could
 * have shown it, because the work was in another process entirely.
 *
 * Chrome's own sampling profiler already records all of it. What was missing was reading it
 * properly — in particular attributing a hot native function (`save`, `drawImage`, `getImageData`)
 * to the application code that calls it, rather than guessing. A guess of that exact kind produced
 * a fix predicted at "a third of the frame" that delivered 14%.
 *
 * Usage:
 *   node scripts/analyze-trace.mjs <trace.json[.gz]> [--from <ms>] [--to <ms>] [--top N]
 *
 *   --from / --to   restrict to a window, in ms from the first sample. Comparing the first and
 *                   last seconds of one run is how you separate a steady cost from a degradation.
 *   --top           how many rows per section (default 15).
 */
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));

if(!file)
{
    console.error('usage: node scripts/analyze-trace.mjs <trace.json[.gz]> [--from ms] [--to ms] [--top N]');
    process.exit(1);
}

const flag = (name, fallback) =>
{
    const i = args.indexOf(name);

    return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : fallback;
};

const from = flag('--from', -Infinity);
const to = flag('--to', Infinity);
const top = flag('--top', 15);

const bytes = readFileSync(file);
const text = (bytes[0] === 0x1f && bytes[1] === 0x8b) ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
const parsed = JSON.parse(text);
const events = Array.isArray(parsed) ? parsed : parsed.traceEvents;

const ms = (us) => us / 1000;
const pad = (s, n) => String(s).padStart(n);

// ---------------------------------------------------------------- threads

const threadName = new Map();

for(const e of events)
{
    if(e.name === 'thread_name') threadName.set(`${e.pid}:${e.tid}`, e.args?.name ?? '?');
}

const perThread = new Map();
let traceStart = Infinity;
let traceEnd = -Infinity;

for(const e of events)
{
    if(e.name !== 'RunTask' || e.ph !== 'X' || !e.dur) continue;

    const key = `${e.pid}:${e.tid}`;
    const entry = perThread.get(key) ?? {busy: 0, max: 0, count: 0};

    entry.busy += e.dur;
    entry.count++;
    entry.max = Math.max(entry.max, e.dur);
    perThread.set(key, entry);

    traceStart = Math.min(traceStart, e.ts);
    traceEnd = Math.max(traceEnd, e.ts + e.dur);
}

const spanMs = ms(traceEnd - traceStart);

console.log(`\n=== ${file}`);
console.log(`span ${(spanMs / 1000).toFixed(1)}s\n`);
console.log('THREADS — who is actually busy');
console.log('  thread                    busy      %span   longest task');

for(const [key, v] of [...perThread.entries()].sort((a, b) => b[1].busy - a[1].busy).slice(0, 8))
{
    const name = threadName.get(key) ?? key;

    console.log(
        `  ${name.padEnd(24)} ${pad(ms(v.busy).toFixed(0) + 'ms', 8)} ${pad((ms(v.busy) / spanMs * 100).toFixed(0) + '%', 8)} ${pad(ms(v.max).toFixed(0) + 'ms', 10)}`
    );
}

// ---------------------------------------------------------------- cpu profile

const nodes = new Map();
let samples = [];
let deltas = [];

for(const e of events)
{
    const cpuProfile = e.args?.data?.cpuProfile;

    if(cpuProfile)
    {
        for(const n of (cpuProfile.nodes ?? [])) nodes.set(n.id, n);
        if(cpuProfile.samples) samples = samples.concat(cpuProfile.samples);
    }

    if(e.args?.data?.timeDeltas) deltas = deltas.concat(e.args.data.timeDeltas);
}

if(!samples.length)
{
    console.log('\nNo CPU profile in this trace. Record with the "JavaScript samples" option enabled.');
    process.exit(0);
}

const parentOf = new Map();

for(const n of nodes.values())
{
    for(const child of (n.children ?? [])) parentOf.set(child, n.id);
}

const frameOf = (id) =>
{
    const f = nodes.get(id)?.callFrame ?? {};
    const file = String(f.url ?? '').split('/').pop() ?? '';

    return {
        name: f.functionName || '(anonymous)',
        // A frame with no source line is native (canvas, GC, the VM itself).
        native: (f.lineNumber ?? -1) < 0,
        label: `${f.functionName || '(anonymous)'}${file ? ` @${file}:${f.lineNumber}` : ''}`
    };
};

const selfTime = new Map();
const totalTime = new Map();
// For each native function, which application frame is responsible for calling it.
const nativeBlame = new Map();

let clock = 0;
let sampled = 0;

for(let i = 0; i < samples.length; i++)
{
    const d = Math.max(0, deltas[i] ?? 0);

    clock += d;

    // `clock` accumulates microsecond deltas; the flags are milliseconds, as a reader would expect.
    const atMs = ms(clock);

    if(atMs < from || atMs > to) continue;

    const id = samples[i];

    if(!nodes.has(id)) continue;

    sampled += d;

    const leaf = frameOf(id);

    selfTime.set(leaf.label, (selfTime.get(leaf.label) ?? 0) + d);

    // Walk to the root: every frame on the stack gets the sample as *total* time, counted once.
    const seen = new Set();
    let cursor = id;
    let blamed = null;

    while(cursor != null)
    {
        const f = frameOf(cursor);

        if(!seen.has(f.label))
        {
            seen.add(f.label);
            totalTime.set(f.label, (totalTime.get(f.label) ?? 0) + d);
        }

        // The first non-native frame above a native leaf is the code that asked for the work.
        if(leaf.native && blamed === null && !f.native && cursor !== id) blamed = f.label;

        cursor = parentOf.get(cursor);
    }

    if(leaf.native && blamed !== null)
    {
        const key = `${leaf.name}  <-  ${blamed}`;

        nativeBlame.set(key, (nativeBlame.get(key) ?? 0) + d);
    }
}

const window = (from === -Infinity && to === Infinity) ? 'whole trace' : `${from}ms..${to}ms`;

console.log(`\nCPU PROFILE (${window}) — ${ms(sampled).toFixed(0)}ms sampled`);

const table = (title, map, note) =>
{
    console.log(`\n${title}`);
    if(note) console.log(`  ${note}`);

    for(const [label, v] of [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, top))
    {
        console.log(`  ${pad(ms(v).toFixed(0) + 'ms', 8)} ${pad((v / sampled * 100).toFixed(1) + '%', 7)}  ${label.slice(0, 96)}`);
    }
};

table('SELF TIME — where cycles are spent', selfTime);
table(
    'NATIVE WORK BY CALLER — which of our functions asked for it',
    nativeBlame,
    'this is the attribution that guessing gets wrong; a native total says nothing about who caused it'
);
table('TOTAL TIME — cost of a function including everything it calls', totalTime);
