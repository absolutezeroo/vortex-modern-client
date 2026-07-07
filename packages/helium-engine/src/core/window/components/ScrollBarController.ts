import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import type {IWindowContext} from '../IWindowContext';
import type {IScrollbarWindow} from './IScrollbarWindow';
import type {IScrollableWindow} from './IScrollableWindow';
import {InteractiveController} from './InteractiveController';
import type {ScrollBarLiftController} from './ScrollBarLiftController';
import type {WindowController} from '../WindowController';
import type {WindowEvent} from '../events/WindowEvent';
import type {WindowMouseEvent} from '../events/WindowMouseEvent';
import type {PropertyStruct} from '../utils/PropertyStruct';

/**
 * Controller for scrollbar windows.
 *
 * Manages scroll state, lift (thumb) positioning, increment/decrement
 * buttons, and binding to a scrollable target window.
 *
 * @see sources/win63_version/com/sulake/core/window/components/ScrollBarController.as
 */
// AS3: sources/win63_version/core/window/components/ScrollBarController.as::ScrollBarController()
export class ScrollBarController extends InteractiveController implements IScrollbarWindow
{
    private static readonly SCROLL_BUTTON_INCREMENT: string = 'increment';
    private static readonly SCROLL_BUTTON_DECREMENT: string = 'decrement';
    private static readonly SCROLL_SLIDER_TRACK: string = 'slider_track';
    private static readonly SCROLL_SLIDER_BAR: string = 'slider_bar';

    protected _offset: number = 0;
    protected _scrollStep: number = 0.1;
    private _targetName: string | null = null;
    private _isUpdatingLift: boolean = false;
    private _initialized: boolean = false;
    private _boundScrollButtonEventProc: ((event: WindowEvent, window: IWindow) => void);
    private _boundOnScrollableResized: ((event: WindowEvent) => void);
    private _boundOnScrollableScrolled: ((event: WindowEvent) => void);

    // AS3: sources/win63_version/core/window/components/ScrollBarController.as::ScrollBarController()
    constructor(
        name: string,
        type: number,
        style: number,
        param: number,
        context: IWindowContext,
        rect: { x: number; y: number; width: number; height: number },
        parent: IWindow | null = null,
        procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
        tags: string[] | null = null,
        properties: unknown[] | null = null,
        id: number = 0,
        dynamicStyle: string = ''
    )
    {
        super(name, type, style, param, context, rect, parent, procedure, tags, null, id);

        this._hasVisualContent = false;
        this._horizontal = (type === 130);

        this._boundScrollButtonEventProc = this.scrollButtonEventProc.bind(this);
        this._boundOnScrollableResized = this.onScrollableResized.bind(this);
        this._boundOnScrollableScrolled = this.onScrollableScrolled.bind(this);
        this._initialized = true;

        if(properties !== null)
        {
            this.properties = properties;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/ScrollBarController.as::ScrollBarController()
    // groupChildrenWithTag()/updateLiftSizeAndPosition() read the increment/decrement/
    // track/lift children built by buildLayoutChildren(), which only runs later via
    // completeConstruction() (see WindowController.ts's phase-split) - at constructor
    // time no children exist yet, so this can't run there anymore.
    protected override finalize(): void
    {
        super.finalize();

        const internals: IWindow[] = [];

        this.groupChildrenWithTag('_INTERNAL', internals, -1);

        for(const child of internals)
        {
            child.procedure = this._boundScrollButtonEventProc;
        }

        this.updateLiftSizeAndPosition();
    }

    protected _scrollable: IScrollableWindow | null = null;

    /**
	 * Gets the scrollable target window.
	 */
    public get scrollable(): IScrollableWindow | null
    {
        return this._scrollable;
    }

    /**
	 * Sets the scrollable target window. Binds resize/scroll event listeners.
	 */
    public set scrollable(value: IScrollableWindow | null)
    {
        if(this._scrollable !== null && !this._scrollable.disposed)
        {
            (this._scrollable as unknown as IWindow).removeEventListener('WE_RESIZED', this._boundOnScrollableResized);
            (this._scrollable as unknown as IWindow).removeEventListener('WE_SCROLL', this._boundOnScrollableScrolled);
        }

        this._scrollable = value;

        if(this._scrollable !== null && !this._scrollable.disposed)
        {
            (this._scrollable as unknown as IWindow).addEventListener('WE_RESIZED', this._boundOnScrollableResized);
            (this._scrollable as unknown as IWindow).addEventListener('WE_SCROLL', this._boundOnScrollableScrolled);
            this.updateLiftSizeAndPosition();
        }
    }

    private _horizontal: boolean | null = null;

    /**
	 * Gets whether this scrollbar is horizontal.
	 */
    // AS3: sources/win63_version/core/window/components/ScrollBarController.as::get horizontal()
    public get horizontal(): boolean
    {
        return this._horizontal ?? (this.type === 130);
    }

    /**
	 * Gets whether this scrollbar is vertical.
	 */
    // AS3: sources/win63_version/core/window/components/ScrollBarController.as::get vertical()
    public get vertical(): boolean
    {
        return !this.horizontal;
    }

    /**
	 * Gets the horizontal scroll position (0..1).
	 */
    public get scrollH(): number
    {
        return this.horizontal ? this._offset : 0;
    }

    /**
	 * Sets the horizontal scroll position.
	 */
    public set scrollH(value: number)
    {
        if(this.horizontal)
        {
            if(this.setScrollPosition(value, true))
            {
                this.updateLiftSizeAndPosition();
            }
        }
    }

    /**
	 * Gets the vertical scroll position (0..1).
	 */
    public get scrollV(): number
    {
        return this.horizontal ? 0 : this._offset;
    }

    /**
	 * Sets the vertical scroll position.
	 */
    public set scrollV(value: number)
    {
        if(this.vertical)
        {
            if(this.setScrollPosition(value, true))
            {
                this.updateLiftSizeAndPosition();
            }
        }
    }

    public override get properties(): unknown[]
    {
        const props = super.properties;
        let targetStr: string | null = null;

        if(this._scrollable !== null)
        {
            targetStr = (this._scrollable as unknown as IWindow).name;
        }
        else if(this._targetName !== null)
        {
            targetStr = this._targetName;
        }

        if(targetStr === null)
        {
            props.push(this.getDefaultProperty('scrollable'));
        }
        else
        {
            props.push(this.createProperty('scrollable', targetStr));
        }

        return props;
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            switch(prop.key)
            {
                case 'scrollable':
                    this._targetName = prop.value as string;
                    this._scrollable = null;
                    break;
            }
        }

        super.properties = value;
    }

    /**
	 * Gets the track child window.
	 */
    protected get track(): WindowController | null
    {
        return this.findChildByName(ScrollBarController.SCROLL_SLIDER_TRACK) as WindowController | null;
    }

    /**
	 * Gets the lift (thumb) child window inside the track.
	 */
    protected get lift(): WindowController | null
    {
        const trackWindow = this.track;

        if(!trackWindow) return null;

        return trackWindow.findChildByName(ScrollBarController.SCROLL_SLIDER_BAR) as WindowController | null;
    }

    /**
	 * Enables the scrollbar and all _INTERNAL children.
	 */
    public override enable(): boolean
    {
        if(super.enable())
        {
            const internals: IWindow[] = [];

            this.groupChildrenWithTag('_INTERNAL', internals, -1);

            for(let i = 0; i < internals.length; i++)
            {
                internals[i].enable();
            }

            return true;
        }

        return false;
    }

    /**
	 * Disables the scrollbar and all _INTERNAL children.
	 */
    public override disable(): boolean
    {
        if(super.disable())
        {
            const internals: IWindow[] = [];

            this.groupChildrenWithTag('_INTERNAL', internals, -1);

            for(let i = 0; i < internals.length; i++)
            {
                internals[i].disable();
            }

            return true;
        }

        return false;
    }

    /**
	 * Handles slider bar relocation, resize, wheel events, and parent add.
	 */
    // AS3: sources/win63_version/core/window/components/ScrollBarController.as::update()
    public override update(source: WindowController, event: WindowEvent): boolean
    {
        if(!this._initialized)
        {
            return super.update(source, event);
        }

        if(source.name === ScrollBarController.SCROLL_SLIDER_BAR)
        {
            if(event.type === 'WE_CHILD_RELOCATED')
            {
                if(!this._isUpdatingLift)
                {
                    const liftCtrl = source as unknown as ScrollBarLiftController;

                    if(this.horizontal)
                    {
                        this.setScrollPosition(liftCtrl.scrollbarOffsetX, true);
                    }
                    else
                    {
                        this.setScrollPosition(liftCtrl.scrollbarOffsetY, true);
                    }
                }
            }
        }

        const result = super.update(source, event);

        if(event.type === 'WE_PARENT_ADDED')
        {
            if(this._scrollable === null)
            {
                this.resolveScrollTarget();
            }
        }

        if(source === (this as unknown as WindowController))
        {
            if(event.type === 'WE_RESIZED')
            {
                this.updateLiftSizeAndPosition();
            }
            else if(event.type === 'WME_WHEEL')
            {
                const mouseEvent = event as WindowMouseEvent;

                if(mouseEvent.delta > 0)
                {
                    if(this.horizontal)
                    {
                        this.scrollH -= this._scrollStep;
                    }
                    else
                    {
                        this.scrollV -= this._scrollStep;
                    }
                }
                else
                {
                    if(this.horizontal)
                    {
                        this.scrollH += this._scrollStep;
                    }
                    else
                    {
                        this.scrollV += this._scrollStep;
                    }
                }

                return true;
            }
        }

        return result;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        this.scrollable = null;

        super.dispose();
    }

    /**
	 * Sets the scroll position and optionally syncs to the scrollable target.
	 *
	 * @returns Whether the position actually changed
	 */
    protected setScrollPosition(value: number, syncTarget: boolean): boolean
    {
        if(this._scrollable === null || this._scrollable.disposed)
        {
            if(!this.resolveScrollTarget()) return false;
        }

        if(value < 0) value = 0;
        if(value > 1) value = 1;

        this._offset = value;

        let changed = false;

        if(syncTarget)
        {
            if(this.horizontal)
            {
                changed = this._scrollable!.scrollH !== this._offset;

                if(changed)
                {
                    this._scrollable!.scrollH = this._offset;
                }
            }
            else
            {
                changed = this._scrollable!.scrollV !== this._offset;

                if(changed)
                {
                    this._scrollable!.scrollV = this._offset;
                }
            }
        }

        return changed;
    }

    /**
	 * Updates the lift (thumb) size and position based on the scrollable region.
	 */
    // AS3: sources/win63_version/core/window/components/ScrollBarController.as::updateLiftSizeAndPosition()
    private updateLiftSizeAndPosition(): void
    {
        let scrollable = this._scrollable ?? null;

        if(scrollable === null || scrollable.disposed)
        {
            if(this._disposed || !this.resolveScrollTarget()) return;

            scrollable = this._scrollable ?? null;

            if(scrollable === null) return;
        }

        const trackWindow = this.track;
        const liftWindow = this.lift;

        if(!trackWindow || !liftWindow) return;

        this._isUpdatingLift = true;

        let ratio: number;

        if(this.horizontal)
        {
            ratio = scrollable.visibleRegion.width / Math.max(1, scrollable.scrollableRegion.width);

            if(ratio > 1) ratio = 1;

            const liftWidth = ratio * trackWindow.width;

            liftWindow.width = liftWidth;
            liftWindow.x = Math.round(scrollable.scrollH * (trackWindow.width - liftWidth));
        }
        else
        {
            ratio = scrollable.visibleRegion.height / Math.max(1, scrollable.scrollableRegion.height);

            if(ratio > 1) ratio = 1;

            const liftHeight = ratio * trackWindow.height;

            liftWindow.height = liftHeight;
            liftWindow.y = Math.round(scrollable.scrollV * (trackWindow.height - liftWindow.height));
        }

        this._isUpdatingLift = false;

        if(ratio === 1)
        {
            this.disable();
        }
        else
        {
            this.enable();
        }
    }

    /**
	 * Handles scroll button events for increment, decrement, and track click.
	 */
    private scrollButtonEventProc(event: WindowEvent, window: IWindow): void
    {
        let updateLift = false;

        if(event.type === 'WME_DOWN')
        {
            if(window.name === ScrollBarController.SCROLL_BUTTON_INCREMENT)
            {
                if(this._scrollable)
                {
                    this._isUpdatingLift = true;

                    if(this.horizontal)
                    {
                        this.scrollH += this._scrollable.scrollStepH / Math.max(1, this._scrollable.maxScrollH);
                    }
                    else
                    {
                        this.scrollV += this._scrollable.scrollStepV / Math.max(1, this._scrollable.maxScrollV);
                    }

                    this._isUpdatingLift = false;
                }
            }
            else if(window.name === ScrollBarController.SCROLL_BUTTON_DECREMENT)
            {
                if(this._scrollable)
                {
                    this._isUpdatingLift = true;

                    if(this.horizontal)
                    {
                        this.scrollH -= this._scrollable.scrollStepH / Math.max(1, this._scrollable.maxScrollH);
                    }
                    else
                    {
                        this.scrollV -= this._scrollable.scrollStepV / Math.max(1, this._scrollable.maxScrollV);
                    }

                    this._isUpdatingLift = false;
                }
            }
            else if(window.name === ScrollBarController.SCROLL_SLIDER_TRACK)
            {
                const mouseEvent = event as WindowMouseEvent;
                const localX = mouseEvent.localX | 0;
                const localY = mouseEvent.localY | 0;
                const bar = (window as WindowController).getChildByName(ScrollBarController.SCROLL_SLIDER_BAR);

                if(bar && this._scrollable)
                {
                    if(this.horizontal)
                    {
                        if(localX < bar.x)
                        {
                            this.scrollH -= (this._scrollable.visibleRegion.width - this._scrollable.scrollStepH) / Math.max(1, this._scrollable.maxScrollH);
                        }
                        else if(localX > bar.right)
                        {
                            this.scrollH += (this._scrollable.visibleRegion.width - this._scrollable.scrollStepH) / Math.max(1, this._scrollable.maxScrollH);
                        }
                    }
                    else
                    {
                        if(localY < bar.y)
                        {
                            this.scrollV -= (this._scrollable.visibleRegion.height - this._scrollable.scrollStepV) / Math.max(1, this._scrollable.maxScrollV);
                        }
                        else if(localY > bar.bottom)
                        {
                            this.scrollV += (this._scrollable.visibleRegion.height - this._scrollable.scrollStepV) / Math.max(1, this._scrollable.maxScrollV);
                        }
                    }

                    updateLift = true;
                }
            }
        }

        if(event.type === 'WME_WHEEL')
        {
            const mouseEvent = event as WindowMouseEvent;

            if(mouseEvent.delta > 0)
            {
                if(this.horizontal)
                {
                    this.scrollH -= this._scrollStep;
                }
                else
                {
                    this.scrollV -= this._scrollStep;
                }
            }
            else
            {
                if(this.horizontal)
                {
                    this.scrollH += this._scrollStep;
                }
                else
                {
                    this.scrollV += this._scrollStep;
                }
            }

            updateLift = true;
        }

        if(updateLift)
        {
            this.updateLiftSizeAndPosition();
        }
    }

    /**
	 * Attempts to resolve the scroll target from the parent hierarchy.
	 *
	 * Searches by name first, then checks if parent is scrollable,
	 * then checks parent's siblings.
	 */
    private resolveScrollTarget(): boolean
    {
        if(this._scrollable !== null)
        {
            if(!this._scrollable.disposed)
            {
                return true;
            }
        }

        if(this._targetName !== null)
        {
            const found = this.findParentByName(this._targetName) as unknown as IScrollableWindow | null;

            if(found === null && this._parent !== null)
            {
                const container = this._parent as unknown as IWindowContainer;

                if(container.findChildByName)
                {
                    const sibling = container.findChildByName(this._targetName) as unknown as IScrollableWindow | null;

                    if(sibling)
                    {
                        this.scrollable = sibling;
                        return true;
                    }
                }
            }
        }

        if(this._parent !== null && 'scrollH' in this._parent && 'scrollV' in this._parent)
        {
            this.scrollable = this._parent as unknown as IScrollableWindow;
            return true;
        }

        if(this._parent !== null)
        {
            const container = this._parent as unknown as IWindowContainer;

            if(container.numChildren !== undefined)
            {
                for(let i = 0; i < container.numChildren; i++)
                {
                    const child = container.getChildAt(i);

                    if(child && 'scrollH' in child && 'scrollV' in child && 'visibleRegion' in child)
                    {
                        this.scrollable = child as unknown as IScrollableWindow;
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
	 * Called when the scrollable target resizes.
	 */
    private onScrollableResized(_event: WindowEvent): void
    {
        this.updateLiftSizeAndPosition();
        this.setScrollPosition(this._offset, false);
    }

    /**
	 * Called when the scrollable target scrolls.
	 */
    private onScrollableScrolled(_event: WindowEvent): void
    {
        this.updateLiftSizeAndPosition();
    }
}
