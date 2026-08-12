import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for everything on sale in the NFT store (WIN63 header 1809). No payload.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3050`), named for its one sender
 * (`ShopTab.as::requestNftStoreOffers()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3050.as
 */
export class GetNftStoreOffersComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3050.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
