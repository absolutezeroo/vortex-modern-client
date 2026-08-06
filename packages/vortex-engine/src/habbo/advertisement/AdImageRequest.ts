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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/AdImageRequest.as::_roomId
    private _roomId: number;

    // AS3: .../src/com/sulake/habbo/advertisement/AdImageRequest.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/AdImageRequest.as::_objectId
    private _objectId: number;

    // AS3: .../src/com/sulake/habbo/advertisement/AdImageRequest.as::get objectId()
    get objectId(): number
    {
        return this._objectId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/AdImageRequest.as::_objectCategory
    private _objectCategory: number;

    // AS3: .../src/com/sulake/habbo/advertisement/AdImageRequest.as::get objectCategory()
    get objectCategory(): number
    {
        return this._objectCategory;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/AdImageRequest.as::_imageURL
    private _imageURL: string;

    // AS3: .../src/com/sulake/habbo/advertisement/AdImageRequest.as::get imageURL()
    get imageURL(): string
    {
        return this._imageURL;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/AdImageRequest.as::_clickURL
    private _clickURL: string;

    // AS3: .../src/com/sulake/habbo/advertisement/AdImageRequest.as::get clickURL()
    get clickURL(): string
    {
        return this._clickURL;
    }
}
