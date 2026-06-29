import type {IWindowContainer} from '../IWindowContainer';
import type {ILabelWindow} from './ILabelWindow';
import type {IItemListWindow} from './IItemListWindow';

/**
 * Interface for header windows.
 *
 * A header window contains a title label and an item list of controls
 * (close button, minimize, etc.).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IHeaderWindow.as
 */
export interface IHeaderWindow extends IWindowContainer
{
	readonly title: ILabelWindow;
	readonly controls: IItemListWindow;
}
