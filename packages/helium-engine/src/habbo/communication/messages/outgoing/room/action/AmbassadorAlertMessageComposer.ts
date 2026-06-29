import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ambassador alert message
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/room/action/AmbassadorAlertMessageComposer.as
 */
export class AmbassadorAlertMessageComposer extends MessageComposer<ConstructorParameters<typeof AmbassadorAlertMessageComposer>>
{
	private _data: ConstructorParameters<typeof AmbassadorAlertMessageComposer>;

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
