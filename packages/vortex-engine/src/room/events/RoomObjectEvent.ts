/**
 * RoomObjectEvent
 *
 * Based on AS3: com.sulake.room.events.RoomObjectEvent
 *
 * Event emitted by room objects.
 */
import type {IRoomObject} from '../object/IRoomObject';

export class RoomObjectEvent
{
    constructor(type: string, object: IRoomObject | null)
    {
        this._type = type;
        this._object = object;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    private _object: IRoomObject | null;

    get object(): IRoomObject | null
    {
        return this._object;
    }

    get objectId(): number
    {
        if(this._object !== null)
        {
            return this._object.getId();
        }

        return -1;
    }

    get objectType(): string | null
    {
        if(this._object !== null)
        {
            return this._object.getType();
        }

        return null;
    }
}
