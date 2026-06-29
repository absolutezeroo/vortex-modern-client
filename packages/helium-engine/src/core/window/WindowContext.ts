import type {IWindow} from './IWindow';
import type {IWindowContext} from './IWindowContext';
import type {IWindowFactory} from './IWindowFactory';
import type {IWidgetFactory} from './IWidgetFactory';
import type {IWindowParser} from './utils/IWindowParser';
import type {IWindowRenderer} from './graphics/IWindowRenderer';
import type {IInternalWindowServices} from './services/IInternalWindowServices';
import type {IInputEventTracker} from './IInputEventTracker';
import type {IResourceManager} from './IResourceManager';
import type {ICoreLocalizationManager} from '../localization/ICoreLocalizationManager';
import type {ILocalizable} from '../localization/ILocalizable';
import type {ILinkEventTracker} from '../runtime/events/ILinkEventTracker';
import {Classes} from './Classes';
import {SubstituteParentController} from './components/SubstituteParentController';
import {EventProcessorState} from './utils/EventProcessorState';
import {MouseEventProcessor} from './utils/MouseEventProcessor';
import {MouseEventQueue} from './utils/MouseEventQueue';

type WindowContextResizeHost = {
	width: number;
	height: number;
	addEventListener(type: string, listener: (event?: Event) => void): void;
	removeEventListener(type: string, listener: (event?: Event) => void): void;
};

const MIN_DESKTOP_SIZE = 10;

/**
 * Window context implementation.
 *
 * Represents a single rendering layer. Each context has its own desktop,
 * factory, parser, and service manager. The HabboWindowManagerComponent
 * creates 4 contexts (one per WindowContextLayer).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/WindowContext.as
 */
export class WindowContext implements IWindowContext
{
	public static readonly INPUT_MODE_MOUSE: number = 0;
	public static readonly INPUT_MODE_TOUCH: number = 1;
	public static readonly ERROR_UNKNOWN: number = 0;
	public static readonly ERROR_INVALID_WINDOW: number = 1;
	public static readonly ERROR_WINDOW_NOT_FOUND: number = 2;
	public static readonly ERROR_WINDOW_ALREADY_EXISTS: number = 3;
	public static readonly ERROR_UNKNOWN_WINDOW_TYPE: number = 4;
	public static readonly ERROR_DURING_EVENT_HANDLING: number = 5;
	public static inputEventQueue: MouseEventQueue | null = null;
	/**
	 * Shared renderer reference (AS3: static var_1836).
	 * Set by HabboWindowManager when the renderer is created.
	 */
	private static _renderer: IWindowRenderer | null = null;
	private static _inputEventProcessor: MouseEventProcessor | null = null;
	public inputEventTrackers: IInputEventTracker[] = [];
	protected _localization: ICoreLocalizationManager | null = null;
	protected _services: IInternalWindowServices | null = null;
	protected _parser: IWindowParser | null = null;
	protected _factory: IWindowFactory;
	protected _widgetFactory: IWidgetFactory | null = null;
	protected _desktop: IWindow | null = null;
	protected _substituteParent: IWindow | null = null;
	protected _resourceManager: IResourceManager | null = null;
	protected _throwErrors: boolean = true;
	protected _lastError: Error | null = null;
	protected _lastErrorCode: number = -1;
	protected _updating: boolean = false;
	protected _rendering: boolean = false;
	private _resizeHost: WindowContextResizeHost | null = null;
	private _resizeListener: ((event?: Event) => void) | null = null;
	private _isListeningToResizeHost: boolean = false;
	private readonly _initialDesktopRect: { x: number; y: number; width: number; height: number };
	private readonly _name: string;
	private _eventProcessorState: EventProcessorState;

	constructor(
		name: string,
		factory: IWindowFactory,
		rect?: { x: number; y: number; width: number; height: number } | null,
		resizeHost?: WindowContextResizeHost | null
	)
	{
		this._name = name;
		this._factory = factory;
		this._resizeHost = resizeHost ?? null;
		this._substituteParent = new SubstituteParentController(this);
		this._eventProcessorState = new EventProcessorState(
			WindowContext._renderer,
			null,
			null,
			null,
			null,
			null,
			this.inputEventTrackers
		);

		if (!rect)
		{
			rect = {x: 0, y: 0, width: 800, height: 600};
		}

		this._initialDesktopRect = rect;

		if (!WindowContext.inputEventQueue || !WindowContext._inputEventProcessor)
		{
			WindowContext.inputMode = WindowContext.INPUT_MODE_MOUSE;
		}

		// Desktop and parser are lazily initialized or set externally
	}

	private static _inputMode: number = WindowContext.INPUT_MODE_MOUSE;

	public static get inputMode(): number
	{
		return WindowContext._inputMode;
	}

	public static set inputMode(value: number)
	{
		if (WindowContext.inputEventQueue)
		{
			WindowContext.inputEventQueue.dispose();
			WindowContext.inputEventQueue = null;
		}

		if (WindowContext._inputEventProcessor)
		{
			WindowContext._inputEventProcessor.dispose();
			WindowContext._inputEventProcessor = null;
		}

		switch (value)
		{
			case WindowContext.INPUT_MODE_MOUSE:
				WindowContext.inputEventQueue = new MouseEventQueue();
				WindowContext._inputEventProcessor = new MouseEventProcessor();
				WindowContext._inputMode = value;
				break;
			case WindowContext.INPUT_MODE_TOUCH:
				// Touch pipeline is not ported yet; keep a functional queue/processor.
				WindowContext.inputEventQueue = new MouseEventQueue();
				WindowContext._inputEventProcessor = new MouseEventProcessor();
				WindowContext._inputMode = value;
				break;
			default:
				WindowContext.inputMode = WindowContext.INPUT_MODE_MOUSE;
				throw new Error(`Unknown input mode ${value}`);
		}
	}

	private _linkEventTrackers: ILinkEventTracker[] = [];

	public get linkEventTrackers(): ILinkEventTracker[]
	{
		return this._linkEventTrackers;
	}

	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	public get name(): string
	{
		return this._name;
	}

	/**
	 * Sets the shared window renderer for all contexts.
	 *
	 * @param renderer - The window renderer
	 */
	public static setRenderer(renderer: IWindowRenderer | null): void
	{
		WindowContext._renderer = renderer;
	}

	public setDesktop(desktop: IWindow): void
	{
		this._desktop = desktop;
		this._eventProcessorState.desktop = desktop;
		this.attachResizeHostListener();
		this.updateDesktopFromHostOrInitialRect();

		if (!this._eventProcessorState.hovered || this._eventProcessorState.hovered.disposed)
		{
			this._eventProcessorState.hovered = desktop;
		}
	}

	public setDesktopSize(width: number, height: number): void
	{
		if (!this._desktop)
		{
			return;
		}

		if (width < MIN_DESKTOP_SIZE || height < MIN_DESKTOP_SIZE)
		{
			return;
		}

		this._desktop.limits.maxWidth = width;
		this._desktop.limits.maxHeight = height;
		this._desktop.width = width;
		this._desktop.height = height;
	}

	private onResizeHost = (): void =>
	{
		if (!this._resizeHost)
		{
			return;
		}

		this.setDesktopSize(this._resizeHost.width, this._resizeHost.height);
	};

	private attachResizeHostListener(): void
	{
		if (this._isListeningToResizeHost || !this._resizeHost || this._resizeListener)
		{
			return;
		}

		this._resizeListener = this.onResizeHost;
		this._resizeHost.addEventListener('resize', this._resizeListener);
		this._isListeningToResizeHost = true;
	}

	private detachResizeHostListener(): void
	{
		if (!this._isListeningToResizeHost || !this._resizeHost || !this._resizeListener)
		{
			return;
		}

		this._resizeHost.removeEventListener('resize', this._resizeListener);
		this._isListeningToResizeHost = false;
		this._resizeListener = null;
	}

	private updateDesktopFromHostOrInitialRect(): void
	{
		if (!this._desktop)
		{
			return;
		}

		if (this._resizeHost)
		{
			this.setDesktopSize(this._resizeHost.width, this._resizeHost.height);
		}
		else
		{
			this.setDesktopSize(this._initialDesktopRect.width, this._initialDesktopRect.height);
		}
	}

	public setServices(services: IInternalWindowServices): void
	{
		this._services = services;
	}

	public setParser(parser: IWindowParser): void
	{
		this._parser = parser;
	}

	public setWidgetFactory(widgetFactory: IWidgetFactory): void
	{
		this._widgetFactory = widgetFactory;
	}

	public setResourceManager(resourceManager: IResourceManager): void
	{
		this._resourceManager = resourceManager;
	}

	public setLocalizationManager(localization: ICoreLocalizationManager | null): void
	{
		this._localization = localization;
	}

	public getResourceManager(): IResourceManager | null
	{
		return this._resourceManager;
	}

	public getWindowServices(): IInternalWindowServices
	{
		return this._services!;
	}

	public getWindowParser(): IWindowParser
	{
		return this._parser!;
	}

	public getWindowFactory(): IWindowFactory
	{
		return this._factory;
	}

	public getDesktopWindow(): IWindow | null
	{
		return this._desktop;
	}

	public getWidgetFactory(): IWidgetFactory | null
	{
		return this._widgetFactory;
	}

	public findWindowByName(name: string): IWindow | null
	{
		if (!this._desktop) return null;

		return (this._desktop as any).findChildByName?.(name) ?? null;
	}

	public findWindowByTag(tag: string): IWindow | null
	{
		if (!this._desktop) return null;

		return (this._desktop as any).findChildByTag?.(tag) ?? null;
	}

	public groupChildrenWithTag(tag: string, result: IWindow[], depth: number = 0): number
	{
		if (!this._desktop) return 0;

		return (this._desktop as any).groupChildrenWithTag?.(tag, result, depth) ?? 0;
	}

	public registerLocalizationListener(key: string, window: IWindow): void
	{
		if (!this._localization)
		{
			return;
		}

		this._localization.registerLocalizationListener(key, window as unknown as ILocalizable);
	}

	public removeLocalizationListener(key: string, window: IWindow): void
	{
		if (!this._localization)
		{
			return;
		}

		this._localization.removeLocalizationListener(key, window as unknown as ILocalizable);
	}

	public create(
		name: string,
		caption: string,
		type: number,
		style: number,
		param: number,
		rect: { x: number; y: number; width: number; height: number } | null,
		procedure: ((event: unknown, window: IWindow) => void) | null,
		parent: IWindow | null,
		id: number,
		tags: string[] | null = null,
		dynamicStyle: string = '',
		_properties: unknown[] | null = null
	): IWindow
	{
		const windowClass = Classes.getWindowClassByType(type);

		if (!windowClass)
		{
			this.handleError(
				WindowContext.ERROR_UNKNOWN_WINDOW_TYPE,
				new Error(`Failed to solve implementation for window "${name}"!`)
			);

			return null!;
		}

		if (!parent)
		{
			if (param & 0x10) // USE_PARENT_GRAPHIC_CONTEXT
			{
				parent = this._substituteParent;
			}
		}

		const window = new windowClass(
			name, type, style, param, this, rect,
			parent ?? this._desktop,
			procedure, tags, null, id, dynamicStyle
		) as unknown as IWindow;

		if (_properties && _properties.length > 0)
		{
			window.properties = _properties;
		}

		if (caption && caption.length > 0)
		{
			window.caption = caption;
		}

		return window;
	}

	public destroy(window: IWindow): boolean
	{
		if (window === this._desktop)
		{
			this._desktop = null;
		}

		if (window.state !== 0x40000000)
		{
			window.destroy();
		}

		return true;
	}

	public invalidate(window: IWindow, rect: {
		x: number;
		y: number;
		width: number;
		height: number
	} | null, flags: number): void
	{
		if (this._disposed) return;

		if (WindowContext._renderer)
		{
			WindowContext._renderer.addToRenderQueue(window, rect, flags);
		}
	}

	public update(_deltaTime: number): void
	{
		this._updating = true;

		if (this._lastError)
		{
			const error = this._lastError;
			this._lastError = null;
			this._updating = false;
			throw error;
		}

		if (WindowContext._inputEventProcessor && WindowContext.inputEventQueue)
		{
			this._eventProcessorState.renderer = WindowContext._renderer;
			this._eventProcessorState.desktop = this._desktop;
			this._eventProcessorState.eventTrackers = this.inputEventTrackers;

			if (!this._eventProcessorState.hovered || this._eventProcessorState.hovered.disposed)
			{
				this._eventProcessorState.hovered = this._desktop;
			}

			WindowContext._inputEventProcessor.process(this._eventProcessorState, WindowContext.inputEventQueue);
		}

		this._updating = false;
	}

	public render(_deltaTime: number): void
	{
		this._rendering = true;

		if (WindowContext._renderer)
		{
			WindowContext._renderer.render();
		}

		this._rendering = false;
	}

	public getLastError(): Error | null
	{
		return this._lastError;
	}

	public getLastErrorCode(): number
	{
		return this._lastErrorCode;
	}

	public handleError(code: number, error: Error): void
	{
		this._lastError = error;
		this._lastErrorCode = code;

		if (this._throwErrors)
		{
			throw error;
		}
	}

	public flushError(): void
	{
		this._lastError = null;
		this._lastErrorCode = -1;
	}

	public addMouseEventTracker(tracker: IInputEventTracker): void
	{
		if (this.inputEventTrackers.indexOf(tracker) < 0)
		{
			this.inputEventTrackers.push(tracker);
		}
	}

	public removeMouseEventTracker(tracker: IInputEventTracker): void
	{
		const index = this.inputEventTrackers.indexOf(tracker);

		if (index > -1)
		{
			this.inputEventTrackers.splice(index, 1);
		}
	}

	public dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
			this.detachResizeHostListener();

			if (this._desktop)
			{
				this._desktop.destroy();
				this._desktop = null;
			}

			if (this._parser)
			{
				this._parser.dispose();
				this._parser = null;
			}

			if (this._substituteParent)
			{
				this._substituteParent.destroy();
				this._substituteParent = null;
			}

			this._services = null;
			this._factory = null!;
			this._widgetFactory = null;
			this._resourceManager = null;
			this._localization = null;
			this.inputEventTrackers.length = 0;
			this._linkEventTrackers = [];
			this._eventProcessorState.desktop = null;
			this._eventProcessorState.hovered = null;
			this._eventProcessorState.lastClickTarget = null;
			this._eventProcessorState.lastMouseDownTarget = null;
			this._eventProcessorState.lastClickAwayTarget = null;
			this._eventProcessorState.eventTrackers = this.inputEventTrackers;
		}
	}
}
