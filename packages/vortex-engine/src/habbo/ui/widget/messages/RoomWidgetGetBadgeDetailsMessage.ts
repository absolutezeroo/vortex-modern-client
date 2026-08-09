/**
 * RoomWidgetGetBadgeDetailsMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetGetBadgeDetailsMessage extends RoomWidgetMessage
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::WIDGET_MESSAGE_GET_BADGE_DETAILS
    public static readonly WIDGET_MESSAGE_GET_BADGE_DETAILS: string = 'RWGOI_MESSAGE_GET_BADGE_DETAILS';

    private _own: boolean;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::_groupId
    private _groupId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::RoomWidgetGetBadgeDetailsMessage()
    constructor(own: boolean, groupId: number)
    {
        super(RoomWidgetGetBadgeDetailsMessage.WIDGET_MESSAGE_GET_BADGE_DETAILS);
        this._own = own;
        this._groupId = groupId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::get own()
    public get own(): boolean
    {
        return this._own;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::get groupId()
    public get groupId(): number
    {
        return this._groupId;
    }
}
