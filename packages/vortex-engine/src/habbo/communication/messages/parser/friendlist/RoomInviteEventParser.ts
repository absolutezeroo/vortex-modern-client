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

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/RoomInviteEventParser.as::get senderId()
    get senderId(): number
    {
        return this._senderId;
    }

    private _messageText: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/RoomInviteEventParser.as::get messageText()
    get messageText(): string
    {
        return this._messageText;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/RoomInviteEventParser.as::flush()
    flush(): boolean
    {
        this._senderId = 0;
        this._messageText = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/RoomInviteEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._senderId = wrapper.readInt();
        this._messageText = wrapper.readString();

        return true;
    }
}
