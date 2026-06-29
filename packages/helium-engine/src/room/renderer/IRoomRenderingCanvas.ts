/**
 * IRoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer.IRoomRenderingCanvas
 *
 * Interface for a rendering canvas that displays room objects as sprites.
 * Handles rendering, mouse events, scaling, and viewport management.
 *
 * @see sources/win63_version/room/renderer/IRoomRenderingCanvas.as
 */
import type {IRoomGeometry} from '../utils/IRoomGeometry';
import type {IRoomRenderingCanvasMouseListener} from './IRoomRenderingCanvasMouseListener';

export interface IRoomRenderingCanvas
{
	readonly width: number;

	readonly height: number;

	screenOffsetX: number;

	screenOffsetY: number;

	readonly scale: number;

	readonly geometry: IRoomGeometry;

	mouseListener: IRoomRenderingCanvasMouseListener | null;

	// AS3: sources/win63_version/room/renderer/IRoomRenderingCanvas.as::useMask
	useMask: boolean;

	// AS3: sources/win63_version/room/renderer/IRoomRenderingCanvas.as::fpsCounterEnabled
	fpsCounterEnabled: boolean;

	initialize(width: number, height: number): void;

	render(time: number, force?: boolean): void;

	handleMouseEvent(
		x: number,
		y: number,
		type: string,
		altKey: boolean,
		ctrlKey: boolean,
		shiftKey: boolean,
		buttonDown: boolean
	): boolean;

	setScale(scale: number, point?: { x: number; y: number } | null, offset?: { x: number; y: number } | null): void;

	getId(): number;

	update(): void;

	// AS3: sources/win63_version/room/renderer/IRoomRenderingCanvas.as::skipSpriteVisibilityChecking()
	skipSpriteVisibilityChecking(): void;

	// AS3: sources/win63_version/room/renderer/IRoomRenderingCanvas.as::resumeSpriteVisibilityChecking()
	resumeSpriteVisibilityChecking(): void;

	dispose(): void;
}
