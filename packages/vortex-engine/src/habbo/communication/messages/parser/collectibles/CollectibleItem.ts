import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One collectible product as the server describes it: what it is, what it is worth, and enough to
 * draw it.
 *
 * Base class for the assets the player actually owns — `readAdditionalParams()` is the hook a
 * subclass uses to slot its own fields in mid-read, which matters because everything after that
 * point is read *after* the subclass's bytes.
 *
 * Name DERIVED: obfuscated in every tree, named for the package it heads
 * (`parser/collectibles/`), which is AS3's own and readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_2582.as
 */
export class CollectibleItem
{
    // AS3: _SafeCls_2582.as::_SafeStr_8929 (from `get productTypeId()`)
    protected _productTypeId: number = 0;

    // AS3: _SafeCls_2582.as::_SafeStr_9134 (from `get itemTypeId()`)
    protected _itemTypeId: string = '';

    // AS3: _SafeCls_2582.as::_SafeStr_5404 (from `get score()`)
    protected _score: number = 0;

    // AS3: _SafeCls_2582.as::_petFigureString
    protected _petFigureString: string = '';

    // AS3: _SafeCls_2582.as::_SafeStr_7554 (from `get figureSetIds()`)
    protected _figureSetIds: number[] = [];

    // AS3: _SafeCls_2582.as::_productCode
    protected _productCode: string = '';

    // AS3: _SafeCls_2582.as::_SafeStr_7896 (from `get rarity()`)
    protected _rarity: string = '';

    /**
     * The product type is a **short**, not an int — the only narrow field in the block.
     *
     * `readAdditionalParams()` is called part-way through, so a subclass's fields land between the
     * score and the pet figure rather than at either end.
     */
    // AS3: _SafeCls_2582.as::_SafeCls_2582()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._productTypeId = wrapper.readShort();
        this._itemTypeId = wrapper.readString();
        this._score = wrapper.readInt();

        this.readAdditionalParams(wrapper);

        this._petFigureString = wrapper.readString();
        this._figureSetIds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._figureSetIds.push(wrapper.readInt());

        this._productCode = wrapper.readString();
        this._rarity = wrapper.readString();
    }

    /**
     * Empty here, as in AS3. Note this runs from the base constructor, so a subclass that overrides
     * it must not rely on its own field initialisers having run — TypeScript runs those after
     * `super()` returns and would clobber anything assigned here.
     */
    // AS3: _SafeCls_2582.as::readAdditionalParams()
    readAdditionalParams(_wrapper: IMessageDataWrapper): void
    {
    }

    // AS3: _SafeCls_2582.as::get productTypeId()
    get productTypeId(): number
    {
        return this._productTypeId;
    }

    // AS3: _SafeCls_2582.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._itemTypeId;
    }

    // AS3: _SafeCls_2582.as::get score()
    get score(): number
    {
        return this._score;
    }

    // AS3: _SafeCls_2582.as::get petFigureString()
    get petFigureString(): string
    {
        return this._petFigureString;
    }

    // AS3: _SafeCls_2582.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return this._figureSetIds;
    }

    // AS3: _SafeCls_2582.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: _SafeCls_2582.as::get rarity()
    get rarity(): string
    {
        return this._rarity;
    }
}
