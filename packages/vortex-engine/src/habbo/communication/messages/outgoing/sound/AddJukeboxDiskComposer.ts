import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Put one of the player's song disks into a jukebox slot.
 *
 * Argument order is disk id then slot number, taken from AS3's own call site —
 * `PlayListEditorWidgetHandler` sends `new _SafeCls_3368(item.diskId, item.slotNumber)` — not from
 * the composer's parameter names, which are `param1`/`param2` in every tree.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/AddJukeboxDiskComposer.as
 * (`_SafeCls_3368` in the primary tree; header 1637 from its registry)
 */
export class AddJukeboxDiskComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    constructor(diskId: number, slotNumber: number)
    {
        super();

        this._data = [diskId, slotNumber];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/AddJukeboxDiskComposer.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
