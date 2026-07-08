import type {IWindowLayout, IWindowLayoutFilter, IWindowLayoutNode} from '@habbo/window';

/**
 * JSON -> window-layout-XML serializer.
 *
 * The engine's window system consumes layouts in the original Flash XML string
 * format (`parseWindowLayoutXml`). Compiled JSON layouts (see the tools/
 * compile-window-layouts pipeline) therefore have to be re-serialized back into
 * that XML shape before the engine can register them. This module is the reverse
 * of WindowXmlAssetParser: it walks a JSON layout node tree and emits the exact
 * `<layout>/<variables>/<var>/<filters>` XML the engine parser expects.
 *
 * Extracted verbatim from App.ts to keep the application shell focused on the
 * canvas/mouse/render loop.
 */

/** A window-layout node as stored in the compiled JSON layouts. */
export interface IWindowLayoutJsonNode extends IWindowLayoutNode
{
    vars?: Record<string, unknown>;
    children: IWindowLayoutJsonNode[];
}

/** A full window layout as stored in the compiled JSON layouts. */
export interface IWindowLayoutJson extends IWindowLayout
{
    window: IWindowLayoutJsonNode;
    layoutWidth?: number;
    layoutHeight?: number;
}

function isPointValue(value: unknown): value is { x: number; y: number }
{
    return (
        typeof value === 'object'
        && value !== null
        && 'x' in value
        && 'y' in value
        && !('width' in value)
        && !('height' in value)
    );
}

function isRectangleValue(value: unknown): value is { x: number; y: number; width: number; height: number }
{
    return (
        typeof value === 'object'
        && value !== null
        && 'x' in value
        && 'y' in value
        && 'width' in value
        && 'height' in value
    );
}

function escapeXmlValue(value: string): string
{
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r/g, '&#13;')
        .replace(/\n/g, '&#10;');
}

function serializeAttributes(attributes: Record<string, string>): string
{
    const parts = [];

    for(const [name, value] of Object.entries(attributes))
    {
        if(value === undefined)
        {
            continue;
        }

        parts.push(`${name}="${escapeXmlValue(value)}"`);
    }

    return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function serializeVariablesMap(vars?: Record<string, unknown>): string
{
    if(!vars)
    {
        return '';
    }

    const entries = Object.entries(vars)
        .map(([key, value]) => serializeVarNode(key, value))
        .filter((entry) => entry.length > 0)
        .join('');

    return entries.length > 0 ? `<variables>${entries}</variables>` : '';
}

function serializeVarNode(key: string, value: unknown): string
{
    const keyAttr = ` key="${escapeXmlValue(key)}"`;

    if(value === null || value === undefined)
    {
        return `<var${keyAttr} />`;
    }

    if(typeof value === 'string')
    {
        return `<var${keyAttr} type="String" value="${escapeXmlValue(value)}" />`;
    }

    if(typeof value === 'number')
    {
        const numericType = Number.isInteger(value) ? 'int' : 'number';

        return `<var${keyAttr} type="${numericType}" value="${String(value)}" />`;
    }

    if(typeof value === 'boolean')
    {
        return `<var${keyAttr} type="Boolean" value="${String(value)}" />`;
    }

    if(Array.isArray(value))
    {
        const serialized = value
            .map((entry, i) => serializeVarNode(String(i), entry))
            .join('');

        return `<var${keyAttr}><value><Array>${serialized}</Array></value></var>`;
    }

    if(isPointValue(value))
    {
        const point = value as { x: number; y: number };

        return `<var${keyAttr}><value><Point x="${point.x}" y="${point.y}" /></value></var>`;
    }

    if(isRectangleValue(value))
    {
        const rect = value as { x: number; y: number; width: number; height: number };

        return `<var${keyAttr}><value><Rectangle x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" /></value></var>`;
    }

    if(typeof value === 'object')
    {
        const entries = Object.entries(value as Record<string, unknown>)
            .map(([varKey, varValue]) => serializeVarNode(varKey, varValue))
            .join('');

        return `<var${keyAttr}><value><Map>${entries}</Map></value></var>`;
    }

    return '';
}

function serializeFilters(filters?: IWindowLayoutFilter[]): string
{
    if(!filters || filters.length === 0)
    {
        return '';
    }

    const serialized = filters
        .map((filter) =>
        {
            return `<${filter.type}${serializeAttributes(
                Object.fromEntries(
                    Object.entries(filter.attributes)
                        .map(([name, value]) => [name, String(value)] as const)
                )
            )} />`;
        })
        .join('');

    return `<filters>${serialized}</filters>`;
}

function serializeWindowLayoutNode(node: IWindowLayoutJsonNode): string
{
    let xml = `<${node.tag}${serializeAttributes(node.attributes as Record<string, string>)}`;
    const varsXml = serializeVariablesMap(node.vars);
    const childrenXml = node.children.map((child) => serializeWindowLayoutNode(child)).join('');

    if(varsXml.length === 0 && childrenXml.length === 0)
    {
        return `${xml} />`;
    }

    xml += `>${varsXml}`;

    if(childrenXml.length > 0)
    {
        xml += `<children>${childrenXml}</children>`;
    }

    return `${xml}</${node.tag}>`;
}

export function serializeWindowLayoutToXml(layout: IWindowLayoutJson): string
{
    let xml = `<layout`;

    const layoutAttrs: Record<string, string> = {};

    if(layout.layoutWidth !== undefined)
    {
        layoutAttrs.width = String(layout.layoutWidth);
    }

    if(layout.layoutHeight !== undefined)
    {
        layoutAttrs.height = String(layout.layoutHeight);
    }

    xml += `${serializeAttributes(layoutAttrs)}>`;

    const varsXml = serializeVariablesMap(layout.vars);
    const filtersXml = serializeFilters(layout.filters);

    xml += `${varsXml}${filtersXml}${serializeWindowLayoutNode(layout.window)}`;

    return `${xml}</layout>`;
}
