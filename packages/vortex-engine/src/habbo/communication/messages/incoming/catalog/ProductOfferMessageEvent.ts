import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ProductOfferMessageEventParser} from '../../parser/catalog/ProductOfferMessageEventParser';

/**
 * The server's answer to `GetProductOfferComposer` — one refreshed catalog offer (header 1911).
 *
 * Sent whenever the client asks about a single product rather than a whole page: selecting a
 * product in a grid, following a catalog link, or re-reading a limited-edition item to find out
 * how many are left.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2066.as
 * (obfuscated; `_events[1911] = _SafeCls_2066` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboCatalog.as::onProductOffer()` is its only handler. `vortex-emulator` corroborates:
 * `Revision20260701/Headers.cs::ProductOfferComposer = 1911`.)
 */
export class ProductOfferMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2066.as::_SafeCls_2066()
    constructor(callback: MessageEventCallback)
    {
        super(callback, ProductOfferMessageEventParser);
    }
}
