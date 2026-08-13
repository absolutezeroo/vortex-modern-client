import type {IWindow} from '../IWindow';

/**
 * Iterator interface for traversing window children.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/utils/IIterator.as
 */
export interface IIterator
{
    next(): IWindow | null;

    reset(): void;

    count(): number;
}
