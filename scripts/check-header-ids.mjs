#!/usr/bin/env node
//
// Every packet id the client registers, checked against the WIN63 registry.
//
//   node scripts/check-header-ids.mjs [--full]
//
// The fourth question, next to the other three. `wire-coverage.mjs` asks what the *emulator* knows
// that the client does not; `unwired-messages.mjs` asks what the port wrote and left out of its own
// registry; `sweep-unwired.mjs` asks what AS3 subscribes to that the port does not. This one asks
// the only question with an authoritative answer: **is this id in the real client's registry at
// all?**
//
// It exists because the recycler was found broken on 2026-08-27 with all three of its composers on
// ids that appear in no registry table (1246 / 2516 / 2956 against the real 1730 / 3669 / 1796).
// Nothing caught it: the client registered them, so `unwired-messages` was happy; the emulator had
// already corrected its side on 2026-08-22, so the client's own numbers simply never matched
// anything and the feature was mute. A wrong id is worse than a missing one — the packet is sent,
// the server reads it as some other message, and nobody errors.
//
// The registry cannot tell us the id is on the *right* class (both sides are obfuscated), only that
// it exists. That is enough: an id in no table is wrong with certainty.
//
//   AS3  `_composers[1730] = _SafeCls_2061;`     client→server, the port's `_composers`
//   AS3  `_SafeStr_4546[2166] = _SafeCls_2004;`  server→client, the port's `_events`
//
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REGISTRY = join(ROOT, 'sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as');
const PORT = join(ROOT, 'packages/vortex-engine/src/habbo/communication/HabboMessages.ts');

const full = process.argv.includes('--full');

// Ids that are deliberately not in the WIN63 registry because they are not Habbo messages. Both
// blocks are corroborated in the emulator's Headers.cs, which marks them "Vortex-custom (not in
// official AS3 dumps)". Anything else absent from the registry is a bug, not a new entry here —
// add to this list only when the emulator side says the same thing.
const VORTEX_CUSTOM = new Set([
    4600, 4601, // rentable-space configuration
    8001, 8002, 8003, 8004, 8005, 8006, 8007 // vortex-glaze furni editor
]);

// The registry's two tables. `_composers` is named; the incoming one is an obfuscated field, so it
// is matched by shape — an `_SafeStr_N[id] = _SafeCls_N;` line — and there is only one such field.
const registrySrc = readFileSync(REGISTRY, 'utf8');

const collect = (re) =>
{
    const out = new Set();
    let m;

    while((m = re.exec(registrySrc)) !== null) out.add(Number(m[1]));

    return out;
};

const as3Composers = collect(/_composers\[(\d+)\]\s*=/g);
const as3Events = collect(/_SafeStr_\d+\[(\d+)\]\s*=/g);

// The port's side. Comment-stripped first: a commented-out registration is not a registration, and
// the star-gem line (`// this._composers.set(1111, ...)`) is deliberately one.
const portSrc = readFileSync(PORT, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');

const portEntries = (kind) =>
{
    const out = [];
    const re = new RegExp(`_${kind}\\.set\\((\\d+),\\s*([A-Za-z0-9_]+)`, 'g');
    let m;

    while((m = re.exec(portSrc)) !== null) out.push({id: Number(m[1]), name: m[2]});

    return out;
};

let bad = 0;

for(const [kind, as3Ids, label] of [
    ['composers', as3Composers, 'COMPOSERS (client→server)'],
    ['events', as3Events, 'EVENTS (server→client)']
])
{
    const entries = portEntries(kind);
    const orphans = entries.filter((e) => !as3Ids.has(e.id) && !VORTEX_CUSTOM.has(e.id));
    const custom = entries.filter((e) => VORTEX_CUSTOM.has(e.id));
    const dupes = new Map();

    for(const e of entries)
    {
        if(!dupes.has(e.id)) dupes.set(e.id, []);

        dupes.get(e.id).push(e.name);
    }

    const collisions = [...dupes.entries()].filter(([, names]) => names.length > 1);

    console.log(`\n${label} — ${entries.length} registered, ${as3Ids.size} in the WIN63 registry`);
    console.log(`  ids in no registry table : ${orphans.length}`);
    console.log(`  ids registered twice     : ${collisions.length}   (the last set() wins)`);
    console.log(`  vortex-custom, allowed   : ${custom.length}`);

    bad += orphans.length + collisions.length;

    if(orphans.length && (full || orphans.length <= 25))
    {
        console.log('');

        for(const o of orphans.sort((a, b) => a.id - b.id)) console.log(`    ${String(o.id).padStart(5)}  ${o.name}`);
    }
    else if(orphans.length)
    {
        console.log(`\n    (--full pour la liste)`);
    }

    for(const [id, names] of collisions) console.log(`    !! ${id} → ${names.join(', ')}`);
}

console.log(`\nUn id absent de la registry est faux avec certitude. Un id présent n'est pas`);
console.log(`pour autant sur la bonne classe — les deux côtés sont obfusqués. Croiser avec`);
console.log(`l'émulateur (Vortex.Revisions/Revision20260701/Headers.cs) pour lever le doute.`);

process.exit(bad > 0 ? 1 : 0);
