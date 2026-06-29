/**
 * RoomVisualization
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomVisualization
 *
 * Main visualization class for room rendering. Creates and manages planes
 * (floors, walls, landscapes) from RoomPlaneParser data.
 */
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import {RoomObjectSpriteVisualization} from '@room/object/visualization/RoomObjectSpriteVisualization';
import {RoomObjectSpriteType} from '@room/object/enum/RoomObjectSpriteType';
import {RoomPlane} from './RoomPlane';
import {Vector3d} from '@room/utils/Vector3d';
import {RoomPlaneData} from '@habbo/room/object/RoomPlaneData';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import {RoomVisualizationData} from './RoomVisualizationData';
import {RoomPlaneBitmapMaskParser} from '@habbo/room/object/RoomPlaneBitmapMaskParser';
import {Logger} from "@core";

const log = Logger.getLogger('RoomVisualization');

export class RoomVisualization extends RoomObjectSpriteVisualization
{
	// Floor colors (AS3: RoomVisualization.as lines 26-28)
	public static readonly FLOOR_COLOR_TOP: number = 0xFFFFFF;    // 16777215 (const_650)
	public static readonly FLOOR_COLOR_LEFT: number = 0xDDDDDD;   // 14540253 (const_802)
	public static readonly FLOOR_COLOR_RIGHT: number = 0xBBBBBB;  // 12303291 (FLOOR_COLOR_RIGHT)

	// Wall colors (AS3: RoomVisualization.as lines 30-33)
	public static readonly WALL_COLOR_TOP: number = 0xFFFFFF;     // 16777215 (const_1167, normal.y > 0)
	public static readonly WALL_COLOR_SIDE: number = 0xCCCCCC;    // 13421772 (WALL_COLOR_SIDE)
	public static readonly WALL_COLOR_BOTTOM: number = 0x999999;  // 10066329 (WALL_COLOR_BOTTOM)
	public static readonly WALL_COLOR_BORDER: number = 0x999999;  // 10066329 (WALL_COLOR_BORDER)

	// Landscape colors (AS3: RoomVisualization.as lines 35-37)
	public static readonly LANDSCAPE_COLOR_TOP: number = 0xFFFFFF;   // 16777215
	public static readonly LANDSCAPE_COLOR_SIDE: number = 0xCCCCCC;  // 13421772
	public static readonly LANDSCAPE_COLOR_BOTTOM: number = 0x999999; // 10066329

	private static readonly ROOM_DEPTH_OFFSET: number = 1000;
	private static readonly UPDATE_INTERVAL: number = 250;

	private _planes: RoomPlane[] = [];
	private _planeIndexMap: Map<number, number> = new Map();
	private _initialized: boolean = false;
	private _visiblePlanes: RoomPlane[] = [];
	private _visiblePlaneSpriteNumbers: number[] = [];
	private _planeTypeVisibility: boolean[] = [];

	private _floorType: string | null = null;
	private _wallType: string | null = null;
	private _landscapeType: string | null = null;

	private _floorThickness: number = NaN;
	private _wallThickness: number = NaN;

	private _backgroundColor: number = 0xFFFFFF;
	private _backgroundRed: number = 255;
	private _backgroundGreen: number = 255;
	private _backgroundBlue: number = 255;

	private _updateCount: number = 0;
	private _lastUpdateTime: number = -1000;
	private _geometryUpdateId: number = -1;

	private _geometryDirX: number = 0;
	private _geometryDirY: number = 0;
	private _geometryDirZ: number = 0;
	private _geometryScale: number = 0;

	private _maskParser: RoomPlaneBitmapMaskParser;
	private _maskXml: string | null = null;

	private _visualizationData: RoomVisualizationData | null = null;

	constructor()
	{
		super();

		this._planeTypeVisibility[0] = false;
		this._planeTypeVisibility[RoomPlane.TYPE_WALL] = true;
		this._planeTypeVisibility[RoomPlane.TYPE_FLOOR] = true;
		this._planeTypeVisibility[RoomPlane.TYPE_LANDSCAPE] = true;

		this._maskParser = new RoomPlaneBitmapMaskParser();
	}

	get floorRelativeDepth(): number
	{
		return RoomVisualization.ROOM_DEPTH_OFFSET + 0.1;
	}

	get wallRelativeDepth(): number
	{
		return RoomVisualization.ROOM_DEPTH_OFFSET + 0.5;
	}

	get planeCount(): number
	{
		return this._planes.length;
	}

	override dispose(): void
	{
		this.resetRoomPlanes();
		this._planes = [];
		this._planeIndexMap.clear();
		this._visiblePlanes = [];
		this._visiblePlaneSpriteNumbers = [];

		this._maskParser.dispose();

		super.dispose();
	}

	override initialize(data: IRoomObjectVisualizationData): boolean
	{
		this.reset();

		if (data instanceof RoomVisualizationData)
		{
			this._visualizationData = data;
		}

		return true;
	}

	override update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void
	{
		const roomObject = this.object;

		if (roomObject === null)
		{
			return;
		}

		if (geometry === null)
		{
			return;
		}

		const geometryUpdated = this.updateGeometry(geometry);
		const model = roomObject.getModel();

		this.initializeRoomPlanes();

		// Check for mask and color changes (AS3: updateMasksAndColors)
		let needsUpdate = this.updateMasksAndColors(model);

		// Check if enough time has passed for an update
		if (time < this._lastUpdateTime + RoomVisualization.UPDATE_INTERVAL && !geometryUpdated && !needsUpdate)
		{
			return;
		}

		// Update plane texture types and visibilities from model (AS3: updatePlaneTexturesAndVisibilities)
		if (this.updatePlaneTexturesAndVisibilities(model))
		{
			needsUpdate = true;
		}

		// Update planes
		if (this.updatePlanes(geometry, geometryUpdated, time))
		{
			needsUpdate = true;
		}

		if (needsUpdate)
		{
			// Apply background color to planes
			for (let i = 0; i < this._visiblePlanes.length; i++)
			{
				const spriteNumber = this._visiblePlaneSpriteNumbers[i];
				const sprite = this.getSprite(spriteNumber);
				const plane = this._visiblePlanes[i];

				if (sprite !== null && plane !== null && plane.type !== RoomPlane.TYPE_LANDSCAPE)
				{
					let color = plane.color;

					// Apply background color tinting
					const blue = (color & 0xFF) * this._backgroundBlue / 255;
					const green = ((color >> 8) & 0xFF) * this._backgroundGreen / 255;
					const red = ((color >> 16) & 0xFF) * this._backgroundRed / 255;
					const alpha = (color >> 24) & 0xFF;

					color = (alpha << 24) + (red << 16) + (green << 8) + blue;
					sprite.color = color;
				}
			}

			this.increaseUpdateId();
		}

		this._updateModelCounter = model?.getUpdateID() ?? 0;
		this._lastUpdateTime = time;
	}

	protected override reset(): void
	{
		super.reset();

		this._floorType = null;
		this._wallType = null;
		this._landscapeType = null;
		this._geometryUpdateId = -1;
		this._geometryScale = 0;
	}

	/**
	 * Initialize room planes from the RoomPlaneParser stored in the model.
	 * AS3 equivalent: reads "room_plane_xml" string from model, parses it with own RoomPlaneParser.
	 * Helium: reads the RoomPlaneParser object reference directly from the model.
	 */
	protected initializeRoomPlanes(): void
	{
		if (this._initialized)
		{
			return;
		}

		const model = this.object?.getModel();
		if (!model)
		{
			return;
		}

		// Read the RoomPlaneParser from the model (equivalent of AS3 "room_plane_xml")
		const planeParser = model.getObject(RoomObjectVariableEnum.ROOM_PLANE_PARSER) as RoomPlaneParser | null;

		if (!planeParser || planeParser.planeCount <= 0)
		{
			return;
		}

		this.createPlanesAndSprites(planeParser);

		log.debug(`[RoomVisualization] Created ${this._planes.length} planes`);
	}

	protected defineSprites(startIndex: number = 0): void
	{
		const count = this._planes.length;
		this.createSprites(count);

		for (let i = startIndex; i < count; i++)
		{
			const plane = this._planes[i];
			const sprite = this.getSprite(i);

			if (sprite !== null && plane !== null && plane.leftSide !== null && plane.rightSide !== null)
			{
				if (plane.type === RoomPlane.TYPE_WALL && (plane.leftSide.length < 1 || plane.rightSide.length < 1))
				{
					sprite.alphaTolerance = 256;
				}
				else
				{
					sprite.alphaTolerance = 128;
				}

				if (plane.type === RoomPlane.TYPE_WALL)
				{
					sprite.tag = `plane.wall@${i + 1}`;
				}
				else if (plane.type === RoomPlane.TYPE_FLOOR)
				{
					sprite.tag = `plane.floor@${i + 1}`;
				}
				else
				{
					sprite.tag = `plane@${i + 1}`;
				}

				sprite.spriteType = RoomObjectSpriteType.ROOM_PLANE;
			}
		}
	}

	protected updatePlanes(geometry: IRoomGeometry, geometryUpdated: boolean, time: number): boolean
	{
		const roomObject = this.object;

		if (roomObject === null)
		{
			return false;
		}

		if (geometry === null)
		{
			return false;
		}

		this._updateCount++;

		if (geometryUpdated)
		{
			this._visiblePlanes = [];
			this._visiblePlaneSpriteNumbers = [];
		}

		let updated = false;
		const visiblePlanesSet = this._visiblePlanes.length > 0;
		const planesToCheck = visiblePlanesSet ? this._visiblePlanes : this._planes;

		for (let i = 0; i < planesToCheck.length; i++)
		{
			let spriteIndex = i;

			if (visiblePlanesSet)
			{
				spriteIndex = this._visiblePlaneSpriteNumbers[i];
			}

			const sprite = this.getSprite(spriteIndex);

			if (sprite !== null)
			{
				const plane = planesToCheck[i];

				if (plane !== null)
				{
					sprite.planeId = plane.uniqueId;

					if (plane.update(geometry, time))
					{
						if (plane.visible)
						{
							let depth = plane.relativeDepth + this.floorRelativeDepth + spriteIndex / 1000;

							if (plane.type !== RoomPlane.TYPE_FLOOR)
							{
								depth = plane.relativeDepth + this.wallRelativeDepth + spriteIndex / 1000;

								if (plane.leftSide.length < 1 || plane.rightSide.length < 1)
								{
									depth += RoomVisualization.ROOM_DEPTH_OFFSET * 0.5;
								}
							}

							// Update PixiJS zIndex for proper rendering order
							plane.displayObject.zIndex = -depth;

							this.updateSprite(sprite, plane, `plane ${spriteIndex} ${geometry.scale}`, depth);
						}

						updated = true;
					}

					const visibility = plane.visible && this._planeTypeVisibility[plane.type];

					if (sprite.visible !== visibility)
					{
						sprite.visible = visibility;
						updated = true;
					}

					if (sprite.visible && !visiblePlanesSet)
					{
						this._visiblePlanes.push(plane);
						this._visiblePlaneSpriteNumbers.push(i);
					}
				}
				else
				{
					sprite.planeId = 0;

					if (sprite.visible)
					{
						sprite.visible = false;
						updated = true;
					}
				}
			}
		}

		return updated;
	}

	/**
	 * Create planes from the RoomPlaneParser data.
	 * Based on AS3: RoomVisualization.createPlanesAndSprites() lines 569-700
	 * + AS3: RoomEngine.createRoom() door mask application (lines 3044-3076)
	 */
	private createPlanesAndSprites(planeParser: RoomPlaneParser): void
	{
		const origin = this.object!.getLocation();
		const randomSeed = Math.floor(Math.random() * 10000);

		for (let i = 0; i < planeParser.planeCount; i++)
		{
			const location = planeParser.getPlaneLocation(i);
			const leftSide = planeParser.getPlaneLeftSide(i);
			const rightSide = planeParser.getPlaneRightSide(i);
			const type = planeParser.getPlaneType(i);
			const secondaryNormals = planeParser.getPlaneSecondaryNormals(i);

			if (!location || !leftSide || !rightSide)
			{
				continue;
			}

			const normal = Vector3d.crossProduct(leftSide, rightSide);

			let planeType: number;
			let color: number;

			// Map type and color according to AS3 createPlanesAndSprites (lines 607-668)
			if (type === RoomPlaneData.PLANE_FLOOR)
			{
				planeType = RoomPlane.TYPE_FLOOR;

				if (normal !== null && normal.z !== 0)
				{
					color = RoomVisualization.FLOOR_COLOR_TOP;
				}
				else if (normal !== null && normal.x !== 0)
				{
					color = RoomVisualization.FLOOR_COLOR_RIGHT;
				}
				else
				{
					color = RoomVisualization.FLOOR_COLOR_LEFT;
				}
			}
			else if (type === RoomPlaneData.PLANE_WALL)
			{
				planeType = RoomPlane.TYPE_WALL;

				if (normal !== null && normal.x === 0 && normal.y === 0)
				{
					color = RoomVisualization.WALL_COLOR_BOTTOM;
				}
				else if (normal !== null && normal.y > 0)
				{
					color = RoomVisualization.WALL_COLOR_TOP;
				}
				else if (normal !== null && normal.y === 0)
				{
					color = RoomVisualization.WALL_COLOR_SIDE;
				}
				else
				{
					color = RoomVisualization.WALL_COLOR_BOTTOM;
				}
			}
			else if (type === RoomPlaneData.PLANE_LANDSCAPE)
			{
				planeType = RoomPlane.TYPE_LANDSCAPE;

				if (normal !== null && normal.y > 0)
				{
					color = RoomVisualization.LANDSCAPE_COLOR_TOP;
				}
				else if (normal !== null && normal.y === 0)
				{
					color = RoomVisualization.LANDSCAPE_COLOR_SIDE;
				}
				else
				{
					color = RoomVisualization.LANDSCAPE_COLOR_BOTTOM;
				}
			}
			else
			{
				continue;
			}

			const plane = new RoomPlane(
				origin,
				location,
				leftSide,
				rightSide,
				planeType,
				true,
				secondaryNormals.length > 0 ? secondaryNormals : null,
				randomSeed
			);

			plane.color = color;

			// Assign rasterizer from visualization data
			if (this._visualizationData !== null)
			{
				if (planeType === RoomPlane.TYPE_FLOOR)
				{
					plane.rasterizer = this._visualizationData.floorRasterizer;
				}
				else if (planeType === RoomPlane.TYPE_WALL)
				{
					plane.rasterizer = this._visualizationData.wallRasterizer;
				}
			}

			// Thin walls without texture (AS3 lines 624-626)
			if (planeType === RoomPlane.TYPE_WALL)
			{
				if (leftSide.length < 1 || rightSide.length < 1)
				{
					plane.hasTexture = false;
				}
			}

			this._planeIndexMap.set(i, this._planes.length);
			this._planes.push(plane);
		}

		this._initialized = true;

		this.defineSprites();
	}

	/**
	 * Update plane texture types and visibilities from the room model.
	 * Based on AS3 RoomVisualization.updatePlaneTexturesAndVisibilities()
	 */
	private updatePlaneTexturesAndVisibilities(model: any): boolean
	{
		if (!model) return false;

		if (this._updateModelCounter !== model.getUpdateID())
		{
			const wallType = model.getString(RoomObjectVariableEnum.ROOM_WALL_TYPE) as string | null;
			const floorType = model.getString(RoomObjectVariableEnum.ROOM_FLOOR_TYPE) as string | null;
			const landscapeType = model.getString(RoomObjectVariableEnum.ROOM_LANDSCAPE_TYPE) as string | null;

			this.updatePlaneTextureTypes(
				floorType ?? 'default',
				wallType ?? 'default',
				landscapeType ?? 'default'
			);

			const floorVisible = model.getNumber(RoomObjectVariableEnum.ROOM_FLOOR_VISIBILITY);
			const wallVisible = model.getNumber(RoomObjectVariableEnum.ROOM_WALL_VISIBILITY);
			const landscapeVisible = model.getNumber(RoomObjectVariableEnum.ROOM_LANDSCAPE_VISIBILITY);

			this.updatePlaneTypeVisibilities(
				isNaN(floorVisible) ? true : !!floorVisible,
				isNaN(wallVisible) ? true : !!wallVisible,
				isNaN(landscapeVisible) ? true : !!landscapeVisible
			);

			return true;
		}

		return false;
	}

	/**
	 * Set plane IDs based on floor/wall/landscape type strings.
	 * Based on AS3 RoomVisualization.updatePlaneTextureTypes()
	 */
	private updatePlaneTextureTypes(floorType: string, wallType: string, landscapeType: string): boolean
	{
		let changed = false;

		if (floorType !== this._floorType)
		{
			this._floorType = floorType;
			changed = true;
		}
		else
		{
			floorType = '';
		}

		if (wallType !== this._wallType)
		{
			this._wallType = wallType;
			changed = true;
		}
		else
		{
			wallType = '';
		}

		if (landscapeType !== this._landscapeType)
		{
			this._landscapeType = landscapeType;
			changed = true;
		}
		else
		{
			landscapeType = '';
		}

		if (!changed) return false;

		for (const plane of this._planes)
		{
			if (plane.type === RoomPlane.TYPE_FLOOR && floorType)
			{
				plane.id = floorType;
			}
			else if (plane.type === RoomPlane.TYPE_WALL && wallType)
			{
				plane.id = wallType;
			}
			else if (plane.type === RoomPlane.TYPE_LANDSCAPE && landscapeType)
			{
				plane.id = landscapeType;
			}
		}

		return true;
	}

	/**
	 * Update plane type visibility flags.
	 * Based on AS3 RoomVisualization.updatePlaneTypeVisibilities()
	 */
	private updatePlaneTypeVisibilities(floor: boolean, wall: boolean, landscape: boolean): void
	{
		if (floor !== this._planeTypeVisibility[RoomPlane.TYPE_FLOOR]
			|| wall !== this._planeTypeVisibility[RoomPlane.TYPE_WALL]
			|| landscape !== this._planeTypeVisibility[RoomPlane.TYPE_LANDSCAPE])
		{
			this._planeTypeVisibility[RoomPlane.TYPE_FLOOR] = floor;
			this._planeTypeVisibility[RoomPlane.TYPE_WALL] = wall;
			this._planeTypeVisibility[RoomPlane.TYPE_LANDSCAPE] = landscape;
			this._visiblePlanes = [];
			this._visiblePlaneSpriteNumbers = [];
		}
	}

	/**
	 * Check for mask and background color changes in the model.
	 * Based on AS3 RoomVisualization.updateMasksAndColors()
	 */
	private updateMasksAndColors(model: any): boolean
	{
		if (!model) return false;

		let changed = false;

		if (this._updateModelCounter !== model.getUpdateID())
		{
			// Check mask XML changes
			const maskXml = model.getString(RoomObjectVariableEnum.ROOM_PLANE_MASK_XML) as string | null;

			if (maskXml && maskXml !== this._maskXml)
			{
				this.updatePlaneMasks(maskXml);
				this._maskXml = maskXml;
				changed = true;
			}

			// Check background color changes
			const bgColor = model.getNumber(RoomObjectVariableEnum.ROOM_BACKGROUND_COLOR);

			if (!isNaN(bgColor) && bgColor !== this._backgroundColor)
			{
				this._backgroundColor = bgColor;
				this._backgroundBlue = bgColor & 0xFF;
				this._backgroundGreen = (bgColor >> 8) & 0xFF;
				this._backgroundRed = (bgColor >> 16) & 0xFF;
				changed = true;
			}
		}

		return changed;
	}

	/**
	 * Apply bitmap masks to planes from parsed mask XML.
	 * Based on AS3 RoomVisualization.updatePlaneMasks() lines 466-547
	 *
	 * For each mask, finds matching wall/landscape planes via scalar projection
	 * and adds bitmap masks to them.
	 */
	private updatePlaneMasks(xmlString: string): void
	{
		if (!xmlString) return;

		this._maskParser.initialize(xmlString);

		const landscapePlaneIndices: number[] = [];
		const activeLandscapePlanes: number[] = [];
		let visibilityChanged = false;

		// Reset all bitmap masks and track landscape planes
		for (let i = 0; i < this._planes.length; i++)
		{
			const plane = this._planes[i];

			if (plane)
			{
				plane.resetBitmapMasks();

				if (plane.type === RoomPlane.TYPE_LANDSCAPE)
				{
					landscapePlaneIndices.push(i);
				}
			}
		}

		// Apply masks to matching planes
		for (let maskIdx = 0; maskIdx < this._maskParser.maskCount; maskIdx++)
		{
			const maskType = this._maskParser.getMaskType(maskIdx);
			const maskLoc = this._maskParser.getMaskLocation(maskIdx);
			const maskCategory = this._maskParser.getMaskCategory(maskIdx);

			if (!maskLoc) continue;

			for (let planeIdx = 0; planeIdx < this._planes.length; planeIdx++)
			{
				const plane = this._planes[planeIdx];

				if (plane.type !== RoomPlane.TYPE_WALL && plane.type !== RoomPlane.TYPE_LANDSCAPE) continue;

				const loc = plane.location as Vector3d;
				const normal = plane.normal as Vector3d;
				const diff = Vector3d.dif(maskLoc, loc);

				if (!diff) continue;

				// Check if mask position is ON the plane surface
				const normalDist = Math.abs(Vector3d.scalarProjection(diff, normal));

				if (normalDist < 0.01)
				{
					const leftSideLoc = Vector3d.scalarProjection(diff, plane.leftSide as Vector3d);
					const rightSideLoc = Vector3d.scalarProjection(diff, plane.rightSide as Vector3d);

					if (plane.type === RoomPlane.TYPE_WALL || (plane.type === RoomPlane.TYPE_LANDSCAPE && maskCategory === 'hole'))
					{
						if (maskType)
						{
							plane.addBitmapMask(maskType, leftSideLoc, rightSideLoc);
						}
					}
					else if (plane.type === RoomPlane.TYPE_LANDSCAPE)
					{
						if (!plane.canBeVisible)
						{
							visibilityChanged = true;
						}

						plane.canBeVisible = true;
						activeLandscapePlanes.push(planeIdx);
					}
				}
			}
		}

		// Hide landscape planes that don't have any active masks
		for (const idx of landscapePlaneIndices)
		{
			if (!activeLandscapePlanes.includes(idx))
			{
				const plane = this._planes[idx];

				if (plane.canBeVisible)
				{
					plane.canBeVisible = false;
					visibilityChanged = true;
				}
			}
		}

		// Reset visible plane cache if visibility changed
		if (visibilityChanged)
		{
			this._visiblePlanes = [];
			this._visiblePlaneSpriteNumbers = [];
		}
	}

	/**
	 * Update sprite data from a plane.
	 * AS3: updateSprite() sets sprite.asset = getPlaneBitmap(plane, name).
	 *
	 * @see sources/win63_version/habbo/room/object/visualization/room/RoomVisualization.as
	 */
	private updateSprite(sprite: IRoomObjectSprite, plane: RoomPlane, name: string, depth: number): void
	{
		const offset = plane.offset;

		sprite.offsetX = -offset.x;
		sprite.offsetY = -offset.y;
		sprite.relativeDepth = depth;
		sprite.color = plane.color;

		// AS3: sprite.asset = getPlaneBitmap(plane, name)
		const planeTexture = plane.copyBitmapData();

		if (planeTexture !== null)
		{
			sprite.texture = planeTexture;
		}

		sprite.assetName = `${name}_${this._updateCount}`;
	}

	private updateGeometry(geometry: IRoomGeometry): boolean
	{
		if (geometry.updateId !== this._geometryUpdateId)
		{
			this._geometryUpdateId = geometry.updateId;

			const direction = geometry.direction;

			if (direction !== null &&
				(direction.x !== this._geometryDirX ||
					direction.y !== this._geometryDirY ||
					direction.z !== this._geometryDirZ ||
					geometry.scale !== this._geometryScale))
			{
				this._geometryDirX = direction.x;
				this._geometryDirY = direction.y;
				this._geometryDirZ = direction.z;
				this._geometryScale = geometry.scale;

				return true;
			}
		}

		return false;
	}

	private resetRoomPlanes(): void
	{
		for (const plane of this._planes)
		{
			if (plane !== null)
			{
				plane.dispose();
			}
		}

		this._planes = [];
		this._planeIndexMap.clear();
		this._initialized = false;
		this._updateCount++;

		this.reset();
	}
}
