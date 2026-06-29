import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetSelectedBadgesMessageComposer
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.users.GetSelectedBadgesMessageComposer
 */
export class GetSelectedBadgesMessageComposer extends MessageComposer<ConstructorParameters<typeof GetSelectedBadgesMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetSelectedBadgesMessageComposer>;

	constructor(userId: number)
	{
		super();

		this._data = [userId];
	}

	getMessageArray(): [number]
	{
		return this._data;
	}
}
