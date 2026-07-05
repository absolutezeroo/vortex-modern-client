import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for in-client link messages sent by the server
 *
 * @see source_as_win63/habbo/communication/messages/parser/users/InClientLinkMessageEventParser.as
 */
export class InClientLinkMessageParser implements IMessageParser
{
    private _link: string = '';

    get link(): string
    {
        return this._link;
    }

    flush(): boolean
    {
        this._link = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._link = wrapper.readString();

        return true;
    }
}
