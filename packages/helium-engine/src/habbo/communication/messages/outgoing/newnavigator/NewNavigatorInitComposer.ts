import {MessageComposer} from '@core/communication/messages/MessageComposer';


/**
 * Sent when the navigator is initialized to request metadata
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/newnavigator/NewNavigatorInitComposer.as
 */
export class NewNavigatorInitComposer extends MessageComposer<ConstructorParameters<typeof NewNavigatorInitComposer>>
{
	private _data: ConstructorParameters<typeof NewNavigatorInitComposer>;

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
