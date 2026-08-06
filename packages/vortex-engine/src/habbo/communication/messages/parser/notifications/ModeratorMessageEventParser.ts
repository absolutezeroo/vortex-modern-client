import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for moderator message
 *
 * Parses a message text and an optional URL from a moderator.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorMessageEventParser.as
 */
export class ModeratorMessageEventParser implements IMessageParser
{
    private _message: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorMessageEventParser.as::get message()
    get message(): string
    {
        return this._message;
    }

    private _url: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorMessageEventParser.as::get url()
    get url(): string
    {
        return this._url;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorMessageEventParser.as::flush()
    flush(): boolean
    {
        this._message = '';
        this._url = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._message = wrapper.readString();
        this._url = wrapper.readString();

        return true;
    }
}
