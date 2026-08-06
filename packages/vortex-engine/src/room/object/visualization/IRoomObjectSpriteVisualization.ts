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

    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectSpriteVisualization.as::getSprite()
    getSprite(index: number): IRoomObjectSprite | null;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomObjectSpriteVisualization.as::getSpriteList()
    getSpriteList(): IRoomObjectSprite[] | null;

    getUpdateID(): number;

    getInstanceId(): number;
}
