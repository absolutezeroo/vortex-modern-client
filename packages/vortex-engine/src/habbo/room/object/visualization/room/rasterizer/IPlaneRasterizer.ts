/**
 * IPlaneRasterizer
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.rasterizer.class_3625
 *
 * Interface for plane rasterizers that generate textured plane bitmaps.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import type {PlaneBitmapData} from '../utils/PlaneBitmapData';

export interface IPlaneRasterizer
{
    initializeDimensions(width: number, height: number): boolean;

    render(
        canvas: HTMLCanvasElement | null,
        id: string,
        leftLen: number,
        rightLen: number,
        scale: number,
        normal: IVector3d,
        hasTexture: boolean,
        offsetU?: number,
        offsetV?: number,
        maxU?: number,
        maxV?: number,
        time?: number
    ): PlaneBitmapData | null;

    getTextureIdentifier(scale: number, normal: IVector3d): string;

    getLayers(id: string): (unknown | null)[];

    reinitialize(): void;
}
