import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the MiniMail unread-count message (header 74).
 *
 * The class name is **derived**, not recovered: this parser is `_SafePkg_1755/_SafeCls_2075`
 * in every available tree, and MiniMail postdates the 2016 PRODUCTION build. It matches
 * `vortex-emulator`'s `MiniMailUnreadCountComposer` (Revision20260701/Headers.cs).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1755/_SafeCls_2075.as
 */
export class MiniMailUnreadCountParser implements IMessageParser
{
    // AS3: .../_SafePkg_1755/_SafeCls_2075.as::_SafeStr_9855
    private _unreadMessageCount: number = 0;

    // AS3: .../_SafePkg_1755/_SafeCls_2075.as::get unreadMessageCount()
    get unreadMessageCount(): number
    {
        return this._unreadMessageCount;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_2075.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_2075.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._unreadMessageCount = wrapper.readInt();

        return true;
    }
}
