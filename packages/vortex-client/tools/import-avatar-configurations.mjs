#!/usr/bin/env node
// Imports the avatar renderer's embedded XML configurations out of the AS3 dump, named
// exactly as AS3 names them.
//
// Sibling of import-crypted-images.mjs / import-crypted-sounds.mjs, and it exists because
// these six files had no importer at all. `src/assets/configurations/` is gitignored -
// derived dump content, regenerated per checkout - yet nothing regenerated *these*: they
// had been copied in by hand, from the 2016 PRODUCTION build, and never refreshed. The
// result on 2026-08-14, measured against WIN63-202607011411-782849652:
//
//   HabboAvatarAnimation  21,405 b (2016)  vs 56,253 b - missing the Default, Lay and
//                                            Sleep actions entirely
//   HabboAvatarGeometry   15,996 b (2016)  vs 19,020 b - missing the petl/petr bodyparts
//                                            and all 8 order-before attributes, which is
//                                            what left AvatarModelGeometry's ported
//                                            bodypart ordering latent
//   HabboAvatarPartSets    5,746 b (2016)  vs  7,380 b - missing the misc/pet activePartSets
//   action_offset_lay      absent          - App.ts asks for it, the lookup returns null
//   action_offset_swim     absent          - likewise
//
// (HabboAvatarFigure was already the WIN63 one.) All three stale files are strict subsets
// of the dump's: nothing was removed between the builds, only added.
//
// Which fields to import is not a list maintained here - it is read off
// `src/binaryData/HabboAvatarRenderLib.as`, the avatar renderer's own asset manifest, so a
// configuration added to that component in a future dump is picked up without editing this
// file. Every field whose embed is an `*_xml$<hash>` linkage is imported except `manifest`,
// which is the component's Flex asset manifest rather than an avatar configuration (every
// *Com.as declares one).
//
// The target name is the *Com.as FIELD name, verbatim - the exact string handed to
// assets.getAssetByName(), e.g.
//
//   HabboAvatarRenderLib.as:
//     public static var HabboAvatarAnimation:Class = _SafeCls_117;
//
// and _SafeCls_117's `@identifier` footer recovers the embed it points at
// ("HabboAvatarAnimation_xml$fc9aa9c8...-1315157748"). Resolution is
// lib/cryptedManifest.mjs's job. Unlike the image importer the `_xml` suffix is NOT dropped
// from the linkage when matching, only from the emitted name: App.ts probes
// `configurations/<name>.xml` first, so the file lands as `<fieldName>.xml`.
//
// XML embeds live in two places in the dump depending on whether the embed class survived
// obfuscation - `src/layouts/<seq>_<linkage>.xml` when it did, `src/_assets/<seq>__SafeCls_N.bin`
// when it did not - so both directories are indexed, and the `.bin` ones are plain XML text.
//
// Unlike the sound importer this one OVERWRITES: refreshing a stale configuration is the
// whole point, so an existing file that differs is replaced and reported as updated.
//
// Run with --dry-run (default) to preview, --write to actually write files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildFieldNameToLinkages, loadCryptedManifest, resolveRawLinkageName} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'WIN63-202607011411-782849652');
const DEFAULT_OUT_DIR = path.resolve(__dirname, '../src/assets/configurations');

// The avatar renderer's asset manifest. Its field names are what AvatarRenderManager and
// App.ts look the configurations up by.
const COM_FILE_NAME = 'HabboAvatarRenderLib.as';

// The Flex component manifest, declared by every *Com.as - not an avatar configuration.
const EXCLUDED_FIELD_NAMES = new Set(['manifest']);

const XML_LINKAGE_RE = /_xml\$/;

function parseArgs()
{
    const argv = process.argv.slice(2);
    const args =
    {
        write: argv.includes('--write'),
        cryptedRoot: DEFAULT_CRYPTED_ROOT,
        outDir: DEFAULT_OUT_DIR
    };

    for(let i = 0; i < argv.length; i += 1)
    {
        if(argv[i] === '--source') { args.cryptedRoot = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--out') { args.outDir = path.resolve(argv[i + 1]); i += 1; }
    }

    return args;
}

// Indexes every XML embed in the dump by its whole linkage name (hash included), across
// both directories they land in. Joining on the whole linkage rather than its short form
// is what keeps two same-named embeds apart - see lib/cryptedManifest.mjs.
function indexXmlEmbeds(cryptedSrc, obfuscatedNameMap)
{
    const linkageToPath = new Map();

    for(const dirName of ['layouts', '_assets'])
    {
        const dir = path.join(cryptedSrc, dirName);

        if(!fs.existsSync(dir)) continue;

        for(const fileName of fs.readdirSync(dir))
        {
            if(!/\.(xml|bin)$/i.test(fileName)) continue;

            const linkage = resolveRawLinkageName(fileName, obfuscatedNameMap);

            if(!linkage || !XML_LINKAGE_RE.test(linkage)) continue;
            if(linkageToPath.has(linkage)) continue;

            linkageToPath.set(linkage, path.join(dir, fileName));
        }
    }

    return linkageToPath;
}

function main()
{
    const args = parseArgs();
    const cryptedSrc = path.join(args.cryptedRoot, 'src');
    const comFile = path.join(cryptedSrc, 'binaryData', COM_FILE_NAME);

    if(!fs.existsSync(comFile))
    {
        console.error(`[import-avatar-configurations] No ${COM_FILE_NAME} at ${comFile}`);
        process.exitCode = 1;

        return;
    }

    const {obfuscatedNameMap} = loadCryptedManifest(args.cryptedRoot);
    const linkageToPath = indexXmlEmbeds(cryptedSrc, obfuscatedNameMap);

    // Built from this one file rather than taken off loadCryptedManifest()'s manifest-wide
    // map, for two reasons. The map only covers `*Com.as` and HabboAvatarRenderLib.as is a
    // SimpleApplication, not a component manifest - it is invisible to findComFiles(), which
    // is why these six configurations never had an importer. And scoping to one file keeps
    // out every other component's XML embeds, which are layouts and skins:
    // build-window-assets.mjs's job, not this one's.
    const fieldNameToLinkages = buildFieldNameToLinkages([comFile], obfuscatedNameMap);

    const planned = [];
    const unresolved = [];

    for(const fieldName of fieldNameToLinkages.keys())
    {
        if(EXCLUDED_FIELD_NAMES.has(fieldName)) continue;

        const linkages = fieldNameToLinkages.get(fieldName);

        if(!linkages) continue;

        for(const linkage of linkages)
        {
            if(!XML_LINKAGE_RE.test(linkage)) continue;

            const sourcePath = linkageToPath.get(linkage);

            if(!sourcePath)
            {
                unresolved.push({fieldName, reason: `embed "${linkage}" has no file in layouts/ or _assets/`});
                continue;
            }

            planned.push({fieldName, linkage, sourcePath, target: path.join(args.outDir, `${fieldName}.xml`)});
        }
    }

    planned.sort((a, b) => a.fieldName.localeCompare(b.fieldName));

    let added = 0;
    let updated = 0;
    let unchanged = 0;

    if(args.write && planned.length > 0)
    {
        fs.mkdirSync(args.outDir, {recursive: true});
    }

    for(const item of planned)
    {
        const content = fs.readFileSync(item.sourcePath);
        const existing = fs.existsSync(item.target) ? fs.readFileSync(item.target) : null;

        if(existing !== null && existing.equals(content))
        {
            unchanged += 1;
            continue;
        }

        const verb = existing === null ? 'added  ' : 'updated';

        if(existing === null) added += 1;
        else updated += 1;

        if(args.write)
        {
            fs.writeFileSync(item.target, content);
        }

        const sizes = existing === null
            ? `${content.length} b`
            : `${existing.length} b -> ${content.length} b`;

        console.log(`  ${verb} ${item.fieldName}.xml  (${sizes})  <-  ${path.basename(item.sourcePath)}`);
    }

    console.log(`[import-avatar-configurations] ${planned.length} XML configurations declared by ${COM_FILE_NAME}`);
    console.log(`[import-avatar-configurations] ${added} ${args.write ? 'added' : 'to add'}, ${updated} ${args.write ? 'updated' : 'to update'}, ${unchanged} already current`);

    for(const item of unresolved)
    {
        console.log(`[import-avatar-configurations] skipped ${item.fieldName}: ${item.reason}`);
    }

    if(!args.write)
    {
        console.log('[import-avatar-configurations] dry run - pass --write to write');
    }
}

main();
