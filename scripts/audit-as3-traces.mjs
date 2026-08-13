#!/usr/bin/env node
/**
 * Audits every `AS3:`/`@see` source citation in the port against the trees on
 * disk, and reports three things:
 *
 *   1. paths that resolve in no tree at all;
 *   2. citations whose file exists but does not declare the member named;
 *   3. of those, how many are constructor traces (which cannot match in a file
 *      whose class is obfuscated to `_SafeCls_N`) or already carry a
 *      derived-name note.
 *
 * Read-only. It never rewrites: a citation that cannot be resolved here needs
 * identifying against the source by its members, and guessing is how a stale
 * citation becomes a confidently wrong one — see docs/IMPLEMENTATION_STATUS.md,
 * "Traceability: the repo-wide pass, and how the first attempt went wrong".
 *
 * Usage: node scripts/audit-as3-traces.mjs [--list]
 */
import {readFileSync, existsSync, readdirSync, statSync} from 'fs';
import {join, dirname, relative, basename} from 'path';
import {fileURLToPath} from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIST = process.argv.includes('--list');

const SRC_ROOTS = [
    'packages/vortex-engine/src',
    'packages/vortex-client/src',
    'packages/vortex-glaze/src',
    'packages/vortex-imager/src'
];

const collect = (dir, ext, out) =>
{
    for(const entry of readdirSync(dir))
    {
        const path = join(dir, entry);

        if(statSync(path).isDirectory())
        {
            if(entry !== 'dist' && entry !== 'node_modules') collect(path, ext, out);
        }
        else if(path.endsWith(ext)) out.push(path);
    }

    return out;
};

const files = [];
for(const root of SRC_ROOTS)
{
    const abs = join(ROOT, root);
    if(existsSync(abs)) collect(abs, '.ts', files);
}

const bodies = new Map();
const read = (path) =>
{
    let body = bodies.get(path);

    if(body === undefined)
    {
        body = existsSync(join(ROOT, path)) ? readFileSync(join(ROOT, path), 'utf8') : null;
        bodies.set(path, body);
    }

    return body;
};

const declares = (path, id) =>
{
    const body = read(path);

    return body !== null && new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(body);
};

const REF = /(sources\/[A-Za-z0-9_\-.]+\/[^\s)'"`,;]*?\.as)(?:::((?:get |set )?[A-Za-z_][A-Za-z0-9_]*(?:\(\))?))?/g;

let total = 0, ok = 0, ctors = 0, noted = 0;
const missingPath = new Map();
const missingMember = [];

for(const file of files)
{
    const source = readFileSync(file, 'utf8');
    const lines = source.split('\n');
    const tsClass = basename(file, '.ts');

    for(const match of source.matchAll(REF))
    {
        total++;

        const [whole, path, member] = match;

        if(!existsSync(join(ROOT, path)))
        {
            if(!missingPath.has(path)) missingPath.set(path, new Set());
            missingPath.get(path).add(relative(ROOT, file));
            continue;
        }

        const id = member ? member.replace(/^(get|set)\s+/, '').replace(/\(\)$/, '').trim() : '';

        if(!id || declares(path, id)) { ok++; continue; }

        if(id === tsClass) { ctors++; continue; }

        const index = lines.findIndex((line) => line.includes(whole));
        const around = lines.slice(Math.max(0, index - 4), index + 4).join(' ').toLowerCase();

        if(/derived|obfuscat|no tree|invented/.test(around)) { noted++; continue; }

        missingMember.push({file: relative(ROOT, file), path, id});
    }
}

const brokenPaths = [...missingPath.values()].reduce((sum, set) => sum + set.size, 0);

console.log(`citations examinées            : ${total}`);
console.log(`résolues (fichier + membre)    : ${ok}`);
console.log(`traces de constructeur         : ${ctors}`);
console.log(`noms dérivés, annotés          : ${noted}`);
console.log(`noms dérivés, NON annotés      : ${missingMember.length}`);
console.log(`chemins introuvables           : ${brokenPaths} (${missingPath.size} distincts)`);

if(LIST)
{
    console.log('\n--- chemins introuvables ---');
    for(const [path, users] of missingPath) console.log(`  ${path}\n      <- ${[...users].join('\n      <- ')}`);

    console.log('\n--- noms dérivés non annotés ---');
    for(const entry of missingMember) console.log(`  ${entry.id}  <- ${entry.file}`);
}

process.exitCode = missingMember.length > 0 ? 1 : 0;
