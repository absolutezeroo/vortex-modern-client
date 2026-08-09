import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the catalog's bundle-quantity discount rules. Header 317, from WIN63's own
 * registry (`habbo/communication/_SafeCls_2046.as:931`) and corroborated by the emulator.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/catalog/GetBundleDiscountRulesetComposer.as
 */
export class GetBundleDiscountRulesetComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/catalog/GetBundleDiscountRulesetComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
