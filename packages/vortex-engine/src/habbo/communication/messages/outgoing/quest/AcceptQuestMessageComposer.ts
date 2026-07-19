import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Accepts a quest by its ID.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/AcceptQuestMessageComposer.as
 */
export class AcceptQuestMessageComposer extends MessageComposer<ConstructorParameters<typeof AcceptQuestMessageComposer>>
{
    private _data: ConstructorParameters<typeof AcceptQuestMessageComposer>;

    constructor(questId: number)
    {
        super();
        this._data = [questId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
