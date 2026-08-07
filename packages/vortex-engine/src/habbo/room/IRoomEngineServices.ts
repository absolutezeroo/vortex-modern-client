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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::get connection()
    readonly connection: IConnection | null;

    // Events
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::get events()
    readonly events: EventEmitter;

    // State flags
    readonly isDecorateMode: boolean;
    readonly isGameMode: boolean;

    // Room access
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getRoom()
    getRoom(roomId: number): IRoomInstance | null;

    // Object access
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getRoomObjectCategory()
    getRoomObjectCategory(type: string): number;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getRoomObject()
    getRoomObject(roomId: number, objectId: number, category: number): IRoomObject | null;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getRoomObjectWithIndex()
    getRoomObjectWithIndex(roomId: number, index: number, category: number): IRoomObject | null;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getRoomObjectCount()
    getRoomObjectCount(roomId: number, category: number): number;

    // Wall item plane masks
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/_SafeCls_87.as::updateObjectRoomWindow()
    updateObjectRoomWindow(roomId: number, id: number, visible?: boolean): void;

    // Tile cursor
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getTileCursor()
    getTileCursor(roomId: number): IRoomObjectController | null;

    // Selection arrow
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getSelectionArrow()
    getSelectionArrow(roomId: number): IRoomObjectController | null;

    // Game state
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getIsPlayingGame()
    getIsPlayingGame(roomId: number): boolean;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/IRoomEngineServices.as::getActiveRoomIsPlayingGame()
    getActiveRoomIsPlayingGame(): boolean;

    // Area selection
    isAreaSelectionMode(): boolean;

    // Movement
    isMoveBlocked(): boolean;

    isWhereYouClickWhereYouGo(): boolean;
}
