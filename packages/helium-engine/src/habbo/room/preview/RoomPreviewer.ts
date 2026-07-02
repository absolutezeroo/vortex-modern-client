import type {Container} from 'pixi.js';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {RoomPlaneParser} from '@habbo/room/object/RoomPlaneParser';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

/**
 * Renders a small, isolated room used to preview a single furniture item
 * (or, in AS3, an avatar/pet) outside of any real room the user is in.
 *
 * Based on AS3 com.sulake.habbo.room.preview.RoomPreviewer
 *
 * TS simplifications (Phase 1 — see FurniView's class doc comment):
 * - No avatar/pet preview support (only addFurnitureIntoRoom/addWallItemIntoRoom).
 * - Camera centers on the preview object's actual bounding rectangle every
 *   frame, but skips AS3's auto-zoom scale switching
 *   (validatePreviewSize's SCALE_NORMAL/SCALE_SMALL flip based on how much of
 *   the canvas the object fills) — always renders at SCALE_NORMAL.
 * - updateRoomWallsAndFloorVisibility() is a TODO(AS3) no-op until
 *   RoomEngine.updateObjectRoomVisibilities() exists.
 */
export class RoomPreviewer
{
	private static readonly PREVIEW_OBJECT_ID = 1;
	private static readonly PREVIEW_OBJECT_LOCATION_X = 2;
	private static readonly PREVIEW_OBJECT_LOCATION_Y = 2;
	private static readonly PREVIEW_TILE_MAP_SIZE = 7;

	public static readonly SCALE_NORMAL = 64;
	public static readonly SCALE_SMALL = 32;

	private _roomEngine: IRoomEngine | null;
	private _previewRoomId: number;
	private _currentCategory: number = -2;
	private _currentType: number = -1;
	private _currentExtra: string = '';
	private _scale: number = RoomPreviewer.SCALE_NORMAL;
	private _canvasWidth: number = 0;
	private _canvasHeight: number = 0;

	private readonly _updatePreviewRoomViewBound = (): void => this.updatePreviewRoomView();

	constructor(roomEngine: IRoomEngine, previewRoomId: number)
	{
		this._roomEngine = roomEngine;
		this._previewRoomId = previewRoomId;

		// TS deviation: AS3 recomputes the camera framing from a continuous
		// per-frame tick (registerUpdateReceiver) plus REOE_ADDED/
		// REOE_CONTENT_UPDATED listeners that invalidate the cached bounding
		// rect (see class doc comment) — this port doesn't have that same
		// content-loaded event, so it just re-centers every frame instead,
		// reusing the same ticker RoomPreviewerWidget uses for canvas position.
		roomEngine.registerCanvasSyncCallback(this._updatePreviewRoomViewBound);
	}

	get previewRoomId(): number
	{
		return this._previewRoomId;
	}

	get isRoomEngineReady(): boolean
	{
		return this._roomEngine !== null;
	}

	dispose(): void
	{
		this.reset(true);
		this._roomEngine?.unregisterCanvasSyncCallback(this._updatePreviewRoomViewBound);
		this._roomEngine = null;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::createRoomForPreviews()
	createRoomForPreviews(): void
	{
		if (!this._roomEngine) return;

		const size = RoomPreviewer.PREVIEW_TILE_MAP_SIZE;
		const parser = new RoomPlaneParser();

		parser.initializeTileMap(size + 2, size + 2);

		for (let y = 1; y < 1 + size; y++)
		{
			for (let x = 1; x < 1 + size; x++)
			{
				parser.setTileHeight(x, y, 0);
			}
		}

		parser.initializeFromTileData();
		this._roomEngine.initializeRoom(this._previewRoomId, parser);
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::reset()
	reset(disposing: boolean): void
	{
		if (this._roomEngine)
		{
			this._roomEngine.disposeObjectFurniture(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);
			this._roomEngine.disposeObjectWallItem(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);
			this._roomEngine.disposeObjectUser(this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID);

			if (!disposing)
			{
				this.updatePreviewRoomView();
			}
		}

		this._currentCategory = -2;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::addFurnitureIntoRoom()
	addFurnitureIntoRoom(type: number, direction: IVector3d, stuffData: unknown = null, extra: string | null = null): number
	{
		if (!this.isRoomEngineReady) return -1;

		if (this._currentCategory === RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE && this._currentType === type)
		{
			return 1;
		}

		this.reset(false);
		this._currentType = type;
		this._currentCategory = RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE;
		this._currentExtra = '';

		const legacyString = (stuffData as {getLegacyString?: () => string} | null)?.getLegacyString?.() ?? extra ?? '';

		const success = this._roomEngine!.addRoomObjectFurniture(
			this._previewRoomId,
			RoomPreviewer.PREVIEW_OBJECT_ID,
			type,
			new Vector3d(RoomPreviewer.PREVIEW_OBJECT_LOCATION_X, RoomPreviewer.PREVIEW_OBJECT_LOCATION_Y, 0),
			direction,
			0,
			legacyString,
			-1,
			0,
			0,
			null,
			true
		);

		if (success)
		{
			this.updatePreviewRoomView();

			return 1;
		}

		return -1;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::addWallItemIntoRoom()
	addWallItemIntoRoom(type: number, direction: IVector3d, legacyString: string): number
	{
		if (!this.isRoomEngineReady) return -1;

		if (this._currentCategory === RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL && this._currentType === type && this._currentExtra === legacyString)
		{
			return 1;
		}

		this.reset(false);
		this._currentType = type;
		this._currentCategory = RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;
		this._currentExtra = legacyString;

		const success = this._roomEngine!.addRoomObjectWallItem(
			this._previewRoomId,
			RoomPreviewer.PREVIEW_OBJECT_ID,
			type,
			new Vector3d(0.5, 2.3, 1.8),
			direction,
			0,
			legacyString,
			0,
			null
		);

		if (success)
		{
			this.updatePreviewRoomView();

			return 1;
		}

		return -1;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateObjectRoom()
	updateObjectRoom(floorType: string | null = null, wallType: string | null = null, landscapeType: string | null = null): boolean
	{
		if (!this.isRoomEngineReady) return false;

		this._roomEngine!.initializeRoomVisuals(this._previewRoomId, floorType ?? '101', wallType ?? '101', landscapeType ?? '1.1', 0);

		return true;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updateRoomWallsAndFloorVisibility()
	// TODO(AS3): needs RoomEngine.updateObjectRoomVisibilities() (not built yet) —
	// walls/floor always stay visible in the preview for now.
	updateRoomWallsAndFloorVisibility(_hideWalls: boolean, _hideFloor: boolean = true): void
	{
		// Not wired yet.
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::getRoomCanvas()
	getRoomCanvas(width: number, height: number): Container | null
	{
		if (!this._roomEngine) return null;

		const canvas = this._roomEngine.createRoomCanvas(this._previewRoomId, 1, width, height, this._scale);

		this._roomEngine.setRoomCanvasMask(this._previewRoomId, 1, true);
		this._canvasWidth = width;
		this._canvasHeight = height;

		return canvas;
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::modifyRoomCanvas()
	modifyRoomCanvas(width: number, height: number): void
	{
		if (!this._roomEngine) return;

		this._canvasWidth = width;
		this._canvasHeight = height;
		this._roomEngine.modifyRoomCanvas(this._previewRoomId, 1, width, height);
	}

	// AS3: sources/win63_version/habbo/room/preview/RoomPreviewer.as::updatePreviewRoomView()
	// TODO(AS3): skips the real auto-zoom math (validatePreviewSize's scale
	// switching) — always centers at the current scale using the preview
	// object's actual on-screen bounding rectangle instead of a fixed offset.
	updatePreviewRoomView(): void
	{
		if (!this.isRoomEngineReady || this._currentCategory < 0) return;

		const bounds = this._roomEngine!.getRoomObjectBoundingRectangle(
			this._previewRoomId, RoomPreviewer.PREVIEW_OBJECT_ID, this._currentCategory, 1
		);

		if (!bounds || (bounds.width <= 0 && bounds.height <= 0)) return;

		const currentOffset = this._roomEngine!.getRoomCanvasScreenOffset(this._previewRoomId, 1) ?? {x: 0, y: 0};

		const objectCenterX = (bounds.left + bounds.right) / 2;
		const objectCenterY = (bounds.top + bounds.bottom) / 2;
		const canvasCenterX = this._canvasWidth / 2;
		const canvasCenterY = this._canvasHeight / 2;

		this._roomEngine!.setRoomCanvasScreenOffset(this._previewRoomId, 1, {
			x: currentOffset.x + (canvasCenterX - objectCenterX),
			y: currentOffset.y + (canvasCenterY - objectCenterY),
		});
	}
}
