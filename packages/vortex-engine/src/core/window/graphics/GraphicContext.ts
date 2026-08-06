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
    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::GC_TYPE_BITMAP
    public static readonly GC_TYPE_BITMAP: number = 1;
    public static readonly GC_TYPE_TEXT: number = 2;
    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::GC_TYPE_CONTAINER
    public static readonly GC_TYPE_CONTAINER: number = 4;
    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::GC_TYPE_SHAPE
    public static readonly GC_TYPE_SHAPE: number = 8;
    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::GC_TYPE_MORPH_SHAPE
    public static readonly GC_TYPE_MORPH_SHAPE: number = 16;
    public static readonly GC_TYPE_METADATA: number = 0x100;

    private static _instanceCount: number = 0;
    private _type: number;
    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::_rectangle
    private _rectangle: { x: number; y: number; width: number; height: number };
    private _children: IGraphicContext[] = [];

    constructor(name: string, type: number, rect: { x: number; y: number; width: number; height: number })
    {
        GraphicContext._instanceCount++;
        this._name = name;
        this._type = type;
        this._rectangle = {...rect};
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get numGraphicContexts()
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

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get blend()
    public get blend(): number
    {
        return this._blend;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::set blend()
    public set blend(value: number)
    {
        this._blend = value;
    }

    private _mouse: boolean = false;

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get mouse()
    public get mouse(): boolean
    {
        return this._mouse;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::set mouse()
    public set mouse(value: boolean)
    {
        this._mouse = value;
    }

    private _filters: unknown[] = [];

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get filters()
    public get filters(): unknown[]
    {
        return this._filters;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::set filters()
    public set filters(value: unknown[])
    {
        this._filters = value;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::get numChildContexts()
    public get numChildContexts(): number
    {
        return this._children.length;
    }

    public offset(x: number, y: number): void
    {
        this._rectangle.x += x;
        this._rectangle.y += y;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::getDrawRegion()
    public getDrawRegion(): { x: number; y: number; width: number; height: number }
    {
        return {...this._rectangle};
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::fetchDrawBuffer()
    public fetchDrawBuffer(): unknown
    {
        return null;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::addChildContext()
    public addChildContext(context: IGraphicContext): IGraphicContext
    {
        this._children.push(context);

        return context;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::addChildContextAt()
    public addChildContextAt(context: IGraphicContext, index: number): IGraphicContext
    {
        this._children.splice(index, 0, context);

        return context;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::getChildContextAt()
    public getChildContextAt(index: number): IGraphicContext
    {
        return this._children[index];
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::getChildContextIndex()
    public getChildContextIndex(context: IGraphicContext): number
    {
        return this._children.indexOf(context);
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::removeChildContext()
    public removeChildContext(context: IGraphicContext): IGraphicContext
    {
        const index = this._children.indexOf(context);

        if(index >= 0)
        {
            this._children.splice(index, 1);
        }

        return context;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::removeChildContextAt()
    public removeChildContextAt(index: number): IGraphicContext
    {
        const [removed] = this._children.splice(index, 1);

        return removed;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::setChildContextIndex()
    public setChildContextIndex(context: IGraphicContext, index: number): void
    {
        const current = this._children.indexOf(context);

        if(current >= 0)
        {
            this._children.splice(current, 1);
            this._children.splice(index, 0, context);
        }
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::swapChildContexts()
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

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::swapChildContextsAt()
    public swapChildContextsAt(indexA: number, indexB: number): void
    {
        const temp = this._children[indexA];
        this._children[indexA] = this._children[indexB];
        this._children[indexB] = temp;
    }

    // AS3: .../src/com/sulake/core/window/graphics/GraphicContext.as::dispose()
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
