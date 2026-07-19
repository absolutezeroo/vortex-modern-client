import type {IWindow} from '../IWindow';

/**
 * Interface for scrollable windows.
 *
 * Provides horizontal and vertical scroll position, step size,
 * maximum scroll values, and visible/scrollable region rectangles.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IScrollableWindow.as
 */
export interface IScrollableWindow extends IWindow
{
    scrollH: number;
    scrollV: number;
    scrollStepH: number;
    scrollStepV: number;

    readonly maxScrollH: number;
    readonly maxScrollV: number;
    readonly visibleRegion: { x: number; y: number; width: number; height: number };
    readonly scrollableRegion: { x: number; y: number; width: number; height: number };
}
