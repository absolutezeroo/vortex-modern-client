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
    // The scrolled content region; ScrollableItemListWindow already implements it. Exposed here (as on
    // the AS3 interface) so the wired ScrollListPreset can size itself to the content height.
    readonly scrollableRegion: { x: number; y: number; width: number; height: number };
}
