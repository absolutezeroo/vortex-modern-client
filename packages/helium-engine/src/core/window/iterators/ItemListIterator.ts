import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Iterator for traversing items in an ItemList window.
 *
 * In AS3 this extended Proxy and delegated to ItemListController methods
 * (numListItems, getListItemAt, getListItemIndex). In TypeScript we
 * implement the simplified IIterator interface over a plain array of
 * child windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/iterators/ItemListIterator.as
 */
export class ItemListIterator implements IIterator
{
	private _children: IWindow[];
	private _index: number = 0;

	constructor(children: IWindow[])
	{
		this._children = children;
	}

	public next(): IWindow | null
	{
		if (this._index < this._children.length)
		{
			return this._children[this._index++];
		}

		return null;
	}

	public reset(): void
	{
		this._index = 0;
	}

	public count(): number
	{
		return this._children.length;
	}
}
