/**
 * RoomObjectItemDataUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectItemDataUpdateMessage.as
 *
 * Update message for item data (e.g. stickie content).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectItemDataUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(itemData: string)
	{
		super(null, null);
		this._itemData = itemData;
	}

	private _itemData: string;

	get itemData(): string
	{
		return this._itemData;
	}
}
