import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {IProduct} from './IProduct';

/**
 * Adapts an IProduct into the generic IProductDisplayInfo shape consumed by
 * ProductImageWidget's `productInfo` setter - the fallback preview used for
 * product types ProductViewCatalogWidget doesn't otherwise render directly
 * (currently: chat styles and rentables/effects).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as
 */
export class ProductDisplayWrapper implements IProductDisplayInfo
{
    private readonly _product: IProduct;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::ProductDisplayWrapper()
    constructor(product: IProduct)
    {
        this._product = product;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::isSupported()
    public static isSupported(productType: string): boolean
    {
        return productType === 'chat_style' || productType === 'r';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get productTypeId()
    public get productTypeId(): number
    {
        switch(this._product.productType)
        {
            case 'chat_style':
                return 9;
            case 'r':
                return 6;
            default:
                return 0;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get itemTypeId()
    public get itemTypeId(): string
    {
        return this._product.extraParam;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get petFigureString()
    public get petFigureString(): string
    {
        return '';
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get botFigureString()
    public get botFigureString(): string
    {
        return this._product.extraParam;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get figureSetIds()
    public get figureSetIds(): number[]
    {
        return [];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/ProductDisplayWrapper.as::get extraData()
    public get extraData(): string
    {
        return '';
    }
}
