import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the whole shop. Sent once at first open, and again after any purchase. Header 272, from WIN63's own registry.
 *
 * **The name is DERIVED.** No tree and no emulator header carries these — see
 * `UserHabbiconsMessageEvent` for why. It is named for its one call site,
 * `HabbiconController.getShopData()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2395/_SafeCls_2718.as
 */
export class GetHabbiconShopDataMessageComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    // AS3: _SafeCls_2718.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}
