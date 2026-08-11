#!/usr/bin/env node
// Lists every message `vortex-emulator` can send that this client registers no event for.
//
// The gap this finds is invisible to every other check in the repo: the client compiles, boots and
// renders fine while silently dropping a packet the server took the trouble to build. It is how
// the product-offer reply (header 1911) sat unhandled — the emulator answered `GetProductOffer`
// with a fully serialised offer and nothing on this side was listening.
//
// Read-only. Two sources:
//   - `vortex-emulator/Vortex.Revisions/Revision20260701/Headers.cs`, whose `*Composer` constants
//     are server→client (this client's *events*).
//   - `packages/vortex-engine/src/habbo/communication/HabboMessages.ts`, whose `_events.set(id, …)`
//     calls are what this client actually listens for.
//
// A header is also checked against the AS3 client's own event registry
// (`_SafeCls_2046.as::_SafeStr_4546[id]`). A header present there is one the real client handles,
// so the gap is this port's; a header absent from it is the emulator's own invention and needs
// deciding rather than porting.
//
// Usage:
//   node scripts/unlistened-server-messages.mjs            # summary + the list
//   node scripts/unlistened-server-messages.mjs --json
//   node scripts/unlistened-server-messages.mjs --emulator <path>

import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');

const args = process.argv.slice(2);
const asJson = args.includes('--json');

const emulatorArgIndex = args.indexOf('--emulator');
const emulatorRoot = emulatorArgIndex >= 0 && args[emulatorArgIndex + 1]
    ? resolve(args[emulatorArgIndex + 1])
    : resolve(REPO, '..', 'vortex-emulator');

const HEADERS = join(emulatorRoot, 'Vortex.Revisions', 'Revision20260701', 'Headers.cs');
const MESSAGES = join(REPO, 'packages', 'vortex-engine', 'src', 'habbo', 'communication', 'HabboMessages.ts');
const AS3_REGISTRY = join(
    REPO, 'sources', 'WIN63-202607011411-782849652', 'src', 'com', 'sulake', 'habbo', 'communication', '_SafeCls_2046.as'
);

for(const [label, path] of [['emulator headers', HEADERS], ['client registry', MESSAGES]])
{
    if(!existsSync(path))
    {
        console.error(`Missing ${label}: ${path}`);
        console.error(emulatorArgIndex < 0 ? 'Pass --emulator <path> if the checkout lives elsewhere.' : '');
        process.exit(2);
    }
}

// Server→client constants. `MessageEvent` constants in the same file are the other direction and
// are deliberately skipped.
const serverToClient = new Map();

for(const match of readFileSync(HEADERS, 'utf8').matchAll(/public const int ([A-Za-z0-9_]+Composer) = (\d+);/g))
{
    serverToClient.set(Number(match[2]), match[1]);
}

const listened = new Set();

for(const match of readFileSync(MESSAGES, 'utf8').matchAll(/_events\.set\((\d+),/g))
{
    listened.add(Number(match[1]));
}

const as3Registry = existsSync(AS3_REGISTRY) ? readFileSync(AS3_REGISTRY, 'utf8') : '';
const as3Headers = new Set();

for(const match of as3Registry.matchAll(/_SafeStr_4546\[(\d+)\]\s*=/g))
{
    as3Headers.add(Number(match[1]));
}

const gaps = [];

for(const [header, name] of [...serverToClient].sort((a, b) => a[0] - b[0]))
{
    if(listened.has(header)) continue;

    gaps.push({header, name, inAs3Registry: as3Headers.has(header)});
}

if(asJson)
{
    console.log(JSON.stringify({
        emulatorSends: serverToClient.size,
        clientListens: listened.size,
        gaps,
    }, null, 2));

    process.exit(0);
}

const portGaps = gaps.filter((g) => g.inAs3Registry);
const emulatorOnly = gaps.filter((g) => !g.inAs3Registry);

console.log(`Emulator can send : ${serverToClient.size}`);
console.log(`Client listens for: ${listened.size}`);
console.log(`Unlistened        : ${gaps.length}\n`);

console.log(`In the AS3 event registry too — this port's gap (${portGaps.length}):\n`);

for(const gap of portGaps) console.log(`  ${String(gap.header).padStart(5)}  ${gap.name}`);

if(emulatorOnly.length > 0)
{
    console.log(`\nNot in the AS3 registry — the emulator's own, needs deciding (${emulatorOnly.length}):\n`);

    for(const gap of emulatorOnly) console.log(`  ${String(gap.header).padStart(5)}  ${gap.name}`);
}

console.log('\nA header here is not automatically work: many belong to whole subsystems this port');
console.log('has not started (Game2/snowstorm, NFT/collectibles, camera, crafting, YouTube).');
console.log('Judge each by whether its module is ported, not by the count.');
