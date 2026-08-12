import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks what an outward NFT transfer costs (WIN63 header 3484). No payload.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3763`), named for its one sender
 * (`TransferNftsTab.as::initializeData()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3763.as
 */
export class GetNftTransferFeeComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3763.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
