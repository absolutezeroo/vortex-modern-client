import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Withdraw credits from the credit vault.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/WithdrawCreditVaultMessageComposer.as
 */
export class WithdrawCreditVaultMessageComposer extends MessageComposer<[]>
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
