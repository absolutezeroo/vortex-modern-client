import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import {WindowController} from '../WindowController';
import {WindowEvent} from '../events/WindowEvent';
import {PropertyStruct} from '../utils/PropertyStruct';
import {PIVOT_NAMES, pivotFromName} from '../enum/PivotPoint';

/**
 * Controller for bitmap data windows.
 *
 * Base class for bitmap-based window types. Manages a single ImageBitmap
 * with pivot, stretch, zoom, wrap, greyscale, rotation, and etching properties.
 *
 * @see sources/win63_version/core/window/components/BitmapDataController.as
 */
export class BitmapDataController extends WindowController
{
	private _pivot: number = 0;
	private _etchingPointX: number = 0;
	private _etchingPointY: number = -1;

	constructor(
		name: string,
		type: number,
		style: number,
		param: number,
		context: IWindowContext,
		rect: { x: number; y: number; width: number; height: number },
		parent: IWindow | null = null,
		procedure: ((event: WindowEvent, window: IWindow) => void) | null = null,
		tags: string[] | null = null,
		properties: unknown[] | null = null,
		id: number = 0,
		dynamicStyle: string = ''
	)
	{
		super(name, type, style, param, context, rect, parent, procedure, tags, properties, id, dynamicStyle);

		this._hasVisualContent = true;
	}

	protected _bitmapData: ImageBitmap | null = null;

	/**
	 * The bitmap data for this window.
	 */
	public get bitmapData(): ImageBitmap | null
	{
		return this._bitmapData;
	}

	public set bitmapData(value: ImageBitmap | null)
	{
		this._bitmapData = value;
	}

	private _stretchedX: boolean = false;

	/**
	 * Whether the bitmap is stretched horizontally.
	 */
	public get stretchedX(): boolean
	{
		return this._stretchedX;
	}

	public set stretchedX(value: boolean)
	{
		this._stretchedX = value;
	}

	private _stretchedY: boolean = false;

	/**
	 * Whether the bitmap is stretched vertically.
	 */
	public get stretchedY(): boolean
	{
		return this._stretchedY;
	}

	public set stretchedY(value: boolean)
	{
		this._stretchedY = value;
	}

	private _zoomX: number = 1.0;

	/**
	 * Horizontal zoom factor.
	 */
	public get zoomX(): number
	{
		return this._zoomX;
	}

	public set zoomX(value: number)
	{
		this._zoomX = value;
		this.fitSize();
	}

	private _zoomY: number = 1.0;

	/**
	 * Vertical zoom factor.
	 */
	public get zoomY(): number
	{
		return this._zoomY;
	}

	public set zoomY(value: number)
	{
		this._zoomY = value;
		this.fitSize();
	}

	private _fitSizeToContents: boolean = false;

	/**
	 * Whether to auto-resize the window to fit the bitmap dimensions.
	 */
	public get fitSizeToContents(): boolean
	{
		return this._fitSizeToContents;
	}

	public set fitSizeToContents(value: boolean)
	{
		this._fitSizeToContents = value;
		this.fitSize();
	}

	private _greyscale: boolean = false;

	/**
	 * Whether the bitmap is rendered in greyscale.
	 */
	public get greyscale(): boolean
	{
		return this._greyscale;
	}

	public set greyscale(value: boolean)
	{
		this._greyscale = value;
	}

	private _etchingColor: number = 0;

	/**
	 * The etching color used for the shadow/outline effect.
	 */
	public get etchingColor(): number
	{
		return this._etchingColor;
	}

	public set etchingColor(value: number)
	{
		this._etchingColor = value;
	}

	/**
	 * Returns the etching offset point as [x, y].
	 */
	public get etchingPoint(): { x: number; y: number }
	{
		return {x: this._etchingPointX, y: this._etchingPointY};
	}

	/**
	 * Sets etching from an array [color, offsetX, offsetY].
	 */
	public set etching(value: unknown[])
	{
		this._etchingColor = value[0] as number;
		this._etchingPointX = value[1] as number;
		this._etchingPointY = value[2] as number;
	}

	private _wrapX: boolean = false;

	/**
	 * Whether the bitmap wraps horizontally.
	 */
	public get wrapX(): boolean
	{
		return this._wrapX;
	}

	public set wrapX(value: boolean)
	{
		this._wrapX = value;
	}

	private _wrapY: boolean = false;

	/**
	 * Whether the bitmap wraps vertically.
	 */
	public get wrapY(): boolean
	{
		return this._wrapY;
	}

	public set wrapY(value: boolean)
	{
		this._wrapY = value;
	}

	private _rotation: number = 0;

	/**
	 * Rotation angle for the bitmap.
	 */
	public get rotation(): number
	{
		return this._rotation;
	}

	public set rotation(value: number)
	{
		this._rotation = value;
	}

	/**
	 * The pivot point for bitmap rendering.
	 */
	public get pivotPoint(): number
	{
		return this._pivot;
	}

	public set pivotPoint(value: number)
	{
		this._pivot = value;
	}

	public override get properties(): unknown[]
	{
		const props = super.properties;

		props.push(this.createProperty('pivot_point', PIVOT_NAMES[this._pivot] ?? PIVOT_NAMES[0]));
		props.push(this.createProperty('stretched_x', this._stretchedX));
		props.push(this.createProperty('stretched_y', this._stretchedY));
		props.push(this.createProperty('wrap_x', this._wrapX));
		props.push(this.createProperty('wrap_y', this._wrapY));
		props.push(this.createProperty('zoom_x', this._zoomX));
		props.push(this.createProperty('zoom_y', this._zoomY));
		props.push(this.createProperty('greyscale', this._greyscale));
		props.push(this.createProperty('etching_color', this._etchingColor));
		props.push(this.createProperty('fit_size_to_contents', this._fitSizeToContents));
		props.push(this.createProperty('rotation', this._rotation));

		return props;
	}

	public override set properties(value: unknown[])
	{
		for (const item of value)
		{
			const prop = item as PropertyStruct;

			switch (prop.key)
			{
				case 'pivot_point':
					this._pivot = this.readPivotPoint(prop.value);
					break;
				case 'stretched_x':
					this._stretchedX = this.readBoolean(prop.value);
					break;
				case 'stretched_y':
					this._stretchedY = this.readBoolean(prop.value);
					break;
				case 'zoom_x':
					this._zoomX = this.readNumber(prop.value, 1);
					break;
				case 'zoom_y':
					this._zoomY = this.readNumber(prop.value, 1);
					break;
				case 'wrap_x':
					this._wrapX = this.readBoolean(prop.value);
					break;
				case 'wrap_y':
					this._wrapY = this.readBoolean(prop.value);
					break;
				case 'greyscale':
					this._greyscale = this.readBoolean(prop.value);
					break;
				case 'etching_color':
					this._etchingColor = this.readNumber(prop.value, 0);
					break;
				case 'fit_size_to_contents':
					this.fitSizeToContents = this.readBoolean(prop.value);
					break;
				case 'rotation':
					this._rotation = this.readNumber(prop.value, 0);
					break;
			}
		}

		super.properties = value;
	}

	public override clone(): IWindow
	{
		const cloned = super.clone() as BitmapDataController;

		cloned._bitmapData = this._bitmapData;
		cloned._pivot = this._pivot;
		cloned._stretchedX = this._stretchedX;
		cloned._stretchedY = this._stretchedY;
		cloned._zoomX = this._zoomX;
		cloned._zoomY = this._zoomY;
		cloned._fitSizeToContents = this._fitSizeToContents;
		cloned._greyscale = this._greyscale;
		cloned._etchingColor = this._etchingColor;
		cloned._etchingPointX = this._etchingPointX;
		cloned._etchingPointY = this._etchingPointY;
		cloned._wrapX = this._wrapX;
		cloned._wrapY = this._wrapY;
		cloned._rotation = this._rotation;

		return cloned;
	}

	public override dispose(): void
	{
		if (this._disposed) return;

		this._bitmapData = null;

		super.dispose();
	}

	/**
	 * Resizes the window to match the bitmap dimensions (scaled by zoom).
	 */
	protected fitSize(): void
	{
		if (!this._fitSizeToContents || !this._bitmapData) return;

		this.width = Math.abs(this._bitmapData.width * this._zoomX);
		this.height = Math.abs(this._bitmapData.height * this._zoomY);
	}

	private readBoolean(value: unknown): boolean
	{
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') return value.toLowerCase() === 'true';

		return !!value;
	}

	private readNumber(value: unknown, fallback: number): number
	{
		const parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : fallback;
	}

	private readPivotPoint(value: unknown): number
	{
		if (typeof value === 'number') return value;

		if (typeof value === 'string')
		{
			const pivot = pivotFromName(value);

			return pivot >= 0 ? pivot : 0;
		}

		return 0;
	}
}
