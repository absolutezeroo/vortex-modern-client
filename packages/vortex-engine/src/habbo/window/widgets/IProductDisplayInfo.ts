/**
 * Describes a single product to preview, consumed by ProductIconWidget /
 * ProductImageWidget's `productInfo` setter.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/widgets/IProductDisplayInfo.as
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
