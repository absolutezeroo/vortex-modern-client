#!/usr/bin/env node
//
// GlowFilter's `quality` kernel, checked by running it.
//
//   node scripts/check-glow-kernel.mjs
//
// `quality` is Flash re-running the blur N times. The shader does it in one pass instead, by
// sampling the kernel of N folded boxes — so the whole of `quality` rests on `foldedBoxWeights()`
// producing the right numbers, and nothing on screen would say if it did not: a wrong kernel is
// still a plausible-looking blur, just the wrong width or the wrong brightness.
//
// Four properties pin it down. The kernel must SUM TO 1 (it is applied twice, once per axis, and
// the shader does no division — a kernel summing to 0.9 dims the glow by 19% and one summing to
// 1.1 blows it out). It must be SYMMETRIC (an asymmetric kernel shifts the halo off the shape).
// It must have `4q + 1` TAPS, which is what makes the folded kernel span the same distance as q
// successive box passes. And q = 1 must still be the plain 5-tap box, byte for byte, because nine
// of the port's ten call sites pass 1 and none of them should change.
//
// It lives in its own module for exactly this: `GlowFilter` extends a PixiJS `Filter` and cannot be
// constructed without a renderer, so the arithmetic had to come out to be checkable at all.

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
const ENGINE = join(ROOT, 'packages/vortex-engine/src');
// Forward slashes: this path is interpolated into a source string below, where a Windows backslash
// would be read as an escape.
const UTILS = `${ENGINE.replaceAll('\\', '/')}/core/utils`;

// esbuild is a dependency of vortex-client, not of the root, so resolve it from there.
const require = createRequire(join(ROOT, 'packages/vortex-client/package.json'));
const esbuild = require('esbuild');

let failures = 0;

function fail(message)
{
    failures++;
    console.error(`  FAIL  ${message}`);
}

function expect(actual, expected, what)
{
    if(actual === expected) return;

    fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

/** Floating-point sums never land exactly on 1. */
function expectClose(actual, expected, what, epsilon = 1e-9)
{
    if(Math.abs(actual - expected) <= epsilon) return;

    fail(`${what}: expected ${expected} +/- ${epsilon}, got ${actual}`);
}

const outDir = mkdtempSync(join(tmpdir(), 'vortex-glow-'));
const entry = join(outDir, 'entry.ts');

writeFileSync(entry, `export * from '${UTILS}/GlowKernel';\n`);

const bundle = join(outDir, 'bundle.mjs');

esbuild.buildSync({
    entryPoints: [entry],
    outfile: bundle,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent'
});

const { foldedBoxWeights, padGlowWeights, GLOW_MAX_QUALITY, GLOW_MAX_TAPS } =
    await import(pathToFileURL(bundle).href);

console.log('GlowFilter quality kernel\n');

// q = 1 is the plain box, unchanged: this is the regression guard for the nine call sites that
// pass 1 and never asked for anything else.
const one = foldedBoxWeights(1);

expect(one.length, 5, 'quality 1 tap count');

for(const weight of one) expectClose(weight, 0.2, 'quality 1 weight');

for(let quality = 1; quality <= GLOW_MAX_QUALITY; quality++)
{
    const weights = foldedBoxWeights(quality);

    expect(weights.length, 4 * quality + 1, `quality ${quality} tap count`);
    expectClose(weights.reduce((sum, weight) => sum + weight, 0), 1, `quality ${quality} sum`);

    for(let i = 0; i < weights.length; i++)
    {
        expectClose(weights[i], weights[weights.length - 1 - i], `quality ${quality} symmetry at ${i}`);
    }

    // Folding a box concentrates it: past the first fold the middle tap must outweigh the edge.
    if(quality > 1)
    {
        const middle = weights[(weights.length - 1) / 2];

        if(!(middle > weights[0])) fail(`quality ${quality}: middle tap ${middle} not above edge ${weights[0]}`);
    }
}

// Above the cap the kernel stops widening rather than overrunning the shader's fixed array.
expect(foldedBoxWeights(GLOW_MAX_QUALITY + 5).length, 4 * GLOW_MAX_QUALITY + 1, 'clamped tap count');
expect(foldedBoxWeights(0).length, 5, 'quality 0 clamps up to 1');
expect(foldedBoxWeights(-3).length, 5, 'negative quality clamps up to 1');

// The uniform is fixed-size; the tail past uTapCount must be zero, since the shader reads it only
// under that bound but a stray value would surface the moment the bound changed.
const padded = padGlowWeights(foldedBoxWeights(1));

expect(padded.length, GLOW_MAX_TAPS, 'padded length');

for(let i = 5; i < GLOW_MAX_TAPS; i++) expect(padded[i], 0, `padding at ${i}`);

if(failures > 0)
{
    console.error(`\n${failures} failure(s)`);
    process.exit(1);
}

console.log('  OK  kernel sums to 1, is symmetric, is 4q+1 taps, and quality 1 is still the plain box');
