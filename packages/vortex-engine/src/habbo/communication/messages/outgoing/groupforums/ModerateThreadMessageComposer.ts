import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Set a thread's moderation state — hide it, restore it, or mark it resolved.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/ModerateThreadMessageComposer.as
 * (`_SafeCls_2730` in the primary tree; header 3320 from its registry)
 */
export class ModerateThreadMessageComposer extends MessageComposer<[number, number, number]>
{
    private _data: [number, number, number];

    constructor(groupId: number, threadId: number, state: number)
    {
        super();

        this._data = [groupId, threadId, state];
    }

    // AS3: .../groupforums/ModerateThreadMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number]
    {
        return this._data;
    }
}
