import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * PlaceObjectFromCatalogComposer — buys a catalog offer and drops it straight onto a floor tile
 * (WIN63 composer header 3849). Sent by HabboCatalog when a builders-club offer is dragged into the
 * room, by InfoStandWidget for a bcOfferId, and by RoomMessageHandler.onBCPlacementWarning with
 * `confirmed = true` once the user accepts the warning.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_1996`); named after what its three call
 * sites do with it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_1996.as
 */
export class PlaceObjectFromCatalogComposer extends MessageComposer<(number | string | boolean)[]>
{
    // AS3: _SafeCls_1996.as::_SafeStr_4556
    private _data: (number | string | boolean)[];

    // AS3: _SafeCls_1996.as::_SafeCls_1996()
    constructor(
        pageId: number,
        offerId: number,
        extraParam: string,
        x: number,
        y: number,
        direction: number,
        confirmed: boolean = false
    )
    {
        super();
        this._data = [pageId, offerId, extraParam, x, y, direction, confirmed];
    }

    // AS3: _SafeCls_1996.as::getMessageArray()
    getMessageArray(): (number | string | boolean)[]
    {
        return this._data;
    }
}
