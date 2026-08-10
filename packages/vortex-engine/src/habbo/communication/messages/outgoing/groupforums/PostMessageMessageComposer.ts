import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Post to a forum. A threadId of 0 starts a new thread and uses `subject` as its header; a non-zero one replies to that thread and AS3 sends an empty subject.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/PostMessageMessageComposer.as
 * (`_SafeCls_3231` in the primary tree; header 2811 from its registry)
 */
export class PostMessageMessageComposer extends MessageComposer<[number, number, string, string]>
{
    private _data: [number, number, string, string];

    constructor(groupId: number, threadId: number, subject: string, message: string)
    {
        super();

        this._data = [groupId, threadId, subject, message];
    }

    // AS3: .../groupforums/PostMessageMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, string, string]
    {
        return this._data;
    }
}
