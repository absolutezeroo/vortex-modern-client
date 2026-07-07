import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Iterator interface for WindowController.
 * Uses duck-typing to avoid circular imports (mirrors ItemGridIterator's IItemGridHost).
 */
interface IContainerHost
{
    numChildren: number;

    getChildAt(index: number): IWindow | null;

    getChildIndex(child: IWindow): number;
}

/**
 * Iterator for traversing children of a window container.
 *
 * In AS3 this extends Proxy and delegates live to WindowController methods
 * (numChildren, getChildAt, getChildIndex) - so it always reflects the
 * container's current children, even if children are added/removed after
 * the iterator was created. Delegating to the live container (not a
 * snapshot array) here matches that.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/iterators/ContainerIterator.as
 */
export class ContainerIterator implements IIterator
{
    private _container: IContainerHost;
    private _index: number = 0;

    constructor(container: IContainerHost)
    {
        this._container = container;
    }

    public next(): IWindow | null
    {
        if(this._index < this._container.numChildren)
        {
            return this._container.getChildAt(this._index++);
        }

        return null;
    }

    public reset(): void
    {
        this._index = 0;
    }

    public count(): number
    {
        return this._container.numChildren;
    }
}
