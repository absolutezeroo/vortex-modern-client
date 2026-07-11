import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * TS-derived name: newer feature absent from win63_version/flash_version
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 * Named from usage context: `HabboCatalog.cancelAllMarketPlaceOffers()`
 * sends this with no arguments.
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1746/_SafeCls_1986.as
 */
export class CancelAllMarketplaceOffersMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
