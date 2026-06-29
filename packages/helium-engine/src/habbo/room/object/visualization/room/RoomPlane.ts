/**
 * RoomPlane
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomPlane
 *
 * Handles rendering of individual room planes (floor tiles, walls, landscape).
 * Supports both flat-color fallback (Graphics.poly) and textured rendering
 * via rasterizers (canvas-based affine transform).
 */
import {Graphics, Sprite, Texture} from 'pixi.js';
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IPlaneRasterizer} from './rasterizer/IPlaneRasterizer';
import type {PlaneBitmapData} from './utils/PlaneBitmapData';
import {Randomizer} from './utils/Randomizer';

/**
 * Bitmap mask data for plane masking (doors, windows).
 * Based on AS3: RoomPlaneBitmapMask
 */
interface RoomPlaneBitmapMask
{
	type: string;
	leftSideLoc: number;
	rightSideLoc: number;
}

/**
 * Rectangle mask data for plane masking.
 * Based on AS3: RoomPlaneRectangleMask
 */
interface RoomPlaneRectangleMask
{
	leftSideLoc: number;
	rightSideLoc: number;
	leftSideLength: number;
	rightSideLength: number;
}

let planeUniqueIdCounter = 1;

export class RoomPlane
{
	public static readonly TYPE_UNDEFINED: number = 0;
	public static readonly TYPE_WALL: number = 1;
	public static readonly TYPE_FLOOR: number = 2;
	public static readonly TYPE_LANDSCAPE: number = 3;

	private _randomSeed: number = 0;
	private _origin: Vector3d;
	private _secondaryNormals: Vector3d[] = [];
	private _geometryUpdateId: number = -1;
	private _isVisible: boolean = false;
	private _textureOffsetU: number = 0;
	private _textureOffsetV: number = 0;
	private _textureMaxU: number = 0;
	private _textureMaxV: number = 0;
	private _useMask: boolean = false;
	private _cornerA: Vector3d;
	private _cornerB: Vector3d;
	private _cornerC: Vector3d;
	private _cornerD: Vector3d;
	private _width: number = 0;
	private _height: number = 0;
	private _textureCache: Map<string, PlaneBitmapData> = new Map();
	private _cachedTextureBitmap: PlaneBitmapData | null = null;
	private _textureSprite: Sprite | null = null;
	private _outputCanvas: HTMLCanvasElement | null = null;
	private _bitmapMasks: RoomPlaneBitmapMask[] = [];
	private _rectangleMasks: RoomPlaneRectangleMask[] = [];
	private _maskChanged: boolean = false;
	private _graphics: Graphics;
	private _bitmapData: HTMLCanvasElement | null = null;

	constructor(
		origin: IVector3d,
		location: IVector3d,
		leftSide: IVector3d,
		rightSide: IVector3d,
		type: number,
		useMask: boolean,
		secondaryNormals: IVector3d[] | null,
		randomSeed: number,
		textureOffsetU: number = 0,
		textureOffsetV: number = 0,
		textureMaxU: number = 0,
		textureMaxV: number = 0
	)
	{
		this._randomSeed = randomSeed;
		this._uniqueId = planeUniqueIdCounter++;

		this._origin = new Vector3d();
		this._origin.assign(origin);

		this._location = new Vector3d();
		this._location.assign(location);

		this._leftSide = new Vector3d();
		this._leftSide.assign(leftSide);

		this._rightSide = new Vector3d();
		this._rightSide.assign(rightSide);

		this._normal = Vector3d.crossProduct(leftSide, rightSide)!;
		if (this._normal.length > 0)
		{
			this._normal.mul(1 / this._normal.length);
		}

		if (secondaryNormals !== null)
		{
			for (const normal of secondaryNormals)
			{
				if (normal !== null)
				{
					const vec = new Vector3d();
					vec.assign(normal);
					this._secondaryNormals.push(vec);
				}
			}
		}

		this._type = type;
		this._useMask = useMask;
		this._textureOffsetU = textureOffsetU;
		this._textureOffsetV = textureOffsetV;
		this._textureMaxU = textureMaxU;
		this._textureMaxV = textureMaxV;

		this._cornerA = new Vector3d();
		this._cornerB = new Vector3d();
		this._cornerC = new Vector3d();
		this._cornerD = new Vector3d();

		this._graphics = new Graphics();
		this._graphics.label = `RoomPlane_${this._uniqueId}_type${type}`;
	}

	private _bitmapDataTexture: Texture | null = null;

	/**
	 * Get the rendered bitmap as a Texture.
	 * AS3: get bitmapData() — returns a clone of the internal BitmapData.
	 *
	 * @see sources/win63_version/habbo/room/object/visualization/room/RoomPlane.as
	 */
	get bitmapDataTexture(): Texture | null
	{
		return this._bitmapDataTexture;
	}

	private _rasterizer: IPlaneRasterizer | null = null;

	set rasterizer(value: IPlaneRasterizer | null)
	{
		this._rasterizer = value;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	private _location: Vector3d;

	get location(): IVector3d
	{
		return this._location;
	}

	private _leftSide: Vector3d;

	get leftSide(): IVector3d
	{
		return this._leftSide;
	}

	private _rightSide: Vector3d;

	get rightSide(): IVector3d
	{
		return this._rightSide;
	}

	private _normal: Vector3d;

	get normal(): IVector3d
	{
		return this._normal;
	}

	private _type: number = 0;

	get type(): number
	{
		return this._type;
	}

	private _canBeVisible: boolean = true;

	get canBeVisible(): boolean
	{
		return this._canBeVisible;
	}

	set canBeVisible(value: boolean)
	{
		this._canBeVisible = value;
	}

	private _hasTexture: boolean = true;

	get hasTexture(): boolean
	{
		return this._hasTexture;
	}

	set hasTexture(value: boolean)
	{
		this._hasTexture = value;
	}

	private _id: string | null = null;

	get id(): string | null
	{
		return this._id;
	}

	set id(value: string)
	{
		this._id = value;
	}

	private _uniqueId: number;

	get uniqueId(): number
	{
		return this._uniqueId;
	}

	private _offset: { x: number; y: number } = {x: 0, y: 0};

	get offset(): { x: number; y: number }
	{
		return this._offset;
	}

	private _relativeDepth: number = 0;

	get relativeDepth(): number
	{
		return this._relativeDepth + this._extraDepth;
	}

	private _color: number = 0;

	get color(): number
	{
		return this._color;
	}

	set color(value: number)
	{
		this._color = value;
	}

	private _extraDepth: number = 0;

	set extraDepth(value: number)
	{
		this._extraDepth = value;
	}

	get displayObject(): Graphics
	{
		return this._graphics;
	}

	private _isHighlighter: boolean = false;

	get isHighlighter(): boolean
	{
		return this._isHighlighter;
	}

	set isHighlighter(value: boolean)
	{
		this._isHighlighter = value;
	}

	get visible(): boolean
	{
		return this._isVisible && this._canBeVisible;
	}

	get planeWidth(): number
	{
		return this._width;
	}

	get planeHeight(): number
	{
		return this._height;
	}

	/**
	 * Copy the rendered plane bitmap data into a reusable target.
	 * AS3: copyBitmapData(target) — copies pixels if dimensions match.
	 *
	 * In PixiJS, we return the internal texture directly (the canvas is reused
	 * and the texture source is updated in place).
	 *
	 * @see sources/win63_version/habbo/room/object/visualization/room/RoomPlane.as
	 */
	copyBitmapData(): Texture | null
	{
		if (!this.visible)
		{
			return null;
		}

		return this._bitmapDataTexture;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}

		this._graphics.destroy();
		if (this._textureSprite !== null)
		{
			this._textureSprite.destroy();
			this._textureSprite = null;
		}
		if (this._bitmapDataTexture !== null)
		{
			this._bitmapDataTexture.destroy(true);
			this._bitmapDataTexture = null;
		}
		this._bitmapData = null;
		this._cachedTextureBitmap = null;
		this._textureCache.clear();
		this._outputCanvas = null;
		this._bitmapMasks = [];
		this._rectangleMasks = [];
		this._rasterizer = null;
		this._disposed = true;
	}

	/**
	 * Update the plane based on room geometry
	 */
	update(geometry: IRoomGeometry, time: number): boolean
	{
		if (geometry === null || this._disposed)
		{
			return false;
		}

		let needsUpdate = false;

		if (this._geometryUpdateId !== geometry.updateId)
		{
			needsUpdate = true;
		}

		if (!needsUpdate || !this._canBeVisible)
		{
			if (!this.visible)
			{
				return false;
			}
		}

		if (needsUpdate)
		{
			// Check visibility using normal and direction axis (AS3: lines 383-400)
			const cosAngle = Vector3d.cosAngle(geometry.directionAxis as Vector3d, this._normal);

			if (cosAngle > -0.001)
			{
				if (this._isVisible)
				{
					this._isVisible = false;
					return true;
				}
				return false;
			}

			// Check secondary normals
			for (const secondaryNormal of this._secondaryNormals)
			{
				const secondaryCos = Vector3d.cosAngle(geometry.directionAxis as Vector3d, secondaryNormal);

				if (secondaryCos > -0.001)
				{
					if (this._isVisible)
					{
						this._isVisible = false;
						return true;
					}
					return false;
				}
			}

			// Update corner positions (transforms to local space)
			this.updateCorners(geometry);

			// Calculate depth
			const originScreen = geometry.getScreenPosition(this._origin);
			const originZ = originScreen !== null ? originScreen.z : 0;

			const maxZ = Math.max(
				this._cornerA.z,
				this._cornerB.z,
				this._cornerC.z,
				this._cornerD.z
			) - originZ;

			let depth = maxZ;

			if (this._type === RoomPlane.TYPE_FLOOR)
			{
				depth -= (this._location.z + Math.min(0, this._leftSide.z, this._rightSide.z)) * 8;
			}

			if (this._type === RoomPlane.TYPE_LANDSCAPE)
			{
				depth += 0.02;
			}

			this._relativeDepth = depth;
			this._isVisible = true;
			this._geometryUpdateId = geometry.updateId;
		}

		// Render the plane
		this.render(geometry);

		return true;
	}

	/**
	 * Reset all bitmap masks. Based on AS3 RoomPlane.resetBitmapMasks()
	 */
	resetBitmapMasks(): void
	{
		if (this._disposed) return;

		if (this._useMask)
		{
			if (this._bitmapMasks.length === 0) return;

			this._maskChanged = true;
			this._bitmapMasks = [];
		}
	}

	/**
	 * Add a bitmap mask (e.g., door hole). Based on AS3 RoomPlane.addBitmapMask()
	 */
	addBitmapMask(type: string, leftSideLoc: number, rightSideLoc: number): boolean
	{
		if (this._useMask)
		{
			// Check if already exists
			for (const mask of this._bitmapMasks)
			{
				if (mask.type === type && mask.leftSideLoc === leftSideLoc && mask.rightSideLoc === rightSideLoc)
				{
					return false;
				}
			}

			this._bitmapMasks.push({type, leftSideLoc, rightSideLoc});
			this._maskChanged = true;
			return true;
		}
		return false;
	}

	/**
	 * Reset all rectangle masks. Based on AS3 RoomPlane.resetRectangleMasks()
	 */
	resetRectangleMasks(): void
	{
		if (this._useMask)
		{
			if (this._rectangleMasks.length === 0) return;

			this._maskChanged = true;
			this._rectangleMasks = [];
		}
	}

	/**
	 * Add a rectangle mask. Based on AS3 RoomPlane.addRectangleMask()
	 */
	addRectangleMask(leftSideLoc: number, rightSideLoc: number, leftSideLength: number, rightSideLength: number): boolean
	{
		if (this._useMask)
		{
			for (const mask of this._rectangleMasks)
			{
				if (mask.leftSideLoc === leftSideLoc && mask.rightSideLoc === rightSideLoc
					&& mask.leftSideLength === leftSideLength && mask.rightSideLength === rightSideLength)
				{
					return false;
				}
			}

			this._rectangleMasks.push({leftSideLoc, rightSideLoc, leftSideLength, rightSideLength});
			this._maskChanged = true;
			return true;
		}
		return false;
	}

	/**
	 * Update corner positions in screen space
	 * Based on AS3 RoomPlane.updateCorners()
	 *
	 * Corner mapping:
	 * A = location
	 * B = location + rightSide
	 * C = location + leftSide + rightSide
	 * D = location + leftSide
	 */
	private updateCorners(geometry: IRoomGeometry): void
	{
		const aPos = geometry.getScreenPosition(this._location);
		const bPos = geometry.getScreenPosition(Vector3d.sum(this._location, this._rightSide)!);
		const cPos = geometry.getScreenPosition(Vector3d.sum(Vector3d.sum(this._location, this._leftSide)!, this._rightSide)!);
		const dPos = geometry.getScreenPosition(Vector3d.sum(this._location, this._leftSide)!);

		if (aPos !== null) this._cornerA.assign(aPos);

		if (bPos !== null) this._cornerB.assign(bPos);

		if (cPos !== null) this._cornerC.assign(cPos);

		if (dPos !== null) this._cornerD.assign(dPos);

		// Calculate offset from room origin
		const offsetPoint = geometry.getScreenPoint(this._origin);

		if (offsetPoint !== null)
		{
			this._offset.x = Math.round(offsetPoint.x);
			this._offset.y = Math.round(offsetPoint.y);
		}

		// Round corner positions
		this._cornerA.x = Math.round(this._cornerA.x);
		this._cornerA.y = Math.round(this._cornerA.y);
		this._cornerB.x = Math.round(this._cornerB.x);
		this._cornerB.y = Math.round(this._cornerB.y);
		this._cornerC.x = Math.round(this._cornerC.x);
		this._cornerC.y = Math.round(this._cornerC.y);
		this._cornerD.x = Math.round(this._cornerD.x);
		this._cornerD.y = Math.round(this._cornerD.y);

		// Calculate bounding box
		const minX = Math.min(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x);
		const maxX = Math.max(this._cornerA.x, this._cornerB.x, this._cornerC.x, this._cornerD.x);
		const minY = Math.min(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y);
		const maxY = Math.max(this._cornerA.y, this._cornerB.y, this._cornerC.y, this._cornerD.y);

		// Transform offset and corners to local space
		this._offset.x = this._offset.x - minX;
		this._offset.y = this._offset.y - minY;

		this._cornerA.x = this._cornerA.x - minX;
		this._cornerA.y = this._cornerA.y - minY;
		this._cornerB.x = this._cornerB.x - minX;
		this._cornerB.y = this._cornerB.y - minY;
		this._cornerC.x = this._cornerC.x - minX;
		this._cornerC.y = this._cornerC.y - minY;
		this._cornerD.x = this._cornerD.x - minX;
		this._cornerD.y = this._cornerD.y - minY;

		// Calculate dimensions
		this._width = maxX - minX;
		this._height = maxY - minY;
	}

	/**
	 * Get texture bitmap from rasterizer.
	 * Based on AS3 RoomPlane.getTexture()
	 */
	private getTexture(geometry: IRoomGeometry): PlaneBitmapData | null
	{
		if (this._rasterizer === null || !this._hasTexture)
		{
			return null;
		}

		const id = this._id ?? 'default';
		const scale = geometry.scale;
		const leftLen = this._leftSide.length * scale;
		const rightLen = this._rightSide.length * scale;

		Randomizer.setSeed(this._randomSeed);

		return this._rasterizer.render(
			null,
			id,
			leftLen,
			rightLen,
			scale,
			this._normal,
			this._hasTexture,
			this._textureOffsetU,
			this._textureOffsetV,
			this._textureMaxU,
			this._textureMaxV
		);
	}

	/**
	 * Render textured plane using affine transform.
	 * Based on AS3 RoomPlane.renderTexture() — applies Matrix transform for isometric projection.
	 *
	 * The texture from the rasterizer is a rectangular bitmap. We need to project it
	 * onto the isometric quad defined by cornerA-D using an affine transform.
	 *
	 * Matrix mapping (AS3):
	 *   cornerC = origin (tx, ty)
	 *   cornerB = origin + horizontal axis
	 *   cornerD = origin + vertical axis
	 */
	private renderTexture(textureBitmap: HTMLCanvasElement): void
	{
		const tw = textureBitmap.width;
		const th = textureBitmap.height;

		if (tw < 1 || th < 1) return;

		// Affine matrix: maps texture rectangle to screen quad
		// Based on AS3 RoomPlane.renderTexture() matrix construction
		const a = (this._cornerB.x - this._cornerC.x) / tw;
		const b = (this._cornerB.y - this._cornerC.y) / tw;
		const c = (this._cornerD.x - this._cornerC.x) / th;
		const d = (this._cornerD.y - this._cornerC.y) / th;
		const tx = this._cornerC.x;
		const ty = this._cornerC.y;

		// Reuse or create output canvas
		if (!this._outputCanvas)
		{
			this._outputCanvas = document.createElement('canvas');
		}
		this._outputCanvas.width = this._width;
		this._outputCanvas.height = this._height;
		const ctx = this._outputCanvas.getContext('2d')!;

		// Apply affine transform and draw texture
		ctx.setTransform(a, b, c, d, tx, ty);
		ctx.drawImage(textureBitmap, 0, 0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// Apply mask cutouts (door/window holes) on the textured canvas
		if (this._rectangleMasks.length > 0 || this._bitmapMasks.length > 0)
		{
			ctx.globalCompositeOperation = 'destination-out';
			const leftLen = this._leftSide.length;
			const rightLen = this._rightSide.length;

			// Rectangle masks (door openings)
			for (const mask of this._rectangleMasks)
			{
				const maskPoints = this.getRectMaskScreenPoints(mask, leftLen, rightLen);

				if (maskPoints !== null)
				{
					this.drawMaskPoly(ctx, maskPoints);
				}
			}

			// Bitmap masks (doors, windows via mask parser)
			for (const mask of this._bitmapMasks)
			{
				const maskPoints = this.getMaskHolePoints(mask, leftLen, rightLen);

				if (maskPoints !== null)
				{
					this.drawMaskPoly(ctx, maskPoints);
				}
			}

			ctx.globalCompositeOperation = 'source-over';
		}

		// Dispose previous texture to prevent memory leak
		if (this._textureSprite !== null)
		{
			this._textureSprite.texture.destroy(true);
		}

		// Convert canvas to PixiJS texture and apply to sprite
		const texture = Texture.from(this._outputCanvas);

		if (this._textureSprite === null)
		{
			this._textureSprite = new Sprite(texture);
			this._textureSprite.label = `RoomPlane_Tex_${this._uniqueId}`;
		}
		else
		{
			this._textureSprite.texture = texture;
		}
	}

	/**
	 * Render the plane to internal _bitmapData canvas.
	 * Uses textured rendering if rasterizer is available,
	 * otherwise renders flat-color polygon.
	 *
	 * Based on AS3 RoomPlane.update() rendering section — always produces
	 * _bitmapData (AS3 BitmapData) and also updates the Graphics display object.
	 *
	 * @see sources/win63_version/habbo/room/object/visualization/room/RoomPlane.as
	 */
	private render(geometry: IRoomGeometry): void
	{
		if (!this.visible)
		{
			this._graphics.visible = false;
			if (this._textureSprite) this._textureSprite.visible = false;
			return;
		}

		if (this._width < 1 || this._height < 1)
		{
			this._graphics.visible = false;
			if (this._textureSprite) this._textureSprite.visible = false;
			return;
		}

		// Ensure _bitmapData canvas exists and matches dimensions (AS3: new BitmapData(_width, _height))
		if (this._bitmapData === null || this._bitmapData.width !== this._width || this._bitmapData.height !== this._height)
		{
			this._bitmapData = document.createElement('canvas');
			this._bitmapData.width = this._width;
			this._bitmapData.height = this._height;

			// Create a new texture bound to this canvas
			if (this._bitmapDataTexture !== null)
			{
				this._bitmapDataTexture.destroy(true);
			}

			this._bitmapDataTexture = Texture.from({
				resource: this._bitmapData,
				alphaMode: 'premultiply-alpha-on-upload'
			});
		}

		const ctx = this._bitmapData.getContext('2d')!;
		ctx.clearRect(0, 0, this._width, this._height);

		// Try textured rendering first
		const textureBitmapData = this.getTexture(geometry);

		if (textureBitmapData?.bitmap)
		{
			this.renderTexture(textureBitmapData.bitmap);

			// Also render to _bitmapData canvas for the sprite system
			this.renderTextureToBitmapData(ctx, textureBitmapData.bitmap);

			if (this._textureSprite)
			{
				this._textureSprite.x = -this._offset.x;
				this._textureSprite.y = -this._offset.y;
				this._textureSprite.visible = true;
				this._textureSprite.zIndex = this._graphics.zIndex;

				if (!this._textureSprite.parent && this._graphics.parent)
				{
					this._graphics.parent.addChild(this._textureSprite);
				}
			}

			this._graphics.visible = false;
		}
		else
		{
			// Flat-color rendering to _bitmapData canvas
			if (this._textureSprite) this._textureSprite.visible = false;

			const r = (this._color >> 16) & 0xFF;
			const g = (this._color >> 8) & 0xFF;
			const b = this._color & 0xFF;

			ctx.fillStyle = `rgb(${r},${g},${b})`;
			ctx.beginPath();
			ctx.moveTo(this._cornerA.x, this._cornerA.y);
			ctx.lineTo(this._cornerB.x, this._cornerB.y);
			ctx.lineTo(this._cornerC.x, this._cornerC.y);
			ctx.lineTo(this._cornerD.x, this._cornerD.y);
			ctx.closePath();
			ctx.fill();

			// Apply mask cutouts on canvas
			if (this._rectangleMasks.length > 0 || this._bitmapMasks.length > 0)
			{
				ctx.globalCompositeOperation = 'destination-out';
				const leftLen = this._leftSide.length;
				const rightLen = this._rightSide.length;

				for (const mask of this._rectangleMasks)
				{
					const maskPoints = this.getRectMaskScreenPoints(mask, leftLen, rightLen);

					if (maskPoints !== null)
					{
						this.drawMaskPoly(ctx, maskPoints);
					}
				}

				for (const mask of this._bitmapMasks)
				{
					const maskPoints = this.getMaskHolePoints(mask, leftLen, rightLen);

					if (maskPoints !== null)
					{
						this.drawMaskPoly(ctx, maskPoints);
					}
				}

				ctx.globalCompositeOperation = 'source-over';
			}

			// Also update Graphics display object for backward compatibility
			this._graphics.clear();

			this._graphics
				.poly([
					this._cornerA.x, this._cornerA.y,
					this._cornerB.x, this._cornerB.y,
					this._cornerC.x, this._cornerC.y,
					this._cornerD.x, this._cornerD.y
				])
				.fill(this._color);

			if (this._rectangleMasks.length > 0 || this._bitmapMasks.length > 0)
			{
				const leftLen = this._leftSide.length;
				const rightLen = this._rightSide.length;

				for (const mask of this._rectangleMasks)
				{
					const maskPoints = this.getRectMaskScreenPoints(mask, leftLen, rightLen);

					if (maskPoints !== null)
					{
						this._graphics.poly(maskPoints).cut();
					}
				}

				for (const mask of this._bitmapMasks)
				{
					const maskPoints = this.getMaskHolePoints(mask, leftLen, rightLen);

					if (maskPoints !== null)
					{
						this._graphics.poly(maskPoints).cut();
					}
				}
			}

			this._graphics.x = -this._offset.x;
			this._graphics.y = -this._offset.y;
			this._graphics.visible = true;
		}

		// Flag the texture source as dirty so PixiJS re-uploads to GPU
		if (this._bitmapDataTexture !== null)
		{
			this._bitmapDataTexture.source.update();
		}
	}

	/**
	 * Render texture bitmap to _bitmapData canvas using affine transform.
	 * Same transform as renderTexture() but targets the _bitmapData canvas.
	 */
	private renderTextureToBitmapData(ctx: CanvasRenderingContext2D, textureBitmap: HTMLCanvasElement): void
	{
		const tw = textureBitmap.width;
		const th = textureBitmap.height;

		if (tw < 1 || th < 1) return;

		const a = (this._cornerB.x - this._cornerC.x) / tw;
		const b = (this._cornerB.y - this._cornerC.y) / tw;
		const c = (this._cornerD.x - this._cornerC.x) / th;
		const d = (this._cornerD.y - this._cornerC.y) / th;
		const tx = this._cornerC.x;
		const ty = this._cornerC.y;

		ctx.setTransform(a, b, c, d, tx, ty);
		ctx.drawImage(textureBitmap, 0, 0);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// Apply mask cutouts
		if (this._rectangleMasks.length > 0 || this._bitmapMasks.length > 0)
		{
			ctx.globalCompositeOperation = 'destination-out';
			const leftLen = this._leftSide.length;
			const rightLen = this._rightSide.length;

			for (const mask of this._rectangleMasks)
			{
				const maskPoints = this.getRectMaskScreenPoints(mask, leftLen, rightLen);

				if (maskPoints !== null)
				{
					this.drawMaskPoly(ctx, maskPoints);
				}
			}

			for (const mask of this._bitmapMasks)
			{
				const maskPoints = this.getMaskHolePoints(mask, leftLen, rightLen);

				if (maskPoints !== null)
				{
					this.drawMaskPoly(ctx, maskPoints);
				}
			}

			ctx.globalCompositeOperation = 'source-over';
		}
	}

	/**
	 * Convert a rectangle mask in plane-space to screen-space polygon points.
	 *
	 * The plane quad is defined by corners A, B, C, D where:
	 *   A = (lf=0, rf=0), B = (lf=0, rf=1), C = (lf=1, rf=1), D = (lf=1, rf=0)
	 *
	 * A point at (lf, rf) maps to screen via bilinear interpolation:
	 *   screen = A + lf*(D-A) + rf*(B-A)
	 */
	private getRectMaskScreenPoints(
		mask: RoomPlaneRectangleMask,
		leftLen: number,
		rightLen: number
	): number[] | null
	{
		if (leftLen < 0.001 || rightLen < 0.001) return null;

		// Normalize mask coordinates to fractions of plane dimensions
		// Add small inset (MASK_INSET) to keep hole strictly inside the outer polygon.
		// PixiJS v8 .cut() requires holes to be completely inside the shape.
		const MASK_INSET = 0.002;
		const lf0 = Math.max(MASK_INSET, mask.leftSideLoc / leftLen);
		const lf1 = Math.min(1 - MASK_INSET, (mask.leftSideLoc + mask.leftSideLength) / leftLen);
		const rf0 = Math.max(MASK_INSET, mask.rightSideLoc / rightLen);
		const rf1 = Math.min(1 - MASK_INSET, (mask.rightSideLoc + mask.rightSideLength) / rightLen);

		if (lf0 >= lf1 || rf0 >= rf1) return null;

		// Direction vectors in screen space
		const dlx = this._cornerD.x - this._cornerA.x; // leftSide direction
		const dly = this._cornerD.y - this._cornerA.y;
		const drx = this._cornerB.x - this._cornerA.x; // rightSide direction
		const dry = this._cornerB.y - this._cornerA.y;

		// Map 4 corners of the mask rectangle to screen coordinates
		const p1x = this._cornerA.x + lf0 * dlx + rf0 * drx;
		const p1y = this._cornerA.y + lf0 * dly + rf0 * dry;
		const p2x = this._cornerA.x + lf1 * dlx + rf0 * drx;
		const p2y = this._cornerA.y + lf1 * dly + rf0 * dry;
		const p3x = this._cornerA.x + lf1 * dlx + rf1 * drx;
		const p3y = this._cornerA.y + lf1 * dly + rf1 * dry;
		const p4x = this._cornerA.x + lf0 * dlx + rf1 * drx;
		const p4y = this._cornerA.y + lf0 * dly + rf1 * dry;

		return [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y];
	}

	/**
	 * Compute hole polygon points for a bitmap mask (door).
	 * Maps mask position (scalar projection along leftSide/rightSide) to screen-space quad.
	 *
	 * Based on AS3 RoomPlane.updateMask() — pixel position calculation.
	 * AS3 uses actual bitmap assets (via PlaneMaskManager) for mask shapes.
	 * Without bitmaps, we approximate doors as 1-tile-wide cutouts extending
	 * from rightSideLoc upward by DOOR_HEIGHT_TILES (standard Habbo door height).
	 */
	private getMaskHolePoints(mask: RoomPlaneBitmapMask, leftLen: number, rightLen: number): number[] | null
	{
		if (leftLen < 0.001 || rightLen < 0.001) return null;

		const MASK_INSET = 0.002;

		// AS3: door bitmap is ~32px wide (1 tile) × ~90px tall at scale 64
		// Standard Habbo door height ≈ 2.5 tiles (fixed, independent of wall height)
		const DOOR_HEIGHT_TILES = 2.5;
		const halfTileU = 0.5 / leftLen;

		const u0 = Math.max(MASK_INSET, mask.leftSideLoc / leftLen - halfTileU);
		const u1 = Math.min(1 - MASK_INSET, mask.leftSideLoc / leftLen + halfTileU);
		const v0 = Math.max(MASK_INSET, mask.rightSideLoc / rightLen);
		const v1 = Math.min(1 - MASK_INSET, (mask.rightSideLoc + DOOR_HEIGHT_TILES) / rightLen);

		if (u0 >= u1 || v0 >= v1) return null;

		const dlx = this._cornerD.x - this._cornerA.x;
		const dly = this._cornerD.y - this._cornerA.y;
		const drx = this._cornerB.x - this._cornerA.x;
		const dry = this._cornerB.y - this._cornerA.y;

		return [
			this._cornerA.x + u0 * dlx + v0 * drx, this._cornerA.y + u0 * dly + v0 * dry,
			this._cornerA.x + u1 * dlx + v0 * drx, this._cornerA.y + u1 * dly + v0 * dry,
			this._cornerA.x + u1 * dlx + v1 * drx, this._cornerA.y + u1 * dly + v1 * dry,
			this._cornerA.x + u0 * dlx + v1 * drx, this._cornerA.y + u0 * dly + v1 * dry
		];
	}

	/**
	 * Compute hole polygon points for a rectangle mask.
	 */
	private getRectMaskHolePoints(mask: RoomPlaneRectangleMask, leftLen: number, rightLen: number): number[] | null
	{
		const u0 = mask.leftSideLoc / leftLen;
		const v0 = mask.rightSideLoc / rightLen;
		const u1 = (mask.leftSideLoc + mask.leftSideLength) / leftLen;
		const v1 = (mask.rightSideLoc + mask.rightSideLength) / rightLen;

		const dxL = this._cornerD.x - this._cornerA.x;
		const dyL = this._cornerD.y - this._cornerA.y;
		const dxR = this._cornerB.x - this._cornerA.x;
		const dyR = this._cornerB.y - this._cornerA.y;

		return [
			this._cornerA.x + u0 * dxL + v0 * dxR, this._cornerA.y + u0 * dyL + v0 * dyR,
			this._cornerA.x + u1 * dxL + v0 * dxR, this._cornerA.y + u1 * dyL + v0 * dyR,
			this._cornerA.x + u1 * dxL + v1 * dxR, this._cornerA.y + u1 * dyL + v1 * dyR,
			this._cornerA.x + u0 * dxL + v1 * dxR, this._cornerA.y + u0 * dyL + v1 * dyR
		];
	}

	/**
	 * Helper: draw a polygon cutout on a canvas context.
	 */
	private drawMaskPoly(ctx: CanvasRenderingContext2D, points: number[]): void
	{
		ctx.beginPath();
		ctx.moveTo(points[0], points[1]);

		for (let j = 2; j < points.length; j += 2)
		{
			ctx.lineTo(points[j], points[j + 1]);
		}

		ctx.closePath();
		ctx.fill();
	}
}
