import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The engraving was cancelled — either side backing out closes both panels (header 267).
 *
 * The class name is **derived**, not recovered: the parser is `_SafeCls_4263` in every tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2701/_SafeCls_4263.as
 */
export class FriendFurniCancelLockParser implements IMessageParser
{
    // AS3: .../_SafeCls_4263.as::_stuffId
    private _stuffId: number = 0;

    // AS3: .../_SafeCls_4263.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: .../_SafeCls_4263.as::flush()
    flush(): boolean
    {
        this._stuffId = 0;

        return true;
    }

    // AS3: .../_SafeCls_4263.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();

        return true;
    }
}
