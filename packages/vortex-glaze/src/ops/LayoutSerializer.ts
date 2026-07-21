import {WindowParser} from '@core/window/utils/WindowParser';
import type {EditorState} from '../state/EditorState';

/**
 * Layout persistence for the editor.
 *
 * Structure + attributes come from the engine's own AS3-faithful serializer
 * `WindowParser.windowToXMLString` (walking the live window tree); the source
 * `<variables>` blocks — which the live tree faithfully discards — are re-injected
 * per named node from the {@link VariablesModel}. Round-trip caveat (R1): the
 * engine serializer emits raw children via `numChildren`/`getChildAt`, so windows
 * whose children are inserted through list/grid iterators may not reproduce
 * byte-for-byte; simple container/region/text/border trees round-trip cleanly.
 */
export function serializeLayout(state: EditorState): string
{
    const root = state.rootWindow;

    if(!root || root.disposed)
    {
        return '';
    }

    const parser = new WindowParser(root.context);
    const xml = parser.windowToXMLString(root);

    return injectVariables(xml, state);
}

function injectVariables(xml: string, state: EditorState): string
{
    const model = state.variables;

    if(!model)
    {
        return xml;
    }

    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    if(doc.getElementsByTagName('parsererror').length > 0 || !doc.documentElement)
    {
        return xml;
    }

    const visit = (el: Element): void =>
    {
        const name = el.getAttribute('name');

        if(name && !directChild(el, 'variables'))
        {
            const block = model.emit(name, doc);

            if(block)
            {
                el.appendChild(block);
            }
        }

        for(const child of Array.from(el.children))
        {
            visit(child);
        }
    };

    visit(doc.documentElement);

    return new XMLSerializer().serializeToString(doc);
}

function directChild(element: Element, name: string): Element | null
{
    for(let i = 0; i < element.children.length; i++)
    {
        const child = element.children.item(i);

        if(child && child.nodeName === name)
        {
            return child;
        }
    }

    return null;
}

/** Downloads the current layout as an `.xml` file. */
export function downloadLayout(state: EditorState): void
{
    const xml = serializeLayout(state);

    if(!xml)
    {
        return;
    }

    const name = state.currentLayoutName ?? 'layout';
    const blob = new Blob([xml], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `${name}.xml`;
    a.click();
    URL.revokeObjectURL(url);
}

/** Saves the current layout back to disk via the dev-server middleware. */
export async function saveLayout(state: EditorState): Promise<{ ok: boolean; message: string }>
{
    const xml = serializeLayout(state);
    const name = state.currentLayoutName;

    if(!xml || !name)
    {
        return {ok: false, message: 'Nothing to save'};
    }

    try
    {
        const res = await fetch('/glaze/save', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, xml})
        });
        const data = (await res.json().catch(() => ({}))) as { message?: string };

        return {ok: res.ok, message: data.message ?? (res.ok ? 'Saved' : `HTTP ${res.status}`)};
    }
    catch (error)
    {
        return {ok: false, message: String(error)};
    }
}

/** Registers raw layout XML under a name and opens it in the editor. */
export function importLayoutXml(state: EditorState, xml: string, name: string): boolean
{
    try
    {
        state.runtime.windowManager.registerWidgetLayout(name, xml);
        state.runtime.layoutXml.set(name, xml);
        state.openLayout(name);

        return true;
    }
    catch
    {
        return false;
    }
}
