import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {
    WiredTransactionSuccessContents
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionSuccessContents';

/**
 * A wired transaction completed, header 2677.
 *
 * **The parser owns a counter, not just a payload.** `_nextInternalId` is a class-level sequence
 * starting at 1, incremented once per parse and handed to each
 * {@link WiredTransactionSuccessContents} as its `internalId`. Nothing on the wire identifies a
 * notification, so this is what `RewardNotificationController` keys its map on and what the
 * `wiredrewards/open/<id>` link refers to. It is deliberately never reset: two notifications must
 * not share an id within a session.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message and the emulator has no constant for
 * 2677. Named for what it announces.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/_SafeCls_3727.as
 */
export class WiredTransactionSuccessMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3727.as::_SafeStr_9264 (name derived: the internal-id sequence)
    private static _nextInternalId: number = 1;

    // AS3: _SafeCls_3727.as::contents (backing field)
    private _contents: WiredTransactionSuccessContents | null = null;

    // AS3: _SafeCls_3727.as::get contents()
    get contents(): WiredTransactionSuccessContents | null
    {
        return this._contents;
    }

    // AS3: _SafeCls_3727.as::flush()
    flush(): boolean
    {
        this._contents = null;

        return true;
    }

    // AS3: _SafeCls_3727.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // AS3 post-increments, so the first notification of the session gets 1, not 2.
        this._contents = new WiredTransactionSuccessContents(
            WiredTransactionSuccessMessageParser._nextInternalId++,
            wrapper
        );

        return true;
    }
}
