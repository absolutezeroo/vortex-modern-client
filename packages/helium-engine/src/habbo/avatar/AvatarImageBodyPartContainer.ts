import type {Texture} from 'pixi.js';

/**
 * Container for a rendered avatar body part image.
 * Holds the composited texture, registration point, offset, and cacheability flag.
 *
 * @see sources/win63_version/habbo/avatar/AvatarImageBodyPartContainer.as
 */
export class AvatarImageBodyPartContainer
{
    constructor(
        image: Texture | null,
        regPoint: { x: number; y: number },
        isCacheable: boolean,
        faceOffset: { x: number; y: number } | null = null
    )
    {
        this._offset = {x: 0, y: 0};
        this._image = image;
        this._regPoint = {x: regPoint.x, y: regPoint.y};
        this._isCacheable = isCacheable;
        this._faceOffset = faceOffset;
        this.cleanPoints();
    }

    private _image: Texture | null;

    /**
	 * The rendered texture for this body part.
	 */
    public get image(): Texture | null
    {
        return this._image;
    }

    /**
	 * Sets the rendered texture, disposing the previous one if different.
	 */
    public set image(value: Texture | null)
    {
        if(this._image && this._image !== value)
        {
            this._image.destroy();
        }

        this._image = value;
    }

    private _regPoint: { x: number; y: number };

    /**
	 * The combined registration point (regPoint + offset).
	 */
    public get regPoint(): { x: number; y: number }
    {
        return {
            x: this._regPoint.x + this._offset.x,
            y: this._regPoint.y + this._offset.y
        };
    }

    private _offset: { x: number; y: number };

    /**
	 * Sets the offset and rounds coordinates.
	 */
    public set offset(value: { x: number; y: number })
    {
        this._offset = {x: value.x, y: value.y};
        this.cleanPoints();
    }

    private _isCacheable: boolean;

    /**
	 * Whether this body part container can be cached.
	 */
    public get isCacheable(): boolean
    {
        return this._isCacheable;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/AvatarImageBodyPartContainer.as::faceOffset
    private _faceOffset: { x: number; y: number } | null;

    /**
	 * The face part's own offset (only set on the "head" container's face part), used
	 * for chat-bubble placement.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/AvatarImageBodyPartContainer.as::get faceOffset()
    public get faceOffset(): { x: number; y: number } | null
    {
        return this._faceOffset;
    }

    /**
	 * Sets the registration point and rounds coordinates.
	 */
    public setRegPoint(point: { x: number; y: number }): void
    {
        this._regPoint = {x: point.x, y: point.y};
        this.cleanPoints();
    }

    /**
	 * Disposes the texture and nullifies references.
	 */
    public dispose(): void
    {
        if(this._image)
        {
            this._image.destroy();
        }

        this._image = null;
        this._regPoint = null!;
        this._offset = null!;
    }

    /**
	 * Rounds all point coordinates to integers (mimics AS3 int() cast).
	 */
    private cleanPoints(): void
    {
        this._regPoint.x = Math.trunc(this._regPoint.x);
        this._regPoint.y = Math.trunc(this._regPoint.y);
        this._offset.x = Math.trunc(this._offset.x);
        this._offset.y = Math.trunc(this._offset.y);
    }
}
