import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request current income/reward status from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/IncomeRewardStatusMessageComposer.as
 */
export class IncomeRewardStatusMessageComposer extends MessageComposer<[]>
{
	private _data: [] = [];

	constructor()
	{
		super();
	}

	getMessageArray(): []
	{
		return this._data;
	}
}
