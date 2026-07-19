/**
 * Badge image info holder
 * @see source_as_win63/habbo/session/BadgeInfo.as
 */
export class BadgeInfo
{
    constructor(image: HTMLImageElement | null, placeHolder: boolean)
    {
        this._image = image;
        this._placeHolder = placeHolder;
    }

    private _image: HTMLImageElement | null;

    get image(): HTMLImageElement | null
    {
        return this._image;
    }

    private _placeHolder: boolean;

    get placeHolder(): boolean
    {
        return this._placeHolder;
    }
}
