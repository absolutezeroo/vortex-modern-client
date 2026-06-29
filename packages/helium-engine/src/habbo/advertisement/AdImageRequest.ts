/**
 * Data object for a billboard ad image load request
 *
 * @see source_as_win63/habbo/advertisement/AdImageRequest.as
 */
export class AdImageRequest
{
	constructor(roomId: number, imageURL: string = '', clickURL: string = '', objectId: number = -1, objectCategory: number = -1)
	{
		this._roomId = roomId;
		this._objectId = objectId;
		this._objectCategory = objectCategory;
		this._imageURL = imageURL;
		this._clickURL = clickURL;
	}

	private _roomId: number;

	get roomId(): number
	{
		return this._roomId;
	}

	private _objectId: number;

	get objectId(): number
	{
		return this._objectId;
	}

	private _objectCategory: number;

	get objectCategory(): number
	{
		return this._objectCategory;
	}

	private _imageURL: string;

	get imageURL(): string
	{
		return this._imageURL;
	}

	private _clickURL: string;

	get clickURL(): string
	{
		return this._clickURL;
	}
}
