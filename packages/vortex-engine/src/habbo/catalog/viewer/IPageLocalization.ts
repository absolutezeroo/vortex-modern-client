/**
 * Localization asset accessor for a catalog page (image/text elements + layout links).
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_1998.as
 */
export interface IPageLocalization
{
    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::get imageCount()
    readonly imageCount: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::get textCount()
    readonly textCount: number;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getTextElementName()
    getTextElementName(index: number, layoutCode: string): string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getImageElementName()
    getImageElementName(index: number, layoutCode: string): string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getTextElementContent()
    getTextElementContent(index: number): string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getImageElementContent()
    getImageElementContent(index: number): string;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::dispose()
    dispose(): void;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::hasLinks()
    hasLinks(layoutCode: string): boolean;

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getLinks()
    getLinks(layoutCode: string): string[];

    // AS3: sources/win63_version/habbo/catalog/viewer/class_1998.as::getColorUintFromText()
    getColorUintFromText(index: number): number;
}
