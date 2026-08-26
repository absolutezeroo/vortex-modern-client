import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {CraftingResultObjectParser} from './CraftingResultObjectParser';

/**
 * The outcome of a craft attempt (`CraftComposer`/`CraftSecretComposer`): whether it succeeded and,
 * if so, the product that was made.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3516/_SafeCls_4124.as
 * (real name from sources/win63_version/habbo/communication/messages/parser/crafting/CraftingResultMessageEventParser.as)
 */
export class CraftingResultMessageEventParser implements IMessageParser
{
    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::_SafeStr_7256 (success)
    private _success: boolean = false;

    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::_SafeStr_6321 (productData)
    private _productData: CraftingResultObjectParser | null = null;

    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::flush()
    flush(): boolean
    {
        this._success = false;
        this._productData = null;

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._success = wrapper.readBoolean();

        if(this._success)
        {
            this._productData = new CraftingResultObjectParser(wrapper);
        }

        return true;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::get success()
    get success(): boolean
    {
        return this._success;
    }

    // AS3: .../_SafePkg_3516/_SafeCls_4124.as::get productData()
    get productData(): CraftingResultObjectParser | null
    {
        return this._productData;
    }
}
