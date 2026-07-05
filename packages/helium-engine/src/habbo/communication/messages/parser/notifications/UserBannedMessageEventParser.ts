import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for user banned message
 *
 * Parses the ban reason message text.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/UserBannedMessageEventParser.as
 */
export class UserBannedMessageEventParser implements IMessageParser
{
    private _message: string = '';

    get message(): string
    {
        return this._message;
    }

    flush(): boolean
    {
        this._message = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._message = wrapper.readString();

        return true;
    }
}
