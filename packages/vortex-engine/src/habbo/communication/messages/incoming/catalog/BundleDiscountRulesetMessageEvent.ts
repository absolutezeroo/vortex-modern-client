import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BundleDiscountRulesetMessageEventParser} from '../../parser/catalog/BundleDiscountRulesetMessageEventParser';

/**
 * Carries the catalog's bundle-quantity discount rules. Header 1073, from WIN63's own registry
 * (`habbo/communication/_SafeCls_2046.as:1179`) and corroborated by the emulator.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/BundleDiscountRulesetMessageEvent.as
 */
export class BundleDiscountRulesetMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BundleDiscountRulesetMessageEventParser);
    }
}
