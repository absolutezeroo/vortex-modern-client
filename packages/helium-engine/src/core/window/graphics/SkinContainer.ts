import type {ISkinContainer} from './ISkinContainer';
import type {ISkinRenderer} from './renderer/ISkinRenderer';
import type {DefaultAttStruct} from '../utils/DefaultAttStruct';

/**
 * Registry of skin renderers, default attributes, and layouts
 * indexed by window type and style.
 *
 * In AS3 this used Dictionary objects with array buckets keyed by
 * type, then indexed by style. In TypeScript we use nested Maps.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/SkinContainer.as
 */
export class SkinContainer implements ISkinContainer
{
    protected static statesByRenderPriority: number[] | null = null;
    private static readonly MAX_STYLE_COUNT: number = 100;
    private _renderers: Map<number, (ISkinRenderer | null)[]> = new Map();
    private _defaults: Map<number, (DefaultAttStruct | null)[]> = new Map();
    private _layouts: Map<number, (string | null)[]> = new Map();
    private _intents: Map<number, (string | null)[]> = new Map();

    constructor()
    {
        if(SkinContainer.statesByRenderPriority === null)
        {
            SkinContainer.statesByRenderPriority = [64, 32, 16, 8, 4, 2, 1, 0];
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Registers a skin renderer for the given type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @param intent - The intent string
	 * @param renderer - The skin renderer
	 * @param layout - The window layout XML
	 * @param defaults - The default attributes
	 */
    public addSkinRenderer(type: number, style: number, intent: string, renderer: ISkinRenderer, layout: string | null, defaults: DefaultAttStruct): void
    {
        if(!this._renderers.has(type))
        {
            this._renderers.set(type, new Array(SkinContainer.MAX_STYLE_COUNT).fill(null));
        }

        this._renderers.get(type)![style] = renderer;

        if(!this._defaults.has(type))
        {
            this._defaults.set(type, new Array(SkinContainer.MAX_STYLE_COUNT).fill(null));
        }

        this._defaults.get(type)![style] = defaults;

        if(!this._layouts.has(type))
        {
            this._layouts.set(type, new Array(SkinContainer.MAX_STYLE_COUNT).fill(null));
        }

        this._layouts.get(type)![style] = layout;

        if(!this._intents.has(type))
        {
            this._intents.set(type, new Array(SkinContainer.MAX_STYLE_COUNT).fill(null));
        }

        this._intents.get(type)![style] = (intent && intent.length > 0) ? intent : style.toString();
    }

    /**
	 * Returns the skin renderer for the given window type and style.
	 * Falls back to style 0 if the specific style has no renderer.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The skin renderer, or null
	 */
    public getSkinRendererByTypeAndStyle(type: number, style: number): ISkinRenderer | null
    {
        const bucket = this._renderers.get(type);

        if(bucket)
        {
            let renderer = bucket[style];

            if(!renderer && style !== 0)
            {
                renderer = bucket[0];
            }

            return renderer ?? null;
        }

        return null;
    }

    /**
	 * Checks whether a skin renderer exists for the given type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns True if a renderer exists
	 */
    public skinRendererExists(type: number, style: number): boolean
    {
        const bucket = this._renderers.get(type);

        return bucket != null && bucket[style] != null;
    }

    /**
	 * Returns the default attributes for the given window type and style.
	 * Falls back to style 0 if the specific style has no defaults.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The default attributes, or null
	 */
    public getDefaultAttributesByTypeAndStyle(type: number, style: number): DefaultAttStruct | null
    {
        const bucket = this._defaults.get(type);

        if(bucket)
        {
            let defaults = bucket[style];

            if(!defaults && style !== 0)
            {
                defaults = bucket[0];
            }

            return defaults ?? null;
        }

        return null;
    }

    /**
	 * Returns the window layout for the given type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The layout XML, or null
	 */
    public getWindowLayoutByTypeAndStyle(type: number, style: number): string | null
    {
        const bucket = this._layouts.get(type);

        if(!bucket)
        {
            return null;
        }

        if(bucket[style] == null)
        {
            return bucket[0] ?? null;
        }

        return bucket[style];
    }

    /**
	 * Returns the intent string for the given type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The intent string, or null
	 */
    public getIntentByTypeAndStyle(type: number, style: number): string | null
    {
        const bucket = this._intents.get(type);

        return (bucket != null && bucket[style] != null) ? bucket[style] : null;
    }

    /**
	 * Resolves the actual drawable state for a window, checking
	 * states in render priority order.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @param state - The combined window state flags
	 * @returns The resolved drawable state
	 */
    public getTheActualState(type: number, style: number, state: number): number
    {
        const renderer = this.getSkinRendererByTypeAndStyle(type, style);

        if(renderer)
        {
            for(const priority of SkinContainer.statesByRenderPriority!)
            {
                if((state & priority) === priority)
                {
                    if(renderer.isStateDrawable(priority))
                    {
                        return priority;
                    }
                }
            }
        }

        return 0;
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._renderers.clear();
            this._defaults.clear();
            this._layouts.clear();
            this._intents.clear();
        }
    }
}
