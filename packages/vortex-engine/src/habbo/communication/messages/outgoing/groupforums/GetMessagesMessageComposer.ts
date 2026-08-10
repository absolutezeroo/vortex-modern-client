import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a page of posts inside one thread.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetMessagesMessageComposer.as
 * (`_SafeCls_2438` in the primary tree; header 225 from its registry)
 */
export class GetMessagesMessageComposer extends MessageComposer<[number, number, number, number]>
{
    private _data: [number, number, number, number];

    constructor(groupId: number, threadId: number, startIndex: number, amount: number)
    {
        super();

        this._data = [groupId, threadId, startIndex, amount];
    }

    // AS3: .../groupforums/GetMessagesMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
