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

    get roomId(): number
    {
        return this._roomId;
    }

    private _roomName: string = '';

    get roomName(): string
    {
        return this._roomName;
    }

    private _messageCount: number = 0;

    get messageCount(): number
    {
        return this._messageCount;
    }

    flush(): boolean
    {
        this._roomId = -1;
        this._roomName = '';
        this._messageCount = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._roomName = wrapper.readString();
        this._messageCount = wrapper.readInt();

        return true;
    }
}
