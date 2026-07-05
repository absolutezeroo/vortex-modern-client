import type {IFigurePart} from './IFigurePart';

/**
 * Interface for a figure part set containing parts and metadata.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/class_3418.as (IFigurePartSet)
 */
export interface IFigurePartSet
{
    readonly type: string;
    readonly id: number;
    readonly gender: string;
    readonly clubLevel: number;
    readonly isColorable: boolean;
    readonly isSelectable: boolean;
    readonly isPreSelectable: boolean;
    readonly isSellable: boolean;
    readonly parts: IFigurePart[];
    readonly hiddenLayers: string[];

    getPart(type: string, id: number): IFigurePart | null;
}
