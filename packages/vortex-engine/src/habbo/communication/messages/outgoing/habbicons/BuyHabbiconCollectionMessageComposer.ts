import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buy every habbicon in a collection at the bundle price. Header 3036, from WIN63's own registry.
 *
 * **The name is DERIVED.** No tree and no emulator header carries these — see
 * `UserHabbiconsMessageEvent` for why. It is named for its one call site,
 * `HabbiconController.buyHabbiconCollection()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2395/_SafeCls_2394.as
 */
export class BuyHabbiconCollectionMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(collectionId: number)
    {
        super();

        this._data = [collectionId];
    }

    // AS3: _SafeCls_2394.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
