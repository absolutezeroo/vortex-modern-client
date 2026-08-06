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
    // AS3: .../src/com/sulake/core/window/components/IScrollbarWindow.as::get scrollH()
    scrollH: number;
    // AS3: .../src/com/sulake/core/window/components/IScrollbarWindow.as::get scrollV()
    scrollV: number;
    // AS3: .../src/com/sulake/core/window/components/IScrollbarWindow.as::get scrollable()
    scrollable: IScrollableWindow | null;

    // AS3: .../src/com/sulake/core/window/components/IScrollbarWindow.as::get vertical()
    readonly vertical: boolean;
    // AS3: .../src/com/sulake/core/window/components/IScrollbarWindow.as::get horizontal()
    readonly horizontal: boolean;
}
