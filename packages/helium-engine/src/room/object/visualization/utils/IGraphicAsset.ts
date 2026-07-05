/**
 * IGraphicAsset
 *
 * @see com.sulake.room.object.visualization.utils.IGraphicAsset
 *
 * Interface for graphic asset data used in room object visualizations.
 */
import type {Texture} from 'pixi.js';

export interface IGraphicAsset
{
    readonly flipH: boolean;
    readonly flipV: boolean;
    readonly width: number;
    readonly height: number;
    readonly texture: Texture | null;
    readonly assetName: string;
    readonly libraryAssetName: string;
    readonly offsetX: number;
    readonly offsetY: number;
    readonly originalOffsetX: number;
    readonly originalOffsetY: number;
    readonly usesPalette: boolean;

    recycle(): void;
}
