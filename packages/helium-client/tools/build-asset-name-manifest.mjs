#!/usr/bin/env node
// Builds a uid -> real-asset-name lookup table from vortex-client's clean (non-obfuscated)
// *Com.as manifest files + their binaryData XML files.
//
// Why this exists: win63's decompiled *Com.as manifests map many real asset names to
// obfuscated `class_NNNN` references (e.g. `layout_default_3x3:Class = class_2552`), and the
// win63 XML export tool named the extracted files using its own (sometimes wrong) guesses
// - e.g. content that is really "layout_default_3x3" got extracted as "227_layout_default_
// ubuntu.xml", because its own internal <layout name="..."> attribute is unreliable (it's a
// Flash-authoring-tool document label, not the runtime asset name - AS3 never reads it).
//
// vortex-client is clean: its *Com.as manifests are unobfuscated, so `realName:Class =
// <filename>` pairs are directly trustworthy. Each binaryData XML file also carries a `uid`
// GUID attribute that's stable across re-exports of the same Flash library item, regardless of
// what it gets renamed to in a later build. So: read vortex-client's uid -> realName pairs
// here, and compile-window-layouts.mjs cross-references each win63 XML's own uid against this
// table to recover the true name, falling back to the filename-derived guess when a uid isn't
// present in vortex-client's (older, smaller) asset set.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_VORTEX_CLIENT_ROOT = path.resolve(repoRoot, '..', 'vortex-client');
const OUTPUT_PATH = path.resolve(__dirname, 'uid-to-name-manifest.json');

const CONST_CLASS_RE = /public\s+static\s+const\s+(\w+)\s*:\s*Class\s*=\s*(\w+)\s*;/g;

// --vortex-root defaults to the usual sibling checkout but can be pointed elsewhere via
// CLI flag - see the dashboard's toolRegistry.ts, which surfaces this as a directory-picker
// field.
function parseArgs()
{
    const argv = process.argv.slice(2);
    const args = {vortexRoot: DEFAULT_VORTEX_CLIENT_ROOT};

    for (let i = 0; i < argv.length; i += 1)
    {
        if (argv[i] === '--vortex-root') { args.vortexRoot = path.resolve(argv[i + 1]); i += 1; }
    }

    return args;
}

function findComFiles(dir)
{
    return fs.readdirSync(dir, {withFileTypes: true})
        .filter((entry) => entry.isFile() && /Com\.as$/.test(entry.name))
        .map((entry) => path.join(dir, entry.name));
}

function parseManifest(filePath)
{
    const content = fs.readFileSync(filePath, 'utf8');
    const pairs = [];
    let match;

    while ((match = CONST_CLASS_RE.exec(content)) !== null)
    {
        pairs.push({realName: match[1], refName: match[2]});
    }

    return pairs;
}

function extractUid(xmlContent)
{
    const match = /<layout\b[^>]*\buid="([^"]+)"/.exec(xmlContent);

    return match ? match[1] : null;
}

function main()
{
    const args = parseArgs();
    const vortexSrc = path.join(args.vortexRoot, 'src');
    const vortexBinaryData = path.join(vortexSrc, 'binaryData');

    if (!fs.existsSync(args.vortexRoot))
    {
        console.error(`vortex-client not found at ${args.vortexRoot} - skipping manifest build.`);
        process.exit(0);
    }

    const comFiles = findComFiles(vortexSrc);
    const uidToName = {};
    const nameToUid = {};
    let resolvedCount = 0;
    let missingBinCount = 0;
    let notXmlCount = 0;

    for (const comFile of comFiles)
    {
        for (const {realName, refName} of parseManifest(comFile))
        {
            const binPath = path.join(vortexBinaryData, `${refName}.bin`);

            if (!fs.existsSync(binPath))
            {
                missingBinCount++;
                continue;
            }

            const content = fs.readFileSync(binPath, 'utf8');

            if (!content.trimStart().startsWith('<?xml') && !content.includes('<layout'))
            {
                notXmlCount++;
                continue;
            }

            const uid = extractUid(content);

            if (!uid) continue;

            if (uidToName[uid] && uidToName[uid] !== realName)
            {
                console.warn(`UID collision: ${uid} -> "${uidToName[uid]}" vs "${realName}" (from ${path.basename(comFile)})`);
                continue;
            }

            uidToName[uid] = realName;
            nameToUid[realName] = uid;
            resolvedCount++;
        }
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify({uidToName, nameToUid}, null, 2), 'utf8');

    console.log(`Parsed ${comFiles.length} manifest files.`);
    console.log(`Resolved ${resolvedCount} uid -> realName mappings.`);
    console.log(`Skipped ${missingBinCount} refs with no matching .bin file, ${notXmlCount} non-XML binaryData refs.`);
    console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
