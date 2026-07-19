import type {IGraphicContext} from './IGraphicContext';

/**
 * Graphic context implementation.
 *
 * In AS3, GraphicContext extended Sprite and managed BitmapData for rendering.
 * In TypeScript, this is abstracted to rendering metadata that the SolidJS
 * client consumes to produce DOM output.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/GraphicContext.as
 */
export class GraphicContext implements IGraphicContext
{
    public static readonly GC_TYPE_NULL: number = 0;
    public static readonly GC_TYPE_BITMAP: number = 1;
    public static readonly GC_TYPE_TEXT: number = 2;
    public static readonly GC_TYPE_CONTAINER: number = 4;
    public static readonly GC_TYPE_SHAPE: number = 8;
    public static readonly GC_TYPE_MORPH_SHAPE: number = 16;
    public static readonly GC_TYPE_METADATA: number = 0x100;

    private static _instanceCount: number = 0;
    private _type: number;
    private _rectangle: { x: number; y: number; width: number; height: number };
    private _children: IGraphicContext[] = [];

    constructor(name: string, type: number, rect: { x: number; y: number; width: number; height: number })
    {
        GraphicContext._instanceCount++;
        this._name = name;
        this._type = type;
        this._rectangle = {...rect};
    }

    public static get numGraphicContexts(): number
    {
        return GraphicContext._instanceCount;
    }

    private _name: string;

    public get name(): string
    {
        return this._name;
    }

    private _visible: boolean = true;

    public get visible(): boolean
    {
        return this._visible;
    }

    public set visible(value: boolean)
    {
        this._visible = value;
    }

    private _blend: number = 1;

    public get blend(): number
    {
        return this._blend;
    }

    public set blend(value: number)
    {
        this._blend = value;
    }

    private _mouse: boolean = false;

    public get mouse(): boolean
    {
        return this._mouse;
    }

    public set mouse(value: boolean)
    {
        this._mouse = value;
    }

    private _filters: unknown[] = [];

    public get filters(): unknown[]
    {
        return this._filters;
    }

    public set filters(value: unknown[])
    {
        this._filters = value;
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public get numChildContexts(): number
    {
        return this._children.length;
    }

    public offset(x: number, y: number): void
    {
        this._rectangle.x += x;
        this._rectangle.y += y;
    }

    public getDrawRegion(): { x: number; y: number; width: number; height: number }
    {
        return {...this._rectangle};
    }

    public fetchDrawBuffer(): unknown
    {
        return null;
    }

    public addChildContext(context: IGraphicContext): IGraphicContext
    {
        this._children.push(context);

        return context;
    }

    public addChildContextAt(context: IGraphicContext, index: number): IGraphicContext
    {
        this._children.splice(index, 0, context);

        return context;
    }

    public getChildContextAt(index: number): IGraphicContext
    {
        return this._children[index];
    }

    public getChildContextIndex(context: IGraphicContext): number
    {
        return this._children.indexOf(context);
    }

    public removeChildContext(context: IGraphicContext): IGraphicContext
    {
        const index = this._children.indexOf(context);

        if(index >= 0)
        {
            this._children.splice(index, 1);
        }

        return context;
    }

    public removeChildContextAt(index: number): IGraphicContext
    {
        const [removed] = this._children.splice(index, 1);

        return removed;
    }

    public setChildContextIndex(context: IGraphicContext, index: number): void
    {
        const current = this._children.indexOf(context);

        if(current >= 0)
        {
            this._children.splice(current, 1);
            this._children.splice(index, 0, context);
        }
    }

    public swapChildContexts(a: IGraphicContext, b: IGraphicContext): void
    {
        const indexA = this._children.indexOf(a);
        const indexB = this._children.indexOf(b);

        if(indexA >= 0 && indexB >= 0)
        {
            this._children[indexA] = b;
            this._children[indexB] = a;
        }
    }

    public swapChildContextsAt(indexA: number, indexB: number): void
    {
        const temp = this._children[indexA];
        this._children[indexA] = this._children[indexB];
        this._children[indexB] = temp;
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            GraphicContext._instanceCount--;

            for(const child of this._children)
            {
                child.dispose();
            }

            this._children.length = 0;
            this._filters.length = 0;
        }
    }
}
