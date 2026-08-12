import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the mint-token bundles on sale for silver (WIN63 header 3638). No payload.
 *
 * The third of three requests `MintInventoryListTab.as::initializeData()` fires.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_2815`), named for its one sender
 * (`MintInventoryListTab.as::initializeData()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_2815.as
 */
export class GetMintTokenOffersComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2815.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
