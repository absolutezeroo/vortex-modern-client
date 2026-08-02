import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Names the outfit a mannequin is wearing (header 606).
 *
 * The class name is **derived**, not recovered: the composer is
 * `_SafePkg_2609/_SafeCls_2951` in every tree. It matches `vortex-emulator`'s
 * `SetMannequinNameEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2951.as
 */
export class SetMannequinNameMessageComposer extends MessageComposer<[number, string]>
{
    // AS3: .../_SafePkg_2609/_SafeCls_2951.as::_SafeCls_2951()
    constructor(objectId: number, name: string)
    {
        super();

        this._data = [objectId, name];
    }

    private _data: [number, string];

    // AS3: .../_SafePkg_2609/_SafeCls_2951.as::getMessageArray()
    getMessageArray(): [number, string]
    {
        return this._data;
    }
}
