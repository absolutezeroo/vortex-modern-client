import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Mark threads as read, in a batch.
 *
 * Unlike every other forum composer this one is built empty and filled by repeated `add()` calls,
 * then sent once. The payload's first slot is the entry count and each entry appends three more
 * values, which is why `add()` increments slot 0 rather than the array length being used.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/UpdateForumReadMarkerMessageComposer.as
 * (`_SafeCls_3696` in the primary tree; header 429 from its registry — win63_version's own
 * registry says 3611, that build's id.)
 */
export class UpdateForumReadMarkerMessageComposer extends MessageComposer<Array<number | boolean>>
{
    private _data: Array<number | boolean> = [0];

    // AS3: .../groupforums/UpdateForumReadMarkerMessageComposer.as::add()
    add(groupId: number, threadId: number, read: boolean): void
    {
        this._data.push(groupId, threadId, read);
        this._data[0] = (this._data[0] as number) + 1;
    }

    // AS3: .../groupforums/UpdateForumReadMarkerMessageComposer.as::get size()
    get size(): number
    {
        return this._data[0] as number;
    }

    // AS3: .../groupforums/UpdateForumReadMarkerMessageComposer.as::getMessageArray()
    getMessageArray(): Array<number | boolean>
    {
        return this._data;
    }
}
