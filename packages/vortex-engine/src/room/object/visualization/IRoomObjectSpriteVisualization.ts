/**
 * IRoomObjectSpriteVisualization Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectSpriteVisualization
 *
 * Interface for sprite-based room object visualizations.
 * The canvas (RoomRenderingCanvas) reads sprite data via getSprite(i)
 * and owns the actual display objects (ExtendedSprites).
 */
import type {IRoomObjectVisualization} from './IRoomObjectVisualization';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import type {IGraphicAssetCollection} from './utils/IGraphicAssetCollection';

export interface IRoomObjectSpriteVisualization extends IRoomObjectVisualization
{
    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectSpriteVisualization.as::get spriteCount()
    spriteCount: number;
    assetCollection: IGraphicAssetCollection | null;

    // AS3 declares this on the parent IRoomObjectGraphicVisualization, which this port did not
    // add as a separate interface (RoomManager sets it on every visualization it creates, right
    // after assetCollection, regardless of subtype).
    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectGraphicVisualization.as::setExternalBaseUrls()
    setExternalBaseUrls(baseUrl: string, secureBaseUrl: string, batchesEnabled: boolean): void;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectSpriteVisualization.as::getSprite()
    getSprite(index: number): IRoomObjectSprite | null;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectSpriteVisualization.as::getSpriteList()
    getSpriteList(): IRoomObjectSprite[] | null;

    getUpdateID(): number;

    getInstanceId(): number;
}
