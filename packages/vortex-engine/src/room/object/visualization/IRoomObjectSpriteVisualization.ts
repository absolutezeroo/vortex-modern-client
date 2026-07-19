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
    spriteCount: number;
    assetCollection: IGraphicAssetCollection | null;

    getSprite(index: number): IRoomObjectSprite | null;

    getSpriteList(): IRoomObjectSprite[] | null;

    getUpdateID(): number;

    getInstanceId(): number;
}
