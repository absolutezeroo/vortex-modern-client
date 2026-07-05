import type {IItemGridWindow} from './IItemGridWindow';

/**
 * Interface for scrollable grid windows.
 *
 * Extends IItemGridWindow with auto-hide scrollbar support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IScrollableGridWindow.as
 */
export interface IScrollableGridWindow extends IItemGridWindow
{
    autoHideScrollBar: boolean;
}
