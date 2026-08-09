import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A bot has left the inventory (header 2032) — placed into a room, or otherwise gone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3095/_SafeCls_3094.as
 * (obfuscated in the primary dump; `_SafeStr_4546[2032] = _SafeCls_3331` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1335).
 */
export class BotRemovedFromInventoryMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_3094.as::_SafeStr_7108
    private _itemId: number = -1;

    // AS3: .../_SafeCls_3094.as::get itemId()
    get itemId(): number
    {
        return this._itemId;
    }

    // AS3: .../_SafeCls_3094.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3094.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._itemId = wrapper.readInt();

        return true;
    }
}
