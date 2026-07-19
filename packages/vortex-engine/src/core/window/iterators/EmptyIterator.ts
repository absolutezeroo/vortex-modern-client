import type {IWindow} from '../IWindow';
import type {IIterator} from '../utils/IIterator';

/**
 * Singleton iterator that always returns nothing.
 *
 * Used as the default iterator for non-container windows that have no children.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/iterators/EmptyIterator.as
 */
export class EmptyIterator implements IIterator
{
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
