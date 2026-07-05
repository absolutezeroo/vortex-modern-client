import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetIsUserPartOfCompetitionMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/GetIsUserPartOfCompetitionMessageComposer.as
 */
export class GetIsUserPartOfCompetitionMessageComposer extends MessageComposer<ConstructorParameters<typeof GetIsUserPartOfCompetitionMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetIsUserPartOfCompetitionMessageComposer>;

    constructor(goalCode: string)
    {
        super();

        this._data = [goalCode];
    }

    getMessageArray()
    {
        return this._data;
    }
}
