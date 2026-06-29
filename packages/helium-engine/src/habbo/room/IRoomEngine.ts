/**
 * IRoomEngine Interface
 *
 * Based on AS3: com.sulake.habbo.room.IRoomEngine
 *
 * Main interface for the Habbo room engine.
 */
import type {Container} from 'pixi.js';
import type {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IVector3d} from '@room/utils/IVector3d';

export interface IRoomEngine extends IDisposable
{
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
	 * Whether the room is currently in game mode.
	 */
	readonly isGameMode: boolean;
}
