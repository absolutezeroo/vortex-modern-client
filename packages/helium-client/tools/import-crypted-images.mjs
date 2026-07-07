#!/usr/bin/env node
// Stage 2 of the asset pipeline (see this file's header + the other two
// `import-crypted-*.mjs` tools):
//
//   Stage 1 (win63_2023_version, wired via `build:window-data`/`build:bundle`): bulk
//   extraction/compilation of every XML/PNG asset. Names are best-effort guesses (the
//   XML's own internal name label, or the embed's own Flex-generated linkage name) and
//   are frequently wrong - see lib/cryptedManifest.mjs's doc comment for why.
//
//   Stage 2 (win63_2026_crypted_version, this tool + import-crypted-layouts.mjs +
//   import-crypted-skins.mjs): fills in assets under their true name, resolved from the
//   game's own *Com.as manifests via lib/cryptedManifest.mjs. Additive only - run after
//   stage 1, never overwrites an existing compiled/copied file.
//
// This tool: for every true field name referenced by a compiled layout/skin's
// `asset_uri` with no matching packages/helium-client/src/assets/images/<name>.png,
// copies real pixels from sources/win63_2026_crypted_version/src/images (a raw PNG/GIF
// dump of the SWF library) - preferred - or aliases from an existing differently-named
// local PNG of the same embed when the raw dump doesn't have it either.
//
// Run with --dry-run (default) to preview, --write to actually copy files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCryptedManifest, resolveRawFileName} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version');
const CRYPTED_IMAGES_DIR = path.join(CRYPTED_ROOT, 'src', 'images');
const LAYOUTS_DIR = path.resolve(__dirname, '../src/assets/window-layouts');
const SKINS_DIR = path.resolve(__dirname, '../src/assets/window-skins');
const IMAGES_DIR = path.resolve(__dirname, '../src/assets/images');

function parseArgs()
{
    return {write: process.argv.includes('--write')};
}

// Builds embedShortName -> absolute raw-dump file path, resolving obfuscated
// "_SafeCls_NNN" stems via the shared identifier map.
function buildEmbedToRawFile(dir, obfuscatedNameMap)
{
    const map = new Map();

    if(!fs.existsSync(dir)) return map;

    for(const fileName of fs.readdirSync(dir))
    {
        if(!/\.(png|gif|jpg)$/i.test(fileName)) continue;

        const embedShortName = resolveRawFileName(fileName, obfuscatedNameMap);

        if(!embedShortName) continue;

        if(!map.has(embedShortName)) map.set(embedShortName, path.join(dir, fileName));
    }

    return map;
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

    if(!fs.existsSync(CRYPTED_ROOT))
    {
        console.error(`Crypted source tree not found at ${CRYPTED_ROOT} - skipping.`);
        process.exit(0);
    }

    console.log('Loading crypted-tree name manifest...');
    const {obfuscatedNameMap, embedToFieldNames, asFileCount, comFileCount} = loadCryptedManifest(CRYPTED_ROOT);

    console.log(`Scanned ${asFileCount} .as files, ${comFileCount} *Com.as manifests, resolved ${embedToFieldNames.size} embeds to true field names.`);

    // Case-insensitive - see import-crypted-layouts.mjs's identical comment: Windows/
    // macOS silently redirect a differently-cased write onto an existing file instead of
    // creating a new one, which would corrupt unrelated stage-1 content. The final
    // fs.existsSync() check before copying (below) already guards the actual write, but
    // these Sets drive "already present"/alias-source decisions too, so they need the
    // same case-insensitive treatment to report accurately.
    const existingImages = new Set(
        fs.readdirSync(IMAGES_DIR)
            .filter((f) => f.toLowerCase().endsWith('.png'))
            .map((f) => f.slice(0, -4).toLowerCase())
    );

    const embedToRawFile = buildEmbedToRawFile(CRYPTED_IMAGES_DIR, obfuscatedNameMap);

    console.log(`Found ${embedToRawFile.size} embeds with real pixel data in ${path.relative(repoRoot, CRYPTED_IMAGES_DIR)}.`);

    const referencedNames = collectAssetUriReferences([LAYOUTS_DIR, SKINS_DIR]);

    console.log(`Found ${referencedNames.size} distinct non-templated asset_uri references in compiled layouts/skins.`);

    let alreadyPresent = 0;
    let unresolved = 0;
    const toCopy = [];

    for(const name of referencedNames)
    {
        if(existingImages.has(name.toLowerCase()))
        {
            alreadyPresent++;
            continue;
        }

        // Is `name` itself a known true field name? Find an embed whose field-name set
        // contains it, sourced either from the raw pixel dump (authoritative, preferred)
        // or an existing locally-named copy (alias, only when the raw dump lacks it).
        let source = null;

        for(const [embedShortName, fieldNames] of embedToFieldNames)
        {
            if(!fieldNames.has(name)) continue;

            if(embedToRawFile.has(embedShortName))
            {
                source = {kind: 'raw', path: embedToRawFile.get(embedShortName), embedShortName};
                break;
            }

            if(existingImages.has(embedShortName.toLowerCase()) && !source)
            {
                source = {kind: 'alias', path: path.join(IMAGES_DIR, `${embedShortName}.png`), embedShortName};
            }
        }

        if(source) toCopy.push({name, source});
        else unresolved++;
    }

    const rawCount = toCopy.filter((c) => c.source.kind === 'raw').length;
    const aliasCount = toCopy.length - rawCount;

    console.log(`\n${alreadyPresent} already present locally.`);
    console.log(`${toCopy.length} resolvable via *Com.as (${rawCount} from raw pixel dump, ${aliasCount} aliased from an existing differently-named PNG).`);
    console.log(`${unresolved} unresolved (no source found under any known name).`);

    for(const {name, source} of toCopy)
    {
        const targetPath = path.join(IMAGES_DIR, `${name}.png`);

        if(fs.existsSync(targetPath)) continue;

        if(args.write)
        {
            fs.copyFileSync(source.path, targetPath);
            console.log(`Copied (${source.kind}) ${source.embedShortName} -> ${name}.png`);
        }
        else
        {
            console.log(`[dry-run] would copy (${source.kind}) ${source.embedShortName} -> ${name}.png`);
        }
    }
}

main();
