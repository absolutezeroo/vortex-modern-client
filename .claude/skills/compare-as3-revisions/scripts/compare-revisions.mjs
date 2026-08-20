#!/usr/bin/env node
/**
 * Compare two decompiled AS3 client revision trees:
 *  1. Message registry diff (composer + event headers): added / removed /
 *     moved (same wire shape at a new header number) / shape-changed.
 *  2. Readable class-file structure diff (added/removed .as files, ignoring
 *     obfuscated _SafeCls/_SafeStr/_SafePkg names, which are re-randomized
 *     on every build and would be pure noise).
 *
 * Usage:
 *   node compare-revisions.mjs <revisionRootA> <revisionRootB> [--json <out.json>]
 *
 * A "revision root" is a directory like sources/WIN63-202607011411-782849652
 * (any inner layout - src/, scripts/, ... - is discovered automatically).
 */
import {readdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';

const WIRE_READ_RE = /\.read(Integer|String|Boolean|Long|Short|Float|Double|Byte)\s*\(|parseStuffData\s*\(/g;
const LIST_CAP = 300;

function walkAsFiles(dir, out)
{
    for(const entry of readdirSync(dir, {withFileTypes: true}))
    {
        const full = join(dir, entry.name);

        if(entry.isDirectory())
        {
            walkAsFiles(full, out);
        }
        else if(entry.name.endsWith('.as'))
        {
            out.push(full);
        }
    }

    return out;
}

function findRegistryFile(files)
{
    let best = null;
    let bestCount = 0;

    // The registry is the file with the most `_composers[N] = Class;` lines.
    // Fast pass over communication/ paths first, full scan as fallback.
    for(const pass of [files.filter((f) => /communication/i.test(f)), files])
    {
        for(const file of pass)
        {
            const src = readFileSync(file, 'utf8');
            const count = (src.match(/_composers\[\d+\]\s*=/g) || []).length;

            if(count > bestCount)
            {
                bestCount = count;
                best = file;
            }
        }

        if(best && bestCount > 50) break;
    }

    return best;
}

function parseRegistry(file)
{
    const src = readFileSync(file, 'utf8');
    const maps = new Map();

    for(const m of src.matchAll(/(\w+)\[(\d+)\]\s*=\s*(\w+);/g))
    {
        const [, mapName, header, cls] = m;

        if(!maps.has(mapName)) maps.set(mapName, new Map());

        maps.get(mapName).set(Number(header), cls);
    }

    const composers = maps.get('_composers') ?? new Map();
    let events = new Map();
    let eventsMapName = '';

    for(const [name, map] of maps)
    {
        if(name === '_composers') continue;

        if(map.size > events.size)
        {
            events = map;
            eventsMapName = name;
        }
    }

    // Exact class resolution via the registry's own imports (basename lookup
    // alone is ambiguous when readable class names repeat across packages).
    const imports = new Map();

    for(const m of src.matchAll(/import\s+([\w.]+)\.(\w+);/g))
    {
        imports.set(m[2], m[1].replaceAll('.', '/'));
    }

    return {composers, events, eventsMapName, imports};
}

function buildClassIndex(files)
{
    const index = new Map();

    for(const file of files)
    {
        const name = file.replaceAll('\\', '/').split('/').pop().slice(0, -3);

        if(!index.has(name)) index.set(name, []);

        index.get(name).push(file);
    }

    return index;
}

function resolveClassFile(cls, index, imports)
{
    const candidates = index.get(cls);

    if(!candidates || candidates.length === 0) return null;

    if(candidates.length === 1) return candidates[0];

    const pkg = imports.get(cls);

    if(pkg)
    {
        const suffix = `/${pkg}/${cls}.as`;
        const match = candidates.find((c) => c.replaceAll('\\', '/').endsWith(suffix));

        if(match) return match;
    }

    return candidates[0];
}

function composerFingerprint(cls, index, imports)
{
    const file = resolveClassFile(cls, index, imports);

    if(!file) return null;

    const src = readFileSync(file, 'utf8');
    const ctor = src.match(new RegExp(`public function ${cls}\\(([^)]*)\\)`));

    if(!ctor) return null;

    const params = ctor[1].trim();

    if(params === '') return '(void)';

    return params.split(',').map((p) =>
    {
        const typed = p.match(/:\s*([\w.<>*]+)/);
        const hasDefault = p.includes('=');

        return (typed ? typed[1] : '*') + (hasDefault ? '=' : '');
    }).join(',');
}

function eventFingerprint(cls, index, imports)
{
    const file = resolveClassFile(cls, index, imports);

    if(!file) return null;

    const src = readFileSync(file, 'utf8');
    const parserRef = src.match(/super\(\s*param1\s*,\s*(\w+)\s*\)/);

    if(!parserRef) return null;

    // The event's own imports resolve its parser class package.
    const eventImports = new Map();

    for(const m of src.matchAll(/import\s+([\w.]+)\.(\w+);/g))
    {
        eventImports.set(m[2], m[1].replaceAll('.', '/'));
    }

    const parserFile = resolveClassFile(parserRef[1], index, eventImports);

    if(!parserFile) return `parser:${parserRef[1]}:unresolved`;

    const parserSrc = readFileSync(parserFile, 'utf8');
    const reads = [];

    for(const m of parserSrc.matchAll(WIRE_READ_RE))
    {
        reads.push(m[1] ?? 'StuffData');
    }

    return reads.length > 0 ? reads.join(',') : '(no-reads)';
}

/**
 * Real-name recovery for obfuscated registry classes, from usage context in
 * readable-named classes: `addMessageEvent(new _SafeCls_N(onSomething))`'s
 * callback name effectively names the event ("onMarketPlaceOffers" ->
 * MarketPlaceOffersEvent), and the readable method that does
 * `send(new _SafeCls_N(...))` names the composer
 * ("getPublicMarketPlaceOffers" -> GetMarketplaceOffersMessageComposer).
 * Obfuscation randomizes class names but usually leaves these readable.
 */
function buildUsageIndex(files, registryClasses, registryFile)
{
    const usage = new Map();
    const wanted = new Set([...registryClasses].filter((c) => /^_Safe(Cls|Str)_\d+$/.test(c)));

    if(wanted.size === 0) return usage;

    for(const file of files)
    {
        if(file === registryFile) continue;

        const base = file.replaceAll('\\', '/').split('/').pop().slice(0, -3);
        const fileIsReadable = !/^_Safe(Cls|Str|Pkg)_\d+/.test(base);
        const src = readFileSync(file, 'utf8');

        if(!src.includes('new _Safe')) continue;

        for(const m of src.matchAll(/new (_Safe(?:Cls|Str)_\d+)\(([^()]*)\)/g))
        {
            const cls = m[1];

            if(!wanted.has(cls)) continue;

            if(!usage.has(cls)) usage.set(cls, []);

            // Callback-style single readable identifier argument (events).
            const arg = m[2].trim();
            const callback = /^[a-z]\w+$/.test(arg) && !arg.startsWith('param') && !arg.startsWith('_loc') ? arg : null;

            // Enclosing readable method name (composers and everything else).
            const before = src.slice(0, m.index);
            const fn = [...before.matchAll(/function (\w+)\(/g)].pop();
            const method = fn && !/^_Safe/.test(fn[1]) ? fn[1] : null;

            usage.get(cls).push({file: base, fileIsReadable, callback, method});
        }
    }

    return usage;
}

function deriveName(cls, usage)
{
    const sites = usage.get(cls);

    if(!sites || sites.length === 0) return null;

    // Prefer a callback name from a readable class, then any callback, then a
    // readable Class::method() context.
    const pick = sites.find((s) => s.callback && s.fileIsReadable)
        ?? sites.find((s) => s.callback)
        ?? sites.find((s) => s.fileIsReadable && s.method)
        ?? sites.find((s) => s.method);

    if(!pick) return null;

    if(pick.callback) return `${pick.callback}${pick.fileIsReadable ? ` @ ${pick.file}` : ''}`;

    return `${pick.fileIsReadable ? `${pick.file}::` : ''}${pick.method}()`;
}

function loadRevision(root)
{
    const files = walkAsFiles(root, []);
    const registryFile = findRegistryFile(files);

    if(!registryFile) throw new Error(`No message registry found under ${root}`);

    const registry = parseRegistry(registryFile);
    const index = buildClassIndex(files);
    const registryClasses = new Set([...registry.composers.values(), ...registry.events.values()]);
    const usage = buildUsageIndex(files, registryClasses, registryFile);
    const composers = new Map();
    const events = new Map();

    for(const [header, cls] of registry.composers)
    {
        composers.set(header, {cls, fp: composerFingerprint(cls, index, registry.imports), hint: deriveName(cls, usage)});
    }

    for(const [header, cls] of registry.events)
    {
        events.set(header, {cls, fp: eventFingerprint(cls, index, registry.imports), hint: deriveName(cls, usage)});
    }

    // Readable (non-obfuscated) class paths, normalized from com/... down, for
    // the structure diff. Obfuscated names change every build - skip them.
    const readable = new Set();

    for(const file of files)
    {
        const norm = file.replaceAll('\\', '/');
        const base = norm.split('/').pop();

        if(/^_Safe(Cls|Str|Pkg)_\d+/.test(base)) continue;

        const comIdx = norm.indexOf('/com/');

        readable.add(comIdx >= 0 ? norm.slice(comIdx + 1) : base);
    }

    return {root, registryFile, composers, events, eventsMapName: registry.eventsMapName, readable, fileCount: files.length};
}

function diffSide(a, b)
{
    const onlyA = [];
    const onlyB = [];
    const changed = [];
    let unchanged = 0;

    for(const [header, entryA] of a)
    {
        const entryB = b.get(header);

        if(!entryB)
        {
            onlyA.push({header, ...entryA});
        }
        else if(entryA.fp !== null && entryB.fp !== null && entryA.fp !== entryB.fp)
        {
            changed.push({header, a: entryA, b: entryB});
        }
        else
        {
            unchanged++;
        }
    }

    for(const [header, entryB] of b)
    {
        if(!a.has(header)) onlyB.push({header, ...entryB});
    }

    // Moved = identical, UNIQUE wire shape that exists at a different header
    // number in each revision. Uniqueness on both sides filters out generic
    // shapes like "(void)" or "int" that dozens of messages share.
    const fpHeaders = (side) =>
    {
        const map = new Map();

        for(const [header, {fp}] of side)
        {
            if(fp === null) continue;

            if(!map.has(fp)) map.set(fp, []);

            map.get(fp).push(header);
        }

        return map;
    };

    const fpA = fpHeaders(a);
    const fpB = fpHeaders(b);
    const moved = [];
    const movedHeadersA = new Set();
    const movedHeadersB = new Set();

    for(const [fp, headersA] of fpA)
    {
        const headersB = fpB.get(fp);

        if(!headersB || headersA.length !== 1 || headersB.length !== 1) continue;

        if(headersA[0] !== headersB[0])
        {
            const entryA = a.get(headersA[0]);
            const entryB = b.get(headersB[0]);

            moved.push({
                from: headersA[0], to: headersB[0], fp, clsA: entryA.cls, clsB: entryB.cls,
                hint: entryB.hint ?? entryA.hint ?? null, via: 'shape',
            });
            movedHeadersA.add(headersA[0]);
            movedHeadersB.add(headersB[0]);
        }
    }

    // Second pass: match by usage-hint name (survives obfuscation across
    // revisions) for messages whose wire shape isn't unique enough for the
    // shape pass (a lone "(void)" or single int shared by dozens of
    // messages) - this is what actually shrinks the onlyA/onlyB noise down
    // to genuine removals/additions.
    const hintHeaders = (side, exclude) =>
    {
        const map = new Map();

        for(const [header, {hint}] of side)
        {
            if(!hint || exclude.has(header)) continue;

            const key = hint.split(' @ ')[0]; // strip "@ File" - callback/method name alone is the stable part
            if(!map.has(key)) map.set(key, []);

            map.get(key).push(header);
        }

        return map;
    };

    const hintA = hintHeaders(a, movedHeadersA);
    const hintB = hintHeaders(b, movedHeadersB);

    for(const [key, headersA] of hintA)
    {
        const headersB = hintB.get(key);

        if(!headersB || headersA.length !== 1 || headersB.length !== 1) continue;

        if(headersA[0] !== headersB[0])
        {
            const entryA = a.get(headersA[0]);
            const entryB = b.get(headersB[0]);

            moved.push({
                from: headersA[0], to: headersB[0], fp: `${entryA.fp} -> ${entryB.fp}`,
                clsA: entryA.cls, clsB: entryB.cls, hint: entryB.hint ?? entryA.hint, via: 'name',
            });
            movedHeadersA.add(headersA[0]);
            movedHeadersB.add(headersB[0]);
        }
    }

    const onlyAFinal = onlyA.filter((r) => !movedHeadersA.has(r.header));
    const onlyBFinal = onlyB.filter((r) => !movedHeadersB.has(r.header));

    onlyAFinal.sort((x, y) => x.header - y.header);
    onlyBFinal.sort((x, y) => x.header - y.header);
    changed.sort((x, y) => x.header - y.header);
    moved.sort((x, y) => x.from - y.from);

    return {onlyA: onlyAFinal, onlyB: onlyBFinal, changed, moved, unchanged};
}

function printList(title, rows, format)
{
    console.log(`\n### ${title} (${rows.length})`);

    for(const row of rows.slice(0, LIST_CAP)) console.log(format(row));

    if(rows.length > LIST_CAP) console.log(`... ${rows.length - LIST_CAP} more (use --json for the full list)`);
}

function printRemap(title, rows)
{
    console.log(`\n### ${title} (${rows.length})`);
    console.log('  old   new   via    hint');

    for(const row of rows.slice(0, LIST_CAP))
    {
        console.log(`  ${String(row.from).padEnd(6)}${String(row.to).padEnd(6)}${row.via.padEnd(7)}${row.hint ?? '(no hint - verify by hand)'}`);
    }

    if(rows.length > LIST_CAP) console.log(`  ... ${rows.length - LIST_CAP} more (use --json for the full list)`);
}

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const jsonOut = jsonIdx >= 0 ? args[jsonIdx + 1] : null;
const showFiles = args.includes('--files');
const roots = args.filter((a, i) => a !== '--files' && i !== jsonIdx && i !== jsonIdx + 1);

if(roots.length !== 2)
{
    console.error('Usage: node compare-revisions.mjs <revisionRootA> <revisionRootB> [--files] [--json <out.json>]');
    console.error('  --files   also print the full readable-.as-file added/removed diff (off by default - noisy, not message-registry-specific)');
    process.exit(1);
}

const [rootA, rootB] = roots.map((r) => resolve(r));

for(const r of [rootA, rootB])
{
    if(!statSync(r, {throwIfNoEntry: false})?.isDirectory())
    {
        console.error(`Not a directory: ${r}`);
        process.exit(1);
    }
}

console.log(`Revision A: ${rootA}`);
console.log(`Revision B: ${rootB}`);

const revA = loadRevision(rootA);
const revB = loadRevision(rootB);

console.log(`\nA: ${revA.fileCount} .as files | registry ${revA.registryFile} | ${revA.composers.size} composers, ${revA.events.size} events (map ${revA.eventsMapName})`);
console.log(`B: ${revB.fileCount} .as files | registry ${revB.registryFile} | ${revB.composers.size} composers, ${revB.events.size} events (map ${revB.eventsMapName})`);

const composerDiff = diffSide(revA.composers, revB.composers);
const eventDiff = diffSide(revA.events, revB.events);

const hintOf = (r) => r.hint ? `  <${r.hint}>` : '';

console.log('\n\n## COMPOSERS (client -> server)');
console.log(`unchanged at same header: ${composerDiff.unchanged}`);
printRemap('HEADER REMAP TABLE - update HabboMessages.ts old->new for these', composerDiff.moved);
printList('SHAPE CHANGED at same header (re-port needed, not just a header fix)', composerDiff.changed, (r) => `  ${r.header}  A:[${r.a.fp}]${hintOf(r.a)}  ->  B:[${r.b.fp}]${hintOf(r.b)}`);
printList('Only in A, no match found (removed, or verify by hand)', composerDiff.onlyA, (r) => `  ${r.header}  ${r.cls} [${r.fp ?? '?'}]${hintOf(r)}`);
printList('Only in B, no match found (new addition, or verify by hand)', composerDiff.onlyB, (r) => `  ${r.header}  ${r.cls} [${r.fp ?? '?'}]${hintOf(r)}`);

console.log('\n\n## EVENTS (server -> client)');
console.log(`unchanged at same header: ${eventDiff.unchanged}`);
printRemap('HEADER REMAP TABLE - update HabboMessages.ts old->new for these', eventDiff.moved);
printList('SHAPE CHANGED at same header (re-port needed, not just a header fix)', eventDiff.changed, (r) => `  ${r.header}  A:[${r.a.fp}]${hintOf(r.a)}  ->  B:[${r.b.fp}]${hintOf(r.b)}`);
printList('Only in A, no match found (removed, or verify by hand)', eventDiff.onlyA, (r) => `  ${r.header}  ${r.cls} [${r.fp ?? '?'}]${hintOf(r)}`);
printList('Only in B, no match found (new addition, or verify by hand)', eventDiff.onlyB, (r) => `  ${r.header}  ${r.cls} [${r.fp ?? '?'}]${hintOf(r)}`);

const addedFiles = [...revB.readable].filter((f) => !revA.readable.has(f)).sort();
const removedFiles = [...revA.readable].filter((f) => !revB.readable.has(f)).sort();

if(showFiles)
{
    console.log('\n\n## READABLE CLASS FILES (obfuscated names excluded, --files)');
    printList('Removed in B', removedFiles, (f) => `  - ${f}`);
    printList('Added in B', addedFiles, (f) => `  + ${f}`);
}

if(jsonOut)
{
    const toObj = (d) => ({
        moved: d.moved,
        changed: d.changed,
        onlyA: d.onlyA,
        onlyB: d.onlyB,
        unchanged: d.unchanged,
    });

    writeFileSync(jsonOut, JSON.stringify({
        revisionA: rootA,
        revisionB: rootB,
        composers: toObj(composerDiff),
        events: toObj(eventDiff),
        files: {added: addedFiles, removed: removedFiles},
    }, null, 2));
    console.log(`\nJSON written to ${jsonOut}`);
}
