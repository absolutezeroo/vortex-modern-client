import type {IRectLimiter} from './utils/IRectLimiter';
import type {PropertyStruct} from './utils/PropertyStruct';
import type {IWindowContext} from './IWindowContext';
import type {WindowEvent} from './events/WindowEvent';
import type {IDisposable} from "../runtime/IDisposable";

/**
 * Core window interface.
 *
 * Defines the complete API for a window element: position, size, style, state,
 * param, events, hit-testing, children lookup, and coordinate conversion.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindow.as
 */
export interface IWindow extends IDisposable
{
	x: number;
	y: number;
	width: number;
	height: number;
	position: { x: number; y: number };
	rectangle: { x: number; y: number; width: number; height: number };
	readonly renderingRectangle: { x: number; y: number; width: number; height: number };
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly renderingX: number;
	readonly renderingY: number;
	readonly renderingWidth: number;
	readonly renderingHeight: number;
	readonly etchingPoint: { x: number; y: number };

	id: number;
	name: string;
	caption: string;
	tags: string[];

	type: number;
	style: number;
	state: number;
	param: number;

	offsetX: number;
	offsetY: number;

	visible: boolean;
	background: boolean;
	color: number;
	alpha: number;
	blend: number;
	clipping: boolean;
	debug: boolean;
	filters: unknown[];
	dynamicStyle: string;
	dynamicStyleColor: {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number;
		redOffset: number;
		greenOffset: number;
		blueOffset: number;
		alphaOffset: number;
	} | null;

	procedure: ((event: WindowEvent, window: IWindow) => void) | null;
	mouseThreshold: number;
	ignoreMouseEvents: boolean;
	immediateClickMode: boolean;
	properties: unknown[];
	etching: unknown[];

	parent: IWindow | null;
	readonly context: IWindowContext;
	readonly desktop: IWindow | null;
	readonly host: IWindow;
	readonly limits: IRectLimiter;

	/**
	 * Returns the target window where layout children should be added.
	 *
	 * Compound elements (frames, tab contexts) override this to redirect
	 * children to their content container instead of themselves.
	 *
	 * @see FrameController.getLayoutChildTarget
	 * @see TabContextController.getLayoutChildTarget
	 */
	getLayoutChildTarget(): IWindow;

	destroy(): boolean;

	clone(): IWindow;

	invalidate(rect?: { x: number; y: number; width: number; height: number } | null): void;

	resolve(): number;

	center(): void;

	offset(dx: number, dy: number): void;

	scale(sx: number, sy: number): void;

	buildFromXML(layout: string | Document | Element, namedWindows?: Map<string, IWindow> | null): boolean;

	fetchDrawBuffer(): unknown;

	getDrawRegion(out: { x: number; y: number; width: number; height: number }): void;

	getRelativeMousePosition(out: { x: number; y: number }): void;

	getAbsoluteMousePosition(out: { x: number; y: number }): void;

	getMouseRegion(out: { x: number; y: number; width: number; height: number }): void;

	getLocalPosition(out: { x: number; y: number }): void;

	getLocalRectangle(out: { x: number; y: number; width: number; height: number }): void;

	hitTestLocalPoint(point: { x: number; y: number }): boolean;

	hitTestLocalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean;

	getGlobalPosition(out: { x: number; y: number }): void;

	setGlobalPosition(point: { x: number; y: number }): void;

	getGlobalRectangle(out: { x: number; y: number; width: number; height: number }): void;

	setGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): void;

	hitTestGlobalPoint(point: { x: number; y: number }): boolean;

	hitTestGlobalRectangle(rect: { x: number; y: number; width: number; height: number }): boolean;

	resolveVerticalScale(): number;

	resolveHorizontalScale(): number;

	convertPointFromLocalToGlobalSpace(point: { x: number; y: number }): void;

	convertPointFromGlobalToLocalSpace(point: { x: number; y: number }): void;

	findParentByName(name: string): IWindow | null;

	setStateFlag(flag: number, value?: boolean): void;

	getStateFlag(flag: number): boolean;

	testStateFlag(flag: number, mask?: number): boolean;

	setStyleFlag(flag: number, value?: boolean): void;

	getStyleFlag(flag: number): boolean;

	testStyleFlag(flag: number, mask?: number): boolean;

	setParamFlag(flag: number, value?: boolean): void;

	getParamFlag(flag: number): boolean;

	testParamFlag(flag: number, mask?: number): boolean;

	minimize(): boolean;

	maximize(): boolean;

	restore(): boolean;

	activate(): boolean;

	deactivate(): boolean;

	lock(): boolean;

	unlock(): boolean;

	enable(): boolean;

	disable(): boolean;

	isEnabled(): boolean;

	addEventListener(type: string, listener: Function, priority?: number): void;

	removeEventListener(type: string, listener: Function): void;

	hasEventListener(type: string): boolean;

	createProperty(key: string, value: unknown): PropertyStruct;

	getDefaultProperty(key: string): PropertyStruct | null;

	enableChildren(enable: boolean, exceptions: string[]): void;

	activateChildren(activate: boolean, exceptions: string[]): void;

	setVisibleChildren(visible: boolean, exceptions: string[]): void;

	toString(): string;
}
