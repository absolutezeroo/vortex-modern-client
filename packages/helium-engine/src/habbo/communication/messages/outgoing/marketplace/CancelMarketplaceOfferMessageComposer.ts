import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Despite the "cancel" wire name, this is what `HabboCatalog.redeemExpiredMarketPlaceOffer()`
 * sends - client-facing terminology is "redeem" (pull the item back from an
 * expired/unsold listing), but the wire-level composer name (recovered from
 * win63_version) is "cancel".
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1746/_SafeCls_1808.as
 * (real name recovered from sources/win63_version/habbo/communication/messages/outgoing/marketplace/CancelMarketplaceOfferMessageComposer.as)
 */
export class CancelMarketplaceOfferMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(offerId: number)
    {
        super();
        this._data = [offerId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
