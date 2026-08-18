/**
 * A mod-tool window that `WindowTracker` can place, replace and toggle.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/ITrackedWindow.as
 *
 * `getType()` and `getId()` together name the slot the tracker keeps it in — see the type constants
 * on `WindowTracker`. `getFrame()` is the window it moves and clamps; `show()` is what puts it on
 * the desktop, and the tracker calls it *before* positioning so the frame has a size to place.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';

export interface ITrackedWindow extends IDisposable
{
    // AS3: ITrackedWindow.as::getType()
    getType(): number;

    // AS3: ITrackedWindow.as::getId()
    getId(): string;

    // AS3: ITrackedWindow.as::getFrame()
    getFrame(): IFrameWindow | null;

    // AS3: ITrackedWindow.as::show()
    show(): void;
}
