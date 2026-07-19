import type {IWindow} from '../IWindow';

/**
 * Iterator interface for traversing window children.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IIterator.as
 */
export interface IIterator
{
    next(): IWindow | null;

    reset(): void;

    count(): number;
}
