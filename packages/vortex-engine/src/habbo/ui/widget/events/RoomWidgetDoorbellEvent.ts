import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * Someone is at the door, or their request has just been answered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetDoorbellEvent.as
 */
export class RoomWidgetDoorbellEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetDoorbellEvent.as::RINGING
    static readonly RINGING: string = 'RWDE_RINGING';

    // AS3: .../RoomWidgetDoorbellEvent.as::REJECTED
    static readonly REJECTED: string = 'RWDE_REJECTED';

    // AS3: .../RoomWidgetDoorbellEvent.as::ACCEPTED
    static readonly ACCEPTED: string = 'RWDE_ACCEPTED';

    // AS3: .../RoomWidgetDoorbellEvent.as::_userName
    private _userName: string = '';

    // AS3: .../RoomWidgetDoorbellEvent.as::RoomWidgetDoorbellEvent()
    constructor(type: string, userName: string)
    {
        super(type);

        this._userName = userName;
    }

    // AS3: .../RoomWidgetDoorbellEvent.as::get userName()
    get userName(): string
    {
        return this._userName;
    }
}
