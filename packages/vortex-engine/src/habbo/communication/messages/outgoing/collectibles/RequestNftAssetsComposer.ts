import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for the player's collectible assets (WIN63 header 1646). No payload.
 *
 * Sent once per trade session: `CollectiblesModel` guards it behind a flag it clears when a trade
 * opens, so switching between tabs does not re-request the whole inventory.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3488`), named for
 * `CollectiblesModel.requestNftAssets()`, its only sender.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2742/_SafeCls_3488.as
 */
export class RequestNftAssetsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3488.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
