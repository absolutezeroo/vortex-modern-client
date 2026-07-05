import type {IInteractiveWindow} from './IInteractiveWindow';
import type {IScrollableWindow} from './IScrollableWindow';

/**
 * Interface for scrollbar windows.
 *
 * Provides scroll position, orientation, and a reference to the
 * scrollable target window.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IScrollbarWindow.as
 */
export interface IScrollbarWindow extends IInteractiveWindow
{
    scrollH: number;
    scrollV: number;
    scrollable: IScrollableWindow | null;

    readonly vertical: boolean;
    readonly horizontal: boolean;
}
