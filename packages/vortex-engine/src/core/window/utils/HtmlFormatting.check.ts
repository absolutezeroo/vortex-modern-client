/**
 * Runnable check for the markup parser: `npx tsx <this file>`.
 *
 * Two things are worth pinning here, and neither is visible from the screen when it breaks.
 *
 * The stripping: an unrecognised tag has to leave, not print. An `<a href="...">` that survives
 * the parser reads as literal markup in the middle of a sentence, which is what the group-forum
 * shortcut row showed.
 *
 * The ranges: the runs are index ranges over the *stripped* string, and both the text measurement
 * and the renderer index into them per character. A run one character wide of where it belongs
 * measures and paints the wrong glyphs, silently.
 *
 * It has already earned its keep — `#7adde9` came back as `#77aadd`, because the colour pattern
 * listed its three-digit shorthand branch before the six-digit one and matched the first three
 * characters. Nothing downstream would have named that.
 *
 * Every case below is a real string out of gamedata/external_flash_texts.json, or the shape of one.
 */
import assert from 'node:assert/strict';

import {parseHtmlFormatting} from './HtmlFormatting';

type CheckedRun = { start: number; end: number; format: object };

// Formats are compared key-sorted: which tag set a key is not part of the contract, only the value.
function normalize(runs: ReadonlyArray<CheckedRun>): string
{
    return JSON.stringify(runs.map((run) =>
        ({start: run.start, end: run.end, format: Object.fromEntries(Object.entries(run.format).sort())})));
}

function check(label: string, html: string, text: string, runs: CheckedRun[]): void
{
    const parsed = parseHtmlFormatting(html);

    assert.equal(parsed.text, text, `${label}: text`);
    assert.equal(normalize(parsed.runs), normalize(runs), `${label}: runs`);
}

check('unknown tag stripped, not shown', '<a href="event:groupforum/list/my">My Forums</a>', 'My Forums', []);
check('single-quoted attributes', "<a href='event:catalog/open/club_buy'>click here.</a>", 'click here.', []);
check('whole string bold', '<b>%username%</b>', '%username%', [{start: 0, end: 10, format: {bold: true}}]);
check('two disjoint runs', '<b>a</b> x <b>b</b>', 'a x b',
    [{start: 0, end: 1, format: {bold: true}}, {start: 4, end: 5, format: {bold: true}}]);
check('font nested inside bold', 'Reward: <b><font size="30" color="#7adde9">50</font></b> pts', 'Reward: 50 pts',
    [{start: 8, end: 10, format: {bold: true, size: 30, color: 0x7ADDE9}}]);
check('bold nested inside font splits the run', '<font color="#C42F3D"><b>Usage warning:</b> All users</font>',
    'Usage warning: All users',
    [{start: 0, end: 14, format: {color: 0xC42F3D, bold: true}}, {start: 14, end: 24, format: {color: 0xC42F3D}}]);
check('three-digit colour shorthand', '<font color="#fff">x</font>', 'x', [{start: 0, end: 1, format: {color: 0xFFFFFF}}]);
check('br becomes a newline', 'a<br>b', 'a\nb', []);
check('no markup at all', 'plain text', 'plain text', []);

// eslint-disable-next-line no-console -- this file is a standalone check, run by hand
console.log('ok — markup parser');
