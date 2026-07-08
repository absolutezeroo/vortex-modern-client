/**
 * ExtendedSprite
 *
 * Based on AS3: com.sulake.room.renderer.utils.ExtendedSprite
 *
 * Extended PixiJS Sprite used as canvas display children.
 * Stores metadata (tag, identifier, click handling) and provides
 * pixel-perfect hit testing with alpha tolerance.
 *
 * @see sources/flash_version/com/sulake/room/renderer/utils/ExtendedSprite.as
 */
import {Sprite, Texture} from 'pixi.js';

interface IAlphaHitData
{
    width: number;
    height: number;
    alpha: Uint8ClampedArray;
}

export class ExtendedSprite extends Sprite
{
    private static readonly _alphaHitCache: WeakMap<Texture, IAlphaHitData | null> = new WeakMap();

    private _updateID1: number = -1;
    private _updateID2: number = -1;
    private _spriteWidth: number = 0;
    private _spriteHeight: number = 0;

    constructor()
    {
        super();
        this.eventMode = 'none';
    }

    private _tag: string = '';

    get tag(): string
    {
        return this._tag;
    }

    set tag(value: string)
    {
        this._tag = value;
    }

    private _identifier: string = '';

    get identifier(): string
    {
        return this._identifier;
    }

    set identifier(value: string)
    {
        this._identifier = value;
    }

    private _clickHandling: boolean = false;

    get clickHandling(): boolean
    {
        return this._clickHandling;
    }

    set clickHandling(value: boolean)
    {
        this._clickHandling = value;
    }

    // AS3: sources/win63_version/room/object/visualization/IRoomObjectSprite.as::skipMouseHandling
    private _skipMouseHandling: boolean = false;

    get skipMouseHandling(): boolean
    {
        return this._skipMouseHandling;
    }

    set skipMouseHandling(value: boolean)
    {
        this._skipMouseHandling = value;
    }

    private _alphaTolerance: number = 128;

    get alphaTolerance(): number
    {
        return this._alphaTolerance;
    }

    set alphaTolerance(value: number)
    {
        this._alphaTolerance = value;
    }

    private _varyingDepth: boolean = false;

    get varyingDepth(): boolean
    {
        return this._varyingDepth;
    }

    set varyingDepth(value: boolean)
    {
        this._varyingDepth = value;
    }

    private _offsetX: number = 0;

    get offsetX(): number
    {
        return this._offsetX;
    }

    set offsetX(value: number)
    {
        this._offsetX = value;
    }

    private _offsetY: number = 0;

    get offsetY(): number
    {
        return this._offsetY;
    }

    set offsetY(value: number)
    {
        this._offsetY = value;
    }

    /**
	 * Check if the sprite needs to be updated based on instance/update IDs.
	 * Returns true if the IDs have changed (sprite data is stale).
	 *
	 * AS3: _Str_17574
	 */
    needsUpdate(instanceId: number, updateId: number): boolean
    {
        if(instanceId !== this._updateID1 || updateId !== this._updateID2)
        {
            this._updateID1 = instanceId;
            this._updateID2 = updateId;
            return true;
        }

        return false;
    }

    /**
	 * Set the texture and track dimensions.
	 * AS3: override set bitmapData
	 */
    setTexture(texture: Texture | null): void
    {
        if(texture !== null)
        {
            this._spriteWidth = texture.width;
            this._spriteHeight = texture.height;
            this.texture = texture;
        }
        else
        {
            this._spriteWidth = 0;
            this._spriteHeight = 0;
            this._updateID1 = -1;
            this._updateID2 = -1;
            this.texture = Texture.EMPTY;
        }
    }

    /**
	 * AS3: hitTest() checks bitmapData.getPixel32(x, y) alpha against alphaTolerance.
	 */
    hitTest(localX: number, localY: number): boolean
    {
        if(this._alphaTolerance > 255 || this.texture === Texture.EMPTY)
        {
            return false;
        }

        if(localX < 0 || localY < 0 || localX >= this._spriteWidth || localY >= this._spriteHeight)
        {
            return false;
        }

        const data = ExtendedSprite.getAlphaHitData(this.texture);

        if(data === null)
        {
            return true;
        }

        const frame = (this.texture as unknown as { frame?: { x: number; y: number } }).frame;
        const x = Math.floor((frame?.x ?? 0) + localX);
        const y = Math.floor((frame?.y ?? 0) + localY);

        if(x < 0 || y < 0 || x >= data.width || y >= data.height)
        {
            return false;
        }

        return data.alpha[(y * data.width + x) * 4 + 3] > this._alphaTolerance;
    }

    private static getAlphaHitData(texture: Texture): IAlphaHitData | null
    {
        if(ExtendedSprite._alphaHitCache.has(texture))
        {
            return ExtendedSprite._alphaHitCache.get(texture) ?? null;
        }

        const source = (texture as unknown as { source?: { resource?: unknown; width?: number; height?: number } }).source;
        const resource = source?.resource as CanvasImageSource | undefined;

        if(resource === undefined)
        {
            ExtendedSprite._alphaHitCache.set(texture, null);

            return null;
        }

        const width = Math.max(1, Math.ceil(Number((resource as { width?: number }).width ?? source?.width ?? texture.width)));
        const height = Math.max(1, Math.ceil(Number((resource as { height?: number }).height ?? source?.height ?? texture.height)));
        let canvas: HTMLCanvasElement | OffscreenCanvas;

        if(typeof OffscreenCanvas !== 'undefined')
        {
            canvas = new OffscreenCanvas(width, height);
        }
        else if(typeof document !== 'undefined')
        {
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
        }
        else
        {
            ExtendedSprite._alphaHitCache.set(texture, null);

            return null;
        }

        const context = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

        if(context === null)
        {
            ExtendedSprite._alphaHitCache.set(texture, null);

            return null;
        }

        try
        {
            context.clearRect(0, 0, width, height);
            context.drawImage(resource, 0, 0);

            const alphaData = {
                width,
                height,
                alpha: context.getImageData(0, 0, width, height).data
            };

            ExtendedSprite._alphaHitCache.set(texture, alphaData);

            return alphaData;
        }
        catch
        {
            ExtendedSprite._alphaHitCache.set(texture, null);

            return null;
        }
    }

    dispose(): void
    {
        this.setTexture(null);
    }
}
