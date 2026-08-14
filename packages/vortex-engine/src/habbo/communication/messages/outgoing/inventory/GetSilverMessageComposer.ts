import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask the server for the player's silver balance.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/GetSilverMessageComposer.as
 *
 * Header 394, from WIN63's own registry (`_SafeCls_2046.as::_composers[394]`), where this class is
 * one of the few that survived obfuscation with its real name. Sent once from
 * `HabboInventory.initComponent()`, exactly as in AS3 — empty payload, the server answers with the
 * balance.
 */
export class GetSilverMessageComposer extends MessageComposer<ConstructorParameters<typeof GetSilverMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetSilverMessageComposer>;

    constructor()
    {
        super();

        this._data = [];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/GetSilverMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
