import {EventEmitter} from 'eventemitter3';
import {Component} from '@core/runtime/Component';
import {Logger} from '@core/utils/Logger';
import {WindowLayoutParser} from './WindowLayoutParser';
import {ElementRegistry} from './ElementRegistry';
import {WindowContextLayer} from './enum/WindowContextLayer';
import {HabboWindowTrackingEvent} from './enum/HabboWindowTrackingEvent';
import type {IHabboWindowManager} from './IHabboWindowManager';
import {WindowManagerEvents} from './IHabboWindowManager';
import type {IWindowInstance} from './IWindowInstance';
import type {IWindowLayout} from './IWindowLayout';
import type {IElementDescriptionData} from './IElementDescriptor';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContext} from '@core/window/IWindowContext';
import type {IInputEventTracker} from '@core/window/IInputEventTracker';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindowFactory} from '@core/window/IWindowFactory';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IWidget} from '@core/window/IWidget';
import type {IThemeManager} from '@core/window/theme/IThemeManager';
import {WindowContext} from '@core/window/WindowContext';
import {Classes} from '@core/window/Classes';
import {WindowType} from '@core/window/enum/WindowType';
import {DesktopController} from '@core/window/components/DesktopController';
import {WindowParser} from '@core/window/utils/WindowParser';
import {MouseCursorControl} from '@core/window/utils/MouseCursorControl';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {SkinContainer} from '@core/window/graphics/SkinContainer';
import {WindowComposite} from '@core/window/graphics/WindowComposite';
import {WindowRenderer} from '@core/window/graphics/WindowRenderer';
import {FillSkinRenderer} from '@core/window/graphics/renderer/FillSkinRenderer';
import {NullSkinRenderer} from '@core/window/graphics/renderer/NullSkinRenderer';
import type {ISkinRenderer} from '@core/window/graphics/renderer/ISkinRenderer';
import type {ISkinData} from '@core/window/graphics/renderer/BitmapSkinParser';
import {BitmapSkinParser} from '@core/window/graphics/renderer/BitmapSkinParser';
import {DefaultAttStruct} from '@core/window/utils/DefaultAttStruct';
import {ThemeManager} from './theme/ThemeManager';
import {ServiceManager} from '@core/window/services/ServiceManager';
import {HabboWidgetFactory} from './HabboWidgetFactory';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import {ErrorReportStorage} from '@core/utils/ErrorReportStorage';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IContext} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IModalDialog} from './utils/IModalDialog';
import {ModalDialog} from './utils/ModalDialog';
import {ResourceManager} from './ResourceManager';
import {HintManager} from './HintManager';
import type {AlertDialogCallback, IAlertDialog} from './utils/AlertDialog';
import {AlertDialog} from './utils/AlertDialog';
import type {IAlertDialogWithLink} from './utils/AlertDialogWithLink';
import {AlertDialogWithLink} from './utils/AlertDialogWithLink';
import type {IConfirmDialog} from './utils/ConfirmDialog';
import {ConfirmDialog} from './utils/ConfirmDialog';
import {SimpleAlertDialog} from './utils/SimpleAlertDialog';
import {HabbletLinkHandler} from './handlers/HabbletLinkHandler';
import {ElementPointerHandler} from './utils/ElementPointerHandler';

const log = Logger.getLogger('HabboWindowManager');

/**
 * Habbo Window Manager Component.
 *
 * Manages the lifecycle of declarative windows AND provides the AS3-compatible
 * ICoreWindowManager + IHabboWindowManager API. This is the central orchestrator
 * of the window system.
 *
 * In AS3, this class extended Component and implemented IHabboWindowManager,
 * ICoreWindowManager, IWindowFactory, IUpdateReceiver, IInputEventTracker,
 * and IWidgetFactory. It managed 4 WindowContexts (one per layer), a
 * WindowRenderer, SkinContainer, ThemeManager, and ResourceManager.
 *
 * Uses a separate `_windowEvents` emitter (NOT `events`) to avoid
 * the Component DI override bug.
 *
 * @see sources/win63_2021_version/com/sulake/habbo/window/HabboWindowManagerComponent.as
 */
export class HabboWindowManager extends Component implements IHabboWindowManager
{
	private static readonly NUMBER_OF_CONTEXT_LAYERS: number = 4;
	private static readonly DEFAULT_CONTEXT_LAYER_INDEX: number = 1;

	private _windows: Map<number, IWindowInstance> = new Map();
	private _layouts: Map<string, IWindowLayout> = new Map();
	private _nextId: number = 1;
	private _skinContainer: SkinContainer = new SkinContainer();
	private _themeManager: ThemeManager | null = null;
	private _windowContextArray: IWindowContext[] = [];
	private _defaultContext: IWindowContext | null = null;

	private _widgetLayouts: Map<string, string> = new Map();

	private _windowRenderer: WindowRenderer | null = null;
	private _windowComposite: WindowComposite | null = null;
	private _serviceManager: ServiceManager | null = null;
	private _widgetFactory: HabboWidgetFactory | null = null;
	private _hintManager: HintManager | null = null;
	private _configuration: IHabboConfigurationManager | null = null;
	private _habbletLinkHandler: HabbletLinkHandler | null = null;
	private _elementPointerHandler: ElementPointerHandler | null = null;
	private _initialized: boolean = false;

	constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, flags, assetLibrary);
	}

	private _resourceManager: ResourceManager | null = null;

	/**
	 * ResourceManager accessor (AS3 parity).
	 */
	public get resourceManager(): ResourceManager | null
	{
		return this._resourceManager;
	}

	private _localization: IHabboLocalizationManager | null = null;

	/**
	 * Localization accessor (AS3 parity).
	 */
	public get localization(): IHabboLocalizationManager | null
	{
		return this._localization;
	}

	private _sessionDataManager: ISessionDataManager | null = null;

	/**
	 * SessionDataManager accessor (AS3 parity).
	 */
	public get sessionDataManager(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	private _roomEngine: IRoomEngine | null = null;

	/**
	 * RoomEngine accessor (AS3 parity).
	 */
	public get roomEngine(): IRoomEngine | null
	{
		return this._roomEngine;
	}

	private _habboPagesStyleSheet: unknown | null = null;

	/**
	 * Habbopedia stylesheet accessor (AS3 parity).
	 */
	public get habboPagesStyleSheet(): unknown | null
	{
		return this._habboPagesStyleSheet;
	}

	private _avatarRenderer: IAvatarRenderManager | null = null;

	/**
	 * The avatar render manager.
	 *
	 * In AS3: HabboWindowManagerComponent.avatarRenderer
	 */
	public get avatarRenderer(): IAvatarRenderManager | null
	{
		return this._avatarRenderer;
	}

	private _communication: IHabboCommunicationManager | null = null;

	/**
	 * The communication manager.
	 *
	 * In AS3: HabboWindowManagerComponent.communication
	 */
	public get communication(): IHabboCommunicationManager | null
	{
		return this._communication;
	}

	private _windowEvents: EventEmitter = new EventEmitter();

	/**
	 * Event emitter for window lifecycle events.
	 */
	get windowEvents(): EventEmitter
	{
		return this._windowEvents;
	}

	private _elementRegistry: ElementRegistry = new ElementRegistry();

	/**
	 * The element registry.
	 */
	get elementRegistry(): ElementRegistry
	{
		return this._elementRegistry;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return super.dependencies.concat([
			new ComponentDependency(
				IID_SessionDataManager,
				(manager: ISessionDataManager | null) =>
				{
					this._sessionDataManager = manager;
				},
				false
			),
			new ComponentDependency(
				IID_HabboLocalizationManager,
				(manager: IHabboLocalizationManager | null) =>
				{
					this._localization = manager;
					WindowParser.localizationResolver = manager
						? ((key: string) => manager.getLocalization(key, key))
						: null;

					for (const context of this._windowContextArray)
					{
						context.setLocalizationManager(manager);
					}
				},
				true
			),
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(manager: IHabboConfigurationManager | null) =>
				{
					this._configuration = manager;
				},
				false,
				[
					{
						type: 'complete',
						callback: () => this.onConfigurationComplete(),
					},
				]
			),
			new ComponentDependency(
				IID_AvatarRenderManager,
				(renderer: IAvatarRenderManager | null) =>
				{
					this._avatarRenderer = renderer;
				},
				false
			),
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this.setCommunicationManager(manager);
				},
				false
			),
			new ComponentDependency(
				IID_RoomEngine,
				(engine: IRoomEngine | null) =>
				{
					this._roomEngine = engine;
				},
				false
			),
		]);
	}

	/**
	 * Load element description data into the registry.
	 */
	loadElementDescription(data: IElementDescriptionData): void
	{
		this._elementRegistry.load(data);

		// Populate SkinContainer from element descriptors
		for (const element of data.elements)
		{
			if (element.typeId < 0) continue;

			const defaults = new DefaultAttStruct(
				element.defaults.blend,
				element.defaults.threshold,
				element.defaults.background,
				element.defaults.color,
				element.defaults.widthMin,
				element.defaults.widthMax,
				element.defaults.heightMin,
				element.defaults.heightMax
			);

			const rendererType = element.renderer || 'null';
			const rendererName = `${element.typeId}_${element.style}`;
			const renderer = rendererType === 'fill'
				? new FillSkinRenderer(rendererName)
				: new NullSkinRenderer(rendererName);

			this._skinContainer.addSkinRenderer(
				element.typeId,
				element.style,
				element.intent,
				renderer,
				null,
				defaults
			);
		}

		// Create ThemeManager now that SkinContainer is populated
		this._themeManager = new ThemeManager(this._skinContainer);

		log.info(`Element registry loaded: ${data.elements.length} descriptors, ThemeManager initialized`);
	}

	/**
	 * Register a layout by name.
	 */
	registerLayout(name: string, layout: IWindowLayout): void
	{
		this._layouts.set(name, layout);
		log.debug(`Layout registered: ${name}`);
	}

	/**
	 * Get a registered layout by name.
	 */
	getLayout(name: string): IWindowLayout | null
	{
		return this._layouts.get(name) ?? null;
	}

	/**
	 * Open a window from a layout.
	 */
	openWindow(layout: IWindowLayout, vars?: Record<string, unknown>, layer: number = WindowContextLayer.DEFAULT): IWindowInstance
	{
		const resolvedTree = WindowLayoutParser.resolve(layout, vars);

		const instance: IWindowInstance = {
			id: this._nextId++,
			layoutName: layout.name,
			layer,
			layoutTree: resolvedTree,
			visible: true,
			zOrder: this.getMaxZOrder(layer) + 1,
			vars: vars ?? {},
		};

		this._windows.set(instance.id, instance);

		log.debug(`Window opened: ${layout.name} (id=${instance.id}, layer=${layer})`);

		this._windowEvents.emit(WindowManagerEvents.WINDOW_OPEN, instance);

		return instance;
	}

	/**
	 * Close a window by ID.
	 */
	closeWindow(id: number): void
	{
		const instance = this._windows.get(id);

		if (!instance) return;

		this._windows.delete(id);

		log.debug(`Window closed: ${instance.layoutName} (id=${id})`);

		this._windowEvents.emit(WindowManagerEvents.WINDOW_CLOSE, instance);
	}

	/**
	 * Get a window by ID.
	 */
	getWindow(id: number): IWindowInstance | null
	{
		return this._windows.get(id) ?? null;
	}

	/**
	 * Get all open windows, optionally filtered by layer.
	 */
	getWindows(layer?: number): IWindowInstance[]
	{
		const all = Array.from(this._windows.values());

		if (layer !== undefined)
		{
			return all.filter((w) => w.layer === layer);
		}

		return all;
	}

	/**
	 * Create a window using the core factory.
	 *
	 * In AS3: create(name, type, style, param, rect, procedure, dynamicStyle, id, tags, parent, properties)
	 * Delegates to the default context layer.
	 */
	public create(
		name: string,
		type: number,
		style: number,
		param: number,
		rect: { x: number; y: number; width: number; height: number },
		procedure?: ((event: unknown, window: IWindow) => void) | null,
		dynamicStyle?: string,
		id?: number,
		tags?: string[] | null,
		parent?: IWindow | null,
		properties?: unknown[] | null
	): IWindow
	{
		return this._defaultContext!.create(
			name, '', type, style, param, rect,
			procedure ?? null, parent ?? null,
			id ?? 0, tags ?? null, dynamicStyle ?? '', properties ?? null
		);
	}

	/**
	 * Destroy a window.
	 */
	public destroy(window: IWindow): void
	{
		window.destroy();
	}

	/**
	 * AS3-compatible parser serialization.
	 */
	public windowToXMLString(window: IWindow): string
	{
		if (!this._defaultContext)
		{
			return '';
		}

		return this._defaultContext.getWindowParser().windowToXMLString(window);
	}

	/**
	 * Build a window tree from an XML layout definition.
	 */
	public buildFromXML(xml: string | Document | Element, layer: number = 1, _vars?: Map<string, string> | null): IWindow
	{
		const context = this.getWindowContext(layer);
		const parser = context.getWindowParser();
		const desktop = context.getDesktopWindow();

		if (parser && desktop)
		{
			return parser.parseAndConstruct(xml, desktop, null) as IWindow;
		}

		throw new Error('Window parser or desktop not available');
	}

	/**
	 * Show a notify dialog.
	 */
	public notify(
		title: string,
		message: string,
		callback: AlertDialogCallback | null,
		flags: number = 0
	): IAlertDialog
	{
		return this.alert(title, message, flags, callback);
	}

	/**
	 * Show an alert dialog.
	 */
	public alert(
		title: string,
		message: string,
		flags: number,
		callback: AlertDialogCallback | null
	): IAlertDialog
	{
		const layout = this.requireWidgetLayout('habbo_window_alert', 'alert dialog');

		return new AlertDialog(this, layout, title, message, flags, callback, false);
	}

	/**
	 * Show a modal alert dialog.
	 */
	public alertWithModal(
		title: string,
		message: string,
		flags: number,
		callback: AlertDialogCallback | null
	): IAlertDialog
	{
		const layout = this.requireWidgetLayout('habbo_window_alert', 'alert dialog');

		return new AlertDialog(this, layout, title, message, flags, callback, true);
	}

	/**
	 * Show an alert dialog with link.
	 */
	public alertWithLink(
		title: string,
		message: string,
		linkTitle: string,
		linkUrl: string,
		flags: number,
		callback: AlertDialogCallback | null
	): IAlertDialogWithLink
	{
		const layout = this.requireWidgetLayout('habbo_window_alert_link', 'alert link dialog');

		return new AlertDialogWithLink(this, layout, title, message, linkTitle, linkUrl, flags, callback);
	}

	/**
	 * Show a confirm dialog.
	 */
	public confirm(
		title: string,
		message: string,
		flags: number,
		callback: AlertDialogCallback | null
	): IConfirmDialog
	{
		const layout = this.requireWidgetLayout('habbo_window_confirm', 'confirm dialog');

		return new ConfirmDialog(this, layout, title, message, flags, callback, false);
	}

	/**
	 * Show a modal confirm dialog.
	 */
	public confirmWithModal(
		title: string,
		message: string,
		flags: number,
		callback: AlertDialogCallback | null
	): IConfirmDialog
	{
		const layout = this.requireWidgetLayout('habbo_window_confirm', 'confirm dialog');

		return new ConfirmDialog(this, layout, title, message, flags, callback, true);
	}

	/**
	 * Register a widget layout XML asset by name.
	 *
	 * @param name - The layout asset name (e.g. "hover_bitmap", "avatar_image")
	 * @param xml - The XML layout source
	 */
	public registerWidgetLayout(name: string, xml: string): void
	{
		this._widgetLayouts.set(name, xml);
	}

	/**
	 * Build a widget's internal window tree from a registered layout asset.
	 *
	 * Equivalent to AS3:
	 * `buildFromXML(assets.getAssetByName("widget_xml").content as XML)`
	 *
	 * @param name - The layout asset name
	 * @param layer - Context layer (default 1)
	 * @returns The root IWindow of the built tree, or null
	 */
	public buildWidgetLayout(name: string, layer: number = 1): IWindow | null
	{
		const xml = this._widgetLayouts.get(name);

		if (!xml)
		{
			log.warn(`Widget layout not found: ${name}`);

			return null;
		}

		return this.buildFromXML(xml, layer);
	}

	/**
	 * Build a modal dialog from an XML layout definition.
	 *
	 * Creates a dimmed background overlay and a centered content
	 * window. Delegates to ModalDialog which manages the shared
	 * modal container.
	 *
	 * In AS3: buildModalDialogFromXML(xml: XML): IModalDialog
	 */
	public buildModalDialogFromXML(xml: string): IModalDialog
	{
		return new ModalDialog(this, xml);
	}

	/**
	 * Create a window by name, type, style, param in a given context layer.
	 *
	 * In AS3: createWindow(name, caption, type, style, param, rect, procedure, id, layer, dynamicStyle)
	 */
	public createWindow(
		name: string,
		caption: string = '',
		type: number = 0,
		style: number = 0,
		param: number = 0,
		rect: { x: number; y: number; width: number; height: number } | null = null,
		procedure: ((event: unknown, window: IWindow) => void) | null = null,
		id: number = 0,
		layer: number = 1,
		dynamicStyle: string = ''
	): IWindow
	{
		return this._windowContextArray[layer].create(
			name, caption, type, style, param, rect,
			procedure, null, id, null, dynamicStyle, null
		);
	}

	/**
	 * Remove a window by name from a context layer.
	 */
	public removeWindow(name: string, layer: number = 1): void
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return;

		const child = (desktop as IWindowContainer).getChildByName?.(name) ?? null;

		if (child)
		{
			child.destroy();
		}
	}

	/**
	 * Get a window by name from a context layer.
	 */
	public getWindowByName(name: string, layer: number = 1): IWindow | null
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return null;

		return (desktop as IWindowContainer).getChildByName?.(name) ?? null;
	}

	/**
	 * Get the topmost active window in a context layer.
	 */
	public getActiveWindow(layer: number = 1): IWindow | null
	{
		const desktop = this._windowContextArray[layer]?.getDesktopWindow();

		if (!desktop) return null;

		const container = desktop as IWindowContainer;
		const activeDesktop = this._defaultContext?.getDesktopWindow() as IWindowContainer | null;
		const requestedIndex = (activeDesktop?.numChildren ?? container.numChildren) - 1;
		const count = container.numChildren;

		if (count <= 0) return null;

		if ((requestedIndex < 0) || (requestedIndex >= count))
		{
			return container.getChildAt(count - 1);
		}

		return container.getChildAt(requestedIndex);
	}

	/**
	 * Toggle fullscreen mode.
	 */
	public toggleFullScreen(): void
	{
		if (document.fullscreenElement)
		{
			document.exitFullscreen();
		}
		else
		{
			document.documentElement.requestFullscreen();
		}
	}

	/**
	 * Get a window context by layer index.
	 */
	public getWindowContext(layer: number): IWindowContext
	{
		return this._windowContextArray[layer];
	}

	/**
	 * Get the desktop window for a given context layer.
	 */
	public getDesktop(layer: number): IWindow | null
	{
		const context = this._windowContextArray[layer];

		return context ? context.getDesktopWindow() : null;
	}

	/**
	 * Search for a window by name across all context layers.
	 */
	public findWindowByName(name: string): IWindow | null
	{
		for (const context of this._windowContextArray)
		{
			const found = context.findWindowByName(name);

			if (found) return found;
		}

		return null;
	}

	/**
	 * Search for a window by tag across all context layers.
	 */
	public findWindowByTag(tag: string): IWindow | null
	{
		for (const context of this._windowContextArray)
		{
			const found = context.findWindowByTag(tag);

			if (found) return found;
		}

		return null;
	}

	/**
	 * Group windows with a matching tag across contexts.
	 */
	public groupWindowsWithTag(tag: string, windows: IWindow[], depth: number = 0): number
	{
		let count = 0;

		for (const context of this._windowContextArray)
		{
			count += context.groupChildrenWithTag(tag, windows, depth);
		}

		return count;
	}

	/**
	 * Add an input event tracker to all context layers.
	 */
	public addMouseEventTracker(tracker: IInputEventTracker): void
	{
		for (const context of this._windowContextArray)
		{
			context.addMouseEventTracker(tracker);
		}
	}

	/**
	 * Remove an input event tracker from all context layers.
	 */
	public removeMouseEventTracker(tracker: IInputEventTracker): void
	{
		for (const context of this._windowContextArray)
		{
			context.removeMouseEventTracker(tracker);
		}
	}

	/**
	 * Input event tracker callback.
	 *
	 * Mirrors AS3 behavior by storing click/mouse-up metadata for crash reports.
	 */
	public eventReceived(event: WindowEvent, window: IWindow): void
	{
		if (!window)
		{
			return;
		}

		if (event.type === WindowMouseEvent.CLICK)
		{
			ErrorReportStorage.setDebugData('click_time', Date.now().toString());
			ErrorReportStorage.setDebugData('click_target', `${window.name}: ${window.toString()}`);
		}
		else if (event.type === WindowMouseEvent.UP)
		{
			ErrorReportStorage.setDebugData('mouse_up_time', Date.now().toString());
			ErrorReportStorage.setDebugData('mouse_up_target', `${window.name}: ${window.toString()}`);
		}
	}

	/**
	 * Register a localization parameter.
	 */
	public registerLocalizationParameter(key: string, parameter: string, value: string, delimiter: string = '%'): void
	{
		this._localization?.registerParameter(key, parameter, value, delimiter);
	}

	/**
	 * Interpolates a string against runtime configuration values.
	 *
	 * AS3 ResourceManager resolves asset names through
	 * HabboWindowManagerComponent.interpolate().
	 */
	public interpolate(value: string): string
	{
		return this.context.configuration?.interpolate(value) ?? value;
	}

	/**
	 * Create an unseen item counter widget.
	 */
	public createUnseenItemCounter(): IWindowContainer | null
	{
		return this.buildWidgetLayout('unseen_item_counter') as IWindowContainer | null;
	}

	/**
	 * Create a widget by type identifier.
	 */
	public createWidget(type: string, window: IWidgetWindow): IWidget | null
	{
		const widget = this._widgetFactory?.createWidget(type, window) ?? null;

		if (!widget)
		{
			throw new Error(`Unknown widget type ${type}! You might need to update Glaze to be able to work on this layout.`);
		}

		return widget as IWidget;
	}

	/**
	 * Register a hint window.
	 */
	public registerHintWindow(hintId: string, window: IWindow, direction: number = 1): void
	{
		this._hintManager?.registerWindow(hintId, window, direction);
	}

	/**
	 * Unregister a hint window.
	 */
	public unregisterHintWindow(hintId: string): void
	{
		this._hintManager?.unregisterWindow(hintId);
	}

	/**
	 * Show a hint by ID.
	 */
	public showHint(hintId: string, rect?: { x: number; y: number; width: number; height: number } | null): void
	{
		this._hintManager?.showHint(hintId, rect);
	}

	/**
	 * Hide the current hint.
	 */
	public hideHint(): void
	{
		this._hintManager?.hideHint();
	}

	/**
	 * Hide a hint matching the given ID.
	 */
	public hideMatchingHint(hintId: string): void
	{
		this._hintManager?.hideMatchingHint(hintId);
	}

	/**
	 * Show a simple alert dialog.
	 */
	public simpleAlert(
		title: string,
		message: string,
		subtitle: string,
		linkCaption: string | null = null,
		linkUrl: string | null = null,
		parameters: Map<string, string> | null = null,
		illustrationUrl: string | null = null,
		linkClickCallback: (() => void) | null = null,
		closeCallback: (() => void) | null = null
	): void
	{
		new SimpleAlertDialog(
			this,
			title,
			message,
			subtitle,
			linkCaption,
			linkUrl,
			parameters,
			illustrationUrl,
			linkClickCallback,
			closeCallback
		);
	}

	// AS3: sources/win63_version/habbo/window/HabboWindowManagerComponent.as::openHelpPage()
	// TODO(AS3): AS3 opens HabboPagesViewer with the given page ID
	// sources/win63_version/habbo/window/HabboWindowManagerComponent.as::openHelpPage()
	public openHelpPage(_pageId: string): void
	{
		// HabboPagesViewer integration - to be connected
	}

	// AS3: sources/win63_version/habbo/window/HabboWindowManagerComponent.as::displayFloorPlanEditor()
	// TODO(AS3): AS3 opens BCFloorPlanEditor
	// sources/win63_version/habbo/window/HabboWindowManagerComponent.as::displayFloorPlanEditor()
	public displayFloorPlanEditor(): void
	{
		// BCFloorPlanEditor integration - to be connected
	}

	/**
	 * Per-frame window update.
	 *
	 * Mirrors AS3 update ordering:
	 * - Process input/update from top-most context to bottom
	 * - Render from bottom context to top-most
	 */
	// AS3: sources/win63_version/habbo/window/HabboWindowManagerComponent.as::update()
	public update(deltaTime: number): void
	{
		// AS3: only emits TRACKING_EVENT_INPUT when there are queued input events
		if(WindowContext.inputEventQueue && WindowContext.inputEventQueue.length > 0)
		{
			this.events.emit(HabboWindowTrackingEvent.HABBO_WINDOW_TRACKING_EVENT_INPUT);
		}

		for (let i = this._windowContextArray.length - 1; i >= 0; i--)
		{
			this._windowContextArray[i].update(deltaTime);
		}

		this.events.emit(HabboWindowTrackingEvent.HABBO_WINDOW_TRACKING_EVENT_RENDER);

		for (let i = 0; i < this._windowContextArray.length; i++)
		{
			this._windowContextArray[i].render(deltaTime);
		}

		WindowContext.inputEventQueue?.flush();

		MouseCursorControl.change();
		this.events.emit(HabboWindowTrackingEvent.HABBO_WINDOW_TRACKING_EVENT_SLEEP);
	}

	public override purge(): void
	{
		super.purge();
		this._windowRenderer?.purge();
	}

	/**
	 * Composites all window layers into a single OffscreenCanvas buffer.
	 *
	 * Delegates to WindowComposite.composite() with the full context array.
	 *
	 * @param width - The target buffer width
	 * @param height - The target buffer height
	 * @returns The composited buffer, or null if renderer is unavailable
	 */
	public compositeToBuffer(width: number, height: number): OffscreenCanvas | null
	{
		if(!this._windowRenderer || !this._windowComposite) return null;

		// Process the render queue first (AS3: context.render() → renderer.render())
		this._windowRenderer.render();

		return this._windowComposite.composite(this._windowContextArray, width, height);
	}

	/**
	 * Finds the deepest visible window at the given screen point.
	 *
	 * Delegates to WindowComposite.findWindowAtPoint() with the full context array.
	 *
	 * @param x - The global X coordinate
	 * @param y - The global Y coordinate
	 * @returns The deepest window at the point, or null
	 */
	public findWindowAtPoint(x: number, y: number): IWindow | null
	{
		if (!this._windowComposite) return null;

		return this._windowComposite.findWindowAtPoint(this._windowContextArray, x, y);
	}

	/**
	 * Returns the shared service manager for mouse drag/scale operations.
	 *
	 * Used by the client renderer to forward DOM mouse events.
	 */
	public getServiceManager(): ServiceManager | null
	{
		return this._serviceManager;
	}

	/**
	 * Returns the theme manager.
	 *
	 * @returns The theme manager instance
	 */
	public getThemeManager(): IThemeManager
	{
		return this._themeManager!;
	}

	/**
	 * Registers a bitmap asset with the resource manager.
	 *
	 * Called by the client layer after loading images. Assets registered
	 * here are available to StaticBitmapWrapperController via `assetUri`.
	 *
	 * @param name - The asset name
	 * @param bitmap - The decoded ImageBitmap
	 */
	public registerAsset(name: string, bitmap: ImageBitmap): void
	{
		if (this._resourceManager)
		{
			this._resourceManager.registerAsset(name, bitmap);
		}
	}

	/**
	 * Registers an asset URL for lazy loading.
	 *
	 * @param name - The asset name
	 * @param url - The URL to fetch the image from
	 */
	public registerAssetUrl(name: string, url: string): void
	{
		if (this._resourceManager)
		{
			this._resourceManager.registerAssetUrl(name, url);
		}
	}

	/**
	 * Returns the default attributes for a given window type and style.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The default attributes, or null
	 */
	public getDefaultsByTypeAndStyle(type: number, style: number): DefaultAttStruct | null
	{
		return this._skinContainer.getDefaultAttributesByTypeAndStyle(type, style);
	}

	/**
	 * Returns the skin renderer for a given window type/style.
	 */
	public getRendererByTypeAndStyle(type: number, style: number): ISkinRenderer | null
	{
		return this._skinContainer.getSkinRendererByTypeAndStyle(type, style);
	}

	/**
	 * Returns the window layout for a given type and style.
	 *
	 * First checks the SkinContainer (populated during skin loading), then
	 * falls back to the element descriptor's windowLayout reference resolved
	 * against the registered widget layouts.
	 *
	 * @param type - The window type
	 * @param style - The window style
	 * @returns The layout object, or null
	 */
	public getLayoutByTypeAndStyle(type: number, style: number): string | null
	{
		const layout = this._skinContainer.getWindowLayoutByTypeAndStyle(type, style);

		if(layout) return layout;

		// Fall back: resolve via element descriptor's windowLayout reference
		const descriptor = this._elementRegistry.getDescriptor(type, style);

		if(descriptor?.windowLayout)
		{
			return this._widgetLayouts.get(descriptor.windowLayout) ?? null;
		}

		return null;
	}

	/**
	 * Returns the skin container.
	 *
	 * @returns The skin container instance
	 */
	public getSkinContainer(): SkinContainer
	{
		return this._skinContainer;
	}

	/**
	 * Returns the window renderer.
	 *
	 * @returns The window renderer instance, or null
	 */
	public getWindowRenderer(): WindowRenderer | null
	{
		return this._windowRenderer;
	}

	/**
	 * Loads skin assets and creates BitmapSkinRenderers from skin XML data.
	 *
	 * For each skin JSON, the parser creates a BitmapSkinRenderer with all
	 * templates, layouts, and state mappings. The renderer is then registered
	 * in the SkinContainer, replacing the NullSkinRenderer placeholder
	 * created during loadElementDescription().
	 *
	 * The skin map is keyed by the skin's `id` field (e.g. "habbo_skin_frame"),
	 * which matches the element descriptor's `asset` field.
	 *
	 * @param skins - Map of skin id → skin JSON data
	 * @param atlases - Map of atlas asset name → ImageBitmap
	 */
	public loadSkinAssets(skins: Map<string, ISkinData>, atlases: Map<string, ImageBitmap>): void
	{
		// Create the window renderer now that we have skins
		if (!this._windowRenderer)
		{
			this._windowRenderer = new WindowRenderer(this._skinContainer);
			this._windowComposite = new WindowComposite((window: IWindow) => this._windowRenderer?.getDrawBufferForRenderable(window) ?? null);

			// Connect renderer to all WindowContexts (AS3: static var_1836)
			WindowContext.setRenderer(this._windowRenderer);
		}

		let loaded = 0;

		for (const [skinId, skinData] of skins)
		{
			// Find all element descriptors that reference this skin asset
			const descriptors = this._elementRegistry.getDescriptorsByAsset(skinId);

			if (descriptors.length === 0)
			{
				continue;
			}

			// Cache renderers by layout filter to avoid re-parsing identical configs.
			// AS3 creates a separate renderer per descriptor, filtered to its layout.
			const rendererCache = new Map<string, ReturnType<typeof BitmapSkinParser.parse>>();

			for (const descriptor of descriptors)
			{
				const defaults = this._skinContainer.getDefaultAttributesByTypeAndStyle(descriptor.typeId, descriptor.style);

				if (defaults)
				{
					const layoutFilter = (descriptor.layout && descriptor.layout !== 'null') ? descriptor.layout : '';
					let renderer = rendererCache.get(layoutFilter);

					if (!renderer)
					{
						renderer = BitmapSkinParser.parse(skinData, atlases, layoutFilter);
						rendererCache.set(layoutFilter, renderer);
					}

					this._skinContainer.addSkinRenderer(
						descriptor.typeId,
						descriptor.style,
						descriptor.intent,
						renderer,
						null,
						defaults
					);

					loaded++;
				}
			}
		}

		log.info(`Skin assets loaded: ${loaded} renderers registered from ${skins.size} skins`);
	}

	/**
	 * Dispose the window manager.
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this.removeUpdateReceiver(this);
		this.removeMouseEventTracker(this);
		this._disposed = true;

		if (this._habbletLinkHandler)
		{
			this.context.removeLinkEventTracker(this._habbletLinkHandler);
			this._habbletLinkHandler.dispose();
			this._habbletLinkHandler = null;
		}

		if (this._elementPointerHandler)
		{
			this._elementPointerHandler.dispose();
			this._elementPointerHandler = null;
		}

		// Dispose window contexts
		for (const context of this._windowContextArray)
		{
			context.dispose();
		}

		this._windowContextArray.length = 0;
		this._defaultContext = null;

		// Clean up service manager
		if (this._serviceManager)
		{
			this._serviceManager.dispose();
			this._serviceManager = null;
		}

		this._widgetFactory = null;

		if(this._windowComposite)
		{
			this._windowComposite.dispose();
			this._windowComposite = null;
		}

		if(this._windowRenderer)
		{
			this._windowRenderer.dispose();
			this._windowRenderer = null;
			WindowContext.setRenderer(null);
		}

		// Clean up resource manager
		if (this._resourceManager)
		{
			this._resourceManager.dispose();
			this._resourceManager = null;
		}

		if (this._hintManager)
		{
			this._hintManager.dispose();
			this._hintManager = null;
		}

		// Clean up skin container and theme manager
		this._skinContainer.dispose();
		this._themeManager = null;

		// Clean up widget layouts
		this._widgetLayouts.clear();

		// Clean up component dependencies
		this._avatarRenderer = null;
		this._communication = null;
		this._configuration = null;
		this._localization = null;
		this._sessionDataManager = null;
		this._roomEngine = null;
		this._habboPagesStyleSheet = null;
		WindowParser.localizationResolver = null;

		// Clean up declarative window system
		this._windows.clear();
		this._layouts.clear();
		this._windowEvents.removeAllListeners();
		this._elementRegistry.dispose();

		super.dispose();
	}

	protected override initComponent(): void
	{
		this.initContexts();
		this.addMouseEventTracker(this);
		this.registerUpdateReceiver(this, 0);

		if (!this._habbletLinkHandler)
		{
			this._habbletLinkHandler = new HabbletLinkHandler(this);
			this.context.addLinkEventTracker(this._habbletLinkHandler);
		}

		if (this._configuration?.isInitialized())
		{
			this.onConfigurationComplete();
		}
	}

	private setCommunicationManager(manager: IHabboCommunicationManager | null): void
	{
		this._communication = manager;
	}

	private onConfigurationComplete(): void
	{
		if (this._communication && !this._elementPointerHandler)
		{
			this._elementPointerHandler = new ElementPointerHandler(this);
		}
	}

	/**
	 * Initialize the 4 window context layers.
	 *
	 * Creates a WindowContext per layer, each with its own DesktopController
	 * root and WindowParser for XML layout building.
	 */
	private initContexts(): void
	{
		if (this._initialized) return;

		this._initialized = true;

		Classes.init();

		const factory = this as unknown as IWindowFactory;
		const serviceManager = new ServiceManager();
		const widgetFactory = new HabboWidgetFactory(this);
		const resourceManager = new ResourceManager(this);
		const hintManager = new HintManager(this);
		const resizeHost = {
			get width(): number
			{
				return window.innerWidth;
			},
			get height(): number
			{
				return window.innerHeight;
			},
			addEventListener: (type: string, listener: (event?: Event) => void): void =>
			{
				window.addEventListener(type, listener);
			},
			removeEventListener: (type: string, listener: (event?: Event) => void): void =>
			{
				window.removeEventListener(type, listener);
			}
		};

		this._serviceManager = serviceManager;
		this._widgetFactory = widgetFactory;
		this._resourceManager = resourceManager;
		this._hintManager = hintManager;

		for (let i = 0; i < HabboWindowManager.NUMBER_OF_CONTEXT_LAYERS; i++)
		{
			const context = new WindowContext(`layer_${i}`, factory, null, resizeHost);

			// Inject shared service manager into each context
			context.setServices(serviceManager);

			// Inject widget factory for WidgetWindowController
			context.setWidgetFactory(widgetFactory);

			// Inject resource manager for StaticBitmapWrapperController
			context.setResourceManager(resourceManager);

			// Inject localization manager for localization tokens in captions/text
			context.setLocalizationManager(this._localization);

			// Create desktop root for this layer
			const desktop = new DesktopController(
				`desktop_${i}`,
				WindowType.CONTAINER,
				0,
				0,
				context,
				{x: 0, y: 0, width: 0, height: 0}
			);

			context.setDesktop(desktop);

			// Create parser for XML layout building
			const parser = new WindowParser();

			context.setParser(parser);

			this._windowContextArray.push(context);
		}

		this._defaultContext = this._windowContextArray[HabboWindowManager.DEFAULT_CONTEXT_LAYER_INDEX];

		log.info(`Window manager initialized with ${HabboWindowManager.NUMBER_OF_CONTEXT_LAYERS} context layers (${Classes.getRegisteredTypes().length} types registered)`);
	}

	private requireWidgetLayout(name: string, purpose: string): string
	{
		const layout = this._widgetLayouts.get(name);

		if (!layout)
		{
			throw new Error(`Failed to initialize ${purpose}; missing layout "${name}"!`);
		}

		return layout;
	}

	/**
	 * Get the maximum z-order in a given layer.
	 */
	private getMaxZOrder(layer: number): number
	{
		let max = -1;

		for (const instance of this._windows.values())
		{
			if (instance.layer === layer && instance.zOrder > max)
			{
				max = instance.zOrder;
			}
		}

		return max;
	}
}
