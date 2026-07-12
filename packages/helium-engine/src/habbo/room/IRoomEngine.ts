/**
 * IRoomEngine Interface
 *
 * Based on AS3: com.sulake.habbo.room.IRoomEngine
 *
 * Main interface for the Habbo room engine.
 */
import type {Container, Ticker} from 'pixi.js';
import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IGetImageListener} from './IGetImageListener';
import type {ImageResult} from './ImageResult';
import type {ISelectedRoomObjectData} from './ISelectedRoomObjectData';
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import type {IRoomEngineRectangle} from './RoomEngine';

export interface IRoomEngine extends IDisposable
{
    // AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureType()
    getFurnitureType(type: number): string | null;

    // AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getWallItemType()
    getWallItemType(type: number, param?: string | null): string | null;

    // AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getFurnitureIcon()
    getFurnitureIcon(type: number, listener: IGetImageListener, param?: string | null, stuffData?: unknown): ImageResult;

    // AS3: sources/flash_version/src/com/sulake/habbo/room/RoomEngine.as::getWallItemIcon()
    getWallItemIcon(type: number, listener: IGetImageListener, param?: string | null): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getFurnitureImage()
    getFurnitureImage(
        type: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor?: number,
        param?: string | null,
        state?: number,
        frameCount?: number,
        stuffData?: unknown,
        forceGeneric?: boolean
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getWallItemImage()
    getWallItemImage(
        type: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor?: number,
        param?: string | null,
        state?: number,
        frameCount?: number
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomImage()
    getRoomImage(
        floorType: string | null,
        wallType: string | null,
        landscapeType: string | null,
        scale: number,
        listener: IGetImageListener,
        extra?: string | null
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getPetImage()
    getPetImage(
        type: number,
        paletteId: number,
        color: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        fullImage?: boolean,
        backgroundColor?: number,
        customParts?: {layerId: number; partId: number; paletteId: number}[] | null,
        posture?: string | null
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getRoomObjectImage()
    getRoomObjectImage(
        roomId: number,
        objectId: number,
        category: number,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener,
        backgroundColor?: number
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::getGenericRoomObjectImage()
    getGenericRoomObjectImage(
        type: string | null,
        param: string,
        direction: IVector3d,
        scale: number,
        listener: IGetImageListener | null,
        backgroundColor?: number,
        extra?: string | null,
        stuffData?: unknown,
        state?: number,
        frameCount?: number,
        posture?: string | null,
        originalId?: number
    ): ImageResult;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_90.as::isRoomObjectContentAvailable()
    isRoomObjectContentAvailable(type: string): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::initializeRoomObjectInsert()
    initializeRoomObjectInsert(
        source: string,
        itemId: number,
        category: number,
        type: number,
        extra: string,
        stuffData?: unknown
    ): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::cancelRoomObjectInsert()
    cancelRoomObjectInsert(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::getSelectedObjectData()
    // TODO(AS3): the concrete RoomEngine.as (obfuscated class_34.as) implementation of this
    // covers full room-object selection (placement AND already-placed objects being moved/
    // inspected) and isn't ported - only initializeRoomObjectInsert()'s pending-placement state
    // is tracked here. This always returns null until that's ported, which callers (e.g.
    // CatalogObjectMover, RecyclerCatalogWidget) already null-check before use.
    getSelectedObjectData(roomId: number): ISelectedRoomObjectData | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::setObjectMoverIconSpriteVisible()
    setObjectMoverIconSpriteVisible(visible: boolean): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/IRoomEngine.as::getObjectMoverIconSpriteVisible()
    getObjectMoverIconSpriteVisible(): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::initializeRoom()
    initializeRoom(
        roomId: number,
        planeParser: RoomPlaneParser | null,
        doorX?: number,
        doorY?: number,
        doorZ?: number,
        doorDir?: number
    ): void;

    // AS3: sources/win63_version/habbo/room/class_34.as::disposeObjectFurniture()
    disposeObjectFurniture(roomId: number, id: number, pickerId?: number, refresh?: boolean): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::disposeObjectWallItem()
    disposeObjectWallItem(roomId: number, id: number, pickerId?: number): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::disposeObjectUser()
    disposeObjectUser(roomId: number, roomIndex: number): boolean;

    // TS-only: see RoomEngine.ts for why this exists.
    setTicker(ticker: Ticker): void;

    // TS-only: see RoomEngine.ts for why this exists.
    registerCanvasSyncCallback(callback: () => void): void;

    // TS-only: see RoomEngine.ts for why this exists.
    unregisterCanvasSyncCallback(callback: () => void): void;

    // Event emitter
    readonly events: EventEmitter;

    // Room lifecycle
    createRoomInstance(roomId: number): IRoomInstance | null;

    disposeRoomInstance(roomId: number): void;

    getRoomInstance(roomId: number): IRoomInstance | null;

    setActiveRoom(roomId: number): void;

    getActiveRoomId(): number;

    // Object management
    addRoomObjectUser(roomId: number, id: number, location: IVector3d, direction: IVector3d, type: string): boolean;

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
        synchronize?: boolean
    ): boolean;

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
    ): boolean;

    getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null;

    disposeRoomObject(roomId: number, objectId: number, category: number): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::modifyRoomObject()
    modifyRoomObject(objectId: number, category: number, action: string): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::useRoomObjectInActiveRoom()
    useRoomObjectInActiveRoom(objectId: number, category: number): boolean;

    // AS3: sources/win63_version/habbo/room/class_34.as::modifyRoomObjectDataWithMap()
    modifyRoomObjectDataWithMap(objectId: number, category: number, action: string, data: Map<string, string>): boolean;

    // User updates
    updateRoomObjectUser(
        roomId: number,
        objectId: number,
        location: IVector3d | null,
        targetLocation: IVector3d | null,
        direction: IVector3d | null,
        headDirection: number,
        canStandUp: boolean,
        baseY: number,
        animationTime?: number,
        skipPositionUpdate?: boolean
    ): boolean;

    updateRoomObjectUserFigure(
        roomId: number,
        objectId: number,
        figure: string,
        gender: string | null,
        clubLevel: string | null,
        isRiding: boolean
    ): boolean;

    updateRoomObjectUserPosture(roomId: number, objectId: number, posture: string, parameter: string): boolean;

    updateRoomObjectUserGesture(roomId: number, objectId: number, gesture: number): boolean;

    updateRoomObjectUserEffect(roomId: number, objectId: number, effect: number, delay?: number): boolean;

    updateRoomObjectUserChat(roomId: number, objectId: number, numberOfWords: number): boolean;

    updateRoomObjectUserTyping(roomId: number, objectId: number, isTyping: boolean): boolean;

    updateRoomObjectUserDance(roomId: number, objectId: number, danceStyle: number): boolean;

    updateRoomObjectUserSleep(roomId: number, objectId: number, isSleeping: boolean): boolean;

    updateRoomObjectUserCarryObject(roomId: number, objectId: number, itemType: number): boolean;

    updateRoomObjectUserSign(roomId: number, objectId: number, signType: number): boolean;

    setRoomObjectUserOwnUser(roomId: number, objectId: number): boolean;

    // Rendering
    update(time: number): void;

    initializeRoomVisuals(roomId: number, floorType: string, wallType: string, landscapeType: string, worldType: number): void;

    // Room data
    getRoomOwnObjectId(roomId: number): number;

    setRoomOwnObjectId(roomId: number, objectId: number): void;

    // Canvas management

    /**
	 * Creates a rendering canvas for a room.
	 *
	 * @returns The PixiJS Container for the canvas, or null on failure
	 */
    createRoomCanvas(roomId: number, canvasId: number, width: number, height: number, scale: number): Container | null;

    /**
	 * Modifies the dimensions of an existing room canvas.
	 */
    modifyRoomCanvas(roomId: number, canvasId: number, width: number, height: number): boolean;

    /**
	 * AS3: sources/win63_version/habbo/room/IRoomEngine.as::setRoomCanvasMask()
	 */
    setRoomCanvasMask(roomId: number, canvasId: number, useMask: boolean): void;

    /**
	 * Handles a mouse event on the room canvas.
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
    ): void;

    /**
	 * Gets the room geometry for a canvas.
	 */
    getRoomCanvasGeometry(roomId: number, canvasId?: number): IRoomGeometry | null;

    /**
	 * Gets the screen offset of a room canvas.
	 */
    getRoomCanvasScreenOffset(roomId: number, canvasId?: number): { x: number; y: number } | null;

    /**
	 * Sets the screen offset of a room canvas.
	 */
    setRoomCanvasScreenOffset(roomId: number, canvasId: number, point: { x: number; y: number }): boolean;

    /**
	 * Mounts an externally-owned display object directly onto the PixiJS
	 * stage, above every room rendering canvas already added.
	 *
	 * TS-only: no AS3 equivalent - see RoomEngine.ts's implementation for why.
	 */
    addStageChild(displayObject: Container): void;

    /**
	 * Removes a display object previously added via addStageChild().
	 */
    removeStageChild(displayObject: Container): void;

    // AS3: sources/win63_version/habbo/room/class_34.as::getRoomObjectBoundingRectangle()
    getRoomObjectBoundingRectangle(roomId: number, objectId: number, category: number, canvasId: number): IRoomEngineRectangle | null;

    /**
	 * Sets the scale of a room canvas, optionally centering on a point.
	 */
    setRoomCanvasScale(
        roomId: number,
        canvasId: number,
        scale: number,
        point?: { x: number; y: number } | null,
        offset?: { x: number; y: number } | null
    ): void;

    /**
	 * Gets the scale of a room canvas.
	 */
    getRoomCanvasScale(roomId: number, canvasId?: number): number;

    /**
	 * The currently active room ID.
	 */
    readonly activeRoomId: number;

    /**
	 * Whether the active room session has the local user in decorate (furni move) mode.
	 */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/IRoomEngine.as::get isDecorateMode()
    readonly isDecorateMode: boolean;

    /**
	 * Whether the room is currently in game mode.
	 */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/IRoomEngine.as::get isGameMode()
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/room/IRoomEngine.as::set isGameMode()
    isGameMode: boolean;
}
