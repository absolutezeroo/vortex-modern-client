import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks which furni types can be minted (WIN63 header 3856). No payload.
 *
 * The first of three requests `MintInventoryListTab.as::initializeData()` fires.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3456`), named for its one sender
 * (`MintInventoryListTab.as::initializeData()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3456.as
 */
export class GetCollectibleMintableItemTypesComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3456.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
