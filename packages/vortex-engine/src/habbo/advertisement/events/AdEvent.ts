/**
 * Event for room ad image loading
 *
 * @see source_as_win63/habbo/advertisement/events/AdEvent.as
 */
export class AdEvent
{
    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::ROOM_AD_IMAGE_LOADED
    static readonly ROOM_AD_IMAGE_LOADED = 'AE_ROOM_AD_IMAGE_LOADED';
    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::ROOM_AD_IMAGE_LOADING_FAILED
    static readonly ROOM_AD_IMAGE_LOADING_FAILED = 'AE_ROOM_AD_IMAGE_LOADING_FAILED';
    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::ROOM_AD_SHOW
    static readonly ROOM_AD_SHOW = 'AE_ROOM_AD_SHOW';

    /**
	 * DEVIATION: AS3's last two parameters are `flash.events.Event`'s own `bubbles`/`cancelable`,
	 *   passed straight to `super()`. This port's events are plain objects on an EventEmitter and
	 *   neither has anywhere to go, so the parameter list stops at `objectCategory`.
	 */
    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::AdEvent()
    constructor(
        type: string,
        roomId: number,
        image: ImageBitmap | null = null,
        imageUrl: string = '',
        clickUrl: string = '',
        adWarningL: ImageBitmap | null = null,
        adWarningR: ImageBitmap | null = null,
        objectId: number = -1,
        objectCategory: number = -1
    )
    {
        this._type = type;
        this._roomId = roomId;
        this._image = image;
        this._imageUrl = imageUrl;
        this._clickUrl = clickUrl;
        this._adWarningL = adWarningL;
        this._adWarningR = adWarningR;
        this._objectId = objectId;
        this._objectCategory = objectCategory;
    }

    /**
	 * The decoded billboard image.
	 *
	 * This is the payload the whole event exists for: `RoomEngine.onRoomAdImageLoaded()` registers
	 * it as a graphic asset under `imageUrl` before the visualization is told to use it, so a
	 * null here renders the billboard blank however well the rest of the flow works.
	 */
    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::_image
    private _image: ImageBitmap | null;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get image()
    get image(): ImageBitmap | null
    {
        return this._image;
    }

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::_adWarningL
    private _adWarningL: ImageBitmap | null;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get adWarningL()
    get adWarningL(): ImageBitmap | null
    {
        return this._adWarningL;
    }

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::_adWarningR
    private _adWarningR: ImageBitmap | null;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get adWarningR()
    get adWarningR(): ImageBitmap | null
    {
        return this._adWarningR;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/events/AdEvent.as::_roomId
    private _roomId: number;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/events/AdEvent.as::_imageUrl
    private _imageUrl: string;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get imageUrl()
    get imageUrl(): string
    {
        return this._imageUrl;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/events/AdEvent.as::_clickUrl
    private _clickUrl: string;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get clickUrl()
    get clickUrl(): string
    {
        return this._clickUrl;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/events/AdEvent.as::_objectId
    private _objectId: number;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/events/AdEvent.as::_objectCategory
    private _objectCategory: number;

    // AS3: .../src/com/sulake/habbo/advertisement/events/AdEvent.as::get objectCategory()
    get objectCategory(): number
    {
        return this._objectCategory;
    }
}
