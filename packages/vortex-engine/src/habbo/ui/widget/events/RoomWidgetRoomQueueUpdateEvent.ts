import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * Where you stand in a room's entry queue, and which queue it is.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomQueueUpdateEvent.as
 */
export class RoomWidgetRoomQueueUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::VISITOR_QUEUE_STATUS
    static readonly VISITOR_QUEUE_STATUS: string = 'RWRQUE_VISITOR_QUEUE_STATUS';

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::SPECTATOR_QUEUE_STATUS
    static readonly SPECTATOR_QUEUE_STATUS: string = 'RWRQUE_SPECTATOR_QUEUE_STATUS';

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::_position
    private _position: number;

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::_hasHabboClub
    private _hasHabboClub: boolean;

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::_isActive
    private _isActive: boolean;

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::_isClubQueue
    private _isClubQueue: boolean;

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::RoomWidgetRoomQueueUpdateEvent()
    constructor(type: string, position: number, hasHabboClub: boolean, isActive: boolean, isClubQueue: boolean)
    {
        super(type);

        this._position = position;
        this._hasHabboClub = hasHabboClub;
        this._isActive = isActive;
        this._isClubQueue = isClubQueue;
    }

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::get position()
    // Already 1-based: the handler adds one to the queue size before building this.
    get position(): number
    {
        return this._position;
    }

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::get hasHabboClub()
    get hasHabboClub(): boolean
    {
        return this._hasHabboClub;
    }

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::get isActive()
    get isActive(): boolean
    {
        return this._isActive;
    }

    // AS3: .../RoomWidgetRoomQueueUpdateEvent.as::get isClubQueue()
    get isClubQueue(): boolean
    {
        return this._isClubQueue;
    }
}
