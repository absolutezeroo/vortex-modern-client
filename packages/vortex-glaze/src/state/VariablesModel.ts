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
     * Declares a new variable on a node, creating its `<variables>` block if the
     * node had none. A node built from the widget palette starts bare, so this is
     * the only way to give it the `text_style` / `asset_uri` / `auto_size` vars
     * the Flash layouts rely on.
     */
    public addVar(name: string, key: string, type: string, value: string): boolean
    {
        if(!name || !key)
        {
            return false;
        }

        const vars = this._byName.get(name) ?? [];

        if(vars.some((entry) => entry.key === key))
        {
            return false;
        }

        vars.push({key, type: type || 'String', value, complex: false});
        this._byName.set(name, vars);

        if(!this._blockXml.has(name))
        {
            this._blockXml.set(name, '<variables/>');
        }

        return true;
    }

    /** Drops a variable from a node (complex ones included). */
    public removeVar(name: string, key: string): void
    {
        const vars = this._byName.get(name);

        if(!vars)
        {
            return;
        }

        const index = vars.findIndex((entry) => entry.key === key);

        if(index >= 0)
        {
            vars.splice(index, 1);
        }
    }

    /**
     * Rebuilds the `<variables>` element for a named node into `targetDoc`,
     * patching simple vars with their edited values, keeping complex vars as they
     * were in the source, appending vars added in the editor and dropping the ones
     * removed. Returns null if the node has no variables at all.
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

        if(vars.length === 0)
        {
            return null;
        }

        const seen = new Set<string>();

        for(const varEl of Array.from(node.children))
        {
            if(varEl.nodeName !== 'var')
            {
                continue;
            }

            const key = varEl.getAttribute('key') ?? varEl.getAttribute('name');
            const gv = key ? vars.find((v) => v.key === key) : undefined;

            if(!gv)
            {
                node.removeChild(varEl); // removed in the editor
                continue;
            }

            if(!gv.complex)
            {
                varEl.setAttribute('value', gv.value);
            }

            seen.add(gv.key);
        }

        for(const entry of vars)
        {
            if(seen.has(entry.key) || entry.complex)
            {
                continue;
            }

            const varEl = parsed.createElement('var');

            varEl.setAttribute('key', entry.key);
            varEl.setAttribute('value', entry.value);
            varEl.setAttribute('type', entry.type);
            node.appendChild(varEl);
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
