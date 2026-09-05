// The concrete engine, not `IRoomEngine`, because that is what AS3 takes here
// (`getFurniData(..., param3:_SafeCls_90, ...)`): `getRoomObjects()` is declared on the class and
// not on the interface, in AS3 as here.
import type {IRoomEngineRectangle, RoomEngine} from '@habbo/room/RoomEngine';
import type {RoomRenderingCanvas} from '@habbo/room/renderer/RoomRenderingCanvas';
import {PlaneDrawingData} from '@habbo/room/object/visualization/room/PlaneDrawingData';
import type {IPlaneDrawingData} from '@room/object/visualization/IPlaneDrawingData';
import {RoomObjectSpriteData} from '@room/data/RoomObjectSpriteData';
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IRoomObjectSpriteVisualization} from '@room/object/visualization/IRoomObjectSpriteVisualization';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

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

    /** The one object type whose room sprite is a placeholder for a figure. */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::addMannequinSprites() ("boutique_mannequin1")
    private static readonly MANNEQUIN_OBJECT_TYPE: string = 'boutique_mannequin1';

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::addMannequinSprites() ("mannequin_")
    private static readonly MANNEQUIN_SPRITE_PREFIX: string = 'mannequin_';

    /** AS3's `+ -16` on the mannequin's bottom edge. */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::addMannequinSprites()
    private static readonly MANNEQUIN_Y_OFFSET: number = 16;

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
    private static sortSpriteDataObjects(a: RoomObjectSpriteData, b: RoomObjectSpriteData): number
    {
        if(a.z < b.z) return 1;

        return -1;
    }

    /**
	 * Replaces a boutique mannequin's placeholder sprite with the mannequin's own sprite list,
	 * re-parented onto where the placeholder sat.
	 *
	 * The mannequin draws as one `mannequin_*` sprite in the room, but the photo needs the clothes
	 * on it — so the object's real sprite list is fetched and each part offset onto the
	 * placeholder's position. The `+ width / 2 + 1` and `+ height - 16` are AS3's literals: the
	 * parts are authored around the figure's own origin, which is the bottom centre of the
	 * placeholder, less sixteen.
	 *
	 * DEVIATION: AS3 pushes the live `IRoomObjectSprite`s straight into the payload vector and adds
	 *   the offsets **to the sprites themselves** — its sprite and its `RoomObjectSpriteData` are
	 *   duck-compatible, so it gets away with it, and the mannequin visibly drifts in the room for
	 *   as long as the photo is being composed. Here each part is converted into its own record
	 *   first, so the offsets land on the payload and never on the room.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::addMannequinSprites()
    private static addMannequinSprites(sprites: RoomObjectSpriteData[], engine: RoomEngine): RoomObjectSpriteData[]
    {
        const result: RoomObjectSpriteData[] = [];

        for(const data of sprites)
        {
            if(data.objectType !== SpriteDataCollector.MANNEQUIN_OBJECT_TYPE
                || data.name.indexOf(SpriteDataCollector.MANNEQUIN_SPRITE_PREFIX) !== 0)
            {
                result.push(data);

                continue;
            }

            const object = engine.getRoomObject(
                engine.activeRoomId, data.objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
            );
            const parts = (object?.getVisualization() as IRoomObjectSpriteVisualization | null)?.getSpriteList() ?? null;

            if(parts === null) continue;

            for(const part of parts)
            {
                const partData = SpriteDataCollector.fromSprite(part, data.objectId);

                partData.x += data.x + data.width / 2 + 1;
                partData.y += data.y + data.height - SpriteDataCollector.MANNEQUIN_Y_OFFSET;
                partData.z += data.z;

                result.push(partData);
            }
        }

        return result;
    }

    /**
	 * A payload record for a sprite the canvas did not draw.
	 *
	 * The culled and mannequin passes both start from a visualization's raw sprite list, where a
	 * sprite carries `offsetX`/`offsetY`/`relativeDepth` rather than a resolved screen position —
	 * so those are what seed x/y/z, and the caller adds the object's own location on top.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getFurniData()
    private static fromSprite(sprite: IRoomObjectSprite, objectId: number): RoomObjectSpriteData
    {
        const data = new RoomObjectSpriteData();

        data.objectId = objectId;
        data.x = sprite.offsetX;
        data.y = sprite.offsetY;
        data.z = sprite.relativeDepth;
        data.name = sprite.libraryAssetName;
        data.flipH = sprite.flipH;
        data.alpha = sprite.alpha;
        data.color = sprite.color.toString();
        data.blendMode = sprite.blendMode;
        data.width = sprite.width;
        data.height = sprite.height;
        data.objectType = sprite.objectType ?? '';
        data.posture = sprite.assetPosture ?? '';

        return data;
    }

    // AS3: .../habbo/room/utils/_SafeCls_1840.as::isSpriteInViewPort()
    private static isSpriteInViewPort(sprite: RoomObjectSpriteData, viewPort: IRoomEngineRectangle, canvas: RoomRenderingCanvas): boolean
    {
        const left = sprite.x + canvas.screenOffsetX;
        const top = sprite.y + canvas.screenOffsetY;

        return left < viewPort.right && left + sprite.width > viewPort.left
            && top < viewPort.bottom && top + sprite.height > viewPort.top;
    }

    /**
	 * The furniture and avatar sprites, as a JSON array.
	 *
	 * Three passes, in AS3's order: what the canvas drew, then every category-100 object's own
	 * sprite list merged in — which is what puts an avatar the canvas scrolled off screen back into
	 * the photo — then the mannequins expanded. Only after that is the lot sorted and filtered to
	 * the viewport, because the merged sprites have to sort among the drawn ones.
	 */
    // AS3: .../habbo/room/utils/_SafeCls_1840.as::getFurniData()
    getFurniData(
        viewPort: IRoomEngineRectangle,
        canvas: RoomRenderingCanvas,
        engine: RoomEngine,
        skipObjectId: number
    ): string
    {
        let sprites = canvas.getSortableSpriteList();

        // The culled-avatar merge. The canvas drops an avatar it scrolled off screen, and the photo
        // still wants it — so every category-100 object's own sprite list is re-parented onto where
        // the object is, whether or not the canvas drew it.
        //
        // The z and the baseline come from the avatar's *drawn* sprite when there is one, which is
        // what keeps a merged avatar sorted among the furniture rather than on top of it; with no
        // drawn sprite the object's screen y stands in.
        for(const object of engine.getRoomObjects(engine.activeRoomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER))
        {
            if(object.getId() === skipObjectId) continue;

            const parts = (object.getVisualization() as IRoomObjectSpriteVisualization | null)?.getSpriteList() ?? null;

            if(parts === null) continue;

            let baseZ = 0;
            let baseY = 0;

            for(const drawn of sprites)
            {
                if(drawn.name === `avatar_${object.getId()}`)
                {
                    baseZ = drawn.z;
                    baseY = drawn.y + drawn.height - canvas.geometry.scale / 4;

                    break;
                }
            }

            const screen = engine.getRoomObjectScreenLocation(
                engine.activeRoomId, object.getId(), RoomObjectCategoryEnum.OBJECT_CATEGORY_USER, canvas.getId()
            );

            if(screen === null) continue;

            if(baseY === 0) baseY = screen.y;

            for(const part of parts)
            {
                const data = SpriteDataCollector.fromSprite(part, object.getId());

                data.x += screen.x - canvas.screenOffsetX;
                data.y += baseY;
                data.z += baseZ;

                // The two swimming effects are authored a tile higher than they draw; AS3 pulls
                // them back down by hand rather than fixing the assets.
                if(data.name.indexOf('h_std_fx29_') === 0 || data.name.indexOf('h_std_fx185_') === 0)
                {
                    data.y += SpriteDataCollector.AVATAR_WATER_EFFECT_MAGIC_Y_OFFSET;
                }

                sprites.push(data);
            }
        }

        sprites = SpriteDataCollector.addMannequinSprites(sprites, engine);
        sprites.sort(SpriteDataCollector.sortSpriteDataObjects);

        const result: Record<string, unknown>[] = [];

        for(const data of sprites)
        {
            const name = data.name;

            if(name !== null && name.length > 0
                && name.indexOf('tile_cursor_') !== 0
                && SpriteDataCollector.isSpriteInViewPort(data, viewPort, canvas)
                && (skipObjectId < 0 || data.objectId !== skipObjectId))
            {
                result.push(this.getSpriteDataObject(data, viewPort, canvas));

                if(!this._firstSpriteZ)
                {
                    this._firstSpriteZ = data.z;
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
        sprite: RoomObjectSpriteData,
        viewPort: IRoomEngineRectangle,
        canvas: RoomRenderingCanvas
    ): Record<string, unknown>
    {
        const data: Record<string, unknown> = {};
        let name = sprite.name;

        // A palette-swapped asset is `assetName@paletteId`; AS3 resolves the palette's source image
        // through the content loader. That lookup needs `getGraphicAssetCollection().getPaletteXML()`
        // and is left out with the name split kept, so the base asset still resolves server-side.
        if(name.indexOf('@') !== -1)
        {
            name = name.split('@')[0];
        }

        data.name = name;
        data.x = sprite.x - viewPort.left + canvas.screenOffsetX;
        data.y = sprite.y - viewPort.top + canvas.screenOffsetY;
        data.z = sprite.z;

        // Each of these is omitted at its default, exactly as AS3 does — the payload is
        // checksummed by length, so an extra key is not free.
        if(sprite.alpha && sprite.alpha.toString() !== '255') data.alpha = sprite.alpha;

        if(sprite.flipH) data.flipH = sprite.flipH;

        if(sprite.color) data.color = sprite.color;

        if(sprite.blendMode && sprite.blendMode !== 'normal') data.blendMode = sprite.blendMode;

        // The shear and the frame only reach the payload for the sprites the canvas set them on —
        // a wall photo or a forum thumbnail. Both are omitted at their default like the rest.
        if(sprite.skew) data.skew = sprite.skew;

        if(sprite.frame) data.frame = sprite.frame;

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

        if(sprite.posture) data.posture = sprite.posture;

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
