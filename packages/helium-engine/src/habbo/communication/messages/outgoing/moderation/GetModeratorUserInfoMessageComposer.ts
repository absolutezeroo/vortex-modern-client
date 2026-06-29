import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests detailed user information for moderators.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetModeratorUserInfoMessageComposer.as
 */
export class GetModeratorUserInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof GetModeratorUserInfoMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetModeratorUserInfoMessageComposer>;

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
