#!/usr/bin/env node
//
// DiscordRpcSocket's protocol handling, checked by running it against a fake WebSocket.
//
//   node scripts/check-discord-rpc.mjs
//
// Nothing on screen says whether this adapter is right: a presence that never appears looks exactly
// like a Discord that is not running, and the only feedback loop is "open Discord and squint". Four
// behaviours carry the whole thing and each fails silently.
//
// PORT WALK. Discord binds exactly one of 6463..6472 and refuses the other nine, so a refusal must
// advance rather than abort. Stopping at the first refusal means rich presence works only for
// players whose Discord happened to take 6463.
//
// THE READY GATE. `HabboDiscordManager` publishes a presence the moment it hears DISCORD_CONNECTED,
// and commands sent before READY are dropped by Discord without a reply. So commands must queue and
// flush in order, and the SUBSCRIBE frames must go out too or invites never arrive.
//
// PENDING COLLAPSE. The manager retries on a 10s timer. If a Discord that is slow to answer lets
// those pile up, connecting replays every stale presence in sequence before the current one.
//
// THE STATUS ENVELOPE. `DiscordRichPresence.extractPayloadData()` does `JSON.parse(level).data`, so
// an adapter that emits the payload bare instead of wrapped hands every join listener `undefined` —
// and join events are precisely what nobody tests by hand.

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(import.meta.dirname, '..');
const ENGINE = join(ROOT, 'packages/vortex-engine/src');
const DISCORD = `${ENGINE.replaceAll('\\', '/')}/discord`;

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

// --- the fake Discord -------------------------------------------------------------------------
//
// Every socket the adapter opens lands here. `refuseBelow` makes the first N ports behave like a
// closed one; the rest answer.

const sockets = [];
let refuseBelow = 0;

class FakeWebSocket
{
    static OPEN = 1;

    constructor(url)
    {
        this.url = url;
        this.readyState = FakeWebSocket.OPEN;
        this.sent = [];
        this.port = Number(new URL(url).port);

        sockets.push(this);

        if(this.port < refuseBelow) queueMicrotask(() => this.onerror?.({}));
    }

    send(raw) { this.sent.push(JSON.parse(raw)); }

    close() { this.readyState = 3; }

    /** Close the way Discord does when it refuses the handshake. */
    refuse(code, reason) { this.onclose?.({code, reason}); }

    /** Push a frame from "Discord" to the adapter. */
    deliver(frame) { this.onmessage?.({data: JSON.stringify(frame)}); }
}

globalThis.WebSocket = FakeWebSocket;

const outDir = mkdtempSync(join(tmpdir(), 'vortex-discord-'));
const entry = join(outDir, 'entry.ts');

writeFileSync(entry, `export * from '${DISCORD}/DiscordRpcSocket';\n`);

const bundle = join(outDir, 'bundle.mjs');

esbuild.buildSync({
    entryPoints: [entry],
    outfile: bundle,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    alias: {'@core': join(ENGINE, 'core')}
});

const { DiscordRpcSocket } = await import(pathToFileURL(bundle).href);

const tick = () => new Promise((done) => setTimeout(done, 0));

console.log('DiscordRpcSocket\n');

// --- 1. the port walk -------------------------------------------------------------------------

{
    sockets.length = 0;
    refuseBelow = 6466;

    const rpc = new DiscordRpcSocket();

    rpc.call('initialize', '123');

    await tick();

    expect(sockets.length, 4, 'ports tried before one answered');
    expect(sockets.at(-1).port, 6466, 'port finally held');
    expect(new URL(sockets[0].url).searchParams.get('client_id'), '123', 'client id on the handshake');

    rpc.dispose();
}

// --- 2. the READY gate, and 3. the pending collapse --------------------------------------------

{
    sockets.length = 0;
    refuseBelow = 0;

    const rpc = new DiscordRpcSocket();

    rpc.call('initialize', '123');

    await tick();

    const socket = sockets.at(-1);

    // Three presence updates while Discord is still silent: only the newest may survive.
    rpc.call('updatePresence', JSON.stringify({details: 'first'}));
    rpc.call('updatePresence', JSON.stringify({details: 'second'}));
    rpc.call('updatePresence', JSON.stringify({details: 'third'}));

    expect(socket.sent.length, 0, 'frames written before READY');

    let connected = 0;

    rpc.addEventListener('status', (event) => { if(event.code === 'DISCORD_CONNECTED') connected++; });

    socket.deliver({cmd: 'DISPATCH', evt: 'READY', data: {v: 1}});

    expect(connected, 1, 'DISCORD_CONNECTED events');

    const subscribes = socket.sent.filter((frame) => frame.cmd === 'SUBSCRIBE').map((frame) => frame.evt);

    expect(subscribes.join(','), 'ACTIVITY_JOIN,ACTIVITY_JOIN_REQUEST,ACTIVITY_SPECTATE', 'subscriptions');

    const activities = socket.sent.filter((frame) => frame.cmd === 'SET_ACTIVITY');

    expect(activities.length, 1, 'presence frames flushed on READY');
    expect(activities[0].args.activity.details, 'third', 'the presence that survived the collapse');
    expect(typeof activities[0].nonce, 'string', 'nonce on a command');

    // clearPresence must omit `activity` entirely - an empty object stays on screen.
    rpc.call('clearPresence');

    const cleared = socket.sent.filter((frame) => frame.cmd === 'SET_ACTIVITY').at(-1);

    expect('activity' in cleared.args, false, 'clearPresence omits activity');

    rpc.dispose();
}

// --- 4. the status envelope --------------------------------------------------------------------

{
    sockets.length = 0;

    const rpc = new DiscordRpcSocket();

    rpc.call('initialize', '123');

    await tick();

    const socket = sockets.at(-1);
    const seen = [];

    rpc.addEventListener('status', (event) => seen.push(event));

    socket.deliver({cmd: 'DISPATCH', evt: 'READY', data: {}});
    socket.deliver({cmd: 'DISPATCH', evt: 'ACTIVITY_JOIN', data: {secret: 'abc'}});

    const join = seen.find((event) => event.code === 'DISCORD_ACTIVITY_JOIN');

    if(join === undefined)
    {
        fail('ACTIVITY_JOIN was not forwarded');
    }
    else
    {
        // This is the shape DiscordRichPresence.extractPayloadData() reads back.
        expect(JSON.parse(join.level).data.secret, 'abc', 'join payload under .data');
    }

    // A refusal - a missing RPC origin, or a command needing the `rpc` scope - must surface as
    // DISCORD_ERROR rather than being mistaken for a dispatch.
    socket.deliver({cmd: 'SET_ACTIVITY', evt: 'ERROR', data: {code: 4006, message: 'Not authenticated'}});

    expect(seen.at(-1).code, 'DISCORD_ERROR', 'an ERROR frame becomes DISCORD_ERROR');

    rpc.dispose();

    expect(seen.at(-1).code, 'DISCORD_SHUTDOWN', 'dispose() reports a shutdown');
}

// --- 5. a 4xxx refusal stops the walk ----------------------------------------------------------
//
// The failure this guards is a wrong ANSWER, not a missing one: Discord refusing the origin on the
// port it actually holds, and the adapter reporting "no Discord client answered on 6463-6472".

{
    sockets.length = 0;
    refuseBelow = 0;

    const rpc = new DiscordRpcSocket();
    const seen = [];

    rpc.addEventListener('status', (event) => seen.push(event));
    rpc.call('initialize', '123');

    await tick();

    // 4001 is what an unregistered origin really gets, and the code the log message branches on.
    sockets.at(-1).refuse(4001, 'Invalid Origin');

    await tick();

    expect(sockets.length, 1, 'ports tried after Discord refused the handshake');
    expect(seen.at(-1)?.code, 'DISCORD_ERROR', 'a 4xxx close is reported as an error');
    expect(JSON.parse(seen.at(-1).level).data.code, 4001, 'the close code Discord gave');

    // A plain transport close still walks: that is a port nobody is holding.
    sockets.length = 0;

    const walking = new DiscordRpcSocket();

    walking.call('initialize', '123');

    await tick();

    sockets.at(-1).refuse(1006, '');

    await tick();

    expect(sockets.length, 2, 'ports tried after a non-Discord close');

    rpc.dispose();
    walking.dispose();
}

console.log(failures === 0 ? '\nOK' : `\n${failures} failure(s)`);

process.exit(failures === 0 ? 0 : 1);
