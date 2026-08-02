import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Nudges a furni to the next stacking height above or below the one it is at (header 3315) —
 * the two arrow buttons on the custom-stack-height widget. `down` is true for the lower one.
 *
 * The class name is **derived**, not recovered: the composer is
 * `_SafePkg_2609/_SafeCls_3040` in every tree, and `vortex-emulator` has no counterpart at
 * this id at all — the server ignores it today.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3040.as
 */
export class MoveFurnitureToAdjacentHeightMessageComposer extends MessageComposer<[number, boolean]>
{
    // AS3: .../_SafePkg_2609/_SafeCls_3040.as::_SafeCls_3040()
    constructor(objectId: number, down: boolean)
    {
        super();

        this._data = [objectId, down];
    }

    private _data: [number, boolean];

    // AS3: .../_SafePkg_2609/_SafeCls_3040.as::getMessageArray()
    getMessageArray(): [number, boolean]
    {
        return this._data;
    }
}
