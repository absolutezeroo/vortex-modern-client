#!/usr/bin/env node
//
// The fishing definitions wire format and the live-reload path, checked by running them.
//
//   node scripts/check-fishing.mjs
//
// Two things are guarded here, and neither is a unit test of somebody's opinion.
//
// The wire format: the definitions arrive as one packet of three nested, count-prefixed tables.
// There is no framing inside it, so a field read in the wrong order does not fail — it shifts
// everything after it and the client ends up holding plausible nonsense. The fake wrapper's slots
// are typed, so a read that lands on the wrong one fails at the field that drifted rather than two
// tables later.
//
// The reload path: `FishingDefinitions` is a push target, not a cache. The whole reason the tables
// travel as a packet is that an operator editing a catch rate must reach a player already standing
// at a pond. So `apply()` has to replace and announce on a newer version, and ignore a redundant
// re-push — a server that re-broadcasts on reconnect must not make every open panel rebuild.
//
// See docs/vortex-original/fishing.md, sections 3 and 6.
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
const ENGINE = join(ROOT, 'packages/vortex-engine/src');
// Forward slashes: these paths are interpolated into a source string, where a Windows backslash
// would be read as an escape.
const SRC = ENGINE.replaceAll('\\', '/');

// esbuild is a dependency of vortex-client, not of the root, so resolve it from there.
const require = createRequire(join(ROOT, 'packages/vortex-client/package.json'));
const esbuild = require('esbuild');

let failures = 0;

function fail(message)
{
    failures++;
    console.error(`  FAIL  ${message}`);
}

function eq(actual, expected, what)
{
    if(actual !== expected) fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

/**
 * A stand-in for IMessageDataWrapper over a list of typed slots. Reading an int where a string was
 * written (or running off the end) throws, which is how a field read out of order is caught at the
 * exact field that drifted.
 */
function makeWrapper(slots)
{
    let cursor = 0;

    const take = (kind) =>
    {
        if(cursor >= slots.length) throw new Error(`read past end of stream at slot ${cursor}`);

        const value = slots[cursor];
        const actual = typeof value === 'string' ? 'string' : 'number';

        if(actual !== kind) throw new Error(`read${kind === 'number' ? 'Int' : 'String'}() at slot ${cursor} found a ${actual} (${JSON.stringify(value)})`);

        cursor++;

        return value;
    };

    return {
        get bytesAvailable() { return slots.length - cursor; },
        readInt: () => take('number'),
        readShort: () => take('number'),
        readByte: () => take('number'),
        readLong: () => take('number'),
        readFloat: () => take('number'),
        readDouble: () => take('number'),
        readString: () => take('string'),
        readBoolean: () => take('number') !== 0,
    };
}

const PARSERS = [
    'VortexFishingDefinitionsMessageParser',
    'VortexFishingPlayerStateMessageParser',
    'VortexFishSightedMessageParser',
    'VortexFishingCatchResultMessageParser',
    'VortexFishingSpotDepletedMessageParser',
    'VortexFishingDerbyStandingMessageParser',
    'VortexFishingRecordsMessageParser',
];

const COMPOSERS = [
    'VortexStartFishingComposer',
    'VortexFishingMountCatchComposer',
    'VortexFishingJoinDerbyComposer',
];

const ENTRY = [
    ...PARSERS.map((name) => `export { ${name} } from '${SRC}/habbo/communication/messages/parser/vortex/${name}';`),
    ...COMPOSERS.map((name) => `export { ${name} } from '${SRC}/habbo/communication/messages/outgoing/vortex/${name}';`),
    `export { VortexFishingErrorMessageParser, FishingErrorCode } from '${SRC}/habbo/communication/messages/parser/vortex/VortexFishingErrorMessageParser';`,
    `export { FishingDefinitions, FISHING_DEFINITIONS_CHANGED } from '${SRC}/habbo/vortex/fishing/FishingDefinitions';`,
    `export { HookHavocGame, HOOK_HAVOC_TICK_MS, HOOK_HAVOC_FULL_BAR, HOOK_HAVOC_LEFT, HOOK_HAVOC_RIGHT } from '${SRC}/habbo/vortex/fishing/HookHavocGame';`,
].join('\n');

const built = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: ROOT, sourcefile: 'check-fishing-entry.ts', loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    alias: {
        '@core': join(ENGINE, 'core'),
        '@habbo': join(ENGINE, 'habbo'),
        '@room': join(ENGINE, 'room'),
        '@iid': join(ENGINE, 'iid'),
    },
});

const bundlePath = join(mkdtempSync(join(tmpdir(), 'fishing-')), 'bundle.mjs');
writeFileSync(bundlePath, built.outputFiles[0].text);

const {
    VortexFishingDefinitionsMessageParser, VortexFishingPlayerStateMessageParser,
    VortexFishSightedMessageParser, VortexFishingCatchResultMessageParser,
    VortexFishingSpotDepletedMessageParser, VortexFishingDerbyStandingMessageParser,
    VortexFishingRecordsMessageParser,
    VortexFishingErrorMessageParser, FishingErrorCode,
    VortexStartFishingComposer, VortexFishingMountCatchComposer, VortexFishingJoinDerbyComposer,
    FishingDefinitions, FISHING_DEFINITIONS_CHANGED,
    HookHavocGame, HOOK_HAVOC_TICK_MS, HOOK_HAVOC_FULL_BAR, HOOK_HAVOC_LEFT, HOOK_HAVOC_RIGHT,
} = await import(pathToFileURL(bundlePath).href);

// --- the wire format ---------------------------------------------------------------------------
const ALL_HOURS = 0xFFFFFF;   // 24 bits
const ALL_DAYS = 0b1111111;
const NIGHT = 0b111 << 22 | 0b11;   // 22:00-01:00 UTC, wrapping past midnight
const WEEKENDS = 0b1000001;   // Sunday (bit 0) and Saturday (bit 6)
const ALL_SEASONS = 0b1111;
const WINTER = 0b1000;

const slots = [
    7,                                                        // version

    2,                                                        // species count
    // id, nameKey, zone, level, stars, catchRate, rarity, minW, maxW, xp, goldenXp, currency,
    // hours, weekdays
    100, 'fishing.species.minnow', 1, 1, 1, 850, 900, 10, 40, 11, 55, 5, ALL_HOURS, ALL_DAYS, ALL_SEASONS,
    101, 'fishing.species.shark', 3, 70, 5, 250, 3, 800, 4000, 785, 3925, 75, NIGHT, WEEKENDS, WINTER,

    3,                                                        // rod quality tiers — deliberately unsorted
    // quality, xpThreshold, nameKey, handItemId, catchMultiplier, goldenMultiplier, hookHavocChance
    3, 21512, 'fishing.rod.tier3', 2002, 1200, 1150, 90,
    1, 0, 'fishing.rod.tier1', 2000, 1000, 1000, 30,
    2, 5000, 'fishing.rod.tier2', 2001, 1100, 1080, 60,

    3,                                                        // fishing levels — the OTHER curve
    1, 0,
    30, 21512,
    70, 900000,

    2,                                                        // zone count
    // id, nameKey, furniClass, requiredLevel, minCatches, maxCatches
    1, 'fishing.zone.park', 'vtx_spot_park', 0, 1, 5,
    3, 'fishing.zone.pier', 'vtx_spot_pier', 70, 2, 8,
];

const wrapper = makeWrapper(slots);
const parser = new VortexFishingDefinitionsMessageParser();

eq(parser.parse(wrapper), true, 'the parser accepts a well-formed payload');
eq(wrapper.bytesAvailable, 0, 'and consumes the whole stream');

eq(parser.version, 7, 'version');
eq(parser.species.length, 2, 'species count');
eq(parser.rodLevels.length, 3, 'rod quality tier count');
eq(parser.fishingLevels.length, 3, 'fishing level count - a separate curve from the rod');
eq(parser.zones.length, 2, 'zone count');

const [minnow, shark] = parser.species;

eq(minnow.nameKey, 'fishing.species.minnow', 'species name key');
eq(minnow.catchRate, 850, 'a common species is caught 85% of the time');
eq(minnow.requiredLevel, 1, 'and needs no level');
eq(minnow.currencyReward, 5, 'and pays little');

// Rarity lives entirely in catchRate and rarityWeight. With no minigame there is no skill to erase
// it: the shark seldom appears (weight 3) and often escapes (25%), and practice changes neither.
eq(shark.rarityWeight, 3, 'a rare species seldom swims past');
eq(shark.catchRate, 250, 'and escapes three times in four');
eq(shark.requiredLevel, 70, 'gated behind a level');
eq(shark.activeSeasons, WINTER, 'and only in winter - the fourth availability axis');
eq(shark.rarityStars, 5, 'five stars, for display only');
eq(shark.currencyReward, 75, 'and pays accordingly');
eq(shark.goldenXpBonus, 3925, 'with a golden bonus');

eq(parser.zones[1].furniClass, 'vtx_spot_pier', 'a zone is keyed by furni class, not item id');
eq(parser.zones[1].requiredLevel, 70, 'and carries its own level gate');

// Seasons: the shark is nocturnal and weekends-only, the minnow always available.
eq(minnow.isActiveAt(new Date(Date.UTC(2026, 7, 26, 14)), ALL_SEASONS), true, 'the minnow is in season on a Wednesday afternoon');
eq(shark.isActiveAt(new Date(Date.UTC(2026, 7, 26, 14)), WINTER), false, 'the shark is not — wrong day and wrong hour');
eq(shark.isActiveAt(new Date(Date.UTC(2026, 7, 29, 14)), WINTER), false, 'nor on the Saturday afternoon');
eq(shark.isActiveAt(new Date(Date.UTC(2026, 7, 29, 23)), WINTER), true, 'but it is on a winter Saturday night');
eq(shark.isActiveAt(new Date(Date.UTC(2026, 7, 29, 23)), ALL_SEASONS & ~WINTER), false, 'and out of winter, never');

// --- the reload path ---------------------------------------------------------------------------
const definitions = new FishingDefinitions();
let announced = 0;
let lastAnnouncedVersion = -1;

definitions.on(FISHING_DEFINITIONS_CHANGED, (version) => { announced++; lastAnnouncedVersion = version; });

eq(definitions.loaded, false, 'nothing is loaded before the first push');

eq(definitions.apply(parser.version, parser.species, parser.rodLevels, parser.fishingLevels, parser.zones), true, 'the first push applies');
eq(definitions.loaded, true, 'and the tables are loaded');
eq(definitions.version, 7, 'at the pushed version');
eq(announced, 1, 'and it announced exactly once');
eq(lastAnnouncedVersion, 7, 'carrying the new version');

eq(definitions.getSpecies(101).nameKey, 'fishing.species.shark', 'lookup by species id');
eq(definitions.getZoneByFurniClass('vtx_spot_pier').id, 3, 'lookup by spot furni class');
eq(definitions.getZone(3).requiredLevel, 70, 'lookup by zone id');
eq(definitions.getSpecies(999), null, 'an unknown id answers null rather than throwing');
eq(definitions.allSpecies.length, 2, 'the records tab sees every species, caught or not');
eq(definitions.getSpeciesForZone(3).length, 1, 'and a zone sees only its own');

// Rod tiers are walked, not keyed: they arrived unsorted, and a real curve skips level numbers
// (bobba.me has no level 10), so a map keyed by level would leave holes.
eq(definitions.allRodLevels[0].quality, 1, 'rod tiers are sorted by threshold on apply');
eq(definitions.rodQualityForXp(0).quality, 1, 'zero XP still holds a rod');
eq(definitions.rodQualityForXp(4999).quality, 1, 'just below the second threshold');
eq(definitions.rodQualityForXp(5000).quality, 2, 'exactly on it');
eq(definitions.rodQualityForXp(99999999).quality, 3, 'and past the last threshold, the top tier');
eq(definitions.rodQualityForXp(5000).catchMultiplier, 1100, 'multipliers are thousandths - 1100 is x1.10');

// The two progressions are independent, and reading one for the other is the mistake the split
// exists to prevent: the same XP number lands on a different tier in each curve.
eq(definitions.fishingLevelForXp(5000).level, 1, 'fishing XP 5000 is still level 1');
eq(definitions.rodQualityForXp(5000).quality, 2, 'while rod XP 5000 is already quality 2');
eq(definitions.fishingLevelForXp(21512).level, 30, 'and the level curve opens Port Hana at its own threshold');

// A redundant re-push — the reconnect case — must change nothing and wake nobody.
eq(definitions.apply(7, [], [], [], []), false, 'the same version is ignored');
eq(definitions.apply(3, [], [], [], []), false, 'and so is an older one');
eq(announced, 1, 'neither announced');
eq(definitions.allSpecies.length, 2, 'and neither emptied the tables');

// A real reload does replace, and does wake every panel.
eq(definitions.apply(8, [parser.species[0]], parser.rodLevels, parser.fishingLevels, parser.zones), true, 'a newer version applies');
eq(announced, 2, 'and announces');
eq(lastAnnouncedVersion, 8, 'at the new version');
eq(definitions.allSpecies.length, 1, 'replacing the tables wholesale rather than merging');
eq(definitions.getSpecies(101), null, 'so a definition dropped by the reload is gone');

// --- the rest of the message layer ---------------------------------------------------------------
// Each of these is small, and each has one thing that breaks silently if it drifts.

/** Runs a parser over typed slots and asserts the stream was consumed to the byte. */
function parseWith(Parser, slots, what)
{
    const w = makeWrapper(slots);
    const p = new Parser();

    eq(p.parse(w), true, `${what} parses`);
    eq(w.bytesAvailable, 0, `${what} consumes the whole stream`);

    return p;
}

// PlayerState. The trap is the cap: zero means uncapped, so a fresh player must not read as capped.
const capped = parseWith(
    VortexFishingPlayerStateMessageParser,
    [12, 45000, 3, 8800, 3200, 500, 500, 7, 2, 11, 12],
    'PlayerState'
);

eq(capped.fishingLevel, 12, 'fishing level');
eq(capped.rodQuality, 3, 'and a rod quality of its own - the two are not the same number');
eq(capped.currencyEarnedToday, 500, 'earned today');
eq(capped.dailyCapReached, true, 'at the cap, casting is pointless');
eq(capped.collectibleIds.join(','), '11,12', 'collectibles come last, after their count');

const uncapped = parseWith(
    VortexFishingPlayerStateMessageParser,
    [1, 0, 1, 0, 0, 0, 0, 0, 0],
    'PlayerState with no cap'
);

eq(uncapped.dailyCapReached, false, 'a zero cap means uncapped, not instantly capped');

// FishSighted. Four fields and no species — that absence is the anti-cheat, so the slot count is
// the assertion: a fifth field here would mean somebody added one.
const sighting = parseWith(VortexFishSightedMessageParser, [77, 4242, 1, 3000], 'FishSighted');

eq(sighting.sightingId, 77, 'the handle a catch is logged against');
eq(sighting.spotItemId, 4242, 'which spot to draw the cue on');
eq(sighting.golden, true, 'golden is visible, so it is safe to send');
eq(sighting.durationMs, 3000, 'how long it stays castable');

// CatchResult. `newLevel` 0 means "no level-up", not "level 0".
const levelled = parseWith(
    VortexFishingCatchResultMessageParser,
    [900, 101, 3500, 785, 75, 1, 13],
    'CatchResult'
);

eq(levelled.speciesId, 101, 'the species, named here for the first time');
eq(levelled.weight, 3500, 'the weight the derby scores');
eq(levelled.leveledUp, true, 'a non-zero newLevel is a level-up');
eq(levelled.newLevel, 13, 'at that level');

const plain = parseWith(
    VortexFishingCatchResultMessageParser,
    [901, 100, 20, 11, 5, 0, 0],
    'CatchResult without a level-up'
);

eq(plain.leveledUp, false, 'a zero newLevel is not level zero');
eq(plain.golden, false, 'and not golden');

// A spot running dry is the ordinary end of a session, not a miss: Origins keeps yielding fish until
// the stock is gone, and only then does the player relocate.
const depleted = parseWith(VortexFishingSpotDepletedMessageParser, [4242, 4], 'SpotDepleted');

eq(depleted.spotItemId, 4242, 'which spot ran out');
eq(depleted.catches, 4, 'and what the session yielded');

// DerbyStanding. `ownRank` is read AFTER the entry list, which is the kind of order that silently
// returns a rank of "whatever the last score was" if the two are ever swapped.
const derby = parseWith(
    VortexFishingDerbyStandingMessageParser,
    [5, 1790000000, 2, 1, 'Zoe', 41000, 2, 'Max', 39500, 17],
    'DerbyStanding'
);

eq(derby.derbyId, 5, 'derby id');
eq(derby.entries.length, 2, 'the ranked rows');
eq(derby.entries[0].userName, 'Zoe', 'first place');
eq(derby.entries[0].score, 41000, 'scored on combined weight of the ten heaviest');
eq(derby.ownRank, 17, 'and own rank comes after the list, not inside it');

// Error codes are append-only, and an unknown future one must still parse.
const known = parseWith(VortexFishingErrorMessageParser, [FishingErrorCode.DailyCapReached], 'FishingError');

eq(known.code, 2, 'a known code');
eq(known.known, true, 'reads as known');
eq(parseWith(VortexFishingErrorMessageParser, [99], 'a future error code').known, false, 'a future code reads as unknown, and still parses');

// Records: only caught species travel. The tab draws the whole table from the definitions and greys
// out whatever this message does not mention, so a zero row per uncaught species would cost bytes to
// say nothing.
const records = parseWith(
    VortexFishingRecordsMessageParser,
    [2, 100, 38, 12, 1790000000, 101, 3900, 1, 1790000100],
    'FishingRecords'
);

eq(records.records.length, 2, 'two species caught');
eq(records.records[0].speciesId, 100, 'the first is the minnow');
eq(records.records[0].bestWeight, 38, 'with a personal best');
eq(records.records[0].caughtCount, 12, 'caught a dozen times');
eq(records.records[1].caughtCount, 1, 'the shark exactly once');
eq(records.records.some((r) => r.speciesId === 999), false, 'and nothing is sent for a species never caught');

// The three composers send a server-issued handle and nothing else.
eq(new VortexStartFishingComposer(4242).getMessageArray().join(','), '4242', 'StartFishing names the spot - one packet starts the whole session');
eq(new VortexFishingMountCatchComposer(900).getMessageArray().join(','), '900', 'MountCatch names a record');
eq(new VortexFishingJoinDerbyComposer(5).getMessageArray().join(','), '5', 'JoinDerby names a derby');

// --- the layout and the widget agree on every child name ----------------------------------------
// `findChildByName()` answers null for a name that is not in the XML, and the widget then does
// nothing — no throw, no log from the window system, just a panel where the button does not respond.
// So the two sides are compared here: every name the widget looks up must exist in the layout it
// builds, and a rename on either side fails this check instead of shipping a dead control.
const LAYOUT_PATH = join(ROOT, 'packages/vortex-client/src/vortex-layouts/vortex_fishing_hud_xml.xml');
const WIDGET_PATH = join(ROOT, 'packages/vortex-engine/src/habbo/vortex/fishing/ui/FishingSpotWidget.ts');

const layoutXml = readFileSync(LAYOUT_PATH, 'utf8');
const widgetSrc = readFileSync(WIDGET_PATH, 'utf8');

const layoutNames = new Set([...layoutXml.matchAll(/\bname="([^"]+)"/g)].map((m) => m[1]));
const widgetNames = [...widgetSrc.matchAll(/^const CHILD_[A-Z_]+ = '([^']+)';$/gm)].map((m) => m[1]);

// The count is not the point — the loop below is: every name the widget looks up has to exist in
// the layout it builds, and a rename on either side is a control that silently stops responding.
// Hook Havoc has its own panel and its own view now, checked separately further down.
eq(widgetNames.length, 6, 'the widget declares its six child names as constants');

// Every plate on the strip names its own image, which is what makes it editable in vortex-glaze
// rather than a row of empty slots. `asset_uri` on a `static_bitmap` is the only mechanism for it —
// a plain `<bitmap>` carries no image attribute at all — so a plate that lost its `<var>` block
// would render nothing and say nothing about it.
const assetUris = [...layoutXml.matchAll(/key="asset_uri" value="([^"]+)"/g)].map((m) => m[1]);

eq(assetUris.length, 6, 'the strip names an image for each of its six plates');

for(const uri of assetUris)
{
    eq(
        existsSync(join(ROOT, `packages/vortex-client/src/assets/images/${uri}.png`)),
        true,
        `${uri}.png ships with the client, so asset_uri resolves`
    );
}

for(const name of widgetNames)
{
    eq(layoutNames.has(name), true, `the layout has a child named "${name}"`);
}

// The layout's own name is what buildWidgetLayout() is given, and App.readVortexLayouts() registers
// it under the file basename — so the file name, not the <layout name="...">, is the key.
eq(
    widgetSrc.includes("const LAYOUT_NAME = 'vortex_fishing_hud_xml';"),
    true,
    'the widget builds the layout under its file basename, which is how vortex-layouts are registered'
);

// No shipped layout in the dump uses an `enabled` attribute, so one here would be silently ignored.
// The button is disabled from code instead; this pins that it did not creep back into the XML.
eq(/\benabled="/.test(layoutXml), false, 'the layout uses no `enabled` attribute — it is not a real one');

// --- the component gets an asset library ---------------------------------------------------------
// `Component.assets` is what the Fish-O-Pedia reads its species artwork and its stars out of, and
// `new HabboFishing(ctx)` leaves it null: every `getAssetByName()` then answers null, so the book
// opens as a grid of empty cards with one warning per fish and no error anywhere. That is what
// shipped. Every other component in VortexMain that draws anything is handed the same library.
const MAIN_PATH = join(ENGINE, 'VortexMain.ts');

eq(
    /new HabboFishing\(\s*ctx\s*,\s*0\s*,\s*this\._assets\s*\)/.test(readFileSync(MAIN_PATH, 'utf8')),
    true,
    'HabboFishing is constructed WITH the asset library, or the Fish-O-Pedia draws nothing'
);

// --- the four wirings ----------------------------------------------------------------------------
// A furni opens a widget only when its logic names one AND RoomUI creates that widget AND
// RoomDesktop builds a handler for it AND RoomWidgetFactory builds the widget. Three of the four
// fail silently. A fifth thing has to be right and fails just as silently: the handler's
// `getProcessedEvents()` must return `[]`, not null — RoomDesktop appends the open/close pair to
// whatever comes back and appends nothing to null, which is what had this whole panel built,
// registered, and unreachable by a click.
const HANDLER_PATH = join(ENGINE, 'habbo/vortex/fishing/ui/FishingSpotWidgetHandler.ts');
const handlerSrc = readFileSync(HANDLER_PATH, 'utf8');

eq(
    /getProcessedEvents\(\)\s*:\s*string\[\]\s*\{\s*return \[\];/.test(handlerSrc.replaceAll(/\r?\n\s*/g, ' ')),
    true,
    'the handler returns [] from getProcessedEvents() — null there means the panel never opens'
);
eq(
    handlerSrc.includes("case 'RETWE_OPEN_WIDGET'") && handlerSrc.includes("case 'RETWE_CLOSE_WIDGET'"),
    true,
    'and handles both of the events RoomDesktop appends'
);

for(const [file, needle] of [
    ['habbo/vortex/fishing/room/FurnitureFishingSpotLogic.ts', "'RWE_FISHING_SPOT'"],
    ['habbo/ui/RoomUI.ts', "createWidget('RWE_FISHING_SPOT')"],
    ['habbo/ui/RoomDesktop.ts', 'new FishingSpotWidgetHandler()'],
    ['habbo/ui/RoomWidgetFactory.ts', 'new FishingSpotWidget('],
])
{
    eq(readFileSync(join(ENGINE, file), 'utf8').includes(needle), true, `${file} carries its wiring`);
}

// `FurnitureLogic` must read the `widget` GETTER at all three sites. Every logic that names a widget
// does so by overriding the getter and never assigns `widgetType`, so a site that reads the private
// `_widget` field sees null and emits nothing — the furni is inert, with no throw and no log. Two of
// the three sites were doing exactly that, which made the crafting table and the rentable space
// inert too. AS3: .../logic/furniture/_SafeCls_1722.as lines 62, 306 and 443 all read `widget`.
const furnitureLogicSrc = readFileSync(
    join(ENGINE, 'habbo/room/object/logic/furniture/FurnitureLogic.ts'),
    'utf8'
);
const widgetFieldReads = [...furnitureLogicSrc.matchAll(/this\._widget/g)].length;

eq(
    widgetFieldReads,
    2,
    'FurnitureLogic touches `_widget` only in its own getter and setter — every test reads `this.widget`'
);

// The panel is handed its definitions and registered for incoming messages, or it opens blank and
// deaf. Nothing about that failure is visible without this check.
eq(
    readFileSync(join(ENGINE, 'habbo/ui/RoomWidgetFactory.ts'), 'utf8').includes('widget.setFishing(fishing)'),
    true,
    'RoomWidgetFactory hands the spot panel its HabboFishing'
);
eq(
    readFileSync(join(ENGINE, 'habbo/ui/RoomUI.ts'), 'utf8').includes('IID_HabboFishing'),
    true,
    'and RoomUI resolves HabboFishing for it to hand over'
);

// The Fishopedia's hour-range formatter, run against the masks the emulator actually seeds. A
// nocturnal window wraps past midnight, which a naive scan reports as two separate ranges — and the
// expectation here is what caught the seed writing one bit too few for "20:00-04:59".
{
    const HOURS = 24;
    const ALL = 0xFFFFFF;
    const pad = (h) => (h < 10 ? `0${h}` : `${h}`);

    // Mirrors FishingBookView.describeHours(). Kept here rather than imported because the view
    // reaches the window system, which does not exist under Node.
    const describe = (mask) =>
    {
        if((mask & ALL) === ALL) return 'any';
        if((mask & ALL) === 0) return 'never';

        const active = [];

        for(let h = 0; h < HOURS; h++) active.push((mask & (1 << h)) !== 0);

        let start = 0;

        while(start < HOURS && !(active[start] && !active[(start + HOURS - 1) % HOURS])) start++;

        if(start === HOURS) return 'any';

        const runs = [];
        let cursor = start;

        for(let seen = 0; seen < HOURS; seen++)
        {
            if(!active[cursor]) { cursor = (cursor + 1) % HOURS; continue; }

            const from = cursor;

            while(active[cursor]) { cursor = (cursor + 1) % HOURS; seen++; }

            runs.push(`${pad(from)}:00-${pad(cursor)}:00`);
        }

        return runs.join(', ');
    };

    eq(describe(0xFFFFFF), 'any', 'every hour reads as "any time"');
    eq(describe(0), 'never', 'no hour reads as "never"');
    eq(describe(15728671), '20:00-05:00', 'the seeded nocturnal mask wraps past midnight as one range');
    eq(describe(1 << 9), '09:00-10:00', 'a single hour');
    eq(describe((1 << 6) | (1 << 7) | (1 << 18)), '06:00-08:00, 18:00-19:00', 'two separate runs');
}

// --- Hook Havoc ----------------------------------------------------------------------------------
// The client plays the minigame and the server replays it against the same seed. The two halves
// share no code and cannot: one is TypeScript in a browser, the other C# in a grain. What they share
// is arithmetic, and a drift of one operation scores a fair attempt as a loss.
//
// The drift sequence below was computed independently, in Python with explicit uint32 masking,
// against `../vortex-emulator/Vortex.Fishing/HookHavocSimulation.cs`'s Xorshift32. If this fails,
// one of the two halves moved.
{
    // A tolerance far wider than any drift, so the needle never leaves the centre and the bar only
    // ever fills — this isolates the generator and the fill rate from the nudge rules.
    const game = new HookHavocGame(12345, 1000, 250, 1000);
    const needles = [];

    for(let i = 0; i < 10; i++) needles.push(game.tick().needle);

    // Cumulative sums of 0,1,0,2,0,2,-2,0,-3,2 — the reference sequence for seed 12345.
    eq(needles.join(','), '0,1,1,3,3,5,3,3,0,2', 'the drift matches the server generator for seed 12345');

    eq(HOOK_HAVOC_TICK_MS, 100, 'tick length is the server’s');
    eq(HOOK_HAVOC_FULL_BAR, 10000, 'a full bar is the server’s');
    eq(HOOK_HAVOC_LEFT, -1, 'Q is -1 on the wire');
    eq(HOOK_HAVOC_RIGHT, 1, 'E is +1');

    // A nudge is recorded against the tick it lands on, and only one fits in a tick — the wire
    // carries one `tick, direction` pair, and a queued second would replay a tick late where the
    // overbalance rule would double it.
    const recording = new HookHavocGame(1, 1000, 250, 1000);

    recording.nudge(HOOK_HAVOC_RIGHT);
    recording.nudge(HOOK_HAVOC_LEFT);
    recording.tick();
    recording.tick();
    recording.nudge(HOOK_HAVOC_LEFT);
    recording.tick();

    eq(recording.timeline.join(','), '0,1,2,-1', 'the timeline is flat tick/direction pairs, one per tick');

    // Off centre, the bar drains at half the fill rate and never below zero.
    const drifting = new HookHavocGame(1, 1000, 400, 0);

    drifting.tick();

    eq(drifting.progress, 0, 'a bar already at zero cannot drain below it');
}

// --- the Hook Havoc panel ---------------------------------------------------------------------
// Rebuilt from Habbo Origins' own `fishingUI.window` (docs/vortex-original/origins/). Same rule as
// the spot panel: every name the view looks up must exist in the layout, and every Origins sprite it
// paints must actually ship — a missing one draws nothing and says so only in the console.
{
    const hhLayout = readFileSync(
        join(ROOT, 'packages/vortex-client/src/vortex-layouts/vortex_fishing_hookhavoc_xml.xml'),
        'utf8'
    );
    const hhView = readFileSync(join(ENGINE, 'habbo/vortex/fishing/ui/HookHavocView.ts'), 'utf8');
    const hhNames = new Set([...hhLayout.matchAll(/\bname="([^"]+)"/g)].map((m) => m[1]));

    for(const m of hhView.matchAll(/^const CHILD_[A-Z_]+ = '([^']+)';$/gm))
    {
        eq(hhNames.has(m[1]), true, `the Hook Havoc layout has a child named "${m[1]}"`);
    }

    const images = join(ROOT, 'packages/vortex-client/src/assets/images');

    for(const m of hhView.matchAll(/^const ASSET_[A-Z_]+ = '([^']+)';$/gm))
    {
        eq(existsSync(join(images, `${m[1]}.png`)), true, `${m[1]}.png ships`);
    }

    // The dial is composited, not four windows: the window system cannot rotate a sprite, and
    // Origins rotates the needle at draw time.
    eq(hhView.includes('context.rotate('), true, 'the needle is rotated into the dial bitmap');
}

// The strip is not a window the player closes — it has no frame and no buttons, and it goes when the
// session does. This used to check the opposite, because the strip used to be a panel; Origins ships
// thirteen window definitions and none of them is a spot panel, so the panel was an invention and
// the close button an invention on top of it. See docs/vortex-original/fishing.md §18.
eq(
    widgetSrc.includes("findChildByTag('close')"),
    false,
    'the strip has no close button — it is not a panel'
);

// The start packet names the SPOT, never a sighting. Sending the sighting id here is a real bug this
// port shipped once: it deadlocks the feature, because a shadow only ever arrives inside a session
// that has already started.
eq(
    widgetSrc.includes('new VortexStartFishingComposer(this._spotObjectId)'),
    true,
    'StartFishing names the spot object, not a sighting'
);

// --- every Vortex layout resolves what it names ------------------------------------------------
// Six of these are converted straight out of Origins' own element lists by
// scripts/origins/convert-window.py, so a member the fishing cast does not carry, or a text key this
// hotel does not serve, is a one-line mistake in a generator that emits 145 elements. Neither throws:
// an unresolved `asset_uri` draws nothing and an unserved `${key}` renders as the raw key.
{
    const layoutDir = join(ROOT, 'packages/vortex-client/src/vortex-layouts');
    const imageDir = join(ROOT, 'packages/vortex-client/src/assets/images');
    const overrides = readFileSync(
        join(ROOT, 'packages/vortex-client/tools/locale-overrides/fishing.en.txt'),
        'utf8'
    );
    const served = new Set(
        overrides.split('\n')
            .filter((line) => line.includes('=') && !line.trimStart().startsWith('#'))
            .map((line) => line.slice(0, line.indexOf('=')).trim())
    );

    for(const file of readdirSync(layoutDir).filter((name) => name.startsWith('vortex_')))
    {
        const xml = readFileSync(join(layoutDir, file), 'utf8');

        for(const m of xml.matchAll(/key="asset_uri" value="([^"]+)"/g))
        {
            eq(existsSync(join(imageDir, `${m[1]}.png`)), true, `${file}: ${m[1]}.png ships`);
        }

        // Only the fishing namespace: the other layouts read keys the hotel already serves and this
        // file is not the place to inventory those.
        for(const m of xml.matchAll(/caption="\$\{(vortex\.fishing\.[^}]+)\}"/g))
        {
            eq(served.has(m[1]), true, `${file}: locale-overrides carries ${m[1]}`);
        }
    }
}

// --- the sign is a furni of its own, and it takes all four wirings too --------------------------
{
    const wirings = [
        ['habbo/room/object/RoomObjectLogicEnum.ts', 'vortex_fishing_sign'],
        ['habbo/room/RoomObjectFactory.ts', 'FurnitureFishingSignLogic'],
        ['habbo/ui/RoomDesktop.ts', "case 'RWE_FISHING_SIGN'"],
        ['habbo/ui/RoomUI.ts', "createWidget('RWE_FISHING_SIGN')"],
    ];

    for(const [file, needle] of wirings)
    {
        eq(readFileSync(join(ENGINE, file), 'utf8').includes(needle), true, `${file} wires the sign`);
    }

    // Three of the four fail silently, and so does this one: the bundle's own logicType is what
    // selects the logic in the first place.
    eq(
        readFileSync(join(ROOT, 'scripts/origins/build-fishing-spots.py'), 'utf8')
            .includes('"vortex_fishing_sign" if classname == SIGN_CLASS'),
        true,
        'the sign bundle declares the sign logic'
    );
}

if(failures > 0)
{
    console.error(`\n${failures} fishing check(s) failed.`);
    process.exit(1);
}

console.log('Fishing OK: 11 packets, the rod-tier walk, the live-reload push path, the spot layout, '
    + 'the sign, and every layout\'s assets and texts.');
