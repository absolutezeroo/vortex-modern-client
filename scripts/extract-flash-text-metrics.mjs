#!/usr/bin/env node
/**
 * Recovers Flash's own text line metrics from the shipped window layouts.
 *
 * The port measures a line with `fontBoundingBoxAscent + fontBoundingBoxDescent`,
 * which is the whole font face's box as the browser reads it — Ubuntu's is
 * notoriously tall — and it is not the number Flash used. Flash's is not in any
 * source file either: it lived inside the player.
 *
 * But it is in the layouts. Every `<text>` in `window-layouts/` was authored in
 * the Flash IDE, where a single-line field auto-sizes to the player's own line
 * height, so its `height` attribute IS that metric plus the field's 2px top and
 * bottom gutters. Across 806 layouts the agreement is overwhelming — 180 of the
 * 200 single-line fields at font size 11 are exactly 16px tall — which is what
 * makes this a measurement rather than a guess.
 *
 * Usage:
 *   node scripts/extract-flash-text-metrics.mjs            # print the table
 *   node scripts/extract-flash-text-metrics.mjs --write    # regenerate the TS table
 *
 * The layouts are gitignored build output, so this is run on demand, not in CI.
 */

import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const LAYOUT_DIR = 'packages/vortex-client/src/assets/window-layouts';
const OUT_FILE = 'packages/vortex-engine/src/core/window/utils/FlashTextMetrics.ts';

/** A flash.text.TextField reserves 2px above and 2px below its text. */
const GUTTER = 2;

/** Below these a majority is chance, not evidence. */
const MIN_SAMPLES = 10;
const MIN_SHARE = 0.6;

// ---------------------------------------------------------------------------

/** Attributes of one XML tag, without pulling in a parser. */
function parseAttributes(tag)
{
    const attributes = {};

    for(const match of tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g))
    {
        attributes[match[1]] = match[2];
    }

    return attributes;
}

/**
 * Every `<text>`/`<label>` element with the `<variables>` block that follows it.
 *
 * A regex walk rather than a DOM parse: only the element's own attributes and
 * the variables immediately inside it matter, and a self-closing element simply
 * has none.
 */
function* readTextElements(xml)
{
    for(const match of xml.matchAll(/<(text|label)\b([^>]*?)(\/?)>/g))
    {
        const [full, tag, attributeText, selfClosing] = match;
        const attributes = parseAttributes(attributeText);
        const variables = {};

        if(!selfClosing)
        {
            // Only the variables block that opens this element counts; anything
            // after the first nested child belongs to a descendant.
            const rest = xml.slice(match.index + full.length);
            const block = /^\s*<children>/.test(rest) ? null : rest.match(/^\s*<variables>([\s\S]*?)<\/variables>/);

            if(block)
            {
                for(const entry of block[1].matchAll(/<var\b([^>]*?)\/?>/g))
                {
                    const {key, value} = parseAttributes(entry[1]);

                    if(key !== undefined && value !== undefined) variables[key] = value;
                }
            }
        }

        yield {tag, attributes, variables};
    }
}

function collect()
{
    const bySize = new Map();
    let files = 0;
    let considered = 0;

    for(const name of readdirSync(LAYOUT_DIR))
    {
        if(!name.endsWith('.xml')) continue;

        files++;

        const xml = readFileSync(join(LAYOUT_DIR, name), 'utf8');

        for(const {attributes, variables} of readTextElements(xml))
        {
            // Multi-line fields measure several lines into one height, and an
            // explicit leading moves the number off the font's own metric.
            if(variables.word_wrap === 'true' || variables.multiline === 'true') continue;
            if(variables.leading !== undefined && variables.leading !== '0') continue;

            const size = Number(variables.font_size);
            const height = Number(attributes.height);

            if(!Number.isInteger(size) || !Number.isInteger(height) || size <= 0 || height <= 0) continue;

            considered++;

            let heights = bySize.get(size);

            if(!heights) bySize.set(size, (heights = new Map()));

            heights.set(height, (heights.get(height) ?? 0) + 1);
        }
    }

    return {bySize, files, considered};
}

function summarise(bySize)
{
    const rows = [];

    for(const size of [...bySize.keys()].sort((a, b) => a - b))
    {
        const heights = bySize.get(size);
        const total = [...heights.values()].reduce((sum, n) => sum + n, 0);
        const [height, count] = [...heights].sort((a, b) => b[1] - a[1])[0];
        const share = count / total;

        rows.push({
            size,
            height,
            lineBox: height - 2 * GUTTER,
            count,
            total,
            share,
            confident: total >= MIN_SAMPLES && share >= MIN_SHARE,
        });
    }

    return rows;
}

function renderTable(rows)
{
    const confident = rows.filter(row => row.confident);
    const entries = confident.map(row => `    [${row.size}, ${row.lineBox}],`).join('\n');

    return `// GENERATED by scripts/extract-flash-text-metrics.mjs — do not edit by hand.
//
// Flash's own single-line text metrics, recovered from the authored heights in
// the shipped window layouts. Each entry is a font size mapped to the line box
// Flash used for it, with the field's 2px top and bottom gutters removed.
//
// Only sizes where the layouts agree are listed: at least ${MIN_SAMPLES} single-line
// fields, at least ${Math.round(MIN_SHARE * 100)}% of them on the same height. Everything else falls back to
// measuring the font in the browser, which is what the whole port did before.
//
// TS-only: Flash's metrics lived inside the player; no AS3 source states them.

/** A flash.text.TextField reserves this much above AND below its text. */
export const FLASH_TEXT_GUTTER = ${GUTTER};

/** font size -> the line box Flash advanced by, gutters excluded. */
export const FLASH_LINE_BOX: ReadonlyMap<number, number> = new Map([
${entries}
]);

/**
 * Flash's line box for a size, or null when the layouts had nothing confident
 * to say about it.
 */
export function flashLineBox(fontSize: number): number | null
{
    return FLASH_LINE_BOX.get(Math.round(fontSize)) ?? null;
}
`;
}

// ---------------------------------------------------------------------------

const {bySize, files, considered} = collect();
const rows = summarise(bySize);

console.log(`${files} layout files, ${considered} single-line fields with an explicit size\n`);
console.log('size  height  lineBox  agreement');

for(const row of rows)
{
    const flag = row.confident ? ' ' : '  (too thin, not encoded)';

    console.log(
        `${String(row.size).padStart(4)}  ${String(row.height).padStart(6)}  ${String(row.lineBox).padStart(7)}`
        + `  ${row.count}/${row.total} (${Math.round(row.share * 100)}%)${flag}`);
}

const confident = rows.filter(row => row.confident);

console.log(`\n${confident.length} of ${rows.length} sizes confident enough to encode.`);

if(process.argv.includes('--write'))
{
    writeFileSync(OUT_FILE, renderTable(rows), 'utf8');
    console.log(`wrote ${OUT_FILE}`);
}
else
{
    console.log('re-run with --write to regenerate the TS table.');
}
