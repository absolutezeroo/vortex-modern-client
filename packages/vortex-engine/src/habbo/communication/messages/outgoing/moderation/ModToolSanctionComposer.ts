import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a mod tool sanction request.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/ModToolSanctionComposer.as
 */
export class ModToolSanctionComposer extends MessageComposer<ConstructorParameters<typeof ModToolSanctionComposer>>
{
    private _data: ConstructorParameters<typeof ModToolSanctionComposer>;

    /**
     * Parameter names taken from the only call site —
     * `IssueManager.requestSanctionDataForAccount()` sends `(-1, accountId, cfhTopicId)`. They
     * previously read `(issueId, sanctionTypeId, userId)`: same wire shape, wrong meanings.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2384/_SafeCls_3255.as::_SafeCls_3255()
    constructor(issueId: number, accountId: number, cfhTopicId: number)
    {
        super();
        this._data = [issueId, accountId, cfhTopicId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/moderator/ModToolSanctionComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
