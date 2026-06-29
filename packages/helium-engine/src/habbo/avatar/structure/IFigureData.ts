import type {ISetType} from './figure/ISetType';
import type {IFigurePartSet} from './figure/IFigurePartSet';
import type {IPalette} from './figure/IPalette';

/**
 * Interface for figure data providing access to set types, palettes, and part sets.
 *
 * @see sources/win63_version/habbo/avatar/structure/class_3360.as (IFigureData)
 */
export interface IFigureData
{
	getSetType(type: string): ISetType | null;

	getPalette(id: number): IPalette | null;

	getFigurePartSet(id: number): IFigurePartSet | null;
}
