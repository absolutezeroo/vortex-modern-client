import type {IWindow} from '../IWindow';
import type {ISelectorWindow} from './ISelectorWindow';

/**
 * Interface for selectable windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ISelectableWindow.as
 */
export interface ISelectableWindow extends IWindow
{
	readonly selector: ISelectorWindow | null;
	isSelected: boolean;

	select(): boolean;

	unselect(): boolean;
}
