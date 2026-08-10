import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for one forum in full, with this user's rights in it. Answered by ForumDataMessageEvent.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/groupforums/GetForumStatsMessageComposer.as
 * (`_SafeCls_3529` in the primary tree; header 3592 from its registry)
 */
export class GetForumStatsMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(groupId: number)
    {
        super();

        this._data = [groupId];
    }

    // AS3: .../groupforums/GetForumStatsMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
