import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Iterator for traversing children of a window container.
 *
 * In AS3 this extended Proxy to support array-like access via flash_proxy.
 * In TypeScript we implement the simplified IIterator interface with
 * sequential next(), reset(), and count() semantics.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/iterators/ContainerIterator.as
 */
export class ContainerIterator implements IIterator
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
