/**
 * RoomDesktop
 *
 * @see sources/source_as_win63/habbo/ui/RoomDesktop.as
 *
 * Per-room desktop instance. Manages the room view, canvas, layout, widgets,
 * color transitions, and mouse event routing for a single room session.
 *
 * NOT a Component — created and managed by RoomUI.
 * Implements IRoomDesktop, IRoomWidgetMessageListener, IRoomWidgetHandlerContainer.
 */
import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {Container} from 'pixi.js';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomDesktop} from './IRoomDesktop';
import type {IRoomWidgetMessageListener} from './IRoomWidgetMessageListener';
import type {IRoomWidgetHandlerContainer} from './IRoomWidgetHandlerContainer';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import {RoomDesktopLayoutManager} from './RoomDesktopLayoutManager';
import {ColorTransitioner} from '@room/utils/ColorTransitioner';
import type {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import type {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import type {RoomEngineRoomColorEvent} from '@habbo/room/events/RoomEngineRoomColorEvent';

const log = Logger.getLogger('RoomDesktop');

export class RoomDesktop implements IRoomDesktop, IRoomWidgetMessageListener, IRoomWidgetHandlerContainer
{
	public static readonly ROOM_VIEW_CREATED = 'ROOM_VIEW_CREATED';
	public static readonly ROOM_BACKGROUND_COLOR_CHANGED = 'ROOM_BACKGROUND_COLOR_CHANGED';

	private _desktopEvents: EventEmitter;
	private _session: IRoomSession;
	private _assets: IAssetLibrary;
	private _connection: IConnection | null;
	private _layoutManager: RoomDesktopLayoutManager;
	private _colorTransitioner: ColorTransitioner;
	private _bgColorTransitioner: ColorTransitioner;

	// Manager references (injected via setters)
	private _windowManager: IHabboWindowManager | null = null;
	private _roomEngine: IRoomEngine | null = null;
	private _sessionDataManager: ISessionDataManager | null = null;
	private _roomSessionManager: IRoomSessionManager | null = null;
	private _config: IHabboConfigurationManager | null = null;
	private _localization: IHabboLocalizationManager | null = null;
	private _widgetFactory: IRoomWidgetFactory | null = null;

	// Widget management
	private _widgets: Map<string, unknown> = new Map();
	private _widgetMessageHandlers: Map<string, IRoomWidgetHandler> = new Map();
	private _widgetEventHandlers: Map<string, IRoomWidgetHandler> = new Map();
	private _updateListeners: IRoomWidgetHandler[] = [];

	// Canvas state
	private _canvasIds: number[] = [];
	private _canvasWrapper: IWindow | null = null;
	private _roomViewWindow: IWindow | null = null;
	private _roomCanvasDisplayObject: Container | null = null;

	private readonly _roomViewGeometryEventHandler = (_event: unknown): void =>
	{
		this.syncRoomCanvasDisplayObject();

		if(!this._roomEngine || !this._canvasWrapper || this._canvasIds.length === 0)
		{
			return;
		}

		this._roomEngine.modifyRoomCanvas(
			this._session.roomId,
			this._canvasIds[0],
			this._canvasWrapper.width,
			this._canvasWrapper.height
		);
	};

	private readonly _canvasWindowEventHandler = (event: unknown): void =>
	{
		const mouseEvent = event as WindowMouseEvent;
		let type = '';

		switch(mouseEvent.type)
		{
			case WindowMouseEvent.CLICK:
				type = 'click';
				break;
			case WindowMouseEvent.DOUBLE_CLICK:
				type = 'doubleClick';
				break;
			case WindowMouseEvent.DOWN:
				type = 'mouseDown';
				break;
			case WindowMouseEvent.UP:
			case WindowMouseEvent.UP_OUTSIDE:
				type = 'mouseUp';
				break;
			case WindowMouseEvent.MOVE:
				type = 'mouseMove';
				break;
			default:
				return;
		}

		this.canvasMouseHandler(
			mouseEvent.stageX,
			mouseEvent.stageY,
			type,
			mouseEvent.altKey,
			mouseEvent.ctrlKey,
			mouseEvent.shiftKey,
			mouseEvent.buttonDown
		);
	};

	// Color state
	private _roomColor: number = 0xFFFFFF;
	private _roomBackgroundColor: number = 0x000000;

	// Zoom state
	private _zoomMomentum: number = 0;
	private _zoomPivotX: number = 0;
	private _zoomPivotY: number = 0;
	private _zoomInProgress: boolean = false;

	private _visible: boolean = true;
	private _disposed: boolean = false;

	constructor(session: IRoomSession, assets: IAssetLibrary, connection: IConnection | null)
	{
		this._desktopEvents = new EventEmitter();
		this._session = session;
		this._assets = assets;
		this._connection = connection;

		this._widgets = new Map();
		this._widgetMessageHandlers = new Map();
		this._widgetEventHandlers = new Map();

		this._layoutManager = new RoomDesktopLayoutManager();
		this._colorTransitioner = new ColorTransitioner();
		this._bgColorTransitioner = new ColorTransitioner(0x000000, 0);
	}

	public get desktopEvents(): EventEmitter
	{
		return this._desktopEvents;
	}

	public get roomSession(): IRoomSession
	{
		return this._session;
	}

	public getFirstCanvasId(): number
	{
		return this._canvasIds.length > 0 ? this._canvasIds[0] : 1;
	}

	public getRoomViewRect(): { x: number; y: number; width: number; height: number } | null
	{
		return this._layoutManager.roomViewRect;
	}

	public processEvent(_event: unknown): void
	{
		// Dispatch to widget event handlers (stub for now)
	}

	public processWidgetMessage(_message: unknown): unknown
	{
		// Route to appropriate widget handler (stub for now)
		return null;
	}

	public get sessionDataManager(): ISessionDataManager | null
	{
		return this._sessionDataManager;
	}

	public get roomEngine(): IRoomEngine | null
	{
		return this._roomEngine;
	}

	public get roomSessionManager(): IRoomSessionManager | null
	{
		return this._roomSessionManager;
	}

	public get roomWidgetFactory(): IRoomWidgetFactory | null
	{
		return this._widgetFactory;
	}

	public get localization(): IHabboLocalizationManager | null
	{
		return this._localization;
	}

	public get windowManager(): IHabboWindowManager | null
	{
		return this._windowManager;
	}

	public get connection(): IConnection | null
	{
		return this._connection;
	}

	public get layoutManager(): RoomDesktopLayoutManager
	{
		return this._layoutManager;
	}

	public get roomBackgroundColor(): number
	{
		return this._roomBackgroundColor;
	}

	public addUpdateListener(handler: IRoomWidgetHandler): void
	{
		if(this._updateListeners.indexOf(handler) < 0)
		{
			this._updateListeners.push(handler);
		}
	}

	public removeUpdateListener(handler: IRoomWidgetHandler): void
	{
		const index = this._updateListeners.indexOf(handler);

		if(index >= 0)
		{
			this._updateListeners.splice(index, 1);
		}
	}

	public set windowManager(value: IHabboWindowManager | null)
	{
		this._windowManager = value;
	}

	public set roomEngine(value: IRoomEngine | null)
	{
		this._roomEngine = value;
	}

	public set sessionDataManager(value: ISessionDataManager | null)
	{
		this._sessionDataManager = value;
	}

	public set roomSessionManager(value: IRoomSessionManager | null)
	{
		this._roomSessionManager = value;
	}

	public set config(value: IHabboConfigurationManager | null)
	{
		this._config = value;
	}

	public set localization(value: IHabboLocalizationManager | null)
	{
		this._localization = value;
	}

	public set roomWidgetFactory(value: IRoomWidgetFactory | null)
	{
		this._widgetFactory = value;
	}

	public set layout(layoutName: string)
	{
		this._layoutManager.setLayout(layoutName, this._windowManager!, this._config);
	}

	public init(): void
	{
		log.debug(`RoomDesktop initialized for room ${this._session.roomId}`);
	}

	/**
	 * Creates the room view and canvas for rendering.
	 * Called when the room engine signals REE_INITIALIZED.
	 *
	 * @param canvasId - The canvas ID to create (typically 1)
	 */
	public createRoomView(canvasId: number): void
	{
		// Guard against double initialization (server can send height map twice)
		if(this._canvasIds.includes(canvasId))
		{
			log.debug(`Room view already created for canvas ${canvasId}, skipping`);

			return;
		}

		if(!this._roomEngine || !this._windowManager)
		{
			log.warn('Cannot create room view — missing roomEngine or windowManager');

			return;
		}

		const roomId = this._session.roomId;
		const viewRect = this._layoutManager.roomViewRect;

		if(!viewRect)
		{
			log.warn('Cannot create room view — no room view rect');

			return;
		}

		const width = viewRect.width;
		const height = viewRect.height;
		const scale = this._session.isGameSession ? 32 : 64;

		// Create the room canvas via the engine
		const canvasDisplayObject = this._roomEngine.createRoomCanvas(roomId, canvasId, width, height, scale);

		if(!canvasDisplayObject)
		{
			log.warn('Failed to create room canvas');

			return;
		}

		this._canvasIds.push(canvasId);

		// Build the room_view_container window tree
		const roomViewContainer = this._windowManager.buildWidgetLayout('room_view_container');

		if(roomViewContainer)
		{
			const containerWindow = roomViewContainer as IWindowContainer;

			// Resize to match room view rect
			containerWindow.width = viewRect.width;
			containerWindow.height = viewRect.height;

			// AS3: room_view_container.findChildByName("room_canvas_wrapper")
			this._canvasWrapper = containerWindow.findChildByName('room_canvas_wrapper')
				?? containerWindow.findChildByTag('room_canvas_wrapper')
				?? null;

			if(this._canvasWrapper)
			{
				this._canvasWrapper.x = 0;
				this._canvasWrapper.y = 0;
				this._canvasWrapper.width = viewRect.width;
				this._canvasWrapper.height = viewRect.height;
				this._canvasWrapper.addEventListener(WindowMouseEvent.CLICK, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowMouseEvent.DOUBLE_CLICK, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowMouseEvent.MOVE, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowMouseEvent.DOWN, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowMouseEvent.UP, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowMouseEvent.UP_OUTSIDE, this._canvasWindowEventHandler);
				this._canvasWrapper.addEventListener(WindowEvent.WE_RESIZED, this._roomViewGeometryEventHandler);
				this._canvasWrapper.addEventListener(WindowEvent.WE_RELOCATED, this._roomViewGeometryEventHandler);
				this._canvasWrapper.addEventListener(WindowEvent.WE_PARENT_RESIZED, this._roomViewGeometryEventHandler);
				this._canvasWrapper.addEventListener(WindowEvent.WE_PARENT_RELOCATED, this._roomViewGeometryEventHandler);

				// AS3: sources/win63_version/habbo/ui/RoomDesktop.as::createRoomView()
				// var_174.setDisplayObject(_loc17_)
				const displayObjectWrapper = this._canvasWrapper as unknown as IDisplayObjectWrapper;

				if(typeof displayObjectWrapper.setDisplayObject === 'function')
				{
					displayObjectWrapper.setDisplayObject(canvasDisplayObject);
				}

				this._roomEngine.setRoomCanvasMask(roomId, canvasId, true);
			}

			// Store reference to the room view window
			this._roomViewWindow = containerWindow;
			this._roomCanvasDisplayObject = canvasDisplayObject;

			// Add to layout
			this._layoutManager.addRoomView(containerWindow);
			this.syncRoomCanvasDisplayObject();
		}

		log.info(`Room view created for room ${roomId}, canvas ${canvasId} (${width}x${height})`);

		// Emit event so the client can position the PixiJS canvas
		this._desktopEvents.emit(RoomDesktop.ROOM_VIEW_CREATED, {
			roomId,
			canvasId,
			viewRect,
			container: canvasDisplayObject
		});
	}

	// AS3: sources/win63_version/habbo/ui/RoomDesktop.as::createRoomView()
	// The room DisplayObject is local to room_canvas_wrapper. Pixi renders it on
	// the root stage, so keep the root-stage container at the wrapper's global
	// position to preserve the same coordinate space.
	private syncRoomCanvasDisplayObject(): void
	{
		if(!this._roomCanvasDisplayObject || !this._canvasWrapper)
		{
			return;
		}

		const globalPosition = {x: 0, y: 0};

		this._canvasWrapper.getGlobalPosition(globalPosition);

		this._roomCanvasDisplayObject.x = globalPosition.x;
		this._roomCanvasDisplayObject.y = globalPosition.y;
		this._roomCanvasDisplayObject.visible = this._visible && this._canvasWrapper.visible;
	}

	/**
	 * Creates a widget by type code.
	 * Widget creation is stubbed — actual widgets will be implemented later.
	 */
	public createWidget(type: string): void
	{
		if(this._widgets.has(type))
		{
			log.debug(`Widget already exists: ${type}`);

			return;
		}

		// For now, just log the request. Full widget creation requires
		// the widget factory and handler registry to be implemented.
		log.debug(`Widget creation requested: ${type} (stub)`);
	}

	public disposeWidget(type: string): void
	{
		const widget = this._widgets.get(type);

		if(!widget) return;

		this._widgets.delete(type);
	}

	public getWidget(type: string): unknown | null
	{
		return this._widgets.get(type) ?? null;
	}

	/**
	 * Handles mouse events forwarded from the client UI layer.
	 * Converts window coordinates to engine coordinates and forwards to RoomEngine.
	 */
	public canvasMouseHandler(x: number, y: number, type: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, buttonDown: boolean): void
	{
		if(!this._roomEngine || this._canvasIds.length === 0) return;

		const canvasId = this._canvasIds[0];
		const roomId = this._session.roomId;
		const globalPosition = {x: 0, y: 0};

		if(this._canvasWrapper)
		{
			this._canvasWrapper.getGlobalPosition(globalPosition);
		}

		this._roomEngine.setActiveRoom(roomId);

		this._roomEngine.handleRoomCanvasMouseEvent(
			canvasId,
			x - globalPosition.x,
			y - globalPosition.y,
			type,
			altKey,
			ctrlKey,
			shiftKey,
			buttonDown
		);
	}

	/**
	 * Handles mouse wheel for zoom.
	 */
	public handleMouseWheel(deltaY: number, x: number, y: number): void
	{
		if(!this._roomEngine || this._canvasIds.length === 0) return;

		const canvasId = this._canvasIds[0];
		const roomId = this._session.roomId;
		const currentScale = this._roomEngine.getRoomCanvasScale(roomId, canvasId);

		// Zoom in/out based on wheel direction
		let newScale = currentScale;

		if(deltaY < 0)
		{
			newScale = Math.min(currentScale * 1.1, 2.0);
		}
		else
		{
			newScale = Math.max(currentScale / 1.1, 0.5);
		}

		if(newScale !== currentScale)
		{
			this._roomEngine.setRoomCanvasScale(roomId, canvasId, newScale, { x, y });
		}
	}

	/**
	 * Sets the room view foreground color (tint overlay).
	 */
	public setRoomViewColor(color: number, brightness: number): void
	{
		const time = Date.now();

		this._colorTransitioner.startTransition(color, brightness, time);
	}

	/**
	 * Sets the room background color (CSS div behind canvas).
	 */
	public setRoomBackgroundColor(h: number, s: number, l: number): void
	{
		const time = Date.now();

		// Convert HSL to packed value for the background transitioner
		const hslPacked = ((h & 0xFF) << 16) | ((s & 0xFF) << 8) | (l & 0xFF);

		this._bgColorTransitioner.startTransition(hslPacked, l, time);

		this._desktopEvents.emit(RoomDesktop.ROOM_BACKGROUND_COLOR_CHANGED, { h, s, l });
	}

	/**
	 * Handles room object events and dispatches to widget handlers.
	 */
	public roomObjectEventHandler(event: RoomEngineObjectEvent): void
	{
		const eventType = event.type;
		const handler = this._widgetEventHandlers.get(eventType);

		if(handler)
		{
			handler.processEvent(event);
		}
	}

	/**
	 * Handles room engine events (mode changes, zoom, etc.).
	 */
	public roomEngineEventHandler(_event: RoomEngineEvent): void
	{
		// Stub — will route to appropriate handling when widgets are ported
	}

	public set visible(value: boolean)
	{
		this._visible = value;

		if(this._layoutManager.layoutContainer)
		{
			this._layoutManager.layoutContainer.visible = value;
		}

		this.syncRoomCanvasDisplayObject();
	}

	public get visible(): boolean
	{
		return this._visible;
	}

	/**
	 * Called each frame by RoomUI.update().
	 * Updates color transitions, widget handlers, and zoom momentum.
	 */
	public update(): void
	{
		if(this._disposed) return;

		const time = Date.now();

		// Update color transitions
		if(this._colorTransitioner.updateColor(time))
		{
			this._roomColor = this._colorTransitioner.color;
		}

		if(this._bgColorTransitioner.updateColor(time))
		{
			this._roomBackgroundColor = this._bgColorTransitioner.color;
		}

		// Update widget handlers
		for(const listener of this._updateListeners)
		{
			listener.update();
		}
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		log.debug(`Disposing RoomDesktop for room ${this._session.roomId}`);

		// Dispose all widgets
		for(const [type, widget] of this._widgets)
		{
			if(widget && typeof (widget as any).dispose === 'function')
			{
				(widget as any).dispose();
			}
		}

		this._widgets.clear();
		this._widgetMessageHandlers.clear();
		this._widgetEventHandlers.clear();
		this._updateListeners.length = 0;

		if(this._canvasWrapper)
		{
			this._canvasWrapper.removeEventListener(WindowMouseEvent.CLICK, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowMouseEvent.DOUBLE_CLICK, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowMouseEvent.MOVE, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowMouseEvent.DOWN, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowMouseEvent.UP, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowMouseEvent.UP_OUTSIDE, this._canvasWindowEventHandler);
			this._canvasWrapper.removeEventListener(WindowEvent.WE_RESIZED, this._roomViewGeometryEventHandler);
			this._canvasWrapper.removeEventListener(WindowEvent.WE_RELOCATED, this._roomViewGeometryEventHandler);
			this._canvasWrapper.removeEventListener(WindowEvent.WE_PARENT_RESIZED, this._roomViewGeometryEventHandler);
			this._canvasWrapper.removeEventListener(WindowEvent.WE_PARENT_RELOCATED, this._roomViewGeometryEventHandler);

			const displayObjectWrapper = this._canvasWrapper as unknown as IDisplayObjectWrapper;

			if(typeof displayObjectWrapper.setDisplayObject === 'function')
			{
				displayObjectWrapper.setDisplayObject(null);
			}
		}

		// Dispose layout
		this._layoutManager.dispose();

		// Clear references
		this._desktopEvents.removeAllListeners();
		this._windowManager = null;
		this._roomEngine = null;
		this._sessionDataManager = null;
		this._roomSessionManager = null;
		this._config = null;
		this._localization = null;
		this._widgetFactory = null;
		this._canvasWrapper = null;
		this._roomViewWindow = null;
		this._roomCanvasDisplayObject = null;
	}
}
