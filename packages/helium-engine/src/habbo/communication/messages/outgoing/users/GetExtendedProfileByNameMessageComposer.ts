import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetExtendedProfileByNameMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.GetExtendedProfileByNameMessageComposer
 */
export class GetExtendedProfileByNameMessageComposer extends MessageComposer<ConstructorParameters<typeof GetExtendedProfileByNameMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetExtendedProfileByNameMessageComposer>;

	constructor(userName: string)
	{
		super();

		this._data = [userName];
	}

	getMessageArray(): [string]
	{
		return this._data;
	}
}
