import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests relationship status info for a user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/users/GetRelationshipStatusInfoMessageComposer.as
 */
export class GetRelationshipStatusInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof GetRelationshipStatusInfoMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetRelationshipStatusInfoMessageComposer>;

    constructor(userId: number)
    {
        super();
        this._data = [userId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
