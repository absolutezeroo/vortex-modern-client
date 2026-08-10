import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a single thread, by id.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetThreadMessageComposer.as
 * (`_SafeCls_2586` in the primary tree; header 3218 from its registry)
 */
export class GetThreadMessageComposer extends MessageComposer<[number, number]>
{
    private _data: [number, number];

    constructor(groupId: number, threadId: number)
    {
        super();

        this._data = [groupId, threadId];
    }

    // AS3: .../groupforums/GetThreadMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
