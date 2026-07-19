import type {IWindowContext} from './IWindowContext';

/**
 * Base data model for all windows.
 *
 * Stores position, size, visual properties, type, style, state, and param.
 * WindowController extends this with behavior.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/WindowModel.as
 */
export class WindowModel
{
    protected _offsetX: number = 0;
    protected _offsetY: number = 0;
    protected _initialRect: { x: number; y: number; width: number; height: number };
    protected _previousRect: { x: number; y: number; width: number; height: number };
    protected _minimizedRect: { x: number; y: number; width: number; height: number } | null = null;
    protected _maximizedRect: { x: number; y: number; width: number; height: number } | null = null;
    protected _fillColor: number = 0xFFFFFF;
    protected _dynamicStyleColorTransform: {
        redMultiplier: number;
        greenMultiplier: number;
        blueMultiplier: number;
        alphaMultiplier: number;
        redOffset: number;
        greenOffset: number;
        blueOffset: number;
        alphaOffset: number;
    } | null = null;

    protected _alphaColor: number = 0;
    protected _dynamicStyleName: string = '';

    constructor(
        id: number,
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        tags: string[] | null = null,
        dynamicStyle: string = ''
    )
    {
        this._id = id;
        this._name = name;
        this._type = type;
        this._param = param;
        this._state = 0;
        this._style = style;
        this._tags = tags;
        this._context = context;
        this._dynamicStyleName = dynamicStyle;
        this._x = rect.x;
        this._y = rect.y;
        this._width = rect.width;
        this._height = rect.height;
        this._initialRect = {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
        this._previousRect = {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
    }

    protected _x: number;

    public get x(): number
    {
        return this._x;
    }

    protected _y: number;

    public get y(): number
    {
        return this._y;
    }

    protected _width: number;

    public get width(): number
    {
        return this._width;
    }

    protected _height: number;

    public get height(): number
    {
        return this._height;
    }

    protected _context: IWindowContext;

    public get context(): IWindowContext
    {
        return this._context;
    }

    protected _background: boolean = false;

    public get background(): boolean
    {
        return this._background;
    }

    protected _mouseThreshold: number = 10;

    public get mouseThreshold(): number
    {
        return this._mouseThreshold;
    }

    protected _clipping: boolean = true;

    public get clipping(): boolean
    {
        return this._clipping;
    }

    protected _visible: boolean = true;

    public get visible(): boolean
    {
        return this._visible;
    }

    protected _blend: number = 1;

    public get blend(): number
    {
        return this._blend;
    }

    protected _param: number;

    public get param(): number
    {
        return this._param;
    }

    protected _state: number;

    public get state(): number
    {
        return this._state;
    }

    protected _style: number;

    public get style(): number
    {
        return this._style;
    }

    protected _type: number;

    public get type(): number
    {
        return this._type;
    }

    protected _caption: string = '';

    public get caption(): string
    {
        return this._caption;
    }

    protected _name: string;

    public get name(): string
    {
        return this._name;
    }

    protected _id: number;

    public get id(): number
    {
        return this._id;
    }

    protected _tags: string[] | null;

    public get tags(): string[]
    {
        if(!this._tags) this._tags = [];

        return this._tags;
    }

    protected _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    public get position(): { x: number; y: number }
    {
        return {x: this._x, y: this._y};
    }

    public get rectangle(): { x: number; y: number; width: number; height: number }
    {
        return {x: this._x, y: this._y, width: this._width, height: this._height};
    }

    public get color(): number
    {
        return this._fillColor;
    }

    public get alpha(): number
    {
        return this._alphaColor >>> 24;
    }

    public get left(): number
    {
        return this._x;
    }

    public get top(): number
    {
        return this._y;
    }

    public get right(): number
    {
        return this._x + this._width;
    }

    public get bottom(): number
    {
        return this._y + this._height;
    }

    public get renderingX(): number
    {
        return this._offsetX + this._x;
    }

    public get renderingY(): number
    {
        return this._offsetY + this._y;
    }

    public get renderingWidth(): number
    {
        return this._width + Math.abs(this.etchingPoint.x);
    }

    public get renderingHeight(): number
    {
        return this._height + Math.abs(this.etchingPoint.y);
    }

    public get renderingRectangle(): { x: number; y: number; width: number; height: number }
    {
        return {
            x: this.renderingX,
            y: this.renderingY,
            width: this.renderingWidth,
            height: this.renderingHeight
        };
    }

    public get etchingPoint(): { x: number; y: number }
    {
        return {x: 0, y: 0};
    }

    public get dynamicStyle(): string
    {
        return this._dynamicStyleName;
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._context = null!;
            this._state = 0x40000000;
            this._tags = null;
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
        }
    }

    public invalidate(_rect: { x: number; y: number; width: number; height: number } | null = null): void
    {
        // Override in subclass
    }

    public getInitialWidth(): number
    {
        return this._initialRect.width;
    }

    public getInitialHeight(): number
    {
        return this._initialRect.height;
    }

    public getPreviousWidth(): number
    {
        return this._previousRect.width;
    }

    public getPreviousHeight(): number
    {
        return this._previousRect.height;
    }

    public getMinimizedWidth(): number
    {
        return this._minimizedRect ? this._minimizedRect.width : 0;
    }

    public getMinimizedHeight(): number
    {
        return this._minimizedRect ? this._minimizedRect.height : 0;
    }

    public getMaximizedWidth(): number
    {
        return this._maximizedRect ? this._maximizedRect.width : 2147483647;
    }

    public getMaximizedHeight(): number
    {
        return this._maximizedRect ? this._maximizedRect.height : 2147483647;
    }

    public testTypeFlag(flag: number, mask: number = 0): boolean
    {
        if(mask > 0)
        {
            return ((this._type & mask) ^ flag) === 0;
        }

        return (this._type & flag) === flag;
    }

    public testStateFlag(flag: number, mask: number = 0): boolean
    {
        if(mask > 0)
        {
            return ((this._state & mask) ^ flag) === 0;
        }

        return (this._state & flag) === flag;
    }

    public testStyleFlag(flag: number, mask: number = 0): boolean
    {
        if(mask > 0)
        {
            return ((this._style & mask) ^ flag) === 0;
        }

        return (this._style & flag) === flag;
    }

    public testParamFlag(flag: number, mask: number = 0): boolean
    {
        if(mask > 0)
        {
            return ((this._param & mask) ^ flag) === 0;
        }

        return (this._param & flag) === flag;
    }
}
