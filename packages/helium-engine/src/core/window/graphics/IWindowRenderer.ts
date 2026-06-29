import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IDisposable} from "../../runtime/IDisposable";

/**
 * Interface for the window rendering pipeline.
 *
 * Manages a render queue of dirty windows and their invalidated regions,
 * then renders them into draw buffers. In AS3 this produced BitmapData;
 * in TypeScript the rendering is abstracted for the SolidJS client.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/IWindowRenderer.as
 */
export interface IWindowRenderer extends IDisposable
{
	/**
	 * Enables or disables debug rendering.
	 */
	debug: boolean;

	/**
	 * Renders all queued dirty windows.
	 */
	render(): void;

	/**
	 * Monotonic counter incremented whenever queued dirty windows are rendered.
	 */
	readonly renderVersion: number;

	/**
	 * Whether the renderer currently has queued dirty windows.
	 */
	hasPendingUpdates(): boolean;

	/**
	 * Adds a window to the render queue with a dirty region.
	 *
	 * @param window - The window to render
	 * @param rect - The dirty rectangle, or null for full window
	 * @param flags - Invalidation flags
	 */
	addToRenderQueue(window: IWindow, rect: {
		x: number;
		y: number;
		width: number;
		height: number
	} | null, flags: number): void;

	/**
	 * Clears the render queue without rendering.
	 */
	flushRenderQueue(): void;

	/**
	 * Invalidates all windows in the given context.
	 *
	 * @param context - The window context to invalidate
	 * @param rect - The invalidation rectangle
	 */
	invalidate(context: IWindowContext, rect: { x: number; y: number; width: number; height: number }): void;

	/**
	 * Returns the draw buffer for the given window.
	 *
	 * @param window - The window to get the buffer for
	 * @returns The draw buffer, or null
	 */
	getDrawBufferForRenderable(window: IWindow): unknown;

	/**
	 * Purges cached render data for the given window (or all windows if null).
	 *
	 * @param window - The window to purge, or null for all
	 * @param recursive - Whether to recurse into children
	 */
	purge(window?: IWindow | null, recursive?: boolean): void;
}
