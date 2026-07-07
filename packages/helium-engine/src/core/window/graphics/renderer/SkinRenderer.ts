import type {IWindow} from '../../IWindow';
import type {ISkinRenderer} from './ISkinRenderer';
import type {SkinLayout} from './SkinLayout';
import type {SkinTemplate} from './SkinTemplate';

/**
 * Base skin renderer with template and layout storage.
 *
 * Manages named templates and layouts, and their mapping to window states.
 * Subclasses implement the actual draw() method.
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/renderer/SkinRenderer.as
 */
export class SkinRenderer implements ISkinRenderer 
{
    /** Templates by name. */
    protected _templatesByName: Map<string, SkinTemplate> = new Map();
    /** Templates by window state flag. */
    protected _templatesByState: Map<number, SkinTemplate> = new Map();
    /** Layouts by name. */
    protected _layoutsByName: Map<string, SkinLayout> = new Map();
    /** Layouts by window state flag. */
    protected _layoutsByState: Map<number, SkinLayout> = new Map();

    constructor(name: string) 
    {
        this._name = name;
    }

    protected _name: string;

    public get name(): string 
    {
        return this._name;
    }

    protected _disposed: boolean = false;

    public get disposed(): boolean 
    {
        return this._disposed;
    }

    /**
     * Registers a template by name.
     *
     * @param template - The template to register
     */
    public addTemplate(template: SkinTemplate): void 
    {
        this._templatesByName.set(template.name, template);
    }

    /**
     * Returns a template by name.
     *
     * @param name - The template name
     * @returns The template, or null
     */
    public getTemplate(name: string): SkinTemplate | null 
    {
        return this._templatesByName.get(name) ?? null;
    }

    /**
     * Maps a window state to a template by name.
     *
     * @param state - The window state flag
     * @param templateName - The template name
     */
    public setTemplateForState(state: number, templateName: string): void 
    {
        const template = this._templatesByName.get(templateName);

        if(template) 
        {
            this._templatesByState.set(state, template);
        }
    }

    /**
     * Returns the template mapped to a state.
     *
     * @param state - The window state flag
     * @returns The template, or null
     */
    public getTemplateForState(state: number): SkinTemplate | null 
    {
        return this._templatesByState.get(state) ?? null;
    }

    /**
     * Registers a layout by name.
     *
     * @param layout - The layout to register
     */
    public addLayout(layout: SkinLayout): void 
    {
        this._layoutsByName.set(layout.name, layout);
    }

    /**
     * Returns a layout by name.
     *
     * @param name - The layout name
     * @returns The layout, or null
     */
    public getLayout(name: string): SkinLayout | null 
    {
        return this._layoutsByName.get(name) ?? null;
    }

    /**
     * Maps a window state to a layout by name.
     *
     * @param state - The window state flag
     * @param layoutName - The layout name
     */
    public setLayoutForState(state: number, layoutName: string): void 
    {
        const layout = this._layoutsByName.get(layoutName);

        if(layout) 
        {
            this._layoutsByState.set(state, layout);
        }
    }

    /**
     * Returns the layout mapped to a state.
     *
     * @param state - The window state flag
     * @returns The layout, or null
     */
    public getLayoutForState(state: number): SkinLayout | null 
    {
        return this._layoutsByState.get(state) ?? null;
    }

    /**
     * Tests whether a state has both a template and layout mapped.
     *
     * @param state - The window state flag
     * @returns True if the state is drawable
     */
    public isStateDrawable(state: number): boolean 
    {
        return this._templatesByState.has(state) && this._layoutsByState.has(state);
    }

    /**
     * Draws the skin. Override in subclasses.
     */
    public draw(
        _window: IWindow,
        _ctx: OffscreenCanvasRenderingContext2D,
        _rect: { x: number; y: number; width: number; height: number },
        _state: number,
        _colorize: boolean
    ): void 
    {
        // Override in subclasses
    }

    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;
        this._templatesByName.clear();
        this._templatesByState.clear();
        this._layoutsByName.clear();
        this._layoutsByState.clear();
    }
}
