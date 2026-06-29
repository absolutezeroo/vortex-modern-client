import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests to follow a friend to their current room.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/FollowFriendMessageComposer.as
 */
export class FollowFriendMessageComposer extends MessageComposer<ConstructorParameters<typeof FollowFriendMessageComposer>>
{
	private _data: ConstructorParameters<typeof FollowFriendMessageComposer>;

	constructor(friendId: number)
	{
		super();
		this._data = [friendId];
	}

	getMessageArray()
	{
		return this._data;
	}
}
