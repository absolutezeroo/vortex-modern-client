import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for find friends process result.
 * Indicates whether the find new friends operation succeeded.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FindFriendsProcessResultEventParser.as
 */
export class FindFriendsProcessResultMessageParser implements IMessageParser
{
    private _success: boolean = false;

    get success(): boolean
    {
        return this._success;
    }

    flush(): boolean
    {
        this._success = false;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._success = wrapper.readBoolean();

        return true;
    }
}
