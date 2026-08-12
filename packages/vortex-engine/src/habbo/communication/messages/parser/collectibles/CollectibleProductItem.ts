import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One furni type the player may mint into a collectible, with its sale window and price.
 *
 * The trailing short is a product *kind* that AS3 immediately maps to the catalog's one-letter
 * codes — `"s"` (floor), `"i"` (wall), `"cl"` (clothing) — with `"s"` also standing in for anything
 * unrecognised. The mapped string is what every consumer reads, so the raw short is not kept.
 *
 * Name DERIVED: obfuscated in every tree, named for the accessor that returns a list of these
 * (`CollectableMintableItemTypesMessageParser.collectibleProductItems`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_4500.as
 */
export class CollectibleProductItem
{
    // AS3: _SafeCls_4500.as::_SafeStr_9134 (from `get itemTypeId()`)
    private _itemTypeId: number = 0;
    // AS3: _SafeCls_4500.as::_startTime
    private _startTime: number = 0;
    // AS3: _SafeCls_4500.as::_endTime
    private _endTime: number = 0;
    // AS3: _SafeCls_4500.as::_SafeStr_9037 (from `get regionLocked()`)
    private _regionLocked: boolean = false;
    // AS3: _SafeCls_4500.as::_SafeStr_8355 (from `get price()`)
    private _price: number = 0;
    // AS3: _SafeCls_4500.as::_SafeStr_9981 (from `get limitedEdition()`)
    private _limitedEdition: boolean = false;
    // AS3: _SafeCls_4500.as::_SafeStr_5296 (from `get itemType()`)
    private _itemType: string = 's';

    // AS3: _SafeCls_4500.as::_SafeCls_4500()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._itemTypeId = wrapper.readInt();
        this._startTime = wrapper.readInt();
        this._endTime = wrapper.readInt();
        this._regionLocked = wrapper.readBoolean();
        this._price = wrapper.readInt();
        this._limitedEdition = wrapper.readBoolean();

        switch(wrapper.readShort())
        {
            case 0:
                this._itemType = 's';
                break;
            case 1:
                this._itemType = 'i';
                break;
            case 2:
                this._itemType = 'cl';
                break;
            default:
                // AS3's default is 's' as well, not an error — an unknown kind is drawn as a floor
                // item rather than skipped.
                this._itemType = 's';
                break;
        }
    }

    // AS3: _SafeCls_4500.as::get itemTypeId()
    get itemTypeId(): number
    {
        return this._itemTypeId;
    }

    // AS3: _SafeCls_4500.as::get startTime()
    get startTime(): number
    {
        return this._startTime;
    }

    // AS3: _SafeCls_4500.as::get endTime()
    get endTime(): number
    {
        return this._endTime;
    }

    // AS3: _SafeCls_4500.as::get regionLocked()
    get regionLocked(): boolean
    {
        return this._regionLocked;
    }

    // AS3: _SafeCls_4500.as::get price()
    get price(): number
    {
        return this._price;
    }

    // AS3: _SafeCls_4500.as::get limitedEdition()
    get limitedEdition(): boolean
    {
        return this._limitedEdition;
    }

    // AS3: _SafeCls_4500.as::get itemType()
    get itemType(): string
    {
        return this._itemType;
    }
}
