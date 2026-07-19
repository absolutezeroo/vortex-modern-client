import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reject a poll
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/poll/PollRejectComposer.as
 */
export class PollRejectComposer extends MessageComposer<ConstructorParameters<typeof PollRejectComposer>>
{
    private _data: ConstructorParameters<typeof PollRejectComposer>;

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
