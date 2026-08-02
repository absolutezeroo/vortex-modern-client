/**
 * Base of the login display list.
 *
 * TS-only: stand-in for `flash.events.EventDispatcher` + `flash.display.DisplayObject`, holding
 * only what `onBoardingHcUi` and `login/` rely on. The AS3 widgets are written against Flash's
 * display semantics and lean on them for layout, so the ones that carry meaning are reproduced
 * rather than approximated:
 *
 * - `width`/`height` READ the object's bounds and WRITE a scale factor. Every widget sizes itself
 *   this way (`_defaultBackground.width = _rectangle.width`) and `LoaderUI.alignAnchors()` lays out
 *   entirely off measured bounds, so a naive `width` field would put every button in the wrong place.
 * - Events bubble from the hit object up to the stage, and `stopImmediatePropagation()` ends the
 *   dispatch — `Button.onMouseUp()` depends on it to keep its click from reaching the view behind.
 * - `addedToStage` fires when an object first reaches a stage, which is when every widget builds
 *   its children (`Button.onAddedToStage()`).
 */
import type {BitmapFilter} from './Filters';
import {Rectangle} from './Geom';
import type {DisplayObjectContainer} from './DisplayObjectContainer';
import type {Stage} from './Stage';

/**
 * TS-only: `flash.events.Event`, reduced to the fields the widgets read.
 */
export class DisplayEvent
{
    public readonly type: string;
    public readonly bubbles: boolean;

    /** TS-only: the object the listener is attached to (AS3 `currentTarget`). */
    public currentTarget: DisplayObject | null = null;

    /** TS-only: the object the event originated on (AS3 `target`). */
    public target: DisplayObject | null = null;

    private _stopped: boolean = false;

    constructor(type: string, bubbles: boolean = false)
    {
        this.type = type;
        this.bubbles = bubbles;
    }

    /** TS-only: `get stopped()` — read by the dispatcher, not by AS3. */
    public get stopped(): boolean
    {
        return this._stopped;
    }

    /** TS-only: `stopImmediatePropagation()`. */
    public stopImmediatePropagation(): void
    {
        this._stopped = true;
    }

    /** TS-only: `stopPropagation()` — same effect here, there is no capture phase. */
    public stopPropagation(): void
    {
        this._stopped = true;
    }

    /** TS-only: `clone()` — `InputField.onInputChange()` re-dispatches a cloned change event. */
    public clone(): DisplayEvent
    {
        return new DisplayEvent(this.type, this.bubbles);
    }
}

/**
 * TS-only: `flash.events.MouseEvent`.
 */
export class DisplayMouseEvent extends DisplayEvent
{
    /** TS-only: pointer position in stage coordinates. */
    public readonly stageX: number;

    /** TS-only: pointer position in stage coordinates. */
    public readonly stageY: number;

    constructor(type: string, stageX: number, stageY: number, bubbles: boolean = true)
    {
        super(type, bubbles);

        this.stageX = stageX;
        this.stageY = stageY;
    }

    public override clone(): DisplayMouseEvent
    {
        return new DisplayMouseEvent(this.type, this.stageX, this.stageY, this.bubbles);
    }
}

/**
 * TS-only: `flash.events.KeyboardEvent`, as far as `SsoTokenView.onInputKeyboardEvent()` needs it.
 */
export class DisplayKeyboardEvent extends DisplayEvent
{
    public readonly charCode: number;
    public readonly keyCode: number;

    constructor(type: string, charCode: number, keyCode: number)
    {
        super(type, true);

        this.charCode = charCode;
        this.keyCode = keyCode;
    }
}

/** TS-only: listener signature. */
export type DisplayEventListener = (event: any) => void;

/**
 * TS-only: `flash.events.EventDispatcher`.
 */
export class EventDispatcher
{
    private _listeners: Map<string, DisplayEventListener[]> = new Map();

    /** TS-only: `addEventListener(type, listener)`. */
    public addEventListener(type: string, listener: DisplayEventListener): void
    {
        const listeners = this._listeners.get(type);

        if(!listeners)
        {
            this._listeners.set(type, [listener]);

            return;
        }

        if(listeners.indexOf(listener) < 0)
        {
            listeners.push(listener);
        }
    }

    /** TS-only: `removeEventListener(type, listener)`. */
    public removeEventListener(type: string, listener: DisplayEventListener): void
    {
        const listeners = this._listeners.get(type);

        if(!listeners) return;

        const index = listeners.indexOf(listener);

        if(index >= 0)
        {
            listeners.splice(index, 1);
        }
    }

    /** TS-only: `hasEventListener(type)`. */
    public hasEventListener(type: string): boolean
    {
        const listeners = this._listeners.get(type);

        return !!listeners && listeners.length > 0;
    }

    /**
     * TS-only: `dispatchEvent(event)` for a single node — bubbling is the display list's job
     * (see `DisplayObject.dispatchEvent()`).
     */
    public dispatchEvent(event: DisplayEvent): void
    {
        const listeners = this._listeners.get(event.type);

        if(!listeners || listeners.length === 0) return;

        // Copy: a listener may add or remove listeners while the dispatch is running, which is
        // exactly what Button.onMouseUp() does (it removes itself before calling the action).
        for(const listener of listeners.slice())
        {
            listener(event);

            if(event.stopped) return;
        }
    }

    /** TS-only: drops every listener; part of each widget's dispose path. */
    protected removeAllEventListeners(): void
    {
        this._listeners.clear();
    }
}

/**
 * TS-only: `flash.display.DisplayObject`.
 */
export abstract class DisplayObject extends EventDispatcher
{
    /** TS-only: `name` — the views store list indices here (`_local_3.name = String(index)`). */
    public name: string = '';

    /** TS-only: `alpha`. */
    public alpha: number = 1;

    /** TS-only: `visible`. */
    public visible: boolean = true;

    /** TS-only: `blendMode` — `AvatarView` uses "add" and "overlay" on the halo/glow bitmaps. */
    public blendMode: GlobalCompositeOperation | null = null;

    /** TS-only: `filters`. */
    public filters: BitmapFilter[] = [];

    /** TS-only: `mouseEnabled`. */
    public mouseEnabled: boolean = true;

    protected _x: number = 0;
    protected _y: number = 0;
    protected _scaleX: number = 1;
    protected _scaleY: number = 1;
    protected _parent: DisplayObjectContainer | null = null;
    protected _stage: Stage | null = null;

    /** TS-only: `get x()` / `set x()`. `Button` overrides the setter to track its rectangle. */
    public get x(): number
    {
        return this._x;
    }

    public set x(value: number)
    {
        this._x = value;
    }

    /** TS-only: `get y()` / `set y()`. */
    public get y(): number
    {
        return this._y;
    }

    public set y(value: number)
    {
        this._y = value;
    }

    /** TS-only: `get scaleX()` / `set scaleX()`. */
    public get scaleX(): number
    {
        return this._scaleX;
    }

    public set scaleX(value: number)
    {
        this._scaleX = value;
    }

    /** TS-only: `get scaleY()` / `set scaleY()`. */
    public get scaleY(): number
    {
        return this._scaleY;
    }

    public set scaleY(value: number)
    {
        this._scaleY = value;
    }

    /**
     * TS-only: `get width()` — the object's bounds in parent space, i.e. content size × scale.
     */
    public get width(): number
    {
        return this.getContentBounds().width * this._scaleX;
    }

    /**
     * TS-only: `set width()` — Flash scales the object to reach that width, it does not resize it.
     */
    public set width(value: number)
    {
        const content = this.getContentBounds().width;

        this._scaleX = content > 0 ? value / content : 1;
    }

    /** TS-only: `get height()`. */
    public get height(): number
    {
        return this.getContentBounds().height * this._scaleY;
    }

    /** TS-only: `set height()`. */
    public set height(value: number)
    {
        const content = this.getContentBounds().height;

        this._scaleY = content > 0 ? value / content : 1;
    }

    /** TS-only: `get parent()`. */
    public get parent(): DisplayObjectContainer | null
    {
        return this._parent;
    }

    /** TS-only: `get stage()`. */
    public get stage(): Stage | null
    {
        return this._stage;
    }

    /**
     * TS-only: `dispatchEvent()` with Flash's bubbling — the event runs on this object, then on
     * each ancestor, stopping early if a listener calls `stopImmediatePropagation()`.
     */
    public override dispatchEvent(event: DisplayEvent): void
    {
        if(!event.target)
        {
            event.target = this;
        }

        event.currentTarget = this;
        EventDispatcher.prototype.dispatchEvent.call(this, event);

        if(event.stopped || !event.bubbles) return;

        let node: DisplayObject | null = this._parent;

        while(node)
        {
            event.currentTarget = node;

            EventDispatcher.prototype.dispatchEvent.call(node, event);

            if(event.stopped) return;

            node = node._parent;
        }
    }

    /**
     * TS-only: internal notification that this object's stage changed, so `addedToStage` /
     * `removedFromStage` fire at the same moments Flash fires them.
     */
    public setStage(stage: Stage | null): void
    {
        if(this._stage === stage) return;

        this._stage = stage;

        if(stage)
        {
            this.dispatchEvent(new DisplayEvent('addedToStage'));
        }
        else
        {
            this.dispatchEvent(new DisplayEvent('removedFromStage'));
        }
    }

    /** TS-only: parent assignment, called by `DisplayObjectContainer`. */
    public setParent(parent: DisplayObjectContainer | null): void
    {
        this._parent = parent;
    }

    /**
     * TS-only: paints this object, its scale, alpha, filters and blend mode included.
     */
    public render(context: CanvasRenderingContext2D): void
    {
        if(!this.visible || this.alpha <= 0) return;

        context.save();
        context.translate(this._x, this._y);

        if(this._scaleX !== 1 || this._scaleY !== 1)
        {
            context.scale(this._scaleX, this._scaleY);
        }

        if(this.alpha !== 1)
        {
            context.globalAlpha *= this.alpha;
        }

        if(this.blendMode)
        {
            context.globalCompositeOperation = this.blendMode;
        }

        if(this.filters.length > 0)
        {
            context.filter = this.filters.map(filter => filter.toCssFilter()).join(' ');
        }

        this.draw(context);
        context.restore();
    }

    /**
     * TS-only: hit test in this object's own coordinate space, used by the stage to route
     * pointer events. Returns the deepest object under the point, or null.
     */
    public hitTest(localX: number, localY: number): DisplayObject | null
    {
        if(!this.visible || !this.mouseEnabled) return null;

        const bounds = this.getContentBounds();

        if(localX < bounds.x || localY < bounds.y) return null;

        if(localX > (bounds.x + bounds.width) || localY > (bounds.y + bounds.height)) return null;

        return this;
    }

    /** TS-only: this object's untransformed bounds, in its own coordinate space. */
    public abstract getContentBounds(): Rectangle;

    /** TS-only: paints the object's own content; the transform is already applied. */
    protected abstract draw(context: CanvasRenderingContext2D): void;
}

/**
 * TS-only: an empty bounds rectangle, shared by objects that have no content yet.
 */
export const EMPTY_BOUNDS = new Rectangle(0, 0, 0, 0);
