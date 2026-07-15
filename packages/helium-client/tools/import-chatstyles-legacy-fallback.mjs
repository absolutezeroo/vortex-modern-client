#!/usr/bin/env node
// One-off fallback for import-chatstyles.mjs: resolves chat-style regpoints that the
// current primary crypted tree (WIN63-202607011411-782849652) can't resolve, against the
// older WIN63-202601121721-391685409 dump instead. That tree has a different layout (no
// "src/" prefix; HabboFreeFlowChatCom.as lives under scripts/, raw assets directly under
// binaryData/) so it can't just be passed as --crypted-root to import-chatstyles.mjs.
//
// Run with --dry-run (default) to preview, --write to actually copy files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const LEGACY_ROOT = path.resolve(repoRoot, 'sources', 'WIN63-202601121721-391685409');
const CONFIG_OUT = path.resolve(__dirname, '../src/assets/configurations');
const MANIFEST_PATH = path.join(CONFIG_OUT, 'chatstyles-manifest.json');

const FIELD_RE = /public\s+static\s+var\s+(\w+)\s*:\s*Class\s*=\s*([\w$]+)\s*;/g;
const IDENTIFIER_RE = /@identifier\s+(\S+)\s*=\s*"([^"]+)"/g;
const RAW_EMBED_RE = /_(png|gif|jpg|swf|mp3|ttf|xml)\$/;

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

function buildFullValueIndex(dir, obfuscatedNameMap)
{
    const index = new Map();

    if(!fs.existsSync(dir)) return index;

    for(const fileName of fs.readdirSync(dir))
    {
        const match = /^\d+_(.+)\.\w+$/i.exec(fileName);

        if(!match) continue;

        const stem = match[1];
        const rawValue = RAW_EMBED_RE.test(stem) ? stem : (obfuscatedNameMap.get(stem) ?? null);

        if(!rawValue) continue;
        if(!index.has(rawValue)) index.set(rawValue, path.join(dir, fileName));
    }

    return index;
}

function splitStyleField(fieldName)
{
    const suffix = 'regpoints';

    if(!fieldName.startsWith('style_') || !fieldName.endsWith(`_${suffix}`)) return null;

    return fieldName.slice('style_'.length, -(suffix.length + 1));
}

function main()
{
    const write = process.argv.includes('--write');
    const wanted = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));

    const manifestPath = path.join(LEGACY_ROOT, 'scripts', 'HabboFreeFlowChatCom.as');

    console.log('Loading legacy-tree name manifest...');
    const asFiles = findAsFiles(LEGACY_ROOT);
    const obfuscatedNameMap = buildObfuscatedNameMap(asFiles);
    console.log(`Indexed ${obfuscatedNameMap.size} @identifier entries from ${asFiles.length} .as files.`);

    const rawIndex = buildFullValueIndex(path.join(LEGACY_ROOT, 'binaryData'), obfuscatedNameMap);
    console.log(`Indexed ${rawIndex.size} raw binaryData files.`);

    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const fields = new Map();
    let match;

    while((match = FIELD_RE.exec(manifestContent)) !== null) fields.set(match[1], match[2]);

    // import-chatstyles.mjs's own manifest write is scoped to whatever it resolves in a
    // single --crypted-root run, so this fallback tool must patch the same manifest itself -
    // otherwise a style whose regpoints .txt lands on disk (and in the bundle) via this
    // script still gets skipped at runtime by App.ts::readEmbeddedConfigurationAssets(),
    // which trusts the manifest's hasRegpoints flag rather than checking the bundle directly.
    const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) : {};

    let copied = 0;
    let unresolved = 0;
    let skippedNotWanted = 0;
    let manifestUpdated = false;

    for(const [fieldName, refClass] of fields)
    {
        const id = splitStyleField(fieldName);

        if(!id) continue;
        if(wanted.length > 0 && !wanted.includes(id)) { skippedNotWanted++; continue; }

        const rawValue = RAW_EMBED_RE.test(refClass) ? refClass : (obfuscatedNameMap.get(refClass) ?? null);
        const sourcePath = rawValue ? rawIndex.get(rawValue) : null;

        if(!sourcePath)
        {
            unresolved++;
            console.warn(`style_${id}_regpoints: could not resolve in legacy tree either.`);
            continue;
        }

        const targetPath = path.join(CONFIG_OUT, `style_${id}_regpoints.txt`);
        const alreadyOnDisk = fs.existsSync(targetPath);

        if(alreadyOnDisk)
        {
            console.log(`style_${id}_regpoints: target already exists, skipping.`);
        }
        else
        {
            console.log(`${write ? 'Copying' : '[dry-run] would copy'} style_${id}_regpoints <- ${path.relative(repoRoot, sourcePath)}`);

            if(write) fs.copyFileSync(sourcePath, targetPath);

            copied++;
        }

        if(write && manifest[id] && !manifest[id].hasRegpoints)
        {
            manifest[id].hasRegpoints = true;
            manifestUpdated = true;
        }
    }

    if(manifestUpdated)
    {
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
        console.log(`Updated ${path.relative(repoRoot, MANIFEST_PATH)} (hasRegpoints flags).`);
    }

    console.log(`\n${copied} file(s) ${write ? 'copied' : 'would be copied'}, ${unresolved} unresolved, ${skippedNotWanted} skipped (not in wanted list).`);
}

main();
