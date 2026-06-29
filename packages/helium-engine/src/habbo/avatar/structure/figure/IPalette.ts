import type {IPartColor} from './IPartColor';

/**
 * Interface for a color palette used in avatar figure parts.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/class_3445.as (IPalette)
 */
export interface IPalette
{
	readonly id: number;
	readonly colors: Map<number, IPartColor>;

	getColor(colorId: number): IPartColor | null;
}
