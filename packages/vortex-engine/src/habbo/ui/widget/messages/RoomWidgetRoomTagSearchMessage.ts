import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Find rooms with this tag" — sent by the info stand when a user's room tag is clicked.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetRoomTagSearchMessage.as
 */
export class RoomWidgetRoomTagSearchMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetRoomTagSearchMessage.as::ROOM_TAG_SEARCH
    public static readonly ROOM_TAG_SEARCH: string = 'RWRTSM_ROOM_TAG_SEARCH';

    /** Derived name — `_SafeStr_8499`, the field `get tag()` returns. */
    // AS3: RoomWidgetRoomTagSearchMessage.as::_SafeStr_8499
    private _tag: string;

    // AS3: RoomWidgetRoomTagSearchMessage.as::RoomWidgetRoomTagSearchMessage()
    constructor(tag: string)
    {
        super(RoomWidgetRoomTagSearchMessage.ROOM_TAG_SEARCH);

        this._tag = tag;
    }

    // AS3: RoomWidgetRoomTagSearchMessage.as::get tag()
    public get tag(): string
    {
        return this._tag;
    }
}
