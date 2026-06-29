import type {IIterator} from './IIterator';

/**
 * Interface for iterable window containers.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/IIterable.as
 */
export interface IIterable
{
	iterator(): IIterator;
}
