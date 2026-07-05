#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const RULES_MANIFEST =
[
    { file: '00-mandate.md', heading: 'Mandatory: read before coding' },
    { file: '10-conventions.md', heading: 'Conventions' },
    { file: '20-architecture.md', heading: 'Architecture and critical rules' },
    { file: '30-as3-traceability.md', heading: 'AS3 traceability' },
    { file: 'communication.md', heading: 'Communication rules (`core/communication/`, `habbo/communication/`)' },
    { file: 'window-ui.md', heading: 'Window/UI rules (`core/window/`, `habbo/window/`, `**/widgets/**`)' },
    { file: 'room.md', heading: 'Room engine rules (`room/`, `habbo/room/`)' }
];

const TARGETS =
[
    join(ROOT, 'AGENTS.md'),
    join(ROOT, '.github', 'copilot-instructions.md')
];

const BEGIN_MARKER = '<!-- BEGIN:GENERATED-RULES -->';
const END_MARKER = '<!-- END:GENERATED-RULES -->';

function stripFrontmatter(content)
{
    if(!content.startsWith('---\n'))
    {
        return content;
    }

    const end = content.indexOf('\n---', 4);

    if(end === -1)
    {
        return content;
    }

    const afterMarker = content.indexOf('\n', end + 1);

    return afterMarker === -1 ? '' : content.slice(afterMarker + 1);
}

function stripLeadingHeading(content)
{
    const lines = content.split('\n');
    let i = 0;

    while(i < lines.length && lines[i].trim() === '')
    {
        i++;
    }

    if(i < lines.length && lines[i].startsWith('# '))
    {
        i++;
    }

    return lines.slice(i).join('\n').trim();
}

function buildGeneratedBlock()
{
    const sections = RULES_MANIFEST.map(({ file, heading }) =>
    {
        const raw = readFileSync(join(ROOT, '.claude', 'rules', file), 'utf8');
        const body = stripLeadingHeading(stripFrontmatter(raw));

        return `## ${heading}\n\n${body}`;
    });

    return `${BEGIN_MARKER}\n${sections.join('\n\n')}\n${END_MARKER}`;
}

function spliceBlock(content, block)
{
    const beginIndex = content.indexOf(BEGIN_MARKER);
    const endIndex = content.indexOf(END_MARKER);

    if(beginIndex === -1 || endIndex === -1)
    {
        throw new Error(`Missing ${BEGIN_MARKER}/${END_MARKER} markers in target file`);
    }

    return content.slice(0, beginIndex) + block + content.slice(endIndex + END_MARKER.length);
}

function main()
{
    const mode = process.argv.includes('--write') ? 'write' : 'check';
    const block = buildGeneratedBlock();
    let stale = false;

    for(const target of TARGETS)
    {
        const current = readFileSync(target, 'utf8');
        const next = spliceBlock(current, block);

        if(next === current)
        {
            continue;
        }

        if(mode === 'write')
        {
            writeFileSync(target, next, 'utf8');
            console.log(`Updated ${target}`);
        }
        else
        {
            stale = true;
            console.error(`${target} is out of sync with .claude/rules/. Run 'pnpm run sync:agents' and re-stage.`);
        }
    }

    if(mode === 'check' && stale)
    {
        process.exit(1);
    }
}

main();
