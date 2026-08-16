import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buy a single habbicon. Header 3980, from WIN63's own registry.
 *
 * **The name is DERIVED.** No tree and no emulator header carries these — see
 * `UserHabbiconsMessageEvent` for why. It is named for its one call site,
 * `HabbiconController.buyHabbicon()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2395/_SafeCls_3471.as
 */
export class BuyHabbiconMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(habbiconId: number)
    {
        super();

        this._data = [habbiconId];
    }

    // AS3: _SafeCls_3471.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
