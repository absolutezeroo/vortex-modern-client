import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ScrGetUserInfoMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.ScrGetUserInfoMessageComposer
 */
export class ScrGetUserInfoMessageComposer extends MessageComposer<ConstructorParameters<typeof ScrGetUserInfoMessageComposer>>
{
	private _data: ConstructorParameters<typeof ScrGetUserInfoMessageComposer>;

	constructor(productName: string)
	{
		super();

		this._data = [productName];
	}

	getMessageArray(): [string]
	{
		return this._data;
	}
}
