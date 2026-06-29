import type {IWindow} from '../IWindow';
import type {IIterable} from '../utils/IIterable';
import type {IInteractiveWindow} from './IInteractiveWindow';

/**
 * Interface for drop list windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDropListWindow.as
 */
export interface IDropListWindow extends IInteractiveWindow, IIterable
{
	selection: number;
	readonly numMenuItems: number;

	addMenuItem(item: IWindow): IWindow | null;

	addMenuItemAt(item: IWindow, index: number): IWindow | null;

	getMenuItemIndex(item: IWindow): number;

	getMenuItemAt(index: number): IWindow | null;

	removeMenuItem(item: IWindow): IWindow | null;

	removeMenuItemAt(index: number): IWindow | null;
}
