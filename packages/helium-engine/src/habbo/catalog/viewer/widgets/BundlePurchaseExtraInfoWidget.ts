import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboCatalog} from '../../HabboCatalog';
import {ExtraInfoItemData} from './bundlepurchaseinfodisplay/ExtraInfoItemData';
import {ExtraInfoViewManager} from './bundlepurchaseinfodisplay/ExtraInfoViewManager';
import type {UpdateableExtraInfoListItem} from './bundlepurchaseinfodisplay/UpdateableExtraInfoListItem';
import {CatalogWidgetBundleDisplayExtraInfoEvent} from './events/CatalogWidgetBundleDisplayExtraInfoEvent';
import {CatalogWidgetSpinnerEvent} from './events/CatalogWidgetSpinnerEvent';
import {CatalogWidget} from './CatalogWidget';

const PROMO_ITEM_DROP_DELAY_MS = 4000;

/**
 * Shows the promo/discount/bundle-info overlay rows above the purchase spinner for
 * multi-purchase-enabled catalog offers.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/BundlePurchaseExtraInfoWidget.as
 */
export class BundlePurchaseExtraInfoWidget extends CatalogWidget
{
    private _catalog: HabboCatalog | null;

    private _viewManager: ExtraInfoViewManager | null = null;

    private _quantity: number = 1;

    private _priceCredits: number = 0;

    private _priceActivityPoints: number = 0;

    private _activityPointType: number = 0;

    private _itemBadgeCode: string | null = null;

    private _promoItemId: number = -1;

    private _discountValueItemId: number = -1;

    private _bundleInfoItemId: number = -1;

    private _promoItemHiddenByFlatPriceStep: boolean = false;

    private _promoItemDropTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._viewManager?.dispose();
        this._viewManager = null;
        this._catalog = null;

        if(this._promoItemDropTimer != null)
        {
            clearTimeout(this._promoItemDropTimer);
            this._promoItemDropTimer = null;
        }

        this.events.off(CatalogWidgetBundleDisplayExtraInfoEvent.RESET, this.onResetEvent);
        this.events.off(CatalogWidgetBundleDisplayExtraInfoEvent.HIDE, this.onHideEvent);
        this.events.off(CatalogWidgetSpinnerEvent.VALUE_CHANGED, this.onSpinnerEvent);
        this.events.off(CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED, this.onExtraInfoItemClickedEvent);

        super.dispose();
    }

    override init(): boolean
    {
        if(this.page.isBuilderPage)
        {
            this.window.visible = false;

            return true;
        }

        if(!this._catalog!.multiplePurchaseEnabled)
        {
            return true;
        }

        this._viewManager = new ExtraInfoViewManager(this, this._catalog!);

        this.events.on(CatalogWidgetBundleDisplayExtraInfoEvent.RESET, this.onResetEvent);
        this.events.on(CatalogWidgetBundleDisplayExtraInfoEvent.HIDE, this.onHideEvent);
        this.events.on(CatalogWidgetSpinnerEvent.VALUE_CHANGED, this.onSpinnerEvent);
        this.events.on(CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED, this.onExtraInfoItemClickedEvent);

        return true;
    }

    private createPromoItem(): void
    {
        const data = new ExtraInfoItemData(ExtraInfoItemData.TYPE_PROMO);

        data.quantity = this._quantity;
        this._promoItemId = this._viewManager!.addItem(data);
    }

    private updatePromoItem(quantity: number): void
    {
        if(this._promoItemId === -1) return;

        const item = this._viewManager!.getItem(this._promoItemId) as UpdateableExtraInfoListItem;
        const data = item.data;

        data.quantity = quantity;
        item.update(data);
    }

    private removePromoItem(): void
    {
        if(this._promoItemId === -1) return;

        this._viewManager!.removeItem(this._promoItemId);
        this._promoItemId = -1;
    }

    private createDiscountValueItem(): void
    {
        const data = new ExtraInfoItemData(ExtraInfoItemData.TYPE_DISCOUNT_VALUE);

        data.quantity = this._quantity;
        data.priceActivityPoints = this._priceActivityPoints;
        data.activityPointType = this._activityPointType;
        data.priceCredits = this._priceCredits;
        this._discountValueItemId = this._viewManager!.addItem(data);

        this._catalog!.utils.discountShownEventTrack();
    }

    private updateDiscountValueItem(quantity: number): void
    {
        if(this._discountValueItemId === -1) return;

        const item = this._viewManager!.getItem(this._discountValueItemId) as UpdateableExtraInfoListItem;
        const data = item.data;

        data.quantity = quantity;
        data.discountPriceCredits = this._catalog!.utils.calculateBundlePrice(true, this._priceCredits, quantity);
        data.discountPriceActivityPoints = this._catalog!.utils.calculateBundlePrice(true, this._priceActivityPoints, quantity);
        item.update(data);
    }

    private removeDiscountValueItem(): void
    {
        if(this._discountValueItemId === -1) return;

        this._viewManager!.removeItem(this._discountValueItemId);
        this._discountValueItemId = -1;
    }

    private createBundleInfoItem(): void
    {
        const data = new ExtraInfoItemData(ExtraInfoItemData.TYPE_BUNDLES_INFO_SCREEN);

        this._bundleInfoItemId = this._viewManager!.addItem(data);
        this._catalog!.utils.bundlesInfoShownEventTrack();
    }

    private removeBundleInfoItem(): void
    {
        if(this._bundleInfoItemId === -1) return;

        this._viewManager!.removeItem(this._bundleInfoItemId);
        this._bundleInfoItemId = -1;
    }

    private onResetEvent = (event: CatalogWidgetBundleDisplayExtraInfoEvent): void =>
    {
        if(this.disposed) return;

        this.window.visible = true;

        const data = event.data!;

        this._priceCredits = data.priceCredits;
        this._priceActivityPoints = data.priceActivityPoints;
        this._activityPointType = data.activityPointType;
        this._itemBadgeCode = data.badgeCode;

        this._viewManager!.clear();
        this._discountValueItemId = -1;
        this._promoItemId = -1;

        if(this._promoItemDropTimer != null) clearTimeout(this._promoItemDropTimer);

        this._promoItemDropTimer = setTimeout(() => this.onPromoItemDropDownTimerEvent(), PROMO_ITEM_DROP_DELAY_MS);
    };

    private onSpinnerEvent = (event: CatalogWidgetSpinnerEvent): void =>
    {
        if(this.disposed) return;

        const catalog = this._catalog!;

        if(!catalog.bundleDiscountEnabled) return;

        if(event.type !== CatalogWidgetSpinnerEvent.VALUE_CHANGED) return;

        if(event.value === this._quantity) return;

        // TODO(AS3): sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/BundlePurchaseExtraInfoWidget.as::onSpinnerEvent()
        // catalog.bundleDiscountRuleset is a documented always-null stub on this port (the config
        // message that populates it isn't parsed yet - see HabboCatalog.ts's own note), so the
        // real AS3 condition (`event.value >= bundleDiscountRuleset.bundleSize`) would throw here;
        // null-guarded instead of literally ported, matching the same cast/guard convention
        // ProductViewCatalogWidget.ts::setSpinnerToBundleRuleset() already uses for this same stub.
        const ruleset = catalog.bundleDiscountRuleset as { bundleSize: number } | null;

        if(ruleset != null)
        {
            if(event.value >= ruleset.bundleSize && this._discountValueItemId === -1)
            {
                this.createDiscountValueItem();
            }
            else if(event.value < ruleset.bundleSize)
            {
                this.removeDiscountValueItem();
            }
        }

        this.updatePromoItem(event.value);
        this.updateDiscountValueItem(event.value);
        this._quantity = event.value;
        this.removeBundleInfoItem();

        if(this._quantity >= catalog.utils.bundleDiscountHighestFlatPriceStep)
        {
            this.removePromoItem();
            this._promoItemHiddenByFlatPriceStep = true;
        }
        else if(this._promoItemHiddenByFlatPriceStep)
        {
            this.createPromoItem();
            this._promoItemHiddenByFlatPriceStep = false;
        }

        catalog.utils.spinnerValueChangedEventTrack();
    };

    private onHideEvent = (_event: CatalogWidgetBundleDisplayExtraInfoEvent): void =>
    {
        this.window.visible = false;
    };

    private onExtraInfoItemClickedEvent = (event: CatalogWidgetBundleDisplayExtraInfoEvent): void =>
    {
        if(event.id === this._promoItemId)
        {
            if(this._bundleInfoItemId === -1) this.createBundleInfoItem();
        }
        else if(event.id === this._bundleInfoItemId)
        {
            this.removeBundleInfoItem();
        }
    };

    private onPromoItemDropDownTimerEvent(): void
    {
        this.createPromoItem();
    }
}
