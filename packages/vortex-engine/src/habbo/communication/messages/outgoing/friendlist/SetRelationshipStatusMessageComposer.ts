import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sets the relationship status with a friend.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/SetRelationshipStatusMessageComposer.as
 */
export class SetRelationshipStatusMessageComposer extends MessageComposer<ConstructorParameters<typeof SetRelationshipStatusMessageComposer>>
{
    private _data: ConstructorParameters<typeof SetRelationshipStatusMessageComposer>;

    constructor(friendId: number, relationshipStatus: number)
    {
        super();
        this._data = [friendId, relationshipStatus];
    }

    getMessageArray()
    {
        return this._data;
    }
}
