import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the wallets the player has linked (WIN63 header 261). No payload.
 *
 * Guarded by a once-only flag in the view: the wallet list is requested a single time per session.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3200`), named for its one sender
 * (`CollectiblesView.as::requestWalletAddresses()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3200.as
 */
export class GetCollectibleWalletAddressesComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3200.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
