import type {IWindow} from '../IWindow';
import type {IIterable} from '../utils/IIterable';

/**
 * Interface for widget windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IWidgetWindow.as
 */
export interface IWidgetWindow extends IWindow, IIterable
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/window/components/IWidgetWindow.as::get widget()
    readonly widget: unknown;
    rootWindow: IWindow | null;
}
