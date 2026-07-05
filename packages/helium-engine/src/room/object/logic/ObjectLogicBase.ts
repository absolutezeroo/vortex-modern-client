/**
 * ObjectLogicBase
 *
 * Based on AS3: com.sulake.room.object.logic.ObjectLogicBase
 *
 * Base class for room object logic handlers.
 * Provides default implementations for all IRoomObjectEventHandler methods.
 */
import type {EventEmitter} from 'eventemitter3';
import type {RoomSpriteMouseEvent} from '../../events/RoomSpriteMouseEvent';
import type {RoomObjectUpdateMessage} from '../../messages/RoomObjectUpdateMessage';
import type {IRoomGeometry} from '../../utils/IRoomGeometry';
import type {IRoomObjectController} from '../IRoomObjectController';
import type {IRoomObjectEventHandler} from './IRoomObjectEventHandler';

export class ObjectLogicBase implements IRoomObjectEventHandler
{
    private _eventDispatcher: EventEmitter | null = null;

    get eventDispatcher(): EventEmitter | null
    {
        return this._eventDispatcher;
    }

    set eventDispatcher(value: EventEmitter | null)
    {
        this._eventDispatcher = value;
    }

    private _object: IRoomObjectController | null = null;

    get object(): IRoomObjectController | null
    {
        return this._object;
    }

    set object(value: IRoomObjectController | null)
    {
        if(this._object === value)
        {
            return;
        }

        if(this._object !== null)
        {
            this._object.setEventHandler(null);
        }

        if(value === null)
        {
            this.dispose();
            this._object = null;
        }
        else
        {
            this._object = value;
            this._object.setEventHandler(this);
        }
    }

    get widget(): string | null
    {
        return null;
    }

    get contextMenu(): string | null
    {
        return null;
    }

    getEventTypes(): string[]
    {
        return [];
    }

    dispose(): void
    {
        this._object = null;
    }

    mouseEvent(_event: RoomSpriteMouseEvent, _geometry: IRoomGeometry): void
    {
        // Override in subclass
    }

    initialize(_data: unknown): void
    {
        // Override in subclass
    }

    update(_time: number): void
    {
        // Override in subclass
    }

    processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        if(message !== null)
        {
            if(this._object !== null)
            {
                if(message.loc)
                {
                    this._object.setLocation(message.loc);
                }

                if(message.dir)
                {
                    this._object.setDirection(message.dir);
                }
            }
        }
    }

    useObject(): void
    {
        // Override in subclass
    }

    tearDown(): void
    {
        // Override in subclass
    }

    protected getAllEventTypes(baseTypes: string[], additionalTypes: string[]): string[]
    {
        const result = baseTypes.slice();

        for(const type of additionalTypes)
        {
            if(result.indexOf(type) < 0)
            {
                result.push(type);
            }
        }

        return result;
    }
}
