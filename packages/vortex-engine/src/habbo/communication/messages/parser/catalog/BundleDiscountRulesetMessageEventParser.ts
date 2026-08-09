import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {BundleDiscountRuleset} from '../../incoming/catalog/BundleDiscountRuleset';

/**
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as
 */
export class BundleDiscountRulesetMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1713.as::_bundleDiscountRuleset
    private _bundleDiscountRuleset: BundleDiscountRuleset | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1713.as::get bundleDiscountRuleset()
    get bundleDiscountRuleset(): BundleDiscountRuleset | null
    {
        return this._bundleDiscountRuleset;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1713.as::flush()
    flush(): boolean
    {
        this._bundleDiscountRuleset = null;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_1713.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._bundleDiscountRuleset = new BundleDiscountRuleset(wrapper);

        return true;
    }
}
