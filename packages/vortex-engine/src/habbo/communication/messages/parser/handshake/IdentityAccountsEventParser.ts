import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for identity accounts event (multi-avatar selection)
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/IdentityAccountsEventParser.as
 */
export class IdentityAccountsEventParser implements IMessageParser
{
    private _accounts: Map<number, string> = new Map();

    get accounts(): Map<number, string>
    {
        return this._accounts;
    }

    flush(): boolean
    {
        this._accounts = new Map();
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._accounts = new Map();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const id = wrapper.readInt();
            const name = wrapper.readString();

            this._accounts.set(id, name);
        }

        return true;
    }
}
