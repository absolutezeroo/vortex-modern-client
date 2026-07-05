#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const MAX_BUFFER = 1024 * 1024 * 200;

function git(args)
{
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: MAX_BUFFER });
}

function getStagedFiles()
{
    return git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function isAs3PortedFile(file)
{
    if(!file.endsWith('.ts') || file.endsWith('/index.ts'))
    {
        return false;
    }

    const match = file.match(/^packages\/[^/]+\/src\/(.+)$/);

    if(!match)
    {
        return false;
    }

    const rel = match[1];

    return rel.startsWith('habbo/') || rel.startsWith('room/') || rel.startsWith('core/window/') || rel.startsWith('core/communication/');
}

const FILE_HEADER_RE = /^\+\+\+ b\/(.+)$/;
const HUNK_RE = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

// One batched `git diff` call for every matched file instead of one process per file —
// spawning a subprocess per file made this unusable on commits touching hundreds of files.
function getAddedLineNumbersBatch(files)
{
    const result = new Map();

    if(files.length === 0)
    {
        return result;
    }

    const diff = git(['diff', '--cached', '-U0', '--diff-filter=ACMR', '--', ...files]);
    let currentFile = null;

    for(const line of diff.split('\n'))
    {
        const fileMatch = FILE_HEADER_RE.exec(line);

        if(fileMatch)
        {
            currentFile = fileMatch[1];

            if(!result.has(currentFile))
            {
                result.set(currentFile, new Set());
            }

            continue;
        }

        const hunkMatch = HUNK_RE.exec(line);

        if(hunkMatch && currentFile)
        {
            const start = parseInt(hunkMatch[1], 10);
            const count = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
            const set = result.get(currentFile);

            for(let n = start; n < start + count; n++)
            {
                set.add(n);
            }
        }
    }

    return result;
}

const CLASS_OPEN_RE = /^(?:export\s+)?(?:default\s+)?(?:abstract\s+)?class\s+\w|^(?:export\s+)?interface\s+\w/;
const CONSTRUCTOR_RE = /^(?:public\s+|private\s+|protected\s+)?constructor\s*\(/;
const ACCESSOR_RE = /^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:get|set)\s+[A-Za-z_$][\w$]*\s*\(/;
const METHOD_RE = /^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*\(/;
const PROPERTY_RE = /^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:readonly\s+)?_?[A-Za-z_$][\w$]*\s*(?::|=|;)/;

function classifyMemberDeclaration(trimmed)
{
    if(trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('@') || trimmed.startsWith('}'))
    {
        return null;
    }

    if(CONSTRUCTOR_RE.test(trimmed))
    {
        return null;
    }

    if(ACCESSOR_RE.test(trimmed))
    {
        return 'accessor';
    }

    if(METHOD_RE.test(trimmed) && trimmed.includes('('))
    {
        return 'method';
    }

    if(PROPERTY_RE.test(trimmed))
    {
        return 'property';
    }

    return null;
}

// Approximate brace-depth walk (regex-based, not a real parser) — good enough for an
// advisory-only check; string/comment contents containing braces can occasionally skew depth.
function findClassMemberLines(content)
{
    const lines = content.split('\n');
    const stack = [];
    const memberLines = [];

    for(let i = 0; i < lines.length; i++)
    {
        const line = lines[i];
        const trimmed = line.trim();
        const atClassDepth = stack.length === 1 && stack[stack.length - 1] === 'class';

        if(atClassDepth)
        {
            memberLines.push({ lineNo: i + 1, trimmed });
        }

        for(const ch of line)
        {
            if(ch === '{')
            {
                let kind = 'other';

                if(trimmed === '{')
                {
                    for(let j = i - 1; j >= 0; j--)
                    {
                        const prev = lines[j].trim();

                        if(prev === '')
                        {
                            continue;
                        }

                        if(CLASS_OPEN_RE.test(prev))
                        {
                            kind = 'class';
                        }

                        break;
                    }
                }
                else if(CLASS_OPEN_RE.test(trimmed) && trimmed.endsWith('{'))
                {
                    kind = 'class';
                }

                stack.push(kind);
            }
            else if(ch === '}')
            {
                stack.pop();
            }
        }
    }

    return memberLines;
}

function hasPrecedingAs3Trace(lines, declLineIndex)
{
    for(let i = declLineIndex - 1; i >= 0; i--)
    {
        const trimmed = lines[i].trim();

        if(trimmed === '')
        {
            continue;
        }

        if(trimmed.startsWith('// AS3:') || trimmed.startsWith('// TODO(AS3)'))
        {
            return true;
        }

        if(trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/**') || trimmed.startsWith('@'))
        {
            continue;
        }

        return false;
    }

    return false;
}

function checkFile(file, addedLines)
{
    if(!addedLines || addedLines.size === 0)
    {
        return [];
    }

    let content;

    try
    {
        content = readFileSync(file, 'utf8');
    }
    catch
    {
        return [];
    }

    const lines = content.split('\n');
    const memberLines = findClassMemberLines(content);
    const findings = [];

    for(const { lineNo, trimmed } of memberLines)
    {
        if(!addedLines.has(lineNo))
        {
            continue;
        }

        const kind = classifyMemberDeclaration(trimmed);

        if(kind === null)
        {
            continue;
        }

        if(!hasPrecedingAs3Trace(lines, lineNo - 1))
        {
            findings.push(`  ${file}:${lineNo} — ${kind} \`${trimmed.slice(0, 80)}\` has no AS3: trace comment or TODO(AS3) marker`);
        }
    }

    return findings;
}

function main()
{
    const files = getStagedFiles().filter(isAs3PortedFile);

    if(files.length === 0)
    {
        process.exit(0);
    }

    const addedLinesByFile = getAddedLineNumbersBatch(files);
    const allFindings = files.flatMap((file) => checkFile(file, addedLinesByFile.get(file)));

    if(allFindings.length > 0)
    {
        console.warn('\n⚠ AS3 traceability (advisory):');
        console.warn(allFindings.join('\n'));
        console.warn('  See .claude/rules/30-as3-traceability.md — this is advisory only and does not block the commit.\n');
    }

    process.exit(0);
}

main();
