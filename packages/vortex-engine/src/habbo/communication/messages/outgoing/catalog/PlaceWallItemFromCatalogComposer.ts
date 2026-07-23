import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * PlaceWallItemFromCatalogComposer — the wall counterpart of PlaceObjectFromCatalogComposer (WIN63
 * composer header 2740): the tile coordinates are replaced by the wall location string.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_1748`); named after what its three call
 * sites do with it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_1748.as
 */
export class PlaceWallItemFromCatalogComposer extends MessageComposer<(number | string | boolean)[]>
{
    // AS3: _SafeCls_1748.as::_SafeStr_4556
    private _data: (number | string | boolean)[];

    // AS3: _SafeCls_1748.as::_SafeCls_1748()
    constructor(
        pageId: number,
        offerId: number,
        extraParam: string,
        wallLocation: string,
        confirmed: boolean = false
    )
    {
        super();
        this._data = [pageId, offerId, extraParam, wallLocation, confirmed];
    }

    // AS3: _SafeCls_1748.as::getMessageArray()
    getMessageArray(): (number | string | boolean)[]
    {
        return this._data;
    }
}
