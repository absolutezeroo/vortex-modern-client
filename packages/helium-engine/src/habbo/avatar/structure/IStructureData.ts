/**
 * Interface for structure data that can be parsed and appended from JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/IStructureData.as
 */
export interface IStructureData
{
	parse(data: any): boolean;

	appendJSON(data: any): boolean;
}
