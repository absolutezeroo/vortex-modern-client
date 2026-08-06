import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Rejects a quest by its ID.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/RejectQuestMessageComposer.as
 */
export class RejectQuestMessageComposer extends MessageComposer<ConstructorParameters<typeof RejectQuestMessageComposer>>
{
    private _data: ConstructorParameters<typeof RejectQuestMessageComposer>;

    constructor(questId: number)
    {
        super();
        this._data = [questId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/RejectQuestMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
