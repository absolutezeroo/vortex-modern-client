/**
 * RoomWidgetChatSelectAvatarMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChatSelectAvatarMessage extends RoomWidgetMessage
{
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::WIDGET_MESSAGE_SELECT_AVATAR
    public static readonly WIDGET_MESSAGE_SELECT_AVATAR: string = 'RWCSAM_MESSAGE_SELECT_AVATAR';

    private _objectId: number;
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::_userName
    private _userName: string;
    private _roomId: number;

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::RoomWidgetChatSelectAvatarMessage()
    constructor(type: string, objectId: number, userName: string, roomId: number)
    {
        super(type);

        this._objectId = objectId;
        this._userName = userName;
        this._roomId = roomId;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatSelectAvatarMessage.as::get roomId()
    public get roomId(): number
    {
        return this._roomId;
    }
}
