/**
 * Interface for structure data that can be parsed and appended from AS3 XML.
 *
 * @see sources/win63_version/habbo/avatar/structure/IStructureData.as
 */
export interface IStructureData
{
    // AS3: sources/win63_version/habbo/avatar/structure/IStructureData.as::parse()
    parse(data: any): boolean;

    // AS3: sources/win63_version/habbo/avatar/structure/IStructureData.as::appendXML()
    appendXML(data: any): boolean;

    appendJSON(data: any): boolean;
}