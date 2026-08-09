import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server whether this user may list an item at all (header 1493). No body: the answer
 * depends only on the account, so the server needs nothing from the client.
 *
 * The reply (`MarketplaceCanMakeOfferResultEvent`) is a result code, not a boolean —
 * `MarketplaceModel.proceedOfferMaking()` fans it out into the offer dialog, one of three refusal
 * alerts, or the buy-tokens dialog.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3907.as
 * (obfuscated in the primary dump; `_composers[1493] = _SafeCls_3907` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/marketplace/GetMarketplaceCanMakeOfferMessageComposer.as).
 */
export class GetMarketplaceCanMakeOfferMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3907.as::GetMarketplaceCanMakeOfferMessageComposer()
    constructor()
    {
        super();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1746/_SafeCls_3907.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
