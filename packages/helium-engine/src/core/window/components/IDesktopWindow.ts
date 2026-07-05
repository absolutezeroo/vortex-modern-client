import type {IWindowContainer} from '../IWindowContainer';
import type {IDisplayObjectWrapper} from './IDisplayObjectWrapper';
import type {IWindow} from '../IWindow';

/**
 * Interface for the desktop window (root container).
 *
 * The desktop window is the top-level container that holds all other windows.
 * It provides mouse position tracking and active window management.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDesktopWindow.as
 */
export interface IDesktopWindow extends IWindowContainer, IDisplayObjectWrapper
{
    readonly mouseX: number;
    readonly mouseY: number;

    getActiveWindow(): IWindow;

    setActiveWindow(window: IWindow): IWindow;

    groupParameterFilteredChildrenUnderPoint(
        point: { x: number; y: number },
        result: IWindow[],
        paramFilter?: number
    ): void;
}
