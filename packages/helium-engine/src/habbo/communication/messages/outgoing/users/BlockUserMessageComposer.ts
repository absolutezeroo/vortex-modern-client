import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Block a user.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/users/BlockUserMessageComposer.as
 */
export class BlockUserMessageComposer extends MessageComposer<ConstructorParameters<typeof BlockUserMessageComposer>>
{
	private _data: ConstructorParameters<typeof BlockUserMessageComposer>;

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
