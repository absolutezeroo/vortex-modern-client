#!/usr/bin/env node
// Imports the client's embedded sound effects out of the AS3 dump, named exactly as AS3
// names them.
//
// Sibling of import-crypted-images.mjs, and it exists for the same reason: the raw dump
// under src/_assets/ is named by embed (`1479_sound_call_for_help_mp3$b35e2c11....mp3`) or,
// when the embed class was obfuscated, by that class (`1466__SafeCls_1517.mp3`). Neither is
// the name the client looks assets up by. That name is the *Com.as field identifier — the
// exact string handed to assets.getAssetByName(), e.g.
//
//   HabboSoundManagerFlash10Com.as:
//     public static var sound_console_new_message:Class = _SafeCls_1517;
//
// and _SafeCls_1517's own `@identifier` footer recovers the embed it points at. Resolution
// is lib/cryptedManifest.mjs's job; this tool is the mp3 half of it.
//
// The field name carries no extension and no `_mp3` suffix: AS3 asks for
// "sound_console_new_message", so the file lands as sound_console_new_message.mp3 and the
// runtime registers it under the bare stem. Adding a type suffix here is the mistake that
// made the `<name>_png` image lookups silently return null.
//
// Sounds are not limited to HabboSoundManagerFlash10Com — every *Com.as is scanned, and any
// field whose embed is an mp3 is imported, so a component that ships its own effects is
// picked up without editing this file.
//
// Run with --dry-run (default) to preview, --write to actually copy files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCryptedManifest, resolveRawFileName} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'WIN63-202607011411-782849652');
const DEFAULT_SOUNDS_DIR = path.resolve(__dirname, '../src/assets/sounds');

function parseArgs()
{
    const argv = process.argv.slice(2);
    const args =
    {
        write: argv.includes('--write'),
        cryptedRoot: DEFAULT_CRYPTED_ROOT,
        soundsDir: DEFAULT_SOUNDS_DIR
    };

    for(let i = 0; i < argv.length; i += 1)
    {
        if(argv[i] === '--source') { args.cryptedRoot = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--out') { args.soundsDir = path.resolve(argv[i + 1]); i += 1; }
    }

    return args;
}

function main()
{
    const args = parseArgs();
    const assetsDir = path.join(args.cryptedRoot, 'src', '_assets');

    if(!fs.existsSync(assetsDir))
    {
        console.error(`[import-crypted-sounds] No _assets directory at ${assetsDir}`);
        process.exitCode = 1;

        return;
    }

    const {obfuscatedNameMap, embedToFieldNames} = loadCryptedManifest(args.cryptedRoot);
    const files = fs.readdirSync(assetsDir).filter(name => /\.mp3$/i.test(name));

    const planned = [];
    const unresolved = [];

    for(const fileName of files)
    {
        const embedShortName = resolveRawFileName(fileName, obfuscatedNameMap);

        if(!embedShortName)
        {
            unresolved.push({fileName, reason: 'filename resolves to no embed'});
            continue;
        }

        const fieldNames = embedToFieldNames.get(embedShortName);

        if(!fieldNames || fieldNames.size === 0)
        {
            // Not a failure: the dump carries embeds no *Com.as declares (unused, or owned
            // by a component that is not in this build). Reported so the count adds up.
            unresolved.push({fileName, reason: `embed "${embedShortName}" is declared by no *Com.as field`});
            continue;
        }

        // One embed can be declared under several field names; AS3 would answer to each, so
        // each gets a copy rather than one arbitrary winner.
        for(const fieldName of fieldNames)
        {
            planned.push({fileName, fieldName, target: path.join(args.soundsDir, `${fieldName}.mp3`)});
        }
    }

    planned.sort((a, b) => a.fieldName.localeCompare(b.fieldName));

    let written = 0;
    let skipped = 0;

    if(args.write && planned.length > 0)
    {
        fs.mkdirSync(args.soundsDir, {recursive: true});
    }

    for(const item of planned)
    {
        if(fs.existsSync(item.target))
        {
            skipped += 1;
            continue;
        }

        if(args.write)
        {
            fs.copyFileSync(path.join(assetsDir, item.fileName), item.target);
        }

        written += 1;

        console.log(`  ${item.fieldName}.mp3  <-  ${item.fileName}`);
    }

    console.log(`[import-crypted-sounds] ${files.length} mp3 embeds in the dump`);
    console.log(`[import-crypted-sounds] ${planned.length} named assets, ${written} ${args.write ? 'copied' : 'to copy'}, ${skipped} already present`);

    for(const item of unresolved)
    {
        console.log(`[import-crypted-sounds] skipped ${item.fileName}: ${item.reason}`);
    }

    if(!args.write)
    {
        console.log('[import-crypted-sounds] dry run - pass --write to copy');
    }
}

main();
