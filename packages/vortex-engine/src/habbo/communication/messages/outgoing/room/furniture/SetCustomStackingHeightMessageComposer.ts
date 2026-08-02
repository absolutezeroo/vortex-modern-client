import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sets a furni's custom stacking height (header 3045).
 *
 * The payload is variable: `[objectId, height]` for a plain height, `[objectId, height,
 * multiWalkMode]` for a magic walk tile, and `[objectId, -100]` for "on top of the stack".
 * AS3 takes the array whole rather than named arguments, so this does too.
 *
 * The class name is **derived**, not recovered: the composer is
 * `_SafePkg_2609/_SafeCls_2880` in every tree. It matches `vortex-emulator`'s
 * `SetCustomStackingHeightEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2880.as
 */
export class SetCustomStackingHeightMessageComposer extends MessageComposer<unknown[]>
{
    // AS3: .../_SafePkg_2609/_SafeCls_2880.as::_SafeCls_2880()
    constructor(data: unknown[])
    {
        super();

        this._data = data;
    }

    private _data: unknown[];

    // AS3: .../_SafePkg_2609/_SafeCls_2880.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
