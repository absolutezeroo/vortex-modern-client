#!/usr/bin/env node
//
// The inventory grid's filter predicates, checked by running them.
//
//   node scripts/check-furni-filters.mjs
//
// Twenty predicates decide what the furni grid shows, and a wrong one is invisible: the grid still
// renders, still paginates, still searches — it just quietly omits or includes a category, and the
// player reads that as "my furniture is missing". Nothing throws and nothing logs.
//
// `isTilesOrRugs` is the one worth the harness on its own. It is six clauses deep and every one of
// them exists to rule out a specific impostor: `tile_walkmagic*` and `hole` are excluded by name
// even though they pass every other test, a declared `rug`/`floor` category short-circuits the
// shape test entirely, and the fallback demands low AND walkable AND at least two tiles on each
// side — a one-tile flat item is a plate, not a rug. Drop any one clause and the filter still
// looks plausible.
//
// The rest are checked for the trap they share: a group with no furniture data must answer false,
// not throw and not default to true. `isNonTradable` is deliberately NOT `!isTradable` for exactly
// that reason, and this pins the difference.
//
// The predicates take `GroupItem`s, but only ever read `furniData`, `className`, `category`,
// `isNft()` and `peek()` — so plain objects with those five stand in, which is what keeps this a
// check and not an integration test.

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
const ENGINE = join(ROOT, 'packages/vortex-engine/src');
// Forward slashes: this path is interpolated into a source string below, where a Windows backslash
// would be read as an escape.
const FURNI = `${ENGINE.replaceAll('\\', '/')}/habbo/inventory/furni`;

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

    fail(`${what}: expected ${expected}, got ${actual}`);
}

const outDir = mkdtempSync(join(tmpdir(), 'vortex-furni-'));
const entry = join(outDir, 'entry.ts');

writeFileSync(entry, `export * from '${FURNI}/FurniGridFilters';\n`);

const bundle = join(outDir, 'bundle.mjs');

esbuild.buildSync({
    entryPoints: [entry],
    outfile: bundle,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent'
});

const { FurniGridFilters } = await import(pathToFileURL(bundle).href);

/** A group whose furniture data says whatever the test needs; everything else is a sane default. */
function group(furniData = null, extra = {})
{
    return {
        furniData,
        className: furniData?.className ?? '',
        category: 1,
        isNft: () => false,
        peek: () => null,
        ...extra
    };
}

/** Furniture data with the fields the shape test reads, defaulted to "a plausible rug". */
function data(overrides = {})
{
    return {
        className: 'rug_something',
        furniDataCategory: '',
        furniLine: '',
        canSitOn: false,
        canLayOn: false,
        canPutStuffOn: true,
        canStandOn: true,
        height: 0.1,
        tileSizeX: 2,
        tileSizeY: 2,
        tradeable: true,
        ...overrides
    };
}

console.log('Furni grid filter predicates\n');

// --- isTilesOrRugs, clause by clause -----------------------------------------------------------

expect(FurniGridFilters.isTilesOrRugs(group(data())), true, 'a low, walkable, 2x2 item is a rug');

expect(FurniGridFilters.isTilesOrRugs(group(data({className: 'tile_walkmagic_1'}))), false,
    'tile_walkmagic is excluded by name despite passing the shape test');
expect(FurniGridFilters.isTilesOrRugs(group(data({className: 'hole'}))), false,
    'hole is excluded by name');
expect(FurniGridFilters.isTilesOrRugs(group(data({canPutStuffOn: false}))), false,
    'nothing can be placed on it, so it is not a floor surface');

// The two short-circuits: a declared category wins over the shape test, so a tall one-tile rug
// still counts if the data says `rug`.
expect(FurniGridFilters.isTilesOrRugs(group(data({furniDataCategory: 'rug', height: 5, tileSizeX: 1, tileSizeY: 1}))),
    true, 'a declared rug category short-circuits the shape test');
expect(FurniGridFilters.isTilesOrRugs(group(data({furniDataCategory: 'floor', height: 5}))), true,
    'a declared floor category short-circuits it too');
expect(FurniGridFilters.isTilesOrRugs(group(data({className: 'carpet_x', height: 5, tileSizeX: 1}))), true,
    'a carpet class name short-circuits it');

// The fallback needs all four.
expect(FurniGridFilters.isTilesOrRugs(group(data({height: 0.5}))), false, 'too tall');
expect(FurniGridFilters.isTilesOrRugs(group(data({canStandOn: false}))), false, 'cannot be stood on');
expect(FurniGridFilters.isTilesOrRugs(group(data({tileSizeX: 1}))), false, 'one tile wide is a plate');
expect(FurniGridFilters.isTilesOrRugs(group(data({tileSizeY: 1}))), false, 'one tile deep is a plate');
// 0.2 is the boundary and the test is `> 0.2`, so exactly 0.2 still passes.
expect(FurniGridFilters.isTilesOrRugs(group(data({height: 0.2}))), true, 'exactly 0.2 high is still a rug');

// --- tradable is not the negation of non-tradable -----------------------------------------------

expect(FurniGridFilters.isTradable(group(data({tradeable: true}))), true, 'tradable');
expect(FurniGridFilters.isNonTradable(group(data({tradeable: true}))), false, 'not non-tradable');
expect(FurniGridFilters.isTradable(group(data({tradeable: false}))), false, 'not tradable');
expect(FurniGridFilters.isNonTradable(group(data({tradeable: false}))), true, 'non-tradable');
// The whole point: no data means neither, not "non-tradable by default".
expect(FurniGridFilters.isTradable(group(null)), false, 'no data is not tradable');
expect(FurniGridFilters.isNonTradable(group(null)), false, 'no data is not non-tradable either');

// --- every predicate survives a null group and a group with no data ------------------------------

const predicates = Object.getOwnPropertyNames(FurniGridFilters)
    .filter(name => name.startsWith('is') && typeof FurniGridFilters[name] === 'function');

if(predicates.length < 18) fail(`expected the full predicate set, found ${predicates.length}`);

for(const name of predicates)
{
    for(const [label, value] of [['null', null], ['no furniData', group(null)]])
    {
        try
        {
            expect(FurniGridFilters[name](value), false, `${name}(${label})`);
        }
        catch(error)
        {
            fail(`${name}(${label}) threw: ${error.message}`);
        }
    }
}

// --- the category predicates read the group's category, not its data ----------------------------

expect(FurniGridFilters.isRoomLayout(group(null, {category: 2})), true, 'wallpaper is room layout');
expect(FurniGridFilters.isRoomLayout(group(null, {category: 3})), true, 'floor is room layout');
expect(FurniGridFilters.isRoomLayout(group(null, {category: 4})), true, 'landscape is room layout');
expect(FurniGridFilters.isRoomLayout(group(null, {category: 5})), false, 'a post-it is not');
expect(FurniGridFilters.isStickie(group(null, {category: 5})), true, 'a post-it is a stickie');
expect(FurniGridFilters.isClothes(group(null, {category: 23})), true, 'category 23 is clothes');

// --- the item-level predicates read peek(), not the data ----------------------------------------

expect(FurniGridFilters.isLtd(group(data(), {peek: () => ({stuffData: {uniqueSerialNumber: 7}})})), true,
    'a serial number makes it LTD');
expect(FurniGridFilters.isLtd(group(data(), {peek: () => ({stuffData: {uniqueSerialNumber: 0}})})), false,
    'serial 0 does not');
expect(FurniGridFilters.isRecyclable(group(data(), {peek: () => ({recyclable: true})})), true, 'recyclable');

if(failures > 0)
{
    console.error(`\n${failures} failure(s)`);
    process.exit(1);
}

console.log(`  OK  ${predicates.length} predicates, all null-safe; isTilesOrRugs holds clause by clause`);
