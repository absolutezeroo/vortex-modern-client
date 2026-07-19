/**
 * Localization asset accessor for a catalog page (image/text elements + layout links).
 *
 * @see sources/win63_version/habbo/catalog/viewer/class_1998.as
 */
export interface IPageLocalization
{
    readonly imageCount: number;

    readonly textCount: number;

    getTextElementName(index: number, layoutCode: string): string;

    getImageElementName(index: number, layoutCode: string): string;

    getTextElementContent(index: number): string;

    getImageElementContent(index: number): string;

    dispose(): void;

    hasLinks(layoutCode: string): boolean;

    getLinks(layoutCode: string): string[];

    getColorUintFromText(index: number): number;
}
