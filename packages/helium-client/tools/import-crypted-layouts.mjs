#!/usr/bin/env node
// Stage 2 of the asset pipeline - see import-crypted-images.mjs's header for the full
// two-stage explanation. This tool handles window LAYOUTS specifically.
//
// Compiles missing window-layout JSON straight from
// sources/win63_2026_crypted_version/src/layouts (a raw XML dump of the SWF library,
// hash/obfuscated-named - mixed with <skin>-rooted XML for import-crypted-skins.mjs and
// unrelated config blobs, both skipped here) into src/assets/window-layouts, naming
// each output after its true *Com.as field name(s) - resolved via lib/cryptedManifest.mjs
// - never the XML's own internal <layout name="..."> label, which is an unreliable
// Flash-authoring document label.
//
// e.g. sources/.../layouts/1683_club_center_xml$<hash>.xml has <layout name="hc_center" ...>
// internally, but HabboCatalogCom.as declares `public static var club_center_xml:Class =
// club_center_xml$<hash>;` - so the compiled output must be named "club_center_xml.json"
// with `"name": "club_center_xml"`, matching what ClubCenterView.ts actually requests via
// `windowManager.buildWidgetLayout("club_center_xml")`.
//
// One raw XML file can resolve to more than one required name (the same layout reused under
// several logical identities across modules) - a JSON copy is written for each, using the
// exact same parsing logic as compile-window-layouts.mjs. Existing compiled files are never
// overwritten - this only fills in names that don't exist yet.
//
// EXCEPTION - generic UI-chrome templates: src/assets/window-skins/element-description.json's
// `windowLayout` field (consumed verbatim by HabboWindowManager.getLayoutByTypeAndStyle() -
// WindowController.buildLayoutChildren() - to build every frame/header/button/scaler/etc.'s
// internal structure) needs the *Com.as field name minus its trailing "_xml" (confirmed by
// cross-referencing "habbo_window_layout_frame_xml" (field) against the needed
// "habbo_window_layout_frame" (windowLayout value) - same "_xml"-stripping rule
// import-crypted-skins.mjs uses for skin ids, NOT the verbatim rule used everywhere else in
// this file). After the main compile pass, a reconciliation pass reads
// element-description.json (if compiled) and adds a "<name>.json" alias (never renames/
// deletes the verbatim "<name>_xml.json") for every windowLayout value that's missing but
// whose verbatim form exists.
//
// Run with --dry-run (default) to preview, --write to actually compile+write JSON files.
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
const LAYOUTS_OUT_DIR = path.resolve(__dirname, '../src/assets/window-layouts');
const ELEMENT_DESCRIPTION_PATH = path.resolve(__dirname, '../src/assets/window-skins/element-description.json');

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

function castValue(value, typeHint)
{
    if(value === undefined || value === null) return null;

    switch((typeHint || '').toLowerCase())
    {
        case 'boolean':
            return String(value).toLowerCase() === 'true';
        case 'int':
        case 'number':
            return Number(value);
        case 'uint':
        case 'hex':
            return Number.parseInt(String(value), 16);
        case 'array':
            return String(value).split(',').map((entry) => entry.trim()).filter((entry) => entry.length > 0);
        default:
            return value;
    }
}

function readAttributes(element)
{
    const attrs = {};

    if(!element.attributes) return attrs;

    for(let i = 0; i < element.attributes.length; i += 1)
    {
        const attr = element.attributes.item(i);

        attrs[attr.name] = attr.value;
    }

    return attrs;
}

function parsePoint(node)
{
    const attrs = readAttributes(node);

    return {x: Number(attrs.x ?? 0), y: Number(attrs.y ?? 0)};
}

function parseRectangle(node)
{
    const attrs = readAttributes(node);

    return {
        x: Number(attrs.x ?? 0), y: Number(attrs.y ?? 0),
        width: Number(attrs.width ?? 0), height: Number(attrs.height ?? 0)
    };
}

function parseVarNode(varNode)
{
    const attrs = readAttributes(varNode);
    const key = attrs.key ?? attrs.name;
    const typeHint = attrs.type;
    let value = attrs.value;

    const hasChildElements = Array.from(varNode.childNodes).some((child) => child.nodeType === child.ELEMENT_NODE);

    if(!value && hasChildElements)
    {
        let child = Array.from(varNode.childNodes).find((node) => node.nodeType === node.ELEMENT_NODE);

        if(child && child.nodeName === 'value')
        {
            child = Array.from(child.childNodes).find((node) => node.nodeType === node.ELEMENT_NODE) ?? null;
        }

        if(child)
        {
            if(child.nodeName === 'Point') value = parsePoint(child);
            else if(child.nodeName === 'Rectangle') value = parseRectangle(child);
            else if(child.nodeName === 'Array')
            {
                value = Array.from(child.childNodes)
                    .filter((node) => node.nodeType === node.ELEMENT_NODE && node.nodeName === 'var')
                    .map((node) => parseVarNode(node).value);
            }
            else if(child.nodeName === 'Map')
            {
                value = {};
                Array.from(child.childNodes)
                    .filter((node) => node.nodeType === node.ELEMENT_NODE && node.nodeName === 'var')
                    .forEach((node) =>
                    {
                        const parsed = parseVarNode(node);

                        value[parsed.key] = parsed.value;
                    });
            }
        }
    }

    let finalValue = castValue(value, typeHint);

    if(typeof finalValue === 'string' && finalValue.includes('%'))
    {
        try
        {
            let decoded = finalValue;
            let prev;

            do
            {
                prev = decoded;
                decoded = decodeURIComponent(decoded);
            }
            while(decoded !== prev);

            finalValue = decoded;
        }
        catch
        {
            // Keep original if malformed
        }
    }

    return {key, value: finalValue};
}

function parseFilters(filterContainer)
{
    const filters = [];

    Array.from(filterContainer.childNodes)
        .filter((node) => node.nodeType === node.ELEMENT_NODE)
        .forEach((node) =>
        {
            filters.push({type: node.nodeName, attributes: readAttributes(node)});
        });

    return filters;
}

function resolveParams(paramsNode)
{
    let flags = 0;

    Array.from(paramsNode.childNodes)
        .filter((child) => child.nodeType === child.ELEMENT_NODE && child.nodeName === 'param')
        .forEach((param) =>
        {
            const attrs = readAttributes(param);
            const text = (attrs.name ?? param.textContent ?? '').trim().toLowerCase();

            if(PARAM_MAP[text] !== undefined) flags |= PARAM_MAP[text];
            else
            {
                const numValue = Number(text);

                if(!Number.isNaN(numValue)) flags |= numValue;
            }
        });

    return flags;
}

function decodeAttributes(attrs)
{
    const decoded = {...attrs};
    const decodeKeys = ['caption', 'tags', 'tool_tip_caption', 'name'];

    for(const key of decodeKeys)
    {
        if(decoded[key])
        {
            try
            {
                let value = decoded[key];
                let prev;

                do
                {
                    prev = value;
                    value = decodeURIComponent(value);
                }
                while(value !== prev);

                decoded[key] = value;
            }
            catch
            {
                // Keep original if malformed
            }
        }
    }

    return decoded;
}

function buildNode(element)
{
    const tag = element.nodeName;
    const typeId = TYPE_MAP[tag] ?? -1;
    const node = {tag, typeId, attributes: decodeAttributes(readAttributes(element)), children: []};

    Array.from(element.childNodes)
        .filter((child) => child.nodeType === child.ELEMENT_NODE)
        .forEach((child) =>
        {
            if(child.nodeName === 'children')
            {
                Array.from(child.childNodes)
                    .filter((grandChild) => grandChild.nodeType === grandChild.ELEMENT_NODE)
                    .forEach((grandChild) => node.children.push(buildNode(grandChild)));
            }
            else if(child.nodeName === 'params')
            {
                node.params = resolveParams(child);
            }
            else if(child.nodeName === 'variables')
            {
                if(!node.vars) node.vars = {};

                Array.from(child.childNodes)
                    .filter((v) => v.nodeType === v.ELEMENT_NODE && v.nodeName === 'var')
                    .forEach((v) =>
                    {
                        const parsed = parseVarNode(v);

                        node.vars[parsed.key] = parsed.value;
                    });
            }
            else if(child.nodeName === 'filters')
            {
                node.filters = parseFilters(child);
            }
            else
            {
                node.children.push(buildNode(child));
            }
        });

    if(node.params !== undefined)
    {
        const attrParams = parseInt(node.attributes.params || '0', 10) || 0;

        node.attributes.params = String(attrParams | node.params);
        delete node.params;
    }

    return node;
}

// Compiles one raw XML file's <window> content into the compiled layout shape used by
// compile-window-layouts.mjs, but named after `trueName` (a *Com.as field name) instead of
// any filename/uid-derived guess.
function compileLayoutAs(layoutRoot, sourcePath, trueName)
{
    const vars = {};
    const filters = [];

    const windowElements = Array.from(layoutRoot.getElementsByTagName('window'));

    if(windowElements.length === 0) return null;

    Array.from(layoutRoot.childNodes)
        .filter((node) => node.nodeType === node.ELEMENT_NODE)
        .forEach((node) =>
        {
            if(node.nodeName === 'variables')
            {
                Array.from(node.childNodes)
                    .filter((v) => v.nodeType === v.ELEMENT_NODE && v.nodeName === 'var')
                    .forEach((v) =>
                    {
                        const parsed = parseVarNode(v);

                        vars[parsed.key] = parsed.value;
                    });
            }
            else if(node.nodeName === 'filters')
            {
                filters.push(...parseFilters(node));
            }
        });

    const layoutAttrs = readAttributes(layoutRoot);
    const layoutWidth = parseInt(layoutAttrs.width ?? '0', 10) || 0;
    const layoutHeight = parseInt(layoutAttrs.height ?? '0', 10) || 0;

    // Multiple <window> siblings in one file would need a #index suffix (see
    // compile-window-layouts.mjs) - none of the raw dumps observed so far have more than
    // one, so this only handles the common single-window case.
    return {
        name: trueName,
        source: path.relative(repoRoot, sourcePath),
        window: buildNode(windowElements[0]),
        vars,
        filters,
        layoutWidth,
        layoutHeight
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

    // Case-insensitive: Windows/macOS filesystems silently redirect a write to an
    // existing file that differs only in case (e.g. writing "group_entry.json" onto a
    // pre-existing "Group_Entry.json"), which would corrupt unrelated stage-1 content
    // instead of being skipped as "already present". Comparing lowercased names avoids
    // ever attempting that write in the first place.
    const existingNames = new Set(
        fs.readdirSync(LAYOUTS_OUT_DIR)
            .filter((f) => f.endsWith('.json'))
            .map((f) => f.slice(0, -5).toLowerCase())
    );

    let compiled = 0;
    let noFieldNames = 0;
    let notLayoutXml = 0;
    let decodeFailed = 0;

    for(const fileName of fs.readdirSync(CRYPTED_LAYOUTS_DIR))
    {
        const embedShortName = resolveRawFileName(fileName, obfuscatedNameMap);

        if(!embedShortName) continue;

        const trueNames = embedToFieldNames.get(embedShortName);

        if(!trueNames || trueNames.size === 0)
        {
            noFieldNames++;
            continue;
        }

        const missingNames = [...trueNames].filter((n) => !existingNames.has(n.toLowerCase()));

        if(missingNames.length === 0) continue;

        const sourcePath = path.join(CRYPTED_LAYOUTS_DIR, fileName);
        const xml = readBinaryAsXml(sourcePath);

        if(xml === null)
        {
            decodeFailed++;
            continue;
        }

        const document = new DOMParser().parseFromString(xml, 'text/xml');
        const layoutRoot = document.documentElement?.nodeName === 'layout' ? document.documentElement : null;

        if(!layoutRoot)
        {
            // Either <skin>-rooted (see import-crypted-skins.mjs) or an unrelated config
            // blob (chat-bubble style presets, connection properties, etc.) - not ours.
            notLayoutXml++;
            continue;
        }

        for(const trueName of missingNames)
        {
            const compiledLayout = compileLayoutAs(layoutRoot, sourcePath, trueName);

            if(!compiledLayout) continue;

            const targetPath = path.join(LAYOUTS_OUT_DIR, `${trueName}.json`);

            if(args.write)
            {
                fs.writeFileSync(targetPath, JSON.stringify(compiledLayout, null, 2), 'utf8');
                console.log(`Compiled ${fileName} -> ${trueName}.json`);
            }
            else
            {
                console.log(`[dry-run] would compile ${fileName} -> ${trueName}.json`);
            }

            compiled++;
            existingNames.add(trueName.toLowerCase());
        }
    }

    console.log(`\n${compiled} layout(s) ${args.write ? 'compiled' : 'would be compiled'}.`);
    console.log(`${noFieldNames} raw files have no known *Com.as field name (not a registered widget layout, or field not found).`);
    console.log(`${notLayoutXml} files are not <layout>-rooted XML (skin XML or unrelated config - not handled by this tool).`);
    console.log(`${decodeFailed} failed to decode as XML (plain or zlib).`);

    reconcileWindowLayoutAliases(args, existingNames);
}

// See module doc comment ("EXCEPTION - generic UI-chrome templates"): adds a "<name>.json"
// alias for every element-description.json `windowLayout` value that's missing but whose
// verbatim "<name>_xml.json" form was compiled above. Never renames/deletes the verbatim
// copy - only additive.
function reconcileWindowLayoutAliases(args, existingNames)
{
    if(!fs.existsSync(ELEMENT_DESCRIPTION_PATH))
    {
        console.log('\nelement-description.json not found yet - skipping windowLayout alias reconciliation (run import-crypted-skins.mjs first).');
        return;
    }

    const elementDescription = JSON.parse(fs.readFileSync(ELEMENT_DESCRIPTION_PATH, 'utf8'));
    const neededNames = new Set(
        (elementDescription.elements ?? [])
            .map((e) => e.windowLayout)
            .filter((name) => name && name !== 'null')
    );

    let aliased = 0;
    let stillMissing = 0;

    for(const name of neededNames)
    {
        if(existingNames.has(name.toLowerCase())) continue;

        const verbatimPath = path.join(LAYOUTS_OUT_DIR, `${name}_xml.json`);

        if(!fs.existsSync(verbatimPath))
        {
            stillMissing++;
            continue;
        }

        const data = JSON.parse(fs.readFileSync(verbatimPath, 'utf8'));

        data.name = name;

        const targetPath = path.join(LAYOUTS_OUT_DIR, `${name}.json`);

        if(args.write)
        {
            fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Aliased ${name}_xml.json -> ${name}.json (windowLayout)`);
        }
        else
        {
            console.log(`[dry-run] would alias ${name}_xml.json -> ${name}.json (windowLayout)`);
        }

        aliased++;
        existingNames.add(name.toLowerCase());
    }

    console.log(`\n${aliased} windowLayout alias(es) ${args.write ? 'created' : 'would be created'}.`);
    console.log(`${stillMissing} windowLayout name(s) needed but no verbatim source found either (genuine content gap).`);
}

main();
