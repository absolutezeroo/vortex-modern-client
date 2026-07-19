import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Creates a chat review session for guardian voting.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/ChatReviewSessionCreateMessageComposer.as
 */
export class ChatReviewSessionCreateMessageComposer extends MessageComposer<ConstructorParameters<typeof ChatReviewSessionCreateMessageComposer>>
{
    private _data: ConstructorParameters<typeof ChatReviewSessionCreateMessageComposer>;

    constructor(roomId: number, reportedUserId: number)
    {
        super();
        this._data = [roomId, reportedUserId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
