#!/usr/bin/env node
//
// PostToolUse(Edit|Write) hook: run ESLint --fix on the file that was just written.
//
// Why a hook and not the commit: `lint-staged` fires at `git commit`, so every convention in
// .claude/rules/10-conventions.md — Allman braces, indent 4, `if(x)` with no space — is only
// corrected tens of edits after it was broken, in a batch nobody reads. eslint.config.mjs
// already encodes all of them, and under the exact `packages/*/src/**/*.ts` glob filtered for
// below. Running it per-edit makes the conventions rule mechanical instead of remembered.
//
// It never fails the edit. A half-written file with a genuine lint error is normal mid-task;
// this exits 0 regardless and only reports what it could not do.
//
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ESLINT_BIN = join(REPO_ROOT, 'node_modules', 'eslint', 'bin', 'eslint.js');

// Mirrors the `files:` glob of the stylistic block in eslint.config.mjs. Windows hands the hook
// backslash paths, so the path is normalised to `/` before matching rather than the regex
// carrying an escaped-separator character class — that escaping is what silently broke this
// check the first time it was written.
const TARGET_RE = /packages\/[^/]+\/src\/.+\.ts$/;

function readStdin()
{
    return new Promise((res) =>
    {
        let raw = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => { raw += chunk; });
        process.stdin.on('end', () => res(raw));
    });
}

async function main()
{
    let payload;

    try
    {
        payload = JSON.parse(await readStdin());
    }
    catch
    {
        return;
    }

    const file = payload?.tool_response?.filePath ?? payload?.tool_input?.file_path ?? '';
    const normalised = file.split('\\').join('/');

    // `.d.ts` is in eslint.config.mjs's own ignore list — skip it here too rather than pay 3s to
    // be told so.
    if(!TARGET_RE.test(normalised) || normalised.endsWith('.d.ts') || !existsSync(file))
    {
        return;
    }

    if(!existsSync(ESLINT_BIN))
    {
        process.stdout.write(JSON.stringify({ systemMessage: 'eslint-fix-hook: node_modules/eslint not installed — run pnpm install' }));
        return;
    }

    const run = spawnSync(process.execPath, [ESLINT_BIN, '--fix', file], { cwd: REPO_ROOT, encoding: 'utf8' });

    // Exit 1 means rules remain that --fix cannot repair. That is information, not a failure:
    // surface it as context so it can be addressed now instead of at commit time.
    if(run.status === 1 && run.stdout.trim().length > 0)
    {
        process.stdout.write(JSON.stringify({
            suppressOutput: true,
            hookSpecificOutput:
            {
                hookEventName: 'PostToolUse',
                additionalContext: `ESLint auto-fixed what it could; these remain:\n${run.stdout.trim()}`
            }
        }));
    }
}

main();
