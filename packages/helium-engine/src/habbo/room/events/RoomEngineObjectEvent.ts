/**
 * RoomEngineObjectEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomEngineObjectEvent
 *
 * Event for room object interactions.
 */
import {RoomEngineEvent} from './RoomEngineEvent';

export class RoomEngineObjectEvent extends RoomEngineEvent
{
    public static readonly REOE_OBJECT_ADDED = 'REOE_OBJECT_ADDED';
    public static readonly REOE_OBJECT_REMOVED = 'REOE_OBJECT_REMOVED';
    public static readonly REOE_OBJECT_SELECTED = 'REOE_OBJECT_SELECTED';
    public static readonly REOE_OBJECT_DESELECTED = 'REOE_OBJECT_DESELECTED';
    public static readonly REOE_OBJECT_PLACED = 'REOE_OBJECT_PLACED';
    public static readonly REOE_OBJECT_REQUEST_MOVE = 'REOE_OBJECT_REQUEST_MOVE';
    public static readonly REOE_OBJECT_REQUEST_ROTATE = 'REOE_OBJECT_REQUEST_ROTATE';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/events/RoomEngineObjectEvent.as::_SafeStr_10306
    // (recovered name/value from win63_version cross-reference: real AS3 string is "REOE_UPDATED",
    // unlike this port's other REOE_OBJECT_* constants which use an "_OBJECT_" naming variant)
    public static readonly REOE_UPDATED = 'REOE_UPDATED';

    constructor(type: string, roomId: number, objectId: number, category: number)
    {
        super(type, roomId);
        this._objectId = objectId;
        this._category = category;
    }

    private _objectId: number;

    get objectId(): number
    {
        return this._objectId;
    }

    private _category: number;

    get category(): number
    {
        return this._category;
    }
}
