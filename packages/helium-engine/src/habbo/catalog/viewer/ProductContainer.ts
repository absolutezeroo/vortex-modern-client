import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {ActivityPointTypeEnum} from '../purse/ActivityPointTypeEnum';
import type {HabboCatalog} from '../HabboCatalog';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {IProduct} from './IProduct';
import type {IProductContainer} from './IProductContainer';
import {Product} from './Product';
import {ProductGridItem} from './ProductGridItem';

/**
 * Groups the product(s) backing a single offer's grid item.
 *
 * @see sources/win63_version/habbo/catalog/viewer/ProductContainer.as
 */
export class ProductContainer extends ProductGridItem implements IGetImageListener, IProductContainer, IAvatarImageListener
{
    protected _offer: IPurchasableOffer;

    protected _products: IProduct[];

    constructor(offer: IPurchasableOffer, products: IProduct[], catalog: HabboCatalog)
    {
        super(catalog);
        this._offer = offer;
        this._products = products;
    }

    get products(): IProduct[]
    {
        return this._products;
    }

    get firstProduct(): IProduct | null
    {
        if(!this._products || this._products.length === 0) return null;

        if(this._products.length === 1) return this._products[0];

        if(this._products.length === 2 && (this._products[1].productType === 'b' || this._products[0].productType === 'b'))
        {
            return this._products[0].productType === 'b' ? this._products[1] : this._products[0];
        }

        const stripped = Product.stripAddonProducts(this._products);

        return stripped.length > 0 ? stripped[0] : null;
    }

    get offer(): IPurchasableOffer
    {
        return this._offer;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        for(const product of this._products)
        {
            product.dispose();
        }

        this._products = [];

        super.dispose();
    }

    get isLazy(): boolean
    {
        return false;
    }

    initProductIcon(_roomEngine: IRoomEngine, _stuffData?: unknown | null): void
    {
    }

    override set view(view: IWindowContainer)
    {
        super.view = view;

        if(this._view == null) return;

        if(
            this.catalog
            && ((this._offer.badgeCode && this._offer.badgeCode !== '') || (this._offer.extraChatStyleCode && this._offer.extraChatStyleCode !== ''))
            && this._offer.productContainer.products.length > 1
        )
        {
            this.setAddOnIcon('catalog_icon_badge_included');
        }
        else if(this.catalog && this._offer.productContainer.products.length === 2)
        {
            // AS3: sources/win63_version/habbo/catalog/viewer/ProductContainer.as::set view()
            // Decompiled as `while(true) { var product = products[0]; if(null.productType ...` -
            // an infinite loop reading/comparing a literal `null` instead of the loop counter's
            // product. Reconstructed as a bounded 2-iteration loop over both products, confirmed
            // against the clean reference source.
            for(let i = 0; i < 2; i++)
            {
                const product = this._offer.productContainer.products[i];

                if(product.productType === 'e' && product.productClassId === Product.EFFECT_CLASSID_NINJA_DISAPPEAR)
                {
                    this.setAddOnIcon('catalog_icon_ninja_effect_included');
                }
            }
        }

        this.setClubIconLevel(this.offer.clubLevel);

        if(this.catalog!.isDraggable(this.offer))
        {
            this.setDraggable(true);
        }
    }

    private setAddOnIcon(assetName: string): void
    {
        const badgeAddOn = this._view!.findChildByName('badge_add_on') as unknown as IBitmapWrapperWindow;
        const asset = this.catalog!.assets!.getAssetByName(assetName)!;

        badgeAddOn.bitmap = asset.content as ImageBitmap;
        badgeAddOn.width = badgeAddOn.bitmap!.width;
        badgeAddOn.height = badgeAddOn.bitmap!.height;
    }

    imageReady(_id: number, image: ImageBitmap | null): void
    {
        this.setIconImage(image, true);
    }

    imageFailed(_id: number): void
    {
    }

    setClubIconLevel(clubLevel: number): void
    {
        if(this.view == null) return;

        const icon = this.view.findChildByName('clubLevelIcon');

        if(icon == null) return;

        switch(this.offer.clubLevel)
        {
            case 0:
                icon.visible = false;
                break;
            case 1:
                icon.visible = true;
                icon.style = 11;
                icon.x = icon.x + 3;
                break;
            case 2:
                icon.visible = true;
                icon.style = 12;
                break;
        }

        void clubLevel;
    }

    avatarImageReady(figureString: string): void
    {
        if(!this.disposed)
        {
            for(const product of this.products)
            {
                if(product.productType === 'r' && product.extraParam === figureString)
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (this as any).renderAvatarImage(product.extraParam, this).then((image: ImageBitmap | null) =>
                    {
                        if(image) this.setIconImage(image, true);
                    });

                    return;
                }
            }
        }
    }

    // AS3's HabboCatalog itself doubles as a config accessor (getBoolean/getInteger/getProperty
    // from the shared Component base) - cast narrowly to the subset getIconStyleFor() actually uses.
    createCurrencyIndicators(catalog: HabboCatalog): void
    {
        const configuration = catalog as unknown as IHabboConfigurationManager;

        if(this._offer.priceInCredits > 0)
        {
            const amountText = this._offer.priceInActivityPoints > 0
                ? this._view!.findChildByName('amount_text_left') as unknown as ITextWindow | null
                : this._view!.findChildByName('amount_text_right') as unknown as ITextWindow | null;

            if(amountText)
            {
                amountText.text = this._offer.priceInCredits + '';
            }
        }

        if(this._offer.priceInActivityPoints > 0)
        {
            const amountTextRight = this._view!.findChildByName('amount_text_right') as unknown as ITextWindow | null;

            if(amountTextRight)
            {
                const currencyIndicator = this._view!.findChildByName('currency_indicator_bitmap_right');

                if(currencyIndicator)
                {
                    currencyIndicator.style = ActivityPointTypeEnum.getIconStyleFor(this._offer.activityPointType, configuration, false);
                }

                amountTextRight.text = this._offer.priceInActivityPoints + '';
            }
        }
        else if(this._offer.priceInSilver > 0)
        {
            const amountTextRight = this._view!.findChildByName('amount_text_right') as unknown as ITextWindow | null;

            if(amountTextRight)
            {
                const currencyIndicator = this._view!.findChildByName('currency_indicator_bitmap_right');

                if(currencyIndicator)
                {
                    currencyIndicator.style = ActivityPointTypeEnum.getIconStyleFor(ActivityPointTypeEnum.SILVER, configuration, false);
                }

                amountTextRight.text = this._offer.priceInSilver + '';
            }
        }

        const totalPriceContainer = this._view!.findChildByName('totalprice_container') as unknown as IItemListWindow | null;

        if(totalPriceContainer)
        {
            totalPriceContainer.arrangeListItems();
        }
    }
}
