import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Start a poll session
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/poll/PollStartComposer.as
 */
export class PollStartComposer extends MessageComposer<ConstructorParameters<typeof PollStartComposer>>
{
    private _data: ConstructorParameters<typeof PollStartComposer>;

    constructor(pollId: number)
    {
        super();

        this._data = [pollId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
