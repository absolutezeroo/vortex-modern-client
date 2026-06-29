import type {IWindow} from '../IWindow';
import type {IIterable} from '../utils/IIterable';

/**
 * Interface for widget windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IWidgetWindow.as
 */
export interface IWidgetWindow extends IWindow, IIterable
{
	readonly widget: unknown;
	rootWindow: IWindow | null;
}
