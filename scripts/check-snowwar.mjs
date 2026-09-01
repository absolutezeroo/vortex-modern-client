#!/usr/bin/env node
//
// The snow-war wire layout and turn machinery, checked by actually running them.
//
//   node scripts/check-snowwar.mjs
//
// Companion to check-snowwar-determinism.mjs, which guards the maths. This one guards the *reading*
// and the *clock*, where the same "almost right is a desync" rule applies for different reasons.
//
// Reading: a game object has no length prefix. Its type decides how many integers its body is, so
// one wrong `NUM_OF_VARIABLES` does not truncate one object — it shifts every byte after it and the
// whole arena is noise, with nothing thrown and nothing logged.
//
// The fake message wrapper is what makes that visible: its slots are typed, so a read that lands on
// the wrong one fails immediately instead of silently returning a plausible integer.
//
// It also covers the one thing the port does differently from AS3 — the two factory tables. AS3
// switches over its subclasses directly; in ESM that import cycle puts the base in a temporal dead
// zone, so each subclass registers itself instead (see SnowWarGameObjectData.register()). If the
// side-effect imports in GameObjectsData/GameStatusData are ever tidied away as unused, `create()`
// starts returning null for everything and this check is what says so.
//
// The clock: `SynchronizedGameArena` advances a turn in `getNumberOfSubTurns()` pulses and folds a
// checksum at the end of each one. The server folds the same number from the same variables, so the
// weighting in `calculateChecksum()` and the exact pulse on which a turn closes are both wire
// contract. The arena section below pins the fold arithmetic, which objects are excluded from it
// (ghosts, inactive), and the one `stage.subturn()` that `seekToTurn()` has to suppress.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
const ENGINE = join(ROOT, 'packages/vortex-engine/src');
// Forward slashes: this path is interpolated into a source string below, where a Windows backslash
// would be read as an escape.
const DATA = `${ENGINE.replaceAll('\\', '/')}/habbo/communication/messages/parser/game/snowwar/data`;

// esbuild is a dependency of vortex-client, not of the root, so resolve it from there.
const require = createRequire(join(ROOT, 'packages/vortex-client/package.json'));
const esbuild = require('esbuild');

let failures = 0;

function fail(message)
{
    failures++;
    console.error(`  FAIL  ${message}`);
}

/** Tiles hold their neighbours, so a failed comparison must never be JSON.stringify'd. */
function show(value)
{
    if(value === null || value === undefined) return String(value);
    if(typeof value === 'object') return value.constructor?.name ?? 'object';

    return JSON.stringify(value);
}

function eq(actual, expected, what)
{
    if(actual !== expected) fail(`${what}: expected ${show(expected)}, got ${show(actual)}`);
}

/**
 * A stand-in for IMessageDataWrapper over a list of typed slots. Reading an int where a string was
 * written (or running off the end) throws, which is how a wrong variable count is caught at the
 * exact field that drifted rather than three objects later.
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
        get consumed() { return cursor; },
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

// Re-exported by module name so the check can hold the classes themselves. Comparing
// `constructor.name` would not do: esbuild renames a bundled class when its name collides, and the
// subclasses come back as `_SnowballGameObjectData` and friends.
const MODULES = [
    'GameObjectsData', 'GameStatusData', 'FullGameStatusData', 'Game2PlayerData',
    'SnowWarGameObjectData', 'SnowballGameObjectData', 'TreeGameObjectData',
    'SnowballPileGameObjectData', 'SnowballMachineGameObjectData', 'HumanGameObjectData',
    'SnowWarGameEventData', 'HumanLeftGameEventData', 'NewMoveTargetEventData',
    'HumanThrowsSnowballAtHumanEventData', 'HumanThrowsSnowballAtPositionEventData',
    'HumanStartsToMakeASnowballEventData', 'CreateSnowballEventData',
    'MachineCreatesSnowballEventData', 'HumanGetsSnowballsFromMachineEventData',
];

const GAME = `${ENGINE.replaceAll('\\', '/')}/habbo/game/snowwar`;

const ENTRY = [
    ...MODULES.map((name) => `export { ${name} } from '${DATA}/${name}';`),
    `export { GameLevelData } from '${DATA}/GameLevelData';`,
    `export { SynchronizedGameArena } from '${GAME}/arena/SynchronizedGameArena';`,
    `export { SynchronizedGameStage } from '${GAME}/arena/SynchronizedGameStage';`,
    `export { SnowWarArenaExtension } from '${GAME}/SnowWarArenaExtension';`,
    `export { SnowWarGameStage } from '${GAME}/SnowWarGameStage';`,
    `export { Tile } from '${GAME}/Tile';`,
    `export { HumanGameObject } from '${GAME}/gameobjects/HumanGameObject';`,
    `export { SnowBallGameObject } from '${GAME}/gameobjects/SnowBallGameObject';`,
    `export { TreeGameObject } from '${GAME}/gameobjects/TreeGameObject';`,
    `export { SnowballPileGameObject } from '${GAME}/gameobjects/SnowballPileGameObject';`,
    `export { SnowballMachineGameObject } from '${GAME}/gameobjects/SnowballMachineGameObject';`,
    `export { Direction8 } from '${GAME}/utils/Direction8';`,
    `export { QuickRandom } from '${GAME}/utils/QuickRandom';`,
    `export { ClickType } from '${GAME}/ClickType';`,
    ...[
        'NewMoveTargetEvent', 'HumanStartsToMakeASnowballEvent', 'HumanGetsSnowballsFromMachineEvent',
        'CreateSnowballEvent', 'HumanLeftGameEvent', 'MachineCreatesSnowballEvent',
        'HumanThrowsSnowballAtPositionEvent', 'HumanThrowsSnowballAtHumanEvent',
    ].map((name) => `export { ${name} } from '${GAME}/events/${name}';`),
].join('\n');

const built = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: ROOT, sourcefile: 'check-snowwar-wire-entry.ts', loader: 'ts' },
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

const bundlePath = join(mkdtempSync(join(tmpdir(), 'snowwar-wire-')), 'bundle.mjs');
writeFileSync(bundlePath, built.outputFiles[0].text);

const bundle = await import(pathToFileURL(bundlePath).href);
const {
    GameObjectsData, GameStatusData, FullGameStatusData, Game2PlayerData,
    SnowWarGameObjectData, SnowWarGameEventData,
    SynchronizedGameArena, SnowWarArenaExtension, QuickRandom,
    GameLevelData, SnowWarGameStage, Tile, Direction8,
    HumanGameObject, SnowBallGameObject, TreeGameObject,
    SnowballPileGameObject, SnowballMachineGameObject,
    SnowballPileGameObjectData, SnowballMachineGameObjectData, TreeGameObjectData, HumanGameObjectData,
    NewMoveTargetEvent, HumanStartsToMakeASnowballEvent, HumanGetsSnowballsFromMachineEvent,
    CreateSnowballEvent, HumanLeftGameEvent, MachineCreatesSnowballEvent,
    ClickType,
} = bundle;

function isA(value, className, what)
{
    if(!(value instanceof bundle[className])) fail(`${what}: expected a ${className}, got ${value?.constructor?.name ?? value}`);
}

// --- the five game objects -------------------------------------------------------------------
// Each body is (NUM_OF_VARIABLES - 2) integers, because slots 0 and 1 are the type and id the
// header already carried. The values below count up from a per-object base so a misread lands on a
// number from the wrong object rather than on a coincidence.
const body = (base, count) => Array.from({ length: count - 2 }, (_, i) => base + i);

const objectSlots = [
    5,
    1, 101, ...body(1000, 11),                                  // snowball
    2, 102, ...body(2000, 9),                                   // tree
    3, 103, ...body(3000, 7),                                   // pile
    4, 104, ...body(4000, 8),                                   // machine
    5, 105, ...body(5000, 19), 'Zoe', 'mission', 'hd-180-1', 'F', // human
];

const objectWrapper = makeWrapper(objectSlots);
const objects = new GameObjectsData(objectWrapper).gameObjects;

eq(objects.length, 5, 'GameObjectsData object count');
eq(objectWrapper.bytesAvailable, 0, 'GameObjectsData consumed the whole stream');

isA(objects[0], 'SnowballGameObjectData', 'type 1 builds');
eq(objects[0].id, 101, 'snowball id');
eq(objects[0].locationX3D, 1000, 'snowball locationX3D (slot 2)');
eq(objects[0].planarVelocity, 1008, 'snowball planarVelocity (slot 10, the last)');

isA(objects[1], 'TreeGameObjectData', 'type 2 builds');
eq(objects[1].hits, 2006, 'tree hits (slot 8, the last)');

isA(objects[2], 'SnowballPileGameObjectData', 'type 3 builds');
eq(objects[2].fuseObjectId, 3004, 'pile fuseObjectId (slot 6, the last)');

isA(objects[3], 'SnowballMachineGameObjectData', 'type 4 builds');
eq(objects[3].fuseObjectId, 4005, 'machine fuseObjectId (slot 7, the last)');

isA(objects[4], 'HumanGameObjectData', 'type 5 builds');
eq(objects[4].currentLocationX, 5000, 'human currentLocationX (slot 2)');
eq(objects[4].userId, 5016, 'human userId (slot 18, the last integer)');
eq(objects[4].name, 'Zoe', 'human name (first string, after all 17 integers)');
eq(objects[4].sex, 'F', 'human sex (last string)');

eq(SnowWarGameObjectData.create(99, 1), null, 'an unknown object type builds nothing');

// --- the turn --------------------------------------------------------------------------------
// Sub-turn 0 carries two known events; sub-turn 1 carries a type this build has no class for, which
// is dropped without reading a body. Sub-turn 2 is empty, which has to stay a present-but-empty
// entry rather than a missing key.
const statusWrapper = makeWrapper([
    77, 12345, 3,
    2, 1, 900, 2, 901, 40, 41,
    1, 5,
    0,
]);
const status = new GameStatusData(statusWrapper);

eq(statusWrapper.bytesAvailable, 0, 'GameStatusData consumed the whole stream');
eq(status.turn, 77, 'turn');
eq(status.checksum, 12345, 'checksum');
eq(status.events.getValue(0).length, 2, 'sub-turn 0 event count');
isA(status.events.getValue(0)[0], 'HumanLeftGameEventData', 'event type 1 builds');
eq(status.events.getValue(0)[0].humanGameObjectId, 900, 'HumanLeftGameEventData.humanGameObjectId');
isA(status.events.getValue(0)[1], 'NewMoveTargetEventData', 'event type 2 builds');
eq(status.events.getValue(0)[1].y, 41, 'NewMoveTargetEventData.y');
eq(status.events.getValue(1).length, 0, 'an unknown event type is dropped, not thrown');
eq(status.events.getValue(2).length, 0, 'an empty sub-turn is still a key');

for(const [type, name] of [
    [3, 'HumanThrowsSnowballAtHumanEventData'],
    [4, 'HumanThrowsSnowballAtPositionEventData'],
    [7, 'HumanStartsToMakeASnowballEventData'],
    [8, 'CreateSnowballEventData'],
    [11, 'MachineCreatesSnowballEventData'],
    [12, 'HumanGetsSnowballsFromMachineEventData'],
])
{
    isA(SnowWarGameEventData.create(type), name, `event type ${type} builds`);
}

// --- the full status -------------------------------------------------------------------------
// Two integers in the middle are read into nothing. If either is dropped the fields after it shift
// by one slot, and the marker values below land in the wrong getters.
const fullWrapper = makeWrapper([
    -1, 120, 300,
    1, 2, 303, ...body(7000, 9),
    -2, 2,
    88, 999, 0,
]);
const full = new FullGameStatusData(fullWrapper);

eq(fullWrapper.bytesAvailable, 0, 'FullGameStatusData consumed the whole stream');
eq(full.remainingTimeSeconds, 120, 'remainingTimeSeconds (after the first discarded int)');
eq(full.durationInSeconds, 300, 'durationInSeconds');
eq(full.gameObjects.gameObjects.length, 1, 'nested GameObjectsData');
eq(full.numberOfTeams, 2, 'numberOfTeams (after the second discarded int)');
eq(full.gameStatus.turn, 88, 'nested GameStatusData turn');

// --- the lobby player ------------------------------------------------------------------------
const player = new Game2PlayerData();
player.parse(makeWrapper([42, 'Zoe', 'hd-180-1', 'F', 3]));

eq(player.referenceId, 42, 'Game2PlayerData.referenceId');
eq(player.teamId, 3, 'Game2PlayerData.teamId');
eq(player.toString(), '[Game Player] 42: Zoe', 'Game2PlayerData.toString()');
eq(player.disposed, false, 'Game2PlayerData starts undisposed');

player.dispose();

eq(player.disposed, true, 'dispose() sets disposed');
eq(player.isDisposed, true, 'dispose() is visible through isDisposed too');
eq(player.userName, null, 'dispose() clears userName');
eq(player.gender, 'F', 'dispose() leaves gender alone, as AS3 does');

// --- the arena clock -------------------------------------------------------------------------
/** A stand-in ISynchronizedGameObject that counts the sub-turns it was advanced through. */
function makeGameObject(id, variables, { isGhost = false, isActive = true } = {})
{
    return {
        gameObjectId: id,
        ghostObjectId: 0,
        isGhost,
        isActive,
        subturns: 0,
        removed: 0,
        disposed: false,
        get numberOfVariables() { return variables.length; },
        getVariable(index) { return variables[index]; },
        subturn() { this.subturns++; },
        onRemove() { this.removed++; },
        dispose() { this.disposed = true; },
    };
}

function makeArena(numberOfTeams = 2)
{
    const arena = new SynchronizedGameArena();

    // The order matters and is the one SnowWarEngine uses: initialize() sizes its first event queue
    // from getNumberOfSubTurns(), which asks the extension.
    arena.setExtension(new SnowWarArenaExtension());
    arena.initialize(null, numberOfTeams);

    return arena;
}

const arena = makeArena();
const extension = arena.getExtension();

eq(extension.getNumberOfSubTurns(), 3, 'snow war runs 3 sub-turns to a turn');
eq(extension.getPulseInterval(), 50, 'snow war pulses every 50ms');
eq(extension.gameArena, arena, 'setExtension() wires the arena back into the extension');
eq(extension.isDeathMatch(), false, 'two teams is not a death match');
eq(makeArena(1).getExtension().isDeathMatch(), true, 'one team is a death match');

const stage = arena.getCurrentStage();
const scorer = makeGameObject(7, [10, 20, 30]);
const ghost = makeGameObject(8, [1000], { isGhost: true });
const idle = makeGameObject(9, [2000], { isActive: false });

stage.addGameObject(7, scorer);
stage.addGameObject(8, ghost);
stage.addInactiveGameObject(9, idle);

eq(ghost.isActive, true, 'addGameObject() activates, even a ghost');
eq(idle.isActive, false, 'addInactiveGameObject() does not');

let applied = -1;
arena.addGameEvent(0, 1, { apply: () => { applied = arena.subturn; }, dispose() {}, get disposed() { return false; } });

arena.pulse();
eq(arena.getTurnNumber(), 0, 'a turn does not close on its first sub-turn');
eq(applied, -1, 'an event queued for sub-turn 1 does not fire on sub-turn 0');

arena.pulse();
eq(applied, 1, 'it fires on sub-turn 1, and reads that sub-turn while applying');

arena.pulse();
eq(arena.getTurnNumber(), 1, 'the turn closes on the last sub-turn');
eq(arena.subturn, 0, 'and the sub-turn wraps to 0');
eq(scorer.subturns, 3, 'every active object was advanced once per sub-turn');
eq(ghost.subturns, 3, 'a ghost is still simulated — it is only left out of the checksum');

// The fold: seed, then each variable times a weight that restarts at 1 for every object. Ghosts and
// inactive objects contribute nothing, so 1000 and 2000 must not appear in the total.
eq(arena.getCheckSum(0), QuickRandom.iterateSeed(0) + 10 * 1 + 20 * 2 + 30 * 3, 'checksum folds active, non-ghost variables only');

// Removal is deferred to the end of the sub-turn, not applied where it was asked.
stage.putGameObjectOnDeleteList(scorer);
eq(scorer.isActive, false, 'putGameObjectOnDeleteList() deactivates immediately');
eq(stage.getGameObject(7), scorer, 'but does not remove until the sub-turn ends');

stage.subturn();
eq(stage.getGameObject(7), null, 'the sub-turn drains the delete list');
eq(scorer.removed, 1, 'and calls onRemove() exactly once');
eq(stage.resetRemovedGameObjects().length, 1, 'the removal is handed over once');
eq(stage.resetRemovedGameObjects().length, 0, 'and the list is empty afterwards');

// seekToTurn() holds stage.subturn() off for the WHOLE turn, not for one pulse: `_newTurn` is
// cleared where the turn closes, so all three sub-turns are suppressed and simulation resumes on the
// next turn. The client has been told where the server is, and applies that turn's events without
// advancing objects it has not heard about yet.
const seeked = makeArena();
const follower = makeGameObject(1, [5]);

seeked.getCurrentStage().addGameObject(1, follower);
seeked.seekToTurn(10, 4242);

eq(seeked.getTurnNumber(), 10, 'seekToTurn() jumps the turn');
eq(seeked.subturn, 0, 'and restarts the sub-turn');
eq(seeked.getCheckSum(10), 4242, "and trusts the server's checksum for it");

seeked.pulse();
seeked.pulse();
seeked.pulse();
eq(follower.subturns, 0, 'no sub-turn of the seeked turn advances objects');
eq(seeked.getTurnNumber(), 11, 'and that turn still closes normally');

seeked.pulse();
eq(follower.subturns, 1, 'the turn after the seek simulates again');

// Teams are 1-based on the wire; anything outside the range is dropped rather than throwing.
arena.addTeamScore(1, 5);
arena.addTeamScore(2, 7);
arena.addTeamScore(0, 100);
arena.addTeamScore(3, 100);
eq(arena.getTeamScores().join(','), '5,7', 'addTeamScore() is 1-based and drops out-of-range teams');

arena.dispose();
eq(arena.disposed, true, 'dispose() marks the arena');
eq(extension.disposed, true, 'and disposes the extension it owns');

// --- the stage and its game objects ------------------------------------------------------------
// A 4x3 arena. Row 1 has a hole at column 2 ('x'), and 'a' is height 10 — the two encodings that are
// not a plain digit.
const LEVEL = new GameLevelData(makeWrapper([4, 3, '0000\r00x0\r0a00', 0]));
const arenaStage = new SnowWarGameStage();

arenaStage.initialize(makeArena(), LEVEL);

eq(arenaStage.getTileAt(0, 0) !== null, true, 'a walkable square has a tile');
eq(arenaStage.getTileAt(2, 1), null, "'x' in the height map leaves no tile at all");
// The parsed heights are used ONLY to spot holes: a tile is created wherever the character is not
// 'x', and the height it decoded is then thrown away. A tile's height comes from the scenery on it,
// never from the map — 'a' at (1,2) decodes to 10 and the tile still starts at 0.
eq(arenaStage.getTileAt(1, 2) !== null, true, "a letter is a tile like any other");
eq(arenaStage.getTileAt(1, 2).height, 0, 'and the decoded height is discarded');
eq(arenaStage.getTileAt(-1, 0), null, 'off the west edge');
eq(arenaStage.getTileAt(4, 0), null, 'off the east edge');
eq(arenaStage.getTileAt(0, 3), null, 'off the south edge');

// linkTile() links both ways, so a neighbour found northwards must lead back southwards.
const origin = arenaStage.getTileAt(1, 1);
eq(origin.getTileInDirection(Direction8.N), arenaStage.getTileAt(1, 0), 'north link');
eq(arenaStage.getTileAt(1, 0).getTileInDirection(Direction8.S), origin, 'and the tile north links back south');
eq(origin.getTileInDirection(Direction8.NE), arenaStage.getTileAt(2, 0), 'north-east link');
eq(origin.getTileInDirection(Direction8.E), null, 'and no link at all east, where the hole is');

// Coordinates round to the NEAREST tile, which is what the half-width offset buys.
eq(Tile.convertToTileX(0), 0, 'the origin');
eq(Tile.convertToTileX(1599), 0, 'just short of the boundary');
eq(Tile.convertToTileX(1600), 1, 'and just past it');
eq(Tile.convertToTileX(-1600), 0, 'javaDiv truncates towards zero, so -1600 is still tile 0');

// The path costs look inverted and are not: Direction8.isDiagonal() answers true for the CARDINAL
// directions, so a straight step costs a tile's width and a diagonal costs a tile's diagonal.
// Correcting either half alone breaks every path this client picks.
eq(origin.getPathCost(Direction8.N, null), 3200, 'a straight step costs a tile width');
eq(origin.getPathCost(Direction8.NE, null), Tile.TILE_DIAMETER, 'a diagonal costs a tile diagonal');
eq(Tile.TILE_DIAMETER > 3200, true, 'and the diagonal is the larger of the two');

/** Builds a DTO of `Ctor` by feeding its own parse() the slots a wire message would carry. */
function makeData(Ctor, type, id, variables, strings = [])
{
    const data = new Ctor(type, id);

    data.parse(makeWrapper([...variables, ...strings]));

    return data;
}

// A pile at tile (1,1) with 4 of a maximum 9 snowballs.
const pileData = makeData(SnowballPileGameObjectData, 3, 300, [1 * 3200, 1 * 3200, 9, 4, 77]);
const pile = new SnowballPileGameObject(pileData, arenaStage);

// Every game object's getVariable() table IS the checksum's input, and it must line up slot for slot
// with the DTO the server sent. Comparing the two is the only thing that catches a swapped pair.
for(let i = 0; i < pile.numberOfVariables; i++)
{
    eq(pile.getVariable(i), pileData.getVariable(i), `pile variable ${i} matches its DTO`);
}

eq(pile.boundingData[0], 400, 'a pile’s radius is its stock × 100');
eq(pile.pickupSnowballs(10), 4, 'it hands over only what it has');
eq(pile.boundingData[0], 0, 'and an emptied pile has no radius left');
eq(arenaStage.getTileAt(1, 1).gameObject, null, 'and takes itself off its tile');

// A machine at (0,0): fixed radius, always on its tile, refills one at a time.
const machineData = makeData(SnowballMachineGameObjectData, 4, 400, [0, 0, Direction8.SE.intValue(), 3, 1, 88]);
const machine = new SnowballMachineGameObject(machineData, arenaStage);

for(let i = 0; i < machine.numberOfVariables; i++)
{
    eq(machine.getVariable(i), machineData.getVariable(i), `machine variable ${i} matches its DTO`);
}

eq(arenaStage.getTileAt(0, 0).gameObject, machine, 'a machine always takes its tile');
machine.createSnowball();
machine.createSnowball();
machine.createSnowball();
eq(machine.snowballCount, 3, 'and refills only up to its maximum');

// A tree at (3,0), 1 hit taken of 3.
const treeData = makeData(TreeGameObjectData, 2, 500, [3 * 3200, 0, Direction8.N.intValue(), 700, 99, 3, 1]);
const treeTile = arenaStage.getTileAt(3, 0);
const heightBeforeTree = treeTile.height;
const tree = new TreeGameObject(treeData, arenaStage);

for(let i = 0; i < tree.numberOfVariables; i++)
{
    eq(tree.getVariable(i), treeData.getVariable(i), `tree variable ${i} matches its DTO`);
}

eq(treeTile.height, Math.max(0, heightBeforeTree - 700), 'a tree subtracts its own height from its tile');
eq(treeTile.gameObject, tree, 'a standing tree holds its tile');
eq(tree.boundingData[0] > 0, true, 'and blocks snowballs');

tree.onSnowBallHit(arenaStage, null);
eq(tree.hits, 2, 'a hit counts');
eq(treeTile.gameObject, tree, 'and does not fell it yet');

tree.onSnowBallHit(arenaStage, null);
eq(tree.hits, 3, 'the last hit counts too');
eq(tree.boundingData[0], 0, 'a felled tree stops blocking');
eq(treeTile.gameObject, null, 'and releases its tile');

// A player on row 2 walking east from tile (0,2) to (1,2). The step is 534 per sub-turn and the
// tiles change hands on arrival. Slots 2..18 are HumanGameObjectData's wire order.
const humanData = makeData(
    HumanGameObjectData, 5, 600,
    [0, 2 * 3200, 0, 2, Direction8.E.intValue(), 5, 5, 0, 0, 0, 0, 2, 3200, 2 * 3200, 0, 1, 12345],
    ['Zoe', 'mission', 'hd-180-1', 'F']
);
const human = new HumanGameObject(arenaStage, humanData, false, null);

eq(human.gameObjectId, 600, 'a real player keeps its id');
eq(arenaStage.getTileAt(0, 2).occupyingHuman, human, 'and takes its tile');
eq(human.posture, 'std', 'standing still');

human.subturn(arenaStage);
eq(human.currentLocation.x, 534, 'one sub-turn is one 534-unit step');
eq(human.posture, 'swrun', 'and the posture says so');

// 3200 / 534 is 5.99, so the sixth step snaps onto the target instead of overshooting it.
for(let i = 0; i < 5; i++) human.subturn(arenaStage);
eq(human.currentLocation.x, 3200, 'the walk snaps onto the target rather than overshooting');
eq(arenaStage.getTileAt(1, 2).occupyingHuman, human, 'and the player now holds the tile it entered');
eq(arenaStage.getTileAt(0, 2).occupyingHuman, null, 'having released the one it left');

human.subturn(arenaStage);
eq(human.posture, 'std', 'arriving at the target stops the walk');

// A ghost's id is assigned twice. The constructor negates it, and the incoming-message handler then
// overwrites it with the real object's ghostObjectId — which is the key it is filed under and the
// value Tile.canMoveTo() compares. A ghost left on the constructor's value would match nothing.
const ghostHuman = new HumanGameObject(arenaStage, humanData, true, null);
eq(ghostHuman.gameObjectId, -600, 'the constructor negates the id');
eq(human.ghostObjectId, -601, 'but the real object answers -(id + 1)');

ghostHuman.gameObjectId = human.ghostObjectId;
eq(ghostHuman.gameObjectId, -601, 'and the handler re-files the ghost under that');
eq(arenaStage.getTileAt(1, 2).canMoveTo(ghostHuman), true, 'so a ghost may enter its own tile');
eq(arenaStage.getTileAt(1, 2).canMoveTo(human), false, 'where anything else is blocked');

// A default throw picks its trajectory from the range alone.
const near = new SnowBallGameObject(1);
const far = new SnowBallGameObject(2);

near.initialize(0, 0, 3000, SnowBallGameObject.TRAJECTORY_DEFAULT_THROW, 10000, 0, human);
far.initialize(0, 0, 3000, SnowBallGameObject.TRAJECTORY_DEFAULT_THROW, 90000, 0, human);

eq(near.getVariable(6), SnowBallGameObject.TRAJECTORY_QUICK_THROW, 'a short default throw is a quick throw');
eq(far.getVariable(6), SnowBallGameObject.TRAJECTORY_LONG_LOB, 'a long one is a long lob');
eq(near.getVariable(7), 10, 'a quick throw lives QUICK_THROW_MAX_RANGE / THROW_VELOCITY sub-turns');
eq(near.getVariable(8), human.gameObjectId, 'and remembers who threw it');
eq(near.numberOfVariables, 11, 'a snowball declares 11 variables');

// --- the events, end to end --------------------------------------------------------------------
// An event is only correct if queueing it on the arena changes the simulation on the right pulse.
// These go in through addGameEvent() and come out as movement, so a break anywhere along
// queue -> gamePulse -> apply -> stage -> object is caught here rather than at a desync.
const liveArena = makeArena();
const liveStage = liveArena.getCurrentStage();

liveStage.initialize(liveArena, LEVEL);

const walkerData = makeData(
    HumanGameObjectData, 5, 700,
    [0, 0, 0, 0, Direction8.E.intValue(), 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    ['Walker', 'mission', 'hd-180-1', 'M']
);
const walker = new HumanGameObject(liveStage, walkerData, false, null);

liveStage.addGameObject(walker.gameObjectId, walker);
liveArena.addGameEvent(0, 0, new NewMoveTargetEvent(walker, 3200, 0));

eq(walker.currentLocation.x, 0, 'the walker starts at the origin');

// One pulse: the queued event is applied first, then the stage advances every object once — so the
// new target is both set and acted on within the same sub-turn.
liveArena.pulse();
eq(walker.currentLocation.x, 534, 'a queued move target moves the player on the pulse that applies it');

// Making a snowball: the event only starts a timer, and the count changes 20 sub-turns later.
const maker = new HumanGameObject(
    liveStage,
    makeData(
        HumanGameObjectData, 5, 701,
        [3 * 3200, 2 * 3200, 3, 2, Direction8.E.intValue(), 5, 0, 0, 0, 0, 3, 2, 3 * 3200, 2 * 3200, 0, 1, 2],
        ['Maker', 'mission', 'hd-180-1', 'M']
    ),
    false, null
);

liveStage.addGameObject(maker.gameObjectId, maker);

new HumanStartsToMakeASnowballEvent(maker).apply(liveStage);
eq(maker.posture, 'swpick', 'the event puts the player into the making-a-snowball state');
eq(maker.snowballs, 0, 'and produces nothing yet');

for(let i = 0; i < 19; i++) liveStage.subturn();
eq(maker.snowballs, 0, 'still nothing after 19 sub-turns');

liveStage.subturn();
eq(maker.snowballs, 1, 'the twentieth sub-turn is what makes the snowball');
eq(maker.posture, 'std', 'and returns the player to normal');

// Picking up: one at a time, and the ghost is credited so the local view does not lag its own pickup.
const giver = new SnowballMachineGameObject(
    makeData(SnowballMachineGameObjectData, 4, 800, [2 * 3200, 2 * 3200, Direction8.SE.intValue(), 9, 9, 0]),
    liveStage
);
const makerGhost = new HumanGameObject(
    liveStage,
    makeData(
        HumanGameObjectData, 5, 701,
        [3 * 3200, 2 * 3200, 3, 2, Direction8.E.intValue(), 5, 0, 0, 0, 0, 3, 2, 3 * 3200, 2 * 3200, 0, 1, 2],
        ['Maker', 'mission', 'hd-180-1', 'M']
    ),
    true, null
);

makerGhost.gameObjectId = maker.ghostObjectId;
liveStage.addGameObject(makerGhost.gameObjectId, makerGhost);

const pickup = new HumanGetsSnowballsFromMachineEvent(maker, giver);

pickup.apply(liveStage);
eq(maker.snowballs, 2, 'a pickup gives exactly one');
eq(giver.snowballCount, 8, 'and takes exactly one');
eq(makerGhost.snowballs, 1, 'and the ghost is credited the same one');

maker.addSnowballs(3);
eq(maker.getRemainingSnowballCapacity(), 0, 'the player is now full');
pickup.apply(liveStage);
eq(giver.snowballCount, 8, 'and a full player takes nothing');

// Creating a snowball: the server's id is used, and the ball launches from where the thrower is now.
const create = new CreateSnowballEvent(900, maker, 0, 0, SnowBallGameObject.TRAJECTORY_QUICK_THROW);

create.apply(liveStage);

const created = liveStage.getGameObject(900);
isA(created, 'SnowBallGameObject', 'the created ball is on the stage under the server’s id');
eq(created.isActive, true, 'and is active');
eq(created.location3D.x, maker.currentLocation.x, 'launched from the thrower’s position');
eq(created.location3D.z, 3000, 'at the fixed initial height');

// Leaving: queued for deletion AND released from its tiles in the same call, so nothing walks into
// a square a departed player still holds.
const leaverTile = liveStage.getTileAt(0, 1);
const leaver = new HumanGameObject(
    liveStage,
    makeData(
        HumanGameObjectData, 5, 702,
        [0, 3200, 0, 1, Direction8.E.intValue(), 5, 0, 0, 0, 0, 0, 1, 0, 3200, 0, 1, 3],
        ['Leaver', 'mission', 'hd-180-1', 'M']
    ),
    false, null
);

liveStage.addGameObject(leaver.gameObjectId, leaver);
eq(leaverTile.occupyingHuman, leaver, 'the leaver holds its tile');

new HumanLeftGameEvent(leaver).apply(liveStage);
eq(leaverTile.occupyingHuman, null, 'leaving releases it immediately');
eq(leaver.isActive, false, 'and deactivates the object');
eq(liveStage.getGameObject(702), leaver, 'but the removal itself waits for the sub-turn');

liveStage.subturn();
eq(liveStage.getGameObject(702), null, 'which then drains it');

// A machine the client has not built yet is named by an event already in the queue: AS3 logs and
// drops rather than throwing, because the next full status will carry the real count.
new MachineCreatesSnowballEvent(null).apply(liveStage);
eq(giver.snowballCount, 8, 'an event for a machine that does not exist yet is dropped');

// --- the click table -------------------------------------------------------------------------
// Two modifier keys, four meanings, and the only difference between a tile and an opponent is what
// the bare click means: walk there, or throw with the trajectory picked from the range. Swapping
// alt for shift here is invisible — every combination still returns a valid throw.
eq(ClickType.getClickTypeOnTile(false, false), ClickType.MOVE, 'a bare click on a tile walks');
eq(ClickType.getClickTypeOnTile(false, true), ClickType.THROW_FAST_BALL, 'shift on a tile is the fast ball');
eq(ClickType.getClickTypeOnTile(true, false), ClickType.THROW_LONG_LOB_BALL, 'alt on a tile is the long lob');
eq(ClickType.getClickTypeOnTile(true, true), ClickType.THROW_SHORT_LOB_BALL, 'alt+shift on a tile is the short lob');

eq(ClickType.getClickTypeOnOpponent(false, false), ClickType.THROW_DEFAULT, 'a bare click on an opponent throws');
eq(ClickType.getClickTypeOnOpponent(false, true), ClickType.THROW_FAST_BALL, 'shift on an opponent is the fast ball');
eq(ClickType.getClickTypeOnOpponent(true, false), ClickType.THROW_LONG_LOB_BALL, 'alt on an opponent is the long lob');
eq(ClickType.getClickTypeOnOpponent(true, true), ClickType.THROW_SHORT_LOB_BALL, 'alt+shift on an opponent is the short lob');

if(failures > 0)
{
    console.error(`\n${failures} snow-war check(s) failed.`);
    process.exit(1);
}

console.log('Snow-war OK: wire DTOs, the arena clock, the tile grid, the game objects, the events and the click table.');
