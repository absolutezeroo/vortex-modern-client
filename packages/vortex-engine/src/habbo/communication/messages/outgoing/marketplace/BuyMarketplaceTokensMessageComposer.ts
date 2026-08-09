import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buys a batch of marketplace tokens (header 3419). No body — the batch size and price are the
 * server's, sent to the client in the can-make-offer refusal that offers the purchase.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3256.as
 * (obfuscated in the primary dump; `_composers[3419] = _SafeCls_3256` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/marketplace/BuyMarketplaceTokensMessageComposer.as).
 */
export class BuyMarketplaceTokensMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3256.as::BuyMarketplaceTokensMessageComposer()
    constructor()
    {
        super();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3256.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
