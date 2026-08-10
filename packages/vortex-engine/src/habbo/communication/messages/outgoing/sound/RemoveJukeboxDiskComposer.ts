import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Take whatever disk sits in a jukebox slot back out of it. The slot is identified, not the disk —
 * AS3 sends `new _SafeCls_3444(item.slotNumber)`.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/RemoveJukeboxDiskComposer.as
 * (`_SafeCls_3444` in the primary tree; header 2003 from its registry)
 */
export class RemoveJukeboxDiskComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(slotNumber: number)
    {
        super();

        this._data = [slotNumber];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/RemoveJukeboxDiskComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
