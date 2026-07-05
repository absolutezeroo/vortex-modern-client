/**
 * IRoomObjectSprite Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectSprite
 *
 * Interface for individual sprite elements in room object visualizations.
 */
import type {Texture} from 'pixi.js';

export interface IRoomObjectSprite
{
    texture: Texture | null;
    assetName: string;
    libraryAssetName: string;
    assetPosture: string | null;
    assetGesture: string | null;
    visible: boolean;
    tag: string;
    alpha: number;
    color: number;
    blendMode: string;
    filters: unknown[] | null;
    flipH: boolean;
    flipV: boolean;
    direction: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    relativeDepth: number;
    varyingDepth: boolean;
    clickHandling: boolean;
    skipMouseHandling: boolean;
    instanceId: number;
    updateId: number;
    spriteType: number;
    objectType: string | null;
    alphaTolerance: number;
    planeId: number;

    dispose(): void;
}
