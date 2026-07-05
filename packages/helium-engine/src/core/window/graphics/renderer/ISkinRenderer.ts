import type {IWindow} from '../../IWindow';
import type {IDisposable} from "../../../runtime/IDisposable";

/**
 * Interface for skin renderers.
 *
 * A skin renderer draws a window's visual background using bitmap templates
 * (9-slice), solid fills, or other techniques. Each element type+style
 * combination has one ISkinRenderer registered in the SkinContainer.
 *
 * @see sources/flash_version/com/sulake/core/window/graphics/renderer/ISkinRenderer.as
 */
export interface ISkinRenderer extends IDisposable
{
    /**
	 * The renderer name.
	 */
    readonly name: string;

    /**
	 * Draws the window skin onto the given canvas context.
	 *
	 * @param window - The window to render
	 * @param ctx - The 2D rendering context
	 * @param rect - The target rectangle
	 * @param state - The resolved window state
	 * @param colorize - Whether to apply colorization
	 */
    draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        state: number,
        colorize: boolean
    ): void;

    /**
	 * Tests whether a given state has drawable content.
	 *
	 * @param state - The window state flags
	 * @returns True if the state can be drawn
	 */
    isStateDrawable(state: number): boolean;
}
