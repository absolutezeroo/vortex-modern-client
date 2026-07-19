/**
 * RoomWidgetGetBadgeDetailsMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetGetBadgeDetailsMessage extends RoomWidgetMessage
{
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::WIDGET_MESSAGE_GET_BADGE_DETAILS
    public static readonly WIDGET_MESSAGE_GET_BADGE_DETAILS: string = 'RWGOI_MESSAGE_GET_BADGE_DETAILS';

    private _own: boolean;
    private _groupId: number;

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetGetBadgeDetailsMessage.as::RoomWidgetGetBadgeDetailsMessage()
    constructor(own: boolean, groupId: number)
    {
        super(RoomWidgetGetBadgeDetailsMessage.WIDGET_MESSAGE_GET_BADGE_DETAILS);
        this._own = own;
        this._groupId = groupId;
    }

    public get own(): boolean
    {
        return this._own;
    }

    public get groupId(): number
    {
        return this._groupId;
    }
}
