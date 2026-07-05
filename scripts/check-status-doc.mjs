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

function main()
{
    const files = getStagedFiles();
    const srcChanged = files.some((file) => /^packages\/[^/]+\/src\//.test(file));
    const statusTouched = files.includes('docs/IMPLEMENTATION_STATUS.md');

    if(srcChanged && !statusTouched)
    {
        console.warn('\n⚠ Reminder: docs/IMPLEMENTATION_STATUS.md was not updated in this commit.');
        console.warn('  Update it if this was a significant implementation step (.claude/rules/20-architecture.md, critical rule #6).\n');
    }

    process.exit(0);
}

main();
