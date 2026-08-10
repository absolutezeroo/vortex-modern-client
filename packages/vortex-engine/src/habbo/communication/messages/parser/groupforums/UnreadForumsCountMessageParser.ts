import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How many of the user's forums have unread posts — what the friend bar's forum badge counts.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_4031.as
 * (readable as `UnreadForumsCountMessageEventParser` in win63_version)
 */
export class UnreadForumsCountMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4031.as::_unreadForumsCount
    private _unreadForumsCount: number = 0;

    // AS3: _SafeCls_4031.as::get unreadForumsCount()
    get unreadForumsCount(): number
    {
        return this._unreadForumsCount;
    }

    // AS3: _SafeCls_4031.as::flush()
    flush(): boolean
    {
        this._unreadForumsCount = 0;

        return true;
    }

    // AS3: _SafeCls_4031.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._unreadForumsCount = wrapper.readInt();

        return true;
    }
}
