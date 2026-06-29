import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Unignore a user.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/users/UnignoreUserMessageComposer.as
 */
export class UnignoreUserMessageComposer extends MessageComposer<ConstructorParameters<typeof UnignoreUserMessageComposer>>
{
	private _data: ConstructorParameters<typeof UnignoreUserMessageComposer>;

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
