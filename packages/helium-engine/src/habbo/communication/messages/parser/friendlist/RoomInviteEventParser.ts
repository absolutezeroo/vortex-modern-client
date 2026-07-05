import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room invite events.
 * Contains the sender ID and the invitation message text.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/RoomInviteEventParser.as
 */
export class RoomInviteEventParser implements IMessageParser
{
    private _senderId: number = 0;

    get senderId(): number
    {
        return this._senderId;
    }

    private _messageText: string = '';

    get messageText(): string
    {
        return this._messageText;
    }

    flush(): boolean
    {
        this._senderId = 0;
        this._messageText = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._senderId = wrapper.readInt();
        this._messageText = wrapper.readString();

        return true;
    }
}
