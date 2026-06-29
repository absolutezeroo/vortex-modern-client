/**
 * PlaneMaskBitmap
 *
 * @see com.sulake.habbo.room.object.visualization.room.mask.PlaneMaskBitmap
 *
 * Data object storing one bitmap mask with normalized coordinate bounds.
 */
import type {IGraphicAsset} from '@room/object/visualization/utils/IGraphicAsset';

export class PlaneMaskBitmap
{
	public static readonly MIN_NORMAL_COORDINATE_VALUE: number = -1;
	public static readonly MAX_NORMAL_COORDINATE_VALUE: number = 1;

	constructor(
		asset: IGraphicAsset,
		normalMinX: number = -1,
		normalMaxX: number = 1,
		normalMinY: number = -1,
		normalMaxY: number = 1
	)
	{
		this._asset = asset;
		this._normalMinX = normalMinX;
		this._normalMaxX = normalMaxX;
		this._normalMinY = normalMinY;
		this._normalMaxY = normalMaxY;
	}

	private _normalMinX: number;

	get normalMinX(): number
	{
		return this._normalMinX;
	}

	private _normalMaxX: number;

	get normalMaxX(): number
	{
		return this._normalMaxX;
	}

	private _normalMinY: number;

	get normalMinY(): number
	{
		return this._normalMinY;
	}

	private _normalMaxY: number;

	get normalMaxY(): number
	{
		return this._normalMaxY;
	}

	private _asset: IGraphicAsset | null;

	get asset(): IGraphicAsset | null
	{
		return this._asset;
	}

	dispose(): void
	{
		this._asset = null;
	}
}
