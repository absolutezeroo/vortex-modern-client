import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * The name of a room object somebody asked for by id.
 *
 * Answers `RoomWidgetRoomObjectMessage.GET_OBJECT_NAME`, which is what the room's own name
 * bubbles are built from — a floor/wall item answers with its localized furniture name (or
 * `${poster_N_name}` for a poster), an avatar with the user's name.
 *
 * The five fields are not symmetrical between the two: for furniture `userId` carries the
 * *furniture type id* and `roomIndex` the room object id, and `userType` stays 0. That reuse is
 * AS3's, and the consumer tells the two apart by `category`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomObjectNameEvent.as
 */
export class RoomWidgetRoomObjectNameEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../RoomWidgetRoomObjectNameEvent.as::OBJECT_NAME
    public static readonly OBJECT_NAME: string = 'RWONE_TYPE';

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::_SafeStr_5971
    private _userId: number;

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::_SafeStr_4689
    private _category: number;

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::_userName
    private _userName: string;

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::_SafeStr_8226
    private _userType: number;

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::_SafeStr_7722
    private _roomIndex: number;

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::RoomWidgetRoomObjectNameEvent()
    constructor(userId: number, category: number, userName: string, userType: number, roomIndex: number)
    {
        super(RoomWidgetRoomObjectNameEvent.OBJECT_NAME);

        this._userId = userId;
        this._category = category;
        this._userName = userName;
        this._userType = userType;
        this._roomIndex = roomIndex;
    }

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::get category()
    public get category(): number
    {
        return this._category;
    }

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::get userType()
    public get userType(): number
    {
        return this._userType;
    }

    // AS3: .../RoomWidgetRoomObjectNameEvent.as::get roomIndex()
    public get roomIndex(): number
    {
        return this._roomIndex;
    }
}
