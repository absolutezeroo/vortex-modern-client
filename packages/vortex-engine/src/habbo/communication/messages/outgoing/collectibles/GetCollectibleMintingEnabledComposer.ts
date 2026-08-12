import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks whether minting is switched on for this hotel (WIN63 header 813). No payload.
 *
 * The second of three requests `MintInventoryListTab.as::initializeData()` fires.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3590`), named for its one sender
 * (`MintInventoryListTab.as::initializeData()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3590.as
 */
export class GetCollectibleMintingEnabledComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3590.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
