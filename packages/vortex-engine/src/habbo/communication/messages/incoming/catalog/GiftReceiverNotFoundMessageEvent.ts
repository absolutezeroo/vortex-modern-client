import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {GiftReceiverNotFoundMessageEventParser} from '../../parser/catalog/GiftReceiverNotFoundMessageEventParser';

/**
 * The player a gift was addressed to does not exist (header 2735).
 *
 * Header from the primary registry (`_events[2735] = _SafeCls_2002`); `vortex-emulator` sends it from
 * `Vortex.PacketHandlers/Catalog/PurchaseFromCatalogAsGiftMessageHandler.cs`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2002.as
 */
export class GiftReceiverNotFoundMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2002.as::_SafeCls_2002()
    constructor(callback: MessageEventCallback)
    {
        super(callback, GiftReceiverNotFoundMessageEventParser);
    }
}
