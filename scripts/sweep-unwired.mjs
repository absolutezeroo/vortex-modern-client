#!/usr/bin/env node
//
// The priority-0 sweep, mechanised.
//
//   node scripts/sweep-unwired.mjs habbo/toolbar habbo/navigator habbo/session
//
// Answers, per AS3 module: "AS3 subscribes to this message — does the port?"
//
// This is the third question, next to the other two tools. `wire-coverage.mjs` compares the client
// against the *server*; `unwired-messages.mjs` asks what the port wrote and left out of the
// registry; this one asks what AS3 *subscribes to* that the port's matching module does not.
//
// Two things it does that a hand-run grep does not, each of which changed the 2026-08-14 result:
//
//   - it asks whether the event is constructed **by this module**, not merely somewhere. Four other
//     modules construct `UserRightsMessageEvent`; the toolbar still did not, and AS3 says it should.
//   - it strips comments first. A commented-out registration reads as a construction, and two
//     findings sat behind the same `// TODO: Register additional message events when implemented`.
//
// A hit is a worklist entry, not a verdict: some are correct deviations (the port reaching the same
// state through another message) and some are modes this port does not implement at all. Read the
// AS3 body before wiring anything — `RoomSessionManager::onRoomVisualizationSettings` returns
// immediately outside the room-viewer embed, and wiring it would have been noise.
//
// The recipe is the corrected one from docs/IMPLEMENTATION_STATUS.md priority 0: resolve each
// AS3 `_SafeCls_N` through the registry (`_SafeCls_2046.as`) to its **id** first, then ask whether
// the TS event class that the port registers at that id is ever CONSTRUCTED. Never match on the
// handler's name — a same-named method on another class of the module satisfies that grep, which
// is how `QuestController.onActivityPoints()` masked the missing subscription on 2026-08-14.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const AS3 = join(ROOT, 'sources/WIN63-202607011411-782849652/src/com/sulake');
const REGISTRY_AS3 = join(AS3, 'habbo/communication/_SafeCls_2046.as');
const REGISTRY_TS = join(ROOT, 'packages/vortex-engine/src/habbo/communication/HabboMessages.ts');
const ENGINE_SRC = join(ROOT, 'packages/vortex-engine/src');

function walk(dir, filter, out = [])
{
    if(!existsSync(dir)) return out;

    for(const entry of readdirSync(dir))
    {
        const full = join(dir, entry);

        if(statSync(full).isDirectory()) walk(full, filter, out);
        else if(filter(entry)) out.push(full);
    }

    return out;
}

// AS3 registry: `_SafeStr_4546[2768] = _SafeCls_1234;` — id -> event class.
const as3ClassToId = new Map();
{
    const text = readFileSync(REGISTRY_AS3, 'utf8');

    for(const [, id, cls] of text.matchAll(/_SafeStr_\d+\[(\d+)\]\s*=\s*(_SafeCls_\d+)\s*;/g))
    {
        as3ClassToId.set(cls, Number(id));
    }
}

// Port registry: `this._events.set(2768, InitCameraMessageEvent);` — id -> TS class.
const idToTsClass = new Map();
{
    const text = readFileSync(REGISTRY_TS, 'utf8');

    for(const [, id, cls] of text.matchAll(/_events\.set\(\s*(\d+)\s*,\s*(\w+)\s*\)/g))
    {
        idToTsClass.set(Number(id), cls);
    }
}

// Every `new XMessageEvent(` in the engine. Construction is the question: a class that is imported
// or registered but never constructed is subscribed by nobody.
const constructedIn = new Map();

for(const file of walk(ENGINE_SRC, (e) => e.endsWith('.ts')))
{
    // Strip comments first. A commented-out registration reads as a construction and hides a real
    // gap — `RespectNotificationMessageEvent` sits behind `// TODO: Register additional message
    // events when implemented` in RoomChatHandler.ts and was reported clean before this.
    const text = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^[ \t]*\/\/.*$/gm, '');

    for(const [, cls] of text.matchAll(/new\s+(\w+(?:MessageEvent|Event))\s*\(/g))
    {
        if(!constructedIn.has(cls)) constructedIn.set(cls, new Set());

        constructedIn.get(cls).add(relative(ROOT, file).replace(/\\/g, '/'));
    }
}

const modules = process.argv.slice(2);

for(const mod of modules)
{
    const dir = join(AS3, mod);
    const rows = [];

    for(const file of walk(dir, (e) => e.endsWith('.as')))
    {
        const text = readFileSync(file, 'utf8');

        for(const [, cls, cb] of text.matchAll(/add(?:HabboConnection)?MessageEvent\(\s*new\s+(\w+)\s*\(\s*([\w.]*)/g))
        {
            rows.push({ cls, cb, file: relative(AS3, file).replace(/\\/g, '/') });
        }
    }

    // One AS3 class may be registered from several files; the question is per message, not per site.
    const byClass = new Map();

    for(const r of rows)
    {
        if(!byClass.has(r.cls)) byClass.set(r.cls, { ...r, sites: [] });

        byClass.get(r.cls).sites.push(`${r.file}(${r.cb})`);
    }

    const missing = [];
    const unresolved = [];
    const ok = [];

    for(const [cls, info] of byClass)
    {
        const id = as3ClassToId.get(cls);

        if(id === undefined)
        {
            // Not in the events registry: either a composer-side class, an unobfuscated name, or a
            // message this build no longer routes. Reported, never guessed at.
            unresolved.push({ cls, ...info });
            continue;
        }

        const ts = idToTsClass.get(id);

        if(!ts)
        {
            missing.push({ cls, id, ts: null, reason: 'id absent du registre TS (message non porté)', ...info });
            continue;
        }

        const sites = constructedIn.get(ts);

        if(!sites)
        {
            missing.push({ cls, id, ts, reason: 'classe TS enregistrée mais jamais construite', ...info });
            continue;
        }

        // The real question is per module. A message another module subscribes to is still a gap
        // here: `ActivityPoints` was constructed by HabboCatalog and by nobody in habbo/quest, and
        // "constructed somewhere" would have reported it clean (2026-08-14).
        const inModule = [...sites].filter((s) => s.includes(`/${mod}/`));

        if(inModule.length === 0)
        {
            missing.push({
                cls, id, ts,
                reason: `souscrit ailleurs seulement : ${[...sites].join(', ')}`,
                ...info,
            });
            continue;
        }

        ok.push({ cls, id, ts });
    }

    console.log(`\n=== ${mod} ===`);
    console.log(`  ${byClass.size} messages souscrits par AS3 — ${ok.length} branchés, ${missing.length} MANQUANTS, ${unresolved.length} non résolus`);

    for(const m of missing.sort((a, b) => a.id - b.id))
    {
        console.log(`  MANQUE  ${String(m.id).padStart(4)}  ${m.ts ?? m.cls}`);
        console.log(`            ${m.reason}`);
        console.log(`            AS3: ${m.sites.join(', ')}`);
    }

    for(const u of unresolved)
    {
        console.log(`  ?       ----  ${u.cls}  (pas dans _SafeCls_2046) — ${u.sites.join(', ')}`);
    }
}
