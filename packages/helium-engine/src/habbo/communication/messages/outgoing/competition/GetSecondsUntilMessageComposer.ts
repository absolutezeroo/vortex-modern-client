import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetSecondsUntilMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/GetSecondsUntilMessageComposer.as
 */
export class GetSecondsUntilMessageComposer extends MessageComposer<ConstructorParameters<typeof GetSecondsUntilMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetSecondsUntilMessageComposer>;

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
