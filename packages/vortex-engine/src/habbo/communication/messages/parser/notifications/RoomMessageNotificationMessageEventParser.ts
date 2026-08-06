import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room message notification
 *
 * Parses the room ID, room name, and message count.
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as
 */
export class RoomMessageNotificationMessageEventParser implements IMessageParser
{
    private _roomId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::_roomName
    private _roomName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::get roomName()
    get roomName(): string
    {
        return this._roomName;
    }

    private _messageCount: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::get messageCount()
    get messageCount(): number
    {
        return this._messageCount;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::flush()
    flush(): boolean
    {
        this._roomId = -1;
        this._roomName = '';
        this._messageCount = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/furniture/RoomMessageNotificationMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._messageCount = wrapper.readInt();

        return true;
    }
}
