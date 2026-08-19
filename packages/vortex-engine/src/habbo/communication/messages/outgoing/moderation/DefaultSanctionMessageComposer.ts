import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a default sanction for an issue.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/DefaultSanctionMessageComposer.as
 */
export class DefaultSanctionMessageComposer extends MessageComposer<unknown[]>
{
    private _data: unknown[];

    /**
     * Parameter names taken from the only call site — `ModActionCtrl.onDefaultSanctionButton()`
     * sends `(targetUserId, cfhTopicId, message, issueId)`. They previously read
     * `(issueId, modActionId, message, cfhTopicId)`, which is the same wire shape with three of the
     * four meanings wrong; nothing called it yet, so nothing was mis-sent.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2384/_SafeCls_2494.as::_SafeCls_2494()
    constructor(userId: number, cfhTopicId: number, message: string, issueId: number = -1)
    {
        super();
        this._data = [userId, cfhTopicId, message];

        if(issueId !== -1)
        {
            this._data.push(issueId);
        }
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/moderator/DefaultSanctionMessageComposer.as::getMessageArray()
    getMessageArray(): unknown[]
    {
        return this._data;
    }
}
