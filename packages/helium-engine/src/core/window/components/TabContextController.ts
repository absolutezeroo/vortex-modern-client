import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import type {IWindowContext} from '../IWindowContext';
import type {IIterator} from '../utils/IIterator';
import type {ISelectorListWindow} from './ISelectorListWindow';
import type {ITabButtonWindow} from './ITabButtonWindow';
import type {ITabContextWindow} from './ITabContextWindow';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';

/**
 * Controller for tab context windows.
 *
 * Manages a set of tab buttons through an ISelectorListWindow and
 * switches visible content in an IWindowContainer when a tab is selected.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/TabContextController.as
 */
export class TabContextController extends WindowController implements ITabContextWindow
{
	private static readonly TAG_TAB_CONTEXT_SELECTOR: string = '_SELECTOR';
	private static readonly TAG_TAB_CONTEXT_CONTENT: string = '_CONTENT';

	protected _selectorList: ISelectorListWindow | null = null;
	protected _contentContainer: IWindowContainer | null = null;
	private _initialized: boolean = false;

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
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id);

		const internals: IWindow[] = [];
		this.groupChildrenWithTag('_INTERNAL', internals, -1);

		for (const child of internals)
		{
			child.style = this._style;
			child.procedure = this.selectorEventProc.bind(this);
		}

		this._initialized = true;
	}

	/**
	 * The tab selector list.
	 */
	public get selector(): ISelectorListWindow | null
	{
		if (this._selectorList === null)
		{
			this._selectorList = this.findChildByTag('_SELECTOR') as unknown as ISelectorListWindow | null;

			if (this._selectorList !== null)
			{
				(this._selectorList as unknown as IWindow).procedure = this.selectorEventProc.bind(this);
			}
		}

		return this._selectorList;
	}

	/**
	 * The content container.
	 */
	public get container(): IWindowContainer | null
	{
		if (this._contentContainer === null)
		{
			this._contentContainer = this.findChildByTag('_CONTENT') as unknown as IWindowContainer | null;
		}

		return this._contentContainer;
	}

	/**
	 * The number of tab items.
	 */
	public get numTabItems(): number
	{
		return this.selector ? this.selector.numSelectables : 0;
	}

	/**
	 * Returns an iterator from the selector.
	 */
	public iterator(): IIterator
	{
		if (this._initialized && this.selector)
		{
			return this.selector.iterator();
		}

		return {
			next: () => null,
			reset: () =>
			{
			},
			count: () => 0
		};
	}

	/**
	 * Adds a tab item.
	 */
	public addTabItem(tab: ITabButtonWindow): ITabButtonWindow
	{
		return this.selector!.addSelectable(tab as unknown as import('./ISelectableWindow').ISelectableWindow) as unknown as ITabButtonWindow;
	}

	/**
	 * Adds a tab item at the specified index.
	 */
	public addTabItemAt(tab: ITabButtonWindow, index: number): ITabButtonWindow
	{
		return this.selector!.addSelectableAt(tab as unknown as import('./ISelectableWindow').ISelectableWindow, index) as unknown as ITabButtonWindow;
	}

	/**
	 * Removes a tab item.
	 */
	public removeTabItem(tab: ITabButtonWindow): void
	{
		this.selector?.removeSelectable(tab as unknown as import('./ISelectableWindow').ISelectableWindow);
	}

	/**
	 * Returns the tab item at the specified index.
	 */
	public getTabItemAt(index: number): ITabButtonWindow | null
	{
		return this.selector?.getSelectableAt(index) as unknown as ITabButtonWindow | null ?? null;
	}

	/**
	 * Returns the tab item with the specified name.
	 */
	public getTabItemByName(name: string): ITabButtonWindow | null
	{
		return this.selector?.getSelectableByName(name) as unknown as ITabButtonWindow | null ?? null;
	}

	/**
	 * Returns the tab item with the specified ID.
	 */
	public getTabItemByID(id: number): ITabButtonWindow | null
	{
		return this.selector?.getSelectableByID(id) as unknown as ITabButtonWindow | null ?? null;
	}

	/**
	 * Returns the index of the specified tab item.
	 */
	public getTabItemIndex(tab: ITabButtonWindow): number
	{
		return this.selector?.getSelectableIndex(tab as unknown as import('./ISelectableWindow').ISelectableWindow) ?? -1;
	}

	/**
	 * Redirects layout children to the internal _SELECTOR.
	 *
	 * When the layout parser creates tab_button children inside a tab_context,
	 * they must be added to the selector (not to the tab context itself).
	 * Without this override, getTabItemAt() returns null because tab buttons
	 * end up as direct children of the tab context rather than the selector.
	 */
	public override getLayoutChildTarget(): IWindow
	{
		const sel = this.selector;

		if (sel)
		{
			return sel as unknown as IWindow;
		}

		return this;
	}

	/**
	 * Handles selection events from the selector.
	 */
	private selectorEventProc(event: WindowEvent, _window: IWindow): void
	{
		if (event.type === 'WE_SELECTED')
		{
			this.notifyEventListeners(event);
		}
	}
}
