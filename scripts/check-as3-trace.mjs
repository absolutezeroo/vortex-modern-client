#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

function git(args)
{
    return execFileSync('git', args, { encoding: 'utf8' });
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

function getAddedLineNumbers(file)
{
    const diff = git(['diff', '--cached', '-U0', '--', file]);
    const added = new Set();
    const hunkRe = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
    let match;

    while((match = hunkRe.exec(diff)) !== null)
    {
        const start = parseInt(match[1], 10);
        const count = match[2] !== undefined ? parseInt(match[2], 10) : 1;

        for(let n = start; n < start + count; n++)
        {
            added.add(n);
        }
    }

    return added;
}

function getStagedContent(file)
{
    return git(['show', `:${file}`]);
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

function checkFile(file)
{
    const addedLines = getAddedLineNumbers(file);

    if(addedLines.size === 0)
    {
        return [];
    }

    const content = getStagedContent(file);
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
    const allFindings = files.flatMap(checkFile);

    if(allFindings.length > 0)
    {
        console.warn('\n⚠ AS3 traceability (advisory):');
        console.warn(allFindings.join('\n'));
        console.warn('  See .claude/rules/30-as3-traceability.md — this is advisory only and does not block the commit.\n');
    }

    process.exit(0);
}

main();
