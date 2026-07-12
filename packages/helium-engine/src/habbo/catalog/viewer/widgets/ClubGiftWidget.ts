import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IProduct} from '../IProduct';
import {Offer} from '../Offer';
import {Product} from '../Product';
import type {ClubGiftController} from '../../club/ClubGiftController';
import type {ClubGiftEligibilityData} from '@habbo/communication/messages/parser/catalog/ClubGiftEligibilityData';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const DAYS_IN_MONTH = 31;

/**
 * "Gift Habbo Club to a friend" widget - lists redeemable offers and confirms a selection via
 * ClubGiftController.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ClubGiftWidget.as
 */
export class ClubGiftWidget extends CatalogWidget implements IGetImageListener
{
    private _controller: ClubGiftController | null;

    private _offers: Map<number, IPurchasableOffer> = new Map();

    private _preview: IWindowContainer | null = null;

    private _catalog: HabboCatalog | null;

    // AS3: no direct equivalent - AS3's showPreview() passes a null listener and reads
    // ImageResult.data synchronously; this port never trusts that (see ImageResult.ts), so the
    // preview image is delivered async via imageReady() instead, tracked by the pending request id.
    private _pendingPreviewId: number = -1;

    private _previewTargetRectangle: {x: number; y: number; width: number; height: number} | null = null;

    constructor(window: IWindowContainer, controller: ClubGiftController, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
        this._controller = controller;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        super.dispose();

        this._controller = null;
        this._catalog = null;
        this._pendingPreviewId = -1;
        this._previewTargetRectangle = null;
        this._preview?.dispose();
        this._preview = null;
    }

    override init(): boolean
    {
        if(!this.window) return false;

        if(!super.init()) return false;

        if(this._controller) this._controller.widget = this;

        this.attachWidgetView(CatalogWidgetName.CLUB_GIFT);

        this.setCaption('info_text', '');
        this.setCaption('past_club_days', '');
        this.setCaption('past_vip_days', '');

        this.update();

        return true;
    }

    update(): void
    {
        this.updateInfo();
        this.updateList();
    }

    private setCaption(name: string, value: string): void
    {
        const element = this.window.findChildByName(name);

        if(element) element.caption = value;
    }

    private updateInfo(): void
    {
        if(!this._controller || !this.window) return;

        const infoText = this.window.findChildByName('info_text');

        if(!infoText) return;

        const localization = this._controller.localization;
        let key: string;

        if(this._controller.giftsAvailable > 0)
        {
            key = 'catalog.club_gift.available';
            localization?.registerParameter(key, 'amount', this._controller.giftsAvailable.toString());
        }
        else if(this._controller.daysUntilNextGift > 0)
        {
            key = 'catalog.club_gift.days_until_next';
            localization?.registerParameter(key, 'days', this._controller.daysUntilNextGift.toString());
        }
        else if(this._controller.hasClub)
        {
            key = 'catalog.club_gift.not_available';
        }
        else
        {
            key = 'catalog.club_gift.no_club';
        }

        infoText.caption = localization?.getLocalization(key) ?? '';

        const purse = this._controller.purse;

        if(!purse) return;

        const pastClubDays = this.window.findChildByName('past_club_days');

        if(pastClubDays)
        {
            const total = purse.pastClubDays + purse.pastVipDays;
            const totalKey = total >= DAYS_IN_MONTH ? 'catalog.club_gift.past_club.long' : 'catalog.club_gift.past_club';

            localization?.registerParameter(totalKey, 'days', (total % DAYS_IN_MONTH).toString());
            localization?.registerParameter(totalKey, 'months', Math.trunc(total / DAYS_IN_MONTH).toString());
            pastClubDays.caption = localization?.getLocalization(totalKey) ?? '';
        }

        const pastVipDays = this.window.findChildByName('past_vip_days');

        if(pastVipDays)
        {
            const vipKey = purse.pastVipDays >= DAYS_IN_MONTH ? 'catalog.club_gift.past_vip.long' : 'catalog.club_gift.past_vip';

            localization?.registerParameter(vipKey, 'days', (purse.pastVipDays % DAYS_IN_MONTH).toString());
            localization?.registerParameter(vipKey, 'months', Math.trunc(purse.pastVipDays / DAYS_IN_MONTH).toString());
            pastVipDays.caption = localization?.getLocalization(vipKey) ?? '';
        }
    }

    private updateList(): void
    {
        if(!this._controller || !this.window || !this.page) return;

        for(const offer of this._offers.values())
        {
            offer.dispose();
        }

        this._offers = new Map();

        const offers = this._controller.getOffers();

        if(!offers) return;

        const giftData = this._controller.getGiftData();

        if(!giftData) return;

        const giftList = this.window.findChildByName('gift_list') as unknown as IItemListWindow | null;

        if(!giftList) return;

        giftList.destroyListItems();

        for(const offerData of offers)
        {
            const products: IProduct[] = [];
            const productData = this._controller.catalog?.getProductData(offerData.localizationId) ?? null;

            for(const productEntry of offerData.products)
            {
                const furnitureData = this._controller.catalog?.getFurnitureData(productEntry.furniClassId, productEntry.productType) ?? null;

                products.push(new Product(productEntry.productType, productEntry.furniClassId, productEntry.extraParam, productEntry.productCount, productData, furnitureData, this._catalog!));
            }

            const offer = new Offer(
                offerData.offerId, offerData.localizationId, offerData.isRent, offerData.priceInCredits,
                offerData.priceInActivityPoints, offerData.activityPointType, offerData.priceInSilver,
                offerData.giftable, offerData.clubLevel, products, offerData.bundlePurchaseAllowed, this._catalog!
            );

            offer.page = this.page;

            const eligibility = giftData.get(offer.offerId) ?? null;
            const listItem = this.createListItem(offer, eligibility);

            if(listItem)
            {
                giftList.addListItem(listItem);
                this._offers.set(offer.offerId, offer);
            }
        }
    }

    private createListItem(offer: IPurchasableOffer, eligibility: ClubGiftEligibilityData | null): IWindowContainer | null
    {
        if(!offer || !offer.product || !eligibility) return null;

        const item = this._controller?.catalog?.utils.createWindow('club_gift_list_item') as unknown as IWindowContainer | null;

        if(!item) return null;

        item.procedure = this.clickHandler;

        const product = offer.product;
        const productData = product.productData;

        if(!productData) return null;

        this.setElementCaption(item, 'gift_name', productData.name);
        this.setElementCaption(item, 'gift_desc', productData.description);

        const purse = this._controller?.purse;
        const daysMissing = eligibility.isVip
            ? eligibility.daysRequired - (purse?.pastVipDays ?? 0)
            : eligibility.daysRequired - ((purse?.pastClubDays ?? 0) + (purse?.pastVipDays ?? 0));

        let monthsRequiredKey = '';

        if(!eligibility.isSelectable && daysMissing > 0)
        {
            monthsRequiredKey = eligibility.isVip ? 'catalog.club_gift.vip_missing' : 'catalog.club_gift.club_missing';

            if(daysMissing >= DAYS_IN_MONTH) monthsRequiredKey += '.long';

            this._controller?.localization?.registerParameter(monthsRequiredKey, 'days', (daysMissing % DAYS_IN_MONTH).toString());
            this._controller?.localization?.registerParameter(monthsRequiredKey, 'months', Math.trunc(daysMissing / DAYS_IN_MONTH).toString());
        }
        else if((this._controller?.giftsAvailable ?? 0) > 0)
        {
            monthsRequiredKey = 'catalog.club_gift.selectable';
        }

        this.setElementCaption(item, 'months_required', monthsRequiredKey.length > 0 ? this._controller?.localization?.getLocalization(monthsRequiredKey) ?? '' : '');

        const vipIcon = item.findChildByName('vip_icon') as unknown as IIconWindow | null;

        if(vipIcon) vipIcon.visible = eligibility.isVip;

        const selectButton = item.findChildByName('select_button');

        if(selectButton)
        {
            if(eligibility.isSelectable && (this._controller?.giftsAvailable ?? 0) > 0) selectButton.enable();
            else selectButton.disable();

            selectButton.id = offer.offerId;
        }

        const productContainer = offer.productContainer;

        if(!productContainer) return null;

        if(!this.page?.viewer?.roomEngine) return null;

        const imageContainer = item.findChildByName('image_container') as unknown as IWindowContainer | null;

        if(imageContainer)
        {
            productContainer.view = imageContainer;
            productContainer.initProductIcon(this.page.viewer.roomEngine);
            imageContainer.procedure = this.mouseOverHandler;
            imageContainer.id = offer.offerId;
        }

        return item;
    }

    private setElementCaption(container: IWindowContainer, name: string, value: string): void
    {
        const element = container.findChildByName(name);

        if(element) element.caption = value;
    }

    private clickHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window || !this._offers || !this._controller) return;

        if(event.type !== WindowMouseEvent.CLICK) return;

        if(window.name !== 'select_button') return;

        const offer = this._offers.get(window.id);

        if(!offer) return;

        this._controller.selectGift(offer);
    };

    private mouseOverHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window || !this._offers) return;

        if(window.name !== 'image_container') return;

        const offer = this._offers.get(window.id);

        if(!offer) return;

        if(event.type === WindowMouseEvent.OVER)
        {
            const rectangle = {x: 0, y: 0, width: 0, height: 0};

            window.getGlobalRectangle(rectangle);
            this.showPreview(offer, rectangle);
        }

        if(event.type === WindowMouseEvent.OUT) this.hidePreview();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ClubGiftWidget.as::showPreview()
    private showPreview(offer: IPurchasableOffer, targetRectangle: {x: number; y: number; width: number; height: number}): void
    {
        if(!offer || !offer.productContainer) return;

        const roomEngine = this.page?.viewer?.roomEngine;

        if(!this.page || !this.page.viewer || !roomEngine) return;

        const product = offer.product;

        if(!product) return;

        if(!this._preview)
        {
            this._preview = (this._catalog as HabboCatalog)?.utils.createWindow('club_gift_preview') as unknown as IWindowContainer | null;
        }

        if(!this._preview) return;

        this._previewTargetRectangle = targetRectangle;

        switch(product.productType)
        {
            case 's':
                this._pendingPreviewId = roomEngine.getFurnitureImage(product.productClassId, new Vector3d(90, 0, 0), 64, this, 0, product.extraParam).id;
                break;
            case 'i':
                this._pendingPreviewId = roomEngine.getWallItemImage(product.productClassId, new Vector3d(90, 0, 0), 64, this, 0, product.extraParam).id;
                break;
            default:
                return;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ClubGiftWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(id !== this._pendingPreviewId || !data || !this._preview || !this._previewTargetRectangle) return;

        const image = this._preview.findChildByName('image') as unknown as IBitmapWrapperWindow | null;

        if(!image) return;

        image.width = data.width;
        image.height = data.height;
        image.bitmap = data;

        const target = this._previewTargetRectangle;
        const centerX = target.x + target.width / 2;
        const centerY = target.y + target.height / 2;

        this._preview.setGlobalPosition({x: centerX - this._preview.width / 2, y: centerY - this._preview.height / 2});
        this._preview.visible = true;
        this._preview.activate();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ClubGiftWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    private hidePreview(): void
    {
        this._pendingPreviewId = -1;

        if(this._preview) this._preview.visible = false;
    }
}
