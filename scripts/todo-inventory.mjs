#!/usr/bin/env node
//
// Inventories the port's TODO markers and classifies them by what actually blocks each one,
// so `docs/IMPLEMENTATION_STATUS.md` can carry a re-measured number instead of a hand-typed
// one. Read-only: it never edits a file.
//
//   node scripts/todo-inventory.mjs             summary + per-module + hottest files
//   node scripts/todo-inventory.mjs --stale     only the "blocker may have landed since" list
//   node scripts/todo-inventory.mjs --module habbo/catalog
//   node scripts/todo-inventory.mjs --json
//
// Scope note: `packages/*/dist` is build output (gitignored) and carries a copy of every
// `.d.ts` TODO — counting it double-counts ~90 markers, so it is excluded here.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PACKAGES = join(ROOT, 'packages');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'assets']);

// Ordered: the first pattern that matches a block wins, so the more specific
// "this will never be done" reading is tested before the generic ones.
const CATEGORIES = [
    {
        key: 'decided',
        label: 'Décision définitive (assumée, ne sera pas portée)',
        re: /intentionally not ported|deliberately|by design|is legacy|dead code|never (?:actually )?exercised|\bmoot\b|out of scope|not needed here/i,
    },
    {
        key: 'module',
        label: 'Bloqué sur un module entier non porté',
        re: /unported|not ported|isn't ported|does not exist in this port|doesn't exist in this port|never ported/i,
    },
    {
        key: 'wire',
        label: 'Wire / serveur (composer, parser, header)',
        re: /composer|message event|parser|packet|\bheader\b|emulator|server-side/i,
    },
    {
        key: 'flash',
        label: 'Flash-only (BitmapData, filtre, shader, Timer)',
        re: /BitmapData|ColorMatrixFilter|ShaderFilter|GlowFilter|flash\.|\bTimer\b|Sprite\b/i,
    },
    {
        key: 'local',
        label: 'Micro-gap local (aucun blocage cité)',
        re: /.*/,
    },
];

function walk(dir, out)
{
    for(const entry of readdirSync(dir))
    {
        if(SKIP_DIRS.has(entry))
        {
            continue;
        }

        const full = join(dir, entry);

        if(statSync(full).isDirectory())
        {
            walk(full, out);
        }
        else if(entry.endsWith('.ts') || entry.endsWith('.tsx'))
        {
            out.push(full);
        }
    }

    return out;
}

// A TODO is rarely one line. Everything from the marker down to the first non-comment line
// (or the next marker / `AS3:` trace) belongs to it — the blocker is usually named two lines
// below the word TODO, so classifying on the marker line alone misreads most of them.
function collectBlocks(file, content)
{
    const lines = content.split('\n');
    const blocks = [];

    for(let i = 0; i < lines.length; i++)
    {
        if(!lines[i].includes('TODO'))
        {
            continue;
        }

        const buffer = [lines[i]];
        let j = i + 1;

        while(j < lines.length
            && /^\s*(\/\/|\*|\/\*)/.test(lines[j])
            && !lines[j].includes('TODO')
            && !lines[j].trim().startsWith('// AS3:')
            && !lines[j].trim().startsWith('* AS3:'))
        {
            buffer.push(lines[j]);
            j++;
        }

        blocks.push({
            file: relative(ROOT, file).replaceAll('\\', '/'),
            line: i + 1,
            as3: lines[i].includes('TODO(AS3)'),
            text: buffer.map((line) => line.trim().replace(/^[/*\s]+/, '')).join(' ').trim(),
        });

        i = j - 1;
    }

    return blocks;
}

function classify(block)
{
    for(const category of CATEGORIES)
    {
        if(category.re.test(block.text))
        {
            return category.key;
        }
    }

    return 'local';
}

function moduleOf(file)
{
    const match = file.match(/^packages\/[^/]+\/src\/((?:[a-z][a-zA-Z_]*)(?:\/[a-z][a-zA-Z_]*)?)/);

    return match ? match[1] : file;
}

// Candidates, not verdicts. A TODO that says "X is not ported" while an `X.ts` (or a populated
// `x/` directory) now exists in src is *probably* stale — the port moved on and nobody came
// back to the marker. It can also be a legitimately narrower claim ("the *view* half of X"),
// which is why this prints the block text and asks a human to judge rather than rewriting
// anything. Self-references (the TODO's own file or its own directory) are dropped.
function findStaleCandidates(blocks, srcFiles)
{
    const classFiles = new Map();
    const dirs = new Set();

    for(const file of srcFiles)
    {
        const rel = relative(ROOT, file).replaceAll('\\', '/');
        const match = rel.match(/^packages\/[^/]+\/src\/(.+)\/([^/]+)\.tsx?$/);

        if(!match)
        {
            continue;
        }

        const [, dir, name] = match;

        if(!classFiles.has(name))
        {
            classFiles.set(name, []);
        }

        classFiles.get(name).push(rel);
        dirs.add(dir);
    }

    const candidates = [];

    for(const block of blocks)
    {
        if(!/unported|not ported|isn't ported|doesn't exist in this port|never ported/i.test(block.text))
        {
            continue;
        }

        const ownDir = block.file.replace(/\/[^/]+$/, '').replace(/^packages\/[^/]+\/src\//, '');
        const ownName = block.file.replace(/^.*\//, '').replace(/\.tsx?$/, '');
        const hits = new Set();

        for(const [, name] of block.text.matchAll(/\b([A-Z][A-Za-z0-9_]{4,})\b/g))
        {
            if(name === ownName || !classFiles.has(name))
            {
                continue;
            }

            hits.add(`${name} → ${classFiles.get(name)[0]}`);
        }

        for(const [, fragment] of block.text.matchAll(/\b([a-z][a-z_]*(?:\/[a-z][a-z_]*)+)\/?/g))
        {
            const trimmed = fragment.replace(/\/$/, '');

            if(ownDir === trimmed || ownDir.endsWith(`/${trimmed}`))
            {
                continue;
            }

            for(const dir of dirs)
            {
                if(dir === trimmed || dir.endsWith(`/${trimmed}`))
                {
                    hits.add(`${trimmed}/ → packages/*/src/${dir}/`);
                    break;
                }
            }
        }

        if(hits.size > 0)
        {
            candidates.push({ ...block, hits: [...hits] });
        }
    }

    return candidates;
}

/**
 * Finds `// AS3:` / `// TODO(AS3):` blocks that have drifted off their declaration.
 *
 * In this codebase a trace comment sits directly on the member it describes, so a blank line right
 * after the block means the member it was attached to is gone — the comment now describes whatever
 * happens to follow it. That is worse than a stale marker: it invites verifying a claim against the
 * wrong method, which happened three times on the 2026-08-09 branch alone (`getRoomObjectImage`'s
 * note sitting on `addRoomObjectFurniture`, `disposeObjectFurniture`'s on
 * `unregisterCanvasSyncCallback`, `roomPreviewer`'s on `multiplePurchaseEnabled`).
 *
 * Not every hit is a defect — a marker documenting a whole absent feature legitimately stands
 * alone. Read the block and the code under it before moving anything.
 */
function findOrphanedComments(files)
{
    const orphans = [];

    for(const file of files)
    {
        const lines = readFileSync(file, 'utf8').split('\n');
        let i = 0;

        while(i < lines.length)
        {
            const trimmed = lines[i].trim();

            if(!trimmed.startsWith('// AS3:') && !trimmed.startsWith('// TODO(AS3)'))
            {
                i++;

                continue;
            }

            let end = i;

            while(end < lines.length && lines[end].trim().startsWith('//')) end++;

            if(end < lines.length && lines[end].trim() === '')
            {
                orphans.push({
                    file: relative(ROOT, file).replaceAll('\\', '/'),
                    line: i + 1,
                    text: trimmed.slice(0, 100),
                });
            }

            i = end;
        }
    }

    return orphans;
}

function table(rows, headers)
{
    const widths = headers.map((header, i) => Math.max(header.length, ...rows.map((row) => String(row[i]).length)));
    const line = (cells) => cells.map((cell, i) => String(cell).padEnd(widths[i])).join('  ');

    console.log(line(headers));
    console.log(widths.map((width) => '-'.repeat(width)).join('  '));

    for(const row of rows)
    {
        console.log(line(row));
    }
}

function main()
{
    const args = process.argv.slice(2);
    const wantStale = args.includes('--stale');
    const wantJson = args.includes('--json');
    const moduleFilter = args[args.indexOf('--module') + 1];
    const scoped = args.includes('--module') ? moduleFilter : null;

    const srcFiles = [];

    for(const pkg of readdirSync(PACKAGES))
    {
        const src = join(PACKAGES, pkg, 'src');

        try
        {
            if(statSync(src).isDirectory())
            {
                walk(src, srcFiles);
            }
        }
        catch
        {
            // package without a src/ — nothing to scan
        }
    }

    if(args.includes('--orphans'))
    {
        const orphans = findOrphanedComments(srcFiles);

        console.log(`\nCommentaires AS3/TODO détachés de leur déclaration — ${orphans.length} :\n`);
        console.log('  Un bloc suivi d\'une ligne vide a perdu le membre qu\'il décrivait, et décrit');
        console.log('  donc maintenant ce qui le suit. Tous ne sont pas des défauts : un marqueur qui');
        console.log('  documente une fonctionnalité entièrement absente est légitimement seul.\n');

        for(const orphan of orphans)
        {
            console.log(`  ${orphan.file}:${orphan.line}`);
            console.log(`    ${orphan.text}`);
        }

        console.log('');
        process.exit(0);
    }

    let blocks = [];

    for(const file of srcFiles)
    {
        blocks.push(...collectBlocks(file, readFileSync(file, 'utf8')));
    }

    if(scoped)
    {
        blocks = blocks.filter((block) => block.file.includes(`/src/${scoped}`));
    }

    for(const block of blocks)
    {
        block.category = classify(block);
    }

    const stale = findStaleCandidates(blocks, srcFiles);

    if(wantJson)
    {
        console.log(JSON.stringify({ blocks, stale }, null, 2));

        process.exit(0);
    }

    if(wantStale)
    {
        console.log(`\nTODO dont le blocage a peut-être été levé depuis — ${stale.length} candidat(s) à vérifier à la main :\n`);

        for(const block of stale)
        {
            console.log(`  ${block.file}:${block.line}`);
            console.log(`    existe déjà : ${block.hits.join(', ')}`);
            console.log(`    ${block.text.slice(block.text.indexOf('TODO')).slice(0, 160)}\n`);
        }

        process.exit(0);
    }

    const as3 = blocks.filter((block) => block.as3).length;

    console.log(`\nTODO dans packages/*/src : ${blocks.length}  (TODO(AS3) : ${as3}, autres : ${blocks.length - as3})`);
    console.log(`Candidats périmés (blocage peut-être levé) : ${stale.length}   [--stale pour la liste]\n`);

    table(
        CATEGORIES.map((category) => [
            blocks.filter((block) => block.category === category.key).length,
            category.label,
        ]).sort((a, b) => b[0] - a[0]),
        ['Nb', 'Catégorie'],
    );

    const perModule = new Map();

    for(const block of blocks)
    {
        const key = moduleOf(block.file);

        perModule.set(key, (perModule.get(key) ?? 0) + 1);
    }

    console.log('\nPar module (top 15) :\n');
    table([...perModule].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([key, count]) => [count, key]), ['Nb', 'Module']);

    const perFile = new Map();

    for(const block of blocks)
    {
        perFile.set(block.file, (perFile.get(block.file) ?? 0) + 1);
    }

    console.log('\nFichiers les plus chargés (top 10) :\n');
    table([...perFile].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([file, count]) => [count, file]), ['Nb', 'Fichier']);

    console.log('');

    process.exit(0);
}

main();
