import type {IWindow} from '../IWindow';

/**
 * Focus manager service interface.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/services/IFocusManagerService.as
 */
export interface IFocusManagerService
{
	setFocus(window: IWindow | null): void;

	getFocus(): IWindow | null;
}
