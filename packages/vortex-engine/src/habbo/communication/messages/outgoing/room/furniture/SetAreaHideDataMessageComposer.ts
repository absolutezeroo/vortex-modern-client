import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Saves an area-hide furni's rectangle and its three flags.
 *
 * Header 1954, from WIN63's registry (`_composers[1954] = _SafeCls_3376`); the emulator
 * corroborates it as `SetAreaHideDataEvent`, which is where the class name comes from — the AS3
 * identifier is obfuscated in every tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3376.as
 */
export class SetAreaHideDataMessageComposer extends MessageComposer<[number, number, number, number, number, boolean, boolean, boolean]>
{
    // TS-only: AS3 keeps five separate fields; this port stores the composed array once.
    private _data: [number, number, number, number, number, boolean, boolean, boolean];

    // AS3: .../src/unknowns/_SafePkg_2609/_SafeCls_3376.as::_SafeCls_3376()
    constructor(
        objectId: number,
        rootX: number,
        rootY: number,
        width: number,
        length: number,
        invisibility: boolean,
        wallItems: boolean,
        invert: boolean
    )
    {
        super();

        this._data = [objectId, rootX, rootY, width, length, invisibility, wallItems, invert];
    }

    // AS3: .../src/unknowns/_SafePkg_2609/_SafeCls_3376.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number, boolean, boolean, boolean]
    {
        return this._data;
    }
}
