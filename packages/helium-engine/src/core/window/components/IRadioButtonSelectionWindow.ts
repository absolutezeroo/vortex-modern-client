import type {IWindowContainer} from '../IWindowContainer';
import type {IRadioButtonWindow} from './IRadioButtonWindow';

/**
 * Interface for radio button selection containers.
 *
 * Tracks the currently selected radio button within a group.
 *
 * @see sources/win63_version/core/window/components/IRadioButtonSelectionWindow.as
 */
export interface IRadioButtonSelectionWindow extends IWindowContainer
{
	readonly selected: IRadioButtonWindow | null;

	radioButtonSelection(button: IRadioButtonWindow): void;
}
