import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Moves the player's NFTs out to an external wallet (WIN63 header 1749).
 *
 * Sent from `TransferNftsTab.as::onTransferConfirm()` once the confirmation dialog returns WE_OK.
 * The emulator declares no constant for 1749.
 *
 * Name RECOVERED from sources/win63_version/habbo/communication/messages/outgoing/collectibles/NftTransferAssetsMessageComposer.as
 * — that tree is obfuscated too, but it is the one where messages keep readable *filenames*.
 * (The port drops AS3's "Message" infix from composer names, as it does throughout.)
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_2756.as
 */
export class NftTransferAssetsComposer extends MessageComposer<[string]>
{
    // AS3: _SafeCls_2756.as::_SafeStr_4642
    private _data: [string];

    // AS3: _SafeCls_2756.as::_SafeCls_2756()
    constructor(wallet: string)
    {
        super();

        this._data = [wallet];
    }

    // AS3: _SafeCls_2756.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
