import {Logger} from '@core/utils/Logger';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IProductData} from '@habbo/session/product/IProductData';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IProduct} from './IProduct';
import type {ProductContainer} from './ProductContainer';
import {ProductGridItem} from './ProductGridItem';

const log = Logger.getLogger('Product');

/**
 * A single product (furni/badge/effect/subscription/avatar-render/chat-style) inside an offer.
 *
 * @see sources/win63_version/habbo/catalog/viewer/Product.as
 */
export class Product extends ProductGridItem implements IProduct
{
    static readonly EFFECT_CLASSID_NINJA_DISAPPEAR: number = 108;

    private _productType: string;

    private _productClassId: number;

    private _extraParam: string;

    private _productCount: number;

    private _productData: IProductData | null;

    private _furnitureData: IFurnitureData | null;

    private _isUniqueLimitedItem: boolean;

    private _uniqueLimitedItemSeriesSize: number;

    private _uniqueLimitedItemsLeft: number;

    private _badgeTarget: ProductGridItem | null = null;

    constructor(
        productType: string,
        productClassId: number,
        extraParam: string,
        productCount: number,
        productData: IProductData | null,
        furnitureData: IFurnitureData | null,
        catalog: HabboCatalog,
        isUniqueLimitedItem: boolean = false,
        uniqueLimitedItemSeriesSize: number = 0,
        uniqueLimitedItemsLeft: number = 0
    )
    {
        super(catalog);
        this._productType = productType;
        this._productClassId = productClassId;
        this._extraParam = extraParam;
        this._productCount = productCount;
        this._productData = productData;
        this._furnitureData = furnitureData;
        this._isUniqueLimitedItem = isUniqueLimitedItem;
        this._uniqueLimitedItemSeriesSize = uniqueLimitedItemSeriesSize;
        this._uniqueLimitedItemsLeft = uniqueLimitedItemsLeft;
    }

    static stripAddonProducts(products: IProduct[]): IProduct[]
    {
        if(products.length === 1) return products;

        return products.filter((product) =>
            product.productType !== 'b'
            && !(product.productType === 'e' && product.productClassId === Product.EFFECT_CLASSID_NINJA_DISAPPEAR)
            && product.productType !== 'chat_style'
        );
    }

    get productType(): string
    {
        return this._productType;
    }

    get productClassId(): number
    {
        return this._productClassId;
    }

    set extraParam(value: string)
    {
        this._extraParam = value;
    }

    get extraParam(): string
    {
        return this._extraParam;
    }

    get productCount(): number
    {
        return this._productCount;
    }

    get productData(): IProductData | null
    {
        return this._productData;
    }

    get furnitureData(): IFurnitureData | null
    {
        return this._furnitureData;
    }

    get isUniqueLimitedItem(): boolean
    {
        return this._isUniqueLimitedItem;
    }

    get uniqueLimitedItemSeriesSize(): number
    {
        return this._uniqueLimitedItemSeriesSize;
    }

    get uniqueLimitedItemsLeft(): number
    {
        return this._uniqueLimitedItemsLeft;
    }

    set uniqueLimitedItemsLeft(value: number)
    {
        this._uniqueLimitedItemsLeft = value;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._productType = '';
        this._productClassId = 0;
        this._extraParam = '';
        this._productCount = 0;
        this._productData = null;
        this._furnitureData = null;

        super.dispose();
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/Product.as::initIcon()
    // The `param1 is BundleGridViewCatalogWidget` branch is unreachable here: that widget
    // class isn't ported yet (viewer/widgets/ is a later phase), so every caller currently
    // is a ProductContainer.
    initIcon(
        grid: unknown,
        imageListener: IGetImageListener | null = null,
        avatarListener: IAvatarImageListener | null = null,
        offer: IPurchasableOffer | null = null,
        target: unknown = null,
        stuffData: unknown = null,
        _onPreviewImageReady: ((event: unknown) => void) | null = null
    ): ImageBitmap | null
    {
        if(this.disposed) return null;

        const listener: IGetImageListener = imageListener ?? this;

        const roomEngine = (grid as ProductContainer).offer.page.viewer.roomEngine;

        if(!roomEngine || !this.catalog)
        {
            log.warn(`initIcon: bailing out early (roomEngine=${!!roomEngine}, catalog=${!!this.catalog})`);

            return null;
        }

        let image: ImageBitmap | null = null;

        switch(this._productType)
        {
            case 's':
            {
                const result = roomEngine.getFurnitureIcon(this._productClassId, listener, null, stuffData);

                image = result.data;

                break;
            }
            case 'i':
            {
                if(offer && this._furnitureData)
                {
                    // TODO(AS3): sources/win63_version/habbo/catalog/viewer/Product.as::initIcon()
                    // The floor/wallpaper/landscape room-preview thumbnail naming branch (used
                    // when a live preview `offer` context is supplied) needs setImageFromAsset()'s
                    // full async retrievePreviewAsset() fallback, which isn't wired up yet - see
                    // HabboCatalog.setImageFromAsset(). Only the cache-hit path works currently.
                    this.catalog.setImageFromAsset(target, null, null);

                    break;
                }

                const result = roomEngine.getWallItemIcon(this._productClassId, listener, this._extraParam);

                image = result.data;

                break;
            }
            case 'e':
            {
                image = this.catalog.getPixelEffectIcon(this._productClassId);

                if(listener === this)
                {
                    this.setIconImage(image, true);
                }

                break;
            }
            case 'h':
            {
                image = this.catalog.getSubscriptionProductIcon(this._productClassId);

                break;
            }
            case 'b':
            {
                // TODO(AS3): sources/win63_version/habbo/catalog/viewer/Product.as::initIcon()
                // AS3 also subscribes to a one-shot BIRE_BADGE_IMAGE_READY event on
                // sessionDataManager so a still-loading badge image gets applied once it
                // arrives; that event isn't wired up here yet, so a badge requested before
                // it's cached will stay blank until the next initIcon() call.
                this._badgeTarget = listener as unknown as ProductGridItem;

                const badgeImage = this.catalog.sessionDataManager?.getBadgeImage(this._extraParam) ?? null;

                if(badgeImage)
                {
                    createImageBitmap(badgeImage).then((bitmap) => this.onBadgeImageReady(bitmap));
                }

                image = null;

                break;
            }
            case 'r':
            {
                this.renderAvatarImage(this._extraParam, avatarListener).then((rendered) =>
                {
                    if(rendered) this.setIconImage(rendered, false);
                });

                image = null;

                break;
            }
            case 'chat_style':
                // TODO(AS3): sources/win63_version/habbo/catalog/viewer/Product.as::initIcon()
                // Chat-style selector preview cloning (catalog.freeFlowChat.chatStyleLibrary)
                // has no TS equivalent yet - habbo/catalog has no freeFlowChat reference and
                // the chat-style library itself isn't ported.
                image = null;
                break;
            default:
                image = null;
        }

        if(image != null && listener === this)
        {
            this.setIconImage(image, true);
        }

        return image;
    }

    imageReady(_id: number, image: ImageBitmap | null): void
    {
        if(!this.disposed)
        {
            this.setIconImage(image, true);
        }
    }

    imageFailed(_id: number): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/Product.as::onBadgeImageReady()
    // AS3 fires this from a BIRE_BADGE_IMAGE_READY event (matched by badgeId); here it's
    // called directly off the createImageBitmap() continuation kicked off in initIcon().
    private onBadgeImageReady(image: ImageBitmap): void
    {
        if(!this.disposed && this._productType === 'b' && this._badgeTarget)
        {
            this._badgeTarget.setIconImage(image, false);
        }
    }

    get isColorable(): boolean
    {
        if(this._furnitureData && this._furnitureData.fullName)
        {
            return this._furnitureData.fullName.indexOf('*') !== -1;
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/Product.as::set view()
    // The decompiled source computes multiContainer/multiCounter but the win63 build's
    // method body is truncated before using them - reconstructed from the clean reference
    // (vortex-client), which shows the container made visible and the counter text set.
    override set view(view: IWindowContainer)
    {
        if(!view) return;

        super.view = view;

        if(this._productCount > 1)
        {
            const multiContainer = this._view!.findChildByName('multiContainer');

            if(multiContainer)
            {
                multiContainer.visible = true;
            }

            const multiCounter = this._view!.findChildByName('multiCounter') as unknown as ITextWindow | null;

            if(multiCounter)
            {
                multiCounter.text = 'x' + this._productCount;
            }
        }
    }
}
