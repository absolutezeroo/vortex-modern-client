import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {HabboCatalog} from '../../../../HabboCatalog';
import {HabboCatalogUtils} from '../../../../HabboCatalogUtils';
import {ActivityPointTypeEnum} from '../../../../purse/ActivityPointTypeEnum';
import type {ExtraInfoItemData} from '../ExtraInfoItemData';
import {ExtraInfoListItem} from '../ExtraInfoListItem';
import {UpdateableExtraInfoListItem} from '../UpdateableExtraInfoListItem';

const STRIKETHROUGH_LEFT_MARGIN = 4;
const STRIKETHROUGH_RIGHT_MARGIN = 20;

/**
 * Shows "was X, now Y" bundle-quantity discount pricing, split into a credits and/or
 * activity-point column depending on the offer's pricing model.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoDiscountValueItem.as
 */
export class ExtraInfoDiscountValueItem extends UpdateableExtraInfoListItem
{
    private _window: IWindowContainer | null = null;

    private _needsRender: boolean = true;

    private _catalog: HabboCatalog;

    private _starFrame: number = 0;

    private _starTimer: ReturnType<typeof setInterval> | null = null;

    private _showBothColumns: boolean = false;

    private _showRightCreditsOnly: boolean = false;

    private _showActivityPointsOnly: boolean = false;

    private _iconsSet: boolean = false;

    constructor(id: number, data: ExtraInfoItemData, catalog: HabboCatalog)
    {
        super(null, id, data, ExtraInfoListItem.ALIGN_BOTTOM, true);

        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._starTimer != null)
        {
            clearInterval(this._starTimer);
            this._starTimer = null;
        }

        this._catalog = null!;

        super.dispose();
    }

    override update(data: ExtraInfoItemData): void
    {
        super.update(data);

        this._showBothColumns = false;
        this._showRightCreditsOnly = false;
        this._showActivityPointsOnly = false;

        if(data.priceCredits > 0 && data.priceActivityPoints > 0)
        {
            this._showBothColumns = true;
        }
        else if(data.priceActivityPoints > 0 && data.priceCredits === 0)
        {
            this._showActivityPointsOnly = true;
        }
        else
        {
            this._showRightCreditsOnly = true;
        }

        this._needsRender = true;
        this.render();

        if(!this._iconsSet) this.setCurrencyIcons();
    }

    override getRenderedWindow(): IWindowContainer | null
    {
        if(this._needsRender) this.render();

        return this._window;
    }

    private createWindow(): void
    {
        this._window = this._catalog.utils.createWindow('discountValueItem') as unknown as IWindowContainer;
        this.setElementBitmap('icon_bitmap', 'thumb_up');
        this.startSplashAnimation();
    }

    private render(): void
    {
        if(this._window == null) this.createWindow();

        this.updateColumns();
        this.updatePriceIndicators();
        this.updateStrikeThroughElements();

        this._needsRender = false;
    }

    private updateColumns(): void
    {
        this.setLeftColumnVisibility(!(this._showActivityPointsOnly || this._showRightCreditsOnly));
    }

    private setCurrencyIcons(): void
    {
        const configuration = this._catalog as unknown as IHabboConfigurationManager;

        if(this._showBothColumns)
        {
            this.setIconStyle('total_currency_icon_left', ActivityPointTypeEnum.getIconStyleFor(-1, configuration, false));
            this.setIconStyle('discount_currency_icon_left', ActivityPointTypeEnum.getIconStyleFor(-1, configuration, false));
        }

        if(this._showRightCreditsOnly)
        {
            this.setIconStyle('total_currency_icon_right', ActivityPointTypeEnum.getIconStyleFor(-1, configuration, false));
            this.setIconStyle('discount_currency_icon_right', ActivityPointTypeEnum.getIconStyleFor(-1, configuration, false));
        }
        else
        {
            this.setIconStyle('total_currency_icon_right', ActivityPointTypeEnum.getIconStyleFor(this.data.activityPointType, configuration, false));
            this.setIconStyle('discount_currency_icon_right', ActivityPointTypeEnum.getIconStyleFor(this.data.activityPointType, configuration, false));
        }

        this._iconsSet = true;
    }

    private updatePriceIndicators(): void
    {
        const data = this.data;

        if(this._showBothColumns)
        {
            this.setElementText('total_currency_value_left', (data.quantity * data.priceCredits).toString());
            this.setElementText('discount_currency_value_left', (data.quantity * data.priceCredits - data.discountPriceCredits).toString());
        }

        if(this._showRightCreditsOnly)
        {
            this.setElementText('total_currency_value_right', (data.quantity * data.priceCredits).toString());
            this.setElementText('discount_currency_value_right', (data.quantity * data.priceCredits - data.discountPriceCredits).toString());
        }
        else
        {
            this.setElementText('total_currency_value_right', (data.quantity * data.priceActivityPoints).toString());
            this.setElementText('discount_currency_value_right', (data.quantity * data.priceActivityPoints - data.discountPriceActivityPoints).toString());
        }
    }

    private updateStrikeThroughElements(): void
    {
        const window = this._window!;

        const totalLeft = window.findChildByName('total_currency_value_left') as unknown as ITextWindow;
        const strikeLeftX = totalLeft.x + totalLeft.width - totalLeft.textWidth;
        const strikeLeft = window.findChildByName('striketrough_total_currency_left')!;

        strikeLeft.x = strikeLeftX - STRIKETHROUGH_LEFT_MARGIN;
        strikeLeft.width = STRIKETHROUGH_LEFT_MARGIN + totalLeft.textWidth + STRIKETHROUGH_RIGHT_MARGIN;

        const totalRight = window.findChildByName('total_currency_value_right') as unknown as ITextWindow;
        const strikeRightX = totalRight.x + totalRight.width - totalRight.textWidth;
        const strikeRight = window.findChildByName('striketrough_total_currency_right')!;

        strikeRight.x = strikeRightX - STRIKETHROUGH_LEFT_MARGIN;
        strikeRight.width = STRIKETHROUGH_LEFT_MARGIN + totalRight.textWidth + STRIKETHROUGH_RIGHT_MARGIN;
    }

    private setElementText(name: string, text: string): void
    {
        this._window!.findChildByName(name)!.caption = text;
    }

    private setElementBitmap(name: string, assetName: string): void
    {
        const target = this._window!.findChildByName(name) as unknown as IBitmapWrapperWindow;
        const source = (this._catalog.assets?.getAssetByName(assetName)?.content ?? null) as ImageBitmap | null;

        if(source) HabboCatalogUtils.replaceCenteredImage(target, source);
    }

    private setIconStyle(name: string, style: number): void
    {
        (this._window!.findChildByName(name) as IWindow).style = style;
    }

    private setLeftColumnVisibility(visible: boolean): void
    {
        const elements = [
            'discount_currency_icon_left',
            'discount_currency_value_left',
            'total_currency_icon_left',
            'striketrough_total_currency_left',
            'total_currency_value_left',
        ];

        for(const name of elements)
        {
            this._window!.findChildByName(name)!.visible = visible;
        }
    }

    private startSplashAnimation(): void
    {
        const splash = this._window!.findChildByName('icon_splash_bitmap') as unknown as IBitmapWrapperWindow;

        splash.bitmap = new OffscreenCanvas(splash.width, splash.height).transferToImageBitmap();

        this.starAnimationTimerEvent();
        this._starTimer = setInterval(() => this.starAnimationTimerEvent(), 150);
    }

    private starAnimationTimerEvent(): void
    {
        if(this._window == null) return;

        const splash = this._window.findChildByName('icon_splash_bitmap') as unknown as IBitmapWrapperWindow;
        const asset = this._catalog.assets?.getAssetByName(`bundle_discount_star_${this._starFrame}`) ?? null;

        if(asset)
        {
            const rect = (asset as unknown as BitmapDataAsset).rectangle;

            HabboCatalogUtils.replaceCenteredImage(splash, asset.content as ImageBitmap, rect);
        }

        this._starFrame++;

        if(this._starFrame > 7) this._starFrame = 0;
    }
}
