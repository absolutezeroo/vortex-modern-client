import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import type {IWindowContext} from '../IWindowContext';
import type {IItemListWindow} from './IItemListWindow';
import type {IIterator} from '../utils/IIterator';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {WindowMouseEvent} from '../events/WindowMouseEvent';
import type {PropertyStruct} from '../utils/PropertyStruct';
import {ItemListIterator} from '../iterators/ItemListIterator';
import {SmoothScroller} from '../utils/SmoothScroller';

/**
 * Controller for item list windows.
 *
 * In AS3, extends WindowController and creates an internal _container child
 * that holds the actual list items. Scroll positioning works by repositioning
 * _container within the ItemListController bounds.
 *
 * @see sources/win63_version/com/sulake/core/window/components/ItemListController.as
 */
export class ItemListController extends WindowController implements IItemListWindow 
{
    protected _scrollAreaWidth: number = 0;
    protected _scrollAreaHeight: number = 0;
    protected _container: IWindowContainer | null = null;
    protected _isResizing: boolean = false;
    protected _isUpdating: boolean = false;
    protected _isHorizontal: boolean = false;
    protected _arrangeListItems: boolean = true;
    private _disableAutodragFlag: boolean = false;
    private _isDragging: boolean = false;
    private _dragStartX: number = 0;
    private _dragStartY: number = 0;
    private _dragScrollStartH: number = 0;
    private _dragScrollStartV: number = 0;
    private readonly _containerEventHandlerBound: (event: WindowEvent) => void;

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
        id: number = 0
    ) 
    {
        // AS3: sources win63_2026_crypted_version core/window/components/ItemListController.as
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

        this._containerEventHandlerBound = this._containerEventHandler.bind(this);
        this._isHorizontal = (type === 51);
        this._hasVisualContent = this._background || !this.testParamFlag(16);

        // NOTE: `_container` is created lazily (see ensureContainer), NOT here. In AS3 the
        // container is created in this constructor, but AS3 applies `properties` earlier -
        // during super(), while its own `_container` field is still null - so a property
        // setter that runs a layout pass (scale_to_fit_items -> updateScrollAreaRegion)
        // finds a null container and no-ops. TS/JS runs subclass field initializers after
        // super(), so WindowContext.create() applies our properties *after* this constructor
        // returns; if `_container` already existed at that point, that same layout pass would
        // reset it to 0 and corrupt the resize_on_item_update reflect-cascade math. Deferring
        // container creation until the first list item is added keeps `_container` null
        // throughout property application, faithfully reproducing AS3's ordering (and its
        // order-independence w.r.t. how scale_to_fit_items / resize_on_item_update appear in
        // the layout vars).
    }

    // Creates the internal _CONTAINER on first use (see the constructor note for why this is
    // deferred). Idempotent - safe to call from every item-adding entry point.
    private ensureContainer(): void
    {
        if(this._container) return;

        this._container = this._context.create(
            '_CONTAINER',
            '',
            4,
            0,
            0x10,
            {x: 0, y: 0, width: this.width, height: this.height},
            null,
            this,
            0,
            ['_INTERNAL', '_EXCLUDE'],
            ''
        ) as unknown as IWindowContainer;

        if(!this._container) return;

        const containerWin = this._container as unknown as IWindow;

        containerWin.addEventListener('WE_RESIZED', this._containerEventHandlerBound);
        containerWin.addEventListener('WE_CHILD_REMOVED', this._containerEventHandlerBound);
        containerWin.addEventListener('WE_CHILD_RESIZED', this._containerEventHandlerBound);
        containerWin.addEventListener('WE_CHILD_RELOCATED', this._containerEventHandlerBound);
        containerWin.addEventListener('WE_CHILD_VISIBILITY', this._containerEventHandlerBound);
        this._container.clipping = this.clipping;

        // AS3 arms the resize_on_item_update reflect-to-parent flag on _container in the
        // constructor. We arm both reflect flags here instead, directly (not via the setters,
        // which would trigger a premature layout pass), from the raw field values already
        // resolved by property application. The container is created at the item list's full
        // height, so the flag is armed while _container matches this.height - the subsequent
        // per-child resize deltas then net to zero, keeping this.height correct.
        if(this._isHorizontal)
        {
            containerWin.setParamFlag(0x400000, this._resizeOnItemUpdate);
            containerWin.setParamFlag(0x800000, this._inverseResizeOnItemUpdate);
        }
        else
        {
            containerWin.setParamFlag(0x800000, this._resizeOnItemUpdate);
            containerWin.setParamFlag(0x400000, this._inverseResizeOnItemUpdate);
        }
    }

    private _enableScrollByDragging: boolean = false;

    public get enableScrollByDragging(): boolean 
    {
        return this._enableScrollByDragging;
    }

    public set enableScrollByDragging(value: boolean) 
    {
        this._enableScrollByDragging = value;
    }

    private _isPartOfGridWindow: boolean = false;

    public get isPartOfGridWindow(): boolean 
    {
        return this._isPartOfGridWindow;
    }

    public set isPartOfGridWindow(value: boolean) 
    {
        this._isPartOfGridWindow = value;
    }

    protected _scrollH: number = 0;

    /**
     * Gets the horizontal scroll position (0..1).
     */
    public get scrollH(): number 
    {
        return this._scrollH;
    }

    /**
     * Sets the horizontal scroll position and repositions the container.
     */
    public set scrollH(value: number) 
    {
        this.setScrollH(value, false);
    }

    protected _scrollV: number = 0;

    /**
     * Gets the vertical scroll position (0..1).
     */
    public get scrollV(): number 
    {
        return this._scrollV;
    }

    /**
     * Sets the vertical scroll position and repositions the container.
     */
    public set scrollV(value: number) 
    {
        this.setScrollV(value, false);
    }

    protected _spacing: number = 0;

    /**
     * Gets the spacing between list items.
     */
    public get spacing(): number 
    {
        return this._spacing;
    }

    /**
     * Sets the spacing between list items.
     */
    public set spacing(value: number) 
    {
        if(value !== this._spacing) 
        {
            this._spacing = value;
            this.updateScrollAreaRegion();
        }
    }

    protected _scaleToFitItems: boolean = false;

    /**
     * Gets whether items are scaled to fit the list.
     */
    public get scaleToFitItems(): boolean 
    {
        return this._scaleToFitItems;
    }

    /**
     * Sets whether items are scaled to fit the list.
     */
    public set scaleToFitItems(value: boolean) 
    {
        if(this._scaleToFitItems !== value) 
        {
            this._scaleToFitItems = value;
            this.updateScrollAreaRegion();
        }
    }

    protected _resizeOnItemUpdate: boolean = false;

    /**
     * Gets whether the list resizes when items are updated.
     */
    public get resizeOnItemUpdate(): boolean 
    {
        return this._resizeOnItemUpdate;
    }

    /**
     * Sets whether the list resizes when items are updated.
     */
    public set resizeOnItemUpdate(value: boolean) 
    {
        this._resizeOnItemUpdate = value;

        if(this._container) 
        {
            const containerWin = this._container as unknown as IWindow;

            if(this._isHorizontal) 
            {
                containerWin.setParamFlag(0x400000, value);
            }
            else 
            {
                containerWin.setParamFlag(0x800000, value);
            }
        }
    }

    protected _inverseResizeOnItemUpdate: boolean = false;

    public get inverseResizeOnItemUpdate(): boolean 
    {
        return this._inverseResizeOnItemUpdate;
    }

    public set inverseResizeOnItemUpdate(value: boolean) 
    {
        this._inverseResizeOnItemUpdate = value;

        if(this._container) 
        {
            const containerWin = this._container as unknown as IWindow;

            if(this._isHorizontal) 
            {
                containerWin.setParamFlag(0x800000, value);
            }
            else 
            {
                containerWin.setParamFlag(0x400000, value);
            }
        }

        this.updateScrollAreaRegion();
    }

    protected _scrollStepH: number = 25;

    /**
     * Gets the horizontal scroll step size.
     */
    public get scrollStepH(): number 
    {
        return this._scrollStepH;
    }

    /**
     * Sets the horizontal scroll step size.
     */
    public set scrollStepH(value: number) 
    {
        this._scrollStepH = value;
    }

    protected _scrollStepV: number = 25;

    /**
     * Gets the vertical scroll step size.
     */
    public get scrollStepV(): number 
    {
        return this._scrollStepV;
    }

    /**
     * Sets the vertical scroll step size.
     */
    public set scrollStepV(value: number) 
    {
        this._scrollStepV = value;
    }

    /**
     * Gets the maximum horizontal scroll value in pixels.
     */
    public get maxScrollH(): number 
    {
        return Math.max(0, this._scrollAreaWidth - this.width);
    }

    /**
     * Gets the maximum vertical scroll value in pixels.
     */
    public get maxScrollV(): number 
    {
        return Math.max(0, this._scrollAreaHeight - this.height);
    }

    public get scrollableWindow(): IWindow 
    {
        return this;
    }

    /**
     * Gets the visible region rectangle.
     */
    public get visibleRegion(): { x: number; y: number; width: number; height: number } 
    {
        return {
            x: this._scrollH * this.maxScrollH,
            y: this._scrollV * this.maxScrollV,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Gets the scrollable region rectangle.
     */
    public get scrollableRegion(): { x: number; y: number; width: number; height: number } 
    {
        if(this._container) 
        {
            return {
                x: 0,
                y: 0,
                width: (this._container as unknown as IWindow).width,
                height: (this._container as unknown as IWindow).height
            };
        }

        return {x: 0, y: 0, width: this._scrollAreaWidth, height: this._scrollAreaHeight};
    }

    /**
     * Gets whether items are automatically arranged.
     */
    public get autoArrangeItems(): boolean 
    {
        return this._arrangeListItems;
    }

    /**
     * Sets whether items are automatically arranged.
     */
    public set autoArrangeItems(value: boolean) 
    {
        this._arrangeListItems = value;
        this.updateScrollAreaRegion();
    }

    /**
     * Returns the first item in the list.
     */
    public get firstListItem(): IWindow | null 
    {
        return this.numListItems > 0 ? this.getListItemAt(0) : null;
    }

    /**
     * Returns the last item in the list.
     */
    public get lastListItem(): IWindow | null 
    {
        return this.numListItems > 0 ? this.getListItemAt(this.numListItems - 1) : null;
    }

    /**
     * Sets whether automatic dragging is disabled.
     */
    public get disableAutodrag(): boolean 
    {
        return this._disableAutodragFlag;
    }

    public set disableAutodrag(value: boolean) 
    {
        this._disableAutodragFlag = value;
    }

    public override get clipping(): boolean 
    {
        return super.clipping;
    }

    public override set clipping(value: boolean) 
    {
        super.clipping = value;

        if(this._container) 
        {
            this._container.clipping = value;
        }
    }

    public override get properties(): unknown[] 
    {
        const props = super.properties;

        props.push(this.createProperty('spacing', this._spacing));
        props.push(this.createProperty('auto_arrange_items', this._arrangeListItems));
        props.push(this.createProperty('scale_to_fit_items', this._scaleToFitItems));
        props.push(this.createProperty('resize_on_item_update', this._resizeOnItemUpdate));
        props.push(this.createProperty('inverse_resize_on_item_update', this._inverseResizeOnItemUpdate));

        return props;
    }

    public override set properties(value: unknown[])
    {
        for(const item of value)
        {
            const prop = item as PropertyStruct;

            switch(prop.key)
            {
                case 'spacing':
                    this.spacing = prop.value as number;
                    break;
                case 'scale_to_fit_items':
                    this.scaleToFitItems = !!prop.value;
                    break;
                case 'resize_on_item_update':
                    this.resizeOnItemUpdate = !!prop.value;
                    break;
                case 'inverse_resize_on_item_update':
                    this.inverseResizeOnItemUpdate = !!prop.value;
                    break;
                case 'auto_arrange_items':
                    this._arrangeListItems = !!prop.value;
                    break;
                case 'scroll_step_h':
                    this._scrollStepH = prop.value as number;
                    break;
                case 'scroll_step_v':
                    this._scrollStepV = prop.value as number;
                    break;
            }
        }

        super.properties = value;
    }

    /**
     * Gets the number of items in the list.
     */
    public get numListItems(): number 
    {
        return this._container !== null ? this._container.numChildren : 0;
    }

    protected get isScrollHorizontal(): boolean 
    {
        return this._isHorizontal;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::_SafeStr_5632/_SafeStr_5532
    private _horizontalSmoothScroller: SmoothScroller | null = null;

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::get horizontalSmoothScroller()
    private get horizontalSmoothScroller(): SmoothScroller 
    {
        if(this._horizontalSmoothScroller === null) 
        {
            this._horizontalSmoothScroller = new SmoothScroller(
                this.getHorizontalScrollPosition.bind(this),
                this.setHorizontalSmoothScrollPosition.bind(this),
                this.getHorizontalMaxScroll.bind(this)
            );
        }

        return this._horizontalSmoothScroller;
    }

    private _verticalSmoothScroller: SmoothScroller | null = null;

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::get verticalSmoothScroller()
    private get verticalSmoothScroller(): SmoothScroller 
    {
        if(this._verticalSmoothScroller === null) 
        {
            this._verticalSmoothScroller = new SmoothScroller(
                this.getVerticalScrollPosition.bind(this),
                this.setVerticalSmoothScrollPosition.bind(this),
                this.getVerticalMaxScroll.bind(this)
            );
        }

        return this._verticalSmoothScroller;
    }

    public iterator(): IIterator 
    {
        return new ItemListIterator(this._container ? this._getContainerChildren() : []);
    }

    /**
     * Adds an item to the end of the list.
     */
    public addListItem(item: IWindow): IWindow
    {
        this.ensureContainer();

        if(!this._container) return item;

        this._isUpdating = true;

        if(this._isHorizontal) 
        {
            item.x = this._scrollAreaWidth + (this.numListItems > 0 ? this._spacing : 0);
            this._scrollAreaWidth = item.right;
            (this._container as unknown as IWindow).width = this._scrollAreaWidth;
        }
        else 
        {
            if(this._arrangeListItems) 
            {
                item.y = this._scrollAreaHeight + (this.numListItems > 0 ? this._spacing : 0);
                this._scrollAreaHeight = item.bottom;
            }
            else 
            {
                this._scrollAreaHeight = Math.max(this._scrollAreaHeight, item.bottom);
            }

            (this._container as unknown as IWindow).height = this._scrollAreaHeight;
        }

        item = this._container.addChild(item);
        this._isUpdating = false;

        return item;
    }

    /**
     * Adds an item at the specified index.
     */
    public addListItemAt(item: IWindow, index: number): IWindow
    {
        this.ensureContainer();

        if(!this._container) return item;

        item = this._container.addChildAt(item, index);
        this.updateScrollAreaRegion();

        return item;
    }

    /**
     * Gets the item at the specified index.
     */
    public getListItemAt(index: number): IWindow | null 
    {
        return this._container ? this._container.getChildAt(index) : null;
    }

    /**
     * Gets the item with the specified ID.
     */
    public getListItemByID(id: number): IWindow | null 
    {
        return this._container ? this._container.getChildByID(id) : null;
    }

    /**
     * Gets the item with the specified name.
     */
    public getListItemByName(name: string): IWindow | null 
    {
        return this._container ? this._container.getChildByName(name) : null;
    }

    /**
     * Gets the item with the specified tag.
     */
    public getListItemByTag(tag: string): IWindow | null 
    {
        return this._container ? this._container.getChildByTag(tag) : null;
    }

    /**
     * Gets the index of the specified item.
     */
    public getListItemIndex(item: IWindow): number 
    {
        return this._container ? this._container.getChildIndex(item) : -1;
    }

    /**
     * Removes the specified item from the list.
     */
    public removeListItem(item: IWindow): IWindow | null 
    {
        if(!this._container) return null;

        const result = this._container.removeChild(item);

        if(result) 
        {
            this.updateScrollAreaRegion();
        }

        return result;
    }

    /**
     * Removes the item at the specified index.
     */
    public removeListItemAt(index: number): IWindow | null 
    {
        return this._container ? this._container.removeChildAt(index) : null;
    }

    /**
     * Sets the index of the specified item.
     */
    public setListItemIndex(item: IWindow, index: number): void 
    {
        if(this._container) 
        {
            this._container.setChildIndex(item, index);
        }
    }

    /**
     * Swaps two items in the list.
     */
    public swapListItems(a: IWindow, b: IWindow): void 
    {
        if(this._container) 
        {
            this._container.swapChildren(a, b);
            this.updateScrollAreaRegion();
        }
    }

    /**
     * Swaps two items at the specified indices.
     */
    public swapListItemsAt(indexA: number, indexB: number): void 
    {
        if(this._container) 
        {
            this._container.swapChildrenAt(indexA, indexB);
            this.updateScrollAreaRegion();
        }
    }

    /**
     * Groups list items with the specified ID.
     */
    public groupListItemsWithID(id: number, result: IWindow[], depth: number = 0): number 
    {
        return this._container ? this._container.groupChildrenWithID(id, result, depth) : 0;
    }

    /**
     * Groups list items with the specified tag.
     */
    public groupListItemsWithTag(tag: string, result: IWindow[], depth: number = 0): number 
    {
        return this._container ? this._container.groupChildrenWithTag(tag, result, depth) : 0;
    }

    /**
     * Removes all items from the list without disposing them.
     */
    public removeListItems(): void 
    {
        if(!this._container) return;

        this._isUpdating = true;

        while(this.numListItems > 0) 
        {
            this._container.removeChildAt(0);
        }

        this._isUpdating = false;
        this.updateScrollAreaRegion();
    }

    /**
     * Removes and disposes all items in the list.
     */
    public destroyListItems(): void 
    {
        if(!this._container) return;

        this._isUpdating = true;

        while(this.numListItems > 0) 
        {
            const child = this._container.removeChildAt(0);

            if(child) child.destroy();
        }

        this._isUpdating = false;
        this.updateScrollAreaRegion();
    }

    /**
     * Arranges items in the list based on current settings.
     */
    public arrangeListItems(): void 
    {
        this.updateScrollAreaRegion();
    }

    public arrangeItems(): void 
    {
        this.updateScrollAreaRegion();
    }

    /**
     * Stops any active drag operation.
     */
    public stopDragging(): void 
    {
        this._isDragging = false;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::scrollWithWheel()
    public scrollWithWheel(delta: number, useHorizontal: boolean): boolean 
    {
        return this.getSmoothScroller(useHorizontal).scrollWithWheel(delta);
    }

    public override populate(items: IWindow[]): void
    {
        this.ensureContainer();

        if(this._container)
        {
            (this._container as unknown as WindowController).populate(items);
        }

        this.updateScrollAreaRegion();
    }

    /**
     * Handles resize, scroll wheel, and drag events.
     */
    public override update(source: WindowController, event: WindowEvent): boolean 
    {
        const result = super.update(source, event);

        switch(event.type) 
        {
            case 'WE_RESIZE':
                this._isResizing = true;
                break;
            case 'WE_RESIZED':
                if(this._container) 
                {
                    if(!this._scaleToFitItems && !this._inverseResizeOnItemUpdate) 
                    {
                        if(this._isHorizontal) 
                        {
                            (this._container as unknown as IWindow).height = this._height;
                        }
                        else 
                        {
                            (this._container as unknown as IWindow).width = this._width;
                        }
                    }
                }

                this.updateScrollAreaRegion();
                this._isResizing = false;
                break;
            default:
                if(event instanceof WindowMouseEvent) 
                {
                    return this.process(event);
                }
                break;
        }

        return result;
    }

    public override validateLocalPointIntersection(point: { x: number; y: number }, _drawBuffer: unknown): boolean 
    {
        return this.isInWindowBounds(point);
    }

    // this class that hasn't been located/ported yet.
    public process(event: WindowMouseEvent): boolean 
    {
        let handled = false;
        const localX = event.localX | 0;
        const localY = event.localY | 0;

        switch(event.type) 
        {
            case 'WME_WHEEL':
            case 'WME_WHEEL_HORIZONTAL':
                if(this._isPartOfGridWindow) return false;

                return this.handleScrollWheelEvent(event);
            case 'WME_DOWN':
                this._dragStartX = localX;
                this._dragStartY = localY;
                this._dragScrollStartH = this._scrollH * this.maxScrollH;
                this._dragScrollStartV = this._scrollV * this.maxScrollV;
                this._isDragging = true;
                handled = true;
                break;
            case 'WME_MOVE':
                if(this._isDragging && !this._disableAutodragFlag && this._enableScrollByDragging) 
                {
                    if(this._isHorizontal) 
                    {
                        this.scrollH = (this._dragScrollStartH + this._dragStartX - localX) / Math.max(1, this.maxScrollH);
                    }
                    else 
                    {
                        this.scrollV = (this._dragScrollStartV + this._dragStartY - localY) / Math.max(1, this.maxScrollV);
                    }

                    handled = true;
                }
                break;
            case 'WME_UP':
            case 'WME_UP_OUTSIDE':
                if(this._isDragging) 
                {
                    this._isDragging = false;
                    handled = true;
                }
                break;
        }

        return handled;
    }

    /**
     * Routes layout children through this list so WindowParser can use the AS3
     * IIterable/addListItem path instead of parenting directly into _container.
     *
     * @see sources/win63_version/core/window/utils/WindowParser.as line 305, 378-405
     */
    public override getLayoutChildTarget(): IWindow 
    {
        return this;
    }

    public override dispose(): void 
    {
        if(this._disposed) return;

        if(this._container) 
        {
            (this._container as unknown as IWindow).removeEventListener('WE_RESIZED', this._containerEventHandlerBound);
            (this._container as unknown as IWindow).removeEventListener('WE_CHILD_REMOVED', this._containerEventHandlerBound);
            (this._container as unknown as IWindow).removeEventListener('WE_CHILD_RESIZED', this._containerEventHandlerBound);
            (this._container as unknown as IWindow).removeEventListener('WE_CHILD_RELOCATED', this._containerEventHandlerBound);
            (this._container as unknown as IWindow).removeEventListener('WE_CHILD_VISIBILITY', this._containerEventHandlerBound);
        }

        // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::dispose()
        if(this._horizontalSmoothScroller !== null) 
        {
            this._horizontalSmoothScroller.dispose();
            this._horizontalSmoothScroller = null;
        }

        if(this._verticalSmoothScroller !== null) 
        {
            this._verticalSmoothScroller.dispose();
            this._verticalSmoothScroller = null;
        }

        super.dispose();
    }

    /**
     * Clones list items into the target via `addListItem`.
     *
     * In AS3, `cloneChildWindows` is overridden to iterate `numListItems`
     * and clone each item via `addListItem` on the target, ensuring cloned
     * children end up in the internal `_container` of the clone.
     *
     * @see sources/win63_version/core/window/components/ItemListController.as line 352-361
     */
    protected override cloneChildWindows(target: WindowController): void 
    {
        for(let i = 0; i < this.numListItems; i++) 
        {
            const item = this.getListItemAt(i);

            if(item) 
            {
                (target as unknown as IItemListWindow).addListItem(item.clone());
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::handleScrollWheelEvent()
    protected handleScrollWheelEvent(event: WindowMouseEvent): boolean 
    {
        return this.scrollWithWheel(
            this.getScrollWheelDelta(event),
            event.type === 'WME_WHEEL_HORIZONTAL' || !!event.shiftKey
        );
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::getScrollWheelDelta()
    protected getScrollWheelDelta(event: WindowMouseEvent | null): number 
    {
        if(!event) return 0;

        return event.type === 'WME_WHEEL_HORIZONTAL' ? -event.delta : event.delta;
    }

    /**
     * Recalculates the scroll area dimensions and repositions items.
     */
    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::updateScrollAreaRegion()
    protected updateScrollAreaRegion(): void 
    {
        if(!this._arrangeListItems || this._isUpdating || !this._container) return;

        this._isUpdating = true;

        const containerWin = this._container as unknown as IWindow;
        const absoluteScrollH = Math.max(0, -containerWin.x);
        const absoluteScrollV = Math.max(0, -containerWin.y);
        const numChildren = this._container.numChildren;
        let requiredSpace = 0;

        if(this._isHorizontal) 
        {
            this._scrollAreaWidth = 0;
            this._scrollAreaHeight = this._height;

            for(let i = 0; i < numChildren; i++) 
            {
                const child = this._container.getChildAt(i);

                if(child && child.visible) 
                {
                    child.x = this._scrollAreaWidth;
                    this._scrollAreaWidth += child.width + this._spacing;

                    if(this._scaleToFitItems) 
                    {
                        const bottom = child.height + child.y;
                        this._scrollAreaHeight = Math.max(this._scrollAreaHeight, bottom);
                    }

                    if(this._inverseResizeOnItemUpdate) 
                    {
                        requiredSpace = Math.max(requiredSpace, this.getChildRequiredVerticalSpace(child));
                    }
                }
            }

            if(numChildren > 0) 
            {
                this._scrollAreaWidth -= this._spacing;
            }
        }
        else 
        {
            this._scrollAreaWidth = this._width;
            this._scrollAreaHeight = 0;

            for(let i = 0; i < numChildren; i++) 
            {
                const child = this._container.getChildAt(i);

                if(child && child.visible) 
                {
                    child.y = this._scrollAreaHeight;
                    this._scrollAreaHeight += child.height + this._spacing;

                    if(this._scaleToFitItems) 
                    {
                        const right = child.width + child.x;
                        this._scrollAreaWidth = Math.max(this._scrollAreaWidth, right);
                    }

                    if(this._inverseResizeOnItemUpdate) 
                    {
                        requiredSpace = Math.max(requiredSpace, this.getChildRequiredHorizontalSpace(child));
                    }
                }
            }

            if(numChildren > 0) 
            {
                this._scrollAreaHeight -= this._spacing;
            }
        }

        this.setAbsoluteScrollH(absoluteScrollH);
        this.setAbsoluteScrollV(absoluteScrollV);

        containerWin.height = this._scrollAreaHeight;
        containerWin.width = this._scrollAreaWidth;

        if(this._inverseResizeOnItemUpdate) 
        {
            if(this._isHorizontal) 
            {
                this.limits.minHeight = requiredSpace;
                this.limits.maxHeight = requiredSpace;
                containerWin.height = requiredSpace;
            }
            else 
            {
                this.limits.minWidth = requiredSpace;
                this.limits.maxWidth = requiredSpace;
                containerWin.width = requiredSpace;
            }
        }

        this._isUpdating = false;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::process()
    // AS3 only reacts to WME_WHEEL/WME_WHEEL_HORIZONTAL here. The WME_DOWN/MOVE/UP drag-scroll
    // handling below has no AS3 counterpart in this class, but enableScrollByDragging/
    // disableAutodrag are live properties several other windows (FurniView, RoomChatWidget,
    // ScrollableItemListWindow) depend on for touch/drag scrolling - left in place rather
    // than deleted outright, since AS3 achieves the equivalent UX through a mechanism outside

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::getSmoothScroller()
    private getSmoothScroller(useHorizontal: boolean): SmoothScroller 
    {
        return useHorizontal ? this.horizontalSmoothScroller : this.verticalSmoothScroller;
    }

    private getHorizontalScrollPosition(): number 
    {
        return this.scrollH;
    }

    private setHorizontalSmoothScrollPosition(value: number): void 
    {
        this.setScrollH(value, true);
    }

    private getHorizontalMaxScroll(): number 
    {
        return this.maxScrollH;
    }

    private getVerticalScrollPosition(): number 
    {
        return this.scrollV;
    }

    private setVerticalSmoothScrollPosition(value: number): void 
    {
        this.setScrollV(value, true);
    }

    private getVerticalMaxScroll(): number 
    {
        return this.maxScrollV;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::getChildRequiredHorizontalSpace()
    private getChildRequiredHorizontalSpace(child: IWindow): number 
    {
        const hMode = child.param & 0xC0;

        if(hMode === 128) 
        {
            const left = Math.max(0, child.x);
            const right = Math.max(0, this._width - child.x - child.width);

            return child.limits.minWidth + left + right;
        }

        if(hMode === 64) 
        {
            return this._width - child.x;
        }

        if(hMode === 192) 
        {
            return child.width;
        }

        return child.x + child.width;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::getChildRequiredVerticalSpace()
    private getChildRequiredVerticalSpace(child: IWindow): number 
    {
        const vMode = child.param & 0x0C00;

        if(vMode === 0x0800) 
        {
            const top = child.y;
            const bottom = this._height - child.y - child.height;

            return child.limits.minWidth + top + bottom;
        }

        if(vMode === 0x0400) 
        {
            return this._height - child.y;
        }

        if(vMode === 0x0C00) 
        {
            return child.height;
        }

        return child.y + child.height;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::setAbsoluteScrollH()
    private setAbsoluteScrollH(value: number): void 
    {
        const max = this.maxScrollH;

        if(!Number.isFinite(max) || max <= 0) 
        {
            this._scrollH = 0;

            if(this._container) (this._container as unknown as IWindow).x = 0;

            return;
        }

        value = Math.max(0, Math.min(value, max));
        this._scrollH = value / max;

        if(this._container) (this._container as unknown as IWindow).x = -value;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::setAbsoluteScrollV()
    private setAbsoluteScrollV(value: number): void 
    {
        const max = this.maxScrollV;

        if(!Number.isFinite(max) || max <= 0) 
        {
            this._scrollV = 0;

            if(this._container) (this._container as unknown as IWindow).y = 0;

            return;
        }

        value = Math.max(0, Math.min(value, max));
        this._scrollV = value / max;

        if(this._container) (this._container as unknown as IWindow).y = -value;
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::setScrollH()
    private setScrollH(value: number, fromWheel: boolean): void 
    {
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        const diff = value - this._scrollH;

        if(value !== this._scrollH) 
        {
            this._scrollH = value;

            if(this._container) 
            {
                (this._container as unknown as IWindow).x = -(this._scrollH * this.maxScrollH);
                this._context.invalidate(this._container as unknown as IWindow, this.visibleRegion, 1);
            }

            if(this._eventDispatcher) 
            {
                const scrollEvent = WindowEvent.allocate('WE_SCROLL', this, null);
                this._eventDispatcher.dispatchEvent(scrollEvent);
                scrollEvent.recycle();
            }
        }

        if(!fromWheel && this._horizontalSmoothScroller !== null && this._horizontalSmoothScroller.isScrolling) 
        {
            this._horizontalSmoothScroller.adjustStartPosition(diff);
        }
    }

    // AS3: sources/win63_2026_crypted_version core/window/components/ItemListController.as::setScrollV()
    private setScrollV(value: number, fromWheel: boolean): void 
    {
        if(value < 0) value = 0;
        if(value > 1) value = 1;

        const diff = value - this._scrollV;

        if(value !== this._scrollV) 
        {
            this._scrollV = value;

            if(this._container) 
            {
                (this._container as unknown as IWindow).y = -(this._scrollV * this.maxScrollV);
                this._context.invalidate(this._container as unknown as IWindow, this.visibleRegion, 1);
            }

            if(this._eventDispatcher) 
            {
                const scrollEvent = WindowEvent.allocate('WE_SCROLL', this, null);
                this._eventDispatcher.dispatchEvent(scrollEvent);
                scrollEvent.recycle();
            }
        }

        if(!fromWheel && this._verticalSmoothScroller !== null && this._verticalSmoothScroller.isScrolling) 
        {
            this._verticalSmoothScroller.adjustStartPosition(diff);
        }
    }

    /**
     * Handles events from the internal container child.
     */
    private _containerEventHandler(event: WindowEvent): void 
    {
        switch(event.type) 
        {
            case 'WE_CHILD_REMOVED':
                this.updateScrollAreaRegion();
                break;
            case 'WE_CHILD_RESIZED':
                if(!this._isResizing) 
                {
                    this.updateScrollAreaRegion();
                }
                break;
            case 'WE_CHILD_RELOCATED':
            case 'WE_CHILD_VISIBILITY':
                this.updateScrollAreaRegion();
                break;
            case 'WE_RESIZED':
                if(this._eventDispatcher) 
                {
                    const resizedEvent = WindowEvent.allocate('WE_RESIZED', this, null);
                    this._eventDispatcher.dispatchEvent(resizedEvent);
                    resizedEvent.recycle();
                }
                break;
        }
    }

    /**
     * Returns the children of the internal container as an array.
     */
    private _getContainerChildren(): IWindow[] 
    {
        if(!this._container) return [];

        const children: IWindow[] = [];

        for(let i = 0; i < this._container.numChildren; i++) 
        {
            const child = this._container.getChildAt(i);

            if(child) children.push(child);
        }

        return children;
    }
}
