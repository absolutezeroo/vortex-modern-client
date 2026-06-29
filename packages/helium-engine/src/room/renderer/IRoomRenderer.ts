/**
 * IRoomRenderer
 *
 * Based on AS3: com.sulake.room.renderer.IRoomRenderer
 *
 * Extended renderer interface that adds canvas management on top of the base renderer.
 *
 * @see sources/win63_version/room/renderer/IRoomRenderer.as
 */
import type {IRoomRendererBase} from './IRoomRendererBase';
import type {IRoomRenderingCanvas} from './IRoomRenderingCanvas';

export interface IRoomRenderer extends IRoomRendererBase
{
	roomObjectVariableAccurateZ: string | null;

	createCanvas(id: number, width: number, height: number, scale: number): IRoomRenderingCanvas;

	getCanvas(id: number): IRoomRenderingCanvas | null;

	disposeCanvas(id: number): boolean;
}
