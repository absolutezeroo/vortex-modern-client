import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The four loops read `_loc3_ < _loc2_` in the primary tree. `win63_version`'s decompile has
 * `while(0 < _loc2_)` in all four, which would spin forever on any non-empty list - a decompiler
 * artifact, not the shipped code. Checked before porting for exactly that reason.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/GiftWrappingConfigurationEventParser.as
 */
export class GiftWrappingConfigurationEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get isWrappingEnabled()
    private _isWrappingEnabled: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get wrappingPrice()
    private _wrappingPrice: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::_stuffTypes
    private _stuffTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::_boxTypes
    private _boxTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::_ribbonTypes
    private _ribbonTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::_defaultStuffTypes
    private _defaultStuffTypes: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get isWrappingEnabled()
    get isWrappingEnabled(): boolean
    {
        return this._isWrappingEnabled;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get wrappingPrice()
    get wrappingPrice(): number
    {
        return this._wrappingPrice;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get stuffTypes()
    get stuffTypes(): number[]
    {
        return this._stuffTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get boxTypes()
    get boxTypes(): number[]
    {
        return this._boxTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get ribbonTypes()
    get ribbonTypes(): number[]
    {
        return this._ribbonTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::get defaultStuffTypes()
    get defaultStuffTypes(): number[]
    {
        return this._defaultStuffTypes;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3083.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffTypes = [];
        this._boxTypes = [];
        this._ribbonTypes = [];
        this._defaultStuffTypes = [];

        this._isWrappingEnabled = wrapper.readBoolean();
        this._wrappingPrice = wrapper.readInt();

        for(const target of [this._stuffTypes, this._boxTypes, this._ribbonTypes, this._defaultStuffTypes])
        {
            const count = wrapper.readInt();

            for(let i = 0; i < count; i++)
            {
                target.push(wrapper.readInt());
            }
        }

        return true;
    }
}
