import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a page of threads in one forum.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetThreadsMessageComposer.as
 * (`_SafeCls_2948` in the primary tree; header 3668 from its registry)
 */
export class GetThreadsMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(groupId: number, startIndex: number, amount: number)
    {
        super();

        this._data = [groupId, startIndex, amount];
    }

    // AS3: .../groupforums/GetThreadsMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
