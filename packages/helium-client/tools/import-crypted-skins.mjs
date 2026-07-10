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

const DEFAULT_CRYPTED_ROOT = path.resolve(repoRoot, 'sources', 'win63_2026_crypted_version');
const DEFAULT_SKINS_OUT_DIR = path.resolve(__dirname, '../src/assets/window-skins');

const SCALE_TYPE = {fixed: 0, move: 1, strech: 2, stretch: 2, tiled: 4, center: 8};

// The single master type/style -> asset/windowLayout registry (App.ts hardcodes loading
// it from "window-skins/element-description.json" - see ElementRegistry.ts). Its *Com.as
// field is `habbo_element_description_xml`, but it must NOT go through the generic
// per-skin fieldNameToSkinId() naming/parsing below: its XML shape is completely
// different (a flat list of <window type=... asset=... layout=... window_layout=...>
// descriptors, not <variables>/<templates>/<layouts>/<states>), and every frame/button/
// etc. in the app resolves its chrome template through this file - compiling it as a
// normal (wrongly-shaped) skin silently breaks every generic window template (e.g.
// FrameController.content ends up null because no windowLayout resolves).
const ELEMENT_DESCRIPTION_FIELD_NAME = 'habbo_element_description_xml';
const ELEMENT_DESCRIPTION_OUTPUT_NAME = 'element-description';

/**
 * Element type name -> type ID mapping.
 * Must stay in sync with compile-window-layouts.mjs / compile-window-skins.mjs TYPE_MAP.
 */
const TYPE_MAP =
{
    'null': 0, 'icon': 1, 'background': 2, 'container': 4, 'region': 5,
    'header': 6, 'toolbar': 7, 'tooltip': 8, 'notify': 9, 'text': 10,
    'html': 11, 'label': 12, 'link': 14, 'formatted_text': 15, 'widget': 16,
    'boxsizer': 17, 'display_object_wrapper': 20, 'bitmap': 21,
    'shape': 22, 'static_bitmap': 23, 'gradient': 24, 'stroke': 25,
    'bitmap_fill': 26, 'border': 30, 'border_thin': 31,
    'border_thick': 32, 'border_notify': 33, 'frame': 35, 'frame_thin': 36,
    'frame_thick': 37, 'frame_notify': 38, 'activator': 40,
    'container_button': 41, 'selector': 42, 'selector_list': 43, 'bubble': 45,
    'bubble_pointer_up': 46, 'bubble_pointer_right': 47,
    'bubble_pointer_down': 48, 'bubble_pointer_left': 49, 'itemlist': 50,
    'itemlist_vertical': 50, 'itemlist_horizontal': 51, 'itemgrid': 52,
    'itemgrid_vertical': 53, 'itemgrid_horizontal': 54,
    'scrollable_itemlist': 55, 'scrollable_itemlist_vertical': 56,
    'scrollable_itemlist_horizontal': 57, 'button': 60, 'button_thick': 61,
    'button_icon': 62, 'button_up': 63, 'button_down': 64, 'button_left': 65,
    'button_right': 66, 'button_group_left': 67, 'button_group_center': 68,
    'button_group_right': 69, 'checkbox': 70, 'radiobutton': 71,
    'closebutton': 72, 'minimizebox': 73, 'maximizebox': 74,
    'restorebox': 75, 'dragbar': 76, 'input': 77, 'password': 78,
    'tab_content': 90, 'tab_context': 91, 'tab_selector': 92,
    'tab_button': 93, 'tab_container_button': 94, 'menu': 100,
    'menu_item': 101, 'dropmenu': 102, 'dropmenu_item': 103, 'submenu': 104,
    'droplist': 105, 'droplist_item': 106, 'slider': 110,
    'slider_horizontal': 111, 'slider_vertical': 112, 'scaler': 120,
    'scaler_vertical': 121, 'scaler_horizontal': 122,
    'scrollbar_horizontal': 130, 'scrollbar_vertical': 131,
    'scrollbar_slider_bar_horizontal': 132, 'scrollbar_slider_bar_vertical': 133,
    'scrollbar_slider_track_horizontal': 134,
    'scrollbar_slider_track_vertical': 135,
    'scrollbar_slider_button_right': 136, 'scrollbar_slider_button_down': 137,
    'scrollbar_slider_button_left': 138, 'scrollbar_slider_button_up': 139,
    'scrollable_itemgrid_vertical': 140
};

const PARAM_MAP =
{
    'null': 0x0, 'input_event_processor': 0x1,
    'route_input_events_to_parent': 0x3, 'observe_parent_input_events': 0x5,
    'internal_event_handling': 0x9, 'use_parent_graphic_context': 0x10,
    'bound_to_parent_rect': 0x20, 'relative_horizontal_scale_fixed': 0x0,
    'relative_horizontal_scale_move': 0x40,
    'relative_horizontal_scale_strech': 0x80,
    'relative_horizontal_scale_center': 0xC0,
    'relative_vertical_scale_fixed': 0x0,
    'relative_vertical_scale_move': 0x400,
    'relative_vertical_scale_strech': 0x800,
    'relative_vertical_scale_center': 0xC00,
    'relative_scale_fixed': 0x0, 'relative_scale_move': 0x440,
    'relative_scale_strech': 0x880, 'relative_scale_center': 0xCC0,
    'expand_to_accommodate_children': 0x20000,
    'resize_to_accommodate_children': 0x24000,
    'mouse_dragging_target': 0x8000, 'mouse_dragging_trigger': 0x101,
    'draggable_with_mouse': 0x8101, 'mouse_scaling_target': 0x10000,
    'horizontal_mouse_scaling_trigger': 0x1000,
    'vertical_mouse_scaling_trigger': 0x2000,
    'mouse_scaling_trigger': 0x3000, 'scalable_with_mouse': 0x13000,
    'on_accommodate_align_left': 0x0, 'on_accommodate_align_right': 0x40000,
    'on_accommodate_align_center': 0xC0000,
    'on_accommodate_align_top': 0x0,
    'on_accommodate_align_bottom': 0x100000,
    'on_accommodate_align_middle': 0x300000,
    'on_resize_align_left': 0x0, 'on_resize_align_right': 0x40000,
    'on_resize_align_center': 0xC0000, 'on_resize_align_top': 0x0,
    'on_resize_align_bottom': 0x100000, 'on_resize_align_middle': 0x300000,
    'reflect_horizontal_resize_to_parent': 0x400000,
    'reflect_vertical_resize_to_parent': 0x800000,
    'reflect_resize_to_parent': 0xC00000, 'parent_window': 0x1,
    'child_window': 0x21, 'embedded_controller': 0x33,
    'force_clipping': 0x40000000, 'inherit_caption': 0x80000000
};

/**
 * State name -> state value mapping.
 * Must stay in sync with compile-window-skins.mjs STATE_MAP.
 */
const STATE_MAP =
{
    'default': 0, 'active': 1, 'focused': 2, 'hovering': 4, 'selected': 8,
    'pressed': 16, 'disabled': 32, 'locked': 64, 'disposed': 1073741824
};

// --crypted-root and --out default to their usual repo-relative locations but can be
// pointed elsewhere (e.g. a relocated sources/ dump) via CLI flags - see the dashboard's
// toolRegistry.ts, which surfaces these as directory-picker fields.
function parseArgs()
{
    const argv = process.argv.slice(2);
    const args =
    {
        write: argv.includes('--write'),
        cryptedRoot: DEFAULT_CRYPTED_ROOT,
        out: DEFAULT_SKINS_OUT_DIR
    };

    for(let i = 0; i < argv.length; i += 1)
    {
        if(argv[i] === '--crypted-root') { args.cryptedRoot = path.resolve(argv[i + 1]); i += 1; }
        else if(argv[i] === '--out') { args.out = path.resolve(argv[i + 1]); i += 1; }
    }

    return args;
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
                colorizeMethod: resolveVar(entityAttrs.colorizeMethod, vars) || 'multiply',
                shade: parseNumber(resolveVar(entityAttrs.shade, vars), 0),
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

// Parses the single master element-description document (see module doc comment) - a
// flat list of <window type="..." asset="..." layout="..." window_layout="..."> entries,
// not a normal skin's <variables>/<templates>/<layouts>/<states> shape. Mirrors
// compile-window-skins.mjs's parseElementDescriptionXml() exactly.
function parseElementDescriptionXml(skinNode, sourcePath, assetId)
{
    const elements = Array.from(skinNode.getElementsByTagName('window')).map((windowNode) =>
    {
        const attrs = readAttributes(windowNode);
        const typeName = attrs.type ?? '';
        const typeId = TYPE_MAP[typeName] ?? -1;
        const statesNode = getChildElements(windowNode, 'states')[0];
        const states = getChildElements(statesNode, 'state').map((state) =>
        {
            const stateAttrs = readAttributes(state);

            return {name: stateAttrs.name ?? '', layout: stateAttrs.layout ?? '', template: stateAttrs.template ?? ''};
        });

        return {
            type: typeName,
            typeId,
            intent: attrs.intent ?? '',
            style: parseNumber(attrs.style, 0),
            renderer: attrs.renderer ?? '',
            asset: fieldNameToSkinId(attrs.asset ?? ''),
            layout: fieldNameToSkinId(attrs.layout ?? ''),
            windowLayout: fieldNameToSkinId(attrs.window_layout ?? ''),
            defaults: {
                threshold: parseNumber(attrs.treshold, 10),
                background: attrs.background === 'true',
                blend: parseNumber(attrs.blend, 1),
                color: parseNumber(attrs.color, 0xffffff),
                widthMin: parseNumber(attrs.width_min, -2147483648),
                widthMax: parseNumber(attrs.width_max, 2147483647),
                heightMin: parseNumber(attrs.height_min, -2147483648),
                heightMax: parseNumber(attrs.height_max, 2147483647)
            },
            states
        };
    });

    return {
        id: assetId,
        source: path.relative(repoRoot, sourcePath),
        typeMap: TYPE_MAP,
        paramMap: PARAM_MAP,
        stateMap: STATE_MAP,
        elements
    };
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
    const cryptedLayoutsDir = path.join(args.cryptedRoot, 'src', 'layouts');

    if(!fs.existsSync(cryptedLayoutsDir))
    {
        console.error(`Crypted layouts dump not found at ${cryptedLayoutsDir} - skipping.`);
        process.exit(0);
    }

    console.log('Loading crypted-tree name manifest...');
    const {obfuscatedNameMap, embedToFieldNames, asFileCount, comFileCount} = loadCryptedManifest(args.cryptedRoot);

    console.log(`Scanned ${asFileCount} .as files, ${comFileCount} *Com.as manifests, resolved ${embedToFieldNames.size} embeds to true field names.`);

    // Case-insensitive - see import-crypted-layouts.mjs's identical comment: Windows/
    // macOS silently redirect a differently-cased write onto an existing file instead of
    // creating a new one, which would corrupt unrelated stage-1 content.
    const existingIds = new Set(
        fs.readdirSync(args.out)
            .filter((f) => f.endsWith('.json') && f !== 'element-description.json')
            .map((f) => f.slice(0, -5).toLowerCase())
    );

    let compiled = 0;
    let noFieldNames = 0;
    let notSkinXml = 0;
    let decodeFailed = 0;

    for(const fileName of fs.readdirSync(cryptedLayoutsDir))
    {
        const embedShortName = resolveRawFileName(fileName, obfuscatedNameMap);

        if(!embedShortName) continue;

        const fieldNames = embedToFieldNames.get(embedShortName);

        if(!fieldNames || fieldNames.size === 0)
        {
            noFieldNames++;
            continue;
        }

        const isElementDescription = fieldNames.has(ELEMENT_DESCRIPTION_FIELD_NAME);
        const elementDescriptionMissing = isElementDescription
            && !fs.existsSync(path.join(args.out, `${ELEMENT_DESCRIPTION_OUTPUT_NAME}.json`));

        const trueIds = [...fieldNames]
            .filter((f) => f !== ELEMENT_DESCRIPTION_FIELD_NAME)
            .map(fieldNameToSkinId);
        const missingIds = trueIds.filter((id) => !existingIds.has(id.toLowerCase()));

        if(missingIds.length === 0 && !elementDescriptionMissing) continue;

        const sourcePath = path.join(cryptedLayoutsDir, fileName);
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

        if(elementDescriptionMissing)
        {
            const compiledElementDescription = parseElementDescriptionXml(skinNode, sourcePath, ELEMENT_DESCRIPTION_OUTPUT_NAME);
            const targetPath = path.join(args.out, `${ELEMENT_DESCRIPTION_OUTPUT_NAME}.json`);

            if(args.write)
            {
                fs.writeFileSync(targetPath, JSON.stringify(compiledElementDescription, null, 2), 'utf8');
                console.log(`Compiled ${fileName} -> ${ELEMENT_DESCRIPTION_OUTPUT_NAME}.json (master element-description)`);
            }
            else
            {
                console.log(`[dry-run] would compile ${fileName} -> ${ELEMENT_DESCRIPTION_OUTPUT_NAME}.json (master element-description)`);
            }

            compiled++;
        }

        for(const trueId of missingIds)
        {
            const compiledSkin = compileSkinAs(skinNode, sourcePath, trueId);
            const targetPath = path.join(args.out, `${trueId}.json`);

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
