#!/usr/bin/env node
// Imports the embedded localization texts out of the AS3 dump, named exactly as AS3 names them.
//
// Sibling of import-avatar-configurations.mjs, and it exists for the same reason: these files
// had no importer at all. `src/assets/configurations/` is gitignored - derived dump content,
// regenerated per checkout - yet nothing regenerated *these*, so a fresh clone had none of them
// and no way to obtain them. They are the only texts the login flow has (it runs before any
// external text file is fetched, see HabboLocalizationManager.loadDefaultEmbedLocalizations()),
// so without them every login and register caption renders as its raw ${key}.
//
// Which fields to import is not a list maintained here - it is read off
// `src/binaryData/HabboLocalizationCom.as`, the localization component's own asset manifest, so
// a language added in a future dump is picked up without editing this file. Every field whose
// embed is a `*_txt$<hash>` linkage is imported except `manifest`, the Flex asset manifest every
// *Com.as declares.
//
// The 2026 dump declares thirteen; App.ts reads twelve, `default_localizations_se` being the one
// it does not ask for. It is still imported: the manifest is the authority on what exists, and a
// file nobody reads costs a few kilobytes in the bundle.
//
// The target name is the *Com.as FIELD name plus the linkage's `_txt` suffix, because that is
// what App.ts probes - `configurations/<fieldName>_txt.txt`:
//
//   HabboLocalizationCom.as:
//     public static var default_localizations_fr:Class = _SafeCls_494;
//
// and _SafeCls_494's `@identifier` footer recovers the embed it points at
// ("default_localizations_fr_txt$96397d7d...-433105249"), which lands in the dump as
// `src/_assets/2945__SafeCls_494.bin` - plain text despite the extension. Resolution is
// lib/cryptedManifest.mjs's job.
//
// What this tool deliberately does NOT import: `HabboConfigurationCom.as`'s two embeds,
// `common_configuration` and `localization_configuration`. Those are deployment configuration,
// not derived assets - the dump's copies name habbo.com's own hosts (`game-us.habbo.com:30000`,
// `https://www.habbo.com`) and a client built from them dials Sulake, not your hotel. They are
// copied from `config-example/` and edited by hand; see the README's Configuration section.
//
// Like the avatar importer this one OVERWRITES: refreshing a stale text is the point.
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

// The localization component's asset manifest. Its field names are what
// HabboLocalizationManager looks the embedded texts up by.
const COM_FILE_NAME = 'HabboLocalizationCom.as';

// The Flex component manifest, declared by every *Com.as - not a localization text.
const EXCLUDED_FIELD_NAMES = new Set(['manifest']);

const TEXT_LINKAGE_RE = /_txt\$/;

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

// Indexes every text embed in the dump by its whole linkage name (hash included). Joining on
// the whole linkage rather than its short form is what keeps two same-named embeds apart - see
// lib/cryptedManifest.mjs. Text embeds land in `_assets/` with a `.bin` extension whether or not
// the embed class survived obfuscation; the content is plain text either way.
function indexTextEmbeds(cryptedSrc, obfuscatedNameMap)
{
    const linkageToPath = new Map();
    const dir = path.join(cryptedSrc, '_assets');

    if(!fs.existsSync(dir)) return linkageToPath;

    for(const fileName of fs.readdirSync(dir))
    {
        if(!/\.(bin|txt)$/i.test(fileName)) continue;

        const linkage = resolveRawLinkageName(fileName, obfuscatedNameMap);

        if(!linkage || !TEXT_LINKAGE_RE.test(linkage)) continue;
        if(linkageToPath.has(linkage)) continue;

        linkageToPath.set(linkage, path.join(dir, fileName));
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
        console.error(`[import-localizations] No ${COM_FILE_NAME} at ${comFile}`);
        process.exitCode = 1;

        return;
    }

    const {obfuscatedNameMap} = loadCryptedManifest(args.cryptedRoot);
    const linkageToPath = indexTextEmbeds(cryptedSrc, obfuscatedNameMap);

    // Scoped to this one file rather than taken off loadCryptedManifest()'s manifest-wide map:
    // `_txt$` embeds are declared by several components (the chat styles' 77 regPoints among
    // them, which import-chatstyles.mjs owns), and only this component's are localizations.
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
            if(!TEXT_LINKAGE_RE.test(linkage)) continue;

            const sourcePath = linkageToPath.get(linkage);

            if(!sourcePath)
            {
                unresolved.push({fieldName, reason: `embed "${linkage}" has no file in _assets/`});
                continue;
            }

            planned.push({fieldName, linkage, sourcePath, target: path.join(args.outDir, `${fieldName}_txt.txt`)});
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

        console.log(`  ${verb} ${item.fieldName}_txt.txt  (${sizes})  <-  ${path.basename(item.sourcePath)}`);
    }

    console.log(`[import-localizations] ${planned.length} localization texts declared by ${COM_FILE_NAME}`);
    console.log(`[import-localizations] ${added} ${args.write ? 'added' : 'to add'}, ${updated} ${args.write ? 'updated' : 'to update'}, ${unchanged} already current`);

    for(const item of unresolved)
    {
        console.log(`[import-localizations] skipped ${item.fieldName}: ${item.reason}`);
    }

    if(!args.write)
    {
        console.log('[import-localizations] dry run - pass --write to write');
    }
}

main();
