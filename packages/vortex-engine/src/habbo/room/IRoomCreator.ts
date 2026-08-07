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
import type {LegacyWallGeometry} from './utils/LegacyWallGeometry';

export interface IRoomCreator
{
    /**
	 * Dispose a room instance.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::disposeRoom()
    disposeRoom(roomId: number): void;

    /**
	 * Set the world type for a room.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::setWorldType()
    setWorldType(roomId: number, worldType: string): void;

    /**
	 * Initialize a room with configuration data.
	 * Door parameters are passed when a door is detected from the height map.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::initializeRoom()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::addObjectFurniture()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::addObjectFurnitureByName()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectFurniture()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectFurnitureLocation()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::disposeObjectFurniture()
    disposeObjectFurniture(
        roomId: number,
        id: number,
        pickerId?: number,
        refresh?: boolean
    ): boolean;

    /**
	 * The room's legacy wall geometry — the height map wall items are positioned against.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::getLegacyGeometry()
    getLegacyGeometry(roomId: number): LegacyWallGeometry | null;

    /**
	 * Add wall item to a room.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::addObjectWallItem()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectWallItem()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::disposeObjectWallItem()
    disposeObjectWallItem(
        roomId: number,
        id: number,
        pickerId?: number
    ): boolean;

    /**
	 * Add user/avatar to a room.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::addObjectUser()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUser()
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
	 * Flag the room as being in game mode, emitting REE_GAME_MODE / REE_NORMAL_MODE.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::setIsPlayingGame()
    setIsPlayingGame(roomId: number, isPlaying: boolean): void;

    /**
	 * Leave spectator mode on the active room.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::leaveSpectate()
    leaveSpectate(): void;

    /**
	 * Block/unblock handitem control for the room.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::setHanditemControlBlocked()
    setHanditemControlBlocked(roomId: number, blocked: boolean): void;

    /**
	 * Disable the furni chooser for the room.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::setChooserDisabled()
    setChooserDisabled(roomId: number, disabled: boolean): void;

    /**
	 * Toggle free (grid-less) furni movement for the room.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::setFreeFurniMovementsMode()
    setFreeFurniMovementsMode(roomId: number, enabled: boolean): void;

    /**
	 * Toggle the invisible-furni room mode.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::setInvisibleFurni()
    setInvisibleFurni(roomId: number, invisible: boolean): void;

    /**
	 * Set the room's background colour / light level (the disco special event).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectRoomColor()
    updateObjectRoomColor(
        roomId: number,
        color: number,
        light: number,
        backgroundOnly: boolean
    ): boolean;

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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUserFigure()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUserPosture()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUserAction()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectUserEffect()
    updateObjectUserEffect(
        roomId: number,
        roomIndex: number,
        effectId: number,
        delayMilliSeconds: number
    ): boolean;

    /**
	 * Dispose user.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::disposeObjectUser()
    disposeObjectUser(
        roomId: number,
        roomIndex: number
    ): boolean;

    /**
	 * Set the own user ID for a room.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::setOwnUserId()
    setOwnUserId(roomId: number, roomIndex: number): void;

    /**
	 * Set a furniture type alias.
	 * Maps a furniture type name to an alias name.
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::setRoomObjectAlias()
    setRoomObjectAlias(name: string, alias: string): void;

    /**
	 * Store the furniture stacking height map for a room.
	 * Based on AS3: RoomEngine.setFurniStackingHeightMap()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::setFurniStackingHeightMap()
    setFurniStackingHeightMap(roomId: number, map: FurniStackingHeightMap): void;

    /**
	 * Get the furniture stacking height map for a room.
	 * Based on AS3: RoomEngine.getFurniStackingHeightMap()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::getFurniStackingHeightMap()
    getFurniStackingHeightMap(roomId: number): FurniStackingHeightMap | null;

    /**
	 * Rebuild the tile->floor-object spatial index for a room from scratch.
	 * Based on AS3: RoomEngine.refreshTileObjectMap()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::refreshTileObjectMap()
    refreshTileObjectMap(roomId: number, reason: string): void;

    /**
	 * Get the tile->floor-object spatial index for a room.
	 * Based on AS3: RoomEngine.getTileObjectMap()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_89.as::getTileObjectMap()
    getTileObjectMap(roomId: number): TileObjectMap | null;

    /**
	 * Update the room's floor/wall/landscape texture type(s).
	 * Based on AS3: RoomEngine.updateObjectRoom()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectRoom()
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
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectRoomVisibilities()
    updateObjectRoomVisibilities(roomId: number, wallsVisible: boolean, floorVisible?: boolean): boolean;

    /**
	 * Update the room's wall/floor plane thickness multipliers.
	 * Based on AS3: RoomEngine.updateObjectRoomPlaneThicknesses()
	 */
    // AS3: .../src/com/sulake/habbo/room/_SafeCls_86.as::updateObjectRoomPlaneThicknesses()
    updateObjectRoomPlaneThicknesses(roomId: number, wallThicknessMultiplier: number, floorThicknessMultiplier: number): boolean;
}
