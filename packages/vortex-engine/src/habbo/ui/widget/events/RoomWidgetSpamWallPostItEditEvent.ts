import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * RoomWidgetSpamWallPostItEditEvent
 *
 * Tells `SpamWallPostItFurniWidget` to open on a blank note. Unlike the ordinary sticky
 * note's update event it carries no text or colour - there is nothing to load yet, so the
 * widget supplies its own defaults.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetSpamWallPostItEditEvent.as
 */
export class RoomWidgetSpamWallPostItEditEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetSpamWallPostItEditEvent.as::_SafeStr_10774
    public static readonly OPEN_EDITOR: string = 'RWSWPUE_OPEN_EDITOR';

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::_SafeStr_4841
    private _objectId: number;

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::_SafeStr_5184
    private _location: string;

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::_SafeStr_6938
    private _objectType: string;

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::RoomWidgetSpamWallPostItEditEvent()
    constructor(type: string, objectId: number, location: string, objectType: string)
    {
        // AS3 also takes `bubbles`/`cancelable` and forwards them to the Flash event base.
        // This port's RoomWidgetUpdateEvent carries only a type - it is not a DisplayObject
        // event - so both are dropped rather than kept as parameters nothing can read.
        super(type);

        this._objectId = objectId;
        this._location = location;
        this._objectType = objectType;
    }

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::get location()
    get location(): string
    {
        return this._location;
    }

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetSpamWallPostItEditEvent.as::get objectType()
    get objectType(): string
    {
        return this._objectType;
    }
}
