/**
 * RoomEngine
 *
 * Based on AS3: com.sulake.habbo.room.RoomEngine
 *
 * Main room engine implementation. Orchestrates room rendering,
 * object management, and event handling.
 *
 * IMPORTANT: RoomEngine depends on IRoomManager for room instance management.
 * It does NOT manage rooms directly - that's RoomManager's responsibility.
 */
import type {Container, Ticker} from 'pixi.js';
import {Sprite, Texture} from 'pixi.js';
import {Component, ComponentDependency, type IContext, type IUpdateReceiver} from '@core/runtime';
import {Vortex} from '../../Vortex';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from './IRoomEngine';
import type {IRoomAreaSelectionManager} from './IRoomAreaSelectionManager';
import {RoomAreaSelectionManager} from './utils/RoomAreaSelectionManager';
import type {IRoomCreator} from './IRoomCreator';
import type {IRoomEngineServices} from './IRoomEngineServices';
import type {IRoomContentListener} from './IRoomContentListener';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomManager} from '@room/IRoomManager';
import type {IRoomManagerListener} from '@room/IRoomManagerListener';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomObjectEventHandler} from '@room/object/logic/IRoomObjectEventHandler';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {IRoomRenderer} from '@room/renderer/IRoomRenderer';
import type {IRoomRendererFactory} from '@room/renderer/IRoomRendererFactory';
import type {IRoomRenderingCanvasMouseListener} from '@room/renderer/IRoomRenderingCanvasMouseListener';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {RoomGeometry} from '@room/utils/RoomGeometry';
import {IID_RoomManager} from '@iid/IIDRoomManager';
import {IID_RoomRendererFactory} from '@iid/IIDRoomRendererFactory';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {RoomObjectUserTypes} from './object/RoomObjectUserTypes';
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';
import {RoomEngineEvent} from './events/RoomEngineEvent';
import {RoomEngineObjectEvent} from './events/RoomEngineObjectEvent';
import {RoomEngineDragWithMouseEvent} from './events/RoomEngineDragWithMouseEvent';
import {RoomObjectFactory} from './RoomObjectFactory';
import {RoomVariableEnum} from './RoomVariableEnum';
import {RoomObjectVisualizationFactory} from './object/RoomObjectVisualizationFactory';
import type {IRoomObjectVisualizationFactory} from '@room/object/IRoomObjectVisualizationFactory';
import type {RoomRenderingCanvas} from './renderer/RoomRenderingCanvas';
import type {IStuffData} from './object/data/IStuffData';
import type {IGetImageListener} from './IGetImageListener';
import {ImageResult} from './ImageResult';
import type {ISelectedRoomObjectData} from './ISelectedRoomObjectData';

// Messages
import {RoomObjectMoveUpdateMessage} from './messages/RoomObjectMoveUpdateMessage';
import {RoomObjectAvatarUpdateMessage} from './messages/RoomObjectAvatarUpdateMessage';
import {RoomObjectAvatarFigureUpdateMessage} from './messages/RoomObjectAvatarFigureUpdateMessage';
import {RoomObjectAvatarPostureUpdateMessage} from './messages/RoomObjectAvatarPostureUpdateMessage';
import {RoomObjectAvatarGestureUpdateMessage} from './messages/RoomObjectAvatarGestureUpdateMessage';
import {RoomObjectAvatarEffectUpdateMessage} from './messages/RoomObjectAvatarEffectUpdateMessage';
import {RoomObjectAvatarChatUpdateMessage} from './messages/RoomObjectAvatarChatUpdateMessage';
import {RoomObjectAvatarTypingUpdateMessage} from './messages/RoomObjectAvatarTypingUpdateMessage';
import {RoomObjectAvatarDanceUpdateMessage} from './messages/RoomObjectAvatarDanceUpdateMessage';
import {RoomObjectAvatarSleepUpdateMessage} from './messages/RoomObjectAvatarSleepUpdateMessage';
import {RoomObjectAvatarCarryObjectUpdateMessage} from './messages/RoomObjectAvatarCarryObjectUpdateMessage';
import {RoomObjectAvatarSignUpdateMessage} from './messages/RoomObjectAvatarSignUpdateMessage';
import {RoomObjectAvatarOwnMessage} from './messages/RoomObjectAvatarOwnMessage';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomCamera} from './utils/RoomCamera';
import type {FurniStackingHeightMap} from './utils/FurniStackingHeightMap';
import {SelectedRoomObjectData} from './utils/SelectedRoomObjectData';
import {TileObjectMap} from './utils/TileObjectMap';
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import {Logger} from "@core";
import {RoomVisualizationData} from './object/visualization/room/RoomVisualizationData';
import type {IAssetRoomVisualizationData} from './object/visualization/room/rasterizer/basic/PlaneRasterizerTypes';
import type {NitroAsset} from '@core/assets/NitroAsset';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {EventEmitter} from 'eventemitter3';
import {RoomContentLoader} from './RoomContentLoader';
import type {PetColorResult} from './PetColorResult';
import {RoomContentLoadedEvent} from '@room/events/RoomContentLoadedEvent';
import {RoomObjectTileCursorUpdateMessage} from './messages/RoomObjectTileCursorUpdateMessage';
import {MoveAvatarMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/MoveAvatarMessageComposer';
import {UseFurnitureMessageComposer} from '@habbo/communication/messages/outgoing/room/furniture/UseFurnitureMessageComposer';
import {
    PlaceObjectMessageComposer
} from '@habbo/communication/messages/outgoing/room/engine/PlaceObjectMessageComposer';
import {MoveObjectMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/MoveObjectMessageComposer';
import {
    PickupObjectMessageComposer
} from '@habbo/communication/messages/outgoing/room/engine/PickupObjectMessageComposer';
import {RoomEngineObjectPlacedEvent} from './events/RoomEngineObjectPlacedEvent';
import {RoomObjectRoomMaskUpdateMessage} from './messages/RoomObjectRoomMaskUpdateMessage';
import {RoomObjectDataUpdateMessage} from './messages/RoomObjectDataUpdateMessage';
import {RoomObjectItemDataUpdateMessage} from './messages/RoomObjectItemDataUpdateMessage';
import {RoomObjectRoomFloorHoleUpdateMessage} from './messages/RoomObjectRoomFloorHoleUpdateMessage';
import {RoomEngineAreaHideStateWidgetEvent} from './events/RoomEngineAreaHideStateWidgetEvent';
import {RoomObjectAvatarDirectionUpdateMessage} from './messages/RoomObjectAvatarDirectionUpdateMessage';
import {RoomObjectRoomColorUpdateMessage} from './messages/RoomObjectRoomColorUpdateMessage';
import {RoomEngineRoomColorEvent} from './events/RoomEngineRoomColorEvent';
import {LegacyStuffData} from './object/data/LegacyStuffData';
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {RoomObjectRoomUpdateMessage} from './messages/RoomObjectRoomUpdateMessage';
import {RoomObjectRoomPlaneVisibilityUpdateMessage} from './messages/RoomObjectRoomPlaneVisibilityUpdateMessage';
import {RoomObjectRoomPlanePropertyUpdateMessage} from './messages/RoomObjectRoomPlanePropertyUpdateMessage';
import {RoomObjectTileMouseEvent} from './events/RoomObjectTileMouseEvent';
import {RoomObjectStateChangeEvent} from './events/RoomObjectStateChangeEvent';
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';

const log = Logger.getLogger('RoomEngine');

// Room identifier prefix
const ROOM_ID_PREFIX = 'room_';
const OBJECT_ID_ROOM = -1;
const OBJECT_TYPE_ROOM = 'room';
const OBJECT_ID_TILE_CURSOR = -2;
const OBJECT_TYPE_TILE_CURSOR = 'tile_cursor';
const OBJECT_ID_SELECTION_ARROW = -3;
const OBJECT_TYPE_SELECTION_ARROW = 'selection_arrow';
const ROOM_DRAG_THRESHOLD = 15;
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getGenericRoomObjectImage() ("temporary_room")
const TEMPORARY_ROOM_ID = 'temporary_room';

interface IRoomEngineRoomInstanceData {
    roomCamera: RoomCamera;
    furniStackingHeightMap: FurniStackingHeightMap | null;
    tileObjectMap: TileObjectMap | null;
    selectedObjectData: SelectedRoomObjectData | null;
}

export interface IRoomEngineRectangle {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export class RoomEngine extends Component implements IRoomEngine,
    IRoomManagerListener,
    IRoomCreator,
    IRoomEngineServices,
    IUpdateReceiver,
    IRoomContentListener,
    IRoomRenderingCanvasMouseListener 
{
    private _roomObjectFactory: RoomObjectFactory;
    private _visualizationFactory: RoomObjectVisualizationFactory;
    private _roomData: Map<string, unknown>;
    private _ownUserIds: Map<number, number>;
    private _roomObjectAliases: Map<string, string>;
    private _renderingCanvases: Map<number, RoomRenderingCanvas> = new Map();
    private _resizeHandlers: WeakMap<RoomRenderingCanvas, () => void> = new WeakMap();
    private _pixiStage: Container | null = null;
    private _roomVisualizationData: RoomVisualizationData | null = null;
    private _configurationManager: IHabboConfigurationManager | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _contentLoader: RoomContentLoader;
    private _contentLoaderEvents: EventEmitter = new EventEmitter();
    private _roomInstanceData: Map<number, IRoomEngineRoomInstanceData>;
    private _boundOnContentLoaded: ((type: string) => void) = this.onContentLoaded.bind(this);
    private _boundOnContentLoaderReady: (() => void) = this.onContentLoaderReady.bind(this);
    private _pendingFurnitureViz: Map<string, Array<{
        roomId: number;
        objectId: number;
        category: number
    }>> = new Map();

    private _initializedRooms: Set<number> = new Set();
    private _roomDragging: boolean = false;
    private _roomDragStarted: boolean = false;
    private _roomDragStartX: number = 0;
    private _roomDragStartY: number = 0;
    private _roomDragLastX: number = 0;
    private _roomDragLastY: number = 0;
    private _roomDraggingAlwaysCenters: boolean = false;
    private _roomSessionManager: IRoomSessionManager | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    private _roomRendererFactory: IRoomRendererFactory | null = null;
    private _moverIconSprite: Sprite | null = null;
    private _moverIconCanvas: RoomRenderingCanvas | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::_objectPlacementSource
    private _objectPlacementSource: string = '';

    private _pendingThumbnailListeners: Map<string, IGetImageListener[]> = new Map();
    private _thumbnailIdCounter: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::_SafeStr_7265
    private _pendingImageListeners: Map<number, IGetImageListener> = new Map();
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::_SafeStr_6137
    private _imageIdCounter: number = 0;
    private _ticker: Ticker | null = null;
    private _canvasSyncCallbacks: Set<() => void> = new Set();
    // AS3 _SafeCls_1821.as::_moveMouseEventCache — the last mouse-move over a tile, replayed
    // by recalibrateMovements() so an in-progress drag/place ghost re-snaps after the tile
    // map rebuilds. The port caches the tile coords (all handleObjectMove/Place need).
    private _moveMouseEventCache: Vector3d | null = null;
    private _selectedObject: { roomId: number; id: number; category: number } | null = null;

    constructor(context: IContext, assetLibrary: IAssetLibrary | null = null) 
    {
        super(context, 0, assetLibrary);
        this._roomObjectFactory = new RoomObjectFactory();
        this._visualizationFactory = new RoomObjectVisualizationFactory();
        // AS3's factory reads `assets` off its own Component base; this port's factory is a plain
        // class, so the library is handed to it here (AnimatedPetVisualizationData.commonAssets).
        this._visualizationFactory.assets = assetLibrary;
        this._contentLoader = new RoomContentLoader();
        this._roomData = new Map();
        this._ownUserIds = new Map();
        this._roomObjectAliases = new Map();
        this._roomInstanceData = new Map();

        // Listen to object events from factory
        this._roomObjectFactory.addObjectEventListener(this.onRoomObjectEvent.bind(this));
    }

    private _activeRoomId: number = -1;

    get activeRoomId(): number 
    {
        return this._activeRoomId;
    }

    private _roomManager: IRoomManager | null = null;

    get roomManager(): IRoomManager | null
    {
        return this._roomManager;
    }

    // AS3: RoomEngine.as::_SafeStr_5591 (the area-selection manager, name derived from the getter)
    private _areaSelectionManager: IRoomAreaSelectionManager | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::get areaSelectionManager()
    get areaSelectionManager(): IRoomAreaSelectionManager
    {
        // AS3 creates the manager in init(); the port lazily creates the (currently inert) stub. See
        // RoomAreaSelectionManager for the TODO(AS3) on the interactive tile-highlight behaviour.
        this._areaSelectionManager ??= new RoomAreaSelectionManager();
        return this._areaSelectionManager;
    }

    private _connection: IConnection | null = null;

    get connection(): IConnection | null 
    {
        return this._connection;
    }

    set connection(value: IConnection | null) 
    {
        this._connection = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/_SafeCls_90.as::get isDecorateMode()
    get isDecorateMode(): boolean 
    {
        if(!this._roomSessionManager) 
        {
            return false;
        }

        const session = this._roomSessionManager.getSession(this._activeRoomId);

        return !!session && session.isUserDecorating;
    }

    private _isGameMode: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/_SafeCls_90.as::get isGameMode()
    get isGameMode(): boolean 
    {
        return this._isGameMode;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/_SafeCls_90.as::set isGameMode()
    set isGameMode(value: boolean) 
    {
        this._isGameMode = value;
    }

    protected override get dependencies(): Array<ComponentDependency<any>> 
    {
        return [
            new ComponentDependency(
                IID_RoomManager,
                (manager: IRoomManager | null) => 
                {
                    this._roomManager = manager;

                    if(manager && 'setObjectFactory' in manager) 
                    {
                        // Set the object factory on room manager
                        (manager as unknown as {
                            setObjectFactory: (f: RoomObjectFactory) => void;
                            setVisualizationFactory: (f: IRoomObjectVisualizationFactory) => void;
                        }).setObjectFactory(this._roomObjectFactory);

                        // Set the visualization factory on room manager
                        (manager as unknown as {
                            setVisualizationFactory: (f: IRoomObjectVisualizationFactory) => void;
                        }).setVisualizationFactory(this._visualizationFactory);
                    }
                },
                true // Required dependency
            ),
            new ComponentDependency(
                IID_RoomRendererFactory,
                (factory: IRoomRendererFactory | null) =>
                {
                    this._roomRendererFactory = factory;
                },
                true // Required dependency
            ),
            // AS3: _SafeCls_90.as:434 — RoomEngine takes IIDHabboWindowManager so that
            // RoomMessageHandler can raise the pick-up / builders-club placement confirms.
            new ComponentDependency(
                IID_HabboWindowManager,
                (windowManager: IHabboWindowManager | null) =>
                {
                    this._windowManager = windowManager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboConfigurationManager,
                (config: IHabboConfigurationManager | null) =>
                {
                    this._configurationManager = config;

                    // AS3's real dependency setter is `null` here - it does nothing synchronously
                    // at resolution time, relying entirely on the 'complete' listener below to call
                    // onConfigurationComplete() once configuration has actually finished loading
                    // (sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as:389-392).
                    // This port's VortexMain.ts::prepareCore() awaits HabboConfigurationManager's
                    // async download before constructing RoomEngine, so by the time this dependency
                    // resolves 'complete' has already fired to nobody and never fires again - the
                    // same race already fixed once in AvatarRenderManager.tryOnConfigurationComplete()
                    // and SessionDataManager's own IID_HabboConfigurationManager dependency. Catch up
                    // directly, deferred a microtask so the IID_SessionDataManager dependency listed
                    // below (which onConfigurationComplete() reads) finishes resolving first, matching
                    // the order a genuinely-late 'complete' would arrive in.
                    if(config?.isInitialized())
                    {
                        queueMicrotask(() => this.onConfigurationComplete());
                    }
                },
                false, // Optional - room can render with flat colors without textures
                [{type: 'complete', callback: this.onConfigurationComplete.bind(this)}]
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (sessionData: ISessionDataManager | null) => 
                {
                    this._sessionDataManager = sessionData;

                    if(sessionData) 
                    {
                        this._contentLoader.sessionDataManager = sessionData;
                    }
                },
                false // Optional - needed for furniture className lookup
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (avatarRenderer: IAvatarRenderManager | null) => 
                {
                    this._visualizationFactory.avatarRenderManager = avatarRenderer;
                },
                false // Optional - needed for avatar visualization
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => 
                {
                    this._toolbar = toolbar;
                },
                false // Optional - needed for the pickup-to-inventory icon animation
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) => 
                {
                    this._roomSessionManager = manager;
                },
                false // Optional - needed to resolve isDecorateMode from the active room session
            ),
        ];
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::get useOffsetScrolling()
    private get useOffsetScrolling(): boolean 
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::get cameraFollowDuration()
    private get cameraFollowDuration(): number 
    {
        return this._configurationManager?.getBoolean('room.camera.follow_user') ? 1000 : 0;
    }

    getRoom(roomId: number): IRoomInstance | null
    {
        return this.getRoomInstance(roomId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::get roomSessionManager()
    get roomSessionManager(): IRoomSessionManager | null
    {
        return this._roomSessionManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::contentLoaded()

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomObjectCategory()
    // AS3 delegates to the content loader (getObjectCategory), returning -2 with no
    // loader. The old hardcoded switch defaulted every unrecognised type to FURNITURE —
    // so a wall item (window_basic, poster, …) resolved to 10 (FURNITURE) instead of 20
    // (WALL), and an unknown type to 10 instead of -2. The loader's getObjectCategory is
    // faithfully ported and checks the real floor/wall/pet registries.
    getRoomObjectCategory(type: string): number
    {
        if(this._contentLoader !== null)
        {
            return this._contentLoader.getObjectCategory(type);
        }

        return -2;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::isRoomObjectContentAvailable()
    isRoomObjectContentAvailable(type: string): boolean 
    {
        return this._roomManager?.isContentAvailable(type) ?? false;
    }

    getRoomObjectWithIndex(roomId: number, index: number, category: number): IRoomObject | null 
    {
        const room = this.getRoomInstance(roomId);
        if(!room) 
        {
            return null;
        }

        return room.getObjectWithIndex(index, category);
    }

    getRoomObjectCount(roomId: number, category: number): number 
    {
        const room = this.getRoomInstance(roomId);
        if(!room) 
        {
            return 0;
        }

        return room.getObjectCount(category);
    }

    // TS-only: converts a loaded PixiJS Texture to an ImageBitmap (matching
    // IBitmapWrapperWindow.bitmap) and delivers it to each waiting listener.

    getTileCursor(roomId: number): IRoomObjectController | null 
    {
        const room = this.getRoomInstance(roomId);
        if(!room) 
        {
            return null;
        }

        return room.getObject(OBJECT_ID_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR) as IRoomObjectController | null;
    }

    getSelectionArrow(roomId: number): IRoomObjectController | null 
    {
        const room = this.getRoomInstance(roomId);
        if(!room) 
        {
            return null;
        }

        return room.getObject(OBJECT_ID_SELECTION_ARROW, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR) as IRoomObjectController | null;
    }

    getIsPlayingGame(_roomId: number): boolean 
    {
        return false; // TODO: implement game state
    }

    getActiveRoomIsPlayingGame(): boolean 
    {
        return this.getIsPlayingGame(this._activeRoomId);
    }

    isAreaSelectionMode(): boolean 
    {
        return false; // TODO: implement area selection
    }

    isMoveBlocked(): boolean 
    {
        return false; // TODO: implement move blocking
    }

    isWhereYouClickWhereYouGo(): boolean 
    {
        return true; // Default behavior
    }

    // AS3: sources/win63_client/com/sulake/habbo/room/RoomObjectEventHandler.as::SelectedRoomObjectData
    // Kept as its own simplified mechanism (not the real SelectedRoomObjectData/
    // getSelectedObjectData() storage below) — moving an already-placed object is a
    // separate, already-working flow this pass doesn't touch. Only category 10 (floor
    // furniture) is tracked here — see modifyRoomObject()'s OBJECT_MOVE case for the

    roomManagerInitialized(success: boolean): void 
    {
        if(success) 
        {
            this.events.emit(RoomEngineEvent.REE_ENGINE_INITIALIZED);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::initializeRoomObjectInsert()
    // TODO(AS3): only floor-item placement (category 10) gets the real ghost-object
    // mechanism below. Wall items (category 20) are still rejected up front: finalizing
    // a wall placement needs PlaceObjectMessageComposer's wallLocation string encode
    // (world position -> "w=x,y l=x,y r|l" — see WallDataParser.ts for the decode
    // direction), and no AS3 source available here has the inverse of
    // LegacyWallGeometry.getLocation() to port that encode from — inventing it would
    // violate the AS3-fidelity mandate. Avatar/pet placement (category 100) is a

    // AS3: sources/win63_version/habbo/room/class_34.as::contentLoaded()
    contentLoaded(type: string, success: boolean): void 
    {
        // The "room" bundle (floor/wall/landscape rasterizer data) is only ever
        // loaded through RoomManager's own placeholder-type preload
        // (RoomManager.initialize() -> getPlaceHolderTypes()), which reports back
        // exclusively through this IRoomManagerListener callback — never through
        // _contentLoaderEvents (that path is furniture-only, see loadFurnitureContent()).
        if(success && type === OBJECT_TYPE_ROOM) 
        {
            this.onRoomContentReady();
        }

        this.resolvePendingImageListeners(type);

        this.events.emit('contentLoaded', type, success);
    }

    objectInitialized(roomId: string, objectId: number, category: number): void 
    {
        this.events.emit('objectInitialized', roomId, objectId, category);
    }

    objectsInitialized(type: string): void 
    {
        this.events.emit('objectsInitialized', type);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::iconLoaded()
    iconLoaded(typeId: number, type: string, success: boolean): void 
    {
        this.events.emit('iconLoaded', typeId, type, success);

        const listeners = this._pendingThumbnailListeners.get(type);

        if(!listeners) 
        {
            log.warn(`iconLoaded(${typeId}, ${type}, ${success}): no pending listeners for key "${type}" (pending keys: ${[...this._pendingThumbnailListeners.keys()].join(', ')})`);

            return;
        }

        this._pendingThumbnailListeners.delete(type);

        const asset = success ? this.assets?.getAssetByName(type) ?? null : null;
        const texture = (asset?.content as Texture | null) ?? null;

        this.deliverIconTexture(typeId, texture, listeners);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureType()
    getFurnitureType(type: number): string | null 
    {
        return this._contentLoader?.getActiveObjectType(type) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::resetSelectedObjectData()
    // TS scope: only handles the OBJECT_PLACE branch — this storage never sees OBJECT_MOVE/

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::getWallItemType()
    getWallItemType(type: number, param: string | null = null): string | null 
    {
        return this._contentLoader?.getWallItemType(type, param) ?? null;
    }

    // separate, unstarted feature.
    initializeRoomObjectInsert(
        source: string,
        itemId: number,
        category: number,
        type: number,
        extra: string,
        stuffData: unknown = null
    ): boolean 
    {
        if(category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) 
        {
            log.warn(`Wall/avatar item placement is not implemented yet (category ${category})`);

            return false;
        }

        this._objectPlacementSource = source;

        this.setSelectedObjectData(
            this._activeRoomId, itemId, category, new Vector3d(-100, -100), new Vector3d(0),
            'OBJECT_PLACE', type, extra, stuffData as IStuffData | null
        );
        this.setObjectMoverIconSprite(type, category, false, extra);
        this.setObjectMoverIconSpriteVisible(false);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::cancelRoomObjectInsert()
    cancelRoomObjectInsert(): void 
    {
        this.resetSelectedObjectData(this._activeRoomId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::setObjectMoverIconSprite()
    // real isometric render (getFurnitureImage with forceGeneric=true), not the flat
    // inventory-grid thumbnail — matches AS3's getGenericRoomObjectImage() call here.
    // This is only ever shown as a fallback: while a valid tile is hovered, the real
    // ghost object built by handleObjectPlace() is shown instead and this icon is

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::getSelectedObjectData()
    getSelectedObjectData(roomId: number): ISelectedRoomObjectData | null 
    {
        return this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::setObjectMoverIconSpriteVisible()
    setObjectMoverIconSpriteVisible(visible: boolean): void 
    {
        if(this._moverIconSprite) this._moverIconSprite.visible = visible;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::getObjectMoverIconSpriteVisible()
    getObjectMoverIconSpriteVisible(): boolean 
    {
        return this._moverIconSprite?.visible ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::getValidRoomObjectDirection()
    // TS scope: only the generic furniture_allowed_directions branch is ported (monsterplant/

    // of this codebase's two separate IStuffData interfaces (inventory vs room).
    getFurnitureIcon(type: number, listener: IGetImageListener, param: string | null = null, stuffData: unknown = null): ImageResult 
    {
        const activeType = this._contentLoader?.getActiveObjectType(type) ?? null;
        const colorIndex = this._contentLoader ? String(this._contentLoader.getActiveObjectColorIndex(type)) : '';

        return this.getGenericRoomObjectThumbnail(activeType, colorIndex, listener, param, stuffData);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::getWallItemIcon()
    getWallItemIcon(type: number, listener: IGetImageListener, param: string | null = null): ImageResult 
    {
        const wallType = this._contentLoader?.getWallItemType(type, param) ?? null;
        const colorIndex = this._contentLoader ? String(this._contentLoader.getWallItemColorIndex(type)) : '';

        return this.getGenericRoomObjectThumbnail(wallType, colorIndex, listener, param, null);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getFurnitureImage()
    getFurnitureImage(
        type: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor: number = 0,
        param: string | null = null,
        state: number = -1,
        frameCount: number = -1,
        stuffData: unknown = null,
        forceGeneric: boolean = false
    ): ImageResult 
    {
        const activeType = this._contentLoader?.getActiveObjectType(type) ?? null;
        const colorIndex = this._contentLoader ? String(this._contentLoader.getActiveObjectColorIndex(type)) : '';

        if(scale === 1 && listener !== null && !forceGeneric) 
        {
            return this.getGenericRoomObjectThumbnail(activeType, colorIndex, listener, param, stuffData);
        }

        return this.getGenericRoomObjectImage(activeType, colorIndex, direction, scale, listener, backgroundColor, param, stuffData, state, frameCount);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::handleObjectPlace()
    // TS scope: category 10 (floor furniture) only — see initializeRoomObjectInsert()'s
    // TODO(AS3) for why wall/avatar categories never reach this (their SelectedRoomObjectData

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getWallItemImage()
    getWallItemImage(
        type: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor: number = 0,
        param: string | null = null,
        state: number = -1,
        frameCount: number = -1
    ): ImageResult 
    {
        const wallType = this._contentLoader?.getWallItemType(type, param) ?? null;
        const colorIndex = this._contentLoader ? String(this._contentLoader.getWallItemColorIndex(type)) : '';

        if(scale === 1 && listener !== null) 
        {
            return this.getGenericRoomObjectThumbnail(wallType, colorIndex, listener, param, null);
        }

        return this.getGenericRoomObjectImage(wallType, colorIndex, direction, scale, listener, backgroundColor, param, null, state, frameCount);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::placeObject()
    // TS scope: only the "inventory" floor-furniture placement source (FurniModel.ts, the
    // only caller today) is wired — AS3's stickie/present/rentable_bot-specific composer
    // branches for other placement sources aren't ported.
    // Keeps the existing -id sign convention for the emitted REOE_PLACED objectId (relied

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomImage()
    getRoomImage(
        floorType: string | null,
        wallType: string | null,
        landscapeType: string | null,
        scale: number,
        listener: IGetImageListener,
        extra: string | null = null
    ): ImageResult 
    {
        let payload = `${floorType ?? ''}\n${wallType ?? ''}\n${landscapeType ?? ''}\n`;

        if(extra !== null) payload += extra;

        return this.getGenericRoomObjectImage('room', payload, new Vector3d(), scale, listener);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureIcon()
    // `stuffData` typed `unknown` because it's currently unused by
    // getGenericRoomObjectThumbnail() (Phase 1), and callers may hold either

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetImage()
    getPetImage(
        type: number,
        paletteId: number,
        color: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        fullImage: boolean = true,
        backgroundColor: number = 0,
        customParts: { layerId: number; partId: number; paletteId: number }[] | null = null,
        posture: string | null = null
    ): ImageResult 
    {
        let payload = `${type} ${paletteId} ${color.toString(16)}`;

        if(!fullImage) payload += ' head';

        if(customParts !== null) 
        {
            payload += ` ${customParts.length}`;

            for(const part of customParts) payload += ` ${part.layerId} ${part.partId} ${part.paletteId}`;
        }

        const petType = this._contentLoader?.getPetType(type) ?? null;

        return this.getGenericRoomObjectImage(petType, payload, direction, scale, listener, backgroundColor, null, null, -1, -1, posture);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetColor()
    getPetColor(typeId: number, colorId: number): PetColorResult | null 
    {
        if(this._contentLoader != null) return this._contentLoader.getPetColor(typeId, colorId);

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetColorsByTag()
    // Returns null (not an empty array) with no content loader, matching AS3 - the caller in
    // PetPreviewCatalogWidget iterates the result, so the distinction is preserved rather than
    // smoothed over.
    getPetColorsByTag(typeId: number, tag: string): PetColorResult[] | null 
    {
        if(this._contentLoader != null) return this._contentLoader.getPetColorsByTag(typeId, tag);

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetLayerIdForTag()
    getPetLayerIdForTag(typeId: number, tag: string): number 
    {
        if(this._contentLoader != null) return this._contentLoader.getPetLayerIdForTag(typeId, tag);

        return -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetDefaultPalette()
    getPetDefaultPalette(typeId: number, tag: string): PetColorResult | null 
    {
        if(this._contentLoader != null) return this._contentLoader.getPetDefaultPalette(typeId, tag);

        return null;
    }

    // per-format payload) until it exists.
    getRoomObjectImage(
        roomId: number,
        objectId: number,
        category: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor: number = 0
    ): ImageResult 
    {
        let type: string | null = null;
        let extra: string | null = null;
        let param = '';
        const stuffData: unknown = null;
        let state = -1;
        let objectFound = false;

        const room = this.getRoomInstance(roomId);

        if(room !== null) 
        {
            const object = room.getObject(objectId, category);

            if(object !== null && object.getModel() !== null) 
            {
                type = object.getType();
                state = object.getId();
                objectFound = true;

                switch(category) 
                {
                    case 10:
                    case 20:
                        param = String(object.getModel().getNumber('furniture_color'));
                        extra = object.getModel().getString('furniture_extras');
                        break;
                    case 100:
                        param = object.getModel().getString('figure');
                }
            }
        }

        // TS deviation: AS3's caller for this method (InfoStandWidgetHandler::handleGetFurniInfoMessage())
        // passes listener=null, making getGenericRoomObjectImage() take its synchronous "content
        // already available" branch unconditionally (the pending/isRoomObjectContentAvailable() gate
        // is skipped entirely whenever no listener is given). This port can't do a truly synchronous
        // capture (ImageBitmap conversion is always async - see ImageResult.ts), so listener is never
        // null here; `objectFound` recreates the same guarantee AS3's callers rely on instead - an
        // object that's actually alive in the room already has its content loaded by definition, so
        // there is no need to wait on a future resolvePendingImageListeners() pass that (for content
        // loaded long before this call) may never fire again.
        return this.getGenericRoomObjectImage(type, param, direction, scale, listener, backgroundColor, extra, stuffData, -1, -1, null, state, objectFound);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getGenericRoomObjectImage()
    // TS deviation: AS3 returns a synchronously-populated BitmapData when content is already
    // available (id=0) and the caller reads result.data directly with no further callback.
    // ImageBitmap conversion is always async in the browser (see ImageResult.ts), so this port
    // always resolves via the pending id>0 path and delivers through imageReady()/imageFailed()
    // - same convention already established by getGenericRoomObjectThumbnail(). The "content
    // already available" branch below therefore must NOT reset result.id to 0 like AS3 does:
    // it still delivers asynchronously (createImageBitmap() is a Promise), so the id returned to
    // the caller has to keep matching the id used in that later imageReady()/imageFailed() call.
    // `forceImmediate` is a TS-only addition (no AS3 equivalent - see getRoomObjectImage()'s own
    // comment): forces this same "capture now, don't wait" branch even when
    // isRoomObjectContentAvailable() says no, for callers that already know their content is loaded.
    getGenericRoomObjectImage(
        type: string | null,
        param: string,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener | null,
        backgroundColor: number = 0,
        extra: string | null = null,
        stuffData: unknown = null,
        state: number = -1,
        frameCount: number = -1,
        posture: string | null = null,
        _originalId: number = -1,
        forceImmediate: boolean = false
    ): ImageResult 
    {
        const result = new ImageResult();

        result.id = -1;

        if(!this._roomManager || type === null) return result;

        let room = this._roomManager.getRoom(TEMPORARY_ROOM_ID);

        if(room === null)
        {
            room = this._roomManager.createRoom(TEMPORARY_ROOM_ID, null);

            if(room === null) return result;
        }

        const category = this._contentLoader?.getObjectCategory(type) ?? -2;

        this._imageIdCounter++;

        const objectId = this._imageIdCounter;

        const object = room.createRoomObject(objectId, type, category) as IRoomObjectController | null;

        if(object === null || object.getModelController() === null || object.getEventHandler() === null) return result;

        const modelController = object.getModelController();

        switch(category) 
        {
            case 10:
            case 20:
                modelController.setNumber('furniture_color', Number(param));
                modelController.setString('furniture_extras', extra ?? '');
                break;
            case 100:
                if(type === 'user' || type === 'bot' || type === 'rentable_bot' || type === 'pet') 
                {
                    modelController.setString('figure', param);
                    break;
                }

                {
                    const petFigure = new PetFigureData(param);

                    modelController.setNumber('pet_palette_index', petFigure.paletteId);
                    modelController.setNumber('pet_color', petFigure.color);

                    if(petFigure.headOnly) modelController.setNumber('pet_head_only', 1);

                    if(petFigure.customLayerIds.length > 0) 
                    {
                        modelController.setNumberArray('pet_custom_layer_ids', petFigure.customLayerIds);
                        modelController.setNumberArray('pet_custom_part_ids', petFigure.customPartIds);
                        modelController.setNumberArray('pet_custom_palette_ids', petFigure.customPaletteIds);
                    }

                    if(posture !== null) modelController.setString('figure_posture', posture);
                }

                break;
            case 0:
                this.initializeRoomForGettingImage(object, param);
        }

        object.setDirection(direction);
        object.setState(state, 0);

        const visualization = object.getVisualization();

        if(visualization === null)
        {
            room.disposeObject(objectId, category);

            return result;
        }

        if(state > -1 || stuffData) 
        {
            const dataUpdateMessage = new RoomObjectDataUpdateMessage(state, stuffData as IStuffData | null);

            object.getEventHandler()?.processUpdateMessage(dataUpdateMessage);
        }

        const geometry = new RoomGeometry(scale, new Vector3d(-135, 30, 0), new Vector3d(11, 11, 5));

        visualization.update(geometry, 0, true, false);

        for(let i = 0; i < frameCount; i++) 
        {
            visualization.update(geometry, 0, true, false);
        }

        result.id = objectId;

        if(!forceImmediate && !this.isRoomObjectContentAvailable(type) && listener !== null) 
        {
            // AS3 also captures a (necessarily blank, since content isn't loaded yet) image here
            // and stores it on the result - this port never trusts a synchronous ImageResult.data
            // (see ImageResult.ts), so that first blank capture is skipped entirely. The object
            // stays alive; resolvePendingImageListeners() re-renders and delivers for real once
            // contentLoaded() fires.
            this._pendingImageListeners.set(objectId, listener);
            modelController.setNumber('image_query_scale', scale, true);
        }
        else 
        {
            const canvas = visualization.getImage(backgroundColor, _originalId);

            room.disposeObject(objectId, category);

            // AS3 ends this branch with `result.id = 0` and the image already on `result.data` -
            // the "synchronous hit" contract ImageResult's own header documents. This port used to
            // hand the canvas to the async createImageBitmap() and deliver through imageReady()
            // instead, on the stated grounds that Texture->ImageBitmap "is inherently asynchronous
            // in the browser". It is not: OffscreenCanvas.transferToImageBitmap() is synchronous,
            // and this codebase already relies on that elsewhere (ColourGridCatalogWidget).
            //
            // Honouring the real contract is not cosmetic. Callers that follow AS3 - every pet
            // catalog widget - call onWidgetsInitialized() from imageReady(), which re-dispatches
            // SelectProduct -> updateImage() -> getPetImage(). With an always-async result that
            // re-enters imageReady() and spins forever, allocating a temporary-room object per
            // iteration. Returning synchronously ends the chain exactly where AS3 ends it.
            if(canvas !== null) 
            {
                const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
                const offscreenCtx = offscreen.getContext('2d');

                if(offscreenCtx !== null) 
                {
                    offscreenCtx.drawImage(canvas, 0, 0);

                    result.data = offscreen.transferToImageBitmap();
                    result.id = 0;

                    return result;
                }
            }

            if(listener !== null) listener.imageFailed(objectId);
        }

        geometry.dispose();

        return result;
    }

    createRoomInstance(roomId: number): IRoomInstance | null 
    {
        if(!this._roomManager) 
        {
            log.warn('RoomManager not available');
            return null;
        }

        const roomIdStr = this.getRoomIdentifier(roomId);

        // Check if room already exists
        let room = this._roomManager.getRoom(roomIdStr);

        if(room) 
        {
            this.getRoomInstanceData(roomId);

            return room;
        }

        // Create via RoomManager
        room = this._roomManager.createRoom(roomIdStr, null);

        if(!room) 
        {
            return null;
        }

        // Create room object and cursors.
        // These go through RoomManager.createRoomObject which handles the internal creation.
        room.createRoomObject(OBJECT_ID_ROOM, OBJECT_TYPE_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);
        room.createRoomObject(OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR);

        if(this._configurationManager?.getBoolean('avatar.widget.enabled') !== true) 
        {
            room.createRoomObject(OBJECT_ID_SELECTION_ARROW, OBJECT_TYPE_SELECTION_ARROW, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR);
        }

        this.getRoomInstanceData(roomId);

        return room;
    }

    disposeRoomInstance(roomId: number): void 
    {
        if(!this._roomManager) 
        {
            return;
        }

        const roomIdStr = this.getRoomIdentifier(roomId);
        this._roomManager.disposeRoom(roomIdStr);

        this._roomData.delete(roomIdStr);
        this._ownUserIds.delete(roomId);
        this._initializedRooms.delete(roomId);

        const instanceData = this._roomInstanceData.get(roomId);

        if(instanceData !== undefined) 
        {
            instanceData.roomCamera.dispose();
            instanceData.furniStackingHeightMap?.dispose();
            instanceData.tileObjectMap?.dispose();
            instanceData.selectedObjectData?.dispose();
            this._roomInstanceData.delete(roomId);
        }

        // Dispose rendering canvas
        this.disposeRenderingCanvas(roomId);

        this.events.emit(RoomEngineEvent.REE_DISPOSED, new RoomEngineEvent(RoomEngineEvent.REE_DISPOSED, roomId));
    }

    getRoomInstance(roomId: number): IRoomInstance | null 
    {
        if(!this._roomManager) 
        {
            return null;
        }

        const roomIdStr = this.getRoomIdentifier(roomId);

        return this._roomManager.getRoom(roomIdStr);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::_Str_22095() (getGenericRoomObjectThumbnail)
    // TS simplification: uses a simple incrementing id counter instead of AS3's
    // reserve/free NumberIdGenerator pool (no functional difference for callers,

    setActiveRoom(roomId: number): void 
    {
        this._activeRoomId = roomId;
    }

    getActiveRoomId(): number 
    {
        return this._activeRoomId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_2223.as::set furniStackingHeightMap()
    // Rebuilding the tileObjectMap here (same width/height) whenever the stacking map is
    // replaced matches AS3's RoomInstanceData setter, which does the same as a side effect.
    setFurniStackingHeightMap(roomId: number, map: FurniStackingHeightMap): void 
    {
        const instanceData = this.getRoomInstanceData(roomId);

        instanceData.furniStackingHeightMap?.dispose();
        instanceData.furniStackingHeightMap = map;

        instanceData.tileObjectMap?.dispose();
        instanceData.tileObjectMap = new TileObjectMap(map.width, map.height);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/RoomEngine.as::getFurniStackingHeightMap()
    getFurniStackingHeightMap(roomId: number): FurniStackingHeightMap | null 
    {
        return this._roomInstanceData.get(roomId)?.furniStackingHeightMap ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getTileObjectMap()
    getTileObjectMap(roomId: number): TileObjectMap | null 
    {
        return this._roomInstanceData.get(roomId)?.tileObjectMap ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::refreshTileObjectMap()
    refreshTileObjectMap(roomId: number, _reason: string): void
    {
        const map = this.getTileObjectMap(roomId);

        // AS3 populates the map only when it exists, but recalibrateMovements() runs
        // unconditionally afterwards (_SafeCls_90.as:4660-4664).
        if(map !== null)
        {
            const objects = this.getRoomInstance(roomId)?.getObjects(RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) ?? [];

            map.populate(objects);
        }

        this.recalibrateMovements(roomId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::recalibrateMovements()
    // After the tile map rebuilds, replay the cached mouse-move so an in-progress
    // OBJECT_MOVE/OBJECT_PLACE drag ghost re-snaps to the new stacking height instead
    // of keeping the stale one until the next real mouse-move.
    private recalibrateMovements(roomId: number): void
    {
        const selectedObjectData = this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;

        if(selectedObjectData === null)
        {
            return;
        }

        const operation = selectedObjectData.operation;

        if(operation !== 'OBJECT_MOVE' && operation !== 'OBJECT_PLACE')
        {
            return;
        }

        if(this._moveMouseEventCache === null || selectedObjectData.category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            return;
        }

        const tileX = this._moveMouseEventCache.x;
        const tileY = this._moveMouseEventCache.y;

        if(operation === 'OBJECT_PLACE')
        {
            this.handleObjectPlace(roomId, tileX, tileY);
        }
        else
        {
            this.handleObjectMove(roomId, tileX, tileY);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetType()
    // Resolves a pet's content type from its figure — the figure's first space-separated token is
    // the pet type id, which RoomContentLoader maps to the asset library name. AS3's own fallback
    // when it has no content loader is the literal 'pet'; kept, even though that type resolves to
    // nothing, because it is the AS3 behaviour and the loader is never actually null here.
    private getPetType(figure: string | null): string | null
    {
        if(figure !== null)
        {
            const parts = figure.split(' ');

            if(parts.length > 1)
            {
                const typeId = parseInt(parts[0], 10);

                if(this._contentLoader !== null) return this._contentLoader.getPetType(typeId);

                return RoomObjectUserTypes.PET;
            }
        }

        return null;
    }

    addRoomObjectUser(
        roomId: number,
        id: number,
        location: IVector3d,
        direction: IVector3d,
        type: string
    ): boolean
    {
        const room = this.getRoomInstance(roomId);
        if(!room) 
        {
            return false;
        }

        // AS3 (addObjectUser -> createObjectUser) passes the resolved object *type* straight
        // through; this port used to map it to a RoomObjectLogicEnum value first and pass that
        // instead. The mapping was a pure identity — RoomObjectLogicEnum and RoomObjectUserTypes
        // declare the same four strings ('user'/'pet'/'bot'/'rentable_bot') — so it changed nothing
        // for users and bots, but it also *undid* addObjectUser()'s pet-type resolution: a pet
        // arriving here as its real content type ('monsterplant', ...) matched none of the cases
        // and silently fell back to 'user'. Passing `type` is what AS3 does and is identical for
        // every previously-working case.
        //
        // RoomManager.createRoomObject() then derives the logic and visualization from this type
        // via RoomContentLoader (getLogicType()/getVisualizationType() off the bundle's index), so
        // a real pet type resolves to PetLogic + AnimatedPetVisualization the same way 'user'
        // resolves to AvatarLogic + AvatarVisualization.
        const object = room.createRoomObject(id, type, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        if(!object) 
        {
            return false;
        }

        (object as IRoomObjectController).setLocation(location);
        (object as IRoomObjectController).setDirection(direction);

        this.events.emit(
            RoomEngineObjectEvent.REOE_ADDED,
            new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER)
        );

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomObjectImage()
    // TODO(AS3): the furniture_data_format != 0 branch needs a stuff-data-wrapper factory
    // equivalent to AS3's _SafeCls_2295.getStuffDataWrapperForType(), which isn't ported - that
    // branch's stuffData stays null (matches "no format-specific data" rather than the real

    addRoomObjectFurniture(
        roomId: number,
        id: number,
        typeId: number,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        extra: string | null,
        expiryTime: number,
        usagePolicy: number,
        ownerId: number,
        ownerName: string | null,
        _synchronize = true,
        data: IStuffData | null = null
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        // Resolve className from typeId using SessionDataManager
        const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        // AS3: _SafeCls_90.as::createObjectFurniture() passes the real furniture classname
        // (not a pre-resolved logic type) into createObject() - RoomManager.createRoomObject()
        // resolves visualizationType/logicType/content-loading itself from this className.
        // Passing logicType here (as this used to) made loadObjectContent() try to fetch
        // assets for a fake type like "furniture_multistate", which has none - the object
        // got stuck on placeholder content forever since no real content load ever completes
        // for a type that doesn't exist.
        const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        if(!object) 
        {
            return false;
        }

        (object as IRoomObjectController).setLocation(location);
        (object as IRoomObjectController).setDirection(direction);

        const model = (object as IRoomObjectController).getModelController();

        if(model) 
        {
            // AS3: _SafeCls_90.as::addObjectFurnitureFromData() - furniture_color was never written
            // here, so FurnitureVisualization::updateObject()'s getNumber('furniture_color') read
            // always came back unset and every colorized furni (chair_norja*2, bowl*3, ...) rendered
            // with getColor()'s 0xFFFFFF default tint - i.e. white - instead of its palette color.
            // The icon/image paths (getFurnitureIcon()/getFurnitureImage()) already passed the index
            // through, which is why the same item looked correct in the catalog but white in-room.
            model.setNumber(RoomObjectVariableEnum.FURNITURE_COLOR, this.getFurnitureColorIndex(typeId), true);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
            // AS3: _SafeCls_90.as::addObjectFurnitureFromData() - expiry_time/expirty_timestamp/
            // usage_policy were never written here, so InfoStandWidgetHandler's getNumber() reads
            // (both default to NaN when unset) always failed their === 1/=== 2 usage-policy checks
            // and always computed a NaN rent-expiration - the infostand's USE button and rent
            // extend/buyout buttons could never show regardless of server data or rights.
            model.setNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIME, expiryTime);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIMESTAMP, Date.now());
            model.setNumber(RoomObjectVariableEnum.FURNITURE_USAGE_POLICY, usagePolicy);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);

            if(ownerName) 
            {
                model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
            }

            // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as:3046
            // AS3 writes only the numeric FURNITURE_EXTRA here (its DTO's `extra` is a Number), not
            // the string FURNITURE_EXTRAS. This port flattened the DTO into parameters and typed
            // `extra` as string, then built its own FURNITURE_EXTRAS convention that RoomEngine
            // reads back at :828 and :3953. Aligning means changing this signature to a number and
            // following it through IRoomEngine/RoomPreviewer — out of scope here. Currently
            // harmless: the only AS3 reader of FURNITURE_EXTRA is the custom-stack-height widget
            // handler (_SafeCls_3852.as:98), which is not ported.
            if(extra)
            {
                model.setString(RoomObjectVariableEnum.FURNITURE_EXTRAS, extra);
            }
        }

        // AS3: _SafeCls_90.as::addObjectFurnitureFromData() calls updateObjectFurniture() right
        // after createObjectFurniture(), which dispatches a RoomObjectDataUpdateMessage carrying
        // the real IStuffData through the object's own event handler - this port was previously
        // dropping `data` entirely (both call sites either had no parameter for it or collapsed it
        // to `extra.toString()`/`getLegacyString()`), so format-2+ stuff data (e.g. guild-colored
        // furniture) never reached FurnitureGuildCustomizedLogic and rendered with un-substituted
        // base sprite content instead of the cropped/offset badge thumbnail.
        if(data) 
        {
            const eventHandler = (object as IRoomObjectController).getEventHandler();

            eventHandler?.processUpdateMessage(new RoomObjectDataUpdateMessage(state, data));
        }

        // Trigger furniture asset loading
        this.loadFurnitureContent(roomId, id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        this.events.emit(
            RoomEngineObjectEvent.REOE_ADDED,
            new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        );

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::initializeRoomForGettingImage()
    // TODO(AS3): the tile-height/geometry init (AS3 builds a RoomPlaneParser XML and feeds it to
    // eventHandler.initialize()) isn't ported - the RoomVisualization event handler's initialize()
    // data-shape contract for a "room" object isn't confirmed on this port (RoomPreviewer's own
    // room setup goes through the higher-level IRoomEngine.initializeRoom(), a different path that
    // doesn't apply to a single free-standing "room" object). Floor/wall/landscape type + the door
    // mask are wired for real below; the room's tile geometry is not, so getRoomImage() output will

    addRoomObjectWallItem(
        roomId: number,
        id: number,
        typeId: number,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        extra: string | null,
        expiryTime: number,
        usagePolicy: number,
        ownerId: number,
        ownerName: string | null
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        // Resolve className from typeId using SessionDataManager
        const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

        // AS3: _SafeCls_90.as::createObjectFurniture()/createObject() - see addRoomObjectFurniture()'s
        // comment above for why the real classname (not a pre-resolved logic type) must be passed here.
        const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

        if(!object) 
        {
            return false;
        }

        (object as IRoomObjectController).setLocation(location);
        (object as IRoomObjectController).setDirection(direction);

        const model = (object as IRoomObjectController).getModelController();

        if(model) 
        {
            // AS3: _SafeCls_90.as::addObjectWallItemFromData() - same furniture_color gap as the
            // floor path above. AS3 writes this one non-immutable (unlike the floor path's `true`).
            model.setNumber(RoomObjectVariableEnum.FURNITURE_COLOR, this.getWallItemColorIndex(typeId), false);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
            // AS3: _SafeCls_90.as::addObjectWallItemFromData() - see addRoomObjectFurniture()'s
            // matching comment above; the wall-item path had the exact same gap.
            model.setNumber(RoomObjectVariableEnum.FURNITURE_USAGE_POLICY, usagePolicy);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIME, expiryTime);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_EXPIRY_TIMESTAMP, Date.now());
            model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);

            if(ownerName) 
            {
                model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
            }

            // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as:3046
            // AS3 writes only the numeric FURNITURE_EXTRA here (its DTO's `extra` is a Number), not
            // the string FURNITURE_EXTRAS. This port flattened the DTO into parameters and typed
            // `extra` as string, then built its own FURNITURE_EXTRAS convention that RoomEngine
            // reads back at :828 and :3953. Aligning means changing this signature to a number and
            // following it through IRoomEngine/RoomPreviewer — out of scope here. Currently
            // harmless: the only AS3 reader of FURNITURE_EXTRA is the custom-stack-height widget
            // handler (_SafeCls_3852.as:98), which is not ported.
            if(extra)
            {
                model.setString(RoomObjectVariableEnum.FURNITURE_EXTRAS, extra);
            }
        }

        this.loadFurnitureContent(roomId, id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

        return true;
    }

    getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return null;
        }

        return room.getObject(objectId, category);
    }

    disposeRoomObject(roomId: number, objectId: number, category: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const success = room.disposeObject(objectId, category);

        if(success) 
        {
            this.events.emit(
                RoomEngineObjectEvent.REOE_REMOVED,
                new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_REMOVED, roomId, objectId, category)
            );
        }

        return success;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::modifyRoomObject()
    modifyRoomObject(objectId: number, category: number, action: string): boolean 
    {
        const object = this.getRoomObject(this._activeRoomId, objectId, category);

        switch(action) 
        {
            // AS3: _SafeCls_1821.as::modifyRoomObject() "OBJECT_ROTATE_POSITIVE"/"OBJECT_ROTATE_NEGATIVE" case
            case 'OBJECT_ROTATE_POSITIVE':
            case 'OBJECT_ROTATE_NEGATIVE': {
                if(!object || !this._connection) return false;

                const controller = object as IRoomObjectController;
                const forward = action === 'OBJECT_ROTATE_POSITIVE';
                const nextDirection = this.getValidRoomObjectDirection(controller, forward);
                const stackingMap = this.getFurniStackingHeightMap(this._activeRoomId);

                if(!this.validateFurnitureDirection(controller, new Vector3d(nextDirection), stackingMap)) return false;

                const location = controller.getLocation();

                this._connection.send(new MoveObjectMessageComposer(objectId, Math.trunc(location.x), Math.trunc(location.y), nextDirection / 45));

                return true;
            }
            case 'OBJECT_PICKUP':
            case 'OBJECT_EJECT': {
                if(this._connection) 
                {
                    this._connection.send(new PickupObjectMessageComposer(objectId, category));
                }

                if(object && (category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE || category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)) 
                {
                    this.animatePickupToInventory(objectId, category, object);
                }

                return this.disposeRoomObject(this._activeRoomId, objectId, category);
            }
            // AS3: _SafeCls_1821.as::modifyRoomObject() "OBJECT_MOVE" case
            case 'OBJECT_MOVE': {
                if(category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) return false;
                if(!object) return false;

                const controller = object as IRoomObjectController;

                this.setObjectAlphaMultiplier(controller, 0.5);
                this.setSelectedObjectData(
                    this._activeRoomId, objectId, category, controller.getLocation(), controller.getDirection(), 'OBJECT_MOVE'
                );
                this.setObjectMoverIconSprite(objectId, category, true);
                this.setObjectMoverIconSpriteVisible(false);

                return true;
            }
            default:
                log.warn(`modifyRoomObject: action not implemented yet: ${action}`);

                return false;
        }
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::useRoomObjectInActiveRoom()
    useRoomObjectInActiveRoom(objectId: number, category: number): boolean 
    {
        const object = this.getRoomObject(this._activeRoomId, objectId, category);
        const handler = object?.getMouseHandler() as IRoomObjectEventHandler | null;

        if(handler?.useObject) 
        {
            handler.useObject();

            return true;
        }

        return false;
    }

    // doesn't exist yet. Low value without the branding widget itself.
    modifyRoomObjectDataWithMap(_objectId: number, _category: number, _action: string, _data: Map<string, string>): boolean 
    {
        log.warn('modifyRoomObjectDataWithMap: not implemented yet');

        return false;
    }

    updateRoomObjectUser(
        roomId: number,
        objectId: number,
        location: IVector3d | null,
        targetLocation: IVector3d | null,
        direction: IVector3d | null,
        headDirection: number,
        canStandUp: boolean,
        baseY: number,
        animationTime: number = NaN,
        skipPositionUpdate: boolean = false,
        jumpingPower: number = NaN
    ): boolean
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
        const handler = object?.getEventHandler() ?? null;
        const model = object?.getModel() ?? null;

        if(!object || handler === null || model === null) 
        {
            return false;
        }

        const resolvedLocation = location ?? object.getLocation();
        const resolvedDirection = direction ?? object.getDirection();
        let resolvedHeadDirection = headDirection;

        if(Number.isNaN(resolvedHeadDirection)) 
        {
            const modelHeadDirection = model.getNumber(RoomObjectVariableEnum.HEAD_DIRECTION);

            resolvedHeadDirection = Number.isNaN(modelHeadDirection) ? 0 : modelHeadDirection;
        }

        let resolvedBaseY = baseY;
        const roomZScale = room.getNumber('room_z_scale');

        if(!Number.isNaN(roomZScale) && roomZScale !== 0) 
        {
            resolvedBaseY = resolvedBaseY / roomZScale;
        }

        let avatarLocation = resolvedLocation;

        if(resolvedLocation !== null && resolvedBaseY !== 0) 
        {
            avatarLocation = new Vector3d(resolvedLocation.x, resolvedLocation.y, resolvedLocation.z + resolvedBaseY);
        }

        const avatarMessage = new RoomObjectAvatarUpdateMessage(
            this.fixedUserLocation(roomId, avatarLocation),
            this.fixedUserLocation(roomId, targetLocation),
            resolvedDirection,
            resolvedHeadDirection,
            canStandUp,
            resolvedBaseY,
            animationTime,
            skipPositionUpdate,
            jumpingPower
        );

        handler.processUpdateMessage(avatarMessage);

        return true;
    }

    updateRoomObjectUserFigure(
        roomId: number,
        objectId: number,
        figure: string,
        gender: string | null,
        clubLevel: string | null,
        isRiding: boolean
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarFigureUpdateMessage(figure, gender ?? 'M', '', isRiding);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserPosture(roomId: number, objectId: number, posture: string, parameter: string): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarPostureUpdateMessage(posture, parameter);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserGesture(roomId: number, objectId: number, gesture: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarGestureUpdateMessage(gesture);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserEffect(roomId: number, objectId: number, effect: number, delay = 0): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarEffectUpdateMessage(effect, delay);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserChat(roomId: number, objectId: number, numberOfWords: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarChatUpdateMessage(numberOfWords);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserTyping(roomId: number, objectId: number, isTyping: boolean): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarTypingUpdateMessage(isTyping);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserDance(roomId: number, objectId: number, danceStyle: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarDanceUpdateMessage(danceStyle);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserSleep(roomId: number, objectId: number, isSleeping: boolean): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarSleepUpdateMessage(isSleeping);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserCarryObject(roomId: number, objectId: number, itemType: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarCarryObjectUpdateMessage(itemType);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    updateRoomObjectUserSign(roomId: number, objectId: number, signType: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        const message = new RoomObjectAvatarSignUpdateMessage(signType);

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    // AS3: sources/win63_client/com/sulake/habbo/room/RoomObjectEventHandler.as::modifyRoomObject()
    // TODO(AS3): OBJECT_MOVE only covers floor furniture (category 10), matching
    // the existing wall-item scope cut in initializeRoomObjectInsert(). It also
    // skips FurniStackingHeightMap validateFurnitureLocation() (every hovered
    // tile is treated as valid client-side, same simplification already made by
    // the catalog-placement flow above — the server is authoritative and would
    // reject an illegal spot), and there's no cancel/right-click binding yet
    // (shared gap with the unbuilt furniture-context-menu widget).
    // Rotation here also skips AS3's `furniture_allowed_directions` validation
    // (some furniture only rotates through a subset of the 8 compass directions)

    setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

        if(!object || !object.getEventHandler()) 
        {
            return false;
        }

        this.setRoomOwnObjectId(roomId, objectId);

        const message = new RoomObjectAvatarOwnMessage();

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    // AS3: sources/win63_client/com/sulake/habbo/room/RoomObjectEventHandler.as::resetSelectedObjectData()
    // Reverts the semi-transparent preview back to its pre-move location/alpha
    // without notifying the server — used when a move is abandoned by starting

    // AS3: sources/win63_2023_version/com/sulake/habbo/room/RoomEngine.as::update()
    update(time: number): void 
    {
        if(this._roomManager) 
        {
            // TODO(AS3): RoomEngine.as::createRoomFurniture() — deferred furniture
            // queue processing at the top of update() is not ported yet.
            this._roomManager.update(time);

            // AS3 iterates ALL room instances and updates each renderer —
            // not only the active room. This is what drives rendering of
            // window-hosted rooms such as the RoomPreviewer's preview room.
            const count = this._roomManager.getRoomCount();

            for(let i = 0; i < count; i++) 
            {
                const room = this._roomManager.getRoomWithIndex(i);
                const renderer = room?.getRenderer();

                if(renderer) 
                {
                    renderer.update(time);
                }
            }

            this.updateRoomCameras(time);
        }
    }

    // than reacting to specific window events.
    setTicker(ticker: Ticker): void 
    {
        this._ticker?.remove(this.onTickerUpdate);
        this._ticker = ticker;
        this._ticker.add(this.onTickerUpdate);
    }

    registerCanvasSyncCallback(callback: () => void): void 
    {
        this._canvasSyncCallbacks.add(callback);
    }

    // AS3: sources/win63_client/com/sulake/habbo/room/RoomEngine.as::disposeObjectFurniture()/disposeObjectWallItem()
    // TODO(AS3): skips the `furniture_disable_picking_animation` model flag check
    // and AS3's stuff-data-wrapper lookup for the icon param — uses the plain
    // furniture_type_id icon, which is correct for the common case but won't
    // reflect item-specific customization (e.g. a poster's chosen image) in the

    unregisterCanvasSyncCallback(callback: () => void): void 
    {
        this._canvasSyncCallbacks.delete(callback);
    }

    initializeRoomVisuals(
        roomId: number,
        floorType: string,
        wallType: string,
        landscapeType: string,
        worldType: number
    ): void 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return;
        }

        const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

        if(roomObject) 
        {
            const model = roomObject.getModelController();

            if(model) 
            {
                model.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, floorType, true);
                model.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, wallType, true);
                model.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, landscapeType, true);
                model.setNumber(RoomObjectVariableEnum.ROOM_WORLD_TYPE, worldType, true);
            }
        }

        this.events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::updateObjectRoom()
    // TODO(AS3): the "room object doesn't exist yet" branch (buffering the update until the room
    // object is created) is decompiler-corrupted in win63_version (`null.floorType = param2`-style
    // lines that cannot be the real code) - not ported; this always requires the room object to
    // already exist, matching every current call site (live property pushes after room entry).
    updateObjectRoom(roomId: number, floorType?: string | null, wallType?: string | null, landscapeType?: string | null, skipModelUpdate: boolean = false): boolean 
    {
        const room = this.getRoomInstance(roomId);
        const roomObject = room?.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController | null;

        if(!roomObject) return false;

        const eventHandler = roomObject.getEventHandler();

        if(!eventHandler) return false;

        if(floorType != null) 
        {
            if(room && !skipModelUpdate) room.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, floorType);

            eventHandler.processUpdateMessage(new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_FLOOR_UPDATE, floorType));
        }

        if(wallType != null) 
        {
            if(room && !skipModelUpdate) room.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, wallType);

            eventHandler.processUpdateMessage(new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_WALL_UPDATE, wallType));
        }

        if(landscapeType != null) 
        {
            if(room && !skipModelUpdate) room.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, landscapeType);

            eventHandler.processUpdateMessage(new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_LANDSCAPE_UPDATE, landscapeType));
        }

        return true;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::updateObjectRoomVisibilities()
    updateObjectRoomVisibilities(roomId: number, wallsVisible: boolean, floorVisible: boolean = true): boolean 
    {
        const room = this.getRoomInstance(roomId);
        const roomObject = room?.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController | null;
        const eventHandler = roomObject?.getEventHandler();

        if(!eventHandler) return false;

        eventHandler.processUpdateMessage(new RoomObjectRoomPlaneVisibilityUpdateMessage(RoomObjectRoomPlaneVisibilityUpdateMessage.WALL_VISIBILITY, wallsVisible));
        eventHandler.processUpdateMessage(new RoomObjectRoomPlaneVisibilityUpdateMessage(RoomObjectRoomPlaneVisibilityUpdateMessage.FLOOR_VISIBILITY, floorVisible));

        return true;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::updateObjectRoomPlaneThicknesses()
    updateObjectRoomPlaneThicknesses(roomId: number, wallThicknessMultiplier: number, floorThicknessMultiplier: number): boolean 
    {
        const room = this.getRoomInstance(roomId);
        const roomObject = room?.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController | null;
        const eventHandler = roomObject?.getEventHandler();

        if(!eventHandler) return false;

        eventHandler.processUpdateMessage(new RoomObjectRoomPlanePropertyUpdateMessage(RoomObjectRoomPlanePropertyUpdateMessage.WALL_THICKNESS, wallThicknessMultiplier));
        eventHandler.processUpdateMessage(new RoomObjectRoomPlanePropertyUpdateMessage(RoomObjectRoomPlanePropertyUpdateMessage.FLOOR_THICKNESS, floorThicknessMultiplier));

        return true;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::modifyRoomObjectDataWithMap()
    // TODO(AS3): ad-furni branding save — needs SetObjectDataMessageComposer, which

    getRoomOwnObjectId(roomId: number): number 
    {
        return this._ownUserIds.get(roomId) ?? -1;
    }

    setRoomOwnObjectId(roomId: number, objectId: number): void 
    {
        this._ownUserIds.set(roomId, objectId);

        const camera = this.getRoomInstanceData(roomId).roomCamera;

        camera.targetId = objectId;
        camera.targetCategory = RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
        camera.activateFollowing(this.cameraFollowDuration);
    }

    disposeRoom(roomId: number): void
    {
        this.disposeRoomInstance(roomId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::purgeRoomContent()
    purgeRoomContent(): void
    {
        this._contentLoader?.purge();
    }

    setWorldType(roomId: number, worldType: string): void 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return;
        }

        const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

        if(roomObject) 
        {
            const model = roomObject.getModelController();

            if(model) 
            {
                model.setNumber(RoomObjectVariableEnum.ROOM_WORLD_TYPE, parseInt(worldType, 10) || 0, true);
            }
        }
    }

    initializeRoom(
        roomId: number,
        planeParser: RoomPlaneParser | null,
        doorX?: number,
        doorY?: number,
        doorZ?: number,
        doorDir?: number
    ): void 
    {
        // Guard against double initialization (server can send height map twice)
        if(this._initializedRooms.has(roomId)) 
        {
            log.debug(`Room ${roomId} already initialized, skipping`);

            return;
        }

        // Create room instance if it doesn't exist
        let room = this.getRoomInstance(roomId);

        if(!room) 
        {
            room = this.createRoomInstance(roomId);
        }

        if(!room) 
        {
            return;
        }

        // If we have plane data, store it for rendering
        if(planeParser !== null) 
        {
            log.debug(`Initializing room ${roomId} with ${planeParser.planeCount} planes`);

            const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

            if(roomObject) 
            {
                const model = roomObject.getModelController();

                if(model) 
                {
                    // Store the RoomPlaneParser reference in the model
                    // (equivalent of AS3 model.setString("room_plane_xml", xml))
                    model.setObject(RoomObjectVariableEnum.ROOM_PLANE_PARSER, planeParser);

                    // AS3: RoomLogic.initialize(xml) → _planeParser.initializeFromXML(xml)
                    const eventHandler = roomObject.getEventHandler();

                    if(eventHandler !== null) 
                    {
                        eventHandler.initialize(planeParser);
                    }

                    // AS3: RoomEngine.initializeRoom() defaults floor/wall/landscape type to
                    // "111"/"201"/"1" (sources/win63_version/habbo/room/class_34.as lines 1370-1372)
                    // when no separate room-properties message has supplied real values yet — that
                    // message isn't ported (protocol gap, see docs/IMPLEMENTATION_STATUS.md "room"),
                    // so these defaults are what every room currently renders with. Without this,
                    // room_floor_type/room_wall_type stay unset and RoomVisualization falls back to
                    // its own invented "default" id, which has no matching texture and renders as a
                    // blank placeholder instead of the classic floor/wallpaper.
                    if(eventHandler !== null) 
                    {
                        eventHandler.processUpdateMessage(
                            new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_FLOOR_UPDATE, '111')
                        );
                        eventHandler.processUpdateMessage(
                            new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_WALL_UPDATE, '201')
                        );
                        eventHandler.processUpdateMessage(
                            new RoomObjectRoomUpdateMessage(RoomObjectRoomUpdateMessage.ROOM_LANDSCAPE_UPDATE, '1')
                        );
                    }

                    // Store dimensions for compatibility
                    model.setNumber(RoomObjectVariableEnum.ROOM_FLOOR_HEIGHT, planeParser.floorHeight, true);
                    model.setNumber(RoomObjectVariableEnum.ROOM_WALL_HEIGHT, planeParser.wallHeight, true);

                    // Store door position if detected (AS3: <doors> XML element)
                    if(doorX !== undefined && doorDir !== undefined) 
                    {
                        // AS3: Send door mask to RoomLogic via RoomObjectRoomMaskUpdateMessage
                        // (RoomEngine.createRoom() lines 3044-3076)
                        const doorMaskLocation = new Vector3d(doorX, doorY!, doorZ!);
                        const doorMaskMessage = new RoomObjectRoomMaskUpdateMessage(
                            RoomObjectRoomMaskUpdateMessage.ADD_MASK,
                            'door_0',
                            RoomObjectRoomMaskUpdateMessage.MASK_TYPE_DOOR,
                            doorMaskLocation,
                            RoomObjectRoomMaskUpdateMessage.MASK_CATEGORY_HOLE
                        );

                        if(eventHandler !== null) 
                        {
                            eventHandler.processUpdateMessage(doorMaskMessage);
                        }

                        // AS3: door position on model uses -0.5 offset in door direction
                        if(doorDir === 90) 
                        {
                            model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX - 0.5, true);
                            model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY!, true);
                        }

                        if(doorDir === 180) 
                        {
                            model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX, true);
                            model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY! - 0.5, true);
                        }

                        model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Z, doorZ!, true);
                        model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_DIR, doorDir, true);

                        // Set displacement on room geometry for door depth sorting
                        // AS3: displacement position uses -0.5 offset in door direction
                        const canvas = this.getExistingRenderingCanvas(roomId);

                        if(canvas?.geometry) 
                        {
                            const displacementPos = new Vector3d(
                                doorDir === 90 ? doorX - 0.5 : doorX,
                                doorDir === 180 ? doorY! - 0.5 : doorY!,
                                doorZ!
                            );

                            let displacement: IVector3d | null = null;

                            if(doorDir === 90) displacement = new Vector3d(-2000, 0, 0);
                            if(doorDir === 180) displacement = new Vector3d(0, -2000, 0);

                            if(displacement) 
                            {
                                canvas.geometry.setDisplacement(displacementPos, displacement);
                            }
                        }
                    }
                }
            }

            // Create room visualization
            const roomVisualization = this.createVisualizationForObject(roomId, OBJECT_ID_ROOM, OBJECT_TYPE_ROOM);

            if(roomVisualization) 
            {
                log.debug(`Created room visualization for room ${roomId}`);
            }

            // Load tile cursor content (.nitro bundle) — goes through the same content loading pipeline as furniture
            this.loadFurnitureContent(roomId, OBJECT_ID_TILE_CURSOR, OBJECT_TYPE_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR);
        }

        this._initializedRooms.add(roomId);
        this.setActiveRoom(roomId);
        this.events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
    }

    addObjectFurniture(
        roomId: number,
        id: number,
        typeId: number,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        data: IStuffData | null,
        extra: number,
        expiryTime: number,
        usagePolicy: number,
        ownerId: number,
        ownerName: string,
        synchronized: boolean,
        _refresh: boolean,
        _sizeZ: number
    ): boolean 
    {
        return this.addRoomObjectFurniture(
            roomId,
            id,
            typeId,
            location,
            direction,
            state,
            extra.toString(),
            expiryTime,
            usagePolicy,
            ownerId,
            ownerName,
            synchronized,
            data
        );
    }

    addObjectFurnitureByName(
        roomId: number,
        id: number,
        className: string,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        _data: IStuffData | null,
        _extra: number
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        if(!object) 
        {
            return false;
        }

        (object as IRoomObjectController).setLocation(location);
        (object as IRoomObjectController).setDirection(direction);

        const model = (object as IRoomObjectController).getModelController();

        if(model) 
        {
            model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
        }

        this.events.emit(
            RoomEngineObjectEvent.REOE_ADDED,
            new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        );

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectFurniture()
    // Dispatches through the object's own event handler (matching AS3 exactly) rather than
    // mutating location/direction/state directly - this is required for FurnitureLogic's
    // rotation-bounce animation (_bounceStep/getLocationOffset()) to trigger at all: it
    // intercepts RoomObjectUpdateMessage in processUpdateMessage() to detect a direction-only
    // change (same location) and defers+animates it instead of applying it immediately.
    updateObjectFurniture(
        roomId: number,
        id: number,
        location: IVector3d | null,
        direction: IVector3d | null,
        state: number,
        data: IStuffData | null,
        extra: number = NaN
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;

        if(!object) 
        {
            return false;
        }

        const eventHandler = object.getEventHandler();

        if(eventHandler) 
        {
            eventHandler.processUpdateMessage(new RoomObjectUpdateMessage(location, direction));
            eventHandler.processUpdateMessage(new RoomObjectDataUpdateMessage(state, data, extra));

            this.events.emit(
                RoomEngineObjectEvent.REOE_UPDATED,
                new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_UPDATED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
            );
        }

        return true;
    }

    updateObjectFurnitureLocation(
        roomId: number,
        id: number,
        location: IVector3d,
        direction: IVector3d | null,
        target: IVector3d | null,
        animationTime?: number,
        overshootingDistance: number = NaN,
        curveStrength: number = NaN
    ): boolean
    {
        const room = this.getRoomInstance(roomId);

        if(!room)
        {
            return false;
        }

        const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;

        if(!object || !object.getEventHandler())
        {
            return false;
        }

        const message = new RoomObjectMoveUpdateMessage(
            location,
            target,
            direction,
            animationTime ?? NaN,
            target !== null,
            false,
            overshootingDistance,
            curveStrength
        );

        object.getEventHandler()!.processUpdateMessage(message);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectWallItemLocation()
    updateObjectWallItemLocation(
        roomId: number,
        id: number,
        location: IVector3d,
        target: IVector3d | null = null,
        animationTime: number = NaN
    ): boolean
    {
        const object = this.getObjectWallItem(roomId, id);

        if(object === null)
        {
            return false;
        }

        if(object.getEventHandler() !== null)
        {
            const message = new RoomObjectMoveUpdateMessage(location, target, null, animationTime, target !== null);
            object.getEventHandler()?.processUpdateMessage(message);
        }

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::
        // updateObjectWallItemLocation() ends with updateObjectRoomWindow(roomId, id), which
        // re-emits the wall item's plane mask at its new position (RORMUM_ADD_MASK /
        // RORMUM_REMOVE_MASK on the room object). updateObjectRoomWindow() is not ported yet, so a
        // window furni moved by wired keeps its mask at the old spot until it is re-added.

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectUserDir()
    updateObjectUserDir(roomId: number, roomIndex: number, direction: IVector3d, headDirection: number): boolean
    {
        const room = this.getRoomInstance(roomId);

        if(room === null)
        {
            return false;
        }

        const object = room.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController | null;

        if(object === null || object.getEventHandler() === null || object.getModel() === null)
        {
            return false;
        }

        // The body direction rides on the base message's direction slot; the logic's
        // super.processUpdateMessage() applies it, and dirHead sets the head separately.
        const message = new RoomObjectAvatarDirectionUpdateMessage(null, direction, headDirection);
        object.getEventHandler()?.processUpdateMessage(message);

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomGeometry()
    getRoomGeometry(roomId: number): IRoomGeometry | null
    {
        return this.getRoomCanvasGeometry(roomId, 1);
    }

    disposeObjectFurniture(
        roomId: number,
        id: number,
        _pickerId?: number,
        refresh: boolean = false
    ): boolean
    {
        const success = this.disposeRoomObject(roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

        // AS3 (_SafeCls_90.as:3238-3241) only refreshes the tile map when the caller
        // asks (param4, default false). The port refreshed unconditionally, which was
        // harmless until refreshTileObjectMap started re-running recalibrateMovements:
        // disposing an OBJECT_PLACE ghost from resetSelectedObjectData (which happens
        // *before* selectedObjectData is cleared) then re-ran handleObjectPlace and
        // rebuilt the very ghost being disposed. Only the server-driven removal passes
        // refresh=true (see _SafeCls_1984.as:782/787).
        if(success && refresh) this.refreshTileObjectMap(roomId, 'RoomEngine.disposeObjectFurniture()');

        return success;
    }

    addObjectWallItem(
        roomId: number,
        id: number,
        typeId: number,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        data: string,
        usagePolicy: number,
        ownerId: number,
        ownerName: string,
        secondsToExpiration: number
    ): boolean 
    {
        return this.addRoomObjectWallItem(
            roomId,
            id,
            typeId,
            location,
            direction,
            state,
            data,
            secondsToExpiration,
            usagePolicy,
            ownerId,
            ownerName
        );
    }

    updateObjectWallItem(
        roomId: number,
        id: number,
        location: IVector3d | null,
        direction: IVector3d | null,
        state: number,
        _data: string
    ): boolean 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return false;
        }

        const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL) as IRoomObjectController;

        if(!object) 
        {
            return false;
        }

        if(location) 
        {
            (object as IRoomObjectController).setLocation(location);
        }

        if(direction) 
        {
            (object as IRoomObjectController).setDirection(direction);
        }

        const model = object.getModelController();

        if(model) 
        {
            model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectWallItemState()
    updateObjectWallItemState(
        roomId: number,
        id: number,
        state: number,
        itemData: string
    ): boolean
    {
        const object = this.getObjectWallItem(roomId, id);

        if(object === null)
        {
            return false;
        }

        // AS3 `new _SafeCls_1945()` — the default empty IStuffData, ported as LegacyStuffData.
        const stuffData = new LegacyStuffData();
        stuffData.setString(itemData);

        const message = new RoomObjectDataUpdateMessage(state, stuffData);

        // AS3 re-tests `_loc7_ != null` here even though the early return above already
        // guaranteed it — preserved verbatim.
        if(object !== null && object.getEventHandler() !== null)
        {
            object.getEventHandler()?.processUpdateMessage(message);
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectWallItemData()
    updateObjectWallItemData(
        roomId: number,
        id: number,
        itemData: string
    ): boolean
    {
        const object = this.getObjectWallItem(roomId, id);

        if(object === null)
        {
            return false;
        }

        const message = new RoomObjectItemDataUpdateMessage(itemData);

        // AS3 re-tests `_loc5_ != null` here even though the early return above already
        // guaranteed it — preserved verbatim.
        if(object !== null && object.getEventHandler() !== null)
        {
            object.getEventHandler()?.processUpdateMessage(message);
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateAreaHide()
    updateAreaHide(
        roomId: number,
        furniId: number,
        on: boolean,
        rootX: number,
        rootY: number,
        width: number,
        length: number,
        invert: boolean
    ): boolean
    {
        // AS3 dispatches the widget event BEFORE the room-object null check, so the widget is told
        // about the toggle even when the room object is gone. Category 10 is the furniture category.
        this.events.emit(
            RoomEngineAreaHideStateWidgetEvent.UPDATE_STATE_AREA_HIDE,
            new RoomEngineAreaHideStateWidgetEvent(
                roomId,
                furniId,
                RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
                on
            )
        );

        const roomObject = this.getObjectRoom(roomId);

        if(roomObject === null || roomObject.getEventHandler() === null)
        {
            return false;
        }

        const message = on
            ? new RoomObjectRoomFloorHoleUpdateMessage(
                RoomObjectRoomFloorHoleUpdateMessage.ADD_HOLE,
                furniId,
                rootX,
                rootY,
                width,
                length,
                invert
            )
            : new RoomObjectRoomFloorHoleUpdateMessage(
                RoomObjectRoomFloorHoleUpdateMessage.REMOVE_HOLE,
                furniId
            );

        roomObject.getEventHandler()?.processUpdateMessage(message);
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateObjectRoomColor()
    updateObjectRoomColor(roomId: number, color: number, light: number, backgroundOnly: boolean): boolean
    {
        const roomObject = this.getObjectRoom(roomId);

        if(roomObject === null || roomObject.getEventHandler() === null)
        {
            return false;
        }

        const message = new RoomObjectRoomColorUpdateMessage(
            RoomObjectRoomColorUpdateMessage.BACKGROUND_COLOR,
            color,
            light,
            backgroundOnly
        );

        roomObject.getEventHandler()?.processUpdateMessage(message);

        this.events.emit(
            RoomEngineRoomColorEvent.RERCE_ROOM_COLOR,
            new RoomEngineRoomColorEvent(roomId, color, light, backgroundOnly)
        );

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getObjectRoom()
    private getObjectRoom(roomId: number): IRoomObjectController | null
    {
        return this.getRoomObject(
            roomId,
            OBJECT_ID_ROOM,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM
        ) as IRoomObjectController | null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getObjectWallItem()
    private getObjectWallItem(roomId: number, id: number): IRoomObjectController | null
    {
        return this.getRoomObject(
            roomId,
            id,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL
        ) as IRoomObjectController | null;
    }

    disposeObjectWallItem(
        roomId: number,
        id: number,
        _pickerId?: number
    ): boolean
    {
        return this.disposeRoomObject(roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);
    }

    addObjectUser(
        roomId: number,
        roomIndex: number,
        location: IVector3d,
        direction: IVector3d,
        headDirection: number,
        userType: number,
        figure: string
    ): boolean 
    {
        // Map userType to string type
        let type: string;

        switch(userType) 
        {
            case 2:
                type = RoomObjectUserTypes.PET;
                break;
            case 3:
                type = RoomObjectUserTypes.BOT;
                break;
            case 4:
                type = RoomObjectUserTypes.RENTABLE_BOT;
                break;
            default:
                type = RoomObjectUserTypes.USER;
                break;
        }

        // AS3: addObjectUser() — `if(_loc11_ == "pet") _loc11_ = getPetType(param7);`
        //
        // A pet's room object is NOT typed 'pet': that literal is only the user-type name, and no
        // asset library is called 'pet'. AS3 replaces it with the pet's real content type, resolved
        // from the first token of its figure. Without this the object was created as type 'pet',
        // which RoomContentLoader.hasInternalContent() does not recognise (it knows only 'user',
        // 'game_snowball', 'game_snowsplash'), so RoomManager fell through to resolving logic and
        // visualization off a non-existent bundle and defaulted to FurnitureLogic +
        // FurnitureVisualization. FurnitureLogic ignores RoomObjectAvatarFigureUpdateMessage, so
        // the figure below was dropped on the floor, the model kept no pet_type/pet_palette_index/
        // pet_color, and every pet in a room rendered as a black box. PetLogic was never attached
        // to anything — it was dead code.
        if(type === RoomObjectUserTypes.PET)
        {
            const petType = this.getPetType(figure);

            // AS3 lets a null type reach createObjectUser(), which returns null, and addObjectUser()
            // then returns false. Bailing here is the same outcome, one step earlier.
            if(petType === null) return false;

            type = petType;
        }

        if(!this.addRoomObjectUser(roomId, roomIndex, location, direction, type))
        {
            return false;
        }

        const room = this.getRoomInstance(roomId);
        const object = room?.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController | null;
        const handler = object?.getEventHandler() ?? null;

        if(handler !== null) 
        {
            const avatarMessage = new RoomObjectAvatarUpdateMessage(this.fixedUserLocation(roomId, location), null, direction, headDirection, false, 0);
            handler.processUpdateMessage(avatarMessage);

            if(figure !== null && figure !== undefined) 
            {
                const figureMessage = new RoomObjectAvatarFigureUpdateMessage(figure, '');
                handler.processUpdateMessage(figureMessage);
            }
        }

        return true;
    }

    updateObjectUser(
        roomId: number,
        roomIndex: number,
        location: IVector3d | null,
        target: IVector3d | null,
        canStandUp?: boolean,
        baseZ?: number,
        direction?: IVector3d,
        headDirection?: number,
        animationTime?: number,
        skipPositionUpdate?: boolean,
        jumpingPower: number = NaN
    ): boolean
    {
        return this.updateRoomObjectUser(
            roomId,
            roomIndex,
            location,
            target,
            direction ?? null,
            headDirection ?? NaN,
            canStandUp ?? false,
            baseZ ?? 0,
            animationTime ?? NaN,
            skipPositionUpdate ?? false,
            jumpingPower
        );
    }

    updateObjectUserFigure(
        roomId: number,
        roomIndex: number,
        figure: string,
        sex: string,
        subType?: string,
        isRiding?: boolean
    ): boolean 
    {
        return this.updateRoomObjectUserFigure(roomId, roomIndex, figure, sex, subType ?? null, isRiding ?? false);
    }

    // TS-only: RoomEngine.update(time) is not actually driven by a running
    // loop in this port (nothing calls it from vortex-client) — the visible
    // room rendering instead rides the shared PixiJS Application ticker set
    // here, which does run continuously. Used to keep window-hosted room
    // canvases (e.g. RoomPreviewerWidget) that createRoomCanvas() parents onto
    // the root stage — not the window tree — synced to their host window's
    // screen position/visibility every frame, matching how AS3's RoomPreviewer
    // relies on a continuous per-frame tick (registerUpdateReceiver) rather

    updateObjectUserPosture(roomId: number, roomIndex: number, posture: string, parameter: string): boolean 
    {
        return this.updateRoomObjectUserPosture(roomId, roomIndex, posture, parameter);
    }

    /**
     * Update user action (expression, dance, sleep, typing, carry, use object).
     * Based on AS3: RoomEngine.updateObjectUserAction
     */
    updateObjectUserAction(
        roomId: number,
        roomIndex: number,
        action: string,
        value: number
    ): boolean 
    {
        const roomInstance = this.getRoomInstance(roomId);

        if(roomInstance === null) 
        {
            return false;
        }

        const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        if(roomObject === null) 
        {
            return false;
        }

        const model = (roomObject as IRoomObjectController).getModelController();

        if(model === null) 
        {
            return false;
        }

        model.setNumber(action, value);

        return true;
    }

    /**
     * Update user effect.
     * Based on AS3: RoomEngine.updateObjectUserEffect
     */
    updateObjectUserEffect(
        roomId: number,
        roomIndex: number,
        effectId: number,
        _delayMilliSeconds: number
    ): boolean 
    {
        const roomInstance = this.getRoomInstance(roomId);

        if(roomInstance === null) 
        {
            return false;
        }

        const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        if(roomObject === null) 
        {
            return false;
        }

        const model = (roomObject as IRoomObjectController).getModelController();

        if(model === null) 
        {
            return false;
        }

        // Set the effect - delay handling would be done by visualization layer
        model.setNumber(RoomObjectVariableEnum.AVATAR_EFFECT, effectId);

        return true;
    }

    disposeObjectUser(
        roomId: number,
        roomIndex: number
    ): boolean 
    {
        return this.disposeRoomObject(roomId, roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);
    }

    setOwnUserId(roomId: number, roomIndex: number): void
    {
        // AS3 (_SafeCls_90.as:1998-2004) records the own-user object id on the room
        // session before the camera follows it. The port set the camera target (via
        // setRoomObjectUserOwnUser -> setRoomOwnObjectId) but never the session field,
        // so RoomSession.ownUserRoomId stayed -1 for the session's whole life.
        const session = this._roomSessionManager?.getSession(roomId) ?? null;

        if(session !== null)
        {
            session.ownUserRoomId = roomIndex;
        }

        this.setRoomObjectUserOwnUser(roomId, roomIndex);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setIsPlayingGame()
    setIsPlayingGame(roomId: number, isPlaying: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room !== null)
        {
            const value = isPlaying ? 1 : 0;
            room.setNumber(RoomVariableEnum.IS_PLAYING_GAME, value);

            const type = value === 0 ? RoomEngineEvent.REE_NORMAL_MODE : RoomEngineEvent.REE_GAME_MODE;
            this.events.emit(type, new RoomEngineEvent(type, roomId));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::leaveSpectate()
    leaveSpectate(): void
    {
        // AS3 fires this on the ACTIVE room id, not on any room passed in — there is no parameter.
        this.events.emit(
            RoomEngineEvent.REE_ENTRANCE_AFTER_SPECTATE,
            new RoomEngineEvent(RoomEngineEvent.REE_ENTRANCE_AFTER_SPECTATE, this._activeRoomId)
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setHanditemControlBlocked()
    setHanditemControlBlocked(roomId: number, blocked: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room !== null)
        {
            room.setNumber(RoomVariableEnum.HANDITEM_CONTROL_BLOCKED, blocked ? 1 : 0);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setChooserDisabled()
    setChooserDisabled(roomId: number, disabled: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room !== null)
        {
            room.setNumber(RoomVariableEnum.CHOOSER_DISABLED, disabled ? 1 : 0);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setFreeFurniMovementsMode()
    setFreeFurniMovementsMode(roomId: number, enabled: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room !== null)
        {
            room.setNumber(RoomVariableEnum.FREE_FURNI_MOVEMENTS_MODE, enabled ? 1 : 0);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setInvisibleFurni()
    setInvisibleFurni(roomId: number, invisible: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room !== null)
        {
            room.setNumber(RoomVariableEnum.INVISIBLE_FURNI, invisible ? 1 : 0);
            this.updateInvisibleFurniForRoom(roomId, invisible);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateInvisibleFurniForRoom()
    private updateInvisibleFurniForRoom(roomId: number, invisible: boolean): void
    {
        const room = this.getRoomInstance(roomId);

        if(room === null)
        {
            return;
        }

        this.updateInvisibleFurniForObjects(room.getObjects(RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE), invisible);
        this.updateInvisibleFurniForObjects(room.getObjects(RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL), invisible);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::updateInvisibleFurniForObjects()
    private updateInvisibleFurniForObjects(objects: IRoomObject[] | null, invisible: boolean): void
    {
        if(objects === null)
        {
            return;
        }

        const value = invisible ? 1 : 0;

        for(const object of objects)
        {
            const model = (object as IRoomObjectController).getModelController();

            if(model !== null)
            {
                model.setNumber(RoomObjectVariableEnum.FURNITURE_INVISIBLE_LAYER, value);
            }
        }
    }

    addObjectUpdateCategory(category: number): void
    {
        if(this._roomManager) 
        {
            this._roomManager.addObjectUpdateCategory(category);
        }
    }

    removeObjectUpdateCategory(category: number): void 
    {
        if(this._roomManager) 
        {
            this._roomManager.removeObjectUpdateCategory(category);
        }
    }

    /**
     * Set a furniture type alias.
     * Maps a furniture type name to an alias name.
     * Based on AS3: com.sulake.habbo.room.RoomEngine.setRoomObjectAlias
     */
    setRoomObjectAlias(name: string, alias: string): void 
    {
        this._roomObjectAliases.set(name, alias);
    }

    /**
     * Get the alias for a furniture type name.
     * Returns the alias if set, otherwise returns the original name.
     */
    getRoomObjectAlias(name: string): string 
    {
        return this._roomObjectAliases.get(name) ?? name;
    }

    /**
     * Set the PixiJS stage for rendering
     */
    setStage(stage: Container): void 
    {
        this._pixiStage = stage;
    }

    /**
     * Mounts an externally-owned display object directly onto the PixiJS
     * stage, above every room rendering canvas already added (children
     * appended later render on top).
     *
     * TS-only: no AS3 equivalent. AS3's DisplayObjectWrapperController wraps
     * a genuine Flash DisplayObject that gets added to the same unified
     * display tree as everything else; this port splits UI chrome (drawn via
     * WindowComposite onto a separate Canvas2D element) from room content
     * (rendered by this WebGL/PixiJS stage). WindowComposite's "punch a
     * transparent hole" trick for display_object_wrapper windows only reveals
     * whatever is *already* part of this same PixiJS stage underneath that
     * screen rect - callers like HabboFreeFlowChat (freeflowchat's live chat
     * bubbles) need this explicit mount point since their content has no
     * other path onto the stage.
     */
    addStageChild(displayObject: Container): void 
    {
        this._pixiStage?.addChild(displayObject);
    }

    /**
     * Removes a display object previously added via addStageChild().
     */
    removeStageChild(displayObject: Container): void 
    {
        if(this._pixiStage && displayObject.parent === this._pixiStage) 
        {
            this._pixiStage.removeChild(displayObject);
        }
    }

    /**
     * Keeps the AS3 boundary: room mouse input is routed by RoomDesktop window events.
     */
    setCanvasElement(_canvas: HTMLCanvasElement): void 
    {
    }

    getRenderingCanvas(roomId: number, canvasId: number = 1): RoomRenderingCanvas | null 
    {
        return this.getExistingRenderingCanvas(roomId, canvasId);
    }

    /**
     * Dispose a rendering canvas for a room
     */
    disposeRenderingCanvas(roomId: number, canvasId: number = 1): void 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(canvas) 
        {
            // Remove resize handler if attached
            const resizeHandler = this._resizeHandlers.get(canvas);

            if(resizeHandler) 
            {
                window.removeEventListener('resize', resizeHandler);
                this._resizeHandlers.delete(canvas);
            }

            // Detach from whatever currently holds the container, not just the stage.
            // createRoomCanvas() parents it onto _pixiStage, but RoomDesktop.createRoomView() then
            // re-homes it into the room_canvas_wrapper window (AS3: var_174.setDisplayObject()),
            // so by the time a room is disposed its parent is that window's display object. Testing
            // for _pixiStage therefore never matched a real room canvas and it was never removed:
            // every room left its fully-rendered container on screen, and they stacked up as you
            // moved from room to room. Preview canvases, which keep the stage as parent, are
            // detached by this exactly as before.
            canvas.container.parent?.removeChild(canvas.container);

            const room = this.getRoomInstance(roomId);
            const renderer = room?.getRenderer() as IRoomRenderer | null;

            if(renderer !== null && renderer !== undefined) 
            {
                renderer.disposeCanvas(canvasId);
            }
            else 
            {
                canvas.dispose();
            }

            this._renderingCanvases.delete(key);
        }
    }

    /**
     * Get the content loader instance.
     */
    getContentLoader(): RoomContentLoader 
    {
        return this._contentLoader;
    }

    /**
     * Creates a rendering canvas for a room with explicit dimensions.
     * Unlike getRenderingCanvas(), this does NOT auto-attach a resize listener.
     * RoomDesktop manages resize instead.
     *
     * @returns The PixiJS Container for the canvas, or null on failure
     */
    createRoomCanvas(roomId: number, canvasId: number, width: number, height: number, scale: number): Container | null
    {
        const key = roomId * 1000 + canvasId;

        // Tear down any canvas already registered under this key before replacing it. The set()
        // below would otherwise just drop the old one from the map while its container stays
        // parented in the room view, leaving a fully-rendered room on screen that nothing can
        // reach any more - disposeRenderingCanvas() looks the canvas up by this same key.
        if(this._renderingCanvases.has(key))
        {
            this.disposeRenderingCanvas(roomId, canvasId);
        }

        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return null;
        }

        let renderer = room.getRenderer() as IRoomRenderer | null;

        if(renderer === null) 
        {
            renderer = this._roomRendererFactory?.createRenderer() ?? null;
        }

        if(renderer === null) 
        {
            return null;
        }

        renderer.roomObjectVariableAccurateZ = RoomObjectVariableEnum.OBJECT_ACCURATE_Z_VALUE;
        room.setRenderer(renderer);

        const canvas = renderer.createCanvas(canvasId, width, height, scale) as RoomRenderingCanvas | null;

        if(canvas === null) 
        {
            return null;
        }

        canvas.mouseListener = this;

        this._renderingCanvases.set(key, canvas);
        this.applyRoomCanvasGeometry(roomId, canvas);

        if(this._pixiStage) 
        {
            if(canvas.container.parent !== this._pixiStage) 
            {
                this._pixiStage.addChild(canvas.container);
            }
        }

        return canvas.container;
    }

    /**
     * Modifies the dimensions of an existing room canvas.
     */
    modifyRoomCanvas(roomId: number, canvasId: number, width: number, height: number): boolean 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(!canvas) 
        {
            return false;
        }

        canvas.initialize(width, height);

        return true;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::setRoomCanvasMask()
    setRoomCanvasMask(roomId: number, canvasId: number, useMask: boolean): void
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(!canvas)
        {
            return;
        }

        canvas.useMask = useMask;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::setFpsCounterEnabled()
    setFpsCounterEnabled(enabled: boolean): void
    {
        // AS3 getActiveRoomActiveCanvas() returns the active room's active canvas
        // (getRoomCanvas(activeRoomId, activeCanvasId)); the port keys canvases by
        // roomId*1000+canvasId and the main room view is canvasId 1 (getRenderingCanvas
        // default), so it stands in for the active canvas here.
        const canvas = this.getRenderingCanvas(this._activeRoomId);

        if(canvas)
        {
            canvas.fpsCounterEnabled = enabled;
        }
    }

    /**
     * Handles a mouse event forwarded from the client UI layer.
     */
    handleRoomCanvasMouseEvent(
        canvasId: number,
        x: number,
        y: number,
        type: string,
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        buttonDown: boolean
    ): void 
    {
        if(this._activeRoomId < 0) return;

        const key = this._activeRoomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(canvas)
        {
            // AS3 (_SafeCls_90.as:2367-2372): ctrl+alt+click zooms the room at the cursor.
            // shift halves the scale; otherwise it doubles, clamping a sub-1 scale up to 1
            // first. The port received the modifier keys here but only handleRoomDragging
            // consumed them, so the zoom shortcut did nothing.
            if(type === 'click' && ctrlKey && altKey)
            {
                const scale = shiftKey ? canvas.scale >> 1 : (canvas.scale < 1 ? 1 : canvas.scale << 1);

                this.setRoomCanvasScale(this._activeRoomId, canvasId, scale, {x, y});

                return;
            }

            // AS3: _SafeCls_1821.as::handleRoomCanvasMouseEvent() repositions the overlay
            // icon sprite unconditionally on every mouse event, at the raw mouse position —
            // visibility is controlled entirely by setObjectMoverIconSpriteVisible()
            // (called from handleObjectPlace()/initializeRoomObjectInsert()), never touched
            // here.
            if(this._moverIconSprite) 
            {
                this._moverIconCanvas = canvas;
                this._moverIconSprite.x = x;
                this._moverIconSprite.y = y;

                if(this._moverIconSprite.parent !== canvas.container) 
                {
                    canvas.container.addChild(this._moverIconSprite);
                }
            }

            if(!this.handleRoomDragging(canvas, x, y, type, altKey, ctrlKey, shiftKey))
            {
                const handled = canvas.handleMouseEvent(x, y, type, altKey, ctrlKey, shiftKey, buttonDown);

                // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as:2391-2398
                // `if(!canvas.handleMouseEvent(...)) { if(click) dispatch REOE_DESELECTED(roomId, -1, MINIMUM) }`.
                // The port was discarding the return value, so a click no room object
                // consumed never deselected — which is why the InfoStand furni/user
                // panels and the own-avatar bubble never closed on clicking away.
                if(type === 'click')
                {
                    log.info(`[CLICK-AWAY] canvas handled=${handled} -> ${handled ? 'no deselect' : 'REOE_DESELECTED emitted'}`);
                }

                if(!handled && type === 'click')
                {
                    this._selectedObject = null;

                    this.events.emit(
                        RoomEngineObjectEvent.REOE_DESELECTED,
                        new RoomEngineObjectEvent(
                            RoomEngineObjectEvent.REOE_DESELECTED,
                            this._activeRoomId,
                            -1,
                            RoomObjectCategoryEnum.MINIMUM
                        )
                    );
                }
            }

            this._roomDragLastX = x;
            this._roomDragLastY = y;
        }
    }

    processRoomCanvasMouseEvent(event: RoomSpriteMouseEvent, object: IRoomObject, geometry: IRoomGeometry): void 
    {
        if(event === null || object === null) 
        {
            return;
        }

        const handler = object.getMouseHandler();

        if(handler !== null) 
        {
            handler.mouseEvent(event, geometry);
        }
    }

    /**
     * Gets the room geometry for a canvas.
     */
    getRoomCanvasGeometry(roomId: number, canvasId: number = 1): IRoomGeometry | null 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        return canvas?.geometry ?? null;
    }

    /**
     * Gets the screen offset of a room canvas.
     */
    getRoomCanvasScreenOffset(roomId: number, canvasId: number = 1): { x: number; y: number } | null 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(!canvas) return null;

        return {x: canvas.screenOffsetX, y: canvas.screenOffsetY};
    }

    /**
     * Sets the screen offset of a room canvas.
     */
    setRoomCanvasScreenOffset(roomId: number, canvasId: number, point: { x: number; y: number }): boolean 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(!canvas) return false;

        canvas.setScreenOffset(point.x, point.y);

        return true;
    }

    /**
     * Sets the scale of a room canvas.
     */
    setRoomCanvasScale(
        roomId: number,
        canvasId: number,
        scale: number,
        _point?: { x: number; y: number } | null,
        _offset?: { x: number; y: number } | null
    ): void 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        if(!canvas) return;

        canvas.setScale(scale, _point, _offset);
    }

    /**
     * Gets the scale of a room canvas.
     */
    getRoomCanvasScale(roomId: number, canvasId: number = 1): number 
    {
        const key = roomId * 1000 + canvasId;
        const canvas = this._renderingCanvases.get(key);

        return canvas?.scale ?? 1;
    }

    /**
     * Dispose the room engine
     */
    override dispose(): void
    {
        // AS3 makes dispose() idempotent with an early `if(disposed) return` (_SafeCls_90.as:497).
        if(this.disposed)
        {
            return;
        }

        // Unregister from update loop
        this.removeUpdateReceiver(this);

        // AS3's removeUpdateReceiver stops its per-frame tick; here the canvas-sync tick
        // rides the PixiJS Ticker that setTicker() attached, so it must be detached too —
        // otherwise onTickerUpdate keeps firing against a disposed engine whose canvases
        // are already gone.
        this._ticker?.remove(this.onTickerUpdate);
        this._ticker = null;

        // Dispose all rendering canvases
        for(const [, canvas] of this._renderingCanvases) 
        {
            const resizeHandler = this._resizeHandlers.get(canvas);

            if(resizeHandler) 
            {
                window.removeEventListener('resize', resizeHandler);
                this._resizeHandlers.delete(canvas);
            }

            if(this._pixiStage && canvas.container.parent === this._pixiStage) 
            {
                this._pixiStage.removeChild(canvas.container);
            }

            canvas.dispose();
        }

        this._renderingCanvases.clear();

        // Dispose visualization factory
        this._visualizationFactory.dispose();

        // Dispose content loader
        this.events.off(RoomContentLoader.CONTENT_LOADER_READY, this._boundOnContentLoaderReady);
        this._contentLoader.dispose();
        this._contentLoaderEvents.removeAllListeners();
        this._pendingFurnitureViz.clear();

        // Clear stage reference
        this._pixiStage = null;

        // AS3 disposes every RoomInstanceData it still holds (_SafeCls_90.as:549-560).
        // The port only did so per-room in removeRoomInstanceData(), so any room still
        // registered at teardown leaked its RoomCamera / FurniStackingHeightMap /
        // TileObjectMap / selection data.
        for(const instanceData of this._roomInstanceData.values())
        {
            instanceData.roomCamera.dispose();
            instanceData.furniStackingHeightMap?.dispose();
            instanceData.tileObjectMap?.dispose();
            instanceData.selectedObjectData?.dispose();
        }

        this._roomInstanceData.clear();

        super.dispose();
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::getRoomObjectBoundingRectangle()
    getRoomObjectBoundingRectangle(roomId: number, objectId: number, category: number, canvasId: number): IRoomEngineRectangle | null 
    {
        const canvas = this._renderingCanvases.get(roomId * 1000 + canvasId);
        const geometry = canvas?.geometry ?? null;
        const object = this.getRoomObject(roomId, objectId, category);
        const visualization = object?.getVisualization() ?? null;

        if(canvas === undefined || geometry === null || object === null || visualization === null) 
        {
            return null;
        }

        const bounds = visualization.boundingRectangle;
        const screenPoint = geometry.getScreenPoint(object.getLocation());

        if(screenPoint === null) 
        {
            return null;
        }

        const scale = canvas.scale;
        const left = bounds.x * scale + screenPoint.x * scale + canvas.width / 2 + canvas.screenOffsetX;
        const top = bounds.y * scale + screenPoint.y * scale + canvas.height / 2 + canvas.screenOffsetY;
        const width = bounds.width * scale;
        const height = bounds.height * scale;

        return {
            left,
            top,
            right: left + width,
            bottom: top + height,
            width,
            height
        };
    }

    /**
     * Called when all dependencies are resolved.
     * Register for updates to drive the rendering loop.
     */
    protected override initComponent(): void 
    {
        // Listen for content load success events (AS3: "RCLE_SUCCESS")
        this._contentLoaderEvents.on(RoomContentLoadedEvent.CONTENT_LOAD_SUCCESS, this._boundOnContentLoaded);

        // Register to receive update calls from the context
        this.registerUpdateReceiver(this, 1);
    }

    // (the "temporary_room" walk that resolves getGenericRoomObjectImage()'s pending listeners)
    private resolvePendingImageListeners(type: string): void 
    {
        if(this._pendingImageListeners.size === 0 || !this._contentLoader) return;

        const room = this._roomManager?.getRoom(TEMPORARY_ROOM_ID) ?? null;

        if(room === null) return;

        const category = this._contentLoader.getObjectCategory(type);
        const count = room.getObjectCount(category);
        let geometry: RoomGeometry | null = null;
        let lastScale = 0;

        for(let i = count - 1; i >= 0; i--) 
        {
            const object = room.getObjectWithIndex(i, category);

            if(object === null || object.getModel() === null || object.getType() !== type) continue;

            const objectId = object.getId();
            const listener = this._pendingImageListeners.get(objectId);

            if(!listener) continue;

            this._pendingImageListeners.delete(objectId);

            const visualization = object.getVisualization();
            let canvas: HTMLCanvasElement | null = null;

            if(visualization !== null) 
            {
                const scale = object.getModel().getNumber('image_query_scale');

                if(geometry !== null && lastScale !== scale) 
                {
                    geometry.dispose();
                    geometry = null;
                }

                if(geometry === null) 
                {
                    lastScale = scale;
                    geometry = new RoomGeometry(scale, new Vector3d(-135, 30, 0), new Vector3d(11, 11, 5));
                }

                visualization.update(geometry, 0, true, false);
                canvas = visualization.image;
            }

            room.disposeObject(objectId, category);

            if(canvas !== null) 
            {
                createImageBitmap(canvas)
                    .then((bitmap) => listener.imageReady(objectId, bitmap))
                    .catch(() => listener.imageFailed(objectId));
            }
            else 
            {
                listener.imageFailed(objectId);
            }
        }

        geometry?.dispose();
    }

    // See ImageResult.ts for why this is always asynchronous, unlike AS3.
    private deliverIconTexture(id: number, texture: Texture | null, listeners: IGetImageListener[]): void 
    {
        if(texture === null) 
        {
            log.warn(`deliverIconTexture(${id}): no texture (asset missing or load failed)`);

            for(const listener of listeners) listener.imageFailed(id);

            return;
        }

        const canvas = this.pixiTextureToCanvas(texture);

        if(canvas === null) 
        {
            log.warn(`deliverIconTexture(${id}): pixiTextureToCanvas() returned null`);

            for(const listener of listeners) listener.imageFailed(id);

            return;
        }

        createImageBitmap(canvas)
            .then((bitmap) => 
            {
                // Each listener gets its own ImageBitmap instance (matching AS3's
                // BitmapData.clone() per-listener) so one owner closing its bitmap
                // doesn't invalidate another listener's copy.
                for(let i = 0; i < listeners.length; i++) 
                {
                    const copy = i === listeners.length - 1 ? bitmap : this.cloneImageBitmap(bitmap);

                    if(copy !== null) listeners[i].imageReady(id, copy);
                    else listeners[i].imageFailed(id);
                }
            })
            .catch((error) => 
            {
                log.warn(`deliverIconTexture(${id}): createImageBitmap() failed`, error);

                for(const listener of listeners) listener.imageFailed(id);
            });
    }

    private cloneImageBitmap(bitmap: ImageBitmap): ImageBitmap | null 
    {
        try 
        {
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = canvas.getContext('2d')!;

            ctx.drawImage(bitmap, 0, 0);

            return canvas.transferToImageBitmap();
        }
        catch
        {
            return null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::setSelectedObjectData()
    private setSelectedObjectData(
        roomId: number, id: number, category: number, loc: IVector3d, dir: IVector3d, operation: string,
        typeId: number = 0, instanceData: string | null = null, stuffData: IStuffData | null = null,
        state: number = -1, animFrame: number = -1, posture: string | null = null
    ): void 
    {
        this.resetSelectedObjectData(roomId);

        this.getRoomInstanceData(roomId).selectedObjectData =
            new SelectedRoomObjectData(id, category, operation, loc, dir, typeId, instanceData, stuffData, state, animFrame, posture);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::updateSelectedObjectData()
    private updateSelectedObjectData(
        roomId: number, id: number, category: number, loc: IVector3d, dir: IVector3d, operation: string,
        typeId: number = 0, instanceData: string | null = null, stuffData: IStuffData | null = null,
        state: number = -1, animFrame: number = -1, posture: string | null = null
    ): void 
    {
        this.getRoomInstanceData(roomId).selectedObjectData =
            new SelectedRoomObjectData(id, category, operation, loc, dir, typeId, instanceData, stuffData, state, animFrame, posture);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::resetSelectedObjectData()
    private resetSelectedObjectData(roomId: number): void 
    {
        this.removeObjectMoverIconSprite();

        const instanceData = this._roomInstanceData.get(roomId);
        const data = instanceData?.selectedObjectData ?? null;

        if(data === null) return;

        if(data.operation === 'OBJECT_MOVE' || data.operation === 'OBJECT_MOVE_TO') 
        {
            const object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

            if(object !== null) 
            {
                if(data.operation !== 'OBJECT_MOVE_TO' && data.loc !== null && data.dir !== null) 
                {
                    object.setLocation(data.loc);
                    object.setDirection(data.dir);
                }

                this.setObjectAlphaMultiplier(object, 1);
            }
        }
        else if(data.operation === 'OBJECT_PLACE' && data.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) 
        {
            this.disposeObjectFurniture(roomId, data.id);
        }

        if(instanceData) instanceData.selectedObjectData = null;

        data.dispose();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::setObjectMoverIconSprite()
    // Fallback icon shown only while no valid tile is hovered (the real ghost object built by
    // handleObjectPlace()/handleObjectMove() is shown instead otherwise).
    // Two modes, matching AS3's param3 (direct) flag:
    //  - direct=false: `id` is a furniture TYPE id not yet in the room (OBJECT_PLACE) — renders
    //    via getFurnitureImage() (real isometric render, forceGeneric=true).
    //  - direct=true: `id` is the id of an ALREADY-PLACED object (OBJECT_MOVE) — renders via
    //    getRoomObjectImage(), which reads the object's own current type/color/state.
    // `stuffData` is deliberately NOT forwarded to getFurnitureImage()/getGenericRoomObjectImage():
    // callers pass the INVENTORY-side IStuffData (item.stuffData from FurniModel.ts), but
    // getGenericRoomObjectImage() feeds it into a RoomObjectDataUpdateMessage expecting the
    // ROOM-side IStuffData (which implements writeRoomObjectModel()) - these are two separate,
    // incompatible interfaces in this port (see getFurnitureIcon()'s own `stuffData` comment).
    // Passing it through crashes FurnitureMultiStateLogic.handleDataUpdateMessage(). The icon
    // preview doesn't need it anyway (matches the old getFurnitureIcon()-based icon, whose
    // getGenericRoomObjectThumbnail() path silently ignored this same stuffData).
    private setObjectMoverIconSprite(id: number, category: number, direct: boolean, extra: string | null = null): void 
    {
        this.removeObjectMoverIconSprite();

        const roomId = this._activeRoomId;

        const listener: IGetImageListener = {
            imageReady: (_id: number, data: ImageBitmap | null) => 
            {
                if(data === null || this.getSelectedObjectData(roomId) === null) return;

                this._moverIconSprite = new Sprite(Texture.from(data));
                this._moverIconSprite.anchor.set(0.5);
                this._moverIconSprite.eventMode = 'none';

                if(this._moverIconCanvas) 
                {
                    this._moverIconCanvas.container.addChild(this._moverIconSprite);
                }
            },
            imageFailed: () => 
            {
                log.warn(`setObjectMoverIconSprite: failed to render icon (id=${id}, category=${category}, direct=${direct})`);
            },
        };

        if(direct) 
        {
            this.getRoomObjectImage(roomId, id, category, new Vector3d(), 1, listener);

            return;
        }

        this.getFurnitureImage(id, new Vector3d(), 1, listener, 0, extra, -1, -1, null, true);
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::removeObjectMoverIconSprite()
    private removeObjectMoverIconSprite(): void 
    {
        if(this._moverIconSprite) 
        {
            this._moverIconSprite.removeFromParent();
            this._moverIconSprite.destroy();
            this._moverIconSprite = null;
        }

        this._moverIconCanvas = null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::setObjectAlphaMultiplier()
    private setObjectAlphaMultiplier(object: IRoomObjectController | null, multiplier: number): void 
    {
        if(object === null) return;

        const model = object.getModelController();

        if(model === null) return;

        if(object.getType() === 'rentable_bot' || object.getType() === 'user') 
        {
            model.setNumber('figure_alpha_multiplier', multiplier);
        }
        else 
        {
            model.setNumber(RoomObjectVariableEnum.FURNITURE_ALPHA_MULTIPLIER, multiplier);
        }
    }

    // rentable_bot special cases are category-100 avatar/pet features, out of scope here).
    private getValidRoomObjectDirection(object: IRoomObjectController, forward: boolean): number 
    {
        const model = object.getModel();
        const currentDirection = object.getDirection().x;

        if(model === null) return currentDirection;

        const allowedDirections = model.getNumberArray(RoomObjectVariableEnum.FURNITURE_ALLOWED_DIRECTIONS);

        if(allowedDirections === null || allowedDirections.length === 0) return currentDirection;

        let index = allowedDirections.indexOf(currentDirection);

        if(index < 0) 
        {
            index = 0;

            for(let i = 0; i < allowedDirections.length; i++) 
            {
                if(currentDirection <= allowedDirections[i]) break;

                index++;
            }

            index %= allowedDirections.length;
        }

        index = forward
            ? (index + 1) % allowedDirections.length
            : (index - 1 + allowedDirections.length) % allowedDirections.length;

        return allowedDirections[index];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::validateFurnitureDirection()
    // Used by modifyRoomObject()'s rotate case to check the newly-rotated footprint fits
    // at the object's current location before sending the rotation to the server.
    // Like validateFurnitureLocation(), AS3 leaves validateLocation()'s 10th (reference-height)
    // parameter at its -1 default, which makes it derive the reference from the target tile.
    private validateFurnitureDirection(object: IRoomObject, direction: IVector3d, stackingMap: FurniStackingHeightMap | null): boolean 
    {
        const model = object.getModel();

        if(model === null) return false;

        const currentDirection = object.getDirection();
        const location = object.getLocation();

        if(currentDirection === null || location === null) return false;

        if(currentDirection.x % 180 === direction.x % 180) return true;

        let sizeX = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_X) || 1;
        let sizeY = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_Y) || 1;

        if(sizeX < 1) sizeX = 1;
        if(sizeY < 1) sizeY = 1;

        let limitSizeX = sizeX;
        let limitSizeY = sizeY;

        let quadrant = Math.floor(((direction.x + 45) % 360) / 90);

        if(quadrant === 1 || quadrant === 3) 
        {
            const swap = sizeX;
            sizeX = sizeY;
            sizeY = swap;
        }

        quadrant = Math.floor(((currentDirection.x + 45) % 360) / 90);

        if(quadrant === 1 || quadrant === 3) 
        {
            const swap = limitSizeX;
            limitSizeX = limitSizeY;
            limitSizeY = swap;
        }

        if(stackingMap === null) return false;

        const alwaysStackable = model.getNumber(RoomObjectVariableEnum.FURNITURE_ALWAYS_STACKABLE) === 1;

        return stackingMap.validateLocation(
            location.x, location.y, sizeX, sizeY, location.x, location.y, limitSizeX, limitSizeY, alwaysStackable
        );
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::validateFurnitureLocation()
    private validateFurnitureLocation(
        object: IRoomObjectController, target: IVector3d, limitLocation: IVector3d, limitDirection: IVector3d,
        stackingMap: FurniStackingHeightMap | null
    ): IVector3d | null 
    {
        const model = object.getModel();

        if(model === null) return null;

        const direction = object.getDirection();

        if(target.x === limitLocation.x && target.y === limitLocation.y && direction.x === limitDirection.x) 
        {
            return new Vector3d(limitLocation.x, limitLocation.y, limitLocation.z);
        }

        let sizeX = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_X) || 1;
        let sizeY = model.getNumber(RoomObjectVariableEnum.FURNITURE_SIZE_Y) || 1;

        if(sizeX < 1) sizeX = 1;
        if(sizeY < 1) sizeY = 1;

        const limitX = Math.trunc(limitLocation.x);
        const limitY = Math.trunc(limitLocation.y);
        let limitSizeX = sizeX;
        let limitSizeY = sizeY;

        let quadrant = Math.floor(((direction.x + 45) % 360) / 90);

        if(quadrant === 1 || quadrant === 3) 
        {
            const swap = sizeX;
            sizeX = sizeY;
            sizeY = swap;
        }

        quadrant = Math.floor(((limitDirection.x + 45) % 360) / 90);

        if(quadrant === 1 || quadrant === 3) 
        {
            const swap = limitSizeX;
            limitSizeX = limitSizeY;
            limitSizeY = swap;
        }

        if(stackingMap === null) return null;

        const alwaysStackable = model.getNumber(RoomObjectVariableEnum.FURNITURE_ALWAYS_STACKABLE) === 1;

        if(stackingMap.validateLocation(target.x, target.y, sizeX, sizeY, limitX, limitY, limitSizeX, limitSizeY, alwaysStackable)) 
        {
            return new Vector3d(target.x, target.y, stackingMap.getTileHeight(target.x, target.y));
        }

        return null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::handleFurnitureMove()
    // AS3 declares tileX/tileY as `:int` params, so the fractional tile-center values
    // callers pass (tileX + 0.5) get silently truncated straight back at the call
    // boundary — Math.trunc() here reproduces that coercion. Without it, the fractional
    // coordinates leak into FurniStackingHeightMap's flat-array indexing as non-integer
    // keys, which always miss and make validateLocation() fail unconditionally.
    private handleFurnitureMove(
        object: IRoomObjectController, data: SelectedRoomObjectData, tileX: number, tileY: number,
        stackingMap: FurniStackingHeightMap | null
    ): boolean 
    {
        if(data.loc === null || data.dir === null) return false;

        tileX = Math.trunc(tileX);
        tileY = Math.trunc(tileY);

        const originalDirection = new Vector3d();
        originalDirection.assign(object.getDirection());

        object.setDirection(data.dir);

        const target = new Vector3d(tileX, tileY, 0);
        const resolvedDirection = new Vector3d();
        resolvedDirection.assign(object.getDirection());

        let location = this.validateFurnitureLocation(object, target, data.loc, data.dir, stackingMap);

        if(location === null) 
        {
            resolvedDirection.x = this.getValidRoomObjectDirection(object, true);
            object.setDirection(resolvedDirection);
            location = this.validateFurnitureLocation(object, target, data.loc, data.dir, stackingMap);
        }

        if(location === null) 
        {
            object.setDirection(originalDirection);

            return false;
        }

        object.setLocation(location);
        object.setDirection(resolvedDirection);

        return true;
    }

    // never gets created in the first place).
    private handleObjectPlace(roomId: number, tileX: number, tileY: number): void 
    {
        const instanceData = this._roomInstanceData.get(roomId);
        let data = instanceData?.selectedObjectData ?? null;

        if(data === null || data.loc === null || data.dir === null) return;

        let object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

        if(object === null) 
        {
            this.addObjectFurniture(
                roomId, data.id, data.typeId, data.loc, data.dir, data.state,
                data.stuffData, Number(data.instanceData), -1, 0, 0, '', false, true, -1
            );

            object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

            if(object !== null) 
            {
                const allowedDirections = object.getModel()?.getNumberArray(RoomObjectVariableEnum.FURNITURE_ALLOWED_DIRECTIONS) ?? null;

                if(allowedDirections !== null && allowedDirections.length > 0) 
                {
                    const requestedDirection = data.dir.x;
                    const resolvedDirection = allowedDirections.indexOf(requestedDirection) >= 0
                        ? requestedDirection
                        : allowedDirections[0];

                    const newDir = new Vector3d(resolvedDirection);

                    object.setDirection(newDir);
                    this.updateSelectedObjectData(
                        roomId, data.id, data.category, data.loc, newDir, data.operation,
                        data.typeId, data.instanceData, data.stuffData, data.state, data.animFrame, data.posture
                    );
                    data = instanceData?.selectedObjectData ?? data;
                }
            }

            this.setObjectAlphaMultiplier(object, 0.5);
            this.setObjectMoverIconSpriteVisible(true);
        }

        if(object !== null) 
        {
            const stackingMap = this.getFurniStackingHeightMap(roomId);
            const success = this.handleFurnitureMove(object, data, tileX + 0.5, tileY + 0.5, stackingMap);

            if(!success) 
            {
                this.disposeObjectFurniture(roomId, data.id);
            }

            this.setObjectMoverIconSpriteVisible(!success);
        }
    }

    // on by FurniModel.onObjectPlaced()'s `-event.objectId === pendingPlacementRef` check).
    private placeObject(roomId: number): void 
    {
        const data = this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;

        if(data === null) return;

        const object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

        let x = 0;
        let y = 0;
        let z = 0;
        let rotation = 0;
        const placedInRoom = object !== null && object.getId() === data.id;

        if(object !== null) 
        {
            const direction = object.getDirection();
            const location = object.getLocation();

            x = location.x;
            y = location.y;
            z = location.z;
            rotation = (Math.round(direction.x / 45) % 8 + 8) % 8;

            // TODO(AS3): AS3's placeObject() (_SafeCls_1821.as:2444-2530) branches on
            // data.category to pick a different composer (group-item types 2/4, stickie
            // notes, and category===OBJECT_CATEGORY_WALL's wall-location-string variant) -
            // see PlaceObjectMessageComposer.ts's own TODO for the wall case specifically.
            if(this._connection !== null && this._objectPlacementSource === 'inventory')
            {
                this._connection.send(new PlaceObjectMessageComposer(data.id, x, y, rotation));
            }
        }

        const instanceData = data.instanceData;
        const category = data.category;

        this.resetSelectedObjectData(roomId);

        this.events.emit(
            'REOE_PLACED',
            new RoomEngineObjectPlacedEvent(
                'REOE_PLACED', roomId, -data.id, category,
                '', x, y, z, rotation, placedInRoom, true, false, instanceData
            )
        );
    }

    // which only compare the returned id against 0/-1 or match it in imageReady()).
    private getGenericRoomObjectThumbnail(
        type: string | null,
        param: string,
        listener: IGetImageListener,
        _extraData: string | null = null,
        _stuffData: unknown = null
    ): ImageResult 
    {
        const result = new ImageResult();
        result.id = -1;

        if(!this.assets || type === null) 
        {
            log.warn(`getGenericRoomObjectThumbnail: bailing out early (assets=${!!this.assets}, type=${type})`);

            return result;
        }

        const assetName = [type, param].join('_');

        if(!this.assets.hasAsset(assetName)) 
        {
            this._thumbnailIdCounter++;

            const id = this._thumbnailIdCounter;

            result.id = id;
            result.data = null;

            let pending = this._pendingThumbnailListeners.get(assetName);

            if(!pending) 
            {
                pending = [];
                this._pendingThumbnailListeners.set(assetName, pending);
                this._contentLoader?.loadThumbnailContent(id, type, param, this.events);
            }

            pending.push(listener);
        }
        else 
        {
            // TS deviation: AS3 returns the bitmap synchronously here (id=0).
            // Texture->ImageBitmap conversion is async in the browser, so this
            // path also resolves via the id>0 pending callback (see ImageResult.ts).
            this._thumbnailIdCounter++;

            const id = this._thumbnailIdCounter;

            result.id = id;
            result.data = null;

            const asset = this.assets.getAssetByName(assetName);
            const texture = (asset?.content as Texture | null) ?? null;

            this.deliverIconTexture(id, texture, [listener]);
        }

        return result;
    }

    // have the right materials but not necessarily the right shape until this is filled in.
    private initializeRoomForGettingImage(object: IRoomObjectController, payload: string | null): void 
    {
        if(payload === null) return;

        const parts = payload.split('\n');

        if(parts.length < 3) return;

        const floorType = parts[0];
        const wallType = parts[1];
        const landscapeType = parts[2];
        const extra = parts.length > 3 ? parts[3] : null;

        object.getModelController().setString('room_floor_type', floorType);
        object.getModelController().setString('room_wall_type', wallType);
        object.getModelController().setString('room_landscape_type', landscapeType);

        if(extra !== null && extra !== '') 
        {
            const maskMessage = new RoomObjectRoomMaskUpdateMessage(
                RoomObjectRoomMaskUpdateMessage.ADD_MASK,
                '20_1',
                extra,
                new Vector3d(2.5, 0.5, 2)
            );

            object.getEventHandler()?.processUpdateMessage(maskMessage);
        }
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::getRoomInstanceData()
    private getRoomInstanceData(roomId: number): IRoomEngineRoomInstanceData 
    {
        let data = this._roomInstanceData.get(roomId);

        if(data === undefined) 
        {
            data = {
                roomCamera: new RoomCamera(),
                furniStackingHeightMap: null,
                tileObjectMap: null,
                selectedObjectData: null
            };

            data.roomCamera.activateFollowing(this.cameraFollowDuration);
            this._roomInstanceData.set(roomId, data);
        }

        return data;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::handleObjectMove()
    // TS scope: category 10 (floor furniture) only, matching modifyRoomObject()'s OBJECT_MOVE case.
    private handleObjectMove(roomId: number, tileX: number, tileY: number): void 
    {
        const data = this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;

        if(data === null) return;

        const object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

        if(object === null) return;

        const stackingMap = this.getFurniStackingHeightMap(roomId);
        const success = this.handleFurnitureMove(object, data, tileX + 0.5, tileY + 0.5, stackingMap);

        this.setObjectAlphaMultiplier(object, success ? 0.5 : 0);
        this.setObjectMoverIconSpriteVisible(!success);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_1821.as::modifyRoomObject() "OBJECT_MOVE_TO" case
    // Sends the object's own current (already tile-snapped/validated) location - the object was
    // live-updated by handleObjectMove() on every preceding mouse move. Deliberately does NOT
    // call resetSelectedObjectData() on success (matches AS3: the selection is left in the
    // OBJECT_MOVE_TO state and only cleared by the next OBJECT_MOVE/OBJECT_PLACE call) - the
    // server's own echoed move-update message takes over the object's position from here.
    private confirmObjectMove(roomId: number): void 
    {
        const data = this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;

        if(data === null || data.loc === null || data.dir === null) return;

        const object = this.getRoomObject(roomId, data.id, data.category) as IRoomObjectController | null;

        if(object === null) 
        {
            this.resetSelectedObjectData(roomId);

            return;
        }

        this.updateSelectedObjectData(
            roomId, data.id, data.category, data.loc, data.dir, 'OBJECT_MOVE_TO',
            data.typeId, data.instanceData, data.stuffData, data.state, data.animFrame, data.posture
        );
        this.setObjectAlphaMultiplier(object, 1);
        this.removeObjectMoverIconSprite();

        if(this._connection !== null && data.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
        {
            const direction = ((Math.trunc(object.getDirection().x) % 360) + 360) % 360;
            const location = object.getLocation();

            this._connection.send(new MoveObjectMessageComposer(data.id, Math.trunc(location.x), Math.trunc(location.y), direction / 45));
        }

        // TODO(AS3): AS3's modifyRoomObject() "OBJECT_MOVE_TO" case (_SafeCls_1821.as:2399-2416)
        // has a third branch for data.category === OBJECT_CATEGORY_WALL (20): it fetches the
        // room's LegacyWallGeometry (roomEngine.getLegacyGeometry(), not yet exposed by this
        // port's IRoomEngine) and sends getOldLocationString(object.getLocation(), direction)
        // through a dedicated wall-move composer (_SafeCls_2682: objectId, category,
        // locationString) - neither the composer nor getLegacyGeometry() exist in this port yet,
        // so moving an already-placed wall item never reaches the server. Mirrors
        // PlaceObjectMessageComposer.ts's own documented wall-placement gap on the place side.
    }

    // AS3: sources/win63_client/com/sulake/habbo/room/RoomEngine.as::getRoomObjectScreenLocation()
    private getRoomObjectScreenLocation(roomId: number, objectId: number, category: number, canvasId: number = 1): {
        x: number;
        y: number
    } | null 
    {
        const geometry = this.getRoomCanvasGeometry(roomId, canvasId);

        if(!geometry) return null;

        const object = this.getRoomObject(roomId, objectId, category);

        if(!object) return null;

        const point = geometry.getScreenPoint(object.getLocation());

        if(!point) return null;

        const canvas = this._renderingCanvases.get(roomId * 1000 + canvasId);

        if(canvas) 
        {
            point.x *= canvas.scale;
            point.y *= canvas.scale;
            point.x += canvas.width / 2 + canvas.screenOffsetX;
            point.y += canvas.height / 2 + canvas.screenOffsetY;
        }

        return point;
    }

    // flying icon.
    private animatePickupToInventory(objectId: number, category: number, object: IRoomObject): void 
    {
        if(!this._toolbar) return;

        const screenLocation = this.getRoomObjectScreenLocation(this._activeRoomId, objectId, category);

        if(!screenLocation) return;

        const model = object.getModel();
        const typeId = model.getNumber('furniture_type_id');
        const extras = category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL
            ? model.getString('furniture_data')
            : model.getString('furniture_extras');

        const listener: IGetImageListener = {
            imageReady: (_id: number, data: ImageBitmap | null) => 
            {
                if(data) this._toolbar?.createTransitionToIcon('HTIE_ICON_INVENTORY', data, screenLocation.x, screenLocation.y);
            },
            imageFailed: () => 
            {
            }
        };

        const result = category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL
            ? this.getWallItemIcon(typeId, listener, extras)
            : this.getFurnitureIcon(typeId, listener, extras);

        if(result.id === 0 && result.data) 
        {
            this._toolbar.createTransitionToIcon('HTIE_ICON_INVENTORY', result.data, screenLocation.x, screenLocation.y);
        }
    }

    private onTickerUpdate = (): void => 
    {
        for(const callback of this._canvasSyncCallbacks) 
        {
            callback();
        }
    };

    /**
     * Get or create a rendering canvas for a room
     */
    private getExistingRenderingCanvas(roomId: number, canvasId: number = 1): RoomRenderingCanvas | null 
    {
        const key = roomId * 1000 + canvasId;

        return this._renderingCanvases.get(key) ?? null;
    }

    private applyRoomCanvasGeometry(roomId: number, canvas: RoomRenderingCanvas): void 
    {
        const room = this.getRoomInstance(roomId);

        if(!room || !canvas.geometry) return;

        const roomZScale = room.getNumber('room_z_scale');

        if(!Number.isNaN(roomZScale)) 
        {
            canvas.geometry.z_scale = roomZScale;
        }

        const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM);
        const model = roomObject?.getModel();

        if(!model) return;

        const doorX = model.getNumber(RoomObjectVariableEnum.ROOM_DOOR_X);
        const doorY = model.getNumber(RoomObjectVariableEnum.ROOM_DOOR_Y);
        const doorZ = model.getNumber(RoomObjectVariableEnum.ROOM_DOOR_Z);
        const doorDir = model.getNumber(RoomObjectVariableEnum.ROOM_DOOR_DIR);

        if(Number.isNaN(doorX) || Number.isNaN(doorY) || Number.isNaN(doorZ) || Number.isNaN(doorDir)) 
        {
            return;
        }

        let displacement: IVector3d | null = null;

        if(doorDir === 90) displacement = new Vector3d(-2000, 0, 0);
        if(doorDir === 180) displacement = new Vector3d(0, -2000, 0);

        if(displacement) 
        {
            canvas.geometry.setDisplacement(new Vector3d(doorX, doorY, doorZ), displacement);
        }
    }

    /**
     * Handles free room camera dragging.
     *
     * AS3: sources/win63_version/habbo/room/class_34.as handleRoomDragging()
     */
    private handleRoomDragging(
        canvas: RoomRenderingCanvas,
        x: number,
        y: number,
        type: string,
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean
    ): boolean 
    {
        let deltaX = x - this._roomDragLastX;
        let deltaY = y - this._roomDragLastY;

        if(type === 'mouseDown') 
        {
            if(!altKey && !ctrlKey && !shiftKey && !this.isDecorateMode) 
            {
                this._roomDragging = true;
                this._roomDragStarted = false;
                this._roomDragStartX = x;
                this._roomDragStartY = y;
            }
        }
        else if(type === 'mouseUp') 
        {
            if(this._roomDragging) 
            {
                this._roomDragging = false;

                if(this._roomDragStarted) 
                {
                    const camera = this.getRoomInstanceData(this._activeRoomId).roomCamera;

                    if(this.useOffsetScrolling) 
                    {
                        if(!camera.isMoving) 
                        {
                            camera.centeredLocX = false;
                            camera.centeredLocY = false;
                        }

                        camera.resetLocation(new Vector3d(-canvas.screenOffsetX, -canvas.screenOffsetY));
                    }

                    if(this._roomDraggingAlwaysCenters) 
                    {
                        camera.reset();
                    }

                    this.events.emit(
                        RoomEngineDragWithMouseEvent.DRAG_END,
                        new RoomEngineDragWithMouseEvent(RoomEngineDragWithMouseEvent.DRAG_END, this._activeRoomId)
                    );
                }
            }
        }
        else if(type === 'mouseMove') 
        {
            if(this._roomDragging) 
            {
                if(!this._roomDragStarted) 
                {
                    deltaX = x - this._roomDragStartX;
                    deltaY = y - this._roomDragStartY;

                    if(deltaX <= -ROOM_DRAG_THRESHOLD ||
                        deltaX >= ROOM_DRAG_THRESHOLD ||
                        deltaY <= -ROOM_DRAG_THRESHOLD ||
                        deltaY >= ROOM_DRAG_THRESHOLD) 
                    {
                        this._roomDragStarted = true;
                        this.events.emit(
                            RoomEngineDragWithMouseEvent.DRAG_START,
                            new RoomEngineDragWithMouseEvent(RoomEngineDragWithMouseEvent.DRAG_START, this._activeRoomId)
                        );
                    }

                    deltaX = 0;
                    deltaY = 0;
                }

                if(deltaX !== 0 || deltaY !== 0) 
                {
                    canvas.screenOffsetX += deltaX;
                    canvas.screenOffsetY += deltaY;

                    if(!this._roomDragStarted) 
                    {
                        this.events.emit(
                            RoomEngineDragWithMouseEvent.DRAG_START,
                            new RoomEngineDragWithMouseEvent(RoomEngineDragWithMouseEvent.DRAG_START, this._activeRoomId)
                        );
                    }

                    this._roomDragStarted = true;
                }

                if(this._roomDragStarted) 
                {
                    canvas.suppressMouseUpdate();

                    return true;
                }
            }
        }
        else if(type === 'click' || type === 'doubleClick') 
        {
            this._roomDragging = false;

            if(this._roomDragStarted) 
            {
                this._roomDragStarted = false;

                return true;
            }
        }

        return false;
    }

    /**
     * Process loaded room content bundle and create RoomVisualizationData.
     */
    private onRoomContentReady(): void 
    {
        const asset = this.findAssetByName('room') as NitroAsset | null;

        if(!asset) return;

        const jsonData = asset.jsonData;

        if(!jsonData) return;

        // Extract room visualization data from bundle JSON
        // The room.nitro bundle contains a "roomVisualization" key with floor/wall/landscape data
        const vizData = ((jsonData as Record<string, unknown>).roomVisualization ?? null) as IAssetRoomVisualizationData | null;

        if(!vizData) 
        {
            log.warn('Room bundle has no roomVisualization data');
            return;
        }

        // Create RoomVisualizationData and initialize with JSON config
        this._roomVisualizationData = new RoomVisualizationData();
        this._roomVisualizationData.initialize(vizData);

        // Convert PixiJS textures to HTMLCanvasElement for the rasterizer system.
        //
        // Nitro bundle spritesheet frames are prefixed with the library name
        // (e.g. frame "room_floor_texture_64_0_floor_basic"), while the
        // roomVisualization JSON's bitmap "assetName" references omit that
        // prefix (e.g. "floor_texture_64_0_floor_basic") — same convention
        // GraphicAssetCollection.defineAssets() already resolves for
        // avatars/furniture. Register both forms so PlaneRasterizer's
        // direct-name lookup resolves regardless of which form it sees.
        const canvasTextures = new Map<string, HTMLCanvasElement>();
        const textures: Map<string, Texture> = asset.textures;
        const libraryPrefix = `${OBJECT_TYPE_ROOM}_`;

        if(textures) 
        {
            for(const [name, texture] of textures) 
            {
                const canvas = this.pixiTextureToCanvas(texture);

                if(canvas !== null) 
                {
                    canvasTextures.set(name, canvas);

                    if(name.startsWith(libraryPrefix)) 
                    {
                        canvasTextures.set(name.slice(libraryPrefix.length), canvas);
                    }
                }
            }
        }

        this._roomVisualizationData.initializeAssetCollection(canvasTextures);

        log.debug(`Room visualization data initialized with ${canvasTextures.size} textures`);
    }

    /**
     * Convert a PixiJS Texture to an HTMLCanvasElement.
     *
     * TS note: this used to read texture.source.resource directly and draw it via
     * ctx.drawImage(). That's fragile - PixiJS doesn't guarantee a CPU-side resource
     * stays attached to a TextureSource once it's been uploaded to the GPU (source.resource
     * can legitimately be undefined for a fully valid, on-screen texture). renderer.extract.canvas()
     * is PixiJS's own supported way to read a Texture back to a canvas regardless of backing
     * resource, so it's used here instead.
     */
    private pixiTextureToCanvas(texture: Texture): HTMLCanvasElement | null 
    {
        try 
        {
            const frame = texture.frame;

            if(frame.width < 1 || frame.height < 1) return null;

            const canvas = Vortex.instance.application.renderer.extract.canvas(texture);

            return canvas as HTMLCanvasElement;
        }
        catch (error) 
        {
            log.warn('pixiTextureToCanvas: failed to convert texture to canvas', error);

            return null;
        }
    }

    private fixedUserLocation(roomId: number, location: IVector3d | null): IVector3d | null 
    {
        void roomId;

        if(location === null) 
        {
            return null;
        }

        // TODO(AS3): sources/win63_version/habbo/room/class_34.as
        // RoomEngine.fixedUserLocation must adjust avatar z using FurniStackingHeightMap
        // and LegacyWallGeometry when those per-room maps are stored on RoomEngine.
        return location;
    }

    private getRoomIdentifier(roomId: number): string 
    {
        return `${ROOM_ID_PREFIX}${roomId}`;
    }

    private onRoomObjectEvent(event: unknown): void
    {
        // Handle tile mouse events for tile cursor
        if(event instanceof RoomObjectTileMouseEvent)
        {
            this.handleTileMouseEvent(event);
        }
        else if(event instanceof RoomObjectMouseEvent)
        {
            this.handleObjectMouseEvent(event);
        }
        // AS3: RoomObjectEventHandler.as::processObjectEvent() ROSCE_STATE_CHANGE/ROSCE_STATE_RANDOM
        // cases — a furni "use" (e.g. double-click, dispatched by FurnitureLogic.useObject()) turns
        // into the server use/state message. This is what opens a wired furni's config.
        else if(event instanceof RoomObjectStateChangeEvent)
        {
            if(event.type === RoomObjectStateChangeEvent.ROSCE_STATE_RANDOM)
            {
                this.handleObjectRandomStateChange(event);
            }
            else
            {
                this.handleObjectStateChange(event);
            }
        }

        // Forward object events
        if(event && typeof event === 'object' && 'type' in event)
        {
            this.events.emit('roomObjectEvent', event);
        }
    }

    // AS3: sources/win63_version/habbo/room/class_1947.as::handleObjectStateChange()
    private handleObjectStateChange(event: RoomObjectStateChangeEvent): void
    {
        const object = event.object;

        if(object === null) return;

        this.changeObjectState(this._activeRoomId, object.getId(), object.getType(), event.param, false);
    }

    // AS3: sources/win63_version/habbo/room/class_1947.as::handleObjectRandomStateChange()
    private handleObjectRandomStateChange(event: RoomObjectStateChangeEvent): void
    {
        const object = event.object;

        if(object === null) return;

        this.changeObjectState(this._activeRoomId, object.getId(), object.getType(), event.param, true);
    }

    // AS3: sources/win63_version/habbo/room/class_1947.as::changeObjectState()
    private changeObjectState(roomId: number, objectId: number, objectType: string, state: number, isRandom: boolean): void
    {
        const category = this.getRoomObjectCategory(objectType);

        this.changeRoomObjectState(roomId, objectId, category, state, isRandom);
    }

    // AS3: sources/win63_version/habbo/room/class_1947.as::changeRoomObjectState()
    private changeRoomObjectState(roomId: number, objectId: number, category: number, state: number, isRandom: boolean): boolean
    {
        if(this._connection === null) return true;

        const session = this._roomSessionManager?.getSession(roomId) ?? null;

        if(session !== null && session.playTestMode)
        {
            const object = this.getRoomObject(roomId, objectId, category);

            if(object !== null && object.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_USAGE_POLICY) < 2)
            {
                return false;
            }
        }

        const selectedObjectData = this._roomInstanceData.get(roomId)?.selectedObjectData ?? null;

        if(selectedObjectData === null || selectedObjectData.operation !== 'OBJECT_PLACE')
        {
            if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
            {
                if(!isRandom)
                {
                    this._connection.send(new UseFurnitureMessageComposer(objectId, state));
                }
                // TODO(AS3): else SetRandomStateMessageComposer(objectId, state) — composer not ported.
            }
            // TODO(AS3): category OBJECT_CATEGORY_WALL → UseWallItemMessageComposer(objectId, state) —
            // composer not ported; wired furni are floor items (category 10) so this is not on the
            // wired open path.
        }

        // TODO(AS3): session.trackEventLogOncePerSession('Achievements', 'interaction', 'furniture.use').
        return true;
    }

    /**
     * Handle tile mouse events - update the tile cursor.
     * Based on AS3 RoomObjectEventHandler.handleMouseOverTile()
     */
    private handleTileMouseEvent(event: RoomObjectTileMouseEvent): void 
    {
        if(this._activeRoomId < 0) return;

        const tileX = event.tileXAsInt;
        const tileY = event.tileYAsInt;
        const tileZ = event.tileZAsInt;

        if(event.type === RoomObjectMouseEvent.ROE_MOUSE_MOVE)
        {
            // Cache the tile for recalibrateMovements() (AS3 _moveMouseEventCache).
            this._moveMouseEventCache = new Vector3d(tileX, tileY, tileZ);

            const tileCursor = this.getTileCursor(this._activeRoomId);

            if(tileCursor && tileCursor.getEventHandler()) 
            {
                const cursorUpdate = new RoomObjectTileCursorUpdateMessage(
                    new Vector3d(tileX, tileY, tileZ),
                    0,
                    true,
                    event.eventId
                );

                tileCursor.getEventHandler()!.processUpdateMessage(cursorUpdate);
            }

            // AS3: _SafeCls_1821.as::handleObjectPlace()/handleObjectMove() — real ghost-object
            // preview while an inventory item is pending placement or an already-placed object
            // is being dragged (category 10 only, see initializeRoomObjectInsert()'s TODO(AS3)).
            const selectedObjectData = this._roomInstanceData.get(this._activeRoomId)?.selectedObjectData ?? null;

            if(selectedObjectData !== null && selectedObjectData.category === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) 
            {
                if(selectedObjectData.operation === 'OBJECT_PLACE') 
                {
                    this.handleObjectPlace(this._activeRoomId, tileX, tileY);
                }
                else if(selectedObjectData.operation === 'OBJECT_MOVE') 
                {
                    this.handleObjectMove(this._activeRoomId, tileX, tileY);
                }
            }
        }
        else if(event.type === RoomObjectMouseEvent.ROE_MOUSE_CLICK) 
        {
            const selectedObjectData = this._roomInstanceData.get(this._activeRoomId)?.selectedObjectData ?? null;

            if(selectedObjectData !== null && selectedObjectData.operation === 'OBJECT_PLACE') 
            {
                // AS3: _SafeCls_1821.as::placeObject() — sends the ghost's own current
                // (already tile-snapped/direction-validated) location, then disposes it;
                // the real furniture only appears once the server echoes the add back.
                this.placeObject(this._activeRoomId);
            }
            else if(selectedObjectData !== null && selectedObjectData.operation === 'OBJECT_MOVE') 
            {
                // AS3: _SafeCls_1821.as::modifyRoomObject() "OBJECT_MOVE_TO" case
                this.confirmObjectMove(this._activeRoomId);
            }
            else if(this._connection) 
            {
                this._connection.send(new MoveAvatarMessageComposer(tileX, tileY));
            }
        }
    }

    /**
     * Handle object mouse events - selects the clicked object (furniture/user)
     * so widgets (e.g. infostand) can react, and logs the click for debugging.
     *
     * AS3: sources/win63_version/habbo/room/class_34.as — object click handling
     * that leads to RoomEngineObjectEvent.REOE_SELECTED being dispatched.
     */
    private handleObjectMouseEvent(event: RoomObjectMouseEvent): void 
    {
        if(event.type !== RoomObjectMouseEvent.ROE_MOUSE_CLICK) return;

        const obj = event.object;

        if(!obj) return;

        const objType = obj.getType();
        const objId = obj.getId();

        const loc = obj.getLocation();

        log.info(`[CLICK] Object id=${objId} type="${objType}" pos=(${loc?.x?.toFixed(1)}, ${loc?.y?.toFixed(1)}, ${loc?.z?.toFixed(1)})`);

        if(this._activeRoomId < 0) return;

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as:2391-2398
        // A click no room object handled (i.e. the floor/empty space) dispatches
        // REOE_DESELECTED(roomId, -1, MINIMUM) unconditionally. Without this the
        // InfoStand furni/user panels and the own-avatar bubble never closed when
        // clicking away.
        if(objType === 'room' || objId < 0)
        {
            this._selectedObject = null;

            this.events.emit(
                RoomEngineObjectEvent.REOE_DESELECTED,
                new RoomEngineObjectEvent(
                    RoomEngineObjectEvent.REOE_DESELECTED,
                    this._activeRoomId,
                    -1,
                    RoomObjectCategoryEnum.MINIMUM
                )
            );

            return;
        }

        const category = this.findObjectCategory(this._activeRoomId, obj);

        if(category !== null)
        {
            this.selectRoomObject(this._activeRoomId, objId, category);
        }
    }

    /**
     * Resolves the category (FURNITURE/WALL/USER) a room object was created under.
     * Objects don't self-report a category, so this probes each category's manager
     * for the same object reference at this id.
     */
    private findObjectCategory(roomId: number, obj: IRoomObject): number | null 
    {
        const id = obj.getId();
        const candidates = [
            RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_USER,
        ];

        for(const category of candidates) 
        {
            if(this.getRoomObject(roomId, id, category) === obj) 
            {
                return category;
            }
        }

        return null;
    }

    /**
     * Selects a room object and dispatches REOE_SELECTED, deselecting
     * whatever was previously selected in that room first.
     *
     * AS3: sources/win63_version/habbo/ui/RoomDesktop.as::roomObjectEventHandler()
     * ("REOE_SELECTED" case) is what ultimately consumes this on the UI side.
     */
    private selectRoomObject(roomId: number, id: number, category: number): void 
    {
        if(this._selectedObject && (this._selectedObject.id !== id || this._selectedObject.category !== category)) 
        {
            this.deselectRoomObject();
        }

        this._selectedObject = {roomId, id, category};

        this.events.emit(
            RoomEngineObjectEvent.REOE_SELECTED,
            new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_SELECTED, roomId, id, category)
        );
    }

    /**
     * Deselects the currently selected room object (if any) and dispatches
     * REOE_DESELECTED.
     */
    private deselectRoomObject(): void 
    {
        if(!this._selectedObject) return;

        const {roomId, id, category} = this._selectedObject;

        this._selectedObject = null;

        this.events.emit(
            RoomEngineObjectEvent.REOE_DESELECTED,
            new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_DESELECTED, roomId, id, category)
        );
    }

    /**
     * Create and add a visualization for a room object.
     * Uses the visualization factory for creating visualization instances.
     *
     * @see AS3 RoomManager.createRoomObject() visualization creation
     */
    private createVisualizationForObject(roomId: number, objectId: number, type: string): IRoomObjectSpriteVisualization | null 
    {
        const visualization = this._visualizationFactory.createRoomObjectVisualization(type);

        if(visualization === null) 
        {
            return null;
        }

        // Check if visualization is sprite-based
        const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            return null;
        }

        const object = room.getObject(objectId, this.getRoomObjectCategory(type));

        if(object) 
        {
            spriteVisualization.object = object;
        }

        // Initialize room visualization with texture data (rasterizers)
        if(type === OBJECT_TYPE_ROOM && this._roomVisualizationData !== null) 
        {
            spriteVisualization.initialize(this._roomVisualizationData);
        }

        if(object) 
        {
            (object as IRoomObjectController).setVisualization(visualization);
            room.getRenderer()?.feedRoomObject(object);
        }

        return spriteVisualization;
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::updateRoomCameras()
    private updateRoomCameras(time: number): void 
    {
        for(const [roomId, data] of this._roomInstanceData) 
        {
            const camera = data.roomCamera;
            const target = this.getRoomObject(roomId, camera.targetId, camera.targetCategory);

            if(target !== null) 
            {
                if(roomId !== this._activeRoomId || !this._roomDragging) 
                {
                    this.updateRoomCamera(roomId, 1, target.getLocation(), time);
                }
            }
        }
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::updateRoomCamera()
    private updateRoomCamera(roomId: number, canvasId: number, targetLocation: IVector3d, time: number): void 
    {
        const canvas = this._renderingCanvases.get(roomId * 1000 + canvasId);
        const data = this._roomInstanceData.get(roomId);
        const room = this.getRoomInstance(roomId);

        if(canvas === undefined || data === undefined || room === null || canvas.scale !== 1) 
        {
            return;
        }

        const geometry = canvas.geometry;
        const camera = data.roomCamera;
        const screenWidth = Math.round(canvas.width);
        const screenHeight = Math.round(canvas.height);
        const activeRoomBounds = this.getActiveRoomBoundingRectangle(canvasId);

        if(activeRoomBounds !== null &&
            (activeRoomBounds.right < 0 ||
                activeRoomBounds.bottom < 0 ||
                activeRoomBounds.left >= screenWidth ||
                activeRoomBounds.top >= screenHeight)) 
        {
            camera.reset();
        }

        if(camera.screenWd === screenWidth &&
            camera.screenHt === screenHeight &&
            camera.scale === geometry.scale &&
            camera.geometryUpdateId === geometry.updateId &&
            Vector3d.isEqual(targetLocation, camera.targetObjectLoc) &&
            !camera.isMoving) 
        {
            camera.limitedLocationX = false;
            camera.limitedLocationY = false;
            camera.centeredLocX = false;
            camera.centeredLocY = false;

            return;
        }

        camera.targetObjectLoc = targetLocation;

        const target = new Vector3d(
            Math.round(targetLocation.x),
            Math.round(targetLocation.y),
            Math.floor(targetLocation.z) + 1
        );

        const minX = room.getNumber(RoomVariableEnum.ROOM_MIN_X) - 0.5;
        const minY = room.getNumber(RoomVariableEnum.ROOM_MIN_Y) - 0.5;
        const maxX = room.getNumber(RoomVariableEnum.ROOM_MAX_X) + 0.5;
        const maxY = room.getNumber(RoomVariableEnum.ROOM_MAX_Y) + 0.5;

        if(!Number.isFinite(minX) ||
            !Number.isFinite(minY) ||
            !Number.isFinite(maxX) ||
            !Number.isFinite(maxY))
        {
            return;
        }

        if(activeRoomBounds === null)
        {
            // AS3 (_SafeCls_90.as:1155-1158): with no active bounds yet, nudge the
            // geometry toward the origin and bail. A bare return leaves the camera
            // wherever it was, so the first framing inherits the previous room's
            // residual position instead of a defined origin.
            geometry.adjustLocation(new Vector3d(0, 0), 25);

            return;
        }

        const centerX = Math.round((minX + maxX) / 2);
        const centerY = Math.round((minY + maxY) / 2);
        let cameraZ = target.z;
        let localX = target.x - centerX;
        let localY = target.y - centerY;
        const xScale = geometry.scale / Math.sqrt(2);
        const yScale = xScale / 2;
        const angle = -((geometry.direction.x + 90) / 180) * Math.PI;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rotatedX = localX * cos - localY * sin;
        const rotatedY = localX * sin + localY * cos;

        localX = rotatedX;
        localY = rotatedY * (yScale / xScale);

        const maxScreenX = screenWidth / 2 / xScale - 1;
        const maxScreenY = screenHeight / 2 / yScale - 1;
        // AS3 (_SafeCls_90.as:1134,1148): the room-centre screen anchor uses the
        // constant z = 2 (_loc19_), NOT the target's floor(z)+1 (_loc46_ / cameraZ,
        // which is reserved for the target location below). The port had fused the two.
        const centerScreen = geometry.getScreenPoint(new Vector3d(centerX, centerY, 2));

        if(centerScreen === null) 
        {
            return;
        }

        centerScreen.x += Math.round(screenWidth / 2);
        centerScreen.y += Math.round(screenHeight / 2);

        const bounds = {
            left: activeRoomBounds.left - canvas.screenOffsetX,
            top: activeRoomBounds.top - canvas.screenOffsetY,
            right: activeRoomBounds.right - canvas.screenOffsetX,
            bottom: activeRoomBounds.bottom - canvas.screenOffsetY,
            width: activeRoomBounds.width,
            height: activeRoomBounds.height
        };

        if(!(bounds.width > 1 && bounds.height > 1)) 
        {
            geometry.adjustLocation(new Vector3d(-30, -30), 25);

            return;
        }

        const boundLeft = (bounds.left - centerScreen.x - geometry.scale * 0.25) / xScale;
        const boundRight = (bounds.right - centerScreen.x + geometry.scale * 0.25) / xScale;
        const boundTop = (bounds.top - centerScreen.y - geometry.scale * 0.5) / yScale;
        const boundBottom = (bounds.bottom - centerScreen.y + geometry.scale * 0.5) / yScale;
        let limitedLocationX = false;
        let limitedLocationY = false;
        let centeredLocX = false;
        let centeredLocY = false;
        const roomScreenWidth = Math.round((boundRight - boundLeft) * xScale);

        if(roomScreenWidth < screenWidth) 
        {
            cameraZ = 2;
            localX = (boundRight + boundLeft) / 2;
            centeredLocX = true;
        }
        else 
        {
            if(localX > boundRight - maxScreenX) 
            {
                localX = boundRight - maxScreenX;
                limitedLocationX = true;
            }

            if(localX < boundLeft + maxScreenX) 
            {
                localX = boundLeft + maxScreenX;
                limitedLocationX = true;
            }
        }

        const roomScreenHeight = Math.round((boundBottom - boundTop) * yScale);

        if(roomScreenHeight < screenHeight) 
        {
            cameraZ = 2;
            localY = (boundBottom + boundTop) / 2;
            centeredLocY = true;
        }
        else 
        {
            if(localY > boundBottom - maxScreenY) 
            {
                localY = boundBottom - maxScreenY;
                limitedLocationY = true;
            }

            if(localY < boundTop + maxScreenY) 
            {
                localY = boundTop + maxScreenY;
                limitedLocationY = true;
            }

            if(limitedLocationY) 
            {
                localY /= yScale / xScale;
            }
        }

        const invX = localX * cos + localY * sin;
        const invY = -localX * sin + localY * cos;
        const desiredLocation = new Vector3d(
            Math.round((invX + centerX) * 2) / 2,
            Math.round((invY + centerY) * 2) / 2,
            cameraZ
        );

        let topMargin = 0.35;
        let bottomMargin = 0.2;
        let sideMargin = 0.2;
        const minViewWidth = 10;
        const minViewHeight = 10;

        if(sideMargin * screenWidth > 100) 
        {
            sideMargin = 100 / screenWidth;
        }

        if(topMargin * screenHeight > 150) 
        {
            topMargin = 150 / screenHeight;
        }

        if(bottomMargin * screenHeight > 150) 
        {
            bottomMargin = 150 / screenHeight;
        }

        if(camera.limitedLocationX && camera.screenWd === screenWidth && camera.screenHt === screenHeight) 
        {
            sideMargin = 0;
        }

        if(camera.limitedLocationY && camera.screenWd === screenWidth && camera.screenHt === screenHeight) 
        {
            topMargin = 0;
            bottomMargin = 0;
        }

        let viewWidth = screenWidth * (1 - sideMargin * 2);
        let viewHeight = screenHeight * (1 - (topMargin + bottomMargin));

        if(viewWidth < minViewWidth) 
        {
            viewWidth = minViewWidth;
        }

        if(viewHeight < minViewHeight) 
        {
            viewHeight = minViewHeight;
        }

        const viewLeft = -viewWidth / 2;
        const viewTop = topMargin + bottomMargin > 0 ? -viewHeight * (bottomMargin / (topMargin + bottomMargin)) : -viewHeight / 2;
        const viewRight = viewLeft + viewWidth;
        const viewBottom = viewTop + viewHeight;
        // AS3 (_SafeCls_90.as:1266,1273): the target's screen point is taken with the
        // raw z (_loc6_.z is still param3.z here); _loc6_.z is only overwritten with
        // floor(z)+1 afterwards. target.z already holds floor(z)+1, so pass the raw z.
        const targetScreen = geometry.getScreenPoint(new Vector3d(target.x, target.y, targetLocation.z));

        if(targetScreen === null) 
        {
            return;
        }

        targetScreen.x += canvas.screenOffsetX;
        targetScreen.y += canvas.screenOffsetY;

        if(camera.location === null)
        {
            // AS3 (_SafeCls_90.as:1278): the first framing snaps the geometry straight
            // to desiredLocation (`location = _loc6_`), no z-offset. adjustLocation(…, 0)
            // sets it directly (offset = -0 * unitZ = 0); the previous `, 25` shifted the
            // start point 25 along z, so the camera visibly travelled in on every entry.
            geometry.adjustLocation(desiredLocation, 0);

            if(this.useOffsetScrolling)
            {
                camera.initializeLocation(new Vector3d(0, 0, 0));
            }
            else 
            {
                camera.initializeLocation(desiredLocation);
            }
        }

        const desiredScreen = geometry.getScreenPoint(desiredLocation);

        if(desiredScreen !== null) 
        {
            const roomSizeChanged = camera.roomWd !== activeRoomBounds.width ||
                camera.roomHt !== activeRoomBounds.height ||
                camera.screenWd !== screenWidth ||
                camera.screenHt !== screenHeight;
            const shouldMove = (((targetScreen.x < viewLeft || targetScreen.x > viewRight) && !camera.centeredLocX) ||
                ((targetScreen.y < viewTop || targetScreen.y > viewBottom) && !camera.centeredLocY) ||
                (centeredLocX && !camera.centeredLocX && camera.screenWd !== screenWidth) ||
                (centeredLocY && !camera.centeredLocY && camera.screenHt !== screenHeight) ||
                roomSizeChanged);

            if(shouldMove) 
            {
                camera.limitedLocationX = limitedLocationX;
                camera.limitedLocationY = limitedLocationY;
                camera.target = this.useOffsetScrolling ? new Vector3d(desiredScreen.x, desiredScreen.y, 0) : desiredLocation;
            }
            else 
            {
                if(!limitedLocationX) 
                {
                    camera.limitedLocationX = false;
                }

                if(!limitedLocationY) 
                {
                    camera.limitedLocationY = false;
                }
            }
        }

        camera.centeredLocX = centeredLocX;
        camera.centeredLocY = centeredLocY;
        camera.screenWd = screenWidth;
        camera.screenHt = screenHeight;
        camera.scale = geometry.scale;
        camera.geometryUpdateId = geometry.updateId;
        camera.roomWd = activeRoomBounds.width;
        camera.roomHt = activeRoomBounds.height;

        if(!(this._sessionDataManager?.isRoomCameraFollowDisabled ?? false)) 
        {
            camera.update(time, this.useOffsetScrolling ? 8 : 0.5);
        }

        const location = camera.location;

        if(location === null) 
        {
            return;
        }

        if(this.useOffsetScrolling) 
        {
            canvas.screenOffsetX = -location.x;
            canvas.screenOffsetY = -location.y;
        }
        else 
        {
            geometry.adjustLocation(location, 25);
        }
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::getActiveRoomBoundingRectangle()
    private getActiveRoomBoundingRectangle(canvasId: number): IRoomEngineRectangle | null 
    {
        return this.getRoomObjectBoundingRectangle(
            this._activeRoomId,
            OBJECT_ID_ROOM,
            RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM,
            canvasId
        );
    }

    /**
     * Configuration has finished loading - set up the content loader and room manager,
     * then re-derive everything else that reads configuration.
     *
     * AS3's own dependency setter for IID_HabboConfigurationManager is `null` (does nothing
     * synchronously at resolution time); this whole method is what its 'complete' listener calls.
     *
     * @see AS3 sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::onConfigurationComplete() lines 458-485
     */
    private onConfigurationComplete(): void
    {
        if(!this.assets || !this._configurationManager)
        {
            return;
        }

        // AS3: _roomContentLoader.visualizationFactory = _visualizationFactory
        this._contentLoader.visualizationFactory = this._visualizationFactory;
        // AS3: _roomContentLoader.iconAssets = assets
        this._contentLoader.iconAssets = this.assets;
        // AS3: _roomContentLoader.iconListener = this
        this._contentLoader.iconListener = this;

        // AS3: var_1634.initialize(events, this)
        this._contentLoader.initialize(this.events, this.assets, this._configurationManager);

        if(this._sessionDataManager)
        {
            this._contentLoader.sessionDataManager = this._sessionDataManager;
        }

        // AS3: _roomManager categories and content loader are set here; initialize() waits for RCL_LOADER_READY.
        if(this._roomManager)
        {
            this._roomManager.addObjectUpdateCategory(10);
            this._roomManager.addObjectUpdateCategory(20);
            this._roomManager.addObjectUpdateCategory(100);
            this._roomManager.addObjectUpdateCategory(200);
            this._roomManager.addObjectUpdateCategory(0);
            this._roomManager.setContentLoader(this._contentLoader);
        }

        this.events.off(RoomContentLoader.CONTENT_LOADER_READY, this._boundOnContentLoaderReady);
        this.events.on(RoomContentLoader.CONTENT_LOADER_READY, this._boundOnContentLoaderReady);

        // AS3: _roomDraggingAlwaysCenters = getBoolean("room.dragging.always_center");
        this._roomDraggingAlwaysCenters = this._configurationManager.getBoolean('room.dragging.always_center');

        // TS-only: not part of AS3's onConfigurationComplete() (its two real AS3 call sites are
        // onToolbarClicked()'s MEMENU case and setOwnUserId(), both unrelated to configuration).
        // cameraFollowDuration itself reads config ("room.camera.follow_user"), so any room camera
        // created via getRoomInstanceData() before configuration finished loading would have locked
        // in the wrong (default) follow duration - this retroactively re-applies the real value to
        // every room created so far, a gap that can't exist in AS3 since configuration is always
        // already available before any room is created there.
        for(const data of this._roomInstanceData.values())
        {
            data.roomCamera.activateFollowing(this.cameraFollowDuration);
        }
    }

    // AS3: sources/win63_version/habbo/room/class_34.as::onContentLoaderReady()
    private onContentLoaderReady(): void 
    {
        if(this._roomManager === null) 
        {
            return;
        }

        this._roomManager.initialize(null, this);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getFurnitureColorIndex()
    private getFurnitureColorIndex(typeId: number): number 
    {
        if(this._contentLoader != null) return this._contentLoader.getActiveObjectColorIndex(typeId);

        return 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getWallItemColorIndex()
    private getWallItemColorIndex(typeId: number): number 
    {
        if(this._contentLoader != null) return this._contentLoader.getWallItemColorIndex(typeId);

        return 0;
    }

    /**
     * Get furniture className from typeId.
     * Uses RoomContentLoader's typeId→className mapping (populated by setActiveObjectType/setWallItemType).
     *
     * @see AS3 RoomContentLoader var_2179
     * @param typeId The furniture type ID
     * @param category The object category (furniture or wall)
     * @returns The className string
     */
    private getFurnitureClassName(typeId: number, category: number): string 
    {
        // First try the content loader's typeId→className map
        const className = this._contentLoader.getClassName(typeId, category);

        if(className) 
        {
            return className;
        }

        // Fallback to SessionDataManager
        if(this._sessionDataManager) 
        {
            let furniData;

            if(category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL) 
            {
                furniData = this._sessionDataManager.getWallItemData(typeId);
            }
            else 
            {
                furniData = this._sessionDataManager.getFloorItemData(typeId);
            }

            if(furniData) 
            {
                return furniData.className;
            }
        }

        log.warn(`Unknown furniture typeId: ${typeId}, category: ${category}`);

        return `type_${typeId}`;
    }

    /**
     * Start loading furniture content and track pending visualization requests.
     */
    private loadFurnitureContent(roomId: number, objectId: number, className: string, category: number): void
    {
        // isLoaded() alone can lie: purge() frees a content type's GraphicAssetCollection to
        // reclaim GPU memory without clearing this flag (matches RoomManager.ts::isContentAvailable()/
        // createRoomObject(), which both pair the two for the same reason - see their comments).
        if(this._contentLoader.isLoaded(className) && this._contentLoader.getGraphicAssetCollection(className) !== null)
        {
            // Already loaded - create visualization immediately
            this.createVisualizationForFurniture(roomId, objectId, className, category);
            return;
        }

        // Track this object as pending for when content loads
        let pending = this._pendingFurnitureViz.get(className);

        if(!pending) 
        {
            pending = [];
            this._pendingFurnitureViz.set(className, pending);
        }

        pending.push({roomId, objectId, category});

        // Start loading
        this._contentLoader.loadObjectContent(className, this._contentLoaderEvents);
    }

    /**
     * Called when a furniture content bundle has finished loading.
     *
     * Furniture/tile-cursor content is requested via loadFurnitureContent(), which
     * always uses _contentLoaderEvents — the "room" type is never loaded through
     * this path (it's preloaded by RoomManager and reported via contentLoaded()).
     */
    private onContentLoaded(type: string): void 
    {
        // Create visualizations for all pending objects of this type
        const pending = this._pendingFurnitureViz.get(type);

        if(pending) 
        {
            for(const entry of pending) 
            {
                this.createVisualizationForFurniture(entry.roomId, entry.objectId, type, entry.category);
            }

            this._pendingFurnitureViz.delete(type);
        }
    }

    /**
     * Create a visualization for a furniture item using loaded content.
     * Uses the visualization factory for creating instances and caching viz data.
     *
     * @param roomId The room ID
     * @param objectId The object ID
     * @param className The furniture className
     * @param category The object category
     *
     * @see AS3 RoomManager.createRoomObject() lines 335-356
     */
    private createVisualizationForFurniture(roomId: number, objectId: number, className: string, category: number): void 
    {
        const room = this.getRoomInstance(roomId);

        if(!room) 
        {
            log.warn(`[createVisualizationForFurniture] No room instance for roomId=${roomId} (className=${className})`);

            return;
        }

        const object = room.getObject(objectId, category);

        if(!object) 
        {
            log.warn(`[createVisualizationForFurniture] No room object for objectId=${objectId} category=${category} (className=${className})`);

            return;
        }

        // Get visualization type from content loader.
        const vizType = this._contentLoader.getVisualizationType(className);

        if(!vizType) 
        {
            log.warn(`[createVisualizationForFurniture] getVisualizationType() returned null for className=${className}`);

            return;
        }

        // Create visualization instance from visualization factory
        const visualization = this._visualizationFactory.createRoomObjectVisualization(vizType);

        if(!visualization) 
        {
            log.warn(`[createVisualizationForFurniture] Factory returned null for vizType=${vizType}`);
            return;
        }

        const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

        // Set asset collection from content loader
        const assetCollection = this._contentLoader.getGraphicAssetCollection(className);

        if(assetCollection) 
        {
            spriteVisualization.assetCollection = assetCollection;
        }
        else 
        {
            log.warn(`[createVisualizationForFurniture] getGraphicAssetCollection() returned null for className=${className} - object will render without graphics`);
        }

        // Get or create visualization data via the visualization factory (cached)
        const rawVizData = this._contentLoader.getVisualizationXML(className);

        if(rawVizData) 
        {
            const vizData = this._visualizationFactory.getRoomObjectVisualizationData(className, vizType, rawVizData);

            if(vizData) 
            {
                spriteVisualization.initialize(vizData);
            }
            else 
            {
                log.warn(`[createVisualizationForFurniture] getRoomObjectVisualizationData() returned null for className=${className} vizType=${vizType} - visualization not initialized`);
            }
        }
        else 
        {
            log.warn(`[createVisualizationForFurniture] getVisualizationXML() returned null for className=${className} - visualization not initialized`);
        }

        // Assign the room object
        spriteVisualization.object = object;
        (object as IRoomObjectController).setVisualization(visualization);
        room.getRenderer()?.feedRoomObject(object);
    }
}
