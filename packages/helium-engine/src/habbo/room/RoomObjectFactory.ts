/**
 * RoomObjectFactory
 *
 * Based on AS3: com.sulake.habbo.room.RoomObjectFactory
 *
 * Factory for creating room object logic instances and object managers.
 * Visualization creation is handled by RoomObjectVisualizationFactory.
 *
 * @see source_as_win63/room/IRoomObjectFactory.as
 */
import {EventEmitter} from 'eventemitter3';
import type {IRoomObjectFactory} from '@room/IRoomObjectFactory';
import type {IRoomObjectEventHandler} from '@room/object/logic/IRoomObjectEventHandler';
import type {IRoomObjectManager} from '@room/IRoomObjectManager';
import {RoomObjectManager} from '@room/RoomObjectManager';
import {RoomObjectLogicEnum} from './object/RoomObjectLogicEnum';
import {AvatarLogic} from './object/logic/AvatarLogic';
import {PetLogic} from './object/logic/PetLogic';

// Furniture Logic
import {FurnitureLogic} from './object/logic/furniture/FurnitureLogic';
import {FurnitureMultiStateLogic} from './object/logic/furniture/FurnitureMultiStateLogic';
import {FurnitureMultiHeightLogic} from './object/logic/furniture/FurnitureMultiHeightLogic';
import {FurniturePlaceholderLogic} from './object/logic/furniture/FurniturePlaceholderLogic';
import {FurnitureDiceLogic} from './object/logic/furniture/FurnitureDiceLogic';
import {FurnitureOneWayDoorLogic} from './object/logic/furniture/FurnitureOneWayDoorLogic';
import {FurnitureStickieLogic} from './object/logic/furniture/FurnitureStickieLogic';
import {FurniturePresentLogic} from './object/logic/furniture/FurniturePresentLogic';
import {FurnitureTrophyLogic} from './object/logic/furniture/FurnitureTrophyLogic';
import {FurnitureMannequinLogic} from './object/logic/furniture/FurnitureMannequinLogic';
import {FurnitureRoomDimmerLogic} from './object/logic/furniture/FurnitureRoomDimmerLogic';
import {FurnitureJukeboxLogic} from './object/logic/furniture/FurnitureJukeboxLogic';

// Room Logic
import {RoomLogic} from './object/logic/room/RoomLogic';
import {RoomTileCursorLogic} from './object/logic/room/RoomTileCursorLogic';
import {SelectionArrowLogic} from './object/logic/room/SelectionArrowLogic';

type LogicConstructor = new () => IRoomObjectEventHandler;

export class RoomObjectFactory implements IRoomObjectFactory
{
    private _registeredTypes: Map<string, boolean>;
    private _trackedEventTypes: Map<string, boolean>;
    private _objectEventListeners: Array<(event: unknown) => void>;

    constructor()
    {
        this._events = new EventEmitter();
        this._registeredTypes = new Map();
        this._trackedEventTypes = new Map();
        this._objectEventListeners = [];
    }

    private _events: EventEmitter;

    get events(): EventEmitter
    {
        return this._events;
    }

    addObjectEventListener(callback: (event: unknown) => void): void
    {
        if(this._objectEventListeners.indexOf(callback) < 0)
        {
            this._objectEventListeners.push(callback);

            if(callback !== null)
            {
                for(const eventType of this._trackedEventTypes.keys())
                {
                    this._events.on(eventType, callback);
                }
            }
        }
    }

    removeObjectEventListener(callback: (event: unknown) => void): void
    {
        const index = this._objectEventListeners.indexOf(callback);

        if(index >= 0)
        {
            this._objectEventListeners.splice(index, 1);

            if(callback !== null)
            {
                for(const eventType of this._trackedEventTypes.keys())
                {
                    this._events.off(eventType, callback);
                }
            }
        }
    }

    createRoomObjectLogic(type: string): IRoomObjectEventHandler | null
    {
        let LogicClass: LogicConstructor | null = null;

        switch(type)
        {
            // Basic furniture types
            case RoomObjectLogicEnum.FURNITURE_BASIC:
                LogicClass = FurnitureLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_MULTISTATE:
                LogicClass = FurnitureMultiStateLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_MULTIHEIGHT:
                LogicClass = FurnitureMultiHeightLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_PLACEHOLDER:
                LogicClass = FurniturePlaceholderLogic;
                break;

                // Specific furniture types
            case RoomObjectLogicEnum.FURNITURE_DICE:
                LogicClass = FurnitureDiceLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_ONE_WAY_DOOR:
                LogicClass = FurnitureOneWayDoorLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_STICKIE:
                LogicClass = FurnitureStickieLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_PRESENT:
                LogicClass = FurniturePresentLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_TROPHY:
                LogicClass = FurnitureTrophyLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_MANNEQUIN:
                LogicClass = FurnitureMannequinLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_ROOMDIMMER:
                LogicClass = FurnitureRoomDimmerLogic;
                break;
            case RoomObjectLogicEnum.FURNITURE_JUKEBOX:
                LogicClass = FurnitureJukeboxLogic;
                break;

                // Avatar types
            case RoomObjectLogicEnum.USER:
            case RoomObjectLogicEnum.BOT:
            case RoomObjectLogicEnum.RENTABLE_BOT:
                LogicClass = AvatarLogic;
                break;

            case RoomObjectLogicEnum.PET:
                LogicClass = PetLogic;
                break;

                // Room types
            case RoomObjectLogicEnum.ROOM:
                LogicClass = RoomLogic;
                break;

            case RoomObjectLogicEnum.ROOM_TILE_CURSOR:
                LogicClass = RoomTileCursorLogic;
                break;

            case RoomObjectLogicEnum.SELECTION_ARROW:
                LogicClass = SelectionArrowLogic;
                break;

            default:
                // Default to basic furniture logic for unknown types
                LogicClass = FurnitureLogic;
                break;
        }

        if(LogicClass === null)
        {
            return null;
        }

        const logic = new LogicClass();

        if(logic !== null)
        {
            logic.eventDispatcher = this._events;

            if(!this._registeredTypes.has(type))
            {
                this._registeredTypes.set(type, true);

                const eventTypes = logic.getEventTypes();

                for(const eventType of eventTypes)
                {
                    this.addTrackedEventType(eventType);
                }
            }

            return logic;
        }

        return null;
    }

    createRoomObjectManager(): IRoomObjectManager
    {
        return new RoomObjectManager();
    }

    private addTrackedEventType(eventType: string): void
    {
        if(!this._trackedEventTypes.has(eventType))
        {
            this._trackedEventTypes.set(eventType, true);

            for(const listener of this._objectEventListeners)
            {
                if(listener !== null)
                {
                    this._events.on(eventType, listener);
                }
            }
        }
    }
}
