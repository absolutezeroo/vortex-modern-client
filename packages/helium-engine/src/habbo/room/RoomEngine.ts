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
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from './IRoomEngine';
import type {IRoomCreator} from './IRoomCreator';
import type {IRoomEngineServices} from './IRoomEngineServices';
import type {IRoomContentListener} from './IRoomContentListener';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomManager} from '@room/IRoomManager';
import type {IRoomManagerListener} from '@room/IRoomManagerListener';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import type {IRoomRenderer} from '@room/renderer/IRoomRenderer';
import type {IRoomRendererFactory} from '@room/renderer/IRoomRendererFactory';
import type {IRoomRenderingCanvasMouseListener} from '@room/renderer/IRoomRenderingCanvasMouseListener';
import type {RoomSpriteMouseEvent} from '@room/events/RoomSpriteMouseEvent';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {IID_RoomManager} from '@iid/IIDRoomManager';
import {IID_RoomRendererFactory} from '@iid/IIDRoomRendererFactory';
import {RoomObjectCategoryEnum} from './object/RoomObjectCategoryEnum';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {RoomObjectUserTypes} from './object/RoomObjectUserTypes';
import {RoomObjectVariableEnum} from './object/RoomObjectVariableEnum';
import {RoomEngineEvent} from './events/RoomEngineEvent';
import {RoomEngineObjectEvent} from './events/RoomEngineObjectEvent';
import {RoomEngineDragWithMouseEvent} from './events/RoomEngineDragWithMouseEvent';
import {RoomObjectFactory} from './RoomObjectFactory';
import {RoomVariableEnum} from './RoomVariableEnum';
import {RoomObjectVisualizationFactory} from './object/RoomObjectVisualizationFactory';
import type {IRoomObjectVisualizationFactory} from '@room/object/IRoomObjectVisualizationFactory';
import {RoomRenderingCanvas} from './renderer/RoomRenderingCanvas';
import type {IStuffData} from './object/data/IStuffData';
import type {IGetImageListener} from './IGetImageListener';
import {ImageResult} from './ImageResult';

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
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import {Logger} from "@core";
import {RoomVisualizationData} from './object/visualization/room/RoomVisualizationData';
import type {IAssetRoomVisualizationData} from './object/visualization/room/rasterizer/basic/PlaneRasterizerTypes';
import type {NitroAsset} from '@core/assets/NitroAsset';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {EventEmitter} from 'eventemitter3';
import {RoomContentLoader} from './RoomContentLoader';
import {RoomContentLoadedEvent} from '@room/events/RoomContentLoadedEvent';
import {RoomObjectTileCursorUpdateMessage} from './messages/RoomObjectTileCursorUpdateMessage';
import {MoveAvatarMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/MoveAvatarMessageComposer';
import {PlaceObjectMessageComposer} from '@habbo/communication/messages/outgoing/room/engine/PlaceObjectMessageComposer';
import {RoomEngineObjectPlacedEvent} from './events/RoomEngineObjectPlacedEvent';
import {RoomObjectRoomMaskUpdateMessage} from './messages/RoomObjectRoomMaskUpdateMessage';
import {RoomObjectRoomUpdateMessage} from './messages/RoomObjectRoomUpdateMessage';
import {RoomObjectTileMouseEvent} from './events/RoomObjectTileMouseEvent';
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

interface RoomEngineRoomInstanceData
{
	roomCamera: RoomCamera;
}

export interface RoomEngineRectangle
{
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
	private _contentLoader: RoomContentLoader;
	private _contentLoaderEvents: EventEmitter = new EventEmitter();
	private _roomInstanceData: Map<number, RoomEngineRoomInstanceData>;
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

	constructor(context: IContext, assetLibrary: IAssetLibrary | null = null)
	{
		super(context, 0, assetLibrary);
		this._roomObjectFactory = new RoomObjectFactory();
		this._visualizationFactory = new RoomObjectVisualizationFactory();
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

	private _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	private _isDecorateMode: boolean = false;

	get isDecorateMode(): boolean
	{
		return this._isDecorateMode;
	}

	private _isGameMode: boolean = false;
	private _roomRendererFactory: IRoomRendererFactory | null = null;

	get isGameMode(): boolean
	{
		return this._isGameMode;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_RoomManager,
				(manager: IRoomManager | null) =>
				{
					this._roomManager = manager;

					if (manager && 'setObjectFactory' in manager)
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
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(config: IHabboConfigurationManager | null) =>
				{
					this._configurationManager = config;

					// AS3: configuration availability initializes RoomContentLoader; content URLs are resolved there.
					if (config)
					{
						this._roomDraggingAlwaysCenters = config.getBoolean('room.dragging.always_center');

						for(const data of this._roomInstanceData.values())
						{
							data.roomCamera.activateFollowing(this.cameraFollowDuration);
						}

						this.initializeContentLoader();
					}
				},
				false // Optional - room can render with flat colors without textures
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
		];
	}

	getRoom(roomId: number): IRoomInstance | null
	{
		return this.getRoomInstance(roomId);
	}

	getRoomObjectCategory(type: string): number
	{
		switch (type)
		{
			case 'room':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM;
			case 'tile_cursor':
			case 'selection_arrow':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR;
			case 'user':
			case 'bot':
			case 'rentable_bot':
			case 'pet':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_USER;
			case 'wall':
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
			default:
				return RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
		}
	}

	getRoomObjectWithIndex(roomId: number, index: number, category: number): IRoomObject | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObjectWithIndex(index, category);
	}

	getRoomObjectCount(roomId: number, category: number): number
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return 0;
		}

		return room.getObjectCount(category);
	}

	getTileCursor(roomId: number): IRoomObjectController | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObject(OBJECT_ID_TILE_CURSOR, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR) as IRoomObjectController | null;
	}

	getSelectionArrow(roomId: number): IRoomObjectController | null
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return null;
		}

		return room.getObject(OBJECT_ID_SELECTION_ARROW, RoomObjectCategoryEnum.OBJECT_CATEGORY_CURSOR) as IRoomObjectController | null;
	}

	getIsPlayingGame(roomId: number): boolean
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

	roomManagerInitialized(success: boolean): void
	{
		if (success)
		{
			this.events.emit(RoomEngineEvent.REE_ENGINE_INITIALIZED);
		}
	}

	contentLoaded(type: string, success: boolean): void
	{
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

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::iconLoaded()
	iconLoaded(typeId: number, type: string, success: boolean): void
	{
		this.events.emit('iconLoaded', typeId, type, success);

		const listeners = this._pendingThumbnailListeners.get(type);

		if(!listeners) return;

		this._pendingThumbnailListeners.delete(type);

		const asset = success ? this.assets?.getAssetByName(type) ?? null : null;
		const texture = (asset?.content as Texture | undefined) ?? null;

		this.deliverIconTexture(typeId, texture, listeners);
	}

	// TS-only: converts a loaded PixiJS Texture to an ImageBitmap (matching
	// IBitmapWrapperWindow.bitmap) and delivers it to each waiting listener.
	// See ImageResult.ts for why this is always asynchronous, unlike AS3.
	private deliverIconTexture(id: number, texture: Texture | null, listeners: IGetImageListener[]): void
	{
		if(texture === null)
		{
			for(const listener of listeners) listener.imageFailed(id);

			return;
		}

		const canvas = this.pixiTextureToCanvas(texture);

		if(canvas === null)
		{
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
			.catch(() =>
			{
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

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureType()
	getFurnitureType(type: number): string | null
	{
		return this._contentLoader?.getActiveObjectType(type) ?? null;
	}

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getWallItemType()
	getWallItemType(type: number, param: string | null = null): string | null
	{
		return this._contentLoader?.getWallItemType(type, param) ?? null;
	}

	private _pendingPlacement: {itemId: number; category: number} | null = null;
	private _moverIconSprite: Sprite | null = null;
	private _moverIconCanvas: RoomRenderingCanvas | null = null;

	// AS3: sources/win63_version/habbo/room/class_34.as::initializeRoomObjectInsert()
	// TODO(AS3): only floor-item placement (category 10) is implemented; wall
	// items (category 20) need the wallLocation string format (see
	// PlaceObjectMessageComposer's TODO) and are not supported yet.
	initializeRoomObjectInsert(
		_source: string,
		itemId: number,
		category: number,
		type: number,
		extra: string,
		stuffData: unknown = null
	): boolean
	{
		if (category !== RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
		{
			log.warn('[RoomEngine] Wall item placement is not implemented yet');

			return false;
		}

		this._pendingPlacement = {itemId, category};
		this.setObjectMoverIconSprite(type, extra, stuffData);

		return true;
	}

	// AS3: sources/win63_version/habbo/room/class_34.as::cancelRoomObjectInsert()
	cancelRoomObjectInsert(): void
	{
		this._pendingPlacement = null;
		this.removeObjectMoverIconSprite();
	}

	// AS3: sources/win63_version/habbo/room/class_34.as::setObjectMoverIconSprite()
	// TS simplification: reuses the same cached furniture-icon lookup as the
	// inventory grid thumbnails (getFurnitureIcon), instead of AS3's full
	// temporary-room-object render (getGenericRoomObjectImage) — same visual
	// result (the item's icon) without spinning up a real room object.
	private setObjectMoverIconSprite(type: number, extra: string, stuffData: unknown): void
	{
		this.removeObjectMoverIconSprite();

		// getFurnitureIcon() always resolves asynchronously via imageReady()
		// (see ImageResult.ts) — result.data is never populated synchronously.
		this.getFurnitureIcon(type, {
			imageReady: (_id: number, data: ImageBitmap | null) =>
			{
				if (data === null || this._pendingPlacement === null) return;

				this._moverIconSprite = new Sprite(Texture.from(data));
				this._moverIconSprite.anchor.set(0.5);
				this._moverIconSprite.eventMode = 'none';

				if (this._moverIconCanvas)
				{
					this._moverIconCanvas.container.addChild(this._moverIconSprite);
				}
			},
			imageFailed: () => {},
		}, extra, stuffData);
	}

	// AS3: sources/win63_version/habbo/room/class_34.as::removeObjectMoverIconSprite()
	private removeObjectMoverIconSprite(): void
	{
		if (this._moverIconSprite)
		{
			this._moverIconSprite.removeFromParent();
			this._moverIconSprite.destroy();
			this._moverIconSprite = null;
		}

		this._moverIconCanvas = null;
	}

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureIcon()
	// `stuffData` typed `unknown` because it's currently unused by
	// getGenericRoomObjectThumbnail() (Phase 1), and callers may hold either
	// of this codebase's two separate IStuffData interfaces (inventory vs room).
	getFurnitureIcon(type: number, listener: IGetImageListener, param: string | null = null, stuffData: unknown = null): ImageResult
	{
		const activeType = this._contentLoader?.getActiveObjectType(type) ?? null;
		const colorIndex = this._contentLoader ? String(this._contentLoader.getActiveObjectColorIndex(type)) : '';

		return this.getGenericRoomObjectThumbnail(activeType, colorIndex, listener, param, stuffData);
	}

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getWallItemIcon()
	getWallItemIcon(type: number, listener: IGetImageListener, param: string | null = null): ImageResult
	{
		const wallType = this._contentLoader?.getWallItemType(type, param) ?? null;
		const colorIndex = this._contentLoader ? String(this._contentLoader.getWallItemColorIndex(type)) : '';

		return this.getGenericRoomObjectThumbnail(wallType, colorIndex, listener, param, null);
	}

	private _pendingThumbnailListeners: Map<string, IGetImageListener[]> = new Map();
	private _thumbnailIdCounter: number = 0;

	// AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::_Str_22095() (getGenericRoomObjectThumbnail)
	// TS simplification: uses a simple incrementing id counter instead of AS3's
	// reserve/free NumberIdGenerator pool (no functional difference for callers,
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

		if(!this.assets || type === null) return result;

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
			const texture = (asset?.content as Texture | undefined) ?? null;

			this.deliverIconTexture(id, texture, [listener]);
		}

		return result;
	}

	createRoomInstance(roomId: number): IRoomInstance | null
	{
		if (!this._roomManager)
		{
			log.warn('RoomManager not available');
			return null;
		}

		const roomIdStr = this.getRoomIdentifier(roomId);

		// Check if room already exists
		let room = this._roomManager.getRoom(roomIdStr);

		if (room)
		{
			this.getRoomInstanceData(roomId);

			return room;
		}

		// Create via RoomManager
		room = this._roomManager.createRoom(roomIdStr, null);

		if (!room)
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
		if (!this._roomManager)
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
			this._roomInstanceData.delete(roomId);
		}

		// Dispose rendering canvas
		this.disposeRenderingCanvas(roomId);

		this.events.emit(RoomEngineEvent.REE_DISPOSED, new RoomEngineEvent(RoomEngineEvent.REE_DISPOSED, roomId));
	}

	getRoomInstance(roomId: number): IRoomInstance | null
	{
		if (!this._roomManager)
		{
			return null;
		}

		const roomIdStr = this.getRoomIdentifier(roomId);

		return this._roomManager.getRoom(roomIdStr);
	}

	setActiveRoom(roomId: number): void
	{
		this._activeRoomId = roomId;
	}

	getActiveRoomId(): number
	{
		return this._activeRoomId;
	}

	// AS3: sources/win63_version/habbo/room/class_34.as::getRoomInstanceData()
	private getRoomInstanceData(roomId: number): RoomEngineRoomInstanceData
	{
		let data = this._roomInstanceData.get(roomId);

		if(data === undefined)
		{
			data = {
				roomCamera: new RoomCamera()
			};

			data.roomCamera.activateFollowing(this.cameraFollowDuration);
			this._roomInstanceData.set(roomId, data);
		}

		return data;
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

	addRoomObjectUser(
		roomId: number,
		id: number,
		location: IVector3d,
		direction: IVector3d,
		type: string
	): boolean
	{
		const room = this.getRoomInstance(roomId);
		if (!room)
		{
			return false;
		}

		// Determine logic type based on user type
		let logicType: string = RoomObjectLogicEnum.USER;

		if (type === RoomObjectUserTypes.BOT)
		{
			logicType = RoomObjectLogicEnum.BOT;
		}
		else if (type === RoomObjectUserTypes.RENTABLE_BOT)
		{
			logicType = RoomObjectLogicEnum.RENTABLE_BOT;
		}
		else if (type === RoomObjectUserTypes.PET)
		{
			logicType = RoomObjectLogicEnum.PET;
		}

		// Create object via RoomManager (room.createRoomObject delegates to container)
		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (!object)
		{
			return false;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER)
		);

		return true;
	}

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
		synchronize = true
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		// Resolve className from typeId using SessionDataManager
		const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		// Get logic type from content loader if available, otherwise default
		let logicType = this._contentLoader.getLogicType(className) ?? RoomObjectLogicEnum.FURNITURE_MULTISTATE;

		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		if (!object)
		{
			return false;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);

			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}

			if (extra)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_EXTRAS, extra);
			}
		}

		// Trigger furniture asset loading
		this.loadFurnitureContent(roomId, id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
		);

		return true;
	}

	addRoomObjectWallItem(
		roomId: number,
		id: number,
		typeId: number,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		extra: string | null,
		ownerId: number,
		ownerName: string | null
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		// Resolve className from typeId using SessionDataManager
		const className = this.getFurnitureClassName(typeId, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

		// Get logic type from content loader if available, otherwise default
		let logicType = this._contentLoader.getLogicType(className) ?? RoomObjectLogicEnum.FURNITURE_BASIC;

		const object = room.createRoomObject(id, logicType, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);

		if (!object)
		{
			return false;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID, typeId);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
			model.setNumber(RoomObjectVariableEnum.FURNITURE_OWNER_ID, ownerId);

			if (ownerName)
			{
				model.setString(RoomObjectVariableEnum.FURNITURE_OWNER_NAME, ownerName);
			}

			if (extra)
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

		if (!room)
		{
			return null;
		}

		return room.getObject(objectId, category);
	}

	disposeRoomObject(roomId: number, objectId: number, category: number): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const success = room.disposeObject(objectId, category);

		if (success)
		{
			this.events.emit(
				RoomEngineObjectEvent.REOE_OBJECT_REMOVED,
				new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_REMOVED, roomId, objectId, category)
			);
		}

		return success;
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
		skipPositionUpdate: boolean = false
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;
		const handler = object?.getEventHandler() ?? null;
		const model = object?.getModel() ?? null;

		if (!object || handler === null || model === null)
		{
			return false;
		}

		const resolvedLocation = location ?? object.getLocation();
		const resolvedDirection = direction ?? object.getDirection();
		let resolvedHeadDirection = headDirection;

		if (Number.isNaN(resolvedHeadDirection))
		{
			const modelHeadDirection = model.getNumber(RoomObjectVariableEnum.HEAD_DIRECTION);

			resolvedHeadDirection = Number.isNaN(modelHeadDirection) ? 0 : modelHeadDirection;
		}

		let resolvedBaseY = baseY;
		const roomZScale = room.getNumber('room_z_scale');

		if (!Number.isNaN(roomZScale) && roomZScale !== 0)
		{
			resolvedBaseY = resolvedBaseY / roomZScale;
		}

		let avatarLocation = resolvedLocation;

		if (resolvedLocation !== null && resolvedBaseY !== 0)
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
			skipPositionUpdate
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
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

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectAvatarSignUpdateMessage(signType);

		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.getObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER) as IRoomObjectController;

		if (!object || !object.getEventHandler())
		{
			return false;
		}

		this.setRoomOwnObjectId(roomId, objectId);

		const message = new RoomObjectAvatarOwnMessage();

		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	update(time: number): void
	{
		// Delegate update to RoomManager
		if (this._roomManager)
		{
			this._roomManager.update(time);
		}

		// Update visualizations for active room
		if (this._activeRoomId >= 0)
		{
			this.updateRoomVisualizations(this._activeRoomId, time);
		}
	}

	private _ticker: Ticker | null = null;
	private _canvasSyncCallbacks: Set<() => void> = new Set();

	// TS-only: RoomEngine.update(time) is not actually driven by a running
	// loop in this port (nothing calls it from helium-client) — the visible
	// room rendering instead rides the shared PixiJS Application ticker set
	// here, which does run continuously. Used to keep window-hosted room
	// canvases (e.g. RoomPreviewerWidget) that createRoomCanvas() parents onto
	// the root stage — not the window tree — synced to their host window's
	// screen position/visibility every frame, matching how AS3's RoomPreviewer
	// relies on a continuous per-frame tick (registerUpdateReceiver) rather
	// than reacting to specific window events.
	setTicker(ticker: Ticker): void
	{
		this._ticker?.remove(this.onTickerUpdate);
		this._ticker = ticker;
		this._ticker.add(this.onTickerUpdate);
	}

	private onTickerUpdate = (): void =>
	{
		for (const callback of this._canvasSyncCallbacks)
		{
			callback();
		}
	};

	registerCanvasSyncCallback(callback: () => void): void
	{
		this._canvasSyncCallbacks.add(callback);
	}

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

		if (!room)
		{
			return;
		}

		const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

		if (roomObject)
		{
			const model = roomObject.getModelController();

			if (model)
			{
				model.setString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE, floorType, true);
				model.setString(RoomObjectVariableEnum.ROOM_WALL_TYPE, wallType, true);
				model.setString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE, landscapeType, true);
				model.setNumber(RoomObjectVariableEnum.ROOM_WORLD_TYPE, worldType, true);
			}
		}

		this.events.emit(RoomEngineEvent.REE_INITIALIZED, new RoomEngineEvent(RoomEngineEvent.REE_INITIALIZED, roomId));
	}

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

	setWorldType(roomId: number, worldType: string): void
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return;
		}

		const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

		if (roomObject)
		{
			const model = roomObject.getModelController();

			if (model)
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
			log.debug(`[RoomEngine] Room ${roomId} already initialized, skipping`);

			return;
		}

		// Create room instance if it doesn't exist
		let room = this.getRoomInstance(roomId);

		if (!room)
		{
			room = this.createRoomInstance(roomId);
		}

		if (!room)
		{
			return;
		}

		// If we have plane data, store it for rendering
		if (planeParser !== null)
		{
			log.debug(`[RoomEngine] Initializing room ${roomId} with ${planeParser.planeCount} planes`);

			const roomObject = room.getObject(OBJECT_ID_ROOM, RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM) as IRoomObjectController;

			if (roomObject)
			{
				const model = roomObject.getModelController();

				if (model)
				{
					// Store the RoomPlaneParser reference in the model
					// (equivalent of AS3 model.setString("room_plane_xml", xml))
					model.setObject(RoomObjectVariableEnum.ROOM_PLANE_PARSER, planeParser);

					// AS3: RoomLogic.initialize(xml) → _planeParser.initializeFromXML(xml)
					const eventHandler = roomObject.getEventHandler();

					if (eventHandler !== null)
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
					if (eventHandler !== null)
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
					if (doorX !== undefined && doorDir !== undefined)
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

						if (eventHandler !== null)
						{
							eventHandler.processUpdateMessage(doorMaskMessage);
						}

						// AS3: door position on model uses -0.5 offset in door direction
						if (doorDir === 90)
						{
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX - 0.5, true);
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY!, true);
						}

						if (doorDir === 180)
						{
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_X, doorX, true);
							model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Y, doorY! - 0.5, true);
						}

						model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_Z, doorZ!, true);
						model.setNumber(RoomObjectVariableEnum.ROOM_DOOR_DIR, doorDir, true);

						// Set displacement on room geometry for door depth sorting
						// AS3: displacement position uses -0.5 offset in door direction
						const canvas = this.getExistingRenderingCanvas(roomId);

						if (canvas?.geometry)
						{
							const displacementPos = new Vector3d(
								doorDir === 90 ? doorX - 0.5 : doorX,
								doorDir === 180 ? doorY! - 0.5 : doorY!,
								doorZ!
							);

							let displacement: IVector3d | null = null;

							if (doorDir === 90) displacement = new Vector3d(-2000, 0, 0);
							if (doorDir === 180) displacement = new Vector3d(0, -2000, 0);

							if (displacement)
							{
								canvas.geometry.setDisplacement(displacementPos, displacement);
							}
						}
					}
				}
			}

			// Create room visualization
			const roomVisualization = this.createVisualizationForObject(roomId, OBJECT_ID_ROOM, OBJECT_TYPE_ROOM);

			if (roomVisualization)
			{
				log.debug(`[RoomEngine] Created room visualization for room ${roomId}`);
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
		refresh: boolean,
		sizeZ: number
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
			synchronized
		);
	}

	addObjectFurnitureByName(
		roomId: number,
		id: number,
		className: string,
		location: IVector3d,
		direction: IVector3d,
		state: number,
		data: IStuffData | null,
		extra: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.createRoomObject(id, className, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

		if (!object)
		{
			return false;
		}

		(object as IRoomObjectController).setLocation(location);
		(object as IRoomObjectController).setDirection(direction);

		const model = (object as IRoomObjectController).getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		this.events.emit(
			RoomEngineObjectEvent.REOE_OBJECT_ADDED,
			new RoomEngineObjectEvent(RoomEngineObjectEvent.REOE_OBJECT_ADDED, roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE)
		);

		return true;
	}

	updateObjectFurniture(
		roomId: number,
		id: number,
		location: IVector3d | null,
		direction: IVector3d | null,
		state: number,
		data: IStuffData | null,
		extra?: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;

		if (!object)
		{
			return false;
		}

		if (location)
		{
			(object as IRoomObjectController).setLocation(location);
		}

		if (direction)
		{
			(object as IRoomObjectController).setDirection(direction);
		}

		const model = object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		return true;
	}

	updateObjectFurnitureLocation(
		roomId: number,
		id: number,
		location: IVector3d,
		direction: IVector3d | null,
		target: IVector3d | null,
		animationTime?: number
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE) as IRoomObjectController;

		if (!object || !object.getEventHandler())
		{
			return false;
		}

		const message = new RoomObjectMoveUpdateMessage(location, target, direction, animationTime ?? NaN, target !== null);

		object.getEventHandler()!.processUpdateMessage(message);

		return true;
	}

	disposeObjectFurniture(
		roomId: number,
		id: number,
		pickerId?: number,
		refresh?: boolean
	): boolean
	{
		return this.disposeRoomObject(roomId, id, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);
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
		data: string
	): boolean
	{
		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return false;
		}

		const object = room.getObject(id, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL) as IRoomObjectController;

		if (!object)
		{
			return false;
		}

		if (location)
		{
			(object as IRoomObjectController).setLocation(location);
		}

		if (direction)
		{
			(object as IRoomObjectController).setDirection(direction);
		}

		const model = object.getModelController();

		if (model)
		{
			model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA, state);
		}

		return true;
	}

	disposeObjectWallItem(
		roomId: number,
		id: number,
		pickerId?: number
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

		switch (userType)
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
		skipPositionUpdate?: boolean
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
			skipPositionUpdate ?? false
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

		if (roomInstance === null)
		{
			return false;
		}

		const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (roomObject === null)
		{
			return false;
		}

		const model = (roomObject as IRoomObjectController).getModelController();

		if (model === null)
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

		if (roomInstance === null)
		{
			return false;
		}

		const roomObject = roomInstance.getObject(roomIndex, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

		if (roomObject === null)
		{
			return false;
		}

		const model = (roomObject as IRoomObjectController).getModelController();

		if (model === null)
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
		this.setRoomObjectUserOwnUser(roomId, roomIndex);
	}

	addObjectUpdateCategory(category: number): void
	{
		if (this._roomManager)
		{
			this._roomManager.addObjectUpdateCategory(category);
		}
	}

	removeObjectUpdateCategory(category: number): void
	{
		if (this._roomManager)
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
	 * Keeps the AS3 boundary: room mouse input is routed by RoomDesktop window events.
	 */
	setCanvasElement(_canvas: HTMLCanvasElement): void
	{
	}

	/**
	 * Get or create a rendering canvas for a room
	 */
	private getExistingRenderingCanvas(roomId: number, canvasId: number = 1): RoomRenderingCanvas | null
	{
		const key = roomId * 1000 + canvasId;

		return this._renderingCanvases.get(key) ?? null;
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

		if (canvas)
		{
			// Remove resize handler if attached
			const resizeHandler = this._resizeHandlers.get(canvas);

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
				this._resizeHandlers.delete(canvas);
			}

			// Remove from PixiJS stage
			if (this._pixiStage && canvas.container.parent === this._pixiStage)
			{
				this._pixiStage.removeChild(canvas.container);
			}

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
			// Positioned/hidden here, BEFORE dispatching the event below —
			// handleMouseEvent() synchronously triggers handleTileMouseEvent()'s
			// ROE_MOUSE_MOVE when a floor tile is hit, which sets visible=true;
			// doing this after handleMouseEvent() would stomp that back to false.
			if(this._pendingPlacement && (type === 'mouseMove' || type === 'rollOver'))
			{
				this._moverIconCanvas = canvas;

				if(this._moverIconSprite)
				{
					this._moverIconSprite.x = x;
					this._moverIconSprite.y = y;
					this._moverIconSprite.visible = false;

					if(this._moverIconSprite.parent !== canvas.container)
					{
						canvas.container.addChild(this._moverIconSprite);
					}
				}
			}

			if(!this.handleRoomDragging(canvas, x, y, type, altKey, ctrlKey, shiftKey))
			{
				canvas.handleMouseEvent(x, y, type, altKey, ctrlKey, shiftKey, buttonDown);
			}

			this._roomDragLastX = x;
			this._roomDragLastY = y;
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
			if(!altKey && !ctrlKey && !shiftKey && !this._isDecorateMode)
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
	getRoomCanvasGeometry(roomId: number, canvasId: number = 1): import('@room/utils/IRoomGeometry').IRoomGeometry | null
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

		return { x: canvas.screenOffsetX, y: canvas.screenOffsetY };
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
		// Unregister from update loop
		this.removeUpdateReceiver(this);

		// Dispose all rendering canvases
		for (const [key, canvas] of this._renderingCanvases)
		{
			const resizeHandler = this._resizeHandlers.get(canvas);

			if (resizeHandler)
			{
				window.removeEventListener('resize', resizeHandler);
				this._resizeHandlers.delete(canvas);
			}

			if (this._pixiStage && canvas.container.parent === this._pixiStage)
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

		super.dispose();
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

	/**
	 * Process loaded room content bundle and create RoomVisualizationData.
	 */
	private onRoomContentReady(): void
	{
		const asset = this.findAssetByName('room') as NitroAsset | null;

		if (!asset) return;

		const jsonData = asset.jsonData;

		if (!jsonData) return;

		// Extract room visualization data from bundle JSON
		// The room.nitro bundle contains a "roomVisualization" key with floor/wall/landscape data
		const vizData = ((jsonData as Record<string, unknown>).roomVisualization ?? null) as IAssetRoomVisualizationData | null;

		if (!vizData)
		{
			log.warn('[RoomEngine] Room bundle has no roomVisualization data');
			return;
		}

		// Create RoomVisualizationData and initialize with JSON config
		this._roomVisualizationData = new RoomVisualizationData();
		this._roomVisualizationData.initialize(vizData);

		// Convert PixiJS textures to HTMLCanvasElement for the rasterizer system
		const canvasTextures = new Map<string, HTMLCanvasElement>();
		const textures: Map<string, Texture> = asset.textures;

		if (textures)
		{
			for (const [name, texture] of textures)
			{
				const canvas = this.pixiTextureToCanvas(texture);

				if (canvas !== null)
				{
					canvasTextures.set(name, canvas);
				}
			}
		}

		this._roomVisualizationData.initializeAssetCollection(canvasTextures);

		log.debug(`[RoomEngine] Room visualization data initialized with ${canvasTextures.size} textures`);
	}

	/**
	 * Convert a PixiJS Texture to an HTMLCanvasElement.
	 * Extracts the frame region from the spritesheet source image.
	 */
	private pixiTextureToCanvas(texture: Texture): HTMLCanvasElement | null
	{
		try
		{
			const frame = texture.frame;

			if (frame.width < 1 || frame.height < 1) return null;

			const canvas = document.createElement('canvas');

			canvas.width = frame.width;
			canvas.height = frame.height;

			const ctx = canvas.getContext('2d');

			if (!ctx) return null;

			const source = texture.source?.resource;

			if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)
			{
				ctx.drawImage(
					source,
					frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height
				);

				return canvas;
			}

			// ImageBitmap support
			if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap)
			{
				ctx.drawImage(
					source,
					frame.x, frame.y, frame.width, frame.height,
					0, 0, frame.width, frame.height
				);

				return canvas;
			}

			return null;
		}
		catch
		{
			return null;
		}
	}

	private fixedUserLocation(roomId: number, location: IVector3d | null): IVector3d | null
	{
		void roomId;

		if (location === null)
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
		if (event instanceof RoomObjectTileMouseEvent)
		{
			this.handleTileMouseEvent(event);
		}
		else if (event instanceof RoomObjectMouseEvent)
		{
			this.handleObjectMouseEvent(event);
		}

		// Forward object events
		if (event && typeof event === 'object' && 'type' in event)
		{
			this.events.emit('roomObjectEvent', event);
		}
	}

	/**
	 * Handle tile mouse events - update the tile cursor.
	 * Based on AS3 RoomObjectEventHandler.handleMouseOverTile()
	 */
	private handleTileMouseEvent(event: RoomObjectTileMouseEvent): void
	{
		if (this._activeRoomId < 0) return;

		const tileX = event.tileXAsInt;
		const tileY = event.tileYAsInt;
		const tileZ = event.tileZAsInt;

		if (event.type === RoomObjectMouseEvent.ROE_MOUSE_MOVE)
		{
			const tileCursor = this.getTileCursor(this._activeRoomId);

			if (tileCursor && tileCursor.getEventHandler())
			{
				const cursorUpdate = new RoomObjectTileCursorUpdateMessage(
					new Vector3d(tileX, tileY, tileZ),
					0,
					true,
					event.eventId
				);

				tileCursor.getEventHandler()!.processUpdateMessage(cursorUpdate);
			}

			if (this._pendingPlacement && this._moverIconSprite)
			{
				this._moverIconSprite.visible = true;
			}
		}
		else if (event.type === RoomObjectMouseEvent.ROE_MOUSE_CLICK)
		{
			if (this._pendingPlacement && this._connection)
			{
				const {itemId} = this._pendingPlacement;

				this._connection.send(new PlaceObjectMessageComposer(itemId, tileX, tileY, 0));
				this._pendingPlacement = null;
				this.removeObjectMoverIconSprite();

				// TS deviation: dispatched optimistically on click rather than
				// waiting for the server's room-object-added confirmation (AS3
				// fires this from the incoming message handler instead) — the
				// actual furniture only appears once the normal incoming message
				// flow adds it to the room; this only drives FurniModel's
				// "place next item from stack" follow-up UX.
				this.events.emit(
					'REOE_PLACED',
					new RoomEngineObjectPlacedEvent(
						'REOE_PLACED', this._activeRoomId, -itemId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
						'', tileX, tileY, tileZ, 0, true, true, false, null
					)
				);
			}
			else if (this._connection)
			{
				this._connection.send(new MoveAvatarMessageComposer(tileX, tileY));
			}
		}
	}

	/**
	 * Handle object mouse events - debug logging for furniture clicks.
	 */
	private handleObjectMouseEvent(event: RoomObjectMouseEvent): void
	{
		if (event.type !== RoomObjectMouseEvent.ROE_MOUSE_CLICK) return;

		const obj = event.object;

		if (!obj) return;

		const objType = obj.getType();
		const objId = obj.getId();

		// Skip room object itself
		if (objType === 'room' || objId < 0) return;

		const loc = obj.getLocation();

		log.info(`[CLICK] Object id=${objId} type="${objType}" pos=(${loc?.x?.toFixed(1)}, ${loc?.y?.toFixed(1)}, ${loc?.z?.toFixed(1)})`);
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

		if (visualization === null)
		{
			return null;
		}

		// Check if visualization is sprite-based
		const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

		const room = this.getRoomInstance(roomId);

		if (!room)
		{
			return null;
		}

		const object = room.getObject(objectId, this.getRoomObjectCategory(type));

		if (object)
		{
			spriteVisualization.object = object;
		}

		// Initialize room visualization with texture data (rasterizers)
		if (type === OBJECT_TYPE_ROOM && this._roomVisualizationData !== null)
		{
			spriteVisualization.initialize(this._roomVisualizationData);
		}

		if (object)
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
			!Number.isFinite(maxY) ||
			activeRoomBounds === null)
		{
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
		const centerScreen = geometry.getScreenPoint(new Vector3d(centerX, centerY, cameraZ));

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
		const targetScreen = geometry.getScreenPoint(target);

		if(targetScreen === null)
		{
			return;
		}

		targetScreen.x += canvas.screenOffsetX;
		targetScreen.y += canvas.screenOffsetY;

		if(camera.location === null)
		{
			geometry.adjustLocation(desiredLocation, 25);

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
	private getActiveRoomBoundingRectangle(canvasId: number): RoomEngineRectangle | null
	{
		return this.getRoomObjectBoundingRectangle(
			this._activeRoomId,
			OBJECT_ID_ROOM,
			RoomObjectCategoryEnum.OBJECT_CATEGORY_ROOM,
			canvasId
		);
	}

	// AS3: sources/win63_version/habbo/room/class_34.as::getRoomObjectBoundingRectangle()
	getRoomObjectBoundingRectangle(roomId: number, objectId: number, category: number, canvasId: number): RoomEngineRectangle | null
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
	 * Update visualizations for a room.
	 * Canvas.render() handles visualization updates and screen positioning.
	 * Based on AS3: RoomSpriteCanvas.render() calling visualization.update() internally.
	 */
	private updateRoomVisualizations(roomId: number, time: number): void
	{
		const room = this.getRoomInstance(roomId);
		const renderer = room?.getRenderer();

		if(renderer !== null && renderer !== undefined)
		{
			this.updateRoomCameras(time);
			renderer.update(time);
		}
	}

	/**
	 * Initialize the content loader and set up room manager.
	 *
	 * @see AS3 RoomEngine.onConfigurationComplete() lines 3554-3578
	 */
	private initializeContentLoader(): void
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

		if (className)
		{
			return className;
		}

		// Fallback to SessionDataManager
		if (this._sessionDataManager)
		{
			let furniData;

			if (category === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL)
			{
				furniData = this._sessionDataManager.getWallItemData(typeId);
			}
			else
			{
				furniData = this._sessionDataManager.getFloorItemData(typeId);
			}

			if (furniData)
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
		if (this._contentLoader.isLoaded(className))
		{
			// Already loaded - create visualization immediately
			this.createVisualizationForFurniture(roomId, objectId, className, category);
			return;
		}

		// Track this object as pending for when content loads
		let pending = this._pendingFurnitureViz.get(className);

		if (!pending)
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
	 */
	private onContentLoaded(type: string): void
	{
		if(type === OBJECT_TYPE_ROOM)
		{
			this.onRoomContentReady();
		}

		// Create visualizations for all pending objects of this type
		const pending = this._pendingFurnitureViz.get(type);

		if (pending)
		{
			for (const entry of pending)
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

		if (!room)
		{
			return;
		}

		const object = room.getObject(objectId, category);

		if (!object)
		{
			return;
		}

		// Get visualization type from content loader.
		const vizType = this._contentLoader.getVisualizationType(className);

		if(!vizType)
		{
			return;
		}

		// Create visualization instance from visualization factory
		const visualization = this._visualizationFactory.createRoomObjectVisualization(vizType);

		if (!visualization)
		{
			log.warn(`[createVisualizationForFurniture] Factory returned null for vizType=${vizType}`);
			return;
		}

		const spriteVisualization = visualization as IRoomObjectSpriteVisualization;

		// Set asset collection from content loader
		const assetCollection = this._contentLoader.getGraphicAssetCollection(className);

		if (assetCollection)
		{
			spriteVisualization.assetCollection = assetCollection;
		}

		// Get or create visualization data via the visualization factory (cached)
		const rawVizData = this._contentLoader.getVisualizationXML(className);

		if (rawVizData)
		{
			const vizData = this._visualizationFactory.getRoomObjectVisualizationData(className, vizType, rawVizData);

			if (vizData)
			{
				spriteVisualization.initialize(vizData);
			}
		}

		// Assign the room object
		spriteVisualization.object = object;
		(object as IRoomObjectController).setVisualization(visualization);
		room.getRenderer()?.feedRoomObject(object);
	}
}

