import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the MiniMail new-message notification (header 3884).
 *
 * The payload is empty: AS3's `parse()` reads nothing and returns true, and the handler
 * treats the message itself as the signal — it increments its own unread counter rather
 * than being told a number. The authoritative count arrives separately, on
 * `MiniMailUnreadCountParser`.
 *
 * The class name is **derived**, not recovered: this parser is `_SafePkg_1755/_SafeCls_3534`
 * in every available tree, and MiniMail postdates the 2016 PRODUCTION build. It matches
 * `vortex-emulator`'s `MiniMailNewMessageComposer` (Revision20260701/Headers.cs).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1755/_SafeCls_3534.as
 */
export class MiniMailNewMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_1755/_SafeCls_3534.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_3534.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
