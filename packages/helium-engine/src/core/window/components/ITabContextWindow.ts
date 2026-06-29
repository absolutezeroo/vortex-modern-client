import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import type {IIterable} from '../utils/IIterable';
import type {ISelectorListWindow} from './ISelectorListWindow';
import type {ITabButtonWindow} from './ITabButtonWindow';

/**
 * Interface for tab context windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ITabContextWindow.as
 */
export interface ITabContextWindow extends IWindow, IIterable
{
	readonly selector: ISelectorListWindow | null;
	readonly container: IWindowContainer | null;
	readonly numTabItems: number;

	addTabItem(tab: ITabButtonWindow): ITabButtonWindow;

	addTabItemAt(tab: ITabButtonWindow, index: number): ITabButtonWindow;

	removeTabItem(tab: ITabButtonWindow): void;

	getTabItemAt(index: number): ITabButtonWindow | null;

	getTabItemByName(name: string): ITabButtonWindow | null;

	getTabItemByID(id: number): ITabButtonWindow | null;

	getTabItemIndex(tab: ITabButtonWindow): number;
}
