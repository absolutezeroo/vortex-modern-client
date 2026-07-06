import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {HabboCatalog} from './HabboCatalog';
import type {IPurchasableOffer} from './IPurchasableOffer';
import {ActivityPointTypeEnum} from './purse/ActivityPointTypeEnum';

// AS3: sources/win63_version/habbo/catalog/HabboCatalogUtils.as::BADGE_CHATSTYLE_WIDGET_NAME
const BADGE_CHATSTYLE_WIDGET_NAME = 'HCU_dynamic_badge';

interface IPriceEntry
{
    amount: number;
    unit: number;
}

/**
 * Shared catalog view helpers: price display, product icon assignment, bundle pricing math.
 *
 * @see sources/win63_version/habbo/catalog/HabboCatalogUtils.as
 */
export class HabboCatalogUtils implements IGetImageListener
{
    private _disposed: boolean = false;

    private _catalog: HabboCatalog | null;

    private _productBitmapWrappers: Map<number, IBitmapWrapperWindow[]> = new Map();

    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalogUtils.as::_bundleDiscountFlatPriceSteps
    // Populated from a config message this port doesn't parse yet; empty means no flat-price
    // discount steps apply, matching AS3's own default before that message arrives.
    private _bundleDiscountFlatPriceSteps: number[] = [];

    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
    }

    static buildersClub(layoutCode: string): boolean
    {
        return layoutCode.indexOf('builders_club') === 0 || layoutCode.indexOf('loyalty_bc') === 0;
    }

    static replaceCenteredImage(target: IBitmapWrapperWindow, source: ImageBitmap, rect: {width: number; height: number} | null = null): void
    {
        const area = rect ?? source;
        const x = Math.round((target.width - area.width) / 2);
        const y = Math.round((target.height - area.height) / 2);

        // TS deviation: AS3 composites `source` into `target.bitmap`'s existing BitmapData at an
        // offset via copyPixels(); ImageBitmap is immutable in the browser, so this port instead
        // assigns the source directly - the wrapper's own fitSize()/centering (see
        // BitmapWrapperController) already reproduces the visual centering AS3 achieves manually.
        void x;
        void y;
        target.bitmap = source;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._catalog = null;
        this._productBitmapWrappers = new Map();
        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3 loads this via assets.getAssetByName(name).content + buildFromXML(name, layer, vars);
    // this port pre-compiles window layouts into a named registry instead (see
    // IHabboWindowManager buildWidgetLayout() doc). TODO(AS3): buildWidgetLayout() has no `vars`
    // template-substitution parameter - not needed by any current caller (all pass vars=null).
    createWindow(name: string, layer: number = 1, _vars: Map<string, string> | null = null): IWindow | null
    {
        if(this._catalog!.windowManager == null) return null;

        const window = this._catalog!.windowManager.buildWidgetLayout(name, layer);
        const container = window as unknown as IWindowContainer;

        if(container != null && container.groupChildrenWithTag)
        {
            const bitmaps: IWindow[] = [];

            container.groupChildrenWithTag('bitmap', bitmaps, -1);

            for(const child of bitmaps)
            {
                const bitmapWrapper = child as unknown as IBitmapWrapperWindow;

                if(bitmapWrapper)
                {
                    bitmapWrapper.disposesBitmap = false;
                    this.setCatalogItemImage(bitmapWrapper, bitmapWrapper.bitmapAssetName);
                }
            }
        }

        return window;
    }

    showPriceInContainer(container: IWindowContainer, offer: IPurchasableOffer, amount: number = 1, showBig: boolean = false, combo: boolean = false): void
    {
        if(offer == null) return;

        const prices = this.getPriceArray(offer, amount, showBig);

        this.renderPriceInContainer(container, prices, showBig, combo);
    }

    private renderPriceInContainer(container: IWindowContainer, prices: IPriceEntry[], showBig: boolean, combo: boolean): void
    {
        const list = this.createPriceContainer(container);

        if(list == null) return;

        let i = 0;

        for(; i < prices.length; i++)
        {
            this.renderPriceItem(list, i, prices[i], showBig, combo);
        }

        const keep = i * 2;

        while(list.numListItems > keep)
        {
            list.removeListItemAt(keep);
        }

        container.addChild(list as unknown as IWindow);
    }

    private renderPriceItem(list: IItemListWindow, index: number, price: IPriceEntry, showBig: boolean, combo: boolean): void
    {
        const amountText = list.getListItemByName('amount_' + index) as unknown as ITextWindow;
        const unit = list.getListItemByName('unit_' + index)!;

        amountText.text = (index > 0 ? '+ ' : '') + price.amount;
        unit.style = ActivityPointTypeEnum.getIconStyleFor(price.unit, this.configuration(), showBig, combo);
        unit.width = (showBig && combo) ? 53 : 22;
    }

    private createPriceContainer(container: IWindowContainer): IItemListWindow | null
    {
        if(container == null) return null;

        const list = this.createWindow('price_display') as unknown as IItemListWindow | null;

        if(list == null) return null;

        while(container.numChildren > 0)
        {
            container.removeChildAt(0)!.dispose();
        }

        return list;
    }

    private getPriceArray(offer: IPurchasableOffer, amount: number, showSeasonalAsCredits: boolean): IPriceEntry[]
    {
        const prices: IPriceEntry[] = [];

        if(offer.priceInCredits > 0)
        {
            const value = this.calculateBundlePrice(offer.bundlePurchaseAllowed, offer.priceInCredits, amount);
            const unit = showSeasonalAsCredits ? this._catalog!.getSeasonalCurrencyActivityPointType() : -1;

            prices.push({amount: value, unit});
        }

        if(offer.priceInActivityPoints > 0)
        {
            const value = this.calculateBundlePrice(offer.bundlePurchaseAllowed, offer.priceInActivityPoints, amount);

            prices.push({amount: value, unit: offer.activityPointType});
        }

        if(offer.priceInSilver > 0)
        {
            prices.push({amount: offer.priceInSilver, unit: ActivityPointTypeEnum.SILVER});
        }

        if(offer.priceInEmerald > 0)
        {
            prices.push({amount: offer.priceInEmerald, unit: ActivityPointTypeEnum.EMERALD});
        }

        if(prices.length === 0)
        {
            prices.push({amount: 0, unit: -1});
        }

        return prices;
    }

    getPriceMap(offer: IPurchasableOffer, amount: number): Map<string, {amount: number; activityPointType?: number}>
    {
        const prices = new Map<string, {amount: number; activityPointType?: number}>();

        if(offer.priceInCredits > 0)
        {
            const value = this.calculateBundlePrice(offer.bundlePurchaseAllowed, offer.priceInCredits, amount);

            prices.set('credit', {amount: value});
        }

        if(offer.priceInActivityPoints > 0)
        {
            const value = this.calculateBundlePrice(offer.bundlePurchaseAllowed, offer.priceInActivityPoints, amount);

            prices.set('activityPoint', {amount: value, activityPointType: offer.activityPointType});
        }

        if(offer.priceInSilver > 0)
        {
            prices.set('silver', {amount: offer.priceInSilver});
        }

        if(prices.size === 0)
        {
            prices.set('credit', {amount: 0});
        }

        return prices;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalogUtils.as::showPriceOnProduct()
    // win63 also positions the price box relative to a room_canvas_container/fallback target and
    // colours it per currency (credits-only/activity-points-only/silver) - preserved here; the
    // seasonal-currency colour variant (getSeasonalCurrencyPriceColor(), needs
    // ColorConverter.hexToUint() + seasonal colour config properties) is the one part of that
    // colouring not ported, see the TODO below.
    showPriceOnProduct(
        offer: IPurchasableOffer,
        container: IWindowContainer,
        existing: IWindow | null,
        fallbackTarget: IWindow | null,
        xOffset: number,
        alignTop: boolean,
        yOffset: number,
        showBig: boolean = false,
        combo: boolean = false
    ): IWindow | null
    {
        if(existing != null)
        {
            container.removeChild(existing);
            existing.dispose();
        }

        if(this._catalog!.catalogType === 'BUILDERS_CLUB') return null;

        const priceBox = this.createWindow('priceDisplayWidget')!;

        container.addChild(priceBox);

        const priceBoxContainer = container.findChildByName('price_box_new') as unknown as IWindowContainer | null;

        if(priceBoxContainer != null)
        {
            this.showPriceInContainer(priceBoxContainer, offer, 1, showBig, combo);

            let anchor = container.findChildByName('room_canvas_container');

            if(anchor == null)
            {
                anchor = fallbackTarget;
            }

            if(anchor != null)
            {
                priceBox.x = anchor.x + anchor.width + xOffset - priceBox.width;
                priceBox.y = alignTop ? anchor.y + yOffset : anchor.y + anchor.height - (priceBox.height + yOffset);
            }

            if(offer.priceInActivityPoints === 0)
            {
                priceBox.color = 14992765;
            }

            if(offer.priceInCredits === 0)
            {
                if(offer.activityPointType === 0)
                {
                    priceBox.color = 11257559;
                }
                else if(ActivityPointTypeEnum.isSeasonal(offer.activityPointType))
                {
                    // TODO(AS3): sources/win63_version/habbo/catalog/HabboCatalogUtils.as::getSeasonalCurrencyPriceColor()
                    // Needs ColorConverter.hexToUint() + seeded seasonalcurrency.*.color/preset.*.border
                    // config properties - falling back to the default price-box colour instead.
                    priceBox.color = 9032648;
                }
                else
                {
                    priceBox.color = 9032648;
                }
            }

            if(offer.priceInSilver > 0)
            {
                priceBox.color = 15790320;
            }
        }

        return priceBox;
    }

    get bundleDiscountFlatPriceSteps(): number[]
    {
        return this._bundleDiscountFlatPriceSteps;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalogUtils.as::showExtraOnProduct()
    // TODO(AS3): the chat-style branch (type 9) needs catalog.freeFlowChat.chatStyleLibrary,
    // which isn't ported - only the badge branch (type 4) is real.
    showExtraOnProduct(type: number, code: string, container: IWindowContainer, xOffset: number, yOffset: number, alignTop: boolean = true, alignLeft: boolean = true): void
    {
        let widgetWindow = container.findChildByName(BADGE_CHATSTYLE_WIDGET_NAME) as unknown as IWindowContainer | null;

        if(widgetWindow == null)
        {
            widgetWindow = this.createWindow('badgeDisplayWidget') as unknown as IWindowContainer;
            widgetWindow.name = BADGE_CHATSTYLE_WIDGET_NAME;
        }

        const assetImage = widgetWindow.findChildByName('asset_image') as unknown as IStaticBitmapWrapperWindow;
        const badgeImageHost = widgetWindow.findChildByName('badge_image') as unknown as IWidgetWindow;
        const chatStyle = widgetWindow.findChildByName('chat_style') as unknown as IBitmapWrapperWindow;

        if(type === 4)
        {
            assetImage.assetUri = 'catalogue_badge_background';
            badgeImageHost.visible = true;
            chatStyle.visible = false;
            (badgeImageHost.widget as IBadgeImageWidget).badgeId = code;
        }

        widgetWindow.width = assetImage.width;
        widgetWindow.height = assetImage.height;
        container.addChild(widgetWindow);
        widgetWindow.x = alignLeft ? xOffset : container.width - widgetWindow.width - xOffset;
        widgetWindow.y = alignTop ? yOffset : container.height - widgetWindow.height - yOffset;
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalogUtils.as::hideExtraFromProduct()
    hideExtraFromProduct(container: IWindowContainer): void
    {
        const widgetWindow = container.findChildByName(BADGE_CHATSTYLE_WIDGET_NAME);

        if(widgetWindow != null)
        {
            container.removeChild(widgetWindow);
        }
    }

    // AS3: sources/win63_version/habbo/catalog/HabboCatalogUtils.as::showAssetImageAsBadgeOnProduct()
    showAssetImageAsBadgeOnProduct(assetName: string, container: IWindowContainer, xOffset: number, yOffset: number, alignTop: boolean = true, alignLeft: boolean = true): void
    {
        let widgetWindow = container.findChildByName(BADGE_CHATSTYLE_WIDGET_NAME) as unknown as IWindowContainer | null;

        if(widgetWindow == null)
        {
            widgetWindow = this.createWindow('badgeDisplayWidget') as unknown as IWindowContainer;
            widgetWindow.name = BADGE_CHATSTYLE_WIDGET_NAME;
        }

        widgetWindow.findChildByName('chat_style')!.visible = false;
        widgetWindow.findChildByName('badge_image')!.visible = false;

        const badgeImage = widgetWindow.findChildByName('badge_image') as unknown as IStaticBitmapWrapperWindow;

        badgeImage.assetUri = assetName;
        widgetWindow.width = badgeImage.width;
        widgetWindow.height = badgeImage.height;
        container.addChild(widgetWindow);
        widgetWindow.x = alignLeft ? xOffset : container.width - widgetWindow.width - xOffset;
        widgetWindow.y = alignTop ? yOffset : container.height - widgetWindow.height - yOffset;
    }

    setCatalogItemImage(target: IBitmapWrapperWindow, assetName: string): void
    {
        if(target == null) return;

        const asset = this._catalog!.assets!.getAssetByName(assetName);

        if(asset == null) return;

        const image = asset.content as ImageBitmap;

        if(image == null) return;

        target.bitmap = image;
    }

    calculateBundlePrice(_bundlePurchaseAllowed: boolean, unitPrice: number, amount: number): number
    {
        return unitPrice * amount;
    }

    displayProductIcon(productType: string, classId: number, target: IBitmapWrapperWindow): void
    {
        if(this._catalog == null) return;

        let result = null;

        switch(productType)
        {
            case 's':
                result = this._catalog.roomEngine!.getFurnitureIcon(classId, this);
                break;
            case 'i':
                result = this._catalog.roomEngine!.getWallItemIcon(classId, this);
                break;
            case 'e':
                target.bitmap = this._catalog.getPixelEffectIcon(classId);
                break;
            case 'h':
                target.bitmap = this._catalog.getSubscriptionProductIcon(classId);
                break;
        }

        if(result != null)
        {
            target.bitmap = result.data;

            if(result.id !== 0)
            {
                let pending = this._productBitmapWrappers.get(result.id);

                if(pending == null)
                {
                    pending = [];
                    this._productBitmapWrappers.set(result.id, pending);
                }

                pending.push(target);
            }
        }
    }

    imageReady(id: number, image: ImageBitmap | null): void
    {
        const pending = this._productBitmapWrappers.get(id);

        if(pending == null) return;

        for(const target of pending)
        {
            target.bitmap = image;
        }

        this._productBitmapWrappers.delete(id);
    }

    imageFailed(_id: number): void
    {
    }

    // AS3's HabboCatalog itself doubles as a config accessor (getBoolean/getInteger/getProperty
    // from the shared Component base) - cast narrowly to the subset getIconStyleFor() actually uses.
    private configuration(): IHabboConfigurationManager
    {
        return this._catalog as unknown as IHabboConfigurationManager;
    }
}
