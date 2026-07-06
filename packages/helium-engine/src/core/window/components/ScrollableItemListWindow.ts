import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IScrollableListWindow} from './IScrollableListWindow';
import type {IItemListWindow} from './IItemListWindow';
import type {IScrollbarWindow} from './IScrollbarWindow';
import type {IIterator} from '../utils/IIterator';
import {ContainerController} from './ContainerController';
import type {WindowEvent} from '../events/WindowEvent';

/**
 * Scrollable item list window.
 *
 * Combines an item list with a scrollbar. The scrollbar is automatically
 * bound to the item list and can optionally auto-hide when not needed.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ScrollableItemListWindow.as
 */
export class ScrollableItemListWindow extends ContainerController implements IScrollableListWindow
{
    private _itemListRef: IItemListWindow | null = null;
    private _scrollBarRef: IScrollbarWindow | null = null;
    private readonly _scrollBarEventProcBound: (event: WindowEvent) => void;

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
        super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

        this._scrollBarEventProcBound = this.scrollBarEventProc.bind(this);

        const scrollBar = this.scrollBar;
        const itemList = this.itemList;

        if(scrollBar && itemList)
        {
            scrollBar.scrollable = itemList;

            if(scrollBar.testStateFlag(32) && this._autoHideScrollBar)
            {
                this.hideScrollBar();
            }

            itemList.enableScrollByDragging = true;
        }
    }

    private _autoHideScrollBar: boolean = true;

    /**
	 * Gets whether auto-hide scrollbar is enabled.
	 */
    public get autoHideScrollBar(): boolean
    {
        return this._autoHideScrollBar;
    }

    /**
	 * Sets whether auto-hide scrollbar is enabled.
	 */
    public set autoHideScrollBar(value: boolean)
    {
        this._autoHideScrollBar = value;
        this.updateScrollBarVisibility(true);
    }

    public get isScrollBarVisible(): boolean
    {
        return (this.scrollBar as unknown as IWindow | null)?.visible ?? false;
    }

    /**
	 * Gets whether items auto-arrange.
	 */
    public get autoArrangeItems(): boolean
    {
        return this.itemList?.autoArrangeItems ?? true;
    }

    /**
	 * Sets whether items auto-arrange.
	 */
    public set autoArrangeItems(value: boolean)
    {
        if(this.itemList) this.itemList.autoArrangeItems = value;
    }

    /**
	 * Gets the spacing between items.
	 */
    public get spacing(): number
    {
        return this.itemList?.spacing ?? 0;
    }

    /**
	 * Sets the spacing between items.
	 */
    public set spacing(value: number)
    {
        if(this.itemList) this.itemList.spacing = value;
    }

    public get numListItems(): number
    {
        return this.itemList?.numListItems ?? 0;
    }

    public get firstListItem(): IWindow | null
    {
        return this.itemList?.firstListItem ?? null;
    }

    public get lastListItem(): IWindow | null
    {
        return this.itemList?.lastListItem ?? null;
    }

    public get isPartOfGridWindow(): boolean
    {
        return this.itemList?.isPartOfGridWindow ?? false;
    }

    public set isPartOfGridWindow(value: boolean)
    {
        if(this.itemList) this.itemList.disableAutodrag = value;
    }

    public get scrollH(): number
    {
        return this.itemList?.scrollH ?? 0;
    }

    public set scrollH(value: number)
    {
        if(this.itemList) this.itemList.scrollH = value;
    }

    public get scrollV(): number
    {
        return this.itemList?.scrollV ?? 0;
    }

    public set scrollV(value: number)
    {
        if(this.itemList) this.itemList.scrollV = value;
    }

    public get scrollStepH(): number
    {
        return this.itemList?.scrollStepH ?? 25;
    }

    public set scrollStepH(value: number)
    {
        if(this.itemList) this.itemList.scrollStepH = value;
    }

    public get scrollStepV(): number
    {
        return this.itemList?.scrollStepV ?? 25;
    }

    public set scrollStepV(value: number)
    {
        if(this.itemList) this.itemList.scrollStepV = value;
    }

    public get maxScrollH(): number
    {
        return this.itemList?.maxScrollH ?? 0;
    }

    public get maxScrollV(): number
    {
        return this.itemList?.maxScrollV ?? 0;
    }

    public get visibleRegion(): { x: number; y: number; width: number; height: number }
    {
        return this.itemList?.visibleRegion ?? {x: 0, y: 0, width: this.width, height: this.height};
    }

    public get scrollableRegion(): { x: number; y: number; width: number; height: number }
    {
        return this.itemList?.scrollableRegion ?? {x: 0, y: 0, width: 0, height: 0};
    }

    // ── IItemListWindow delegation ──────────────────────────────────
    public get scaleToFitItems(): boolean
    {
        return this.itemList?.scaleToFitItems ?? false;
    }

    public set scaleToFitItems(value: boolean)
    {
        const itemList = this.itemList;

        if(itemList)
        {
            itemList.scaleToFitItems = value;
        }
    }

    public get resizeOnItemUpdate(): boolean
    {
        return this.itemList?.resizeOnItemUpdate ?? false;
    }

    public set resizeOnItemUpdate(value: boolean)
    {
        const itemList = this.itemList;

        if(itemList)
        {
            itemList.resizeOnItemUpdate = value;
        }
    }

    public get inverseResizeOnItemUpdate(): boolean
    {
        return this.itemList?.inverseResizeOnItemUpdate ?? false;
    }

    public set inverseResizeOnItemUpdate(value: boolean)
    {
        const itemList = this.itemList;

        if(itemList)
        {
            itemList.inverseResizeOnItemUpdate = value;
        }
    }

    public get scrollableWindow(): IWindow
    {
        return this.itemList?.scrollableWindow ?? this;
    }

    public get enableScrollByDragging(): boolean
    {
        return true;
    }

    public set enableScrollByDragging(_value: boolean)
    {
    }

    public get disableAutodrag(): boolean
    {
        return this.itemList?.disableAutodrag ?? false;
    }

    public set disableAutodrag(value: boolean)
    {
        if(this.itemList) this.itemList.disableAutodrag = value;
    }

    /**
	 * Gets the internal item list child.
	 */
    protected get itemList(): IItemListWindow | null
    {
        if(!this._itemListRef)
        {
            this._itemListRef = this.findChildByTag('_ITEMLIST') as unknown as IItemListWindow | null;
        }

        return this._itemListRef;
    }

    /**
	 * Gets the internal scrollbar child.
	 */
    protected get scrollBar(): IScrollbarWindow | null
    {
        if(!this._scrollBarRef)
        {
            this._scrollBarRef = this.findChildByTag('_SCROLLBAR') as unknown as IScrollbarWindow | null;

            if(this._scrollBarRef)
            {
                (this._scrollBarRef as unknown as IWindow).addEventListener('WE_ENABLED', this._scrollBarEventProcBound);
                (this._scrollBarRef as unknown as IWindow).addEventListener('WE_DISABLED', this._scrollBarEventProcBound);
            }
        }

        return this._scrollBarRef;
    }

    // AS3: sources/win63_version/core/window/components/ScrollableItemListWindow.as::get iterator()
    public override iterator(): IIterator | null
    {
        if(this.isConstructionReady())
        {
            return this.itemList!.iterator();
        }

        return null;
    }

    // AS3: sources/win63_version/core/window/components/ScrollableItemListWindow.as::isConstructionReady()
    protected isConstructionReady(): boolean
    {
        return this.itemList !== null && this.scrollBar !== null;
    }

    private scrollBarEventProc(event: WindowEvent): void
    {
        if(event.type === 'WE_ENABLED')
        {
            this.showScrollBar();
        }
        else if(event.type === 'WE_DISABLED' && this._autoHideScrollBar)
        {
            this.hideScrollBar();
        }
    }

    private hideScrollBar(): void
    {
        const scrollBar = this.scrollBar;
        const itemList = this.itemList;

        if(scrollBar && itemList && (scrollBar as unknown as IWindow).visible)
        {
            (scrollBar as unknown as IWindow).visible = false;
            (itemList as unknown as IWindow).width = this.width;
        }
    }

    private showScrollBar(): void
    {
        const scrollBar = this.scrollBar;
        const itemList = this.itemList;

        if(scrollBar && itemList && !(scrollBar as unknown as IWindow).visible)
        {
            (scrollBar as unknown as IWindow).visible = true;
            (itemList as unknown as IWindow).width = this.width - (scrollBar as unknown as IWindow).width;
        }
    }

    private updateScrollBarVisibility(force: boolean = false): void
    {
        const scrollBar = this.scrollBar;

        if(!scrollBar) return;

        if(this._autoHideScrollBar)
        {
            if(scrollBar.testStateFlag(32))
            {
                this.hideScrollBar();
            }
        }
        else if(force || (scrollBar as unknown as IWindow).visible)
        {
            this.showScrollBar();
        }
    }

    /**
	 * Arranges items in the list.
	 */
    public arrangeListItems(): void
    {
        this.itemList?.arrangeListItems();
    }

    public arrangeItems(): void
    {
        this.itemList?.arrangeItems();
    }

    public addListItem(item: IWindow): IWindow
    {
        return this.itemList?.addListItem(item) ?? item;
    }

    public addListItemAt(item: IWindow, index: number): IWindow
    {
        return this.itemList?.addListItemAt(item, index) ?? item;
    }

    public getListItemAt(index: number): IWindow | null
    {
        return this.itemList?.getListItemAt(index) ?? null;
    }

    public getListItemByName(name: string): IWindow | null
    {
        return this.itemList?.getListItemByName(name) ?? null;
    }

    public getListItemByID(id: number): IWindow | null
    {
        return this.itemList?.getListItemByID(id) ?? null;
    }

    public getListItemByTag(tag: string): IWindow | null
    {
        return this.itemList?.getListItemByTag(tag) ?? null;
    }

    public getListItemIndex(item: IWindow): number
    {
        return this.itemList?.getListItemIndex(item) ?? -1;
    }

    public removeListItem(item: IWindow): IWindow | null
    {
        return this.itemList?.removeListItem(item) ?? null;
    }

    public removeListItemAt(index: number): IWindow | null
    {
        return this.itemList?.removeListItemAt(index) ?? null;
    }

    public removeListItems(): void
    {
        this.itemList?.removeListItems();
    }

    public destroyListItems(): void
    {
        this.itemList?.destroyListItems();
    }

    public setListItemIndex(item: IWindow, index: number): void
    {
        this.itemList?.setListItemIndex(item, index);
    }

    public swapListItems(a: IWindow, b: IWindow): void
    {
        this.itemList?.swapListItems(a, b);
    }

    public swapListItemsAt(indexA: number, indexB: number): void
    {
        this.itemList?.swapListItemsAt(indexA, indexB);
    }

    public groupListItemsWithID(id: number, result: IWindow[], depth: number = 0): number
    {
        return this.itemList?.groupListItemsWithID(id, result, depth) ?? 0;
    }

    public groupListItemsWithTag(tag: string, result: IWindow[], depth: number = 0): number
    {
        return this.itemList?.groupListItemsWithTag(tag, result, depth) ?? 0;
    }

    /**
	 * Scrolls the list by a wheel delta amount.
	 */
    public stopDragging(): void
    {
        this.itemList?.stopDragging();
    }

    public populate(items: IWindow[]): void
    {
        this.itemList?.populate(items);
    }

    public scrollWithWheel(delta: number, useHorizontal: boolean): boolean
    {
        return this.itemList?.scrollWithWheel(delta, useHorizontal) ?? false;
    }

    public override getLayoutChildTarget(): IWindow
    {
        return this.itemList as unknown as IWindow ?? this;
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        if(this._scrollBarRef)
        {
            (this._scrollBarRef as unknown as IWindow).removeEventListener('WE_ENABLED', this._scrollBarEventProcBound);
            (this._scrollBarRef as unknown as IWindow).removeEventListener('WE_DISABLED', this._scrollBarEventProcBound);
        }

        this._scrollBarRef = null;
        this._itemListRef = null;

        super.dispose();
    }
}
