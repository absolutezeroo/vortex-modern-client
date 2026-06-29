import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send star gems to another user.
 *
 * Always sends quantity of 1 (hardcoded in AS3).
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/GiveStarGemToUserMessageComposer.as
 */
export class GiveStarGemToUserMessageComposer extends MessageComposer<[number, number]>
{
	private _data: [number, number];

	constructor(userId: number)
	{
		super();
		this._data = [userId, 1];
	}

	getMessageArray(): [number, number]
	{
		return this._data;
	}
}
