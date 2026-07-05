/**
 * Interface for a color entry in an avatar figure palette.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/IPartColor.as
 */
export interface IPartColor
{
    readonly colorTransform: { redMultiplier: number; greenMultiplier: number; blueMultiplier: number };
    readonly redMultiplier: number;
    readonly greenMultiplier: number;
    readonly blueMultiplier: number;
    readonly rgb: number;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly id: number;
    readonly index: number;
    readonly clubLevel: number;
    readonly isSelectable: boolean;
}
