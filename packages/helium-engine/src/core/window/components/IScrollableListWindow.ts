import type {IItemListWindow} from './IItemListWindow';

/**
 * Interface for scrollable list windows.
 *
 * Extends IItemListWindow with auto-hide scrollbar support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IScrollableListWindow.as
 */
export interface IScrollableListWindow extends IItemListWindow
{
    autoHideScrollBar: boolean;
    readonly isScrollBarVisible: boolean;
}
