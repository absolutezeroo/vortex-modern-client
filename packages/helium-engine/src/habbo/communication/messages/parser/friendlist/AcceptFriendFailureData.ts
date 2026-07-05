import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class representing a failure when accepting a friend request.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/AcceptFriendFailureData.as
 */
export class AcceptFriendFailureData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._senderId = wrapper.readInt();
        this._errorCode = wrapper.readInt();
    }

    private _senderId: number;

    get senderId(): number
    {
        return this._senderId;
    }

    private _errorCode: number;

    get errorCode(): number
    {
        return this._errorCode;
    }
}
