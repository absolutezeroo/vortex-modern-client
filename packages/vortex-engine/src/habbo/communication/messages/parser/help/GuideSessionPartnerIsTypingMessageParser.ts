import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses guide session partner is typing data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/GuideSessionPartnerIsTypingMessageEventParser.as
 */
export class GuideSessionPartnerIsTypingMessageParser implements IMessageParser
{
    private _isTyping: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionPartnerIsTypingMessageEventParser.as::get isTyping()
    get isTyping(): boolean
    {
        return this._isTyping;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionPartnerIsTypingMessageEventParser.as::flush()
    flush(): boolean
    {
        this._isTyping = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideSessionPartnerIsTypingMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._isTyping = wrapper.readBoolean();
        return true;
    }
}
