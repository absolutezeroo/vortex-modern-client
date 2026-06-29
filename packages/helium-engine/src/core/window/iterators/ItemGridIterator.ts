import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Iterator interface for ItemGridController.
 * Uses duck-typing to avoid circular imports.
 */
interface IItemGridHost
{
	numGridItems: number;

	getGridItemAt(index: number): IWindow | null;

	getGridItemIndex(item: IWindow): number;
}

/**
 * Iterator for traversing items in an ItemGrid window.
 *
 * In AS3, extends Proxy and delegates to ItemGridController methods
 * (numGridItems, getGridItemAt, getGridItemIndex).
 *
 * @see sources/win63_version/com/sulake/core/window/iterators/ItemGridIterator.as
 */
export class ItemGridIterator implements IIterator
{
	private _grid: IItemGridHost;
	private _index: number = 0;

	constructor(grid: IItemGridHost)
	{
		this._grid = grid;
	}

	public next(): IWindow | null
	{
		if (this._index < this._grid.numGridItems)
		{
			return this._grid.getGridItemAt(this._index++);
		}

		return null;
	}

	public reset(): void
	{
		this._index = 0;
	}

	public count(): number
	{
		return this._grid.numGridItems;
	}
}
