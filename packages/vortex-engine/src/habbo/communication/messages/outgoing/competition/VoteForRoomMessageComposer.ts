import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * VoteForRoomMessageComposer
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/competition/VoteForRoomMessageComposer.as
 */
export class VoteForRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof VoteForRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof VoteForRoomMessageComposer>;

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
