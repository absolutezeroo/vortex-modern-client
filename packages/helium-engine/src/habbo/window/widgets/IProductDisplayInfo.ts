/**
 * Describes a single product to preview, consumed by ProductIconWidget /
 * ProductImageWidget's `productInfo` setter.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/window/widgets/IProductDisplayInfo.as
 */
export interface IProductDisplayInfo
{
    readonly productTypeId: number;
    readonly itemTypeId: string;
    readonly extraData: string;
    readonly petFigureString: string;
    readonly botFigureString: string;
    readonly figureSetIds: number[];
}
