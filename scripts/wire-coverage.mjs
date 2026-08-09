#!/usr/bin/env node
//
// Measures what the *server* can do that this client cannot reach, by joining the emulator's
// header table to the client's own message registry on the header id.
//
//   node scripts/wire-coverage.mjs            summary + the gaps that matter
//   node scripts/wire-coverage.mjs --full     every gap, not just the top families
//
// Two directions, and they mean different things:
//
//   send gap  — the emulator implements a handler for a message the client never composes.
//               A feature the server is sitting there waiting for; the player cannot trigger it.
//   recv gap  — the emulator sends a message the client registers no event for.
//               Server data arriving and being dropped on the floor; usually a screen that stays
//               empty or stale rather than an error.
//
// The emulator is corroboration, never authority, on ids (CLAUDE.md → header source-of-truth
// order). It is authority on one thing only, which is all this script uses it for: whether the
// server implements that message at all.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const EMULATOR = resolve(ROOT, '..', 'vortex-emulator');
const HEADERS = join(EMULATOR, 'Vortex.Revisions/Revision20260701/Headers.cs');
const REGISTRY = join(ROOT, 'packages/vortex-engine/src/habbo/communication/HabboMessages.ts');

if(!existsSync(HEADERS))
{
    console.error(`Emulator headers not found at ${HEADERS} — is ../vortex-emulator checked out?`);
    process.exit(1);
}

// Both blocks live in one file: `internal static class MessageEvent { ... }` is client→server,
// `MessageComposer` is server→client.
function parseHeaders()
{
    const text = readFileSync(HEADERS, 'utf8');
    const out = { event: new Map(), composer: new Map() };
    let section = null;

    for(const line of text.split('\n'))
    {
        const classMatch = /class\s+(MessageEvent|MessageComposer)\b/.exec(line);

        if(classMatch)
        {
            section = classMatch[1] === 'MessageEvent' ? 'event' : 'composer';

            continue;
        }

        const constMatch = /public\s+const\s+int\s+(\w+)\s*=\s*(-?\d+)\s*;/.exec(line);

        if(constMatch && section !== null)
        {
            // The emulator flags its own guesses. A header it could not resolve against either AS3
            // revision is not evidence of a client gap — GetRoomEntryData (1250) is one of these,
            // and the client's real room entry is OpenFlatConnectionMessageComposer.
            if(/UNRESOLVED|not found|placeholder/i.test(line)) continue;

            out[section].set(parseInt(constMatch[2], 10), constMatch[1]);
        }
    }

    return out;
}

function parseClientRegistry()
{
    const text = readFileSync(REGISTRY, 'utf8');
    const composers = new Set();
    const events = new Set();

    for(const [, id] of text.matchAll(/_composers\.set\(\s*(\d+)/g)) composers.add(parseInt(id, 10));
    for(const [, id] of text.matchAll(/_events\.set\(\s*(\d+)/g)) events.add(parseInt(id, 10));

    return { composers, events };
}

// Which handler families the emulator actually implements — a header constant with no handler
// behind it is not a server feature, so those are excluded from the "waiting for you" count.
function emulatorHandlerNames()
{
    const dir = join(EMULATOR, 'Vortex.PacketHandlers');
    const names = new Set();

    if(!existsSync(dir)) return names;

    const walk = (path) =>
    {
        for(const entry of readdirSync(path, { withFileTypes: true }))
        {
            const full = join(path, entry.name);

            if(entry.isDirectory()) walk(full);
            else if(entry.name.endsWith('MessageHandler.cs')) names.add(entry.name.replace('MessageHandler.cs', ''));
        }
    };

    walk(dir);

    return names;
}

// Group by the feature word the header name starts with, so the output is readable as "which
// parts of the game" rather than 200 loose ids.
function family(name)
{
    // Ordered: the first pattern that matches wins, so the specific feature beats the generic
    // noun it happens to contain (a "GetForumThreads" is forums, not "Get").
    const families = [
        ['Camera / photos', /Camera|Photo|Selfie|RenderRoom|PublishPhoto|Interstitial/],
        ['Group forums', /Forum|Thread|PostMessage|ModerateMessage/],
        ['Guide / helper', /Guide|ChatReview/],
        ['Moderation (staff)', /^Mod|Moderate|Cfh|CallForHelp|Issue|Sanction|Chatlog|PeerUsers|RoomUsersClassification/],
        ['SnowWar / games', /^Game2|GameDirectory|Leaderboard|Snowball|QuickJoin|StartSnowWar/],
        ['NFT / collectibles / minting', /Nft|Collectib|Mint|CollectorScore|Wallet/],
        ['Crafting', /Craft/],
        ['Marketplace', /Marketplace|MakeOffer/],
        ['Room music (jukebox / trax)', /Jukebox|Song|Trax|OfficialSong/],
        ['YouTube furni', /Youtube/],
        ['Room competitions', /Competition|SubmittableRoom|VoteForRoom|Quiz/],
        ['Targeted offers / shop', /TargetedOffer|Shop|BundleDiscount|RentOrBuyout|GiftWrapping|RoomAdPurchase|NewAdditions|ClubExtend|Silver|BadgePoint/],
        ['Room state / interaction', /Room|Floor|Tile|LookTo|ClickCharacter|CarryItem|CustomizeAvatarWithFurni|UserName|StarGem/],
        ['Talents / achievements', /Talent|Achievement|Badge|Quest/],
        ['Wired', /Wired/],
        ['Messenger / friends', /Friend|Messages|Message$/],
        ['Preferences / misc', /Preference|Setting|GetSecondsUntil/]
    ];

    for(const [label, re] of families)
    {
        if(re.test(name)) return label;
    }

    return 'other';
}

function report(title, gaps, note)
{
    const byFamily = new Map();

    for(const g of gaps)
    {
        const key = family(g.name);

        if(!byFamily.has(key)) byFamily.set(key, []);

        byFamily.get(key).push(g);
    }

    console.log(`\n${title} — ${gaps.length}`);
    console.log(note);
    console.log('');

    const rows = [...byFamily].sort((a, b) => b[1].length - a[1].length);

    for(const [key, list] of rows)
    {
        console.log(`  ${String(list.length).padStart(3)}  ${key}`);

        if(process.argv.includes('--full'))
        {
            for(const g of list.sort((a, b) => a.name.localeCompare(b.name)))
            {
                console.log(`         ${g.id}\t${g.name}${g.handled ? '  [handler]' : ''}`);
            }
        }
    }
}

const headers = parseHeaders();
const client = parseClientRegistry();
const handlers = emulatorHandlerNames();

const sendGaps = [];

for(const [id, name] of headers.event)
{
    if(client.composers.has(id)) continue;

    const base = name.replace(/MessageEvent$|Event$/, '');

    sendGaps.push({ id, name, handled: handlers.has(base) });
}

const recvGaps = [];

for(const [id, name] of headers.composer)
{
    if(!client.events.has(id)) recvGaps.push({ id, name, handled: false });
}

console.log(`Emulator headers   : ${headers.event.size} client→server, ${headers.composer.size} server→client`);
console.log(`Client registry    : ${client.composers.size} composers, ${client.events.size} events`);
console.log(`Emulator handlers  : ${handlers.size} *MessageHandler.cs`);

const withHandler = sendGaps.filter((g) => g.handled);

report(
    'SEND GAPS (client cannot trigger)',
    sendGaps,
    `  ${withHandler.length} of these have a real handler behind them — the server is implemented and waiting.`
);

report(
    'RECV GAPS (client ignores server data)',
    recvGaps,
    '  The server sends these; nothing in the client is registered to read them.'
);

console.log('');
