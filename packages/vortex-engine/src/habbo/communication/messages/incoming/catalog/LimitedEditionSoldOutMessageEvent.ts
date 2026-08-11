import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {LimitedEditionSoldOutMessageEventParser} from '../../parser/catalog/LimitedEditionSoldOutMessageEventParser';

/**
 * A limited-edition item sold out before this purchase completed (header 533).
 *
 * Header from the primary registry (`_events[533] = _SafeCls_2292`); `vortex-emulator` sends it from
 * `Vortex.PacketHandlers/Catalog/PurchaseFromCatalogAsGiftMessageHandler.cs`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2292.as
 */
export class LimitedEditionSoldOutMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2292.as::_SafeCls_2292()
    constructor(callback: MessageEventCallback)
    {
        super(callback, LimitedEditionSoldOutMessageEventParser);
    }
}
