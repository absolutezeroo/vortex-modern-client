import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request blocked users list.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/users/BlockListInitComposer.as
 */
export class BlockListInitComposer extends MessageComposer<ConstructorParameters<typeof BlockListInitComposer>>
{
	private _data: ConstructorParameters<typeof BlockListInitComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}
}
