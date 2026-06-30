import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IScrollableGridWindow} from './IScrollableGridWindow';
import type {IItemGridWindow} from './IItemGridWindow';
import type {IScrollbarWindow} from './IScrollbarWindow';
import type {IIterator} from '../utils/IIterator';
import {ContainerController} from './ContainerController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Scrollable item grid window.
 *
 * Combines an item grid with a scrollbar. The scrollbar is automatically
 * bound to the item grid and can optionally auto-hide when not needed.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ScrollableItemGridWindow.as
 */
export class ScrollableItemGridWindow extends ContainerController implements IScrollableGridWindow
{
	private _itemGridRef: IItemGridWindow | null = null;
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

		if (this.scrollBar && this.itemGrid)
		{
			this.scrollBar.scrollable = this.itemGrid as unknown as import('./IScrollableWindow').IScrollableWindow;
		}

		if (this.scrollBar && this.scrollBar.testStateFlag(32))
		{
			this.hideScrollBar();
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
		this.updateScrollBarVisibility();
	}

	/**
	 * Gets the horizontal scroll position.
	 */
	public get scrollH(): number
	{
		return this.itemGrid?.scrollH ?? 0;
	}

	/**
	 * Sets the horizontal scroll position.
	 */
	public set scrollH(value: number)
	{
		if (this.itemGrid) this.itemGrid.scrollH = value;
	}

	/**
	 * Gets the vertical scroll position.
	 */
	public get scrollV(): number
	{
		return this.itemGrid?.scrollV ?? 0;
	}

	/**
	 * Sets the vertical scroll position.
	 */
	public set scrollV(value: number)
	{
		if (this.itemGrid) this.itemGrid.scrollV = value;
	}

	/**
	 * Gets the maximum horizontal scroll value.
	 */
	public get maxScrollH(): number
	{
		return this.itemGrid?.maxScrollH ?? 0;
	}

	/**
	 * Gets the maximum vertical scroll value.
	 */
	public get maxScrollV(): number
	{
		return this.itemGrid?.maxScrollV ?? 0;
	}

	/**
	 * Gets the visible region rectangle.
	 */
	public get visibleRegion(): { x: number; y: number; width: number; height: number }
	{
		return this.itemGrid?.visibleRegion ?? {x: 0, y: 0, width: 0, height: 0};
	}

	/**
	 * Gets the scrollable region rectangle.
	 */
	public get scrollableRegion(): { x: number; y: number; width: number; height: number }
	{
		return this.itemGrid?.scrollableRegion ?? {x: 0, y: 0, width: 0, height: 0};
	}

	/**
	 * Gets the horizontal scroll step.
	 */
	public get scrollStepH(): number
	{
		return this.itemGrid?.scrollStepH ?? 0;
	}

	/**
	 * Sets the horizontal scroll step.
	 */
	public set scrollStepH(value: number)
	{
		if (this.itemGrid) this.itemGrid.scrollStepH = value;
	}

	/**
	 * Gets the vertical scroll step.
	 */
	public get scrollStepV(): number
	{
		return this.itemGrid?.scrollStepV ?? 0;
	}

	/**
	 * Sets the vertical scroll step.
	 */
	public set scrollStepV(value: number)
	{
		if (this.itemGrid) this.itemGrid.scrollStepV = value;
	}

	/**
	 * Gets whether items auto-arrange.
	 */
	public get autoArrangeItems(): boolean
	{
		return this.itemGrid?.autoArrangeItems ?? true;
	}

	/**
	 * Sets whether items auto-arrange.
	 */
	public set autoArrangeItems(value: boolean)
	{
		if (this.itemGrid) this.itemGrid.autoArrangeItems = value;
	}

	/**
	 * Gets the number of columns.
	 */
	public get numColumns(): number
	{
		return this.itemGrid?.numColumns ?? 0;
	}

	/**
	 * Gets the number of rows.
	 */
	public get numRows(): number
	{
		return this.itemGrid?.numRows ?? 0;
	}

	/**
	 * Gets the total number of grid items.
	 */
	public get numGridItems(): number
	{
		return this.itemGrid?.numGridItems ?? 0;
	}

	/**
	 * Gets whether grid rebuilds on resize.
	 */
	public get shouldRebuildGridOnResize(): boolean
	{
		return this.itemGrid?.shouldRebuildGridOnResize ?? true;
	}

	/**
	 * Sets whether grid rebuilds on resize.
	 */
	public set shouldRebuildGridOnResize(value: boolean)
	{
		if (this.itemGrid) this.itemGrid.shouldRebuildGridOnResize = value;
	}

	/**
	 * Gets the spacing between items.
	 */
	public get spacing(): number
	{
		return this.itemGrid?.spacing ?? 0;
	}

	/**
	 * Sets the spacing between items.
	 */
	public set spacing(value: number)
	{
		if (this.itemGrid) this.itemGrid.spacing = value;
	}

	/**
	 * Sets the vertical spacing.
	 */
	public set verticalSpacing(value: number)
	{
		if (this.itemGrid) this.itemGrid.verticalSpacing = value;
	}

	/**
	 * Gets whether items scale to fit.
	 */
	public get scaleToFitItems(): boolean
	{
		return this.itemGrid?.scaleToFitItems ?? false;
	}

	/**
	 * Sets whether items scale to fit.
	 */
	public set scaleToFitItems(value: boolean)
	{
		if (this.itemGrid) this.itemGrid.scaleToFitItems = value;
	}

	/**
	 * Gets whether the grid resizes on item update.
	 */
	public get resizeOnItemUpdate(): boolean
	{
		return this.itemGrid?.resizeOnItemUpdate ?? false;
	}

	/**
	 * Sets whether the grid resizes on item update.
	 */
	public set resizeOnItemUpdate(value: boolean)
	{
		if (this.itemGrid) this.itemGrid.resizeOnItemUpdate = value;
	}

	/**
	 * Gets whether columns resize to fit content.
	 */
	public get containerResizeToColumns(): boolean
	{
		return false;
	}

	/**
	 * Sets whether columns resize to fit content.
	 */
	public set containerResizeToColumns(_value: boolean)
	{
		// No-op per AS3
	}

	/**
	 * Gets the internal item grid child.
	 */
	protected get itemGrid(): IItemGridWindow | null
	{
		if (!this._itemGridRef)
		{
			this._itemGridRef = this.findChildByTag('_ITEMGRID') as unknown as IItemGridWindow | null;
		}

		return this._itemGridRef;
	}

	/**
	 * Gets the internal scrollbar child.
	 */
	protected get scrollBar(): IScrollbarWindow | null
	{
		if (!this._scrollBarRef)
		{
			this._scrollBarRef = this.findChildByTag('_SCROLLBAR') as unknown as IScrollbarWindow | null;

			if (this._scrollBarRef)
			{
				(this._scrollBarRef as unknown as IWindow).addEventListener('WE_ENABLED', this._scrollBarEventProcBound);
				(this._scrollBarRef as unknown as IWindow).addEventListener('WE_DISABLED', this._scrollBarEventProcBound);
			}
		}

		return this._scrollBarRef;
	}

	// AS3: sources/win63_version/core/window/components/ScrollableItemGridWindow.as::get iterator()
	public override iterator(): IIterator | null
	{
		if (this.isConstructionReady() && this.itemGrid)
		{
			return this.itemGrid.iterator();
		}

		return null;
	}

	/**
	 * Adds a grid item.
	 */
	public addGridItem(item: IWindow): IWindow
	{
		return this.itemGrid!.addGridItem(item);
	}

	/**
	 * Adds a grid item at the specified index.
	 */
	public addGridItemAt(item: IWindow, index: number): IWindow
	{
		return this.itemGrid!.addGridItemAt(item, index);
	}

	/**
	 * Gets the grid item at the specified index.
	 */
	public getGridItemAt(index: number): IWindow | null
	{
		return this.itemGrid?.getGridItemAt(index) ?? null;
	}

	/**
	 * Gets the grid item with the specified ID.
	 */
	public getGridItemByID(id: number): IWindow | null
	{
		return this.itemGrid?.getGridItemByID(id) ?? null;
	}

	/**
	 * Gets the grid item with the specified name.
	 */
	public getGridItemByName(name: string): IWindow | null
	{
		return this.itemGrid?.getGridItemByName(name) ?? null;
	}

	/**
	 * Gets the grid item with the specified tag.
	 */
	public getGridItemByTag(tag: string): IWindow | null
	{
		return this.itemGrid?.getGridItemByTag(tag) ?? null;
	}

	/**
	 * Gets the index of the specified grid item.
	 */
	public getGridItemIndex(item: IWindow): number
	{
		return this.itemGrid?.getGridItemIndex(item) ?? -1;
	}

	/**
	 * Removes a grid item.
	 */
	public removeGridItem(item: IWindow): IWindow | null
	{
		return this.itemGrid?.removeGridItem(item) ?? null;
	}

	/**
	 * Removes the grid item at the specified index.
	 */
	public removeGridItemAt(index: number): IWindow | null
	{
		return this.itemGrid?.removeGridItemAt(index) ?? null;
	}

	/**
	 * Sets the index of the specified grid item.
	 */
	public setGridItemIndex(item: IWindow, index: number): void
	{
		this.itemGrid?.setGridItemIndex(item, index);
	}

	/**
	 * Swaps two grid items.
	 */
	public swapGridItems(a: IWindow, b: IWindow): void
	{
		this.itemGrid?.swapGridItems(a, b);
	}

	/**
	 * Swaps two grid items at the specified indices.
	 */
	public swapGridItemsAt(indexA: number, indexB: number): void
	{
		this.itemGrid?.swapGridItemsAt(indexA, indexB);
	}

	/**
	 * Removes all grid items.
	 */
	public removeGridItems(): void
	{
		this.itemGrid?.removeGridItems();
	}

	/**
	 * Destroys all grid items.
	 */
	public destroyGridItems(): void
	{
		this.itemGrid?.destroyGridItems();
	}

	/**
	 * Rebuilds the grid structure.
	 */
	public rebuildGridStructure(): void
	{
		this.itemGrid?.rebuildGridStructure();
	}

	/**
	 * Populates the grid with items.
	 */
	public populate(items: IWindow[]): void
	{
		this.itemGrid?.populate(items);
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		if (this._scrollBarRef)
		{
			(this._scrollBarRef as unknown as IWindow).removeEventListener('WE_ENABLED', this._scrollBarEventProcBound);
			(this._scrollBarRef as unknown as IWindow).removeEventListener('WE_DISABLED', this._scrollBarEventProcBound);
			this._scrollBarRef = null;
		}

		if (this._itemGridRef)
		{
			this._itemGridRef = null;
		}

		super.dispose();
	}

	// AS3: sources/win63_version/core/window/components/ScrollableItemGridWindow.as::isConstructionReady()
	protected isConstructionReady(): boolean
	{
		return !!(this.itemGrid && this.scrollBar);
	}

	/**
	 * Hides the scrollbar.
	 */
	private hideScrollBar(): void
	{
		const sb = this.scrollBar as unknown as IWindow | null;

		if (sb && sb.visible)
		{
			sb.visible = false;
		}
	}

	/**
	 * Shows the scrollbar.
	 */
	private showScrollBar(): void
	{
		const sb = this.scrollBar as unknown as IWindow | null;

		if (sb && !sb.visible)
		{
			sb.visible = true;
		}
	}

	/**
	 * Updates the scrollbar visibility based on the auto-hide setting.
	 */
	private updateScrollBarVisibility(): void
	{
		const sb = this.scrollBar as unknown as IWindow | null;

		if (!sb) return;

		if (this._autoHideScrollBar)
		{
			if (this.scrollBar!.testStateFlag(32) && sb.visible)
			{
				this.hideScrollBar();
			}
		}
		else
		{
			if (sb.visible)
			{
				this.showScrollBar();
			}
		}
	}

	/**
	 * Handles scrollbar enable/disable events.
	 */
	private scrollBarEventProc(event: WindowEvent): void
	{
		if (event.type === 'WE_ENABLED')
		{
			this.showScrollBar();
		}
		else if (event.type === 'WE_DISABLED')
		{
			this.hideScrollBar();
		}
	}
}
