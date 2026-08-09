import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GiftWrappingConfigurationEventParser} from '../../parser/catalog/GiftWrappingConfigurationEventParser';

/**
 * Which boxes, ribbons and stuff types the gift-wrapping dialog may offer, and what it costs.
 *
 * Header 1369, from the emulator's `GiftWrappingConfigurationComposer`. WIN63's registry carries
 * the request side (940) but this port had no ported counterpart for the response, so the id could
 * not be read back from the client registry - the emulator is the only source here, and it is
 * flagged as such rather than presented as AS3-verified.
 *
 * `win63_version` is cited only for the readable class name: this message is obfuscated in the
 * primary tree, which is where every member trace below points, because that tree is the
 * authority on behaviour and this one has shipped two bad decompiles today alone.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_1918.as
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/GiftWrappingConfigurationEvent.as
 */
export class GiftWrappingConfigurationEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, GiftWrappingConfigurationEventParser);
    }
}
