import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sends a friend request to a user by name.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/RequestFriendMessageComposer.as
 */
export class RequestFriendMessageComposer extends MessageComposer<ConstructorParameters<typeof RequestFriendMessageComposer>>
{
	private _data: ConstructorParameters<typeof RequestFriendMessageComposer>;

	constructor(userName: string)
	{
		super();
		this._data = [userName];
	}

	getMessageArray()
	{
		return this._data;
	}
}
