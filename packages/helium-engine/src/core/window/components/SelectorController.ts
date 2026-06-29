import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IIterator} from '../utils/IIterator';
import type {ISelectableWindow} from './ISelectableWindow';
import type {ISelectorWindow} from './ISelectorWindow';
import {SelectorIterator} from '../iterators/SelectorIterator';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {InteractiveController} from './InteractiveController';

/**
 * Controller for selector windows.
 *
 * Manages mutual exclusion of selectable children: when one child is
 * selected, the previously selected child is deselected.
 *
 * @see sources/win63_version/com/sulake/core/window/components/SelectorController.as
 */
export class SelectorController extends InteractiveController implements ISelectorWindow
{
	protected _bringToFront: boolean = true;
	private _selected: ISelectableWindow | null = null;

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
	}

	/**
	 * The number of selectable children.
	 */
	public get numSelectables(): number
	{
		return this.numChildren;
	}

	/**
	 * Returns an iterator over the selectable children.
	 */
	public iterator(): IIterator
	{
		return new SelectorIterator(this._children ?? []);
	}

	public override update(source: WindowController, event: WindowEvent): boolean
	{
		if (event.type === 'WE_CHILD_ACTIVATED')
		{
			if ('select' in source && 'unselect' in source)
			{
				this.setSelected(source as unknown as ISelectableWindow);
			}
		}

		return super.update(source, event);
	}

	/**
	 * Returns the currently selected child.
	 */
	public getSelected(): ISelectableWindow | null
	{
		return this._selected;
	}

	/**
	 * Sets the selected child, deselecting the previous one.
	 */
	public setSelected(selectable: ISelectableWindow): void
	{
		if (selectable !== null)
		{
			if (selectable !== this._selected)
			{
				if (this._selected !== null)
				{
					if (!this._selected.unselect())
					{
						return;
					}
				}

				const previous = this._selected;
				this._selected = selectable;

				if (this._selected.select())
				{
					if (this.getChildIndex(this._selected as unknown as IWindow) > -1)
					{
						if (this._bringToFront)
						{
							if (this.getChildIndex(this._selected as unknown as IWindow) !== (this.numChildren - 1))
							{
								this.setChildIndex(this._selected as unknown as IWindow, this.numChildren - 1);
							}
						}
					}
				}
				else
				{
					this._selected = previous;

					if (this._selected !== null)
					{
						this._selected.select();
					}
				}
			}
		}
	}

	/**
	 * Adds a selectable child.
	 */
	public addSelectable(selectable: ISelectableWindow): ISelectableWindow
	{
		return this.addChild(selectable as unknown as IWindow) as unknown as ISelectableWindow;
	}

	/**
	 * Adds a selectable child at the specified index.
	 */
	public addSelectableAt(selectable: ISelectableWindow, index: number): ISelectableWindow
	{
		return this.addChildAt(selectable as unknown as IWindow, index) as unknown as ISelectableWindow;
	}

	/**
	 * Returns the selectable child at the specified index.
	 */
	public getSelectableAt(index: number): ISelectableWindow | null
	{
		return this.getChildAt(index) as unknown as ISelectableWindow | null;
	}

	/**
	 * Returns the selectable child with the specified ID.
	 */
	public getSelectableByID(id: number): ISelectableWindow | null
	{
		return this.getChildByID(id) as unknown as ISelectableWindow | null;
	}

	/**
	 * Returns the selectable child with the specified tag.
	 */
	public getSelectableByTag(tag: string): ISelectableWindow | null
	{
		return this.getChildByTag(tag) as unknown as ISelectableWindow | null;
	}

	/**
	 * Returns the selectable child with the specified name.
	 */
	public getSelectableByName(name: string): ISelectableWindow | null
	{
		return this.getChildByName(name) as unknown as ISelectableWindow | null;
	}

	/**
	 * Returns the index of the specified selectable child.
	 */
	public getSelectableIndex(selectable: ISelectableWindow): number
	{
		return this.getChildIndex(selectable as unknown as IWindow);
	}

	/**
	 * Removes a selectable child.
	 */
	public removeSelectable(selectable: ISelectableWindow): ISelectableWindow | null
	{
		const index = this.getChildIndex(selectable as unknown as IWindow);

		if (index > -1)
		{
			if (selectable === this._selected)
			{
				if (this.numSelectables > 1)
				{
					this.setSelected(this.getSelectableAt(index === 0 ? 1 : 0)!);
				}
				else
				{
					this._selected = null;
				}
			}

			return this.removeChild(selectable as unknown as IWindow) as unknown as ISelectableWindow;
		}

		return null;
	}
}
