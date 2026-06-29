import {
	SetRoomSessionTagsMessageComposer
} from '@habbo/communication/messages/outgoing/navigator/SetRoomSessionTagsMessageComposer';

/**
 * Holds a pair of room session tags and produces the composer to send them.
 *
 * @see source_as_win63/habbo/navigator/domain/RoomSessionTags.as
 */
export class RoomSessionTags
{
	private _tag1: string;
	private _tag2: string;

	constructor(tag1: string, tag2: string)
	{
		this._tag1 = tag1;
		this._tag2 = tag2;
	}

	getMsg(): SetRoomSessionTagsMessageComposer
	{
		return new SetRoomSessionTagsMessageComposer(this._tag1, this._tag2);
	}
}
