#!/usr/bin/env node
// Recovers the true (runtime) name of every widget/window-layout XML asset from
// sources/win63_2026_crypted_version, and reports which ones our currently compiled
// window-layouts/window-skins JSON is missing or has under a mismatched name.
//
// Why this exists: compile-window-layouts.mjs names each layout after win63's own guess
// (the XML's internal <layout name="..."> attribute, which is a Flash-authoring-tool
// label AS3 never reads - see build-asset-name-manifest.mjs), corrected only where
// vortex-client's (small, older) uid manifest has an entry. That leaves many widget
// layouts named wrong or missing entirely, so HabboWindowManager.buildWidgetLayout()
// logs "Widget layout not found" at runtime.
//
// win63_2026_crypted_version is obfuscated, but two things in it are NOT scrambled:
//   1) Every *Com.as file under src/binaryData (e.g. HabboWindowManagerCom.as) declares
//      `public static var <declaredName>:Class = <refClass>;` - the declared identifier
//      is the real, unobfuscated lookup key AS3 registers the layout under.
//   2) Wherever <refClass> is itself scrambled to `_SafeCls_NNN`, some other .as file in
//      the tree carries a `@identifier _SafeCls_NNN = "realName_xml$hash-num"` comment
//      left behind by the obfuscator, which recovers the original embed name.
// Cross-referencing both gives an authoritative name for every widget layout the real
// client knows about - independent of vortex-client's manifest and of win63's guesses.
//
// This tool does NOT have the actual layout XML bytes (the crypted tree's _assets/
// folder holds no *_xml$hash.bin payloads, only image .bin/.png files), so it can only
// resolve NAMES, not compile new layouts. Run with --dry-run (default) to just print the
// report; --write also saves the full name manifest to crypted-layout-name-manifest.json.
//
// CAVEAT: stripXmlSuffix() strips a trailing "_xml" to get `trueName`, but the real
// runtime registry key is NOT always suffix-free - AS3's AssetLibrary registers each
// widget layout under whatever literal string the original developer used, which
// sometimes keeps "_xml" (e.g. getAssetByName("collectible_reward_xml")) and sometimes
// doesn't (e.g. getAssetByName("rent_confirmation")) - there's no fixed rule, only the
// Com.as field identifier itself is authoritative, verbatim. This tool's stripped
// `trueName` is therefore a best-effort grouping key for the present/missing report, not
// a guaranteed-correct registration name - always confirm the real getAssetByName /
// getXmlWindow call site in sources/win63_version before renaming a compiled layout.
//
// CONFIRMED FALSE-POSITIVE TRAP: for the base UI-chrome family (habbo_window_layout_*,
// illumina_light_*, illumina_dark_*), `trueName` strips down to the short embed name
// (e.g. "bubble_7"), but src/assets/window-skins/element-description.json's own
// `windowLayout` field requires the FULL Com.as field name minus only "_xml" (e.g.
// "habbo_window_layout_bubble_7" - prefix kept), because HabboWindowManager.ts looks
// widget layouts up via `this._widgetLayouts.get(descriptor.windowLayout)` verbatim. A
// fuzzy rename that strips "habbo_window_layout_"/"illumina_(light|dark)_" from these
// already-correctly-named files would BREAK them. Cross-check element-description.json's
// `windowLayout`/`asset` fields directly before renaming anything in this family - don't
// trust this tool's `trueName` for it.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version');
const CRYPTED_SRC = path.join(CRYPTED_ROOT, 'src');
const CRYPTED_BINARY_DATA = path.join(CRYPTED_SRC, 'binaryData');
const LAYOUTS_DIR = path.resolve(__dirname, '../src/assets/window-layouts');
const SKINS_DIR = path.resolve(__dirname, '../src/assets/window-skins');
const OUTPUT_PATH = path.resolve(__dirname, 'crypted-layout-name-manifest.json');

// `public static var habbo_window_layout_bubble_7_xml:Class = bubble_7_xml$<hash>;`
// or `= _SafeCls_205;` when the embed class itself was renamed.
// AS3 identifiers may contain `$` (Flex embed-generated names like `foo_xml$<hash>`
// commonly appear as *direct*, non-obfuscated refClass values) - `\w` alone misses those
// and silently drops the whole field from the scan, so the value group must allow `$` too.
const FIELD_RE = /public\s+static\s+(?:var|const)\s+(\w+)\s*:\s*Class\s*=\s*([\w$]+)\s*;/g;

// `* @identifier _SafeCls_205 = "habbo_window_layout_alert_xml$<hash>-<num>"`
const IDENTIFIER_RE = /@identifier\s+(\S+)\s*=\s*"([^"]*_xml[^"]*)"/g;

function parseArgs()
{
    const args = process.argv.slice(2);

    return {write: args.includes('--write')};
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

// Strips a "_xml$<hash>" or bare "_xml" suffix to recover the clean asset name.
function stripXmlSuffix(rawName)
{
    const hashIdx = rawName.indexOf('_xml$');

    if (hashIdx >= 0) return rawName.slice(0, hashIdx);

    if (rawName.endsWith('_xml')) return rawName.slice(0, -'_xml'.length);

    return rawName;
}

function buildObfuscatedNameMap(asFiles)
{
    const map = new Map();

    for (const asFile of asFiles)
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

            map.set(scrambledName, rawValue);
        }
    }

    return map;
}

function findComFiles(dir)
{
    return fs.readdirSync(dir, {withFileTypes: true})
        .filter((entry) => entry.isFile() && /Com\.as$/.test(entry.name))
        .map((entry) => path.join(dir, entry.name));
}

// The manifest's own declared identifier already carries the real name (e.g.
// "habbo_window_layout_bubble_7_xml" -> "bubble_7"), independent of whether the embed
// class it points to was itself renamed.
function declaredNameFromField(fieldName)
{
    let name = fieldName;

    if (name.startsWith('habbo_window_layout_')) name = name.slice('habbo_window_layout_'.length);

    return stripXmlSuffix(name);
}

function main()
{
    const args = parseArgs();

    if (!fs.existsSync(CRYPTED_SRC))
    {
        console.error(`Crypted source tree not found at ${CRYPTED_SRC} - skipping.`);
        process.exit(0);
    }

    console.log('Scanning for @identifier deobfuscation comments...');
    const asFiles = findAsFiles(CRYPTED_SRC);
    const obfuscatedNameMap = buildObfuscatedNameMap(asFiles);
    console.log(`Found ${obfuscatedNameMap.size} identifier mappings referencing _xml assets.`);

    const comFiles = findComFiles(CRYPTED_BINARY_DATA);
    const entries = new Map();
    let unresolved = 0;

    for (const comFile of comFiles)
    {
        const content = fs.readFileSync(comFile, 'utf8');
        let match;

        while ((match = FIELD_RE.exec(content)) !== null)
        {
            const [, fieldName, refClass] = match;

            if (!fieldName.endsWith('_xml')) continue;

            const declaredName = declaredNameFromField(fieldName);

            let resolvedRaw = null;

            if (/_xml\$/.test(refClass))
            {
                resolvedRaw = refClass;
            }
            else if (obfuscatedNameMap.has(refClass))
            {
                resolvedRaw = obfuscatedNameMap.get(refClass);
            }

            const trueName = resolvedRaw ? stripXmlSuffix(resolvedRaw) : declaredName;

            if (!resolvedRaw) unresolved++;

            const existing = entries.get(trueName);

            if (!existing)
            {
                entries.set(trueName, {
                    trueName,
                    declaredName,
                    fieldName,
                    refClass,
                    resolved: resolvedRaw !== null,
                    comFile: path.basename(comFile)
                });
            }
        }
    }

    console.log(`Parsed ${comFiles.length} *Com.as manifests, found ${entries.size} unique widget-layout names (${unresolved} left as declared-name fallback, unresolved refClass).`);

    const currentNames = new Set();

    for (const dir of [LAYOUTS_DIR, SKINS_DIR])
    {
        if (!fs.existsSync(dir)) continue;

        for (const file of fs.readdirSync(dir))
        {
            if (file.endsWith('.json')) currentNames.add(path.basename(file, '.json'));
        }
    }

    const missing = [];
    const present = [];

    for (const [trueName, info] of entries)
    {
        if (currentNames.has(trueName))
        {
            present.push(trueName);
        }
        else
        {
            missing.push(info);
        }
    }

    missing.sort((a, b) => a.trueName.localeCompare(b.trueName));

    console.log(`\n${present.length} true names already have a matching compiled layout/skin.`);
    console.log(`${missing.length} true names have NO compiled layout/skin (candidates for "Widget layout not found"):\n`);

    for (const info of missing)
    {
        const flag = info.resolved ? '' : ' (unresolved refClass - name may be unreliable)';

        console.log(`  ${info.trueName}${flag}`);
    }

    if (args.write)
    {
        const output = {
            generatedFrom: 'sources/win63_2026_crypted_version',
            entries: Object.fromEntries(entries),
            missing: missing.map((m) => m.trueName)
        };

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\nWrote ${OUTPUT_PATH}`);
    }
}

main();
