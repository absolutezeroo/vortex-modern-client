import type {IIterator} from './IIterator';

/**
 * Interface for iterable window containers.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IIterable.as
 */
export interface IIterable
{
    // AS3: sources/win63_version/core/window/utils/IIterable.as::get iterator()
    iterator(): IIterator | null;
}
