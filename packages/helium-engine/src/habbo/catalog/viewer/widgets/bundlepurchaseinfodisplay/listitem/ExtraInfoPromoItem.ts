import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {HabboCatalog} from '../../../../HabboCatalog';
import {HabboCatalogUtils} from '../../../../HabboCatalogUtils';
import type {BundlePurchaseExtraInfoWidget} from '../../BundlePurchaseExtraInfoWidget';
import {CatalogWidgetBundleDisplayExtraInfoEvent} from '../../events/CatalogWidgetBundleDisplayExtraInfoEvent';
import type {ExtraInfoItemData} from '../ExtraInfoItemData';
import {UpdateableExtraInfoListItem} from '../UpdateableExtraInfoListItem';

const DISCOUNT_PROMO_KEY = 'catalog.bundlewidget.discount.promo';

/**
 * Promo row nudging the buyer toward the next bundle-discount quantity threshold; pulses a
 * highlight effect whenever the target threshold changes.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoPromoItem.as
 */
export class ExtraInfoPromoItem extends UpdateableExtraInfoListItem
{
    private _window: IWindowContainer | null = null;

    private _needsRender: boolean = true;

    private _catalog: HabboCatalog;

    private _nextDiscountMap: Map<number, number> = new Map();

    private _nextDiscountLevel: number = 0;

    private _widget: BundlePurchaseExtraInfoWidget;

    private _effectAlpha: number = 0;

    private _effectTimer: ReturnType<typeof setInterval> | null = null;

    constructor(widget: BundlePurchaseExtraInfoWidget, id: number, data: ExtraInfoItemData, catalog: HabboCatalog)
    {
        super(null, id, data, 0);

        this._widget = widget;
        this._catalog = catalog;

        this.createNextDiscountMap();
        this.resolveNextDiscountLevel();

        this._effectTimer = setInterval(() => this.onEffectTimer(), 50);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._effectTimer != null)
        {
            clearInterval(this._effectTimer);
            this._effectTimer = null;
        }

        this._nextDiscountMap = new Map();
        this._catalog = null!;

        super.dispose();
    }

    override update(data: ExtraInfoItemData): void
    {
        super.update(data);

        const previousLevel = this._nextDiscountLevel;

        this.resolveNextDiscountLevel();

        if(this._nextDiscountLevel !== previousLevel)
        {
            this._effectAlpha = 1;
        }

        this._needsRender = true;
        this.render();
    }

    override getRenderedWindow(): IWindowContainer | null
    {
        if(this._window == null)
        {
            this.createWindow();
        }

        if(this._needsRender)
        {
            this.render();
        }

        return this._window;
    }

    private createWindow(): void
    {
        this._window = this._catalog.utils.createWindow('discountPromoItem') as unknown as IWindowContainer;
        this._window.procedure = this.windowProcedure;

        const iconBitmap = this._window.findChildByName('icon_bitmap') as unknown as IBitmapWrapperWindow;
        const source = (this._catalog.assets?.getAssetByName('thumb_up')?.content ?? null) as ImageBitmap | null;

        if(source) HabboCatalogUtils.replaceCenteredImage(iconBitmap, source);
    }

    private render(): void
    {
        const localization = this._catalog.localization;

        localization?.registerParameter(DISCOUNT_PROMO_KEY, 'quantity', this._nextDiscountLevel.toString());
        localization?.registerParameter(DISCOUNT_PROMO_KEY, 'discount', (this._nextDiscountMap.get(this._nextDiscountLevel) ?? 0).toString());

        const text = localization?.getLocalizationRaw(DISCOUNT_PROMO_KEY)?.value ?? '';

        this._window!.findChildByName('promo_text')!.caption = text;
        this._window!.findChildByName('promo_text_effect')!.caption = text;

        this._needsRender = false;
    }

    private resolveNextDiscountLevel(): void
    {
        for(const level of this._nextDiscountMap.keys())
        {
            if(level > this.data.quantity)
            {
                this._nextDiscountLevel = level;

                break;
            }
        }
    }

    private createNextDiscountMap(): void
    {
        this._nextDiscountMap = new Map();

        let highestSaved = 0;

        for(let quantity = 1; quantity <= 100; quantity++)
        {
            const discountedTotal = this._catalog.utils.calculateBundlePrice(true, 1, quantity);
            const saved = quantity - discountedTotal;

            if(saved > highestSaved && this._catalog.utils.bundleDiscountFlatPriceSteps.indexOf(quantity) === -1)
            {
                this._nextDiscountMap.set(quantity, saved);
                highestSaved = saved;
            }
        }
    }

    private onEffectTimer(): void
    {
        if(this._effectAlpha > 0)
        {
            this._effectAlpha -= 0.1;

            if(this._effectAlpha < 0) this._effectAlpha = 0;

            this._window!.findChildByName('promo_text_effect')!.blend = this._effectAlpha;
        }
    }

    private windowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(window.name !== 'click_region') return;

        switch(event.type)
        {
            case WindowMouseEvent.CLICK:
                this._widget.events.emit(
                    CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED,
                    new CatalogWidgetBundleDisplayExtraInfoEvent(CatalogWidgetBundleDisplayExtraInfoEvent.ITEM_CLICKED, this.data, this.id)
                );

                break;
            case WindowMouseEvent.OVER:
                (this._window!.findChildByName('promo_text') as unknown as ITextWindow).textColor = 12582911;

                break;
            case WindowMouseEvent.OUT:
                (this._window!.findChildByName('promo_text') as unknown as ITextWindow).textColor = 16777215;

                break;
        }
    };
}
