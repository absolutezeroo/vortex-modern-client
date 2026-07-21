/**
 * A single editable `<var>` entry from a layout's `<variables>` block.
 *
 * `value` is the raw string form (attribute value). `complex` marks vars whose
 * value is a nested `<Point>/<Rectangle>/<Array>/<Map>` structure rather than a
 * flat `value="…"` attribute — those are shown read-only and re-emitted verbatim.
 */
export interface IGlazeVar
{
    key: string;
    type: string;
    value: string;
    complex: boolean;
}

/**
 * VariablesModel — the editor-side source of truth for layout `<variables>`.
 *
 * The live window tree faithfully discards custom `<var>` properties (AS3's base
 * `WindowController` returns `[]` / has an empty `set properties`), so the editor
 * reads and edits them from the layout XML instead. This parses a layout's XML
 * once and maps each named window node to its `<var>` list; edits mutate this
 * model in place. On save, {@link emit} rebuilds each `<variables>` block —
 * preserving complex vars verbatim from the original XML and patching simple
 * values with their edited form.
 *
 * Windows are keyed by their `name` attribute — the same identity the client
 * uses to look a window up (`WindowParser` fills its `namedWindows` map by name).
 */
export class VariablesModel
{
    private readonly _byName: Map<string, IGlazeVar[]> = new Map();
    private readonly _blockXml: Map<string, string> = new Map();

    public constructor(layoutXml: string)
    {
        if(layoutXml)
        {
            this.parse(layoutXml);
        }
    }

    /** The editable variables for a named window node, or an empty array. */
    public getVars(name: string | null): IGlazeVar[]
    {
        if(!name)
        {
            return [];
        }

        return this._byName.get(name) ?? [];
    }

    /** Updates a variable's raw string value in place. */
    public setVarValue(name: string, key: string, value: string): void
    {
        const vars = this._byName.get(name);

        if(!vars)
        {
            return;
        }

        const entry = vars.find((v) => v.key === key);

        if(entry && !entry.complex)
        {
            entry.value = value;
        }
    }

    /**
     * Rebuilds the `<variables>` element for a named node into `targetDoc`,
     * patching simple vars with their edited values and keeping complex vars as
     * they were in the source. Returns null if the node had no variables.
     */
    public emit(name: string, targetDoc: Document): Element | null
    {
        const xml = this._blockXml.get(name);

        if(!xml)
        {
            return null;
        }

        const parsed = new DOMParser().parseFromString(xml, 'text/xml');
        const node = parsed.documentElement;

        if(!node || parsed.getElementsByTagName('parsererror').length > 0)
        {
            return null;
        }

        const vars = this._byName.get(name) ?? [];

        for(let i = 0; i < node.children.length; i++)
        {
            const varEl = node.children.item(i);

            if(!varEl || varEl.nodeName !== 'var')
            {
                continue;
            }

            const key = varEl.getAttribute('key') ?? varEl.getAttribute('name');
            const gv = vars.find((v) => v.key === key);

            if(gv && !gv.complex)
            {
                varEl.setAttribute('value', gv.value);
            }
        }

        return targetDoc.importNode(node, true) as Element;
    }

    private parse(layoutXml: string): void
    {
        let doc: Document;

        try
        {
            doc = new DOMParser().parseFromString(layoutXml, 'text/xml');
        }
        catch
        {
            return;
        }

        if(doc.getElementsByTagName('parsererror').length > 0 || !doc.documentElement)
        {
            return;
        }

        this.visit(doc.documentElement);
    }

    private visit(element: Element): void
    {
        const name = element.getAttribute('name');
        const variablesNode = this.directChild(element, 'variables');

        if(name && variablesNode && !this._byName.has(name))
        {
            const vars = this.parseVars(variablesNode);

            if(vars.length > 0)
            {
                this._byName.set(name, vars);
                this._blockXml.set(name, variablesNode.outerHTML);
            }
        }

        for(let i = 0; i < element.children.length; i++)
        {
            const child = element.children.item(i);

            // Skip the window's own <variables> subtree (nested <var> live there).
            if(child && child.nodeName !== 'variables')
            {
                this.visit(child);
            }
        }
    }

    private parseVars(variablesNode: Element): IGlazeVar[]
    {
        const vars: IGlazeVar[] = [];

        for(let i = 0; i < variablesNode.children.length; i++)
        {
            const node = variablesNode.children.item(i);

            if(!node || node.nodeName !== 'var')
            {
                continue;
            }

            const key = node.getAttribute('key') ?? node.getAttribute('name') ?? '';

            if(!key)
            {
                continue;
            }

            const type = node.getAttribute('type') ?? 'String';
            const valueAttr = node.getAttribute('value');
            const hasChildValue = node.children.length > 0;

            vars.push({
                key,
                type,
                value: valueAttr ?? '',
                complex: valueAttr === null && hasChildValue
            });
        }

        return vars;
    }

    private directChild(element: Element, name: string): Element | null
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
}
