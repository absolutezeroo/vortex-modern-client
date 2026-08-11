import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * How many sheets a post-it stack has left after one was placed (header 2145). Two ints.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2514/_SafeCls_2620.as
 * (obfuscated; `id` and `itemsLeft` keep their real names, and `HabboInventory`
 * (`_SafeCls_1951.as::onPostItPlaced()`) is its only reader.)
 */
export class PostItPlacedMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_2620.as::_SafeStr_4872 (name from `get id()`)
    private _id: number = 0;

    // AS3: .../_SafeCls_2620.as::_SafeStr_9833 (name from `get itemsLeft()`)
    private _itemsLeft: number = 0;

    // AS3: .../_SafeCls_2620.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../_SafeCls_2620.as::get itemsLeft()
    get itemsLeft(): number
    {
        return this._itemsLeft;
    }

    // AS3: .../_SafeCls_2620.as::flush()
    flush(): boolean
    {
        this._id = 0;
        this._itemsLeft = 0;

        return true;
    }

    // AS3: .../_SafeCls_2620.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._id = wrapper.readInt();
        this._itemsLeft = wrapper.readInt();

        return true;
    }
}
