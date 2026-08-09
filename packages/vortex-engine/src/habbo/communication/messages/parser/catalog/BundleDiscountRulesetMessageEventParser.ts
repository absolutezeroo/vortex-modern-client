import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {BundleDiscountRuleset} from '../../incoming/catalog/BundleDiscountRuleset';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as
 */
export class BundleDiscountRulesetMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as::_bundleDiscountRuleset
    private _bundleDiscountRuleset: BundleDiscountRuleset | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as::get bundleDiscountRuleset()
    get bundleDiscountRuleset(): BundleDiscountRuleset | null
    {
        return this._bundleDiscountRuleset;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as::flush()
    flush(): boolean
    {
        this._bundleDiscountRuleset = null;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/BundleDiscountRulesetMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._bundleDiscountRuleset = new BundleDiscountRuleset(wrapper);

        return true;
    }
}
