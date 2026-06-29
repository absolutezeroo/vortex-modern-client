/**
 * RoomObjectModelDataUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectModelDataUpdateMessage.as
 *
 * Update message for model key-value data on room objects.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectModelDataUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(numberKey: string, numberValue: number)
	{
		super(null, null);
		this._numberKey = numberKey;
		this._numberValue = numberValue;
	}

	private _numberKey: string;

	get numberKey(): string
	{
		return this._numberKey;
	}

	private _numberValue: number;

	get numberValue(): number
	{
		return this._numberValue;
	}
}
