import {Logger} from '@core/utils/Logger';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ICatalogPage} from './ICatalogPage';
import type {IProduct} from './IProduct';
import type {IProductContainer} from './IProductContainer';
import type {IGridItem} from './IGridItem';
import {Product} from './Product';
import {ProductContainer} from './ProductContainer';
import {SingleProductContainer} from './SingleProductContainer';
import {MultiProductContainer} from './MultiProductContainer';
import {BundleProductContainer} from './BundleProductContainer';

const log = Logger.getLogger('habbo.catalog.viewer.Offer');

/**
 * A purchasable catalog offer: price(s), the page it belongs to, and its product(s).
 *
 * @see sources/win63_version/habbo/catalog/viewer/Offer.as
 */
export class Offer implements IPurchasableOffer
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICING_MODEL_UNKNOWN
    static readonly PRICING_MODEL_UNKNOWN: string = 'pricing_model_unknown';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICING_MODEL_SINGLE
    static readonly PRICING_MODEL_SINGLE: string = 'pricing_model_single';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICING_MODEL_MULTI
    static readonly PRICING_MODEL_MULTI: string = 'pricing_model_multi';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICING_MODEL_BUNDLE
    static readonly PRICING_MODEL_BUNDLE: string = 'pricing_model_bundle';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICING_MODEL_FURNI
    static readonly PRICING_MODEL_FURNI: string = 'pricing_model_furniture';

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICE_TYPE_NONE
    static readonly PRICE_TYPE_NONE: string = 'price_type_none';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICE_TYPE_CREDITS
    static readonly PRICE_TYPE_CREDITS: string = 'price_type_credits';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICE_TYPE_ACTIVITYPOINTS
    static readonly PRICE_TYPE_ACTIVITYPOINTS: string = 'price_type_activitypoints';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICE_TYPE_CREDITS_AND_ACTIVITYPOINTS
    static readonly PRICE_TYPE_CREDITS_AND_ACTIVITYPOINTS: string = 'price_type_credits_and_activitypoints';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::PRICE_TYPE_SILVER
    static readonly PRICE_TYPE_SILVER: string = 'price_type_silver';

    private _pricingModel: string = Offer.PRICING_MODEL_UNKNOWN;

    private _priceType: string = Offer.PRICE_TYPE_NONE;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::_offerId
    private _offerId: number;

    private _localizationId: string;

    private _priceInCredits: number;

    private _priceInActivityPoints: number;

    private _activityPointType: number;

    private _priceInSilver: number;

    private _giftable: boolean;

    private _isRentOffer: boolean;

    private _page: ICatalogPage | null = null;

    private _productContainer: IProductContainer | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::_disposed
    private _disposed: boolean = false;

    private _clubLevel: number = 0;

    private _badgeCode: string | null = null;

    private _extraChatStyleCode: string | null = null;

    private _bundlePurchaseAllowed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::_catalog
    private _catalog: HabboCatalog | null;

    private _isSingleChatStyle: boolean;

    private _previewCallbackId: number = 0;

    constructor(
        offerId: number,
        localizationId: string,
        isRentOffer: boolean,
        priceInCredits: number,
        priceInActivityPoints: number,
        activityPointType: number,
        priceInSilver: number,
        giftable: boolean,
        clubLevel: number,
        products: IProduct[],
        bundlePurchaseAllowed: boolean,
        catalog: HabboCatalog
    )
    {
        this._offerId = offerId;
        this._localizationId = localizationId;
        this._isRentOffer = isRentOffer;
        this._priceInCredits = priceInCredits;
        this._priceInActivityPoints = priceInActivityPoints;
        this._activityPointType = activityPointType;
        this._priceInSilver = priceInSilver;
        this._giftable = giftable;
        this._clubLevel = clubLevel;
        this._bundlePurchaseAllowed = bundlePurchaseAllowed;
        this._catalog = catalog;

        this._isSingleChatStyle =
            (products.length === 1 && products[0].productType === 'chat_style')
            || (products.length === 2 && (
                (products[0].productType === 'chat_style' && products[1].productType === 'b')
                || (products[0].productType === 'b' && products[1].productType === 'chat_style')
            ));

        this.analyzePricingModel(products);
        this.analyzePriceType();
        this.createProductContainer(products);

        for(const product of products)
        {
            if(product.productType === 'b')
            {
                this._badgeCode = product.extraParam;
                break;
            }

            if(!this.isSingleChatStyle && product.productType === 'chat_style')
            {
                this._extraChatStyleCode = product.extraParam;
                break;
            }
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get clubLevel()
    get clubLevel(): number
    {
        return this._clubLevel;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get page()
    get page(): ICatalogPage
    {
        return this._page!;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::set page()
    set page(page: ICatalogPage)
    {
        this._page = page;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get localizationId()
    get localizationId(): string
    {
        return this._localizationId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get priceInSilver()
    get priceInSilver(): number
    {
        return this._priceInSilver;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get giftable()
    get giftable(): boolean
    {
        return this._giftable;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get productContainer()
    get productContainer(): IProductContainer
    {
        return this._productContainer!;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get product()
    get product(): IProduct | null
    {
        return this._productContainer ? this._productContainer.firstProduct : null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get gridItem()
    get gridItem(): IGridItem
    {
        return this._productContainer as unknown as IGridItem;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get pricingModel()
    get pricingModel(): string
    {
        return this._pricingModel;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get priceType()
    get priceType(): string
    {
        return this._priceType;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get previewCallbackId()
    get previewCallbackId(): number
    {
        return this._previewCallbackId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::set previewCallbackId()
    set previewCallbackId(value: number)
    {
        this._previewCallbackId = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get bundlePurchaseAllowed()
    get bundlePurchaseAllowed(): boolean
    {
        return this._bundlePurchaseAllowed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get isRentOffer()
    get isRentOffer(): boolean
    {
        return this._isRentOffer;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._disposed = true;
        this._offerId = 0;
        this._localizationId = '';
        this._priceInCredits = 0;
        this._priceInActivityPoints = 0;
        this._activityPointType = 0;
        this._page = null;
        this._catalog = null;

        if(this._productContainer != null)
        {
            this._productContainer.dispose();
            this._productContainer = null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::createProductContainer()
    private createProductContainer(products: IProduct[]): void
    {
        switch(this._pricingModel)
        {
            case Offer.PRICING_MODEL_SINGLE:
                this._productContainer = new SingleProductContainer(this, products, this._catalog!);
                break;
            case Offer.PRICING_MODEL_MULTI:
                this._productContainer = new MultiProductContainer(this, products, this._catalog!);
                break;
            case Offer.PRICING_MODEL_BUNDLE:
                this._productContainer = new BundleProductContainer(this, products, this._catalog!);
                break;
            default:
                this._productContainer = new ProductContainer(this, products, this._catalog!);
                log.warn(`Unknown pricing model${this._pricingModel}`);
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::analyzePricingModel()
    private analyzePricingModel(products: IProduct[]): void
    {
        if(this.isSingleChatStyle)
        {
            this._pricingModel = Offer.PRICING_MODEL_SINGLE;

            return;
        }

        const stripped = Product.stripAddonProducts(products);

        if(stripped.length === 1)
        {
            this._pricingModel = stripped[0].productCount === 1 ? Offer.PRICING_MODEL_SINGLE : Offer.PRICING_MODEL_MULTI;
        }
        else if(stripped.length > 1)
        {
            this._pricingModel = Offer.PRICING_MODEL_BUNDLE;
        }
        else
        {
            this._pricingModel = Offer.PRICING_MODEL_UNKNOWN;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get isSingleChatStyle()
    get isSingleChatStyle(): boolean
    {
        return this._isSingleChatStyle;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::analyzePriceType()
    private analyzePriceType(): void
    {
        if(this._priceInCredits > 0 && this._priceInActivityPoints > 0)
        {
            this._priceType = Offer.PRICE_TYPE_CREDITS_AND_ACTIVITYPOINTS;
        }
        else if(this._priceInCredits > 0)
        {
            this._priceType = Offer.PRICE_TYPE_CREDITS;
        }
        else if(this._priceInActivityPoints > 0)
        {
            this._priceType = Offer.PRICE_TYPE_ACTIVITYPOINTS;
        }
        else if(this._priceInSilver > 0)
        {
            this._priceType = Offer.PRICE_TYPE_SILVER;
        }
        else
        {
            this._priceType = Offer.PRICE_TYPE_NONE;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::clone()
    clone(): Offer
    {
        const productData = this._catalog!.getProductData(this.localizationId);
        const products: IProduct[] = [];

        for(const product of this.productContainer.products)
        {
            const furnitureData = this._catalog!.getFurnitureData(product.productClassId, product.productType);

            products.push(new Product(
                product.productType,
                product.productClassId,
                product.extraParam,
                product.productCount,
                productData,
                furnitureData,
                this._catalog!
            ));
        }

        const clone = new Offer(
            this.offerId,
            this.localizationId,
            this.isRentOffer,
            this.priceInCredits,
            this.priceInActivityPoints,
            this.activityPointType,
            this.priceInSilver,
            this.giftable,
            this.clubLevel,
            products,
            this.bundlePurchaseAllowed,
            this._catalog!
        );

        clone.page = this.page;

        return clone;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode ?? '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get extraChatStyleCode()
    get extraChatStyleCode(): string
    {
        return this._extraChatStyleCode ?? '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get localizationName()
    get localizationName(): string
    {
        const productData = this._catalog!.getProductData(this._localizationId);

        return productData ? productData.name : '${' + this._localizationId + '}';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get localizationDescription()
    get localizationDescription(): string
    {
        const productData = this._catalog!.getProductData(this._localizationId);

        return productData ? productData.description : '${' + this._localizationId + '}';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/Offer.as::get priceInEmerald()
    get priceInEmerald(): number
    {
        return 0;
    }
}
