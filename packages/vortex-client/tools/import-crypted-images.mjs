#!/usr/bin/env node
// Stage 2 of the asset pipeline (see this file's header + the other two
// `import-crypted-*.mjs` tools):
//
//   Stage 1 (wired via `build:window-data`/`build:bundle`): bulk extraction/compilation
//   of every XML/PNG asset. Names are best-effort guesses (the XML's own internal name
//   label, or the embed's own Flex-generated linkage name) and are frequently wrong -
//   see lib/cryptedManifest.mjs's doc comment for why.
//
//   Stage 2 (this tool + import-crypted-layouts.mjs + import-crypted-skins.mjs): fills in
//   assets under their true name, resolved from the game's own *Com.as manifests via
//   lib/cryptedManifest.mjs. Additive only - run after stage 1, never overwrites an
//   existing compiled/copied file.
//
// Both stages read the same dump today. They used to name two separate ones
// (win63_2023_version and win63_2026_crypted_version), neither of which is in sources/
// any more; the stage split is about how names are resolved, not about which tree.
//
// This tool does two passes over sources/WIN63-202607011411-782849652/src/images (a raw
// PNG dump of the SWF library, hash/obfuscated-named):
//   1) Base population: copies every embed under its own short linkage name (e.g.
//      "ae_tabs_effects.png") if src/assets/images/ doesn't have it yet. Most of the
//      client's image lookups (avatar editor icons, catalog previews, badges, etc. - not
//      just window-layout `asset_uri`) use this short name directly, so this pass alone
//      re-populates the bulk of the ~2000+ image directory from a clean rebuild.
//   2) True-name fill-in: for every field name referenced by a compiled layout/skin's
//      `asset_uri` still missing after pass 1, copies/aliases it under its true *Com.as
//      field name (which can differ from the short embed name - see
//      lib/cryptedManifest.mjs's doc comment).
//
// Run with --dry-run (default) to preview, --write to actually copy files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCryptedManifest, resolveRawFileName, resolveRawLinkageName} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'WIN63-202607011411-782849652');
const DEFAULT_LAYOUTS_DIR = path.resolve(__dirname, '../src/assets/window-layouts');
const DEFAULT_SKINS_DIR = path.resolve(__dirname, '../src/assets/window-skins');
const DEFAULT_IMAGES_DIR = path.resolve(__dirname, '../src/assets/images');

// All four directories below default to their usual repo-relative locations but can be
// pointed elsewhere (e.g. a relocated sources/ dump) via CLI flags - see the dashboard's
// toolRegistry.ts, which surfaces these as directory-picker fields.
function parseArgs()
{
    const argv = process.argv.slice(2);
    const args =
    {
        write: argv.includes('--write'),
        cryptedRoot: DEFAULT_CRYPTED_ROOT,
        layoutsDir: DEFAULT_LAYOUTS_DIR,
        skinsDir: DEFAULT_SKINS_DIR,
        imagesDir: DEFAULT_IMAGES_DIR
    };

    for(let i = 0; i < argv.length; i += 1)
    {
        if(argv[i] === '--crypted-root') { args.cryptedRoot = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--layouts-dir') { args.layoutsDir = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--skins-dir') { args.skinsDir = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--images-dir') { args.imagesDir = path.resolve(argv[i + 1]); i += 1; }
    }

    return args;
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

// Builds fullLinkageName (hash included) -> absolute raw-dump file path. Unlike
// buildEmbedToRawFile() above this never collapses two embeds that share a short name -
// see lib/cryptedManifest.mjs::buildFieldNameToLinkages() for why that matters.
function buildLinkageToRawFile(dir, obfuscatedNameMap)
{
    const map = new Map();

    if(!fs.existsSync(dir)) return map;

    for(const fileName of fs.readdirSync(dir))
    {
        if(!/\.(png|gif|jpg)$/i.test(fileName)) continue;

        const linkage = resolveRawLinkageName(fileName, obfuscatedNameMap);

        if(!linkage) continue;

        if(!map.has(linkage)) map.set(linkage, path.join(dir, fileName));
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
    const cryptedImagesDir = path.join(args.cryptedRoot, 'src', 'images');

    if(!fs.existsSync(args.cryptedRoot))
    {
        console.error(`Crypted source tree not found at ${args.cryptedRoot} - skipping.`);
        process.exit(0);
    }

    console.log('Loading crypted-tree name manifest...');
    const {obfuscatedNameMap, embedToFieldNames, fieldNameToLinkages, asFileCount, comFileCount} = loadCryptedManifest(args.cryptedRoot);

    console.log(`Scanned ${asFileCount} .as files, ${comFileCount} *Com.as manifests, resolved ${embedToFieldNames.size} embeds to true field names.`);

    // Case-insensitive - see import-crypted-layouts.mjs's identical comment: Windows/
    // macOS silently redirect a differently-cased write onto an existing file instead of
    // creating a new one, which would corrupt unrelated stage-1 content. The final
    // fs.existsSync() check before copying (below) already guards the actual write, but
    // these Sets drive "already present"/alias-source decisions too, so they need the
    // same case-insensitive treatment to report accurately.
    const existingImages = new Set(
        fs.readdirSync(args.imagesDir)
            .filter((f) => f.toLowerCase().endsWith('.png'))
            .map((f) => f.slice(0, -4).toLowerCase())
    );

    const embedToRawFile = buildEmbedToRawFile(cryptedImagesDir, obfuscatedNameMap);
    const linkageToRawFile = buildLinkageToRawFile(cryptedImagesDir, obfuscatedNameMap);

    console.log(`Found ${embedToRawFile.size} embeds with real pixel data in ${path.relative(repoRoot, cryptedImagesDir)}.`);

    // Pass 1: base population under each embed's own short name.
    let basePopulated = 0;

    for(const [embedShortName, rawPath] of embedToRawFile)
    {
        if(existingImages.has(embedShortName.toLowerCase())) continue;

        const targetPath = path.join(args.imagesDir, `${embedShortName}.png`);

        // A short name that is ALSO a *Com.as field name is not a free slot. buildEmbedToRawFile()
        // is first-wins across every embed that strips to the same stem, so writing `rawPath`
        // blind hands the field the pixels of whichever file readdir reached first: `move_1` is
        // HabboGames' 106x115 sprite, but three other embeds strip to `move_1` too and one of them
        // is a 26x13 wired arrow. Where the name is a declared field, its own linkage decides.
        const ownLinkage = [...(fieldNameToLinkages.get(embedShortName) ?? [])]
            .find((linkage) => /_(png|gif|jpg)\$/i.test(linkage) && linkageToRawFile.has(linkage));
        const sourcePath = ownLinkage ? linkageToRawFile.get(ownLinkage) : rawPath;

        if(args.write)
        {
            fs.copyFileSync(sourcePath, targetPath);
        }

        existingImages.add(embedShortName.toLowerCase());
        basePopulated++;
    }

    console.log(`${args.write ? 'Base-populated' : '[dry-run] would base-populate'} ${basePopulated} image(s) under their own embed name.`);

    // Resolves one true field name to the file its pixels should be copied from.
    //
    // The *Com.as linkage name (hash included) is tried first and is the only join that
    // can tell two same-short-named embeds apart - `wired_styles_illumina_move_0` and
    // `wired_styles_volter_move_0` are different arrows that both strip to `move_0`.
    // The short-name scan below it stays as a fallback for the embeds whose raw file
    // only resolves through the short form, and the local alias below that for the ones
    // the raw dump does not carry at all.
    // Linkage-only half of resolveSourceFor(). Never falls back to a short-name scan, and
    // only accepts an image-typed linkage: a *Com.as manifest declares layouts, skins,
    // sounds and fonts through the exact same field shape, and the short-name scan is
    // blind to the type - it happily answers the XML field `facebook_piece_xml` with the
    // pixels of an unrelated embed whose short name is `facebook`.
    const resolveImageSourceFor = (name) =>
    {
        for(const linkage of fieldNameToLinkages.get(name) ?? [])
        {
            if(!/_(png|gif|jpg)\$/i.test(linkage)) continue;

            if(linkageToRawFile.has(linkage))
            {
                return {kind: 'raw', path: linkageToRawFile.get(linkage), embedShortName: linkage};
            }
        }

        return null;
    };

    const resolveSourceFor = (name) =>
    {
        const byLinkage = resolveImageSourceFor(name);

        if(byLinkage) return byLinkage;

        let source = null;

        for(const [embedShortName, fieldNames] of embedToFieldNames)
        {
            if(!fieldNames.has(name)) continue;

            if(embedToRawFile.has(embedShortName))
            {
                return {kind: 'raw', path: embedToRawFile.get(embedShortName), embedShortName};
            }

            if(existingImages.has(embedShortName.toLowerCase()) && !source)
            {
                source = {kind: 'alias', path: path.join(args.imagesDir, `${embedShortName}.png`), embedShortName};
            }
        }

        return source;
    };

    const copyResolved = (entries, label) =>
    {
        let copied = 0;

        for(const {name, source} of entries)
        {
            const targetPath = path.join(args.imagesDir, `${name}.png`);

            if(fs.existsSync(targetPath)) continue;

            if(args.write)
            {
                fs.copyFileSync(source.path, targetPath);
                console.log(`Copied (${label}/${source.kind}) ${source.embedShortName} -> ${name}.png`);
            }
            else
            {
                console.log(`[dry-run] would copy (${label}/${source.kind}) ${source.embedShortName} -> ${name}.png`);
            }

            existingImages.add(name.toLowerCase());
            copied++;
        }

        return copied;
    };

    // Pass 2: true-name fill-in for asset_uri references.
    const referencedNames = collectAssetUriReferences([args.layoutsDir, args.skinsDir]);

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

        const source = resolveSourceFor(name);

        if(source) toCopy.push({name, source});
        else unresolved++;
    }

    const rawCount = toCopy.filter((c) => c.source.kind === 'raw').length;
    const aliasCount = toCopy.length - rawCount;

    console.log(`\n${alreadyPresent} already present locally.`);
    console.log(`${toCopy.length} resolvable via *Com.as (${rawCount} from raw pixel dump, ${aliasCount} aliased from an existing differently-named PNG).`);
    console.log(`${unresolved} unresolved (no source found under any known name).`);

    copyResolved(toCopy, 'asset_uri');

    // Pass 3: true-name fill-in for every REMAINING *Com.as image field.
    //
    // Pass 2 only sees names a compiled layout/skin spells out in an `asset_uri`. Plenty
    // of asset names are never written in a layout at all - they are built in code, e.g.
    // WiredUIPreset.resolveAssetFullName() composes "wired_styles_" + style.name + "_" +
    // icon, so the whole wired icon set (`wired_styles_illumina_move_0` ... ) was never
    // imported and every wired radio-button icon fell back to a name that exists in no
    // asset library at all. Nothing about that failure is loud: the window renders, the
    // icon is simply blank.
    //
    // So this pass takes the manifest at its word and imports every image field name that
    // still has no local file. The one thing it skips is a `<base>_png` field whose
    // `<base>` pass 1 already wrote from the same embed - that is the Flex linkage name
    // showing through, not a second asset, and copying it would duplicate ~1.6 MB of
    // identical pixels. See the ~"Asset names have no _png suffix" note: those lookups
    // are a separate, name-side problem.
    const remaining = [];
    let skippedPngAlias = 0;
    let unresolvedFields = 0;

    for(const name of fieldNameToLinkages.keys())
    {
        if(existingImages.has(name.toLowerCase())) continue;

        if(/_png$/.test(name) && existingImages.has(name.slice(0, -4).toLowerCase()))
        {
            skippedPngAlias++;
            continue;
        }

        const source = resolveImageSourceFor(name);

        // Not an image field (xml/sound/font manifests share the same *Com.as shape), or
        // an image the raw dump does not carry.
        if(!source) { unresolvedFields++; continue; }

        remaining.push({name, source});
    }

    console.log(`\n${remaining.length} further *Com.as image field name(s) missing locally, ${skippedPngAlias} skipped as "_png" duplicates of an already-written embed, ${unresolvedFields} unresolved or non-image.`);

    copyResolved(remaining, 'com-field');
}

main();
