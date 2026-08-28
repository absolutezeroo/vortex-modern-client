import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * "Here is who you are" — the me-menu's own-avatar identity, dispatched when the toolbar's MEMENU
 * icon is clicked and the hotel is *not* on the simple me-menu.
 *
 * The simple menu instead goes through `selectOwnAvatar()`, which asks the info stand for the same
 * facts over the widget-message round trip. Two routes to one bubble; the config flag picks.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetAvatarInfoEvent.as
 */
export class RoomWidgetAvatarInfoEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetAvatarInfoEvent.as::AVATAR_INFO
    public static readonly AVATAR_INFO: string = 'RWAIE_AVATAR_INFO';

    /** Derived name — `_SafeStr_5971`. */
    // AS3: RoomWidgetAvatarInfoEvent.as::_SafeStr_5971
    private _userId: number;

    // AS3: RoomWidgetAvatarInfoEvent.as::_userName
    private _userName: string;

    /** Derived name — `_SafeStr_8226`. */
    // AS3: RoomWidgetAvatarInfoEvent.as::_SafeStr_8226
    private _userType: number;

    /** Derived name — `_SafeStr_7722`. */
    // AS3: RoomWidgetAvatarInfoEvent.as::_SafeStr_7722
    private _roomIndex: number;

    /** Derived name — `_SafeStr_7952`. */
    // AS3: RoomWidgetAvatarInfoEvent.as::_SafeStr_7952
    private _allowNameChange: boolean;

    // AS3: RoomWidgetAvatarInfoEvent.as::RoomWidgetAvatarInfoEvent()
    constructor(userId: number, userName: string, userType: number, roomIndex: number, allowNameChange: boolean)
    {
        super(RoomWidgetAvatarInfoEvent.AVATAR_INFO);

        this._userId = userId;
        this._userName = userName;
        this._userType = userType;
        this._roomIndex = roomIndex;
        this._allowNameChange = allowNameChange;
    }

    // AS3: RoomWidgetAvatarInfoEvent.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: RoomWidgetAvatarInfoEvent.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }

    // AS3: RoomWidgetAvatarInfoEvent.as::get userType()
    public get userType(): number
    {
        return this._userType;
    }

    // AS3: RoomWidgetAvatarInfoEvent.as::get roomIndex()
    public get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: RoomWidgetAvatarInfoEvent.as::get allowNameChange()
    public get allowNameChange(): boolean
    {
        return this._allowNameChange;
    }
}
