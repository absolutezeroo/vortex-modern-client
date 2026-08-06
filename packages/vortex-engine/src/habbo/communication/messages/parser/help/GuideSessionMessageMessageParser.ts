import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session chat messages.
 * Contains the chat message and sender ID within a guide session.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionMessageMessageEventParser.as
 */
export class GuideSessionMessageMessageParser implements IMessageParser
{
    private _chatMessage: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionMessageMessageEventParser.as::get chatMessage()
    get chatMessage(): string
    {
        return this._chatMessage;
    }

    private _senderId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionMessageMessageEventParser.as::get senderId()
    get senderId(): number
    {
        return this._senderId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionMessageMessageEventParser.as::flush()
    flush(): boolean
    {
        this._chatMessage = '';
        this._senderId = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionMessageMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chatMessage = wrapper.readString();
        this._senderId = wrapper.readInt();

        return true;
    }
}
