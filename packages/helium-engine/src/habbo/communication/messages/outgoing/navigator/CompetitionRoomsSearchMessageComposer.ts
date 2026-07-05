import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search competition rooms
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/CompetitionRoomsSearchMessageComposer.as
 */
export class CompetitionRoomsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof CompetitionRoomsSearchMessageComposer>>
{
    private _data: ConstructorParameters<typeof CompetitionRoomsSearchMessageComposer>;

    constructor(goalId: number, pageIndex: number)
    {
        super();

        this._data = [goalId, pageIndex];
    }

    getMessageArray()
    {
        return this._data;
    }
}
