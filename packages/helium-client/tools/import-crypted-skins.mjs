#!/usr/bin/env node
// Stage 2 of the asset pipeline - see import-crypted-images.mjs's header for the full
// two-stage explanation. This tool handles window SKINS specifically.
//
// sources/win63_2026_crypted_version/src/layouts (despite the name - it's a mixed dump,
// see import-crypted-layouts.mjs) also contains 130+ <skin>-rooted XML files with no
// existing importer. Compiles the missing ones into src/assets/window-skins, reusing
// compile-window-skins.mjs's own XML parsing helpers (copied here, consistent with how
// compile-window-skins.mjs already keeps its own TYPE_MAP/PARAM_MAP/STATE_MAP rather than
// sharing with compile-window-layouts.mjs).
//
// Naming rule (different from images/layouts, which use the *Com.as field verbatim):
// src/assets/window-skins/element-description.json's own `asset` field is what
// HabboWindowManager.loadSkinAssets() looks skins up by, and it's built by
// compile-window-skins.mjs's normalizeAssetName(), which strips a trailing
// "_(png|jpg|jpeg|gif|swf|xml)" from the *Com.as field name - e.g. Com.as field
// "habbo_skin_frame_leaderboard_rarity_1_xml" -> skin id "habbo_skin_frame_leaderboard_rarity_1".
// Confirmed against several skins that were missing entirely (habbo_skin_header_7,
// habbo_skin_droplist_thick, habbo_skin_frame_leaderboard_rarity_1..5) before this tool.
//
// Existing compiled skins are never overwritten - this only fills in ids that don't exist
// yet. Run with --dry-run (default) to preview, --write to actually compile+write JSON.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {DOMParser} from '@xmldom/xmldom';
import {loadCryptedManifest, resolveRawFileName} from './lib/cryptedManifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version');
const CRYPTED_LAYOUTS_DIR = path.join(CRYPTED_ROOT, 'src', 'layouts');
const SKINS_OUT_DIR = path.resolve(__dirname, '../src/assets/window-skins');

const SCALE_TYPE = {fixed: 0, move: 1, strech: 2, stretch: 2, tiled: 4, center: 8};

function parseArgs()
{
    return {write: process.argv.includes('--write')};
}

function readBinaryAsXml(filePath)
{
    const buffer = fs.readFileSync(filePath);
    const utf8 = buffer.toString('utf8').trim();

    if(utf8.startsWith('<')) return utf8;

    const decoders = [
        () => zlib.inflateSync(buffer),
        () => zlib.inflateRawSync(buffer)
    ];

    for(const decode of decoders)
    {
        try
        {
            const inflated = decode().toString('utf8').trim();

            if(inflated.startsWith('<')) return inflated;
        }
        catch
        {
            // Try next decoder
        }
    }

    return null;
}

function readAttributes(element)
{
    const attrs = {};

    if(!element?.attributes) return attrs;

    for(let i = 0; i < element.attributes.length; i += 1)
    {
        const attr = element.attributes.item(i);

        attrs[attr.name] = attr.value;
    }

    return attrs;
}

function getChildElements(node, name)
{
    return Array.from(node?.childNodes ?? [])
        .filter((child) => child.nodeType === child.ELEMENT_NODE && (!name || child.nodeName === name));
}

function resolveVar(value, vars)
{
    if(!value) return '';

    if(value.startsWith('$'))
    {
        const key = value.slice(1);

        return vars[key] ?? '';
    }

    return value;
}

// Strips a trailing "_<type>" suffix from a *Com.as field name to get the skin id that
// element-description.json's `asset` field expects (see module doc comment) - distinct
// from lib/cryptedManifest.mjs's stripTypeSuffix(), which strips "_<type>$<hash>" off an
// *embed's own* linkage name instead.
function fieldNameToSkinId(fieldName)
{
    return fieldName.replace(/_(png|jpg|jpeg|gif|swf|xml)$/i, '');
}

function parseNumber(value, fallback)
{
    if(value === undefined || value === null || value === '') return fallback;

    const str = String(value);

    if(str.startsWith('0x') || str.startsWith('0X')) return Number.parseInt(str, 16);

    const parsed = Number(str);

    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseRectangle(regionNode, vars)
{
    const rectNode = getChildElements(regionNode, 'Rectangle')[0];

    if(!rectNode) return {x: 0, y: 0, width: 0, height: 0};

    const attrs = readAttributes(rectNode);

    return {
        x: parseNumber(resolveVar(attrs.x, vars), 0),
        y: parseNumber(resolveVar(attrs.y, vars), 0),
        width: parseNumber(resolveVar(attrs.width, vars), 0),
        height: parseNumber(resolveVar(attrs.height, vars), 0)
    };
}

function parseScaleValue(value)
{
    if(!value) return SCALE_TYPE.fixed;

    return SCALE_TYPE[value.toLowerCase()] ?? SCALE_TYPE.fixed;
}

function parseSkinVariables(skinNode)
{
    const vars = {};
    const variablesNode = getChildElements(skinNode, 'variables')[0];

    if(!variablesNode) return vars;

    getChildElements(variablesNode, 'variable').forEach((variable) =>
    {
        const attrs = readAttributes(variable);
        const key = attrs.key ?? attrs.name;
        let value = attrs.value ?? '';

        if(key === 'asset') value = fieldNameToSkinId(value);

        if(key) vars[key] = value;
    });

    return vars;
}

function parseSkinTemplates(skinNode, vars)
{
    const templatesNode = getChildElements(skinNode, 'templates')[0];

    if(!templatesNode) return [];

    return getChildElements(templatesNode, 'template').map((template) =>
    {
        const attrs = readAttributes(template);
        const entitiesNode = getChildElements(template, 'entities')[0];
        const entities = getChildElements(entitiesNode, 'entity').map((entity) =>
        {
            const entityAttrs = readAttributes(entity);
            const regionNode = getChildElements(entity, 'region')[0];

            return {
                id: parseNumber(resolveVar(entityAttrs.id, vars), 0),
                name: resolveVar(entityAttrs.name, vars),
                type: resolveVar(entityAttrs.type, vars),
                region: parseRectangle(regionNode, vars)
            };
        });

        return {
            name: resolveVar(attrs.name, vars),
            asset: fieldNameToSkinId(resolveVar(attrs.asset, vars)),
            entities
        };
    });
}

function parseSkinLayouts(skinNode, vars)
{
    const layoutsNode = getChildElements(skinNode, 'layouts')[0];

    if(!layoutsNode) return [];

    return getChildElements(layoutsNode, 'layout').map((layout) =>
    {
        const attrs = readAttributes(layout);
        const entitiesNode = getChildElements(layout, 'entities')[0];
        const entities = getChildElements(entitiesNode, 'entity').map((entity) =>
        {
            const entityAttrs = readAttributes(entity);
            const colorNode = getChildElements(entity, 'color')[0];
            const blendNode = getChildElements(entity, 'blend')[0];
            const scaleNode = getChildElements(entity, 'scale')[0];
            const regionNode = getChildElements(entity, 'region')[0];
            const scaleAttrs = readAttributes(scaleNode);
            const colorValue = colorNode?.textContent?.trim() ?? '';
            const blendValue = blendNode?.textContent?.trim() ?? '';
            const colorizeValue = entityAttrs.colorize;

            return {
                id: parseNumber(resolveVar(entityAttrs.id, vars), 0),
                name: resolveVar(entityAttrs.name, vars),
                colorize: colorizeValue === '' || colorizeValue === undefined ? true : colorizeValue === 'true',
                color: parseNumber(resolveVar(colorValue, vars), 0),
                blend: parseNumber(resolveVar(blendValue, vars), 0xffffffff),
                scaleH: parseScaleValue(resolveVar(scaleAttrs.horizontal, vars)),
                scaleV: parseScaleValue(resolveVar(scaleAttrs.vertical, vars)),
                region: parseRectangle(regionNode, vars)
            };
        });

        return {
            name: resolveVar(attrs.name, vars),
            transparent: attrs.transparent === 'true',
            blendMode: attrs.blendMode ?? '',
            entities
        };
    });
}

function parseSkinStates(skinNode, vars)
{
    const statesNode = getChildElements(skinNode, 'states')[0];

    if(!statesNode) return [];

    return getChildElements(statesNode, 'state').map((state) =>
    {
        const attrs = readAttributes(state);

        return {
            name: resolveVar(attrs.name, vars),
            layout: resolveVar(attrs.layout, vars),
            template: resolveVar(attrs.template, vars)
        };
    });
}

function compileSkinAs(skinNode, sourcePath, trueId)
{
    const vars = parseSkinVariables(skinNode);

    return {
        id: trueId,
        name: skinNode.getAttribute('name') ?? '',
        source: path.relative(repoRoot, sourcePath),
        variables: vars,
        templates: parseSkinTemplates(skinNode, vars),
        layouts: parseSkinLayouts(skinNode, vars),
        states: parseSkinStates(skinNode, vars)
    };
}

function main()
{
    const args = parseArgs();

    if(!fs.existsSync(CRYPTED_LAYOUTS_DIR))
    {
        console.error(`Crypted layouts dump not found at ${CRYPTED_LAYOUTS_DIR} - skipping.`);
        process.exit(0);
    }

    console.log('Loading crypted-tree name manifest...');
    const {obfuscatedNameMap, embedToFieldNames, asFileCount, comFileCount} = loadCryptedManifest(CRYPTED_ROOT);

    console.log(`Scanned ${asFileCount} .as files, ${comFileCount} *Com.as manifests, resolved ${embedToFieldNames.size} embeds to true field names.`);

    // Case-insensitive - see import-crypted-layouts.mjs's identical comment: Windows/
    // macOS silently redirect a differently-cased write onto an existing file instead of
    // creating a new one, which would corrupt unrelated stage-1 content.
    const existingIds = new Set(
        fs.readdirSync(SKINS_OUT_DIR)
            .filter((f) => f.endsWith('.json') && f !== 'element-description.json')
            .map((f) => f.slice(0, -5).toLowerCase())
    );

    let compiled = 0;
    let noFieldNames = 0;
    let notSkinXml = 0;
    let decodeFailed = 0;

    for(const fileName of fs.readdirSync(CRYPTED_LAYOUTS_DIR))
    {
        const embedShortName = resolveRawFileName(fileName, obfuscatedNameMap);

        if(!embedShortName) continue;

        const fieldNames = embedToFieldNames.get(embedShortName);

        if(!fieldNames || fieldNames.size === 0)
        {
            noFieldNames++;
            continue;
        }

        const trueIds = [...fieldNames].map(fieldNameToSkinId);
        const missingIds = trueIds.filter((id) => !existingIds.has(id.toLowerCase()));

        if(missingIds.length === 0) continue;

        const sourcePath = path.join(CRYPTED_LAYOUTS_DIR, fileName);
        const xml = readBinaryAsXml(sourcePath);

        if(xml === null)
        {
            decodeFailed++;
            continue;
        }

        const document = new DOMParser().parseFromString(xml, 'text/xml');
        const skinNode = document.documentElement?.nodeName === 'skin' ? document.documentElement : null;

        if(!skinNode)
        {
            // Either <layout>-rooted (see import-crypted-layouts.mjs) or an unrelated
            // config blob - not ours.
            notSkinXml++;
            continue;
        }

        for(const trueId of missingIds)
        {
            const compiledSkin = compileSkinAs(skinNode, sourcePath, trueId);
            const targetPath = path.join(SKINS_OUT_DIR, `${trueId}.json`);

            if(args.write)
            {
                fs.writeFileSync(targetPath, JSON.stringify(compiledSkin, null, 2), 'utf8');
                console.log(`Compiled ${fileName} -> ${trueId}.json`);
            }
            else
            {
                console.log(`[dry-run] would compile ${fileName} -> ${trueId}.json`);
            }

            compiled++;
            existingIds.add(trueId.toLowerCase());
        }
    }

    console.log(`\n${compiled} skin(s) ${args.write ? 'compiled' : 'would be compiled'}.`);
    console.log(`${noFieldNames} raw files have no known *Com.as field name (not a registered skin, or field not found).`);
    console.log(`${notSkinXml} files are not <skin>-rooted XML (layout XML or unrelated config - not handled by this tool).`);
    console.log(`${decodeFailed} failed to decode as XML (plain or zlib).`);
}

main();
