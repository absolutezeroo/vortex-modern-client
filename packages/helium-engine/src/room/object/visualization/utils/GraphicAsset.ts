/**
 * GraphicAsset
 *
 * @see com.sulake.room.object.visualization.utils.GraphicAsset
 *
 * Concrete implementation of IGraphicAsset with object pooling.
 * Wraps a PixiJS Texture with flip/offset metadata.
 */
import type {Texture} from 'pixi.js';
import type {IGraphicAsset} from './IGraphicAsset';

export class GraphicAsset implements IGraphicAsset
{
	private static _pool: GraphicAsset[] = [];
	private _initialized: boolean = false;

	private _assetName: string = '';

	get assetName(): string
	{
		return this._assetName;
	}

	private _libraryAssetName: string = '';

	get libraryAssetName(): string
	{
		return this._libraryAssetName;
	}

	private _texture: Texture | null = null;

	get texture(): Texture | null
	{
		return this._texture;
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

	private _usesPalette: boolean = false;

	get usesPalette(): boolean
	{
		return this._usesPalette;
	}

	private _offsetX: number = 0;

	get offsetX(): number
	{
		if (!this._flipH)
		{
			return this._offsetX;
		}

		return -(this.width + this._offsetX);
	}

	private _offsetY: number = 0;

	get offsetY(): number
	{
		if (!this._flipV)
		{
			return this._offsetY;
		}

		return -(this.height + this._offsetY);
	}

	private _width: number = 0;

	get width(): number
	{
		this.initialize();
		return this._width;
	}

	private _height: number = 0;

	get height(): number
	{
		this.initialize();
		return this._height;
	}

	get originalOffsetX(): number
	{
		return this._offsetX;
	}

	get originalOffsetY(): number
	{
		return this._offsetY;
	}

	/**
	 * Allocate a GraphicAsset from the object pool or create a new one.
	 */
	static allocate(
		assetName: string,
		libraryAssetName: string,
		texture: Texture | null,
		flipH: boolean,
		flipV: boolean,
		offsetX: number,
		offsetY: number,
		usesPalette: boolean = false
	): GraphicAsset
	{
		const asset = GraphicAsset._pool.length > 0
			? GraphicAsset._pool.pop()!
			: new GraphicAsset();

		asset._assetName = assetName;
		asset._libraryAssetName = libraryAssetName;

		if (texture !== null)
		{
			asset._texture = texture;
			asset._initialized = false;
		}
		else
		{
			asset._texture = null;
			asset._initialized = true;
		}

		asset._flipH = flipH;
		asset._flipV = flipV;
		asset._offsetX = offsetX;
		asset._offsetY = offsetY;
		asset._usesPalette = usesPalette;

		return asset;
	}

	recycle(): void
	{
		this._texture = null;
		GraphicAsset._pool.push(this);
	}

	private initialize(): void
	{
		if (!this._initialized && this._texture !== null)
		{
			this._width = this._texture.width;
			this._height = this._texture.height;
			this._initialized = true;
		}
	}
}
