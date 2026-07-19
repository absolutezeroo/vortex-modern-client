import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {IProductDataListener} from '@habbo/session/product/IProductDataListener';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import type {BonusRareInfoMessageParser} from '@habbo/communication/messages/parser/catalog/BonusRareInfoMessageParser';
import {BonusRareInfoMessageEvent} from '@habbo/communication/messages/incoming/catalog/BonusRareInfoMessageEvent';
import {GetBonusRareInfoMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetBonusRareInfoMessageComposer';
import {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

/**
 * "Bonus rare" progress promo - shows progress toward a free rare, opens the
 * credits page on click.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as
 */
export class BonusRarePromoWidget implements ILandingViewWidget, IProductDataListener, ISettingsAwareWidget, IGetImageListener
{
    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _productType: string = '';
    private _productClassId: number = -1;
    private _totalCoinsForBonus: number = 0;
    private _coinsStillRequiredToBuy: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::BonusRarePromoWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._landingView?.roomEngine?.events.off(RoomEngineEvent.REE_ENGINE_INITIALIZED, this.onRoomEngineInitialized);
        this._landingView = null;
        this._container = null;
    }

    get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('bonus_rare_promo') as IWindowContainer | null;

        const buyButton = this._container?.findChildByName('buy_button');

        if(buyButton) buyButton.procedure = this.onOpenCreditsPageButton;

        if(this._container) this._container.visible = false;

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(new BonusRareInfoMessageEvent(this.onBonusRareInfoMessage));
        this._landingView!.roomEngine?.events.on(RoomEngineEvent.REE_ENGINE_INITIALIZED, this.onRoomEngineInitialized);

        this.requestBonusRareInfo();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::requestBonusRareInfo()
    private requestBonusRareInfo(): void
    {
        this._landingView?.send(new GetBonusRareInfoMessageComposer());
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::refresh()
    refresh(): void
    {
        this.requestBonusRareInfo();
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::productDataReady()
    productDataReady(): void
    {
        this.refreshContent();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::imageReady()
    imageReady(_id: number, _data: ImageBitmap | null): void
    {
        this.refreshContent();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::onRoomEngineInitialized()
    private onRoomEngineInitialized = (): void =>
    {
        this.refreshContent();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::refreshContent()
    private refreshContent(): void
    {
        if(this.disposed || !this._landingView || !this._container) return;

        this._container.visible = this._productClassId !== -1;

        const productData = this._landingView.getProductData(this._productType, this);

        if(productData)
        {
            const promoImage = this._container.findChildByName('promo_image') as IStaticBitmapWrapperWindow | null;

            if(promoImage) promoImage.assetUri = this._landingView.getProperty('landing.view.bonus.rare.image.uri');

            const header = this._container.findChildByName('header');

            if(header)
            {
                header.caption = this._landingView.localization?.getLocalizationWithParams(
                    'landing.view.bonus.rare.header', '', 'rarename', productData.name, 'amount', String(this._totalCoinsForBonus)
                ) ?? '';
            }

            const status = this._container.findChildByName('status');

            if(status)
            {
                status.caption = this._landingView.localization?.getLocalizationWithParams(
                    'landing.view.bonus.rare.status', '', 'amount', String(this._coinsStillRequiredToBuy), 'total', String(this._totalCoinsForBonus)
                ) ?? '';
            }

            this.setProgress(this._totalCoinsForBonus - this._coinsStillRequiredToBuy, this._totalCoinsForBonus);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::onBonusRareInfoMessage()
    private onBonusRareInfoMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as BonusRareInfoMessageParser | null;

        if(!parser) return;

        this._productType = parser.productType;
        this._productClassId = parser.productClassId;
        this._totalCoinsForBonus = parser.totalCoinsForBonus;
        this._coinsStillRequiredToBuy = parser.coinsStillRequiredToBuy;
        this.refreshContent();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::onOpenCreditsPageButton()
    private onOpenCreditsPageButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.tracking?.trackGoogle('landingView', 'click_bonusRarePromoOpenCreditsPage');
        this._landingView?.catalog?.openCreditsHabblet();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/BonusRarePromoWidget.as::setProgress()
    private setProgress(current: number, total: number): void
    {
        const barBackground = this._container?.findChildByName('bar_a_bkg');

        if(!barBackground) return;

        const width = barBackground.width;
        const x = barBackground.x;
        const progressWidth = (current / total) * width;

        const barFill = this._container?.findChildByName('bar_a_c');
        const barEnd = this._container?.findChildByName('bar_a_r');

        if(barFill) barFill.width = progressWidth;
        if(barEnd) barEnd.x = progressWidth + x;
    }
}
