import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILandingViewWidget} from '../interfaces/ILandingViewWidget';
import type {ISettingsAwareWidget} from '../interfaces/ISettingsAwareWidget';
import type {HabboLandingView} from '../HabboLandingView';
import type {IProductDataListener} from '@habbo/session/product/IProductDataListener';
import type {CommonWidgetSettings} from '../layout/CommonWidgetSettings';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';
import type {LimitedOfferAppearingNextMessageEventParser} from '@habbo/communication/messages/parser/catalog/LimitedOfferAppearingNextMessageEventParser';
import {LimitedOfferAppearingNextMessageEvent} from '@habbo/communication/messages/incoming/catalog/LimitedOfferAppearingNextMessageEvent';
import {GetLimitedOfferAppearingNextComposer} from '@habbo/communication/messages/outgoing/catalog/GetLimitedOfferAppearingNextComposer';
import {WidgetContainerLayout} from '../layout/WidgetContainerLayout';

/**
 * Countdown to the next limited-edition rare's availability in the catalog.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as
 */
export class NextLimitedRareCountdownWidget implements ILandingViewWidget, IProductDataListener, ISettingsAwareWidget
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::REFRESH_PERIOD_IN_MILLIS
    private static readonly REFRESH_PERIOD_IN_MILLIS: number = 30000;

    private _landingView: HabboLandingView | null;
    private _container: IWindowContainer | null = null;
    private _appearsInSeconds: number = 0;
    private _pageId: number = -1;
    private _offerId: number = -1;
    private _productType: string = '';
    private _lastRequestTime: number | null = null;
    private _modeSwitchTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::NextLimitedRareCountdownWidget()
    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        if(this._modeSwitchTimer !== null)
        {
            clearTimeout(this._modeSwitchTimer);
            this._modeSwitchTimer = null;
        }

        this._landingView = null;
        this._container = null;
    }

    get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::initialize()
    initialize(): void
    {
        this._container = this._landingView!.getXmlWindow('next_ltd_available') as IWindowContainer | null;

        const getButton = this._container?.findChildByName('get');
        const catalogueButton = this._container?.findChildByName('catalogue_button');

        if(getButton) getButton.procedure = this.onOpenCatalogButton;
        if(catalogueButton) catalogueButton.procedure = this.onOpenCatalogButton;

        if(this._container) this._container.visible = false;

        this._landingView!.communicationManager?.addHabboConnectionMessageEvent(
            new LimitedOfferAppearingNextMessageEvent(this.onLimitedOfferAppearingNextMessage)
        );

        this.requestLimitedOfferAppearingNextMessage();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::requestLimitedOfferAppearingNextMessage()
    private requestLimitedOfferAppearingNextMessage(): void
    {
        if(!this._landingView?.getBoolean('next.limited.rare.countdown.widget.disabled'))
        {
            this._landingView?.send(new GetLimitedOfferAppearingNextComposer());
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::refresh()
    refresh(): void
    {
        const now = Date.now();

        if(this._lastRequestTime === null || this._lastRequestTime + NextLimitedRareCountdownWidget.REFRESH_PERIOD_IN_MILLIS < now)
        {
            this.requestLimitedOfferAppearingNextMessage();
            this._lastRequestTime = now;
        }
    }

    get container(): IWindow | null
    {
        return this._container;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::productDataReady()
    productDataReady(): void
    {
        this.refreshContent();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::refreshContent()
    private refreshContent(): void
    {
        if(this.disposed || !this._landingView || !this._container) return;

        const getButton = this._container.findChildByName('get');
        const countdown = this._container.findChildByName('countdown');
        const productData = this._landingView.getProductData(this._productType, this);

        if(productData && getButton)
        {
            getButton.caption = productData.name;
        }

        if(this._pageId >= 0)
        {
            this._container.visible = true;
            if(getButton) getButton.visible = true;
            if(countdown) countdown.visible = false;
        }
        else if(this._appearsInSeconds > 0)
        {
            this._container.visible = true;
            if(getButton) getButton.visible = false;
            if(countdown) countdown.visible = true;
        }
        else
        {
            this._container.visible = false;
        }

        this.refreshTimer();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::refreshTimer()
    private refreshTimer(): void
    {
        const countdown = this._container?.findChildByName('countdown') as IWidgetWindow | null;
        const widget = (countdown?.widget ?? null) as CountdownWidget | null;

        if(!widget) return;

        widget.seconds = this._appearsInSeconds;
        widget.running = true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::setModeSwitchTimer()
    private setModeSwitchTimer(seconds: number): void
    {
        if(seconds <= 0) return;

        if(this._modeSwitchTimer !== null)
        {
            clearTimeout(this._modeSwitchTimer);
            this._modeSwitchTimer = null;
        }

        this._modeSwitchTimer = setTimeout(() => this.requestLimitedOfferAppearingNextMessage(), (seconds + 1) * 1000);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::onLimitedOfferAppearingNextMessage()
    private onLimitedOfferAppearingNextMessage = (event: IMessageEvent): void =>
    {
        const parser = event.parser as LimitedOfferAppearingNextMessageEventParser | null;

        if(!parser) return;

        this._appearsInSeconds = parser.appearsInSeconds;
        this._pageId = parser.pageId;
        this._offerId = parser.offerId;
        this._productType = parser.productType;
        this.refreshContent();
        this.setModeSwitchTimer(this._appearsInSeconds);
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::onOpenCatalogButton()
    private onOpenCatalogButton = (event: WindowEvent): void =>
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        this._landingView?.catalog?.openCatalogPageById(this._pageId, this._offerId, 'NORMAL');
        this._landingView?.tracking?.trackGoogle('landingView', 'click_goToNextLimitedCatalogPage');
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/widget/NextLimitedRareCountdownWidget.as::set settings()
    set settings(value: CommonWidgetSettings)
    {
        if(this._container) WidgetContainerLayout.applyCommonWidgetSettings(this._container, value);
    }
}
