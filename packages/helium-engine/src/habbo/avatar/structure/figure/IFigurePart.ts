/**
 * Interface for a single figure part in an avatar's figure set.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/class_3617.as (IFigurePart)
 */
export interface IFigurePart
{
    readonly id: number;
    readonly type: string;
    readonly breed: number;
    readonly colorLayerIndex: number;
    readonly index: number;
    readonly paletteMap: number;
}
