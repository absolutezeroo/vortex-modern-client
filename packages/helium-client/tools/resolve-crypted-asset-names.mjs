#!/usr/bin/env node
// Recovers the true (runtime) registration name of every embedded asset (image, xml
// layout, sound, font) referenced from sources/win63_2026_crypted_version's *Com.as
// manifests, and uses it to fill in locally-missing assets under their correct name.
//
// Why this exists: see resolve-crypted-layout-names.mjs for the layout-XML half of this
// discovery. The same rule turned out to also apply to images: `import-crypted-pngs.mjs`
// names copied PNGs after the *embed's own* auto-generated linkage identifier (stripped of
// its "_png$hash" suffix - e.g. "ae_tabs_effects"), but the runtime asset registry key that
// ResourceManager.retrieveAsset()/HabboWindowManagerCom actually look up by is the *Com.as
// manifest's declared field name* for that embed, which is sometimes a different, longer
// name (e.g. "avatar_editor_tabs_ae_tabs_effects" - confirmed by cross-referencing a
// layout's own `asset_uri` value against `HabboWindowManagerCom.as`:
//   public static var avatar_editor_tabs_ae_tabs_effects:Class = _SafeCls_202;
//   @identifier _SafeCls_202 = "ae_tabs_effects_png$<hash>-<num>"
// ). One embed can be referenced by more than one *Com.as field under different names
// (the same bitmap reused for several logical UI elements), so this tool only ADDS files
// under missing true names - it never renames/deletes the embed-named copy, since other
// asset_uri references may still depend on that name existing.
//
// Run with --dry-run to preview, --write to actually copy files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const CRYPTED_SRC = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version', 'src');
const CRYPTED_BINARY_DATA = path.join(CRYPTED_SRC, 'binaryData');
const LAYOUTS_DIR = path.resolve(__dirname, '../src/assets/window-layouts');
const SKINS_DIR = path.resolve(__dirname, '../src/assets/window-skins');
const IMAGES_DIR = path.resolve(__dirname, '../src/assets/images');

// AS3 identifiers may contain `$` (Flex embed-generated names like `foo_png$<hash>`
// commonly appear as *direct*, non-obfuscated refClass values) - `\w` alone misses those
// and silently drops the whole field from the scan, so the value group must allow `$` too.
const FIELD_RE = /public\s+static\s+(?:var|const)\s+(\w+)\s*:\s*Class\s*=\s*([\w$]+)\s*;/g;
const IDENTIFIER_RE = /@identifier\s+(\S+)\s*=\s*"([^"]+)"/g;
const TYPE_SUFFIX_RE = /_(png|gif|jpg|swf|mp3|ttf|xml)\$/;

function parseArgs()
{
    return {write: process.argv.includes('--write')};
}

function findAsFiles(dir)
{
    const result = [];
    const stack = [dir];

    while(stack.length > 0)
    {
        const current = stack.pop();
        const entries = fs.readdirSync(current, {withFileTypes: true});

        for(const entry of entries)
        {
            const fullPath = path.join(current, entry.name);

            if(entry.isDirectory()) stack.push(fullPath);
            else if(entry.isFile() && entry.name.endsWith('.as')) result.push(fullPath);
        }
    }

    return result;
}

function stripTypeSuffix(rawName)
{
    const match = TYPE_SUFFIX_RE.exec(rawName);

    return match ? rawName.slice(0, match.index) : rawName;
}

function buildObfuscatedNameMap(asFiles)
{
    const map = new Map();

    for(const asFile of asFiles)
    {
        const content = fs.readFileSync(asFile, 'utf8');
        let match;

        while((match = IDENTIFIER_RE.exec(content)) !== null)
        {
            const [, scrambledName, rawValue] = match;

            if(map.has(scrambledName) && map.get(scrambledName) !== rawValue) continue;

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

// Builds embedShortName -> Set(true field names) across every *Com.as manifest.
function buildEmbedToFieldNames(comFiles, obfuscatedNameMap)
{
    const embedToFieldNames = new Map();

    for(const comFile of comFiles)
    {
        const content = fs.readFileSync(comFile, 'utf8');
        let match;

        while((match = FIELD_RE.exec(content)) !== null)
        {
            const [, fieldName, refClass] = match;

            let rawValue = null;

            if(/_(png|gif|jpg|swf|mp3|ttf|xml)\$/.test(refClass)) rawValue = refClass;
            else if(obfuscatedNameMap.has(refClass)) rawValue = obfuscatedNameMap.get(refClass);

            if(!rawValue) continue;

            const embedShortName = stripTypeSuffix(rawValue);

            if(!embedToFieldNames.has(embedShortName)) embedToFieldNames.set(embedShortName, new Set());

            embedToFieldNames.get(embedShortName).add(fieldName);
        }
    }

    return embedToFieldNames;
}

function collectAssetUriReferences(dirs)
{
    const refs = new Set();
    const re = /"asset_uri"\s*:\s*"([^"]*)"/g;

    for(const dir of dirs)
    {
        if(!fs.existsSync(dir)) continue;

        for(const file of fs.readdirSync(dir))
        {
            if(!file.endsWith('.json')) continue;

            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            let match;

            while((match = re.exec(content)) !== null)
            {
                const value = match[1];

                if(value && !value.includes('${')) refs.add(value);
            }
        }
    }

    return refs;
}

function main()
{
    const args = parseArgs();

    if(!fs.existsSync(CRYPTED_SRC))
    {
        console.error(`Crypted source tree not found at ${CRYPTED_SRC} - skipping.`);
        process.exit(0);
    }

    console.log('Scanning @identifier deobfuscation comments...');
    const asFiles = findAsFiles(CRYPTED_SRC);
    const obfuscatedNameMap = buildObfuscatedNameMap(asFiles);
    console.log(`Found ${obfuscatedNameMap.size} identifier mappings.`);

    const comFiles = findComFiles(CRYPTED_BINARY_DATA);
    const embedToFieldNames = buildEmbedToFieldNames(comFiles, obfuscatedNameMap);
    console.log(`Parsed ${comFiles.length} *Com.as manifests, resolved ${embedToFieldNames.size} embeds to true field names.`);

    const existingImages = new Set(
        fs.readdirSync(IMAGES_DIR)
            .filter((f) => f.toLowerCase().endsWith('.png'))
            .map((f) => f.slice(0, -4))
    );

    const referencedNames = collectAssetUriReferences([LAYOUTS_DIR, SKINS_DIR]);
    console.log(`Found ${referencedNames.size} distinct non-templated asset_uri references in compiled layouts/skins.`);

    let alreadyPresent = 0;
    let fixable = 0;
    let unresolved = 0;
    const toCopy = [];

    for(const name of referencedNames)
    {
        if(existingImages.has(name))
        {
            alreadyPresent++;
            continue;
        }

        // Is `name` itself a known true field name? Find an embed whose field-name set
        // contains it, and that embed's short name has a file on disk already.
        let sourceEmbed = null;

        for(const [embedShortName, fieldNames] of embedToFieldNames)
        {
            if(fieldNames.has(name) && existingImages.has(embedShortName))
            {
                sourceEmbed = embedShortName;
                break;
            }
        }

        if(sourceEmbed)
        {
            fixable++;
            toCopy.push({name, sourceEmbed});
        }
        else
        {
            unresolved++;
        }
    }

    console.log(`\n${alreadyPresent} already present locally.`);
    console.log(`${fixable} resolvable via *Com.as (will copy from an existing embed-named PNG).`);
    console.log(`${unresolved} unresolved (no local source PNG found under any known name).`);

    for(const {name, sourceEmbed} of toCopy)
    {
        const targetPath = path.join(IMAGES_DIR, `${name}.png`);

        if(fs.existsSync(targetPath)) continue;

        if(args.write)
        {
            fs.copyFileSync(path.join(IMAGES_DIR, `${sourceEmbed}.png`), targetPath);
            console.log(`Copied ${sourceEmbed}.png -> ${name}.png`);
        }
        else
        {
            console.log(`[dry-run] would copy ${sourceEmbed}.png -> ${name}.png`);
        }
    }
}

main();
