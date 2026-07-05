import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ForwardToACompetitionRoomMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/ForwardToACompetitionRoomMessageComposer.as
 */
export class ForwardToACompetitionRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof ForwardToACompetitionRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof ForwardToACompetitionRoomMessageComposer>;

    constructor(goalCode: string, direction: number)
    {
        super();

        this._data = [goalCode, direction];
    }

    getMessageArray()
    {
        return this._data;
    }
}
