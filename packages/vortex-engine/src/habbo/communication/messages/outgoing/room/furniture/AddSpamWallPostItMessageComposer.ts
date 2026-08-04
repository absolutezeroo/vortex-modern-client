import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AddSpamWallPostItMessageComposer (header 2684)
 *
 * The finished note: where it hangs, what colour it is and what it says.
 *
 * Note the constructor takes colour before text while the wire carries them in that same
 * order - AS3 assigns its two string fields out of order in the constructor body and then
 * pushes them the right way round, so the tuple below is the wire order, not the argument
 * order of the AS3 constructor read top to bottom.
 *
 * Name recovered from the emulator's `AddSpamWallPostItMessageEvent = 2684`, whose comment
 * records that an earlier fix mistook the incoming class for this one; the AS3 composer is
 * obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3639.as
 */
export class AddSpamWallPostItMessageComposer extends MessageComposer<[number, string, string, string]>
{
    // AS3: .../_SafeCls_3639.as::getMessageArray()
    private _data: [number, string, string, string];

    // AS3: .../_SafeCls_3639.as::_SafeCls_3639()
    constructor(itemId: number, location: string, colorHex: string, text: string)
    {
        super();

        this._data = [itemId, location, colorHex, text];
    }

    // AS3: .../_SafeCls_3639.as::getMessageArray()
    getMessageArray(): [number, string, string, string]
    {
        return this._data;
    }
}
