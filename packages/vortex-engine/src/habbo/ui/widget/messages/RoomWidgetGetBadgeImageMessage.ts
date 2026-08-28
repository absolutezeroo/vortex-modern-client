import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Fetch this badge's picture" — the info stand asks for one badge at a time, by id.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeImageMessage.as
 */
export class RoomWidgetGetBadgeImageMessage extends RoomWidgetMessage
{
    // AS3: RoomWidgetGetBadgeImageMessage.as::WIDGET_MESSAGE_GET_BADGE_IMAGE
    public static readonly WIDGET_MESSAGE_GET_BADGE_IMAGE: string = 'RWGOI_MESSAGE_GET_BADGE_IMAGE';

    /** Derived name — `_SafeStr_5053`, the field `get badgeId()` returns. */
    // AS3: RoomWidgetGetBadgeImageMessage.as::_SafeStr_5053
    private _badgeId: string;

    // AS3: RoomWidgetGetBadgeImageMessage.as::RoomWidgetGetBadgeImageMessage()
    constructor(badgeId: string)
    {
        super(RoomWidgetGetBadgeImageMessage.WIDGET_MESSAGE_GET_BADGE_IMAGE);

        this._badgeId = badgeId;
    }

    // AS3: RoomWidgetGetBadgeImageMessage.as::get badgeId()
    public get badgeId(): string
    {
        return this._badgeId;
    }
}
