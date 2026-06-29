import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ban a user from the room with a duration
 *
 * Based on AS3: com.sulake.habbo.communication.messages.outgoing.room.action.BanUserWithDurationMessageComposer
 */
export class BanUserWithDurationMessageComposer extends MessageComposer<[number, number, number]>
{
	private _data: [number, number, number];

	constructor(userId: number, banType: number, roomId: number)
	{
		super();
		this._data = [userId, banType, roomId];
	}

	getMessageArray(): [number, number, number]
	{
		return this._data;
	}
}
