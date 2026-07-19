/**
 * Event for room ad image loading
 *
 * @see source_as_win63/habbo/advertisement/events/AdEvent.as
 */
export class AdEvent
{
    static readonly ROOM_AD_IMAGE_LOADED = 'AE_ROOM_AD_IMAGE_LOADED';
    static readonly ROOM_AD_IMAGE_LOADING_FAILED = 'AE_ROOM_AD_IMAGE_LOADING_FAILED';
    static readonly ROOM_AD_SHOW = 'AE_ROOM_AD_SHOW';

    constructor(
        type: string,
        roomId: number,
        imageUrl: string = '',
        clickUrl: string = '',
        objectId: number = -1,
        objectCategory: number = -1
    )
    {
        this._type = type;
        this._roomId = roomId;
        this._imageUrl = imageUrl;
        this._clickUrl = clickUrl;
        this._objectId = objectId;
        this._objectCategory = objectCategory;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    private _roomId: number;

    get roomId(): number
    {
        return this._roomId;
    }

    private _imageUrl: string;

    get imageUrl(): string
    {
        return this._imageUrl;
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

    private _objectCategory: number;

    get objectCategory(): number
    {
        return this._objectCategory;
    }
}
