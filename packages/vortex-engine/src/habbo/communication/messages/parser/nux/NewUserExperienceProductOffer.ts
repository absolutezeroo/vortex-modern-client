import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One product inside a NUX gift option — what the option actually hands over.
 *
 * An option lists several of these, and the gift-selection view joins their display names with
 * `nux.gift.selection.separator` to caption the option.
 *
 * `localizationKey` wins over `productCode` when the server sends one: AS3 localizes the key
 * directly, and only falls back to the catalog's product data (then to `product_<code>_name`) when
 * it is absent. Both this class and the parser turn the empty string into null so that fallback
 * chain runs — the wire has no null.
 *
 * **Derived name.** The class is obfuscated in every tree: `_SafeCls_4332` in WIN63, `class_3961`
 * in win63_version, `_Str_5589` in PRODUCTION. Only its two members are readable, and its holder's
 * accessor is `productOfferList`, which is where "ProductOffer" comes from.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as
 */
export class NewUserExperienceProductOffer
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as::_productCode
    private _productCode: string;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as::_localizationKey
    private _localizationKey: string | null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as::_SafeCls_4332()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._productCode = wrapper.readString();
        this._localizationKey = wrapper.readString();

        if(this._localizationKey === '')
        {
            this._localizationKey = null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4332.as::get localizationKey()
    get localizationKey(): string | null
    {
        return this._localizationKey;
    }
}
