import {Texture} from 'pixi.js';
import type {ILazyAsset} from './ILazyAsset';
import type {IAsset} from './IAsset';
import type {AssetTypeDeclaration} from './AssetTypeDeclaration';
import {Logger} from '@core/utils/Logger';

/**
 * Point structure for offset
 */
export interface Point
{
    x: number;
    y: number;
}

/**
 * Rectangle structure for region
 */
export interface Rectangle
{
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * BitmapDataAsset
 *
 * Based on AS3: com.sulake.core.assets.BitmapDataAsset
 *
 * Asset that holds bitmap/image data. Supports lazy loading.
 * Uses PixiJS Texture instead of AS3 BitmapData.
 */
export class BitmapDataAsset implements ILazyAsset
{
    public name: string = '';
    private _unknown: unknown = null;
    private _bitmap: Texture | null = null;
    private readonly _declaration: AssetTypeDeclaration;
    private readonly _url: string;

    constructor(declaration: AssetTypeDeclaration, url: string = '')
    {
        this._declaration = declaration;
        this._url = url;
        BitmapDataAsset._instances++;
    }

    private static _instances: number = 0;

    static get instances(): number
    {
        return BitmapDataAsset._instances;
    }

    private static _allocatedByteCount: number = 0;

    static get allocatedByteCount(): number
    {
        return BitmapDataAsset._allocatedByteCount;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _offset: Point = {x: 0, y: 0};

    get offset(): Point
    {
        return this._offset;
    }

    private _rectangle: Rectangle | null = null;

    get rectangle(): Rectangle | null
    {
        if(!this._rectangle && this._bitmap)
        {
            this._rectangle = {
                x: 0,
                y: 0,
                width: this._bitmap.width,
                height: this._bitmap.height,
            };
        }

        return this._rectangle;
    }

    private _flipH: boolean = false;

    get flipH(): boolean
    {
        return this._flipH;
    }

    private _flipV: boolean = false;

    get flipV(): boolean
    {
        return this._flipV;
    }

    get url(): string
    {
        return this._url;
    }

    get content(): Texture | null
    {
        if(!this._bitmap)
        {
            this.prepareLazyContent();
        }

        return this._bitmap;
    }

    get declaration(): AssetTypeDeclaration
    {
        return this._declaration;
    }

    dispose(): void
    {
        if(!this._disposed)
        {
            BitmapDataAsset._instances--;

            if(this._bitmap)
            {
                try
                {
                    BitmapDataAsset._allocatedByteCount -= this._bitmap.width * this._bitmap.height * 4;
                    this._bitmap.destroy(true);
                }
                catch (_e)
                {
                }
            }

            this._unknown = null;
            this._bitmap = null;
            this._rectangle = null;
            this._disposed = true;
        }
    }

    setUnknownContent(content: unknown): void
    {
        if(content === null)
        {
            return;
        }

        if(this._bitmap && this._bitmap === content)
        {
            return;
        }

        if(this._bitmap)
        {
            this._bitmap.destroy(true);
            this._bitmap = null;
        }

        this._unknown = content;
    }

    prepareLazyContent(): void
    {
        if(this._unknown === null)
        {
            return;
        }

        if(this._unknown instanceof Texture)
        {
            this._bitmap = this._unknown;
            this._unknown = null;
            return;
        }

        if(this._unknown instanceof BitmapDataAsset)
        {
            const other = this._unknown;
            this._bitmap = other._bitmap;
            this._offset = {...other._offset};
            this._flipH = other._flipH;
            this._flipV = other._flipV;
            this._unknown = null;
            return;
        }

        if(typeof HTMLImageElement !== 'undefined' && this._unknown instanceof HTMLImageElement)
        {
            this._bitmap = Texture.from(this._unknown);
            this._unknown = null;
            return;
        }

        if(typeof ImageBitmap !== 'undefined' && this._unknown instanceof ImageBitmap)
        {
            this._bitmap = Texture.from(this._unknown);
            this._unknown = null;
            return;
        }

        if(typeof HTMLCanvasElement !== 'undefined' && this._unknown instanceof HTMLCanvasElement)
        {
            this._bitmap = Texture.from(this._unknown);
            this._unknown = null;
            return;
        }

        Logger.getLogger('BitmapDataAsset').warn('Unknown content type:', typeof this._unknown);
        this._unknown = null;
    }

    setFromOtherAsset(asset: IAsset): void
    {
        if(asset instanceof BitmapDataAsset)
        {
            this._bitmap = asset._bitmap;
            this._offset = {...asset._offset};
            return;
        }

        throw new Error('Provided asset should be of type BitmapDataAsset');
    }

    setParamsDesc(params: Map<string, string>): void
    {
        for(const [key, value] of params)
        {
            switch(key)
            {
                case 'offset':
                {
                    const parts = value.split(',');
                    this._offset.x = parseInt(parts[0], 10) || 0;
                    this._offset.y = parseInt(parts[1], 10) || 0;
                    break;
                }

                case 'region':
                {
                    const parts = value.split(',');
                    this._rectangle = {
                        x: parseInt(parts[0], 10) || 0,
                        y: parseInt(parts[1], 10) || 0,
                        width: parseInt(parts[2], 10) || 0,
                        height: parseInt(parts[3], 10) || 0,
                    };
                    break;
                }

                case 'flipH':
                    this._flipH = value === '1' || value === 'true';
                    break;

                case 'flipV':
                    this._flipV = value === '1' || value === 'true';
                    break;
            }
        }
    }
}
