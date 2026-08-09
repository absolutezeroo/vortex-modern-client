import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BundleDiscountRulesetMessageEventParser} from '../../parser/catalog/BundleDiscountRulesetMessageEventParser';

/**
 * Carries the catalog's bundle-quantity discount rules. Header 1073, from WIN63's own registry
 * (`habbo/communication/_SafeCls_2046.as:1179`) and corroborated by the emulator.
 *
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
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
