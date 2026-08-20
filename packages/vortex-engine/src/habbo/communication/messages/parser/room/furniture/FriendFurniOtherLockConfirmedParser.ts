import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The other player confirmed their side of the engraving (header 3451).
 *
 * The class name is **derived**, not recovered: the parser is `_SafeCls_4389` in every tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4264/_SafeCls_4389.as
 */
export class FriendFurniOtherLockConfirmedParser implements IMessageParser
{
    // AS3: .../_SafeCls_4389.as::_stuffId
    private _stuffId: number = 0;

    // AS3: .../_SafeCls_4389.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: .../_SafeCls_4389.as::flush()
    flush(): boolean
    {
        this._stuffId = 0;

        return true;
    }

    // AS3: .../_SafeCls_4389.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();

        return true;
    }
}
