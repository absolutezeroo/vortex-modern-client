/**
 * IRoomCreator
 *
 * Based on AS3: com.sulake.habbo.room.IRoomCreator
 *
 * Interface for room creation and object management.
 * Used by RoomMessageHandler to communicate with the room engine.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IStuffData} from './object/data/IStuffData';
import type {RoomPlaneParser} from './object/RoomPlaneParser';
import type {FurniStackingHeightMap} from './utils/FurniStackingHeightMap';
import type {TileObjectMap} from './utils/TileObjectMap';

export interface IRoomCreator
{
    /**
	 * Dispose a room instance.
	 */
    disposeRoom(roomId: number): void;

    /**
	 * Set the world type for a room.
	 */
    setWorldType(roomId: number, worldType: string): void;

    /**
	 * Initialize a room with configuration data.
	 * Door parameters are passed when a door is detected from the height map.
	 */
    initializeRoom(
        roomId: number,
        planeParser: RoomPlaneParser | null,
        doorX?: number,
        doorY?: number,
        doorZ?: number,
        doorDir?: number
    ): void;

    /**
	 * Add floor furniture to a room.
	 */
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
    ): boolean;

    /**
	 * Add floor furniture by class name (for static furniture).
	 */
    addObjectFurnitureByName(
        roomId: number,
        id: number,
        className: string,
        location: IVector3d,
        direction: IVector3d,
        state: number,
        data: IStuffData | null,
        extra: number
    ): boolean;

    /**
	 * Update floor furniture.
	 */
    updateObjectFurniture(
        roomId: number,
        id: number,
        location: IVector3d | null,
        direction: IVector3d | null,
        state: number,
        data: IStuffData | null,
        extra?: number
    ): boolean;

    /**
	 * Update floor furniture location for sliding.
	 */
    updateObjectFurnitureLocation(
        roomId: number,
        id: number,
        location: IVector3d,
        direction: IVector3d | null,
        target: IVector3d | null,
        animationTime?: number,
        overshootingDistance?: number,
        curveStrength?: number
    ): boolean;

    /**
	 * Dispose floor furniture.
	 */
    disposeObjectFurniture(
        roomId: number,
        id: number,
        pickerId?: number,
        refresh?: boolean
    ): boolean;

    /**
	 * Add wall item to a room.
	 */
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
    ): boolean;

    /**
	 * Update wall item.
	 */
    updateObjectWallItem(
        roomId: number,
        id: number,
        location: IVector3d | null,
        direction: IVector3d | null,
        state: number,
        data: string
    ): boolean;

    /**
	 * Update a wall item's state, carrying its raw item data string.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectWallItemState()
    updateObjectWallItemState(
        roomId: number,
        id: number,
        state: number,
        itemData: string
    ): boolean;

    /**
	 * Update a wall item's raw item data string only (e.g. stickie content).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectWallItemData()
    updateObjectWallItemData(
        roomId: number,
        id: number,
        itemData: string
    ): boolean;

    /**
	 * Toggle an area-hide furni's hidden floor zone.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateAreaHide()
    updateAreaHide(
        roomId: number,
        furniId: number,
        on: boolean,
        rootX: number,
        rootY: number,
        width: number,
        length: number,
        invert: boolean
    ): boolean;

    /**
	 * Dispose wall item.
	 */
    disposeObjectWallItem(
        roomId: number,
        id: number,
        pickerId?: number
    ): boolean;

    /**
	 * Add user/avatar to a room.
	 */
    addObjectUser(
        roomId: number,
        roomIndex: number,
        location: IVector3d,
        direction: IVector3d,
        headDirection: number,
        userType: number,
        figure: string
    ): boolean;

    /**
	 * Update user position/movement.
	 */
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
        jumpingPower?: number
    ): boolean;

    /**
	 * Turn a user on the spot (body + head direction, no move).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUserDir()
    updateObjectUserDir(
        roomId: number,
        roomIndex: number,
        direction: IVector3d,
        headDirection: number
    ): boolean;

    /**
	 * Update wall item location for sliding.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectWallItemLocation()
    updateObjectWallItemLocation(
        roomId: number,
        id: number,
        location: IVector3d,
        target?: IVector3d | null,
        animationTime?: number
    ): boolean;

    /**
	 * The room session manager, for handlers that need the room's user data.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_89.as::get roomSessionManager()
    readonly roomSessionManager: IRoomSessionManager | null;

    /**
	 * The session data manager, for handlers that need the logged-in user's own id.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_89.as::get sessionDataManager()
    readonly sessionDataManager: ISessionDataManager | null;

    /**
	 * The window manager, for handlers that must raise a confirm dialog.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_89.as::get windowManager()
    readonly windowManager: IHabboWindowManager | null;

    /**
	 * The room instance, for handlers that need to read an object's model directly.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_89.as::getRoom()
    getRoom(roomId: number): IRoomInstance | null;

    /**
	 * The room's canvas-1 geometry, used to snap wired move targets onto the screen grid.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_89.as::getRoomGeometry()
    getRoomGeometry(roomId: number): IRoomGeometry | null;

    /**
	 * Update user figure.
	 */
    updateObjectUserFigure(
        roomId: number,
        roomIndex: number,
        figure: string,
        sex: string,
        subType?: string,
        isRiding?: boolean
    ): boolean;

    /**
	 * Update user posture.
	 * Based on AS3: updateObjectUserPosture
	 */
    updateObjectUserPosture(
        roomId: number,
        roomIndex: number,
        posture: string,
        parameter: string
    ): boolean;

    /**
	 * Update user action (expression, dance, sleep, typing, carry, use object).
	 * Based on AS3: updateObjectUserAction
	 */
    updateObjectUserAction(
        roomId: number,
        roomIndex: number,
        action: string,
        value: number
    ): boolean;

    /**
	 * Update user effect.
	 * Based on AS3: updateObjectUserEffect
	 */
    updateObjectUserEffect(
        roomId: number,
        roomIndex: number,
        effectId: number,
        delayMilliSeconds: number
    ): boolean;

    /**
	 * Dispose user.
	 */
    disposeObjectUser(
        roomId: number,
        roomIndex: number
    ): boolean;

    /**
	 * Set the own user ID for a room.
	 */
    setOwnUserId(roomId: number, roomIndex: number): void;

    /**
	 * Set a furniture type alias.
	 * Maps a furniture type name to an alias name.
	 */
    setRoomObjectAlias(name: string, alias: string): void;

    /**
	 * Store the furniture stacking height map for a room.
	 * Based on AS3: RoomEngine.setFurniStackingHeightMap()
	 */
    setFurniStackingHeightMap(roomId: number, map: FurniStackingHeightMap): void;

    /**
	 * Get the furniture stacking height map for a room.
	 * Based on AS3: RoomEngine.getFurniStackingHeightMap()
	 */
    getFurniStackingHeightMap(roomId: number): FurniStackingHeightMap | null;

    /**
	 * Rebuild the tile->floor-object spatial index for a room from scratch.
	 * Based on AS3: RoomEngine.refreshTileObjectMap()
	 */
    refreshTileObjectMap(roomId: number, reason: string): void;

    /**
	 * Get the tile->floor-object spatial index for a room.
	 * Based on AS3: RoomEngine.getTileObjectMap()
	 */
    getTileObjectMap(roomId: number): TileObjectMap | null;

    /**
	 * Update the room's floor/wall/landscape texture type(s).
	 * Based on AS3: RoomEngine.updateObjectRoom()
	 */
    updateObjectRoom(
        roomId: number,
        floorType?: string | null,
        wallType?: string | null,
        landscapeType?: string | null,
        skipModelUpdate?: boolean
    ): boolean;

    /**
	 * Update the room's wall/floor plane visibility.
	 * Based on AS3: RoomEngine.updateObjectRoomVisibilities()
	 */
    updateObjectRoomVisibilities(roomId: number, wallsVisible: boolean, floorVisible?: boolean): boolean;

    /**
	 * Update the room's wall/floor plane thickness multipliers.
	 * Based on AS3: RoomEngine.updateObjectRoomPlaneThicknesses()
	 */
    updateObjectRoomPlaneThicknesses(roomId: number, wallThicknessMultiplier: number, floorThicknessMultiplier: number): boolean;
}
