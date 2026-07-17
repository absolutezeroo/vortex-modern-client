import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
import type {IElementDescriptionData} from '@habbo/window/IElementDescriptor';

export interface IWindowLayoutXmlData {
    name: string;
    source: string;
    xml: string;
}

interface IScaleType {
    fixed: number;
    move: number;
    strech: number;
    stretch: number;
    tiled: number;
    center: number;
}

const SCALE_TYPE: IScaleType =
    {
        fixed: 0,
        move: 1,
        strech: 2,
        stretch: 2,
        tiled: 4,
        center: 8
    };

const TYPE_MAP: Record<string, number> =
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

const PARAM_MAP: Record<string, number> =
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

const STATE_MAP: Record<string, number> =
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

export function parseElementDescriptionXml(
    xml: string,
    assetId: string,
    source: string
): IElementDescriptionData 
{
    const doc = parseXmlDocument(xml, source);
    const windows = Array.from(doc.getElementsByTagName('window'));

    const elements = windows.map((windowNode) => 
    {
        const attrs = readAttributes(windowNode);
        const typeName = attrs.type ?? '';
        const typeId = TYPE_MAP[typeName] ?? -1;
        const statesNode = getChildElements(windowNode, 'states')[0] ?? null;
        const states = getChildElements(statesNode, 'state').map((stateNode) => 
        {
            const stateAttrs = readAttributes(stateNode);

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
            asset: attrs.asset ?? '',
            layout: attrs.layout ?? '',
            windowLayout: attrs.window_layout ?? '',
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
        source,
        typeMap: {...TYPE_MAP},
        paramMap: {...PARAM_MAP},
        stateMap: {...STATE_MAP},
        elements
    };
}

export function parseSkinXml(
    xml: string,
    assetId: string,
    source: string
): ISkinData | null 
{
    const doc = parseXmlDocument(xml, source);
    const skinNode = doc.getElementsByTagName('skin')[0] ?? null;

    if(!skinNode) 
    {
        return null;
    }

    const vars = parseSkinVariables(skinNode);
    const skinName = skinNode.getAttribute('name') ?? '';

    return {
        id: assetId,
        name: skinName,
        source,
        variables: vars,
        templates: parseSkinTemplates(skinNode, vars),
        layouts: parseSkinLayouts(skinNode, vars),
        states: parseSkinStates(skinNode, vars)
    };
}

export function parseWindowLayoutXml(
    xml: string,
    layoutName: string,
    source: string
): IWindowLayoutXmlData[] 
{
    const doc = parseXmlDocument(xml, source);

    if(!doc.documentElement) 
    {
        return [];
    }

    const layoutRoot = doc.documentElement;
    const isLayoutRoot = layoutRoot.nodeName === 'layout';
    const windows = isLayoutRoot
        ? getChildElements(layoutRoot, 'window')
        : (layoutRoot.nodeName === 'window' ? [layoutRoot] : getChildElements(layoutRoot, 'window'));

    if(windows.length === 0) 
    {
        return [];
    }

    const serializer = new XMLSerializer();
    const result: IWindowLayoutXmlData[] = [];

    for(let i = 0; i < windows.length; i++) 
    {
        const currentWindow = windows[i];
        const name = windows.length > 1 ? `${layoutName}#${i}` : layoutName;
        let xmlSource: string;

        if(isLayoutRoot)
        {
            const tempDoc = document.implementation.createDocument('', 'layout', null);
            const tempRoot = tempDoc.documentElement;

            for(let a = 0; a < layoutRoot.attributes.length; a++) 
            {
                const attr = layoutRoot.attributes.item(a);

                if(attr) 
                {
                    tempRoot.setAttribute(attr.name, attr.value);
                }
            }

            for(const child of getChildElements(layoutRoot)) 
            {
                if(child.nodeName === 'window') 
                {
                    continue;
                }

                tempRoot.appendChild(tempDoc.importNode(child, true));
            }

            tempRoot.appendChild(tempDoc.importNode(currentWindow, true));
            xmlSource = serializer.serializeToString(tempRoot);
        }
        else 
        {
            xmlSource = serializer.serializeToString(currentWindow);
        }

        result.push({
            name,
            source,
            xml: xmlSource
        });
    }

    return result;
}

function parseXmlDocument(xml: string, source: string = 'unknown'): XMLDocument 
{
    const normalized = normalizeXmlContent(xml);
    let doc = new DOMParser().parseFromString(normalized, 'text/xml');
    let parserError = getParserError(doc);

    if(parserError)
    {
        // Some extracted XML assets contain missing spaces between attributes:
        // e.g. name="foo"id="0". AS3 tolerated these resources.
        const repaired = repairMalformedAttributeSpacing(normalized);

        if(repaired !== normalized)
        {
            doc = new DOMParser().parseFromString(repaired, 'text/xml');
            parserError = getParserError(doc);
        }
    }

    if(parserError) 
    {
        throw new Error(`[WindowXmlAssetParser] Failed to parse ${source}: ${parserError.textContent ?? 'Unknown XML parse error'}`);
    }

    return doc;
}

function normalizeXmlContent(xml: string): string 
{
    return xml
        .replace(/^\uFEFF/, '')
        // Matching control characters is the point: the extracted assets contain them and
        // XML 1.0 forbids them, so DOMParser would reject a document over one stray byte.
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .trim();
}

function getParserError(doc: XMLDocument): Element | null 
{
    const root = doc.documentElement;

    if(root && root.nodeName === 'parsererror') 
    {
        return root;
    }

    const errors = doc.getElementsByTagName('parsererror');

    if(errors.length > 0) 
    {
        return errors[0];
    }

    return null;
}

function repairMalformedAttributeSpacing(xml: string): string 
{
    // Fix tokens like: name="value"id="0" -> name="value" id="0"
    return xml.replace(/<[^>]+>/g, (tag) => tag.replace(/"(?=[A-Za-z_][\w:.-]*=)/g, '" '));
}

function readAttributes(element: Element | null): Record<string, string> 
{
    const attrs: Record<string, string> = {};

    if(!element) 
    {
        return attrs;
    }

    for(let i = 0; i < element.attributes.length; i++) 
    {
        const attr = element.attributes.item(i);

        if(attr) 
        {
            attrs[attr.name] = attr.value;
        }
    }

    return attrs;
}

function getChildElements(node: Element | null, name?: string): Element[] 
{
    if(!node) 
    {
        return [];
    }

    const elements: Element[] = [];

    for(let i = 0; i < node.childNodes.length; i++) 
    {
        const child = node.childNodes.item(i);

        if(!child || child.nodeType !== Node.ELEMENT_NODE) 
        {
            continue;
        }

        const element = child as Element;

        if(!name || element.nodeName === name) 
        {
            elements.push(element);
        }
    }

    return elements;
}

function parseNumber(value: string | number | null, fallback: number): number
{
    if(value === undefined || value === null || value === '') 
    {
        return fallback;
    }

    const str = String(value);

    if(str.startsWith('0x') || str.startsWith('0X')) 
    {
        const parsedHex = Number.parseInt(str, 16);

        return Number.isNaN(parsedHex) ? fallback : parsedHex;
    }

    const parsed = Number(str);

    return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeAssetName(assetKey: string): string 
{
    if(!assetKey) 
    {
        return '';
    }

    return assetKey.replace(/_(png|jpg|jpeg|gif|swf|xml)$/i, '');
}

function resolveVar(value: string | null, vars: Record<string, string>): string
{
    if(!value) 
    {
        return '';
    }

    if(value.startsWith('$')) 
    {
        const key = value.slice(1);

        return vars[key] ?? '';
    }

    return value;
}

function parseScaleValue(value: string): number 
{
    if(!value) 
    {
        return SCALE_TYPE.fixed;
    }

    const lowered = value.toLowerCase();

    return SCALE_TYPE[lowered as keyof IScaleType] ?? SCALE_TYPE.fixed;
}

function parseRectangle(regionNode: Element | null, vars: Record<string, string>): {
    x: number;
    y: number;
    width: number;
    height: number
} 
{
    const rectNode = getChildElements(regionNode, 'Rectangle')[0] ?? null;

    if(!rectNode) 
    {
        return {x: 0, y: 0, width: 0, height: 0};
    }

    const attrs = readAttributes(rectNode);

    return {
        x: parseNumber(resolveVar(attrs.x, vars), 0),
        y: parseNumber(resolveVar(attrs.y, vars), 0),
        width: parseNumber(resolveVar(attrs.width, vars), 0),
        height: parseNumber(resolveVar(attrs.height, vars), 0)
    };
}

function parseSkinVariables(skinNode: Element): Record<string, string> 
{
    const vars: Record<string, string> = {};
    const variablesNode = getChildElements(skinNode, 'variables')[0] ?? null;

    if(!variablesNode) 
    {
        return vars;
    }

    for(const variable of getChildElements(variablesNode, 'variable')) 
    {
        const attrs = readAttributes(variable);
        const key = attrs.key ?? attrs.name;
        let value = attrs.value ?? '';

        if(key === 'asset') 
        {
            value = normalizeAssetName(value);
        }

        if(key) 
        {
            vars[key] = value;
        }
    }

    return vars;
}

function parseSkinTemplates(skinNode: Element, vars: Record<string, string>): ISkinData['templates'] 
{
    const templatesNode = getChildElements(skinNode, 'templates')[0] ?? null;

    if(!templatesNode) 
    {
        return [];
    }

    return getChildElements(templatesNode, 'template').map((templateNode) => 
    {
        const attrs = readAttributes(templateNode);
        const entitiesNode = getChildElements(templateNode, 'entities')[0] ?? null;
        const entities = getChildElements(entitiesNode, 'entity').map((entityNode) => 
        {
            const entityAttrs = readAttributes(entityNode);
            const regionNode = getChildElements(entityNode, 'region')[0] ?? null;

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

function parseSkinLayouts(skinNode: Element, vars: Record<string, string>): ISkinData['layouts'] 
{
    const layoutsNode = getChildElements(skinNode, 'layouts')[0] ?? null;

    if(!layoutsNode) 
    {
        return [];
    }

    return getChildElements(layoutsNode, 'layout').map((layoutNode) => 
    {
        const attrs = readAttributes(layoutNode);
        const entitiesNode = getChildElements(layoutNode, 'entities')[0] ?? null;
        const entities = getChildElements(entitiesNode, 'entity').map((entityNode) => 
        {
            const entityAttrs = readAttributes(entityNode);
            const colorNode = getChildElements(entityNode, 'color')[0] ?? null;
            const blendNode = getChildElements(entityNode, 'blend')[0] ?? null;
            const scaleNode = getChildElements(entityNode, 'scale')[0] ?? null;
            const regionNode = getChildElements(entityNode, 'region')[0] ?? null;
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

function parseSkinStates(skinNode: Element, vars: Record<string, string>): ISkinData['states'] 
{
    const statesNode = getChildElements(skinNode, 'states')[0] ?? null;

    if(!statesNode) 
    {
        return [];
    }

    return getChildElements(statesNode, 'state').map((stateNode) => 
    {
        const attrs = readAttributes(stateNode);

        return {
            name: resolveVar(attrs.name, vars),
            layout: resolveVar(attrs.layout, vars),
            template: resolveVar(attrs.template, vars)
        };
    });
}
