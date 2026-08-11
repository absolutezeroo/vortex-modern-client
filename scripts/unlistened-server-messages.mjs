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
// It also runs a second, narrower check the first one cannot see: a header the client *does*
// listen for, whose emulator serializer writes no bytes at all while the client's parser reads
// some. That is strictly worse than an unlistened message — the packet arrives, the parser reads
// past the end of it, and everything after that in the stream is garbage. `PostItPlaced` (2145)
// was exactly this: composer record, serializer, and a registration in InventoryMap, with an empty
// `Serialize` body. Nothing about either side looks wrong from that side alone.
//
// An empty serializer is perfectly legal on its own — plenty of messages carry no payload — which
// is why the check only fires when the client's parser actually reads.
//
// Usage:
//   node scripts/unlistened-server-messages.mjs            # summary + the list
//   node scripts/unlistened-server-messages.mjs --json
//   node scripts/unlistened-server-messages.mjs --emulator <path>

import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {resolve, dirname, join, sep} from 'node:path';
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

// --- Second check: listened-for headers whose serializer writes nothing ---------------------
//
// Walks the emulator's serializers for an empty `Serialize` body, then asks whether this client
// listens for that header at all and whether its parser reads anything. Only the intersection is
// reported.

const SERIALIZER_ROOT = join(emulatorRoot, 'Vortex.Revisions', 'Revision20260701', 'Serializers');
const CLIENT_MESSAGES_ROOT = join(REPO, 'packages', 'vortex-engine', 'src', 'habbo', 'communication', 'messages');

function walk(dir, out = [])
{
    if(!existsSync(dir)) return out;

    for(const entry of readdirSync(dir, {withFileTypes: true}))
    {
        const full = join(dir, entry.name);

        if(entry.isDirectory()) walk(full, out);
        else if(entry.name.endsWith('.cs') || entry.name.endsWith('.ts')) out.push(full);
    }

    return out;
}

// Composer type name -> whether its Serialize body puts any bytes on the wire.
//
// "Writes" is deliberately generous, and it has to be: a body that reads
// `CatalogOfferSerializer.SerializeAsPurchased(packet, message.Offer)` writes plenty without a
// single `Write*` call of its own. Looking only for `Write[A-Z]` flagged 42 messages, of which the
// first three checked by hand were two false positives — so anything that hands `packet` to
// something else counts as writing.
const serializerWrites = new Map();

for(const file of walk(SERIALIZER_ROOT))
{
    const text = readFileSync(file, 'utf8');
    const composer = text.match(/AbstractSerializer<([A-Za-z0-9_]+)>/);
    const body = text.match(/protected override void Serialize\([^)]*\)\s*\{([\s\S]*?)\n {4}\}/);

    if(!composer || !body) continue;

    const writesDirectly = /\bWrite[A-Z]/.test(body[1]);
    const delegatesPacket = /\(\s*packet\b/.test(body[1]);

    serializerWrites.set(composer[1], writesDirectly || delegatesPacket);
}

// Header -> the emulator constant name it was registered under, from the revision maps.
const MAPS_ROOT = join(emulatorRoot, 'Vortex.Revisions', 'Revision20260701', 'Maps');
const composerToHeaderName = new Map();

for(const file of walk(MAPS_ROOT))
{
    const text = readFileSync(file, 'utf8');

    for(const m of text.matchAll(/new ([A-Za-z0-9_]+)Serializer\(\s*MessageComposer\.([A-Za-z0-9_]+)/g))
    {
        composerToHeaderName.set(m[1], m[2]);
    }
}

// Client event class -> whether its parser reads anything, resolved through the event's `super()`.
const clientParserReads = new Map();
const clientFiles = walk(CLIENT_MESSAGES_ROOT);
const parserReadsByName = new Map();

for(const file of clientFiles)
{
    const text = readFileSync(file, 'utf8');
    const cls = text.match(/export class ([A-Za-z0-9_]+)/);

    if(!cls) continue;

    if(/implements IMessageParser/.test(text))
    {
        parserReadsByName.set(cls[1], /wrapper\.read/.test(text) || /new [A-Za-z0-9_]+\(wrapper\)/.test(text));
    }
}

for(const file of clientFiles)
{
    const text = readFileSync(file, 'utf8');
    const cls = text.match(/export class ([A-Za-z0-9_]+) extends MessageEvent/);
    const parser = text.match(/super\(callback,\s*([A-Za-z0-9_]+)\)/);

    if(!cls || !parser) continue;

    clientParserReads.set(cls[1], parserReadsByName.get(parser[1]) ?? false);
}

// Header -> client event class name, from `_events.set(id, Name)`.
const listenedNames = new Map();

for(const match of readFileSync(MESSAGES, 'utf8').matchAll(/_events\.set\((\d+),\s*([A-Za-z0-9_]+)\)/g))
{
    listenedNames.set(Number(match[1]), match[2]);
}

// Composer types some handler actually constructs. An empty serializer for a composer nobody
// builds is latent; one for a composer that goes out is breaking traffic today, and the two
// deserve very different urgency.
const HANDLER_ROOTS = ['Vortex.PacketHandlers', 'Vortex.Rooms', 'Vortex.Players', 'Vortex.Navigator', 'Vortex.Messages'];
const constructedComposers = new Set();

for(const root of HANDLER_ROOTS)
{
    for(const file of walk(join(emulatorRoot, root)))
    {
        if(file.includes(`${sep}obj${sep}`)) continue;

        for(const m of readFileSync(file, 'utf8').matchAll(/new ([A-Za-z0-9_]+MessageComposer|[A-Za-z0-9_]+Composer)\s*[({]/g))
        {
            constructedComposers.add(m[1]);
        }
    }
}

const nameToHeader = new Map([...serverToClient].map(([h, n]) => [n, h]));
const silentWrites = [];

for(const [composerType, writes] of serializerWrites)
{
    if(writes) continue;

    const headerName = composerToHeaderName.get(composerType);
    const header = headerName ? nameToHeader.get(headerName) : undefined;

    if(header === undefined) continue;

    const eventName = listenedNames.get(header);

    if(!eventName || !clientParserReads.get(eventName)) continue;

    silentWrites.push({
        header,
        name: headerName,
        composerType,
        eventName,
        sentToday: constructedComposers.has(composerType),
    });
}

silentWrites.sort((a, b) => a.header - b.header);

if(asJson)
{
    console.log(JSON.stringify({
        emulatorSends: serverToClient.size,
        clientListens: listened.size,
        gaps,
        silentWrites,
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

if(silentWrites.length > 0)
{
    console.log('\nWORSE THAN UNLISTENED — the server sends these and writes no bytes, while this');
    const live = silentWrites.filter((entry) => entry.sentToday).length;

    console.log(`client's parser reads some (${silentWrites.length}, of which ${live} are actually built by a`);
    console.log('handler today — the rest would break the moment someone wires them up):\n');

    for(const entry of silentWrites)
    {
        console.log(`  ${String(entry.header).padStart(5)}  ${entry.name}  ->  ${entry.eventName}`);
    }
}
else
{
    console.log('\nNo listened-for header has an empty serializer behind it.');
}
