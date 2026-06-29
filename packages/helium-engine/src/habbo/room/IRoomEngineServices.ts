/**
 * IRoomEngineServices
 *
 * Based on AS3: com.sulake.habbo.room.IRoomEngineServices
 *
 * Extended interface for room engine services used by other systems.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomInstance} from '@room/IRoomInstance';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IRoomObjectController} from '@room/object/IRoomObjectController';

export interface IRoomEngineServices
{
	// Connection
	readonly connection: IConnection | null;

	// Events
	readonly events: EventEmitter;

	// State flags
	readonly isDecorateMode: boolean;
	readonly isGameMode: boolean;

	// Room access
	getRoom(roomId: number): IRoomInstance | null;

	// Object access
	getRoomObjectCategory(type: string): number;

	getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null;

	getRoomObjectWithIndex(roomId: number, index: number, category: number): IRoomObject | null;

	getRoomObjectCount(roomId: number, category: number): number;

	// Tile cursor
	getTileCursor(roomId: number): IRoomObjectController | null;

	// Selection arrow
	getSelectionArrow(roomId: number): IRoomObjectController | null;

	// Game state
	getIsPlayingGame(roomId: number): boolean;

	getActiveRoomIsPlayingGame(): boolean;

	// Area selection
	isAreaSelectionMode(): boolean;

	// Movement
	isMoveBlocked(): boolean;

	isWhereYouClickWhereYouGo(): boolean;
}
