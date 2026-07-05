import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for blocked users list.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/users/BlockListMessageEventParser.as
 */
export class BlockListMessageParser implements IMessageParser
{
    private _blockedUsers: number[] = [];

    get blockedUsers(): number[]
    {
        return this._blockedUsers.slice();
    }

    flush(): boolean
    {
        this._blockedUsers = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._blockedUsers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._blockedUsers.push(wrapper.readInt());
        }

        return true;
    }
}
