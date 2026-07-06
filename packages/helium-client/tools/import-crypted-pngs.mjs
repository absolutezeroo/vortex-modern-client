#!/usr/bin/env node
// Resolves and copies PNGs from sources/win63_2026_crypted_version/binaryDataPng (raw, numeric-ID
// + obfuscated-or-hashed filenames) into packages/helium-client/src/assets/images (clean names).
//
// Two filename shapes appear in binaryDataPng:
//   1) "<id>_<realname>_png$<hash>.png"      - real name already in the filename
//   2) "<id>__SafeCls_<N>.png"               - obfuscated; the real name has to be recovered from
//      a "@identifier _SafeCls_<N> = \"<realname>_png$<hash>\"" deobfuscation comment left behind
//      in some .as file under sources/win63_2026_crypted_version/src (these comments document
//      every identifier renamed during obfuscation - see e.g. src/_SafeCls_740.as's own comment
//      block, cross-checked against its [Embed(source="/_assets/1001__SafeCls_740.png")] tag).
//
// Existing files in the output directory are never overwritten - this only adds names that don't
// exist yet. Run with --dry-run to see what would be copied without writing anything.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version');
const CRYPTED_SRC = path.join(CRYPTED_ROOT, 'src');
// The raw PNGs were dropped under win63_2023_version (a different tree than the one holding the
// @identifier deobfuscation comments) - the two are cross-referenced by filename/id, not by
// living in the same folder.
const PNG_INPUT_DIR = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataPng');
const IMAGES_OUTPUT_DIR = path.resolve(__dirname, '../src/assets/images');

const IDENTIFIER_RE = /@identifier\s+(\S+)\s*=\s*"([^"]*_png[^"]*)"/g;

function parseArgs()
{
    const args = process.argv.slice(2);

    return {
        dryRun: args.includes('--dry-run'),
    };
}

function findAsFiles(dir)
{
    const result = [];
    const stack = [dir];

    while (stack.length > 0)
    {
        const current = stack.pop();
        const entries = fs.readdirSync(current, {withFileTypes: true});

        for (const entry of entries)
        {
            const fullPath = path.join(current, entry.name);

            if (entry.isDirectory())
            {
                stack.push(fullPath);
            }
            else if (entry.isFile() && entry.name.endsWith('.as'))
            {
                result.push(fullPath);
            }
        }
    }

    return result;
}

// Strips a "_png$<hash>" or bare "_png" suffix to recover the clean asset name.
function stripPngSuffix(rawName)
{
    const hashIdx = rawName.indexOf('_png$');

    if (hashIdx >= 0) return rawName.slice(0, hashIdx);

    if (rawName.endsWith('_png')) return rawName.slice(0, -'_png'.length);

    return rawName;
}

function buildObfuscatedNameMap()
{
    const map = new Map();

    if (!fs.existsSync(CRYPTED_SRC))
    {
        console.error(`Crypted source tree not found at ${CRYPTED_SRC}`);
        process.exit(1);
    }

    for (const asFile of findAsFiles(CRYPTED_SRC))
    {
        const content = fs.readFileSync(asFile, 'utf8');
        let match;

        while ((match = IDENTIFIER_RE.exec(content)) !== null)
        {
            const [, scrambledName, rawValue] = match;

            if (map.has(scrambledName) && map.get(scrambledName) !== rawValue)
            {
                console.warn(`Identifier collision: ${scrambledName} -> "${map.get(scrambledName)}" vs "${rawValue}"`);
                continue;
            }

            // Store the raw "name_png$hash" value (not yet stripped) - the hash is kept as a
            // disambiguation fallback for names that turn out to collide once stripped.
            map.set(scrambledName, rawValue);
        }
    }

    return map;
}

// Returns both the clean (hash-stripped) candidate name and a hash-qualified fallback name,
// so callers can detect collisions across the whole file set before picking which to use.
function resolvePngName(fileBaseName, obfuscatedNameMap)
{
    // Strip the leading numeric id (e.g. "1001_" or "1005_").
    const underscoreIdx = fileBaseName.indexOf('_');
    const rest = underscoreIdx >= 0 ? fileBaseName.slice(underscoreIdx + 1) : fileBaseName;

    // Case 1: "_SafeCls_NNNN" (or similar obfuscated-class-style) - resolve via the identifier map.
    const rawValue = obfuscatedNameMap.has(rest) ? obfuscatedNameMap.get(rest) : rest;

    return {clean: stripPngSuffix(rawValue), qualified: rawValue.replace(/\$/g, '_')};
}

function main()
{
    const args = parseArgs();

    if (!fs.existsSync(PNG_INPUT_DIR))
    {
        console.error(`PNG input directory not found at ${PNG_INPUT_DIR}`);
        process.exit(1);
    }

    console.log('Building obfuscated-name manifest from @identifier comments...');

    const obfuscatedNameMap = buildObfuscatedNameMap();

    console.log(`Found ${obfuscatedNameMap.size} PNG-related identifier mappings.`);

    const files = fs.readdirSync(PNG_INPUT_DIR).filter((name) => name.toLowerCase().endsWith('.png'));

    // Resolve names for every file first, so genuine collisions (multiple *different* source
    // files resolving to the same stripped name - e.g. many distinct "chat_bubble_base_png$<hash>"
    // variants all stripping to "chat_bubble_base") can be detected before any copying happens.
    // These are almost always runtime-generated/per-instance bitmaps where the hash is the only
    // thing distinguishing them, not an arbitrary suffix - stripping it for colliding names would
    // silently collapse distinct images into one.
    const resolved = files.map((fileName) =>
    {
        const baseName = path.basename(fileName, path.extname(fileName));

        return {fileName, baseName, ...resolvePngName(baseName, obfuscatedNameMap)};
    });

    const cleanNameCounts = new Map();

    for (const entry of resolved)
    {
        cleanNameCounts.set(entry.clean, (cleanNameCounts.get(entry.clean) ?? 0) + 1);
    }

    let copied = 0;
    let skippedExisting = 0;
    let unresolved = 0;
    let disambiguated = 0;

    for (const {fileName, baseName, clean, qualified} of resolved)
    {
        if (!clean || clean === baseName)
        {
            unresolved++;
            console.warn(`Could not resolve a clean name for: ${fileName}`);
            continue;
        }

        // More than one distinct source file resolves to this same stripped name - keep the
        // hash-qualified form instead, so each variant gets its own file rather than colliding.
        const isColliding = (cleanNameCounts.get(clean) ?? 0) > 1;
        const resolvedName = isColliding ? qualified : clean;

        if (isColliding) disambiguated++;

        const targetPath = path.join(IMAGES_OUTPUT_DIR, `${resolvedName}.png`);

        if (fs.existsSync(targetPath))
        {
            skippedExisting++;
            continue;
        }

        if (!args.dryRun)
        {
            fs.mkdirSync(path.dirname(targetPath), {recursive: true});
            fs.copyFileSync(path.join(PNG_INPUT_DIR, fileName), targetPath);
        }

        copied++;
        console.log(`${args.dryRun ? '[dry-run] would copy' : 'Copied'}: ${fileName} -> ${resolvedName}.png`);
    }

    console.log(`\nTotal: ${files.length} source files.`);
    console.log(`${copied} ${args.dryRun ? 'would be copied' : 'copied'} (${disambiguated} hash-qualified due to name collisions), ${skippedExisting} skipped (already exist), ${unresolved} unresolved.`);
}

main();
