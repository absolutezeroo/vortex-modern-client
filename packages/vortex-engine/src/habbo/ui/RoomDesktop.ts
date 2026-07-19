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
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IHabboGroupsManager} from '@habbo/groups/IHabboGroupsManager';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {IHabboNavigator} from '@habbo/navigator/IHabboNavigator';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboUserDefinedRoomEvents} from '@habbo/roomevents/IHabboUserDefinedRoomEvents';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IUserData} from '@habbo/session/IUserData';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import type {IRoomDesktop} from './IRoomDesktop';
import type {IRoomWidgetMessageListener} from './IRoomWidgetMessageListener';
import type {IRoomWidgetHandlerContainer} from './IRoomWidgetHandlerContainer';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import {RoomDesktopLayoutManager} from './RoomDesktopLayoutManager';
import {ColorTransitioner} from '@room/utils/ColorTransitioner';
import type {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {RoomWidgetRoomObjectUpdateEvent} from './widget/events/RoomWidgetRoomObjectUpdateEvent';
import {InfoStandWidgetHandler} from './handler/InfoStandWidgetHandler';
import {RoomToolsWidgetHandler} from './handler/RoomToolsWidgetHandler';
import {ChatInputWidgetHandler} from './handler/ChatInputWidgetHandler';
import {ChatWidgetHandler} from './handler/ChatWidgetHandler';
import type {IRoomWidget} from './widget/IRoomWidget';

const log = Logger.getLogger('RoomDesktop');

// AS3: sources/win63_version/habbo/ui/RoomUI.as:71 (var_4627)
const REUSABLE_WIDGET_TYPES = new Set([
    'RWE_INFOSTAND', 'RWE_CHAT_INPUT_WIDGET', 'RWE_ME_MENU', 'RWE_CHAT_WIDGET',
    'RWE_EXTERNAL_IMAGE', 'RWE_CAMERA', 'RWE_ROOM_TOOLS', 'RWE_FURNITURE_CONTEXT_MENU',
]);

export class RoomDesktop implements IRoomDesktop, IRoomWidgetMessageListener, IRoomWidgetHandlerContainer 
{
    public static readonly ROOM_VIEW_CREATED = 'ROOM_VIEW_CREATED';
    public static readonly ROOM_BACKGROUND_COLOR_CHANGED = 'ROOM_BACKGROUND_COLOR_CHANGED';
    private _session: IRoomSession;
    private _assets: IAssetLibrary;
    private _colorTransitioner: ColorTransitioner;
    private _bgColorTransitioner: ColorTransitioner;
    private _widgetFactory: IRoomWidgetFactory | null = null;
    // Widget management
    private _widgets: Map<string, unknown> = new Map();
    // AS3 keys these on an array of handlers per type, not one handler: every handler
    // registers for RETWE_OPEN_WIDGET/RETWE_CLOSE_WIDGET, so a single-handler map let
    // only the last-registered widget ever receive an open/close.
    private _widgetMessageHandlers: Map<string, IRoomWidgetHandler[]> = new Map();
    private _widgetEventHandlers: Map<string, IRoomWidgetHandler[]> = new Map();
    private _updateListeners: IRoomWidgetHandler[] = [];
    // Canvas state
    private _canvasIds: number[] = [];
    private _canvasWrapper: IWindow | null = null;
    private _roomViewWindow: IWindow | null = null;
    private _roomCanvasDisplayObject: Container | null = null;
    // Color state
    private _roomColor: number = 0xFFFFFF;
    // Zoom state
    private _zoomMomentum: number = 0;
    private _zoomPivotX: number = 0;
    private _zoomPivotY: number = 0;
    private _zoomInProgress: boolean = false;
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

    private _desktopEvents: EventEmitter;

    public get desktopEvents(): EventEmitter 
    {
        return this._desktopEvents;
    }

    private _connection: IConnection | null;

    public get connection(): IConnection | null 
    {
        return this._connection;
    }

    private _layoutManager: RoomDesktopLayoutManager;

    public get layoutManager(): RoomDesktopLayoutManager 
    {
        return this._layoutManager;
    }

    // Manager references (injected via setters)
    private _windowManager: IHabboWindowManager | null = null;

    public get windowManager(): IHabboWindowManager | null 
    {
        return this._windowManager;
    }

    public set windowManager(value: IHabboWindowManager | null) 
    {
        this._windowManager = value;
    }

    private _roomEngine: IRoomEngine | null = null;

    public get roomEngine(): IRoomEngine | null 
    {
        return this._roomEngine;
    }

    public set roomEngine(value: IRoomEngine | null) 
    {
        this._roomEngine = value;
    }

    private _sessionDataManager: ISessionDataManager | null = null;

    public get sessionDataManager(): ISessionDataManager | null 
    {
        return this._sessionDataManager;
    }

    public set sessionDataManager(value: ISessionDataManager | null) 
    {
        this._sessionDataManager = value;
    }

    private _roomSessionManager: IRoomSessionManager | null = null;

    public get roomSessionManager(): IRoomSessionManager | null 
    {
        return this._roomSessionManager;
    }

    public set roomSessionManager(value: IRoomSessionManager | null) 
    {
        this._roomSessionManager = value;
    }

    private _config: IHabboConfigurationManager | null = null;

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get config()
    public get config(): IHabboConfigurationManager | null 
    {
        return this._config;
    }

    public set config(value: IHabboConfigurationManager | null) 
    {
        this._config = value;
    }

    private _localization: IHabboLocalizationManager | null = null;

    public get localization(): IHabboLocalizationManager | null 
    {
        return this._localization;
    }

    public set localization(value: IHabboLocalizationManager | null) 
    {
        this._localization = value;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::get toolbar()
    public get toolbar(): IHabboToolbar | null 
    {
        return this._toolbar;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::set toolbar()
    public set toolbar(value: IHabboToolbar | null) 
    {
        if(this._toolbar) 
        {
            this._toolbar.toolbarEvents.off(HabboToolbarEvent.ICON_ZOOM, this.onToolbarEvent);
        }

        this._toolbar = value;

        if(this._toolbar) 
        {
            this._toolbar.toolbarEvents.on(HabboToolbarEvent.ICON_ZOOM, this.onToolbarEvent);
        }
    }

    private _catalog: IHabboCatalog | null = null;

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get catalog()
    public get catalog(): IHabboCatalog | null 
    {
        return this._catalog;
    }

    public set catalog(value: IHabboCatalog | null) 
    {
        this._catalog = value;
    }

    private _habboTracking: IHabboTracking | null = null;

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get habboTracking()
    public get habboTracking(): IHabboTracking | null 
    {
        return this._habboTracking;
    }

    public set habboTracking(value: IHabboTracking | null) 
    {
        this._habboTracking = value;
    }

    private _habboGroupsManager: IHabboGroupsManager | null = null;

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get habboGroupsManager()
    public get habboGroupsManager(): IHabboGroupsManager | null 
    {
        return this._habboGroupsManager;
    }

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::set habboGroupsManager()
    public set habboGroupsManager(value: IHabboGroupsManager | null) 
    {
        this._habboGroupsManager = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/IRoomWidgetHandlerContainer.as::friendList
    private _friendList: IHabboFriendList | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/IRoomWidgetHandlerContainer.as::get friendList()
    public get friendList(): IHabboFriendList | null 
    {
        return this._friendList;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/IRoomWidgetHandlerContainer.as::set friendList()
    public set friendList(value: IHabboFriendList | null) 
    {
        this._friendList = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/RoomDesktop.as::_freeFlowChat
    private _freeFlowChat: IHabboFreeFlowChat | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/RoomDesktop.as::get freeFlowChat()
    public get freeFlowChat(): IHabboFreeFlowChat | null 
    {
        return this._freeFlowChat;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/ui/RoomDesktop.as::set freeFlowChat()
    public set freeFlowChat(value: IHabboFreeFlowChat | null) 
    {
        this._freeFlowChat = value;
    }

    private _navigator: IHabboNavigator | null = null;

    public get navigator(): IHabboNavigator | null 
    {
        return this._navigator;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::_navigator (private field, not part of IRoomWidgetHandlerContainer)
    public set navigator(value: IHabboNavigator | null) 
    {
        this._navigator = value;
    }

    private _communicationManager: IHabboCommunicationManager | null = null;

    public get communicationManager(): IHabboCommunicationManager | null 
    {
        return this._communicationManager;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::_communicationManager (private field, not part of IRoomWidgetHandlerContainer)
    public set communicationManager(value: IHabboCommunicationManager | null) 
    {
        this._communicationManager = value;
    }

    private _roomBackgroundColor: number = 0x000000;

    public get roomBackgroundColor(): number 
    {
        return this._roomBackgroundColor;
    }

    // AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get userDefinedRoomEvents()

    private _visible: boolean = true;

    public get visible(): boolean 
    {
        return this._visible;
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

    public get roomSession(): IRoomSession 
    {
        return this._session;
    }

    public get roomWidgetFactory(): IRoomWidgetFactory | null 
    {
        return this._widgetFactory;
    }

    public set roomWidgetFactory(value: IRoomWidgetFactory | null) 
    {
        this._widgetFactory = value;
    }

    // TODO(AS3): no concrete implementation exists yet, see IHabboUserDefinedRoomEvents.ts.
    public get userDefinedRoomEvents(): IHabboUserDefinedRoomEvents | null 
    {
        return null;
    }

    public set layout(layoutName: string) 
    {
        this._layoutManager.setLayout(layoutName, this._windowManager!, this._config);
    }

    public getFirstCanvasId(): number 
    {
        return this._canvasIds.length > 0 ? this._canvasIds[0] : 1;
    }

    public getRoomViewRect(): { x: number; y: number; width: number; height: number } | null 
    {
        return this._layoutManager.roomViewRect;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::processEvent()
    public processEvent(event: unknown): void 
    {
        const eventType = (event as { type?: string } | null)?.type;

        if(!eventType) return;

        if(eventType === 'RWZTM_ZOOM_TOGGLE')
        {
            this.toggleZoom();
        }

        const handlers = this._widgetEventHandlers.get(eventType);

        if(!handlers) return;

        const isOpenClose = eventType === 'RETWE_OPEN_WIDGET' || eventType === 'RETWE_CLOSE_WIDGET';
        const targetWidget = isOpenClose ? ((event as { widget?: string | null }).widget ?? null) : null;

        for(const handler of handlers)
        {
            // AS3: an open/close-widget event is delivered only to the handler whose type
            // matches the event's target widget; every other event goes to all handlers.
            if(isOpenClose && handler.type !== targetWidget)
            {
                continue;
            }

            handler.processEvent(event);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomDesktop.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        const messageType = (message as { type?: string } | null)?.type;

        if(!messageType) return null;

        const handlers = this._widgetMessageHandlers.get(messageType);

        if(!handlers) return null;

        // AS3 returns the first non-null result across the handlers registered for this
        // message type.
        for(const handler of handlers)
        {
            const result = handler.processWidgetMessage(message);

            if(result !== null && result !== undefined)
            {
                return result;
            }
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomDesktop.as::isOwnerOfFurniture()
    public isOwnerOfFurniture(object: IRoomObject): boolean
    {
        const ownerId = object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID);

        return ownerId === this._sessionDataManager?.userId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomDesktop.as::getFurnitureOwnerId()
    public getFurnitureOwnerId(object: IRoomObject): number
    {
        const ownerId = object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID);

        return !isNaN(ownerId) ? ownerId : -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomDesktop.as::isOwnerOfPet()
    public isOwnerOfPet(pet: IUserData | null): boolean
    {
        if(pet === null) return false;

        return pet.ownerId === this._sessionDataManager?.userId;
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
        const roomViewContainer = this._windowManager.buildWidgetLayout('room_view_container_xml');

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
                this._canvasWrapper.addEventListener(WindowMouseEvent.CLICK, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowMouseEvent.DOUBLE_CLICK, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowMouseEvent.MOVE, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowMouseEvent.DOWN, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowMouseEvent.UP, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowMouseEvent.UP_OUTSIDE, this.canvasWindowEventHandler);
                this._canvasWrapper.addEventListener(WindowEvent.WE_RESIZED, this.roomViewGeometryEventHandler);
                this._canvasWrapper.addEventListener(WindowEvent.WE_RELOCATED, this.roomViewGeometryEventHandler);
                this._canvasWrapper.addEventListener(WindowEvent.WE_PARENT_RESIZED, this.roomViewGeometryEventHandler);
                this._canvasWrapper.addEventListener(WindowEvent.WE_PARENT_RELOCATED, this.roomViewGeometryEventHandler);

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

    /**
     * Creates a widget by type code.
     *
     * AS3: sources/win63_version/habbo/ui/RoomDesktop.as::createWidget()
     * TODO(AS3): only "RWE_INFOSTAND"/"RWE_ROOM_TOOLS"/"RWE_CHAT_INPUT_WIDGET"/
     * "RWE_CHAT_WIDGET" are wired up so far (4 of the 45 AS3 RWE_* widget
     * types); the rest still fall through to the stub log.
     */
    public createWidget(type: string): void 
    {
        if(this._widgets.has(type)) 
        {
            log.debug(`Widget already exists: ${type}`);

            return;
        }

        let handler: IRoomWidgetHandler;

        switch(type) 
        {
            case 'RWE_INFOSTAND':
                handler = new InfoStandWidgetHandler(null);
                break;
            case 'RWE_ROOM_TOOLS': {
                // AS3: sources/win63_version/habbo/ui/RoomDesktop.as:885-890
                const roomToolsHandler = new RoomToolsWidgetHandler();

                roomToolsHandler.communicationManager = this._communicationManager;
                roomToolsHandler.navigator = this._navigator;
                handler = roomToolsHandler;
                break;
            }
            case 'RWE_CHAT_INPUT_WIDGET':
                handler = new ChatInputWidgetHandler();
                break;
            case 'RWE_CHAT_WIDGET': {
                // AS3: sources/win63_2023_version/com/sulake/habbo/ui/RoomDesktop.as::734-737
                const chatHandler = new ChatWidgetHandler();

                chatHandler.connection = this._connection;
                handler = chatHandler;
                break;
            }
            default:
                log.debug(`Widget creation requested: ${type} (stub)`);

                return;
        }

        handler.container = this;

        for(const messageType of handler.getWidgetMessages())
        {
            let list = this._widgetMessageHandlers.get(messageType);

            if(!list)
            {
                list = [];
                this._widgetMessageHandlers.set(messageType, list);
            }

            list.push(handler);
        }

        for(const eventType of [...handler.getProcessedEvents(), 'RETWE_OPEN_WIDGET', 'RETWE_CLOSE_WIDGET'])
        {
            let list = this._widgetEventHandlers.get(eventType);

            if(!list)
            {
                list = [];
                this._widgetEventHandlers.set(eventType, list);
            }

            list.push(handler);
        }

        const widget = (this._widgetFactory?.createWidget(type, handler) ?? null) as IRoomWidget | null;

        if(!widget) 
        {
            handler.dispose();

            return;
        }

        widget.messageListener = this;
        widget.registerUpdateEvents(this._desktopEvents);
        // AS3: sources/win63_version/habbo/ui/RoomUI.as:71 (var_4627) marks these widget
        // types reusable across room transitions via a caller-side instance cache in
        // RoomUI.createDesktopWidget() (var_1358) that calls widget.reuse(newDesktop)
        // instead of reconstructing. That cross-room caching isn't ported yet — this
        // only sets the flag correctly per AS3 (currently inert since nothing reads it
        // besides this assignment) so it's ready when that follow-up lands.
        widget.reusable = REUSABLE_WIDGET_TYPES.has(type);
        widget.widgetType = type;

        this._widgets.set(type, widget);
        this.addUpdateListener(handler);

        if(widget.mainWindow) 
        {
            this._layoutManager.addWidgetWindow(type, widget.mainWindow);
        }

        log.debug(`Widget created: ${type}`);
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
        let newScale: number;

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
            this._roomEngine.setRoomCanvasScale(roomId, canvasId, newScale, {x, y});
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

        this._desktopEvents.emit(RoomDesktop.ROOM_BACKGROUND_COLOR_CHANGED, {h, s, l});
    }

    public roomObjectEventHandler(event: RoomEngineObjectEvent): void 
    {
        let translatedType: string | null = null;

        switch(event.type) 
        {
            case RoomEngineObjectEvent.REOE_OBJECT_SELECTED:
                // AS3 only builds the update event when selection is allowed; when it is disabled
                // the local stays null and nothing is dispatched.
                if(!this.isFurnitureSelectionDisabled(event)) 
                {
                    translatedType = RoomWidgetRoomObjectUpdateEvent.OBJECT_SELECTED;
                }
                break;
            case RoomEngineObjectEvent.REOE_OBJECT_DESELECTED:
                translatedType = RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED;
                break;
            case RoomEngineObjectEvent.REOE_OBJECT_ADDED:
                translatedType = event.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_USER
                    ? RoomWidgetRoomObjectUpdateEvent.USER_ADDED
                    : RoomWidgetRoomObjectUpdateEvent.FURNI_ADDED;
                break;
            case RoomEngineObjectEvent.REOE_OBJECT_REMOVED:
                translatedType = event.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_USER
                    ? RoomWidgetRoomObjectUpdateEvent.USER_REMOVED
                    : RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED;
                break;
        }

        if(translatedType) 
        {
            const translated = new RoomWidgetRoomObjectUpdateEvent(translatedType, event.objectId, event.category, event.roomId);

            this._desktopEvents.emit(translated.type, translated);

            return;
        }

        const handlers = this._widgetEventHandlers.get(event.type);

        if(handlers)
        {
            for(const handler of handlers)
            {
                handler.processEvent(event);
            }
        }
    }

    /**
     * Handles room engine events (mode changes, zoom, etc.).
     */
    public roomEngineEventHandler(_event: RoomEngineEvent): void 
    {
        // Stub — will route to appropriate handling when widgets are ported
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

        if(this._toolbar) 
        {
            this._toolbar.toolbarEvents.off(HabboToolbarEvent.ICON_ZOOM, this.onToolbarEvent);
            this._toolbar = null;
        }

        // Dispose all widgets
        for(const widget of this._widgets.values()) 
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
            this._canvasWrapper.removeEventListener(WindowMouseEvent.CLICK, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowMouseEvent.DOUBLE_CLICK, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowMouseEvent.MOVE, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowMouseEvent.DOWN, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowMouseEvent.UP, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowMouseEvent.UP_OUTSIDE, this.canvasWindowEventHandler);
            this._canvasWrapper.removeEventListener(WindowEvent.WE_RESIZED, this.roomViewGeometryEventHandler);
            this._canvasWrapper.removeEventListener(WindowEvent.WE_RELOCATED, this.roomViewGeometryEventHandler);
            this._canvasWrapper.removeEventListener(WindowEvent.WE_PARENT_RESIZED, this.roomViewGeometryEventHandler);
            this._canvasWrapper.removeEventListener(WindowEvent.WE_PARENT_RELOCATED, this.roomViewGeometryEventHandler);

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
        this._toolbar = null;
        this._widgetFactory = null;
        this._canvasWrapper = null;
        this._roomViewWindow = null;
        this._roomCanvasDisplayObject = null;
    }

    /**
     * Translates room-engine object events (REOE_*) into widget-facing
     * RoomWidgetRoomObjectUpdateEvents (RWROUE_*) and dispatches them on
     * `desktopEvents`, where widgets (e.g. InfoStandWidget) listen for them.
     *
     * AS3: sources/win63_version/habbo/ui/RoomDesktop.as::roomObjectEventHandler()
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomDesktop.as::isFurnitureSelectionDisabled()
    private isFurnitureSelectionDisabled(event: RoomEngineObjectEvent): boolean 
    {
        let disabled = false;

        const roomObject = this._roomEngine?.getRoomObject(event.roomId, event.objectId, event.category) ?? null;

        if(roomObject !== null) 
        {
            const model = roomObject.getModel();

            if(model !== null) 
            {
                if(model.getNumber(RoomObjectVariableEnum.FURNITURE_SELECTION_DISABLE) === 1) 
                {
                    disabled = true;

                    if(this._sessionDataManager?.isAnyRoomController) 
                    {
                        disabled = false;
                    }
                }
            }
        }

        return disabled;
    }

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::onRoomViewResized()
    // TS deviation: one handler bound to all four resize/relocate event types
    // (WE_RESIZED/WE_RELOCATED/WE_PARENT_RESIZED/WE_PARENT_RELOCATED) instead of

    // separate AS3 listener methods, since they all just re-sync canvas geometry.
    private readonly roomViewGeometryEventHandler = (_event: unknown): void => 
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

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::mouseEventHandler()
    private readonly canvasWindowEventHandler = (event: unknown): void => 
    {
        const mouseEvent = event as WindowMouseEvent;
        let type: string;

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

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::onToolbarEvent()
    private onToolbarEvent = (event: HabboToolbarEvent): void => 
    {
        if(event.type === HabboToolbarEvent.ICON_ZOOM) 
        {
            this.toggleZoom();
        }
    };

    // AS3: sources/win63_version/habbo/ui/RoomDesktop.as::toggleZoom()
    private toggleZoom(): void 
    {
        if(!this._roomEngine || this._canvasIds.length === 0) return;

        const roomId = this._roomEngine.activeRoomId;
        const canvasId = this.getFirstCanvasId();
        const currentScale = this._roomEngine.getRoomCanvasScale(roomId, canvasId);
        const newScale = currentScale === 1 ? 0.5 : 1;

        this._roomEngine.setRoomCanvasScale(roomId, canvasId, newScale);
    }
}
