import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Set one post's moderation state.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/ModerateMessageMessageComposer.as
 * (`_SafeCls_2984` in the primary tree; header 3373 from its registry)
 */
export class ModerateMessageMessageComposer extends MessageComposer<[number, number, number, number]>
{
    private _data: [number, number, number, number];

    constructor(groupId: number, threadId: number, messageId: number, state: number)
    {
        super();

        this._data = [groupId, threadId, messageId, state];
    }

    // AS3: .../groupforums/ModerateMessageMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
