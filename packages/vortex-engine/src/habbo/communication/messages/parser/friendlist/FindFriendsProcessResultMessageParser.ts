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

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FindFriendsProcessResultEventParser.as::get success()
    get success(): boolean
    {
        return this._success;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FindFriendsProcessResultEventParser.as::flush()
    flush(): boolean
    {
        this._success = false;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/FindFriendsProcessResultEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._success = wrapper.readBoolean();

        return true;
    }
}
