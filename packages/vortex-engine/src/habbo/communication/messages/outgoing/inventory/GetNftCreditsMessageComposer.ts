import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask the server for the player's NFT credit balance.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/GetNftCreditsMessageComposer.as
 *
 * Header 2069, from WIN63's own registry (`_SafeCls_2046.as::_composers[2069]`), where this class
 * kept its real name. Sent once from `HabboInventory.initComponent()`, immediately before
 * {@link GetSilverMessageComposer} — empty payload, same shape.
 */
export class GetNftCreditsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetNftCreditsMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetNftCreditsMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/GetNftCreditsMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
