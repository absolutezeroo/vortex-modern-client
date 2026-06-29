import type {IWindow} from './IWindow';
import type {IWindowParser} from './utils/IWindowParser';
import type {IResourceManager} from './IResourceManager';
import type {IDisposable} from "../runtime/IDisposable";
import type {IInputEventTracker} from './IInputEventTracker';
import type {IInternalWindowServices} from './services/IInternalWindowServices';
import type {IWindowFactory} from './IWindowFactory';
import type {IWidgetFactory} from './IWidgetFactory';
import type {ICoreLocalizationManager} from '../localization/ICoreLocalizationManager';

/**
 * Window context interface.
 *
 * A context represents a layer in which windows are created and managed.
 * Each layer has its own factory, parser, desktop, and event processing.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/IWindowContext.as
 */
export interface IWindowContext extends IDisposable
{
	inputEventTrackers: IInputEventTracker[];

	getWindowServices(): IInternalWindowServices;

	getWindowParser(): IWindowParser;

	getWindowFactory(): IWindowFactory;

	getWidgetFactory(): IWidgetFactory | null;

	getDesktopWindow(): IWindow | null;

	getResourceManager(): IResourceManager | null;

	setLocalizationManager(localization: ICoreLocalizationManager | null): void;

	registerLocalizationListener(key: string, window: IWindow): void;

	removeLocalizationListener(key: string, window: IWindow): void;

	findWindowByName(name: string): IWindow | null;

	findWindowByTag(tag: string): IWindow | null;

	groupChildrenWithTag(tag: string, result: IWindow[], depth?: number): number;

	create(
		name: string,
		caption: string,
		type: number,
		style: number,
		param: number,
		rect: { x: number; y: number; width: number; height: number } | null,
		procedure: ((event: unknown, window: IWindow) => void) | null,
		parent: IWindow | null,
		id: number,
		tags?: string[] | null,
		dynamicStyle?: string,
		properties?: unknown[] | null
	): IWindow;

	update(deltaTime: number): void;

	render(deltaTime: number): void;

	destroy(window: IWindow): boolean;

	invalidate(window: IWindow, rect: {
		x: number;
		y: number;
		width: number;
		height: number
	} | null, flags: number): void;

	getLastError(): Error | null;

	getLastErrorCode(): number;

	handleError(code: number, error: Error): void;

	flushError(): void;

	addMouseEventTracker(tracker: IInputEventTracker): void;

	removeMouseEventTracker(tracker: IInputEventTracker): void;
}
