import type {IFigurePartSet} from './IFigurePartSet';

/**
 * Interface for a figure set type containing part sets and mandatory configuration.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/ISetType.as
 */
export interface ISetType
{
	readonly type: string;
	readonly paletteID: number;
	readonly partSets: Map<string, IFigurePartSet>;

	getPartSet(id: number): IFigurePartSet | null;

	isMandatory(gender: string, clubLevel: number): boolean;

	optionalFromClubLevel(gender: string): number;
}
