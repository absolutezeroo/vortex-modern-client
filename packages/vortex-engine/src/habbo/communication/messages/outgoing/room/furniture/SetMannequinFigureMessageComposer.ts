import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Copies the player's current outfit onto a mannequin (header 2301).
 *
 * The class name is **derived**, not recovered: the composer is
 * `_SafePkg_2609/_SafeCls_3948` in every tree. It matches `vortex-emulator`'s
 * `SetMannequinFigureEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3948.as
 */
export class SetMannequinFigureMessageComposer extends MessageComposer<[number]>
{
    // AS3: .../_SafePkg_2609/_SafeCls_3948.as::_SafeCls_3948()
    constructor(objectId: number)
    {
        super();

        this._data = [objectId];
    }

    private _data: [number];

    // AS3: .../_SafePkg_2609/_SafeCls_3948.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
