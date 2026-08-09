#!/usr/bin/env node
//
// Finds message classes this port has written and never registered.
//
//   node scripts/unwired-messages.mjs            summary by folder
//   node scripts/unwired-messages.mjs --full     every unwired class
//
// This asks a different question from `wire-coverage.mjs`. That one compares the client against the
// server and answers "what does the server offer that we cannot reach". This one looks only at the
// client and answers "what did we already write and then never plug in" — the failure mode that
// left the entire moderation toolset dead: 23 composers ported, 0 registered, every button
// reaching a composer the connection had no header for, and not one error logged.
//
// A hit here is not automatically a bug. Some classes are deliberately unregistered — a composer
// whose body no longer matches the primary tree must stay out until it is re-ported, because a
// malformed message is worse than an unreachable one. So the output is a worklist, not a verdict:
// resolve each id against WIN63's registry and check the constructor arity before wiring anything.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const MESSAGES = join(ROOT, 'packages/vortex-engine/src/habbo/communication/messages');
const REGISTRY = join(ROOT, 'packages/vortex-engine/src/habbo/communication/HabboMessages.ts');

// `incoming/` also holds the DTOs a parser builds (AllVariablesInRoom, SharedGlobalPlaceholder, …).
// Those have no header and never belonged in the registry, so only classes that really extend a
// message base count — without this the real findings drown in ~90 false ones.
const IS_MESSAGE = /extends\s+Message(?:Event|Composer)/;

function walk(dir, out = [])
{
    for(const entry of readdirSync(dir))
    {
        const full = join(dir, entry);

        if(statSync(full).isDirectory()) walk(full, out);
        else if(entry.endsWith('.ts') && entry !== 'index.ts') out.push(full);
    }

    return out;
}

const registry = readFileSync(REGISTRY, 'utf8');

// A class counts as registered when it appears inside a `_composers.set(...)` / `_events.set(...)`
// call — matching the bare name elsewhere in the file (an import, a comment) would hide real gaps.
const registered = new Set();

for(const [, name] of registry.matchAll(/_(?:composers|events)\.set\(\s*\d+\s*,\s*(\w+)\s*\)/g))
{
    registered.add(name);
}

const rows = [];

for(const file of walk(MESSAGES))
{
    const rel = relative(MESSAGES, file).replaceAll('\\', '/');
    const kind = rel.startsWith('outgoing/') ? 'composer' : rel.startsWith('incoming/') ? 'event' : null;

    if(kind === null) continue;

    const source = readFileSync(file, 'utf8');
    const match = /export class (\w+)/.exec(source);

    if(match === null || !IS_MESSAGE.test(source)) continue;

    const name = match[1];

    if(registered.has(name)) continue;

    rows.push({ kind, name, folder: rel.split('/').slice(0, -1).join('/') });
}

const byFolder = new Map();

for(const row of rows)
{
    if(!byFolder.has(row.folder)) byFolder.set(row.folder, []);

    byFolder.get(row.folder).push(row);
}

const composers = rows.filter((r) => r.kind === 'composer').length;

console.log(`\nUnwired message classes: ${rows.length}  (${composers} composers, ${rows.length - composers} events)\n`);

for(const [folder, list] of [...byFolder].sort((a, b) => b[1].length - a[1].length))
{
    console.log(`  ${String(list.length).padStart(3)}  ${folder}`);

    if(process.argv.includes('--full'))
    {
        for(const row of list.sort((a, b) => a.name.localeCompare(b.name)))
        {
            console.log(`         ${row.name}`);
        }
    }
}

console.log('');
