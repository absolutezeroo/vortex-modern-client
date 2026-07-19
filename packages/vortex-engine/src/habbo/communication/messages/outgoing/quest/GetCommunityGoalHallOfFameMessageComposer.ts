import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the community goal hall of fame for a given code.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetCommunityGoalHallOfFameMessageComposer.as
 */
export class GetCommunityGoalHallOfFameMessageComposer extends MessageComposer<ConstructorParameters<typeof GetCommunityGoalHallOfFameMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCommunityGoalHallOfFameMessageComposer>;

    constructor(code: string)
    {
        super();
        this._data = [code];
    }

    getMessageArray()
    {
        return this._data;
    }
}
