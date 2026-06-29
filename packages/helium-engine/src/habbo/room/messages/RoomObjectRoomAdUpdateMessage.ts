/**
 * RoomObjectRoomAdUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomAdUpdateMessage.as
 *
 * Update message for room advertisement data.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomAdUpdateMessage extends RoomObjectUpdateMessage
{
	public static readonly ROOM_AD_ACTIVATE = 'RORUM_ROOM_AD_ACTIVATE';
	public static readonly ROOM_BILLBOARD_IMAGE_LOADED = 'RORUM_ROOM_BILLBOARD_IMAGE_LOADED';
	public static readonly ROOM_BILLBOARD_LOADING_FAILED = 'RORUM_ROOM_BILLBOARD_IMAGE_LOADING_FAILED';

	constructor(
		type: string,
		asset: string,
		clickUrl: string,
		objectId: number = -1,
		bitmapData: ImageBitmap | null = null
	)
	{
		super(null, null);
		this._type = type;
		this._asset = asset;
		this._clickUrl = clickUrl;
		this._objectId = objectId;
		this._bitmapData = bitmapData;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
	}

	private _asset: string;

	get asset(): string
	{
		return this._asset;
	}

	private _clickUrl: string;

	get clickUrl(): string
	{
		return this._clickUrl;
	}

	private _objectId: number;

	get objectId(): number
	{
		return this._objectId;
	}

	private _bitmapData: ImageBitmap | null;

	get bitmapData(): ImageBitmap | null
	{
		return this._bitmapData;
	}
}
