#!/usr/bin/env node
/**
 * Does `STACK_LIFT` still clear the layer offsets of the furni people actually stack things on?
 *
 * `RoomRenderingCanvas.renderObject()` pulls an object resting on furniture forward by
 * `STACK_LIFT * (z - floorHeight)` so it outranks the layers of whatever holds it up. That is a
 * DEVIATION with a numeric ceiling, and the ceiling is set by the asset pack, not by the code: a
 * support whose most-forward layer sits deeper than `STACK_LIFT * stackHeight` still draws over
 * what rests on it. `hc_exe_table` needs 2.127 and the constant was 2.0, which is how the bug came
 * back on exactly one of its nine layers.
 *
 * So this reads the furni pack and reports what the current constant covers. It is a measurement,
 * not a pass/fail on every furni — full coverage is impossible with one scalar (see the DEVIATION
 * comment). It fails only on the pair that has already regressed twice.
 *
 *   node scripts/check-stack-depth.mjs [path to dcr/hof_furni]
 */

import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateSync, inflateRawSync, gunzipSync} from 'node:zlib';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FURNI_DIR = process.argv[2] ?? 'C:/Laragon/www/vortex-assets/dcr/hof_furni';

// Both mirror the engine. Z_MULTIPLIER is FurnitureVisualization's; the /-1000 is SizeData's, which
// is what makes a positive `z` in the furni JSON a *forward* offset.
const Z_MULTIPLIER = Math.sqrt(0.5);
const Z_SCALE = -1000;

// The engine owns the two numbers; reading them back keeps this check honest when they change.
const canvas = readFileSync(join(ROOT, 'packages/vortex-engine/src/habbo/room/renderer/RoomRenderingCanvas.ts'), 'utf8');
const read = name =>
{
    const match = canvas.match(new RegExp(`${name}\\s*:\\s*number\\s*=\\s*([\\d.]+)`));

    if(!match) throw new Error(`${name} is gone from RoomRenderingCanvas.ts — this check is stale`);

    return Number(match[1]);
};

const STACK_LIFT = read('STACK_LIFT');
const STACK_EPSILON = read('STACK_EPSILON');

/** The furni's `.json`, out of the Nitro bundle: uncompressed index, per-file deflate. */
const readBundleJson = path =>
{
    const buf = readFileSync(path);
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let offset = 0;
    const count = dv.getUint16(offset); offset += 2;

    for(let i = 0; i < count; i++)
    {
        const nameLength = dv.getUint16(offset); offset += 2;
        const name = buf.subarray(offset, offset + nameLength).toString(); offset += nameLength;
        const length = dv.getUint32(offset); offset += 4;
        const data = buf.subarray(offset, offset + length); offset += length;

        if(!name.endsWith('.json')) continue;

        for(const inflate of [inflateSync, inflateRawSync, gunzipSync])
        {
            try { return JSON.parse(inflate(data).toString()); } catch { /* next encoding */ }
        }
    }

    return null;
};

/** The most-forward (most negative) `relativeDepth` any of the furni's layers takes, in any direction. */
const mostForwardLayer = json =>
{
    let worst = 0;

    for(const visualization of json.visualizations ?? [])
    {
        if(visualization.size !== 64) continue;

        const base = visualization.layers ?? {};

        for(const direction of Object.values(visualization.directions ?? {'0': {}}))
        {
            const layers = {...base};

            for(const [id, layer] of Object.entries(direction.layers ?? {})) layers[id] = {...layers[id], ...layer};

            for(const [id, layer] of Object.entries(layers))
            {
                // FurnitureVisualization.updateSprites(): zOffset -= layerIndex * 0.001, then * Z_MULTIPLIER.
                const depth = ((layer.z ?? 0) / Z_SCALE - Number(id) * 0.001) * Z_MULTIPLIER;

                if(depth < worst) worst = depth;
            }
        }
    }

    return worst;
};

if(!existsSync(FURNI_DIR))
{
    console.log(`[skip] no furni pack at ${FURNI_DIR} — pass its path as the first argument`);
    process.exit(0);
}

const supports = [];

for(const file of readdirSync(FURNI_DIR))
{
    if(!file.endsWith('.nitro')) continue;

    let json;

    try { json = readBundleJson(join(FURNI_DIR, file)); } catch { continue; }

    const height = json?.logic?.model?.dimensions?.z;

    // Below the epsilon nothing ever reads as stacked on it, so its layers cannot be beaten by
    // anything and the ratio would be meaningless (the pack is full of height 0.000001 scenery).
    if(!(height > STACK_EPSILON)) continue;

    const forward = mostForwardLayer(json);

    if(forward < 0) supports.push({name: file.replace('.nitro', ''), forward, height, needs: -forward / height});
}

supports.sort((a, b) => b.needs - a.needs);

const covered = supports.filter(support => support.needs <= STACK_LIFT).length;

console.log(`STACK_LIFT = ${STACK_LIFT} over ${supports.length} stackable supports in ${FURNI_DIR}`);
console.log(`  covered: ${covered} (${((covered / supports.length) * 100).toFixed(1)}%)`);
console.log('  deepest still uncovered:');

for(const support of supports.filter(s => s.needs > STACK_LIFT).slice(0, 8))
{
    console.log(`    needs ${support.needs.toFixed(3)}  ${support.name} (forward ${support.forward.toFixed(3)}, height ${support.height})`);
}

// The pair that regressed twice — 06751d42 fixed it, cf04acdb dropped the lift, and the constant
// then had to grow past 2.127 to cover the ninth layer. Anything that lowers STACK_LIFT below that
// puts `classic3_floor2` back underneath the table it is standing on.
const REGRESSED = 'hc_exe_table';
const table = supports.find(support => support.name === REGRESSED);

if(!table)
{
    console.log(`\n[skip] ${REGRESSED} is not in this pack — cannot assert the regression case`);
    process.exit(0);
}

if(table.needs > STACK_LIFT)
{
    console.error(`\n[fail] ${REGRESSED} needs ${table.needs.toFixed(3)} and STACK_LIFT is ${STACK_LIFT} — a floor furni on it will sink back into its top layer`);
    process.exit(1);
}

console.log(`\n[ok] ${REGRESSED} needs ${table.needs.toFixed(3)}, covered by ${STACK_LIFT}`);
