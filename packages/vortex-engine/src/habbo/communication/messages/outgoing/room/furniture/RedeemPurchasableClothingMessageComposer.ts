import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Redeems a clothing furni (header 3637) — the first half of the two-step outfit purchase.
 *
 * The server answers with `FigureSetIds` (1231); only when the furni's name appears in that
 * answer's `boundFurnitureNames` does the client send the actual `UpdateFigureData`. See
 * `FurnitureContextMenuWidgetHandler.redeemPurchasableClothing()`.
 *
 * The class name is **derived**, not recovered: the composer is `_SafeCls_3394` in every
 * tree, and `vortex-emulator` has no counterpart at this id.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2424/_SafeCls_3394.as
 */
export class RedeemPurchasableClothingMessageComposer extends MessageComposer<[number]>
{
    // AS3: .../_SafeCls_3394.as::_SafeCls_3394()
    constructor(objectId: number)
    {
        super();

        this._data = [objectId];
    }

    private _data: [number];

    // AS3: .../_SafeCls_3394.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
