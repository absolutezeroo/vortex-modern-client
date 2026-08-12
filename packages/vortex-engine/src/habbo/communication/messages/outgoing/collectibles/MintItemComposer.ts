import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Mints one owned furni into a collectible (WIN63 header 2815).
 *
 * The id is the *first* inventory copy of the selected type — AS3 takes `getIdsInInventory(...)[0]`
 * and mints that one, so which physical copy is consumed is not the player's choice.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3740`), named for its one sender
 * (`MintInventoryListTab.as::onCollectConfirmDialogConfirm()`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3740.as
 */
export class MintItemComposer extends MessageComposer<[number, string]>
{
    // AS3: _SafeCls_3740.as::_SafeStr_4642
    private _data: [number, string];

    // AS3: _SafeCls_3740.as::_SafeCls_3740()
    constructor(itemId: number, wallet: string)
    {
        super();

        this._data = [itemId, wallet];
    }

    // AS3: _SafeCls_3740.as::getMessageArray()
    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
