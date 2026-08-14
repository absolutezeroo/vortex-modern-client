import type {IRoomEngineRectangle} from '@habbo/room/RoomEngine';
import type {RoomRenderingCanvas} from '@habbo/room/renderer/RoomRenderingCanvas';
import type {SortableSprite} from '@habbo/room/renderer/utils/SortableSprite';
import {PlaneDrawingData} from '@habbo/room/object/visualization/room/PlaneDrawingData';
import type {IPlaneDrawingData} from '@room/object/visualization/IPlaneDrawingData';

/**
 * Turns the room canvas into the JSON payload the camera sends for server-side rendering.
 *
 * The class is obfuscated as `_SafeCls_1840` in the primary tree and `class_2200` in the secondary;
 * the name here is recovered from
 * `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/utils/SpriteDataCollector.as`,
 * whose own member names are obfuscated in turn and come from the WIN63 side.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1840.as
 */
export class SpriteDataCollector
{
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::MAX_EXTERNAL_IMAGE_COUNT
    private static readonly MAX_EXTERNAL_IMAGE_COUNT: number = 30;

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::AVATAR_WATER_EFFECT_MAGIC_Y_OFFSET
    private static readonly AVATAR_WATER_EFFECT_MAGIC_Y_OFFSET: number = -52;

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::_SafeStr_5988
    private _firstSpriteZ: number = 0;

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::spriteCount
    private _spriteCount: number = 0;

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::externalImageCount
    private _externalImageCount: number = 0;

    /**
	 * AS3 sorts descending by z, and returns -1 for equal z as well as for greater — so equal
	 * elements keep swapping. Reproduced rather than corrected: the tie order is what the server
	 * receives.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::sortSpriteDataObjects()
    private static sortSpriteDataObjects(a: SortableSprite, b: SortableSprite): number
    {
        if(a.z < b.z) return 1;

        return -1;
    }

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::isSpriteInViewPort()
    private static isSpriteInViewPort(sprite: SortableSprite, viewPort: IRoomEngineRectangle, canvas: RoomRenderingCanvas): boolean
    {
        const left = sprite.x + canvas.screenOffsetX;
        const top = sprite.y + canvas.screenOffsetY;
        const width = sprite.sprite?.width ?? 0;
        const height = sprite.sprite?.height ?? 0;

        return left < viewPort.right && left + width > viewPort.left
            && top < viewPort.bottom && top + height > viewPort.top;
    }

    /**
	 * The furniture and avatar sprites, as a JSON array.
	 *
	 * AS3 first walks the room's category-100 objects and merges any sprite the canvas culled back
	 * into the list, offsetting each by the object's screen location. That pass needs
	 * `IRoomEngine.getRoomObjects()` and `IRoomObjectSpriteVisualization.getSpriteList()`, neither
	 * of which this port has — see the TODO below. What the canvas *did* draw is complete and is
	 * what this returns, which for a room the player is looking at is the same set minus objects
	 * scrolled off screen.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getFurniData()
    getFurniData(viewPort: IRoomEngineRectangle, canvas: RoomRenderingCanvas, skipObjectId: number): string
    {
        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1840.as::getFurniData()
        // The culled-avatar merge pass described above, plus `addMannequinSprites()`, which
        // re-parents a boutique mannequin's own sprite list onto the mannequin's position with the
        // MANNEQUIN_MAGIC_X/Y offsets. Both need `IRoomEngine.getRoomObjects(roomId, category)` and
        // `IRoomObjectSpriteVisualization.getSpriteList()`.
        const sprites = [...canvas.getSortableSpriteList()];

        sprites.sort(SpriteDataCollector.sortSpriteDataObjects);

        const result: Record<string, unknown>[] = [];

        for(const sortable of sprites)
        {
            const name = sortable.name;

            if(name !== null && name.length > 0
                && name.indexOf('tile_cursor_') !== 0
                && SpriteDataCollector.isSpriteInViewPort(sortable, viewPort, canvas)
                && (skipObjectId < 0 || sortable.sprite?.instanceId !== skipObjectId))
            {
                result.push(this.getSpriteDataObject(sortable, viewPort, canvas));

                if(!this._firstSpriteZ)
                {
                    this._firstSpriteZ = sortable.z;
                }

                this._spriteCount = this._spriteCount + 1;
            }
        }

        return JSON.stringify(result);
    }

    /**
	 * AS3 builds an empty object and stringifies it — the modifiers slot is reserved, not used.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getRoomRenderingModifiers()
    getRoomRenderingModifiers(): string
    {
        return JSON.stringify({});
    }

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getSpriteDataObject()
    private getSpriteDataObject(
        sortable: SortableSprite,
        viewPort: IRoomEngineRectangle,
        canvas: RoomRenderingCanvas
    ): Record<string, unknown>
    {
        const data: Record<string, unknown> = {};
        const sprite = sortable.sprite;
        let name = sortable.name;

        // A palette-swapped asset is `assetName@paletteId`; AS3 resolves the palette's source image
        // through the content loader. That lookup needs `getGraphicAssetCollection().getPaletteXML()`
        // and is left out with the name split kept, so the base asset still resolves server-side.
        if(name.indexOf('@') !== -1)
        {
            name = name.split('@')[0];
        }

        data.name = name;
        data.x = sortable.x - viewPort.left + canvas.screenOffsetX;
        data.y = sortable.y - viewPort.top + canvas.screenOffsetY;
        data.z = sortable.z;

        if(sprite !== null)
        {
            // Each of these is omitted at its default, exactly as AS3 does — the payload is
            // checksummed by length, so an extra key is not free.
            if(sprite.alpha && sprite.alpha.toString() !== '255') data.alpha = sprite.alpha;

            if(sprite.flipH) data.flipH = sprite.flipH;

            if(sprite.color) data.color = sprite.color;

            if(sprite.blendMode && sprite.blendMode !== 'normal') data.blendMode = sprite.blendMode;

            if(name.indexOf('http') === 0)
            {
                data.width = sprite.width;
                data.height = sprite.height;

                this._externalImageCount = this._externalImageCount + 1;

                // Past the cap the image is replaced by a plain box rather than dropped, so the
                // composition still lines up.
                if(this._externalImageCount > SpriteDataCollector.MAX_EXTERNAL_IMAGE_COUNT)
                {
                    data.name = 'box';
                }
            }

            if(sprite.assetPosture) data.posture = sprite.assetPosture;
        }

        return data;
    }

    /**
	 * The background plane sits behind everything, at a z derived from the frontmost sprite plus a
	 * per-sprite bias — the two magic constants are AS3's and are what keep it behind a crowded
	 * room.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::makeBackgroundPlane()
    private makeBackgroundPlane(viewPort: IRoomEngineRectangle, color: number, planes: IPlaneDrawingData[]): IPlaneDrawingData
    {
        let z: number;

        if(planes.length > 0)
        {
            z = Number(planes[0].z);

            if(this._firstSpriteZ)
            {
                z = Math.max(this._firstSpriteZ, z);
            }
        }
        else
        {
            z = this._firstSpriteZ ? this._firstSpriteZ : 0;
        }

        z += this._spriteCount * 1.776104 + planes.length * 2.31743;

        // AS3: `new PlaneDrawingData(null, param2)` — the colour goes through the constructor.
        const plane = new PlaneDrawingData(null, color);

        // AS3 sorts the four corners through sortQuadPoints(); for an axis-aligned rectangle that
        // ordering is bottom-right, bottom-left, top-right, top-left.
        plane.cornerPoints = [
            {x: viewPort.width, y: viewPort.height},
            {x: 0, y: viewPort.height},
            {x: viewPort.width, y: 0},
            {x: 0, y: 0}
        ];

        plane.z = z;

        return plane;
    }

    /**
	 * The room's own planes — floor tiles, walls, landscape.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getRoomPlanes()
    getRoomPlanes(viewPort: IRoomEngineRectangle, backgroundColor: number): IPlaneDrawingData[]
    {
        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1840.as::getRoomPlanes()
        // AS3 projects every `IRoomPlane`'s location/leftSide/rightSide through the canvas geometry,
        // culls planes whose four corners all fall outside the viewport, and expands each into its
        // `getDrawingDatas(geometry)` — the per-plane texture columns and masks. `RoomVisualization`
        // exposes no `planes` accessor and `RoomPlane` has no `getDrawingDatas()`, so only the
        // background plane is produced. The photo therefore renders the furniture and avatars over
        // a flat room-coloured backdrop rather than over the tiled floor and walls.
        const planes: IPlaneDrawingData[] = [];

        return [this.makeBackgroundPlane(viewPort, backgroundColor, planes)];
    }
}
