import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Singleton iterator that always returns nothing.
 *
 * Used as the default iterator for non-container windows that have no children.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/iterators/EmptyIterator.as
 */
export class EmptyIterator implements IIterator
{
    // AS3: .../src/com/sulake/core/window/iterators/EmptyIterator.as::INSTANCE
    public static readonly INSTANCE: EmptyIterator = new EmptyIterator();

    public next(): IWindow | null
    {
        return null;
    }

    public reset(): void
    {
    }

    public count(): number
    {
        return 0;
    }
}
