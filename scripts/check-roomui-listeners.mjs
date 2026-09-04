#!/usr/bin/env node
// Fails if RoomUI's roomObjectEventHandler listener table has drifted from the AS3 one.
//
// That table is the fifth wiring a furni widget needs (see RoomUI.ROOM_OBJECT_ENGINE_EVENTS): an
// engine event with no subscriber dies in the emitter, silently, while the widget, its handler,
// the factory case and the logic's `get widget()` all still read as correctly wired. The list had
// drifted to 15 of AS3's 43 entries before anyone noticed, so it gets a check.
//
// Usage: node scripts/check-roomui-listeners.mjs
import {readFileSync} from 'node:fs';

const AS3 = 'sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomUI.as';
const TS = 'packages/vortex-engine/src/habbo/ui/RoomUI.ts';
const EVENTS_DIR = 'packages/vortex-engine/src/habbo/room/events';

// AS3's listener table is a list of {"type":"X","callback":handler} pairs.
const as3 = new Set(
    [...readFileSync(AS3, 'utf8').matchAll(/"type":"([A-Z_]+)",\s*"callback":roomObjectEventHandler/g)]
        .map((match) => match[1])
);

// The TS side names constants, so resolve each `Class.MEMBER` against that class's own source.
const constants = new Map();

function valueOf(className, member)
{
    if(!constants.has(className))
    {
        const source = readFileSync(`${EVENTS_DIR}/${className}.ts`, 'utf8');

        constants.set(className, new Map(
            [...source.matchAll(/readonly\s+([A-Z_]+)(?::\s*string)?\s*=\s*'([^']+)'/g)]
                .map((match) => [match[1], match[2]])
        ));
    }

    const value = constants.get(className).get(member);

    if(!value) throw new Error(`${className}.${member} is not declared in ${className}.ts`);

    return value;
}

const table = readFileSync(TS, 'utf8').match(/ROOM_OBJECT_ENGINE_EVENTS: readonly string\[\] = \[([^\]]*)\]/);

if(!table) throw new Error(`RoomUI.ROOM_OBJECT_ENGINE_EVENTS not found in ${TS}`);

const ported = new Set(
    [...table[1].matchAll(/^\s*([A-Za-z]+)\.([A-Z_]+),/gm)].map(([, cls, member]) => valueOf(cls, member))
);

const missing = [...as3].filter((type) => !ported.has(type));
const extra = [...ported].filter((type) => !as3.has(type));

for(const type of missing) console.error(`MISSING (AS3 subscribes it, RoomUI.ts does not): ${type}`);
for(const type of extra) console.error(`EXTRA (not in the AS3 table): ${type}`);

if(missing.length || extra.length) process.exit(1);

console.log(`OK - all ${as3.size} roomObjectEventHandler listeners match the AS3 table.`);
