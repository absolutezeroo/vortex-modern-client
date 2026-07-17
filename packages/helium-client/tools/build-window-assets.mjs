#!/usr/bin/env node
// Builds the client's window-layout and window-skin assets straight from the AS3 asset
// library, named exactly as AS3 names them.
//
// Replaces compile-window-layouts.mjs + compile-window-skins.mjs + import-crypted-layouts.mjs
// + import-crypted-skins.mjs + build-asset-name-manifest.mjs, which between them compiled the
// XML into JSON, re-derived names three different ways, and filled each other's gaps.
//
// NAMING. Every *Com.as declares `public static var <fieldName>:Class = <ref>;` where
// <fieldName> is the exact string AS3 passes to assets.getAssetByName(...) - see
// com/sulake/habbo/window/HabboWindowManagerComponent.as::init asking for
// "habbo_element_description_xml". Nothing else in the tree is authoritative: the XML's own
// <layout name="..."> is a Flash-authoring label AS3 never reads.
//
// JOINING declarations to files. Both a <ref> and a dump filename resolve to an embed's raw
// linkage name ("bubble_xml$44e3d739...", hash included), directly when clean or via the
// obfuscator's `@identifier _SafeCls_N = "..."` footers otherwise. That raw name is the join
// key. It must be used WHOLE: lib/cryptedManifest.mjs's stripTypeSuffix() reduces both
// "avatar_image_xml$fb2b1e72..." (HabboFriendBar) and "avatar_image_xml$a162559f..."
// (HabboWindowManager) to "avatar_image", collapsing two genuinely different layouts into
// one - which is how the old pipeline came to ship only one of them.
//
// COLLISIONS. AS3 asset libraries are per-component, so two components may declare the same
// fieldName for different embeds; those are qualified by component here. Where they resolve
// to the same embed they are one shared asset and keep the bare name.
//
// FORMAT. The source XML is emitted verbatim. The engine's WindowParser folds <params>
// children into the param bitfield and URL-decodes name/tags/caption at runtime, exactly as
// AS3 does, so there is nothing to pre-bake - and App.ts hands the XML string straight to
// windowManager.registerWidgetLayout(), which has always wanted XML.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {buildObfuscatedNameMap, findAsFiles, findComFiles} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_SOURCE = path.resolve(repoRoot, 'sources', 'WIN63-202607011411-782849652');
const DEFAULT_LAYOUTS_OUT = path.resolve(__dirname, '../src/assets/window-layouts');
const DEFAULT_SKINS_OUT = path.resolve(__dirname, '../src/assets/window-skins');

// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/HabboWindowManagerComponent.as::init()
// The element description shares the <skin> root element but is not a drawable skin - it is
// the type/style -> renderer+asset table, loaded through its own manager entry point.
const ELEMENT_DESCRIPTION_ASSET = 'habbo_element_description_xml';

const FIELD_RE = /public\s+static\s+(?:var|const)\s+(\w+)\s*:\s*Class\s*=\s*([\w$]+)\s*;/g;

// A Flex embed's linkage name is "<name>_<type>$<hash>". The type is read generically rather
// than matched against a fixed list: the library carries xml, png, gif, jpg, swf, mp3, ttf and
// txt embeds, and a missing entry would silently misfile an asset rather than fail.
const EMBED_LINKAGE_RE = /_([a-z0-9]+)\$/i;

function parseArgs()
{
    const argv = process.argv.slice(2);
    const args =
    {
        source: DEFAULT_SOURCE,
        layoutsOut: DEFAULT_LAYOUTS_OUT,
        skinsOut: DEFAULT_SKINS_OUT,
        dryRun: false
    };

    for (let i = 0; i < argv.length; i += 1)
    {
        if (argv[i] === '--source') { args.source = path.resolve(argv[i + 1]); i += 1; }
        else if (argv[i] === '--layouts-out') { args.layoutsOut = path.resolve(argv[i + 1]); i += 1; }
        else if (argv[i] === '--skins-out') { args.skinsOut = path.resolve(argv[i + 1]); i += 1; }
        else if (argv[i] === '--dry-run') { args.dryRun = true; }
    }

    return args;
}

/**
 * Resolves an identifier to an embed's raw linkage name, hash included.
 *
 * Clean identifiers are already it; obfuscated `_SafeCls_N` ones are recovered from the
 * decompiler's `@identifier` footers.
 */
function toRawLinkageName(identifier, obfuscatedNameMap)
{
    if (EMBED_LINKAGE_RE.test(identifier))
    {
        return identifier;
    }

    return obfuscatedNameMap.get(identifier) ?? null;
}

/** Dump filenames are "<seq>_<identifier>.<ext>", <seq> being an extractor ordinal. */
function fileToRawLinkageName(fileName, obfuscatedNameMap)
{
    const match = /^\d+_(.+)\.\w+$/.exec(fileName);

    return match ? toRawLinkageName(match[1], obfuscatedNameMap) : null;
}

/** Reads an extracted asset as XML, inflating the zlib-compressed .bin payloads. */
function readAsXml(file)
{
    const buffer = fs.readFileSync(file);
    const utf8 = buffer.toString('utf8').trim();

    if (utf8.startsWith('<'))
    {
        return utf8;
    }

    for (const decode of [zlib.inflateSync, zlib.inflateRawSync])
    {
        try
        {
            const inflated = decode(buffer).toString('utf8').trim();

            if (inflated.startsWith('<'))
            {
                return inflated;
            }
        }
        catch
        {
            // Not this encoding - try the next.
        }
    }

    return null;
}

/** Returns the document element's tag name, ignoring the prolog and any leading comments. */
function rootTag(xml)
{
    const stripped = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '');
    const match = /<([A-Za-z_][\w:-]*)/.exec(stripped);

    return match ? match[1] : null;
}

/** Indexes every extracted file by its embed's raw linkage name. */
function indexFilesByLinkage(dirs, obfuscatedNameMap)
{
    const index = new Map();

    for (const dir of dirs)
    {
        if (!fs.existsSync(dir))
        {
            continue;
        }

        for (const name of fs.readdirSync(dir))
        {
            if (!/\.(xml|bin)$/i.test(name))
            {
                continue;
            }

            const raw = fileToRawLinkageName(name, obfuscatedNameMap);

            // src/layouts is the decoded-XML view and is indexed first, so it wins over the
            // raw .bin of the same embed in src/_assets.
            if (raw && !index.has(raw))
            {
                index.set(raw, path.join(dir, name));
            }
        }
    }

    return index;
}

/** Reads every `<fieldName>:Class = <ref>` declaration across the component manifests. */
function readDeclarations(binaryDataDir)
{
    const declarations = [];

    for (const comFile of findComFiles(binaryDataDir))
    {
        const component = path.basename(comFile).replace(/Com\.as$/, '');
        const content = fs.readFileSync(comFile, 'utf8');
        let match;

        FIELD_RE.lastIndex = 0;

        while ((match = FIELD_RE.exec(content)) !== null)
        {
            declarations.push({component, fieldName: match[1], ref: match[2]});
        }
    }

    return declarations;
}

/**
 * Assigns each asset its output name, qualifying same-name declarations that resolve to
 * different embeds with their component.
 */
function assignNames(assets)
{
    const byField = new Map();

    for (const asset of assets)
    {
        if (!byField.has(asset.fieldName))
        {
            byField.set(asset.fieldName, []);
        }

        byField.get(asset.fieldName).push(asset);
    }

    const named = [];
    const collisions = [];

    for (const [fieldName, group] of byField)
    {
        const distinctEmbeds = new Set(group.map((asset) => asset.raw));

        if (distinctEmbeds.size === 1)
        {
            named.push({...group[0], name: fieldName});
            continue;
        }

        collisions.push({fieldName, components: group.map((asset) => asset.component)});

        for (const asset of group)
        {
            named.push({...asset, name: `${asset.component}_${fieldName}`});
        }
    }

    return {named, collisions};
}

function writeAssets(assets, outDir, dryRun)
{
    if (dryRun)
    {
        return;
    }

    // Rebuild from scratch: a name dropped upstream must not survive as a stale file.
    fs.rmSync(outDir, {recursive: true, force: true});
    fs.mkdirSync(outDir, {recursive: true});

    for (const asset of assets)
    {
        fs.writeFileSync(path.join(outDir, `${asset.name}.xml`), asset.xml, 'utf8');
    }
}

function main()
{
    const args = parseArgs();
    const srcDir = path.join(args.source, 'src');
    const binaryDataDir = path.join(srcDir, 'binaryData');

    if (!fs.existsSync(binaryDataDir))
    {
        console.error(`No binaryData manifests under ${binaryDataDir}`);
        process.exit(1);
    }

    const obfuscatedNameMap = buildObfuscatedNameMap(findAsFiles(srcDir));
    const filesByLinkage = indexFilesByLinkage(
        [path.join(srcDir, 'layouts'), path.join(srcDir, '_assets')],
        obfuscatedNameMap
    );

    const declarations = readDeclarations(binaryDataDir);
    const xmlCache = new Map();
    const layouts = [];
    const skins = [];
    let otherMedia = 0;
    let unresolved = 0;

    for (const declaration of declarations)
    {
        const raw = toRawLinkageName(declaration.ref, obfuscatedNameMap);

        // Images, fonts, sounds and text blobs are declared alongside layouts and belong to
        // other pipelines (import-crypted-images.mjs, import-chatstyles.mjs).
        if (raw && EMBED_LINKAGE_RE.exec(raw)?.[1].toLowerCase() !== 'xml')
        {
            otherMedia += 1;
            continue;
        }

        const file = raw ? filesByLinkage.get(raw) : null;

        if (!file)
        {
            unresolved += 1;
            console.warn(`  unresolved: ${declaration.component}Com.as::${declaration.fieldName} (${declaration.ref})`);
            continue;
        }

        if (!xmlCache.has(file))
        {
            xmlCache.set(file, readAsXml(file));
        }

        const xml = xmlCache.get(file);

        if (!xml)
        {
            continue;
        }

        const tag = rootTag(xml);

        if (tag !== 'layout' && tag !== 'skin')
        {
            continue;
        }

        (tag === 'layout' ? layouts : skins).push({...declaration, raw, file, xml});
    }

    const namedLayouts = assignNames(layouts);
    const namedSkins = assignNames(skins);

    writeAssets(namedLayouts.named, args.layoutsOut, args.dryRun);
    writeAssets(namedSkins.named, args.skinsOut, args.dryRun);

    const hasElementDescription = namedSkins.named.some((skin) => skin.name === ELEMENT_DESCRIPTION_ASSET);

    console.log(`Declarations:         ${declarations.length}`);
    console.log(`Non-XML (other pipe): ${otherMedia}`);
    console.log(`Unresolved XML refs:  ${unresolved}`);
    console.log(`Layouts written:      ${namedLayouts.named.length} -> ${path.relative(repoRoot, args.layoutsOut)}`);
    console.log(`Skins written:        ${namedSkins.named.length} -> ${path.relative(repoRoot, args.skinsOut)}`);
    console.log(`Element description:  ${hasElementDescription ? ELEMENT_DESCRIPTION_ASSET : 'MISSING'}`);

    for (const collision of [...namedLayouts.collisions, ...namedSkins.collisions])
    {
        console.log(`Collision: "${collision.fieldName}" -> different embeds in ${collision.components.join(', ')}; qualified by component.`);
    }

    if (args.dryRun)
    {
        console.log('\n(dry run - nothing written)');
    }
}

main();
