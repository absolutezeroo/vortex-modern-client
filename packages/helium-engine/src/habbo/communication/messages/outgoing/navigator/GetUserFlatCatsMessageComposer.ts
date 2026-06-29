import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get user's flat categories
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GetUserFlatCatsMessageComposer.as
 */
export class GetUserFlatCatsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetUserFlatCatsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetUserFlatCatsMessageComposer>;

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
