#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {DOMParser} from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_INPUT = path.resolve(repoRoot, 'sources', 'win63_2023_version', 'binaryDataXml_organized', 'skins');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/assets/window-skins');

const SCALE_TYPE =
{
    fixed: 0,
    move: 1,
    strech: 2,
    stretch: 2,
    tiled: 4,
    center: 8
};

/**
 * Element type name -> type ID mapping.
 * Extracted from AS3 TypeCodeTable.as / WindowType.as
 */
const TYPE_MAP =
{
    'null': 0,
    'icon': 1,
    'background': 2,
    'container': 4,
    'region': 5,
    'header': 6,
    'toolbar': 7,
    'tooltip': 8,
    'notify': 9,
    'text': 10,
    'html': 11,
    'label': 12,
    'link': 14,
    'formatted_text': 15,
    'widget': 16,
    'boxsizer': 17,
    'display_object_wrapper': 20,
    'bitmap': 21,
    'shape': 22,
    'static_bitmap': 23,
    'gradient': 24,
    'stroke': 25,
    'bitmap_fill': 26,
    'border': 30,
    'border_thin': 31,
    'border_thick': 32,
    'border_notify': 33,
    'frame': 35,
    'frame_thin': 36,
    'frame_thick': 37,
    'frame_notify': 38,
    'activator': 40,
    'container_button': 41,
    'selector': 42,
    'selector_list': 43,
    'bubble': 45,
    'bubble_pointer_up': 46,
    'bubble_pointer_right': 47,
    'bubble_pointer_down': 48,
    'bubble_pointer_left': 49,
    'itemlist': 50,
    'itemlist_vertical': 50,
    'itemlist_horizontal': 51,
    'itemgrid': 52,
    'itemgrid_vertical': 53,
    'itemgrid_horizontal': 54,
    'scrollable_itemlist': 55,
    'scrollable_itemlist_vertical': 56,
    'scrollable_itemlist_horizontal': 57,
    'button': 60,
    'button_thick': 61,
    'button_icon': 62,
    'button_up': 63,
    'button_down': 64,
    'button_left': 65,
    'button_right': 66,
    'button_group_left': 67,
    'button_group_center': 68,
    'button_group_right': 69,
    'checkbox': 70,
    'radiobutton': 71,
    'closebutton': 72,
    'minimizebox': 73,
    'maximizebox': 74,
    'restorebox': 75,
    'dragbar': 76,
    'input': 77,
    'password': 78,
    'tab_content': 90,
    'tab_context': 91,
    'tab_selector': 92,
    'tab_button': 93,
    'tab_container_button': 94,
    'menu': 100,
    'menu_item': 101,
    'dropmenu': 102,
    'dropmenu_item': 103,
    'submenu': 104,
    'droplist': 105,
    'droplist_item': 106,
    'slider': 110,
    'slider_horizontal': 111,
    'slider_vertical': 112,
    'scaler': 120,
    'scaler_vertical': 121,
    'scaler_horizontal': 122,
    'scrollbar_horizontal': 130,
    'scrollbar_vertical': 131,
    'scrollbar_slider_bar_horizontal': 132,
    'scrollbar_slider_bar_vertical': 133,
    'scrollbar_slider_track_horizontal': 134,
    'scrollbar_slider_track_vertical': 135,
    'scrollbar_slider_button_right': 136,
    'scrollbar_slider_button_down': 137,
    'scrollbar_slider_button_left': 138,
    'scrollbar_slider_button_up': 139,
    'scrollable_itemgrid_vertical': 140
};

/**
 * Param name -> bitwise flag mapping.
 * Extracted from AS3 ParamCodeTable.as / WindowParam.as
 */
const PARAM_MAP =
{
    'null': 0x0,
    'input_event_processor': 0x1,
    'route_input_events_to_parent': 0x3,
    'observe_parent_input_events': 0x5,
    'internal_event_handling': 0x9,
    'use_parent_graphic_context': 0x10,
    'bound_to_parent_rect': 0x20,
    'relative_horizontal_scale_fixed': 0x0,
    'relative_horizontal_scale_move': 0x40,
    'relative_horizontal_scale_strech': 0x80,
    'relative_horizontal_scale_center': 0xC0,
    'relative_vertical_scale_fixed': 0x0,
    'relative_vertical_scale_move': 0x400,
    'relative_vertical_scale_strech': 0x800,
    'relative_vertical_scale_center': 0xC00,
    'relative_scale_fixed': 0x0,
    'relative_scale_move': 0x440,
    'relative_scale_strech': 0x880,
    'relative_scale_center': 0xCC0,
    'expand_to_accommodate_children': 0x20000,
    'resize_to_accommodate_children': 0x24000,
    'mouse_dragging_target': 0x8000,
    'mouse_dragging_trigger': 0x101,
    'draggable_with_mouse': 0x8101,
    'mouse_scaling_target': 0x10000,
    'horizontal_mouse_scaling_trigger': 0x1000,
    'vertical_mouse_scaling_trigger': 0x2000,
    'mouse_scaling_trigger': 0x3000,
    'scalable_with_mouse': 0x13000,
    'on_accommodate_align_left': 0x0,
    'on_accommodate_align_right': 0x40000,
    'on_accommodate_align_center': 0xC0000,
    'on_accommodate_align_top': 0x0,
    'on_accommodate_align_bottom': 0x100000,
    'on_accommodate_align_middle': 0x300000,
    'on_resize_align_left': 0x0,
    'on_resize_align_right': 0x40000,
    'on_resize_align_center': 0xC0000,
    'on_resize_align_top': 0x0,
    'on_resize_align_bottom': 0x100000,
    'on_resize_align_middle': 0x300000,
    'reflect_horizontal_resize_to_parent': 0x400000,
    'reflect_vertical_resize_to_parent': 0x800000,
    'reflect_resize_to_parent': 0xC00000,
    'parent_window': 0x1,
    'child_window': 0x21,
    'embedded_controller': 0x33,
    'force_clipping': 0x40000000,
    'inherit_caption': 0x80000000
};

/**
 * State name -> state value mapping.
 * Extracted from AS3 WindowState.as
 */
const STATE_MAP =
{
    'default': 0,
    'active': 1,
    'focused': 2,
    'hovering': 4,
    'selected': 8,
    'pressed': 16,
    'disabled': 32,
    'locked': 64,
    'disposed': 1073741824
};

function readArgs()
{
    const [, , ...argv] = process.argv;
    const args = { input: DEFAULT_INPUT, out: DEFAULT_OUTPUT, filter: null };

    for (let i = 0; i < argv.length; i += 1)
    {
        const key = argv[i];

        if (key === '--input' || key === '-i')
        {
            args.input = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--out' || key === '-o')
        {
            args.out = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--filter' || key === '-f')
        {
            args.filter = argv[i + 1];
            i += 1;
        }
    }

    return args;
}

function readBinaryAsXml(filePath)
{
    const buffer = fs.readFileSync(filePath);
    const utf8 = buffer.toString('utf8').trim();

    if (utf8.startsWith('<'))
    {
        return utf8;
    }

    const decoders = [
        () => zlib.inflateSync(buffer),
        () => zlib.inflateRawSync(buffer)
    ];

    for (const decode of decoders)
    {
        try
        {
            const inflated = decode().toString('utf8').trim();

            if (inflated.startsWith('<'))
            {
                return inflated;
            }
        }
        catch
        {
            // Try next decoder
        }
    }

    throw new Error(`Unable to decode ${filePath} as XML (plain or zlib).`);
}

function parseXml(xml)
{
    return new DOMParser(
        {
            onError: (level, message) =>
            {
                if (level === 'fatalError')
                {
                    throw new Error(String(message));
                }
            }
        }
    ).parseFromString(xml, 'text/xml');
}

function readAttributes(element)
{
    const attrs = {};

    if (!element?.attributes)
    {
        return attrs;
    }

    for (let i = 0; i < element.attributes.length; i += 1)
    {
        const attr = element.attributes.item(i);
        attrs[attr.name] = attr.value;
    }

    return attrs;
}

function getChildElements(node, name)
{
    return Array.from(node?.childNodes ?? [])
        .filter((child) =>
            child.nodeType === child.ELEMENT_NODE && (!name || child.nodeName === name)
        );
}

function resolveVar(value, vars)
{
    if (!value)
    {
        return '';
    }

    if (value.startsWith('$'))
    {
        const key = value.slice(1);
        return vars[key] ?? '';
    }

    return value;
}

/**
 * Normalizes an AS3 asset library key to a filename-compatible name.
 *
 * AS3 asset keys use suffixes like `_png`, `_jpg` to indicate the asset
 * type (e.g. `habbo_blue_skin_png`). Our PNG files use the `.png` extension
 * instead, so we strip the type suffix.
 *
 * @param {string} assetKey - The raw AS3 asset key
 * @returns {string} The normalized name (e.g. `habbo_blue_skin`)
 */
function normalizeAssetName(assetKey)
{
    if (!assetKey)
    {
        return '';
    }

    // Strip AS3 type suffixes (_png, _jpg, _xml, etc.)
    return assetKey.replace(/_(png|jpg|jpeg|gif|swf|xml)$/i, '');
}

function parseNumber(value, fallback)
{
    if (value === undefined || value === null || value === '')
    {
        return fallback;
    }

    const str = String(value);
    if (str.startsWith('0x') || str.startsWith('0X'))
    {
        return Number.parseInt(str, 16);
    }

    const parsed = Number(str);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseRectangle(regionNode, vars)
{
    const rectNode = getChildElements(regionNode, 'Rectangle')[0];
    if (!rectNode)
    {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

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
    if (!value)
    {
        return SCALE_TYPE.fixed;
    }

    const key = value.toLowerCase();
    return SCALE_TYPE[key] ?? SCALE_TYPE.fixed;
}

function parseSkinVariables(skinNode)
{
    const vars = {};
    const variablesNode = getChildElements(skinNode, 'variables')[0];
    if (!variablesNode)
    {
        return vars;
    }

    getChildElements(variablesNode, 'variable').forEach((variable) =>
    {
        const attrs = readAttributes(variable);
        const key = attrs.key ?? attrs.name;
        let value = attrs.value ?? '';

        // Normalize asset references (strip _png suffix)
        if (key === 'asset')
        {
            value = normalizeAssetName(value);
        }

        if (key)
        {
            vars[key] = value;
        }
    });

    return vars;
}

function parseSkinTemplates(skinNode, vars)
{
    const templatesNode = getChildElements(skinNode, 'templates')[0];
    if (!templatesNode)
    {
        return [];
    }

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
            asset: normalizeAssetName(resolveVar(attrs.asset, vars)),
            entities
        };
    });
}

function parseSkinLayouts(skinNode, vars)
{
    const layoutsNode = getChildElements(skinNode, 'layouts')[0];
    if (!layoutsNode)
    {
        return [];
    }

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
    if (!statesNode)
    {
        return [];
    }

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

function parseSkinXml(xml, sourcePath, assetId)
{
    const doc = parseXml(xml);
    const skinNode = doc.documentElement?.nodeName === 'skin'
        ? doc.documentElement
        : null;

    if (!skinNode)
    {
        return null;
    }

    const vars = parseSkinVariables(skinNode);
    const skinName = skinNode.getAttribute('name') ?? '';

    return {
        id: assetId,
        name: skinName,
        source: path.relative(repoRoot, sourcePath),
        variables: vars,
        templates: parseSkinTemplates(skinNode, vars),
        layouts: parseSkinLayouts(skinNode, vars),
        states: parseSkinStates(skinNode, vars)
    };
}

function parseElementDescriptionXml(xml, sourcePath, assetId)
{
    const doc = parseXml(xml);
    const elements = Array.from(doc.getElementsByTagName('window')).map((windowNode) =>
    {
        const attrs = readAttributes(windowNode);
        const typeName = attrs.type ?? '';
        const typeId = TYPE_MAP[typeName] ?? -1;
        const statesNode = getChildElements(windowNode, 'states')[0];
        const states = getChildElements(statesNode, 'state').map((state) =>
        {
            const stateAttrs = readAttributes(state);
            return {
                name: stateAttrs.name ?? '',
                layout: stateAttrs.layout ?? '',
                template: stateAttrs.template ?? ''
            };
        });

        return {
            type: typeName,
            typeId,
            intent: attrs.intent ?? '',
            style: parseNumber(attrs.style, 0),
            renderer: attrs.renderer ?? '',
            asset: normalizeAssetName(attrs.asset ?? ''),
            layout: normalizeAssetName(attrs.layout ?? ''),
            windowLayout: normalizeAssetName(attrs.window_layout ?? ''),
            defaults:
            {
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

function findBinFiles(dir, filter)
{
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.xml'))
        .map((entry) => path.join(dir, entry.name))
        .filter((filePath) => !filter || path.basename(filePath).includes(filter));
}

function toAssetId(filePath)
{
    return path.basename(filePath, '.xml')
        .replace(/^HabboHabboWindowManagerCom_/, '')
        .replace(/^HabboWindowManagerCom_/, '')
        .replace(/^\d+_/, '')
        .replace(/_xml$/i, '');
}

function buildLayoutAssetMap(elementDescription)
{
    const layoutAssetMap = new Map();

    for (const element of elementDescription.elements)
    {
        if (!element.asset || !element.layout || element.layout === 'null')
        {
            continue;
        }

        if (!layoutAssetMap.has(element.layout))
        {
            layoutAssetMap.set(element.layout, new Set());
        }

        layoutAssetMap.get(element.layout).add(element.asset);
    }

    return layoutAssetMap;
}

function resolveSkinAssetId(compiled, fallbackAssetId, layoutAssetMap)
{
    const candidates = new Set();
    const layoutNames = compiled.states.length > 0
        ? compiled.states.map((state) => state.layout)
        : compiled.layouts.map((layout) => layout.name);

    for (const layoutName of layoutNames)
    {
        if (!layoutName || layoutName === 'null')
        {
            continue;
        }

        const assets = layoutAssetMap.get(layoutName);

        if (!assets)
        {
            continue;
        }

        for (const asset of assets)
        {
            candidates.add(asset);
        }
    }

    if (candidates.has(fallbackAssetId))
    {
        return fallbackAssetId;
    }

    if (candidates.size > 0)
    {
        return [...candidates].sort()[0];
    }

    return fallbackAssetId;
}

function writeJson(outDir, name, data)
{
    const targetPath = path.join(outDir, `${name}.json`);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
}

function prepareOutputDir(outDir)
{
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
}

function main()
{
    const args = readArgs();

    prepareOutputDir(args.out);

    // The element-description file's numeric ID prefix (e.g. "48_habbo.xml") is assigned by
    // whatever tool extracted this particular source tree, and is not stable across Habbo
    // versions/re-exports - match any "<id>_habbo.xml" (or bare "habbo.xml") instead of a
    // hardcoded ID.
    const elementDescription = fs.readdirSync(args.input)
        .map((entry) => path.join(args.input, entry))
        .find((entry) => /(^|[\\/])(\d+_)?habbo\.xml$/.test(entry));

    if (!elementDescription)
    {
        throw new Error('Unable to locate the "<id>_habbo.xml" element-description file.');
    }

    const elementAssetId = toAssetId(elementDescription);
    const elementXml = readBinaryAsXml(elementDescription);
    const elementData = parseElementDescriptionXml(elementXml, elementDescription, elementAssetId);
    const layoutAssetMap = buildLayoutAssetMap(elementData);

    writeJson(args.out, 'element-description', elementData);
    console.log(`Compiled ${path.relative(repoRoot, elementDescription)}`);

    const skinFiles = findBinFiles(args.input, args.filter)
        .filter((filePath) => path.resolve(filePath) !== path.resolve(elementDescription));

    if (skinFiles.length === 0)
    {
        console.warn('No skin .xml files found matching the provided criteria.');
        return;
    }

    skinFiles.forEach((filePath) =>
    {
        try
        {
            const xml = readBinaryAsXml(filePath);
            const fallbackAssetId = toAssetId(filePath);
            const compiled = parseSkinXml(xml, filePath, fallbackAssetId);

            if (!compiled)
            {
                return;
            }

            const assetId = resolveSkinAssetId(compiled, fallbackAssetId, layoutAssetMap);

            compiled.id = assetId;
            writeJson(args.out, assetId, compiled);
            console.log(`Compiled ${path.relative(repoRoot, filePath)}`);
        }
        catch (error)
        {
            console.error(`Failed to compile ${filePath}: ${error.message}`);
        }
    });
}

main();
