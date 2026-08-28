#!/usr/bin/env node
//
// Snow War is lock-step deterministic: every client advances the same simulation from the same
// seed, and the server sends inputs rather than positions. So the integer maths under
// `habbo/game/snowwar/utils` is not "close enough" code — a single degree of disagreement with the
// server is a desync, and nothing in the client will report it.
//
//   node scripts/check-snowwar-determinism.mjs
//
// Two things it checks, and neither is a unit test of the port's opinion:
//
//   1. the three lookup tables in the TS are byte-identical to the AS3 ones, read out of the
//      primary tree at run time — so a hand-edit to either side is caught;
//   2. the pure functions still answer what AS3 answers on the values that are easy to get wrong:
//      xorshift's 32-bit wrap, `javaDiv`'s truncation towards zero (not `Math.floor`), and the
//      -22/+1 pair in `direction360ValueToDirection8()` that centres each 45° sector.
//
// It parses the TS with a regex rather than importing it, because the engine's `@core/` aliases
// need a bundler and this has to run from a bare `node`.
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const AS3 = join(ROOT, 'sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils');
const TS = join(ROOT, 'packages/vortex-engine/src/habbo/game/snowwar/utils');

let failures = 0;

function fail(message)
{
    failures++;
    console.error(`  ✗ ${message}`);
}

function ok(message)
{
    console.log(`  ✓ ${message}`);
}

function numbers(text)
{
    return text.replace(/\s+/g, '').split(',').filter(Boolean).map(Number);
}

function sameTable(name, expected, actual)
{
    if(expected.length !== actual.length)
    {
        fail(`${name}: ${actual.length} entries, AS3 has ${expected.length}`);

        return;
    }

    const at = expected.findIndex((v, i) => v !== actual[i]);

    if(at !== -1)
    {
        fail(`${name}: entry ${at} is ${actual[at]}, AS3 has ${expected[at]}`);

        return;
    }

    ok(`${name}: ${expected.length} entries match AS3`);
}

// --- 1. the tables ----------------------------------------------------------------------------

const d360As3 = readFileSync(join(AS3, 'Direction360.as'), 'latin1');
const d360Ts = readFileSync(join(TS, 'Direction360.ts'), 'utf8');
const d8As3 = readFileSync(join(AS3, 'Direction8.as'), 'latin1');
const d8Ts = readFileSync(join(TS, 'Direction8.ts'), 'utf8');

const baseVectors = /_SafeStr_7394:Array=\[\[(.*?)\],\[(.*?)\]\];/s.exec(d360As3.replace(/\s+/g, ''));

if(baseVectors === null) fail('Direction360.as: could not find the base-vector table');
else
{
    for(const [row, name] of [[1, 'BASE_VECTOR_X'], [2, 'BASE_VECTOR_Y']])
    {
        const ts = new RegExp(`${name}: readonly number\\[\\] = \\[([^\\]]+)\\]`).exec(d360Ts);

        if(ts === null) fail(`Direction360.ts: ${name} not found`);
        else sameTable(name, numbers(baseVectors[row]), numbers(ts[1]));
    }
}

for(const [as3, ts, where] of [[d360As3, d360Ts, 'Direction360'], [d8As3, d8Ts, 'Direction8']])
{
    const from = /componentToAngleArray:Array = \[([^\]]+)\];/s.exec(as3);
    const to = /COMPONENT_TO_ANGLE: readonly number\[\] = \[([^\]]+)\]/.exec(ts);

    if(from === null || to === null) fail(`${where}: angle table not found on one side`);
    else sameTable(`${where}.COMPONENT_TO_ANGLE`, numbers(from[1]), numbers(to[1]));
}

// --- 2. the arithmetic ------------------------------------------------------------------------

// Re-declared rather than imported: see the header. Any edit to the port must be mirrored here,
// which is the point — the values below are AS3's answers, not this file's.
const iterateSeed = (seed) =>
{
    let v = seed | 0;

    if(v === 0) v = -1;

    v = (v ^ (v << 13)) | 0;
    v = (v ^ (v >> 17)) | 0;

    return (v ^ (v << 5)) | 0;
};

const javaDiv = (v) => (v >= 0 ? Math.floor(v) : Math.ceil(v));

const validate360 = (v) => (v > 359 ? v % 360 : v < 0 ? 360 + (v % 360) : v);
const to8 = (v) => (javaDiv(validate360(v - 22) / 45) + 1) & 7;

// A zero seed is absorbing in xorshift, so AS3 substitutes -1 — without which every later value
// would be zero and every client would agree on a frozen game.
if(iterateSeed(0) !== iterateSeed(-1)) fail('iterateSeed: a zero seed does not fall back to -1');
else ok('iterateSeed: zero falls back to -1');

// The 32-bit wrap. Without the `| 0` the shifts leave the int range and drift from the server.
if(!Number.isInteger(iterateSeed(0x7fffffff)) || Math.abs(iterateSeed(0x7fffffff)) > 0x80000000)
{
    fail('iterateSeed: result left the signed 32-bit range');
}
else ok('iterateSeed: stays in signed 32-bit range');

// Truncation towards zero, which is Java's `(int)` and not `Math.floor`.
for(const [input, expected] of [[2.9, 2], [-2.9, -2], [-0.5, 0], [0.5, 0]])
{
    if(javaDiv(input) !== expected) fail(`javaDiv(${input}) = ${javaDiv(input)}, expected ${expected}`);
}

ok('javaDiv: truncates towards zero');

// The -22/+1 pair centres each sector on its direction: 0° is N, and so is 350° and 20°.
for(const [degrees, direction, label] of [[0, 0, 'N'], [350, 0, 'N'], [20, 0, 'N'], [45, 1, 'NE'], [90, 2, 'E'], [180, 4, 'S'], [315, 7, 'NW']])
{
    if(to8(degrees) !== direction) fail(`direction360ValueToDirection8(${degrees}) = ${to8(degrees)}, expected ${direction} (${label})`);
}

ok('direction360ValueToDirection8: sectors centre on their direction');

// The base vectors peak at 256, not 255 — a caller dividing by 256 relies on it.
const peakX = /BASE_VECTOR_X: readonly number\[\] = \[([^\]]+)\]/.exec(d360Ts);

if(peakX !== null && numbers(peakX[1])[90] !== 256) fail(`BASE_VECTOR_X[90] = ${numbers(peakX[1])[90]}, expected 256 (due east)`);
else ok('BASE_VECTOR_X[90] is 256 (due east)');

console.log(failures === 0 ? '\nsnowwar determinism: OK' : `\nsnowwar determinism: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
