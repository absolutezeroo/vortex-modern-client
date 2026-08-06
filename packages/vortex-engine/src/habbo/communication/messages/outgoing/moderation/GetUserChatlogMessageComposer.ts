import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the chatlog for a specific user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetUserChatlogMessageComposer.as
 */
export class GetUserChatlogMessageComposer extends MessageComposer<ConstructorParameters<typeof GetUserChatlogMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetUserChatlogMessageComposer>;

    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/moderator/GetUserChatlogMessageComposer.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
