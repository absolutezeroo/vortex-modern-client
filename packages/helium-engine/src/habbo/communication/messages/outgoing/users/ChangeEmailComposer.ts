import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ChangeEmailComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ChangeEmailComposer
 */
export class ChangeEmailComposer extends MessageComposer<ConstructorParameters<typeof ChangeEmailComposer>>
{
	private _data: ConstructorParameters<typeof ChangeEmailComposer>;

	constructor(email: string)
	{
		super();

		this._data = [email];
	}

	getMessageArray(): [string]
	{
		return this._data;
	}
}
