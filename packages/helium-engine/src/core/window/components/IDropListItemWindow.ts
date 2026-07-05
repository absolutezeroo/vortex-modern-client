import type {IWindow} from '../IWindow';
import type {IDropMenuWindow} from './IDropMenuWindow';

/**
 * Interface for drop list item windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDropListItemWindow.as
 */
export interface IDropListItemWindow extends IWindow
{
    readonly menu: IDropMenuWindow | null;
    value: IWindow | null;
}
