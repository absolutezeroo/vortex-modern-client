/**
 * PlaneVisualization
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.rasterizer.basic.PlaneVisualization
 *
 * Manages layers for a plane at a specific scale. Caches rendered bitmap.
 * Layers can be either PlaneVisualizationLayer (static) or
 * PlaneVisualizationAnimationLayer (animated, for landscapes).
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import type {PlaneMaterial} from './PlaneMaterial';
import {PlaneVisualizationLayer} from './PlaneVisualizationLayer';
import type {IAnimationItemData, PlaneVisualizationAnimationLayer} from '../animated/PlaneVisualizationAnimationLayer';
import {PlaneVisualizationAnimationLayer as AnimationLayer} from '../animated/PlaneVisualizationAnimationLayer';

/**
 * Union type for layers that can be either static or animated.
 */
type PlaneLayer = PlaneVisualizationLayer | PlaneVisualizationAnimationLayer;

export class PlaneVisualization
{
	private _layers: (PlaneLayer | null)[];
	private _cachedBitmap: HTMLCanvasElement | null = null;
	private _cachedBitmapNormal: Vector3d;
	private _cacheUsed: boolean = false;

	constructor(_size: number, layerCount: number, geometry: IRoomGeometry)
	{
		this._layers = [];

		if (layerCount < 0) layerCount = 0;
		for (let i = 0; i < layerCount; i++)
		{
			this._layers.push(null);
		}

		this._geometry = geometry;
		this._cachedBitmapNormal = new Vector3d();
	}

	private _geometry: IRoomGeometry | null;

	get geometry(): IRoomGeometry | null
	{
		return this._geometry;
	}

	private _hasAnimationLayers: boolean = false;

	get hasAnimationLayers(): boolean
	{
		return this._hasAnimationLayers;
	}

	dispose(): void
	{
		if (this._layers !== null)
		{
			for (const layer of this._layers)
			{
				if (layer !== null)
				{
					layer.dispose();
				}
			}
			this._layers = [];
		}
		this._geometry = null;
		this._cachedBitmap = null;
	}

	clearCache(): void
	{
		if (!this._cacheUsed) return;

		this._cachedBitmap = null;
		this._cachedBitmapNormal.assign(new Vector3d());

		for (const layer of this._layers)
		{
			if (layer !== null && 'clearCache' in layer)
			{
				layer.clearCache();
			}
		}

		this._cacheUsed = false;
	}

	setLayer(index: number, material: PlaneMaterial | null, color: number, align: number, offset: number = 0): boolean
	{
		if (index < 0 || index >= this._layers.length) return false;

		const existing = this._layers[index];
		if (existing !== null)
		{
			existing.dispose();
		}

		this._layers[index] = new PlaneVisualizationLayer(material, color, align, offset);
		return true;
	}

	/**
	 * Set an animation layer at the given index.
	 *
	 * @see AS3 PlaneVisualization.setAnimationLayer()
	 *
	 * @param index - Layer index
	 * @param items - Animation item data parsed from XML/JSON
	 * @param assetTextures - Asset texture map for resolving item bitmaps
	 * @returns Whether the layer was set successfully
	 */
	setAnimationLayer(index: number, items: IAnimationItemData[], assetTextures: Map<string, HTMLCanvasElement> | null): boolean
	{
		if (index < 0 || index >= this._layers.length) return false;

		const existing = this._layers[index];
		if (existing !== null)
		{
			existing.dispose();
		}

		this._layers[index] = new AnimationLayer(items, assetTextures);
		this._hasAnimationLayers = true;
		return true;
	}

	getLayers(): (PlaneLayer | null)[]
	{
		return this._layers;
	}

	/**
	 * Render all layers onto a canvas.
	 *
	 * Extra parameters (tileWidth, tileHeight, speedXScale, speedYScale, time)
	 * are passed through to animation layers.
	 *
	 * @see AS3 PlaneVisualization.render()
	 */
	render(
		canvas: HTMLCanvasElement | null,
		width: number,
		height: number,
		normal: IVector3d,
		hasTexture: boolean,
		offsetX: number = 0,
		offsetY: number = 0,
		tileWidth: number = 0,
		tileHeight: number = 0,
		speedXScale: number = 0,
		speedYScale: number = 0,
		time: number = 0
	): HTMLCanvasElement | null
	{
		if (width < 1) width = 1;
		if (height < 1) height = 1;

		if (canvas !== null && (canvas.width !== width || canvas.height !== height))
		{
			canvas = null;
		}

		// Check cache
		if (this._cachedBitmap !== null)
		{
			if (this._cachedBitmap.width === width &&
				this._cachedBitmap.height === height &&
				Vector3d.isEqual(this._cachedBitmapNormal, normal))
			{
				if (!this._hasAnimationLayers)
				{
					if (canvas !== null)
					{
						const ctx = canvas.getContext('2d')!;
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(this._cachedBitmap, 0, 0);
						return canvas;
					}
					return this._cachedBitmap;
				}
			}
			else
			{
				this._cachedBitmap = null;
			}
		}

		this._cacheUsed = true;

		if (this._cachedBitmap === null)
		{
			this._cachedBitmap = document.createElement('canvas');
			this._cachedBitmap.width = width;
			this._cachedBitmap.height = height;
			const ctx = this._cachedBitmap.getContext('2d')!;
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, width, height);
		}
		else
		{
			const ctx = this._cachedBitmap.getContext('2d')!;
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = '#FFFFFF';
			ctx.fillRect(0, 0, width, height);
		}

		if (canvas === null)
		{
			canvas = this._cachedBitmap;
		}

		this._cachedBitmapNormal.assign(normal);

		// Render all layers - static or animated
		for (const layer of this._layers)
		{
			if (layer instanceof PlaneVisualizationLayer)
			{
				layer.render(canvas, width, height, normal, hasTexture, offsetX, offsetY);
			}
			else if (layer instanceof AnimationLayer)
			{
				layer.render(canvas, width, height, normal, offsetX, offsetY, tileWidth, tileHeight, speedXScale, speedYScale, time);
			}
		}

		// Update cache from canvas
		if (canvas !== null && canvas !== this._cachedBitmap)
		{
			const ctx = this._cachedBitmap.getContext('2d')!;
			ctx.clearRect(0, 0, this._cachedBitmap.width, this._cachedBitmap.height);
			ctx.drawImage(canvas, 0, 0);
			return canvas;
		}

		return this._cachedBitmap;
	}
}
