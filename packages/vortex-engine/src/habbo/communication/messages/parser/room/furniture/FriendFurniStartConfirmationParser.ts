import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A friendship furni (love lock, wild west lock, Habboween lock) is asking the two players
 * to confirm the engraving (header 2716).
 *
 * The class name is **derived**, not recovered: the parser is `_SafeCls_4277` in every tree
 * and `vortex-emulator` has no counterpart to borrow a name from — only the composer side
 * (3318, `FriendFurniConfirmLockMessageEvent`) exists there.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4264/_SafeCls_4277.as
 */
export class FriendFurniStartConfirmationParser implements IMessageParser
{
    // AS3: .../_SafeCls_4277.as::_stuffId
    private _stuffId: number = 0;

    // AS3: .../_SafeCls_4277.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    /** Whether *this* client owns the furni — the other side's panel is laid out differently. */
    // AS3: .../_SafeCls_4277.as::_SafeStr_7624
    private _isOwner: boolean = false;

    // AS3: .../_SafeCls_4277.as::get isOwner()
    get isOwner(): boolean
    {
        return this._isOwner;
    }

    // AS3: .../_SafeCls_4277.as::flush()
    flush(): boolean
    {
        this._stuffId = 0;
        this._isOwner = false;

        return true;
    }

    // AS3: .../_SafeCls_4277.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();
        this._isOwner = wrapper.readBoolean();

        return true;
    }
}
